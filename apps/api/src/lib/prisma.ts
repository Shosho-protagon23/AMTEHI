import { PrismaClient } from '@prisma/client';
import { isProduction } from '../config/env.js';

/**
 * Singleton Prisma client. Di mode development, hindari membuat banyak instance
 * saat hot-reload dengan menyimpannya di globalThis.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProduction ? ['error'] : ['query', 'warn', 'error'],
  });

if (!isProduction) {
  globalForPrisma.prisma = prisma;
}
