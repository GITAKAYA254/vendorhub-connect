import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
    createProductReviewHandler,
    createVendorReviewHandler,
    getProductReviewsHandler,
    getVendorReviewsHandler,
} from '../controllers/reviewController.js';

const router = Router();

// Product Reviews
router.post('/product/:productId', authenticate, createProductReviewHandler);
router.get('/product/:productId', getProductReviewsHandler);

// Vendor Reviews
router.post('/vendor/:vendorId', authenticate, createVendorReviewHandler);
router.get('/vendor/:vendorId', getVendorReviewsHandler);

export default router;
