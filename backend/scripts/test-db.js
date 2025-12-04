import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  try {
    await prisma.$connect();
    console.log('Prisma connected to database');
    // simple check
    const now = await prisma.$queryRaw`SELECT NOW()`;
    console.log('DB responded:', now);
  } catch (err) {
    console.error('Database connection test failed:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
