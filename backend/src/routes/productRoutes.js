import { Router } from 'express';
import {
  createProductHandler,
  listProductsHandler,
  getProductHandler,
  updateProductHandler,
  deleteProductHandler,
  getRelatedProductsHandler,
} from '../controllers/productController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
} from '../validators/productSchemas.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';
import { upload, handleMulterError } from '../middleware/uploadMiddleware.js';

const router = Router();

router.get('/', listProductsHandler);
router.get('/:id', validateRequest(productIdSchema), getProductHandler);
router.get('/:id/related', validateRequest(productIdSchema), getRelatedProductsHandler);

// Note: Multer must run before validation to populate req.body
// We use handleMulterError to catch size limits
router.post(
  '/',
  authenticate,
  requireRole('vendor'),
  upload.array('images', 5),
  handleMulterError,
  validateRequest(createProductSchema),
  createProductHandler
);

router.put(
  '/:id',
  authenticate,
  requireRole('vendor'),
  upload.array('images', 5),
  handleMulterError,
  validateRequest(updateProductSchema),
  updateProductHandler
);

router.delete(
  '/:id',
  authenticate,
  requireRole('vendor'),
  validateRequest(productIdSchema),
  deleteProductHandler
);

export default router;
