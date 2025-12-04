import { Router } from 'express';
import {
  createProductHandler,
  listProductsHandler,
  getProductHandler,
  updateProductHandler,
  deleteProductHandler,
} from '../controllers/productController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
} from '../validators/productSchemas.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', listProductsHandler);
router.get('/:id', validateRequest(productIdSchema), getProductHandler);
router.post('/', authenticate, requireRole('vendor'), validateRequest(createProductSchema), createProductHandler);
router.put('/:id', authenticate, requireRole('vendor'), validateRequest(updateProductSchema), updateProductHandler);
router.delete('/:id', authenticate, requireRole('vendor'), validateRequest(productIdSchema), deleteProductHandler);

export default router;



