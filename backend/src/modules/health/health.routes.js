import express from 'express';
import pool from '../../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', version: '1.0.0' });
  } catch (error) {
    res.status(503).json({ status: 'error', db: 'disconnected', message: error.message });
  }
});

export default router;
