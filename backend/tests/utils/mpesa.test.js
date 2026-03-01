import { jest } from '@jest/globals';
import axios from 'axios';

jest.mock('axios');

// Mock environment variables
process.env.MPESA_CONSUMER_KEY = 'test_consumer_key';
process.env.MPESA_CONSUMER_SECRET = 'test_consumer_secret';
process.env.MPESA_SHORTCODE = '174379';
process.env.MPESA_PASSKEY = 'test_passkey';
process.env.MPESA_CALLBACK_URL = 'https://example.com/callback';
process.env.MPESA_ENV = 'sandbox';

const { initiateSTKPush } = await import('../src/utils/mpesa.js');

describe('M-Pesa Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initiateSTKPush', () => {
    const validPayload = {
      phoneNumber: '254712345678',
      amount: 1000,
      reference: 'ORD-123-4567',
      description: 'Test payment',
    };

    it('should successfully initiate STK push', async () => {
      const mockAccessToken = 'mock_access_token';
      const mockSTKResponse = {
        MerchantRequestID: 'merchant_123',
        CheckoutRequestID: 'checkout_123',
        ResponseCode: '0',
        ResponseDescription: 'Success. Request accepted for processing',
        CustomerMessage: 'Success. Request accepted for processing',
      };

      // Mock access token request
      axios.get.mockResolvedValueOnce({
        data: { access_token: mockAccessToken },
      });

      // Mock STK push request
      axios.post.mockResolvedValueOnce({
        data: mockSTKResponse,
      });

      const result = await initiateSTKPush(validPayload);

      expect(result).toEqual(mockSTKResponse);

      // Verify access token request
      expect(axios.get).toHaveBeenCalledWith(
        'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        {
          headers: {
            Authorization: expect.stringContaining('Basic '),
          },
        }
      );

      // Verify STK push request
      expect(axios.post).toHaveBeenCalledWith(
        'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        expect.objectContaining({
          BusinessShortCode: '174379',
          TransactionType: 'CustomerPayBillOnline',
          Amount: 1000,
          PartyA: '254712345678',
          PartyB: '174379',
          PhoneNumber: '254712345678',
          CallBackURL: 'https://example.com/callback',
          AccountReference: 'ORD-123-4567',
          TransactionDesc: 'Test payment',
        }),
        {
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
          },
        }
      );
    });

    it('should use production URLs when MPESA_ENV is production', async () => {
      process.env.MPESA_ENV = 'production';

      axios.get.mockResolvedValueOnce({
        data: { access_token: 'token' },
      });
      axios.post.mockResolvedValueOnce({
        data: { ResponseCode: '0' },
      });

      await initiateSTKPush(validPayload);

      expect(axios.get).toHaveBeenCalledWith(
        'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        expect.any(Object)
      );
      expect(axios.post).toHaveBeenCalledWith(
        'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        expect.any(Object),
        expect.any(Object)
      );

      process.env.MPESA_ENV = 'sandbox'; // Reset
    });

    it('should round up decimal amounts to integers', async () => {
      axios.get.mockResolvedValueOnce({ data: { access_token: 'token' } });
      axios.post.mockResolvedValueOnce({ data: { ResponseCode: '0' } });

      await initiateSTKPush({ ...validPayload, amount: 1000.75 });

      const callData = axios.post.mock.calls[0][1];
      expect(callData.Amount).toBe(1001);
    });

    it('should use default description if not provided', async () => {
      axios.get.mockResolvedValueOnce({ data: { access_token: 'token' } });
      axios.post.mockResolvedValueOnce({ data: { ResponseCode: '0' } });

      const { description, ...payloadWithoutDesc } = validPayload;
      await initiateSTKPush(payloadWithoutDesc);

      const callData = axios.post.mock.calls[0][1];
      expect(callData.TransactionDesc).toBe(`Payment for ${validPayload.reference}`);
    });

    it('should handle access token request failure', async () => {
      axios.get.mockRejectedValueOnce({
        response: {
          data: { error: 'invalid_client' },
        },
      });

      await expect(initiateSTKPush(validPayload)).rejects.toThrow(
        'Failed to get M-Pesa access token'
      );
    });

    it('should handle STK push request failure', async () => {
      axios.get.mockResolvedValueOnce({ data: { access_token: 'token' } });
      axios.post.mockRejectedValueOnce({
        response: {
          data: {
            errorCode: '400.002.02',
            errorMessage: 'Bad Request - Invalid PhoneNumber',
          },
        },
      });

      await expect(initiateSTKPush(validPayload)).rejects.toThrow(
        'Bad Request - Invalid PhoneNumber'
      );
    });

    it('should encode credentials correctly for Basic Auth', async () => {
      axios.get.mockResolvedValueOnce({ data: { access_token: 'token' } });
      axios.post.mockResolvedValueOnce({ data: { ResponseCode: '0' } });

      await initiateSTKPush(validPayload);

      const authHeader = axios.get.mock.calls[0][1].headers.Authorization;
      const encodedCreds = authHeader.replace('Basic ', '');
      const decodedCreds = Buffer.from(encodedCreds, 'base64').toString();

      expect(decodedCreds).toBe('test_consumer_key:test_consumer_secret');
    });

    it('should generate timestamp in correct format', async () => {
      axios.get.mockResolvedValueOnce({ data: { access_token: 'token' } });
      axios.post.mockResolvedValueOnce({ data: { ResponseCode: '0' } });

      await initiateSTKPush(validPayload);

      const callData = axios.post.mock.calls[0][1];
      // Timestamp should be 14 digits: YYYYMMDDHHmmss
      expect(callData.Timestamp).toMatch(/^\d{14}$/);
    });

    it('should handle network errors gracefully', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network Error'));

      await expect(initiateSTKPush(validPayload)).rejects.toThrow(
        'Failed to get M-Pesa access token'
      );
    });
  });
});