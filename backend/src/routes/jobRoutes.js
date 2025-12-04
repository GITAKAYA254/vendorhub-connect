import { Router } from 'express';
import {
  createJobHandler,
  listJobsHandler,
  getJobHandler,
  updateJobHandler,
  deleteJobHandler,
} from '../controllers/jobController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createJobSchema, updateJobSchema, jobIdSchema } from '../validators/jobSchemas.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', listJobsHandler);
router.get('/:id', validateRequest(jobIdSchema), getJobHandler);
router.post('/', authenticate, requireRole('vendor'), validateRequest(createJobSchema), createJobHandler);
router.put('/:id', authenticate, requireRole('vendor'), validateRequest(updateJobSchema), updateJobHandler);
router.delete('/:id', authenticate, requireRole('vendor'), validateRequest(jobIdSchema), deleteJobHandler);

export default router;



