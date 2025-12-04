import { prisma } from '../lib/prisma.js';

const formatTask = (task) => ({
  ...task,
  price: Number(task.price),
});

export const createTask = async (vendorId, payload) => {
  const data = {
    ...payload,
    dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
  };
  const task = await prisma.task.create({
    data: {
      ...data,
      vendor: { connect: { id: vendorId } },
    },
  });
  return formatTask(task);
};

export const listTasks = async ({ skip, limit }, filters = {}) => {
  const where = {};
  if (filters.vendorId) {
    where.vendorId = filters.vendorId;
  }
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.priority) {
    where.priority = filters.priority;
  }

  const [items, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.task.count({ where }),
  ]);
  return {
    items: items.map(formatTask),
    total,
  };
};

export const getTaskById = async (id) => {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) {
    const error = new Error('Task not found');
    error.status = 404;
    throw error;
  }
  return formatTask(task);
};

export const updateTask = async (id, vendorId, data) => {
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Task not found');
    error.status = 404;
    throw error;
  }
  if (existing.vendorId !== vendorId) {
    const error = new Error('Operation not permitted');
    error.status = 403;
    throw error;
  }
  const payload = {
    ...data,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
  };

  const updated = await prisma.task.update({
    where: { id },
    data: payload,
  });
  return formatTask(updated);
};

export const deleteTask = async (id, vendorId) => {
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Task not found');
    error.status = 404;
    throw error;
  }
  if (existing.vendorId !== vendorId) {
    const error = new Error('Operation not permitted');
    error.status = 403;
    throw error;
  }
  await prisma.task.delete({ where: { id } });
  return true;
};

