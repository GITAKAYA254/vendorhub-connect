import { jest } from '@jest/globals';

const mockInitiatePayment = jest.fn();
const mockHandleMpesaCallback = jest.fn();
const mockGetPaymentStatus = jest.fn();
const mockSuccessResponse = jest.fn((data) => ({ success: true, data }));

jest.unstable_mockModule('../src/services/paymentService.js', () => ({
  initiatePayment: mockInitiatePayment,
  handleMpesaCallback: mockHandleMpesaCallback,
  getPaymentStatus: mockGetPaymentStatus,
}));

jest.unstable_mockModule('../src/utils/response.js', () => ({
  successResponse: mockSuccessResponse,
}));

const {
  initiatePaymentHandler,
  mpesaCallbackHandler,
  getPaymentStatusHandler,
} = await import('../src/controllers/paymentController.js');

describe('Payment Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      user: { id: 'user123' },
      body: {},
      params: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('initiatePaymentHandler', () => {
    it('should initiate payment successfully', async () => {
      mockReq.body = {
        amount: 1000,
        phoneNumber: '254712345678',
        orderId: 'order123',
      };

      const paymentResult = {
        payment: { id: 'payment123', status: 'pending' },
        providerResponse: { CheckoutRequestID: 'checkout123' },
      };

      mockInitiatePayment.mockResolvedValue(paymentResult);

      await initiatePaymentHandler(mockReq, mockRes, mockNext);

      expect(mockInitiatePayment).toHaveBeenCalledWith('user123', mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: paymentResult,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 if amount is missing', async () => {
      mockReq.body = {
        phoneNumber: '254712345678',
        orderId: 'order123',
      };

      await initiatePaymentHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Missing required fields: amount, phoneNumber, orderId',
          status: 400,
        })
      );
      expect(mockInitiatePayment).not.toHaveBeenCalled();
    });

    it('should return 400 if phoneNumber is missing', async () => {
      mockReq.body = {
        amount: 1000,
        orderId: 'order123',
      };

      await initiatePaymentHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
        })
      );
    });

    it('should return 400 if orderId is missing', async () => {
      mockReq.body = {
        amount: 1000,
        phoneNumber: '254712345678',
      };

      await initiatePaymentHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
        })
      );
    });

    it('should handle service errors', async () => {
      mockReq.body = {
        amount: 1000,
        phoneNumber: '254712345678',
        orderId: 'order123',
      };

      const serviceError = new Error('M-Pesa service unavailable');
      mockInitiatePayment.mockRejectedValue(serviceError);

      await initiatePaymentHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('mpesaCallbackHandler', () => {
    it('should process callback successfully', async () => {
      const callbackData = {
        Body: {
          stkCallback: {
            CheckoutRequestID: 'checkout123',
            ResultCode: 0,
            ResultDesc: 'Success',
          },
        },
      };

      mockReq.body = callbackData;
      mockHandleMpesaCallback.mockResolvedValue(true);

      await mpesaCallbackHandler(mockReq, mockRes);

      expect(mockHandleMpesaCallback).toHaveBeenCalledWith(callbackData);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        ResultCode: 0,
        ResultDesc: 'Accepted',
      });
    });

    it('should always return 200 even on error', async () => {
      mockReq.body = { Body: { stkCallback: {} } };
      mockHandleMpesaCallback.mockRejectedValue(new Error('Database error'));

      await mpesaCallbackHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        ResultCode: 0,
        ResultDesc: 'Accepted with internal error',
      });
    });

    it('should log callback data', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      mockReq.body = {
        Body: {
          stkCallback: {
            CheckoutRequestID: 'test123',
          },
        },
      };
      mockHandleMpesaCallback.mockResolvedValue(true);

      await mpesaCallbackHandler(mockReq, mockRes);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Received M-Pesa Callback:',
        expect.any(String)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('getPaymentStatusHandler', () => {
    it('should return payment status', async () => {
      mockReq.params = { id: 'payment123' };

      const payment = {
        id: 'payment123',
        status: 'completed',
        amount: 1000,
        transactionId: 'MPESA123',
      };

      mockGetPaymentStatus.mockResolvedValue(payment);

      await getPaymentStatusHandler(mockReq, mockRes, mockNext);

      expect(mockGetPaymentStatus).toHaveBeenCalledWith('payment123');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { payment },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle payment not found', async () => {
      mockReq.params = { id: 'nonexistent' };

      const error = new Error('Payment not found');
      mockGetPaymentStatus.mockRejectedValue(error);

      await getPaymentStatusHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle service errors', async () => {
      mockReq.params = { id: 'payment123' };

      const error = new Error('Database connection failed');
      mockGetPaymentStatus.mockRejectedValue(error);

      await getPaymentStatusHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});