import { jest } from '@jest/globals';

const mockPrisma = {
  productReview: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  vendorReview: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },
};

jest.unstable_mockModule('../../src/lib/prisma.js', () => ({
  prisma: mockPrisma,
}));

const {
  addProductReview,
  addVendorReview,
  getProductReviews,
  getVendorReviews,
} = await import('../../src/services/reviewService.js');

describe('Review Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addProductReview', () => {
    it('should create a product review successfully', async () => {
      const mockReview = {
        id: 'review123',
        productId: 'product123',
        userId: 'user123',
        rating: 5,
        comment: 'Excellent product!',
        user: { name: 'John Doe' },
      };

      mockPrisma.productReview.findUnique.mockResolvedValue(null);
      mockPrisma.productReview.create.mockResolvedValue(mockReview);

      const result = await addProductReview('user123', 'product123', {
        rating: 5,
        comment: 'Excellent product!',
      });

      expect(result).toEqual(mockReview);
      expect(mockPrisma.productReview.create).toHaveBeenCalledWith({
        data: {
          userId: 'user123',
          productId: 'product123',
          rating: 5,
          comment: 'Excellent product!',
        },
        include: { user: { select: { name: true } } },
      });
    });

    it('should reject rating below 1', async () => {
      await expect(
        addProductReview('user123', 'product123', { rating: 0 })
      ).rejects.toThrow('Rating must be between 1 and 5');
    });

    it('should reject rating above 5', async () => {
      await expect(
        addProductReview('user123', 'product123', { rating: 6 })
      ).rejects.toThrow('Rating must be between 1 and 5');
    });

    it('should prevent duplicate reviews', async () => {
      mockPrisma.productReview.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        addProductReview('user123', 'product123', { rating: 5 })
      ).rejects.toThrow('You have already reviewed this product');
    });
  });

  describe('addVendorReview', () => {
    it('should create a vendor review successfully', async () => {
      const mockReview = {
        id: 'review123',
        vendorId: 'vendor123',
        userId: 'user123',
        rating: 4,
        reviewer: { name: 'Jane Doe' },
      };

      mockPrisma.vendorReview.findUnique.mockResolvedValue(null);
      mockPrisma.vendorReview.create.mockResolvedValue(mockReview);

      const result = await addVendorReview('user123', 'vendor123', { rating: 4 });

      expect(result).toEqual(mockReview);
    });

    it('should prevent self-reviews', async () => {
      await expect(
        addVendorReview('user123', 'user123', { rating: 5 })
      ).rejects.toThrow('You cannot review yourself');
    });
  });

  describe('getProductReviews', () => {
    it('should return paginated product reviews with average rating', async () => {
      const mockReviews = [
        { id: 'review1', rating: 5, user: { id: 'user1', name: 'User 1' } },
      ];

      mockPrisma.productReview.findMany.mockResolvedValue(mockReviews);
      mockPrisma.productReview.count.mockResolvedValue(10);
      mockPrisma.productReview.aggregate.mockResolvedValue({ _avg: { rating: 4.5 } });

      const result = await getProductReviews('product123', { skip: 0, limit: 10 });

      expect(result).toEqual({
        reviews: mockReviews,
        total: 10,
        averageRating: 4.5,
      });
    });

    it('should return 0 average rating when no reviews exist', async () => {
      mockPrisma.productReview.findMany.mockResolvedValue([]);
      mockPrisma.productReview.count.mockResolvedValue(0);
      mockPrisma.productReview.aggregate.mockResolvedValue({ _avg: { rating: null } });

      const result = await getProductReviews('product123');

      expect(result.averageRating).toBe(0);
    });
  });

  describe('getVendorReviews', () => {
    it('should return paginated vendor reviews', async () => {
      const mockReviews = [{ id: 'review1', rating: 5, reviewer: { name: 'User 1' } }];

      mockPrisma.vendorReview.findMany.mockResolvedValue(mockReviews);
      mockPrisma.vendorReview.count.mockResolvedValue(15);
      mockPrisma.vendorReview.aggregate.mockResolvedValue({ _avg: { rating: 4.0 } });

      const result = await getVendorReviews('vendor123');

      expect(result.total).toBe(15);
      expect(result.averageRating).toBe(4.0);
    });
  });
});