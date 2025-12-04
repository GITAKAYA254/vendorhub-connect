import { prisma } from '../lib/prisma.js';

const formatProduct = (product) => ({
  ...product,
  price: Number(product.price),
  name: product.title,
  image: product.images?.[0] ?? null,
});

export const createProduct = async (vendorId, payload) => {
  const product = await prisma.product.create({
    data: {
      ...payload,
      images: payload.images ?? [],
      vendor: { connect: { id: vendorId } },
    },
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
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: items.map(formatProduct),
    total,
  };
};

export const getProductById = async (id) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    throw error;
  }
  return formatProduct(product);
};

export const updateProduct = async (id, vendorId, data) => {
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

  const updated = await prisma.product.update({
    where: { id },
    data,
  });
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

