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
import { authenticate, requireVendor } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', listJobsHandler);
router.get('/:id', validateRequest(jobIdSchema), getJobHandler);
router.post('/', authenticate, requireVendor, validateRequest(createJobSchema), createJobHandler);
router.put('/:id', authenticate, requireVendor, validateRequest(updateJobSchema), updateJobHandler);
router.delete('/:id', authenticate, requireVendor, validateRequest(jobIdSchema), deleteJobHandler);

export default router;



