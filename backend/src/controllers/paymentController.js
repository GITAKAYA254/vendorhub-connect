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
        console.log('Received M-Pesa Callback:', JSON.stringify(req.body, null, 2));
        await handleMpesaCallback(req.body);
        res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    } catch (err) {
        console.error('M-Pesa Callback Error:', err);
        // Always return 200 to Safaricom to prevent retries
        res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted with internal error' });
    }
};

export const getPaymentStatusHandler = async (req, res, next) => {
    try {
        const payment = await getPaymentStatus(req.params.id);
        // Security check: ensure user owns the payment or is admin (omitted for brevity, but should be in service or here)
        res.json(successResponse({ payment }));
    } catch (err) {
        next(err);
    }
};
