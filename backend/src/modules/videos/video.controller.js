import pool from '../../config/db.js';

export const getVideo = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;

    const [videos] = await pool.query('SELECT * FROM videos WHERE id = ?', [videoId]);
    if (videos.length === 0) return res.status(404).json({ message: 'Video not found' });
    const video = videos[0];

    const [sections] = await pool.query('SELECT * FROM sections WHERE id = ?', [video.section_id]);
    if (sections.length === 0) return res.status(404).json({ message: 'Section not found' });
    const section = sections[0];

    const [allSections] = await pool.query('SELECT * FROM sections WHERE subject_id = ? ORDER BY order_index ASC', [section.subject_id]);
    const sectionIds = allSections.map((s) => s.id);

    const [allVideos] = await pool.query('SELECT id, section_id, order_index FROM videos WHERE section_id IN (?) ORDER BY section_id, order_index ASC', [sectionIds]);
    
    // Ordered videos
    const orderedVideos = [];
    allSections.forEach(sec => {
      const secVideos = allVideos.filter(v => v.section_id === sec.id).sort((a, b) => a.order_index - b.order_index);
      orderedVideos.push(...secVideos);
    });

    const currentIndex = orderedVideos.findIndex((v) => v.id === video.id);
    if (currentIndex === -1) return res.status(404).json({ message: 'Video not found in section' });

    // Check progress
    const [progressList] = await pool.query('SELECT * FROM video_progress WHERE user_id = ?', [userId]);
    const progressMap = {};
    progressList.forEach((p) => { progressMap[p.video_id] = p; });

    let isLocked = false;
    let computedLocked = false;
    let prevCompleted = true;

    for (let i = 0; i <= currentIndex; i++) {
        const vid = orderedVideos[i];
        const completed = Boolean(progressMap[vid.id]?.is_completed);
        if (i > 0) {
            computedLocked = !prevCompleted;
        } else {
            computedLocked = false;
        }
        
        if (i === currentIndex) {
            isLocked = computedLocked;
        }
        prevCompleted = completed;
    }

    const previous_video_id = currentIndex > 0 ? orderedVideos[currentIndex - 1].id : null;
    const next_video_id = currentIndex < orderedVideos.length - 1 ? orderedVideos[currentIndex + 1].id : null;

    res.json({
      video,
      previous_video_id,
      next_video_id,
      locked: isLocked
    });
  } catch (error) {
    next(error);
  }
};
