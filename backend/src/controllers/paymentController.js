import { initiatePayment, handleMpesaCallback, getPaymentStatus } from '../services/paymentService.js';
import { successResponse } from '../utils/response.js';

export const initiatePaymentHandler = async (req, res, next) => {
    try {
        const { amount, phoneNumber, orderId } = req.body;
        // Basic validation
        if (!amount || !phoneNumber || !orderId) {
            const error = new Error('Missing required fields: amount, phoneNumber, orderId');
            error.status = 400;
            throw error;
        }

        const result = await initiatePayment(req.user.id, req.body);
        res.status(201).json(successResponse(result));
    } catch (err) {
        next(err);
    }
};

export const mpesaCallbackHandler = async (req, res) => {
    try {
        const sourceIp = req.ip || req.connection.remoteAddress;
        console.log(`[MPESA-CALLBACK] Received from ${sourceIp}`);
        console.log('Headers:', JSON.stringify(req.headers));
        console.log('Body:', JSON.stringify(req.body, null, 2));

        const success = await handleMpesaCallback(req.body);

        if (!success) {
            // If validation inside service matched no payment
            console.warn('[MPESA-CALLBACK] No matching payment found for callback.');
            // Still return 200 to acknowledge partial success (we got it, just didn't process it)
            // or 404 if we want them to retry? Usually better to return 200 and investigate logs.
        }

        res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    } catch (err) {
        console.error('[MPESA-CALLBACK-ERROR]', err);
        // Always return 200 to Safaricom to prevent retries
        res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted with internal error' });
    }
};

export const getPaymentStatusHandler = async (req, res, next) => {
    try {
        const payment = await getPaymentStatus(req.params.id);

        // Authorization check
        const isOwner = payment.userId === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            const error = new Error('Access denied');
            error.status = 403;
            throw error;
        }

        res.json(successResponse({ payment }));
    } catch (err) {
        next(err);
    }
};
