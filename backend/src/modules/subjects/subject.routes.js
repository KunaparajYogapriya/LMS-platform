import express from 'express';
import { getSubjects, getSubject, getSubjectTree, enrollSubject } from './subject.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getSubjects);
router.get('/:subjectId', authenticate, getSubject);
router.post('/:subjectId/enroll', authenticate, enrollSubject);
router.get('/:subjectId/tree', authenticate, getSubjectTree);

export default router;
