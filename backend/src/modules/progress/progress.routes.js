import express from 'express';
import { getProgress, updateProgress } from './progress.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/videos/:videoId', authenticate, getProgress);
router.post('/videos/:videoId', authenticate, updateProgress);

export default router;
