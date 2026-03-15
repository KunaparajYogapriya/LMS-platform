import pool from '../../config/db.js';

export const getSubjects = async (req, res, next) => {
  try {
    const [subjects] = await pool.query('SELECT * FROM subjects WHERE is_published = TRUE ORDER BY id DESC');
    res.json(subjects);
  } catch (error) {
    next(error);
  }
};

export const getSubject = async (req, res, next) => {
  try {
    const [subjects] = await pool.query('SELECT * FROM subjects WHERE id = ? AND is_published = TRUE', [req.params.subjectId]);
    if (subjects.length === 0) return res.status(404).json({ message: 'Subject not found' });
    res.json(subjects[0]);
  } catch (error) {
    next(error);
  }
};

export const getSubjectTree = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const userId = req.user.id;

    const [sections] = await pool.query(
      'SELECT * FROM sections WHERE subject_id = ? ORDER BY order_index ASC',
      [subjectId]
    );

    const sectionIds = sections.map((s) => s.id);
    if (sectionIds.length === 0) {
      return res.json({ sections: [] });
    }

    const [videos] = await pool.query(
      `SELECT * FROM videos WHERE section_id IN (?) ORDER BY section_id, order_index ASC`,
      [sectionIds]
    );

    const [progressList] = await pool.query(
      'SELECT * FROM video_progress WHERE user_id = ?',
      [userId]
    );
    const progressMap = {};
    progressList.forEach((p) => {
      progressMap[p.video_id] = p;
    });

    const orderedVideos = [];
    sections.forEach((sec) => {
      const secVideos = videos.filter((v) => v.section_id === sec.id).sort((a, b) => a.order_index - b.order_index);
      orderedVideos.push(...secVideos);
    });

    let prevCompleted = true;
    const videoDetails = orderedVideos.map((vid, index) => {
      const isCompleted = Boolean(progressMap[vid.id]?.is_completed);
      
      const isLocked = index === 0 ? false : !prevCompleted;
      
      prevCompleted = isCompleted;
      
      return {
        ...vid,
        is_completed: isCompleted,
        locked: isLocked,
      };
    });

    const sectionsWithVideos = sections.map((sec) => {
      return {
        ...sec,
        videos: videoDetails.filter((v) => v.section_id === sec.id),
      };
    });

    res.json({ sections: sectionsWithVideos });
  } catch (error) {
    next(error);
  }
};
