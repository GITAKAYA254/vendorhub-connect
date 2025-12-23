import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { initiatePaymentHandler, mpesaCallbackHandler, getPaymentStatusHandler } from '../controllers/paymentController.js';

const router = Router();

// POST /api/payments/initiate - Start payment
router.post('/initiate', authenticate, initiatePaymentHandler);

// POST /api/payments/callback/mpesa - Receive Daraja webhook
// Note: No auth middleware here as it comes from Safaricom
router.post('/callback/mpesa', mpesaCallbackHandler);

// GET /api/payments/:id - Check status
router.get('/:id', authenticate, getPaymentStatusHandler);

export default router;
