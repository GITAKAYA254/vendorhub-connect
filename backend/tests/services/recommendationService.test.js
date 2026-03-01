import { jest } from '@jest/globals';

const mockPrisma = {
  product: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
};

jest.unstable_mockModule('../../src/lib/prisma.js', () => ({
  prisma: mockPrisma,
}));

const { getRelatedProducts } = await import('../../src/services/recommendationService.js');

describe('Recommendation Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRelatedProducts', () => {
    const mockProduct = {
      id: 'product1',
      category: 'Electronics',
      vendorId: 'vendor1',
      tags: ['smartphone', 'android'],
      price: 50000,
    };

    it('should return related products based on category, vendor, and tags', async () => {
      const relatedProducts = [
        {
          id: 'product2',
          category: 'Electronics',
          vendorId: 'vendor1',
          tags: ['smartphone', 'android'],
          price: 45000,
          productImages: [{ url: '/img1.jpg', isPrimary: true }],
          images: ['/img1.jpg'],
        },
        {
          id: 'product3',
          category: 'Electronics',
          vendorId: 'vendor2',
          tags: [],
          price: 30000,
          productImages: [],
          images: [],
        },
      ];

      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.product.findMany.mockResolvedValue(relatedProducts);

      const result = await getRelatedProducts('product1', 5);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('product2'); // Higher score
      expect(result[0].primaryImage).toBe('/img1.jpg');
    });

    it('should throw error if source product not found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(getRelatedProducts('nonexistent')).rejects.toThrow('Product not found');
    });

    it('should prioritize products by scoring algorithm', async () => {
      const relatedProducts = [
        {
          id: 'productLow',
          category: 'Clothing',
          vendorId: 'vendor2',
          tags: [],
          price: 1000,
          productImages: [],
        },
        {
          id: 'productHigh',
          category: 'Electronics',
          vendorId: 'vendor1',
          tags: ['smartphone', 'android'],
          price: 48000,
          productImages: [],
        },
      ];

      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.product.findMany.mockResolvedValue(relatedProducts);

      const result = await getRelatedProducts('product1', 5);

      // productHigh should be first (same category + vendor + tags)
      expect(result[0].id).toBe('productHigh');
    });

    it('should respect the limit parameter', async () => {
      const manyProducts = Array.from({ length: 20 }, (_, i) => ({
        id: `product${i}`,
        category: 'Electronics',
        vendorId: 'vendor1',
        tags: [],
        price: 10000,
        productImages: [],
      }));

      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.product.findMany.mockResolvedValue(manyProducts);

      const result = await getRelatedProducts('product1', 3);

      expect(result).toHaveLength(3);
    });

    it('should format product data correctly', async () => {
      const relatedProducts = [
        {
          id: 'product2',
          category: 'Electronics',
          vendorId: 'vendor1',
          tags: [],
          price: '45000.50',
          productImages: [
            { url: '/primary.jpg', isPrimary: true },
            { url: '/secondary.jpg', isPrimary: false },
          ],
          images: [],
        },
      ];

      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.product.findMany.mockResolvedValue(relatedProducts);

      const result = await getRelatedProducts('product1');

      expect(result[0].price).toBe(45000.5);
      expect(result[0].images).toEqual(['/primary.jpg', '/secondary.jpg']);
      expect(result[0].primaryImage).toBe('/primary.jpg');
    });
  });
});