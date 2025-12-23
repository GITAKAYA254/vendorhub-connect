import { prisma } from '../lib/prisma.js';

const formatProduct = (product) => ({
  ...product,
  price: Number(product.price),
  images: product.productImages?.map((img) => img.url) || product.images || [], // Fallback to old images array
  primaryImage: product.productImages?.find((img) => img.isPrimary)?.url || product.images?.[0] || null,
});

export const createProduct = async (vendorId, payload) => {
  const { images = [], tags = [], ...data } = payload;

  // payload.images here is expected to be an array of objects { url, publicId } 
  // or strings if just urls. Let's assume controller passes structure or just urls.
  // If we just get URLs from controller:

  const imageCreateData = images.map((img, index) => ({
    url: typeof img === 'string' ? img : img.url,
    isPrimary: index === 0,
  }));

  const product = await prisma.product.create({
    data: {
      ...data,
      vendor: { connect: { id: vendorId } },
      tags,
      productImages: {
        create: imageCreateData,
      },
      // Keep legacy images array in sync if needed, or leave empty
      images: imageCreateData.map(i => i.url),
    },
    include: { productImages: true }, // Include for formatting
  });
  return formatProduct(product);
};

export const listProducts = async ({ skip, limit }, filters = {}) => {
  const where = {};
  if (filters.vendorId) {
    where.vendorId = filters.vendorId;
  }
  if (filters.category) {
    where.category = filters.category;
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { productImages: true },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: items.map(formatProduct),
    total,
  };
};

export const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { productImages: true, reviews: true },
  });
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    throw error;
  }
  return formatProduct(product);
};

export const updateProduct = async (id, vendorId, data) => {
  const { images, tags, ...updateData } = data;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Product not found');
    error.status = 404;
    throw error;
  }
  if (existing.vendorId !== vendorId) {
    const error = new Error('Operation not permitted');
    error.status = 403;
    throw error;
  }

  // Transaction to handle image updates if images provided
  // For simplicity, if images are provided, we replace all? Or append?
  // User req: "Multiple images... Drag & drop". Usually implies replacing set or adding.
  // Let's assume if 'images' is passed, we replace current set (standard PUT behavior)
  // But if it's large, we might want partial updates.
  // For now, let's just update scalar fields and tags.
  // Images handling might be complex to do in one go without specific logic (add/remove).
  // Let's handle simple add if images present.

  const updated = await prisma.product.update({
    where: { id },
    data: {
      ...updateData,
      tags: tags || undefined,
      // If images provided, we might want to add them.
      // Ideally we should have addImages/removeImages methods.
    },
    include: { productImages: true },
  });

  if (images && images.length > 0) {
    // Create new images
    await prisma.productImage.createMany({
      data: images.map(url => ({
        productId: id,
        url: typeof url === 'string' ? url : url.url,
        isPrimary: false
      }))
    });
    // Refetch
    const refetched = await prisma.product.findUnique({ where: { id }, include: { productImages: true } });
    return formatProduct(refetched);
  }

  return formatProduct(updated);
};

export const deleteProduct = async (id, vendorId) => {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Product not found');
    error.status = 404;
    throw error;
  }
  if (existing.vendorId !== vendorId) {
    const error = new Error('Operation not permitted');
    error.status = 403;
    throw error;
  }

  await prisma.product.delete({ where: { id } });
  return true;
};
