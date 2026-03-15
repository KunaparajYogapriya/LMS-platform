import pool from '../../config/db.js';

export const getProgress = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;

    const [progressList] = await pool.query(
      'SELECT * FROM video_progress WHERE user_id = ? AND video_id = ?',
      [userId, videoId]
    );

    if (progressList.length === 0) {
      return res.json({
        last_position_seconds: 0,
        is_completed: false,
      });
    }

    res.json(progressList[0]);
  } catch (error) {
    next(error);
  }
};

export const updateProgress = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;
    const { last_position_seconds, is_completed } = req.body;

    const [progressList] = await pool.query(
      'SELECT * FROM video_progress WHERE user_id = ? AND video_id = ?',
      [userId, videoId]
    );

    if (progressList.length === 0) {
      await pool.query(
        'INSERT INTO video_progress (user_id, video_id, last_position_seconds, is_completed, completed_at) VALUES (?, ?, ?, ?, ?)',
        [userId, videoId, last_position_seconds !== undefined ? last_position_seconds : 0, Boolean(is_completed), is_completed ? new Date() : null]
      );
    } else {
      const existing = progressList[0];
      const newCompleted = Boolean(existing.is_completed || is_completed);
      const completedAt = (is_completed && !existing.is_completed) ? new Date() : existing.completed_at;

      await pool.query(
        'UPDATE video_progress SET last_position_seconds = ?, is_completed = ?, completed_at = ? WHERE id = ?',
        [last_position_seconds !== undefined ? last_position_seconds : existing.last_position_seconds, newCompleted, completedAt, existing.id]
      );
    }

    res.json({ message: 'Progress updated successfully' });
  } catch (error) {
    next(error);
  }
};
