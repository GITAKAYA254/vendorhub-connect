import { jest } from '@jest/globals';

const mockPrisma = {
  product: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  productImage: {
    createMany: jest.fn(),
  },
};

jest.unstable_mockModule('../../src/lib/prisma.js', () => ({
  prisma: mockPrisma,
}));

const {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = await import('../../src/services/productService.js');

describe('Product Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should create product with images and tags', async () => {
      const payload = {
        title: 'Smartphone',
        description: 'Latest model',
        price: 50000,
        category: 'Electronics',
        stock: 10,
        images: ['/uploads/img1.jpg', '/uploads/img2.jpg'],
        tags: ['smartphone', 'android'],
      };

      const mockProduct = {
        id: 'product123',
        ...payload,
        productImages: [
          { url: '/uploads/img1.jpg', isPrimary: true },
          { url: '/uploads/img2.jpg', isPrimary: false },
        ],
      };

      mockPrisma.product.create.mockResolvedValue(mockProduct);

      const result = await createProduct('vendor123', payload);

      expect(result.price).toBe(50000);
      expect(result.images).toEqual(['/uploads/img1.jpg', '/uploads/img2.jpg']);
      expect(result.primaryImage).toBe('/uploads/img1.jpg');
    });

    it('should handle product without images', async () => {
      const payload = {
        title: 'Service',
        price: 10000,
        category: 'Services',
      };

      const mockProduct = {
        id: 'product123',
        ...payload,
        tags: [],
        productImages: [],
        images: [],
      };

      mockPrisma.product.create.mockResolvedValue(mockProduct);

      const result = await createProduct('vendor123', payload);

      expect(result.images).toEqual([]);
      expect(result.primaryImage).toBeNull();
    });
  });

  describe('listProducts', () => {
    it('should list products with pagination', async () => {
      const mockProducts = [
        {
          id: 'prod1',
          title: 'Product 1',
          price: '1000',
          productImages: [{ url: '/img1.jpg', isPrimary: true }],
        },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.product.count.mockResolvedValue(50);

      const result = await listProducts({ skip: 0, limit: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(50);
      expect(result.items[0].price).toBe(1000);
    });

    it('should filter by vendorId', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      await listProducts({ skip: 0, limit: 10 }, { vendorId: 'vendor123' });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ vendorId: 'vendor123' }),
        })
      );
    });
  });

  describe('getProductById', () => {
    it('should return product with images and reviews', async () => {
      const mockProduct = {
        id: 'product123',
        title: 'Test Product',
        price: '5000',
        productImages: [{ url: '/img.jpg', isPrimary: true }],
        reviews: [{ id: 'review1', rating: 5 }],
      };

      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);

      const result = await getProductById('product123');

      expect(result.id).toBe('product123');
      expect(result.price).toBe(5000);
    });

    it('should throw 404 if product not found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(getProductById('nonexistent')).rejects.toThrow('Product not found');
    });
  });

  describe('updateProduct', () => {
    it('should update product and add new images', async () => {
      const existing = { id: 'product123', vendorId: 'vendor123' };
      const updateData = {
        title: 'New Title',
        price: 6000,
        images: ['/new-img1.jpg'],
        tags: ['updated'],
      };

      mockPrisma.product.findUnique
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce({
          ...existing,
          ...updateData,
          productImages: [{ url: '/new-img1.jpg', isPrimary: false }],
        });

      mockPrisma.product.update.mockResolvedValue({
        ...existing,
        ...updateData,
        productImages: [],
      });

      mockPrisma.productImage.createMany.mockResolvedValue({ count: 1 });

      const result = await updateProduct('product123', 'vendor123', updateData);

      expect(mockPrisma.product.update).toHaveBeenCalled();
    });

    it('should throw 403 if vendor does not own product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'product123',
        vendorId: 'different-vendor',
      });

      await expect(
        updateProduct('product123', 'vendor123', { title: 'New' })
      ).rejects.toThrow('Operation not permitted');
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'product123',
        vendorId: 'vendor123',
      });
      mockPrisma.product.delete.mockResolvedValue({});

      const result = await deleteProduct('product123', 'vendor123');

      expect(result).toBe(true);
    });

    it('should throw 404 if product not found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(deleteProduct('nonexistent', 'vendor123')).rejects.toThrow(
        'Product not found'
      );
    });
  });
});