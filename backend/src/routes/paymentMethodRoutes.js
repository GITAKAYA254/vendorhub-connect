import { Router } from 'express';
import { authenticate, requireVendor } from '../middleware/authMiddleware.js';
import { listMyPaymentMethods, updatePaymentMethod, removePaymentMethod, listVendorPaymentMethods } from '../controllers/paymentMethodController.js';

const router = Router();

// Public route to check available methods during checkout
router.get('/vendor/:vendorId', listVendorPaymentMethods);

router.use(authenticate, requireVendor);

router.get('/', listMyPaymentMethods);
router.post('/', updatePaymentMethod);
router.delete('/:type', removePaymentMethod);

export default router;
