"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@prisma/client");
const pg_1 = __importDefault(require("pg"));
const env_1 = require("./env");
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
const globalForPrisma = globalThis;
function createPrismaClient() {
    const connectionString = env_1.env.databaseUrl;
    const isProduction = env_1.env.nodeEnv === "production";
    // Create or reuse pg Pool - optimized for serverless
    const pool = globalForPrisma.pool ??
        new pg_1.default.Pool({
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
    const adapter = new adapter_pg_1.PrismaPg(pool);
    return new client_1.PrismaClient({
        adapter,
        log: isProduction ? ["error", "warn"] : ["query", "info", "warn", "error"],
    });
}
exports.prisma = globalForPrisma.prisma ?? createPrismaClient();
if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = exports.prisma;
}
//# sourceMappingURL=prisma.js.map