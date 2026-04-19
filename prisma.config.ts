import { defineConfig } from "prisma/config";

// DATABASE_URL is set by docker-entrypoint.sh in production and by
// .env.local in development, so Prisma CLI commands (migrate deploy,
// migrate resolve, etc.) can pick it up from the environment.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
