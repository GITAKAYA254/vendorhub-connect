import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { initiatePaymentHandler, mpesaCallbackHandler, getPaymentStatusHandler } from '../controllers/paymentController.js';

const router = Router();

// POST /api/payments/initiate - Start payment
router.post('/initiate', authenticate, initiatePaymentHandler);

import { verifyMpesaCallback } from '../middleware/mpesaMiddleware.js';

// POST /api/payments/callback/mpesa - Receive Daraja webhook
// Secured with token verification
router.post('/callback/mpesa', verifyMpesaCallback, mpesaCallbackHandler);

// GET /api/payments/:id - Check status
router.get('/:id', authenticate, getPaymentStatusHandler);

export default router;
