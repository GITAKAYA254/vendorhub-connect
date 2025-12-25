import { prisma } from '../lib/prisma.js';
import { initiateSTKPush } from '../utils/mpesa.js';

/**
 * Initiate a payment.
 * Now fetches vendor-specific payment settings if available.
 */
export const initiatePayment = async (userId, { amount, phoneNumber, orderId, vendorId, provider = 'mpesa' }) => {
    // 1. Fetch Vendor Payment Config if vendorId is provided
    let vendorConfig = null;
    if (vendorId) {
        const method = await prisma.vendorPaymentMethod.findUnique({
            where: {
                vendorId_type: {
                    vendorId,
                    type: provider.toUpperCase()
                }
            }
        });
        if (method && method.isActive) {
            vendorConfig = method.config;
        }
    }

    // 2. Create Payment Record
    const reference = `ORD-${orderId}-${Date.now().toString().slice(-4)}`;

    const payment = await prisma.payment.create({
        data: {
            amount,
            provider,
            status: 'pending',
            reference,
            userId,
            orderPaymentLink: {
                create: {
                    orderId,
                },
            },
            metadata: { vendorId }, // track which vendor this belongs to
        },
    });

    // 3. Initiate Provider Logic
    if (provider === 'mpesa') {
        try {
            const mpesaResponse = await initiateSTKPush({
                phoneNumber,
                amount,
                reference,
                description: `Order ${orderId}`,
                vendorConfig // Pass the vendor's shortcode/creds
            });

            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    metadata: { ...payment.metadata, ...mpesaResponse },
                },
            });

            return { payment, providerResponse: mpesaResponse };
        } catch (error) {
            await prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'failed', metadata: { ...payment.metadata, error: error.message } },
            });
            throw error;
        }
    }

    throw new Error('Provider not supported yet');
};

export const handleMpesaCallback = async (body) => {
    const { Body } = body;
    if (!Body?.stkCallback) throw new Error('Invalid callback body');

    const { stkCallback } = Body;
    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    // Search for payment in metadata
    const payment = await prisma.payment.findFirst({
        where: {
            status: 'pending',
            metadata: {
                path: ['CheckoutRequestID'],
                equals: CheckoutRequestID,
            },
        },
    });

    if (!payment) return false;

    if (ResultCode === 0) {
        const items = CallbackMetadata?.Item || [];
        const receiptItem = items.find((i) => i.Name === 'MpesaReceiptNumber');
        const transactionId = receiptItem?.Value?.toString();

        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: 'completed',
                transactionId,
                metadata: { ...payment.metadata, callback: stkCallback },
            },
        });
    } else {
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: 'failed',
                metadata: { ...payment.metadata, callback: stkCallback, failureReason: ResultDesc },
            },
        });
    }
    return true;
};

export const getPaymentStatus = async (paymentId) => {
    return prisma.payment.findUnique({
        where: { id: paymentId },
        include: { orderPaymentLink: true },
    });
};
