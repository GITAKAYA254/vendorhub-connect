import { Router } from 'express';
import { searchHandler } from '../controllers/searchController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { searchSchema } from '../validators/searchSchemas.js';

const router = Router();

router.get('/', validateRequest(searchSchema), searchHandler);

export default router;




