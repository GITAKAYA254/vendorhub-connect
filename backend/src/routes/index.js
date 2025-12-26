import { Router } from 'express';
import authRoutes from './authRoutes.js';
import vendorRoutes from './vendorRoutes.js';
import productRoutes from './productRoutes.js';
import jobRoutes from './jobRoutes.js';
import taskRoutes from './taskRoutes.js';
import searchRoutes from './searchRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import vendorPaymentRoutes from './paymentMethodRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/vendors', vendorRoutes);
router.use('/products', productRoutes);
router.use('/jobs', jobRoutes);
router.use('/tasks', taskRoutes);
router.use('/search', searchRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/vendor-payment-methods', vendorPaymentRoutes);

export default router;
