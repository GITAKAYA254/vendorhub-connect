import { Router } from 'express';
import {
  createTaskHandler,
  listTasksHandler,
  getTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
} from '../controllers/taskController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createTaskSchema, updateTaskSchema, taskIdSchema } from '../validators/taskSchemas.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', listTasksHandler);
router.get('/:id', validateRequest(taskIdSchema), getTaskHandler);
router.post('/', authenticate, requireRole('vendor'), validateRequest(createTaskSchema), createTaskHandler);
router.put('/:id', authenticate, requireRole('vendor'), validateRequest(updateTaskSchema), updateTaskHandler);
router.delete('/:id', authenticate, requireRole('vendor'), validateRequest(taskIdSchema), deleteTaskHandler);

export default router;



