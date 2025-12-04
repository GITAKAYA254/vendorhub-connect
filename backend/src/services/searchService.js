import { prisma } from '../lib/prisma.js';

const buildSearchFilter = (q) => ({
  OR: [
    { title: { contains: q, mode: 'insensitive' } },
    { description: { contains: q, mode: 'insensitive' } },
    { category: { contains: q, mode: 'insensitive' } },
  ],
});

export const searchAll = async (q) => {
  const [products, jobs, tasks] = await Promise.all([
    prisma.product.findMany({
      where: buildSearchFilter(q),
      take: 10,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.job.findMany({
      where: buildSearchFilter(q),
      take: 10,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.task.findMany({
      where: buildSearchFilter(q),
      take: 10,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    products: products.map((p) => ({
      ...p,
      price: Number(p.price),
      name: p.title,
      image: p.images?.[0] ?? null,
    })),
    jobs: jobs.map((j) => ({ ...j, budget: Number(j.budget) })),
    tasks: tasks.map((t) => ({ ...t, price: Number(t.price) })),
  };
};

