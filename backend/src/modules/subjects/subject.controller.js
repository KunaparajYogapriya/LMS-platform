import pool from '../../config/db.js';

export const getSubjects = async (req, res, next) => {
  try {
    // Prevent browser caching the subjects list when navigating back to dashboard
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    const userId = req.user?.id;

    // Get all published subjects
    const [subjects] = await pool.query('SELECT * FROM subjects WHERE is_published = TRUE ORDER BY id DESC');

    if (!userId) {
      return res.json(subjects.map(sub => ({ ...sub, progress: 0, isEnrolled: false })));
    }

    // Get total videos per subject
    const [videos] = await pool.query(`
      SELECT s.subject_id, v.id as video_id 
      FROM videos v 
      JOIN sections s ON v.section_id = s.id
    `);

    // Get enrolled subjects for this user
    const [enrollments] = await pool.query(
      'SELECT subject_id FROM enrollments WHERE user_id = ?',
      [userId]
    );
    const enrolledSubjectIds = new Set(enrollments.map(e => Number(e.subject_id)));

    // Get all completed videos for this user
    const [progressList] = await pool.query(
      'SELECT video_id FROM video_progress WHERE user_id = ? AND is_completed = TRUE',
      [userId]
    );
    const completedVideoIds = new Set(progressList.map(p => Number(p.video_id)));

    // Calculate progress for each subject
    const subjectsWithProgress = subjects.map(subject => {
      const currentSubjectId = Number(subject.id);
      const subjectVideos = videos.filter(v => Number(v.subject_id) === currentSubjectId);
      const totalVideos = subjectVideos.length;
      const completedVideos = subjectVideos.filter(v => completedVideoIds.has(Number(v.video_id))).length;
      
      const progressPercentage = totalVideos === 0 ? 0 : Math.round((completedVideos / totalVideos) * 100);
      const isEnrolled = enrolledSubjectIds.has(currentSubjectId);

      return {
        ...subject,
        progress: progressPercentage,
        isEnrolled: !!isEnrolled
      };
    });

    res.json(subjectsWithProgress);
  } catch (error) {
    next(error);
  }
};

export const getSubject = async (req, res, next) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const userId = req.user?.id;
    const [subjects] = await pool.query('SELECT * FROM subjects WHERE id = ? AND is_published = TRUE', [req.params.subjectId]);
    if (subjects.length === 0) return res.status(404).json({ message: 'Subject not found' });
    
    let isEnrolled = false;
    if (userId) {
      const [enrollments] = await pool.query('SELECT id FROM enrollments WHERE user_id = ? AND subject_id = ?', [userId, req.params.subjectId]);
      isEnrolled = enrollments.length > 0;
    }

    res.json({ ...subjects[0], isEnrolled });
  } catch (error) {
    next(error);
  }
};

export const getSubjectTree = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const userId = req.user.id;

    // Check enrollment
    const [enrollment] = await pool.query(
      'SELECT id FROM enrollments WHERE user_id = ? AND subject_id = ?',
      [userId, subjectId]
    );
    
    if (enrollment.length === 0) {
      return res.status(403).json({ 
        message: 'You must enroll in this course to view the curriculum.',
        notEnrolled: true 
      });
    }

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

    const videoDetails = orderedVideos.map((vid) => {
      const isCompleted = Boolean(progressMap[vid.id]?.is_completed);
      
      return {
        ...vid,
        is_completed: isCompleted,
        locked: false,
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

export const enrollSubject = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const userId = req.user.id;

    // Check if subject exists
    const [subjects] = await pool.query('SELECT id FROM subjects WHERE id = ? AND is_published = TRUE', [subjectId]);
    if (subjects.length === 0) return res.status(404).json({ message: 'Subject not found' });

    // Insert or ignore
    await pool.query(
      'INSERT IGNORE INTO enrollments (user_id, subject_id) VALUES (?, ?)',
      [userId, subjectId]
    );

    res.json({ message: 'Enrolled successfully' });
  } catch (error) {
    next(error);
  }
};
