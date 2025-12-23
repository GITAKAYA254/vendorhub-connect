// Prisma client initialization
// A single PrismaClient instance is created and exported so the same
// connection pool is reused across the app (recommended pattern).
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export { prisma };


