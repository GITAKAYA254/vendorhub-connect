import { Router } from 'express';
import { createVendor, getVendor } from '../controllers/vendorController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createVendorSchema } from '../validators/vendorSchemas.js';
import { authenticate, requireVendor } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', authenticate, requireVendor, validateRequest(createVendorSchema), createVendor);
router.get('/:id', getVendor);

export default router;



