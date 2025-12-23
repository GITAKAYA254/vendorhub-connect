import { prisma } from '../lib/prisma.js';
import { initiateSTKPush } from '../utils/mpesa.js';

export const initiatePayment = async (userId, { amount, phoneNumber, orderId, provider = 'mpesa' }) => {
    // 1. Create Payment Record
    // We use a clean reference for tracking
    const reference = `ORD-${orderId}-${Date.now().toString().slice(-4)}`;

    const payment = await prisma.payment.create({
        data: {
            amount,
            provider,
            status: 'pending',
            reference,
            orderPaymentLink: {
                create: {
                    orderId,
                },
            },
        },
    });

    // 2. Initiate Provider Logic
    if (provider === 'mpesa') {
        try {
            const mpesaResponse = await initiateSTKPush({
                phoneNumber,
                amount,
                reference,
                description: `Order ${orderId}`,
            });

            // Store provider-specific IDs (CheckoutRequestID) in metadata for callback matching
            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    metadata: mpesaResponse, // { MerchantRequestID, CheckoutRequestID, ... }
                },
            });

            return { payment, providerResponse: mpesaResponse };
        } catch (error) {
            // Mark as failed if initiation fails
            await prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'failed', metadata: { error: error.message } },
            });
            throw error;
        }
    }

    throw new Error('Provider not supported yet');
};

export const handleMpesaCallback = async (body) => {
    const { Body } = body;

    if (!Body?.stkCallback) {
        throw new Error('Invalid callback body');
    }

    const { stkCallback } = Body;
    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    // Match payment by CheckoutRequestID in metadata
    // Prisma JSON filter for PostgreSQL
    const payment = await prisma.payment.findFirst({
        where: {
            status: 'pending',
            metadata: {
                path: ['CheckoutRequestID'],
                equals: CheckoutRequestID,
            },
        },
    });

    if (!payment) {
        console.warn(`Payment record not found for CheckoutRequestID: ${CheckoutRequestID}`);
        // Return true to acknowledge receipt anyway
        return false;
    }

    if (ResultCode === 0) {
        // Success
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
        console.log(`Payment ${payment.id} completed. Receipt: ${transactionId}`);
    } else {
        // Failed / Cancelled
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: 'failed',
                metadata: { ...payment.metadata, callback: stkCallback, failureReason: ResultDesc },
            },
        });
        console.log(`Payment ${payment.id} failed: ${ResultDesc}`);
    }
    return true;
};

export const getPaymentStatus = async (paymentId) => {
    const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
            orderPaymentLink: true,
        },
    });

    if (!payment) {
        throw new Error('Payment not found');
    }

    return payment;
};
