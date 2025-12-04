import { prisma } from '../lib/prisma.js';

const formatJob = (job) => ({
  ...job,
  budget: Number(job.budget),
});

export const createJob = async (vendorId, payload) => {
  const job = await prisma.job.create({
    data: {
      ...payload,
      vendor: { connect: { id: vendorId } },
    },
  });
  return formatJob(job);
};

export const listJobs = async ({ skip, limit }, filters = {}) => {
  const where = {};
  if (filters.vendorId) {
    where.vendorId = filters.vendorId;
  }
  if (filters.status) {
    where.status = filters.status;
  }

  const [items, total] = await Promise.all([
    prisma.job.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.job.count({ where }),
  ]);
  return {
    items: items.map(formatJob),
    total,
  };
};

export const getJobById = async (id) => {
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) {
    const error = new Error('Job not found');
    error.status = 404;
    throw error;
  }
  return formatJob(job);
};

export const updateJob = async (id, vendorId, data) => {
  const existing = await prisma.job.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Job not found');
    error.status = 404;
    throw error;
  }
  if (existing.vendorId !== vendorId) {
    const error = new Error('Operation not permitted');
    error.status = 403;
    throw error;
  }
  const updated = await prisma.job.update({
    where: { id },
    data,
  });
  return formatJob(updated);
};

export const deleteJob = async (id, vendorId) => {
  const existing = await prisma.job.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Job not found');
    error.status = 404;
    throw error;
  }
  if (existing.vendorId !== vendorId) {
    const error = new Error('Operation not permitted');
    error.status = 403;
    throw error;
  }
  await prisma.job.delete({ where: { id } });
  return true;
};

