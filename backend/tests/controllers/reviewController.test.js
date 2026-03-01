import { jest } from '@jest/globals';

const mockAddProductReview = jest.fn();
const mockAddVendorReview = jest.fn();
const mockGetProductReviews = jest.fn();
const mockGetVendorReviews = jest.fn();
const mockSuccessResponse = jest.fn((data) => ({ success: true, data }));
const mockBuildPagination = jest.fn((query) => ({
  skip: parseInt(query.skip) || 0,
  limit: parseInt(query.limit) || 10,
  page: parseInt(query.page) || 1,
}));

jest.unstable_mockModule('../src/services/reviewService.js', () => ({
  addProductReview: mockAddProductReview,
  addVendorReview: mockAddVendorReview,
  getProductReviews: mockGetProductReviews,
  getVendorReviews: mockGetVendorReviews,
}));

jest.unstable_mockModule('../src/utils/response.js', () => ({
  successResponse: mockSuccessResponse,
}));

jest.unstable_mockModule('../src/utils/pagination.js', () => ({
  buildPagination: mockBuildPagination,
}));

const {
  createProductReviewHandler,
  createVendorReviewHandler,
  getProductReviewsHandler,
  getVendorReviewsHandler,
} = await import('../src/controllers/reviewController.js');

describe('Review Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      user: { id: 'user123' },
      params: {},
      body: {},
      query: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('createProductReviewHandler', () => {
    it('should create product review successfully', async () => {
      mockReq.params = { productId: 'product123' };
      mockReq.body = { rating: 5, comment: 'Great product!' };

      const review = {
        id: 'review123',
        productId: 'product123',
        userId: 'user123',
        rating: 5,
        comment: 'Great product!',
      };

      mockAddProductReview.mockResolvedValue(review);

      await createProductReviewHandler(mockReq, mockRes, mockNext);

      expect(mockAddProductReview).toHaveBeenCalledWith(
        'user123',
        'product123',
        mockReq.body
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { review },
      });
    });

    it('should handle validation errors', async () => {
      mockReq.params = { productId: 'product123' };
      mockReq.body = { rating: 6 };

      const error = new Error('Rating must be between 1 and 5');
      mockAddProductReview.mockRejectedValue(error);

      await createProductReviewHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle duplicate review error', async () => {
      mockReq.params = { productId: 'product123' };
      mockReq.body = { rating: 4, comment: 'Good' };

      const error = new Error('You have already reviewed this product');
      mockAddProductReview.mockRejectedValue(error);

      await createProductReviewHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('createVendorReviewHandler', () => {
    it('should create vendor review successfully', async () => {
      mockReq.params = { vendorId: 'vendor123' };
      mockReq.body = { rating: 4, comment: 'Reliable vendor' };

      const review = {
        id: 'review123',
        vendorId: 'vendor123',
        userId: 'user123',
        rating: 4,
        comment: 'Reliable vendor',
      };

      mockAddVendorReview.mockResolvedValue(review);

      await createVendorReviewHandler(mockReq, mockRes, mockNext);

      expect(mockAddVendorReview).toHaveBeenCalledWith(
        'user123',
        'vendor123',
        mockReq.body
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { review },
      });
    });

    it('should prevent self-review', async () => {
      mockReq.params = { vendorId: 'user123' };
      mockReq.body = { rating: 5 };

      const error = new Error('You cannot review yourself');
      mockAddVendorReview.mockRejectedValue(error);

      await createVendorReviewHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getProductReviewsHandler', () => {
    it('should get product reviews with pagination', async () => {
      mockReq.params = { productId: 'product123' };
      mockReq.query = { page: '1', limit: '5' };

      const result = {
        reviews: [
          { id: 'review1', rating: 5 },
          { id: 'review2', rating: 4 },
        ],
        total: 10,
        averageRating: 4.5,
      };

      mockGetProductReviews.mockResolvedValue(result);

      await getProductReviewsHandler(mockReq, mockRes, mockNext);

      expect(mockBuildPagination).toHaveBeenCalledWith(mockReq.query);
      expect(mockGetProductReviews).toHaveBeenCalledWith(
        'product123',
        expect.objectContaining({ skip: 0, limit: 10, page: 1 })
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          reviews: result.reviews,
          total: result.total,
          averageRating: result.averageRating,
          pagination: expect.any(Object),
        }),
      });
    });

    it('should use default pagination if not provided', async () => {
      mockReq.params = { productId: 'product123' };
      mockReq.query = {};

      mockGetProductReviews.mockResolvedValue({
        reviews: [],
        total: 0,
        averageRating: 0,
      });

      await getProductReviewsHandler(mockReq, mockRes, mockNext);

      expect(mockBuildPagination).toHaveBeenCalledWith({});
    });

    it('should handle errors', async () => {
      mockReq.params = { productId: 'product123' };

      const error = new Error('Database error');
      mockGetProductReviews.mockRejectedValue(error);

      await getProductReviewsHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getVendorReviewsHandler', () => {
    it('should get vendor reviews with pagination', async () => {
      mockReq.params = { vendorId: 'vendor123' };
      mockReq.query = { page: '2', limit: '5' };

      const result = {
        reviews: [{ id: 'review1', rating: 5 }],
        total: 20,
        averageRating: 4.2,
      };

      mockGetVendorReviews.mockResolvedValue(result);

      await getVendorReviewsHandler(mockReq, mockRes, mockNext);

      expect(mockGetVendorReviews).toHaveBeenCalledWith(
        'vendor123',
        expect.any(Object)
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          reviews: result.reviews,
          total: result.total,
          averageRating: result.averageRating,
        }),
      });
    });

    it('should handle vendor not found', async () => {
      mockReq.params = { vendorId: 'nonexistent' };

      const error = new Error('Vendor not found');
      mockGetVendorReviews.mockRejectedValue(error);

      await getVendorReviewsHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});