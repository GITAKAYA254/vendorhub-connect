import { jest } from '@jest/globals';

// Mock dependencies
const mockPrisma = {
  payment: {
    create: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
  },
};

const mockInitiateSTKPush = jest.fn();

jest.unstable_mockModule('../../src/lib/prisma.js', () => ({
  prisma: mockPrisma,
}));

jest.unstable_mockModule('../../src/utils/mpesa.js', () => ({
  initiateSTKPush: mockInitiateSTKPush,
}));

const { initiatePayment, handleMpesaCallback, getPaymentStatus } = await import('../../src/services/paymentService.js');

describe('Payment Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initiatePayment', () => {
    const validPayload = {
      amount: 1000,
      phoneNumber: '254712345678',
      orderId: 'order123',
      provider: 'mpesa',
    };

    it('should create payment record and initiate M-Pesa STK push successfully', async () => {
      const mockPayment = {
        id: 'payment123',
        amount: 1000,
        provider: 'mpesa',
        status: 'pending',
        reference: 'ORD-order123-1234',
      };

      const mockMpesaResponse = {
        MerchantRequestID: 'merchant123',
        CheckoutRequestID: 'checkout123',
        ResponseCode: '0',
        ResponseDescription: 'Success',
      };

      mockPrisma.payment.create.mockResolvedValue(mockPayment);
      mockInitiateSTKPush.mockResolvedValue(mockMpesaResponse);
      mockPrisma.payment.update.mockResolvedValue({
        ...mockPayment,
        metadata: mockMpesaResponse,
      });

      const result = await initiatePayment('user123', validPayload);

      expect(mockPrisma.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          amount: 1000,
          provider: 'mpesa',
          status: 'pending',
          orderPaymentLink: {
            create: {
              orderId: 'order123',
            },
          },
        }),
      });

      expect(mockInitiateSTKPush).toHaveBeenCalledWith({
        phoneNumber: '254712345678',
        amount: 1000,
        reference: expect.stringContaining('ORD-order123'),
        description: 'Order order123',
      });

      expect(result).toEqual({
        payment: mockPayment,
        providerResponse: mockMpesaResponse,
      });
    });

    it('should mark payment as failed if M-Pesa initiation fails', async () => {
      const mockPayment = { id: 'payment123', status: 'pending' };
      mockPrisma.payment.create.mockResolvedValue(mockPayment);
      mockInitiateSTKPush.mockRejectedValue(new Error('Network error'));
      mockPrisma.payment.update.mockResolvedValue({ ...mockPayment, status: 'failed' });

      await expect(initiatePayment('user123', validPayload)).rejects.toThrow('Network error');

      expect(mockPrisma.payment.update).toHaveBeenCalledWith({
        where: { id: 'payment123' },
        data: {
          status: 'failed',
          metadata: { error: 'Network error' },
        },
      });
    });

    it('should throw error for unsupported payment provider', async () => {
      const mockPayment = { id: 'payment123', provider: 'stripe', status: 'pending' };
      mockPrisma.payment.create.mockResolvedValue(mockPayment);

      await expect(
        initiatePayment('user123', { ...validPayload, provider: 'stripe' })
      ).rejects.toThrow('Provider not supported yet');
    });
  });

  describe('handleMpesaCallback', () => {
    it('should process successful M-Pesa callback', async () => {
      const mockPayment = {
        id: 'payment123',
        status: 'pending',
        metadata: { CheckoutRequestID: 'checkout123' },
      };

      const callbackBody = {
        Body: {
          stkCallback: {
            CheckoutRequestID: 'checkout123',
            ResultCode: 0,
            ResultDesc: 'Success',
            CallbackMetadata: {
              Item: [{ Name: 'MpesaReceiptNumber', Value: 'MPESA123' }],
            },
          },
        },
      };

      mockPrisma.payment.findFirst.mockResolvedValue(mockPayment);
      mockPrisma.payment.update.mockResolvedValue({ ...mockPayment, status: 'completed' });

      const result = await handleMpesaCallback(callbackBody);

      expect(result).toBe(true);
      expect(mockPrisma.payment.update).toHaveBeenCalledWith({
        where: { id: 'payment123' },
        data: expect.objectContaining({
          status: 'completed',
          transactionId: 'MPESA123',
        }),
      });
    });

    it('should handle failed M-Pesa callback', async () => {
      const mockPayment = { id: 'payment123', status: 'pending', metadata: {} };
      const callbackBody = {
        Body: {
          stkCallback: {
            CheckoutRequestID: 'checkout123',
            ResultCode: 1032,
            ResultDesc: 'Request cancelled by user',
          },
        },
      };

      mockPrisma.payment.findFirst.mockResolvedValue(mockPayment);
      mockPrisma.payment.update.mockResolvedValue({ ...mockPayment, status: 'failed' });

      await handleMpesaCallback(callbackBody);

      expect(mockPrisma.payment.update).toHaveBeenCalledWith({
        where: { id: 'payment123' },
        data: expect.objectContaining({
          status: 'failed',
        }),
      });
    });

    it('should return false if payment not found', async () => {
      mockPrisma.payment.findFirst.mockResolvedValue(null);

      const result = await handleMpesaCallback({
        Body: { stkCallback: { CheckoutRequestID: 'unknown', ResultCode: 0 } },
      });

      expect(result).toBe(false);
    });

    it('should throw error for invalid callback body', async () => {
      await expect(handleMpesaCallback({})).rejects.toThrow('Invalid callback body');
    });
  });

  describe('getPaymentStatus', () => {
    it('should return payment with order link', async () => {
      const mockPayment = {
        id: 'payment123',
        status: 'completed',
        orderPaymentLink: { orderId: 'order123' },
      };

      mockPrisma.payment.findUnique.mockResolvedValue(mockPayment);

      const result = await getPaymentStatus('payment123');

      expect(result).toEqual(mockPayment);
    });

    it('should throw error if payment not found', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(null);

      await expect(getPaymentStatus('nonexistent')).rejects.toThrow('Payment not found');
    });
  });
});