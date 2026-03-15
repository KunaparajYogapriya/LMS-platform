import express from 'express';
import { getVideo } from './video.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/:videoId', authenticate, getVideo);

export default router;
