import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";
import { env } from "./env";

/**
 * Prisma Client Singleton for Serverless Environments (Vercel)
 *
 * Prisma 7+ uses adapter-based connections. This setup uses @prisma/adapter-pg
 * to connect to PostgreSQL.
 *
 * Key points:
 * - globalThis persists across module reloads in Node.js
 * - We cache in BOTH development and production for Vercel serverless
 * - The pg Pool is configured for serverless (limited connections)
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: pg.Pool | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = env.databaseUrl;

  const isProduction = env.nodeEnv === "production";

  // Create or reuse pg Pool - optimized for serverless
  const pool =
    globalForPrisma.pool ??
    new pg.Pool({
      connectionString,
      // Serverless-optimized settings
      max: isProduction ? 5 : 10, // Fewer connections in production serverless
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

  // Cache the pool
  if (!globalForPrisma.pool) {
    globalForPrisma.pool = pool;
  }

  // Create Prisma adapter with the pg pool
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: isProduction ? ["error", "warn"] : ["query", "info", "warn", "error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}
