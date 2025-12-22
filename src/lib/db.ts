import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import fs from "fs";

// Determine the database path
function getDatabasePath(): string {
  // In Docker production, use /app/data
  const prodPath = "/app/data/photobook.db";
  const devPath = "./photobook.db";

  // Check if we're in Docker (production container)
  if (process.env.NODE_ENV === "production" && fs.existsSync("/app/data")) {
    return prodPath;
  }

  // Development or build time
  return devPath;
}

const dbPath = getDatabasePath();

// Create Prisma adapter with file path
const adapter = new PrismaBetterSqlite3({ url: dbPath });

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
