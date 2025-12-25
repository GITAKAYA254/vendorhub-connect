import { getVendorPaymentMethods, upsertPaymentMethod, deletePaymentMethod } from '../services/paymentMethodService.js';
import { successResponse } from '../utils/response.js';

export const listMyPaymentMethods = async (req, res, next) => {
    try {
        const methods = await getVendorPaymentMethods(req.user.id);
        res.json(successResponse({ methods }));
    } catch (err) {
        next(err);
    }
};

export const listVendorPaymentMethods = async (req, res, next) => {
    try {
        const { vendorId } = req.params;
        const methods = await getVendorPaymentMethods(vendorId);
        // Sanitize config - don't send passkeys/secrets to public
        const sanitized = methods.map(m => ({
            type: m.type,
            isActive: m.isActive
        }));
        res.json(successResponse({ methods: sanitized }));
    } catch (err) {
        next(err);
    }
};

export const updatePaymentMethod = async (req, res, next) => {
    try {
        const method = await upsertPaymentMethod(req.user.id, req.body);
        res.json(successResponse({ method }));
    } catch (err) {
        next(err);
    }
};

export const removePaymentMethod = async (req, res, next) => {
    try {
        const { type } = req.params;
        await deletePaymentMethod(req.user.id, type);
        res.json(successResponse({ message: 'Payment method removed' }));
    } catch (err) {
        next(err);
    }
};
