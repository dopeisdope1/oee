// Prisma 7 config file — connection URL and seed command now live here
// instead of schema.prisma / package.json's "prisma" key (both removed).
// See prisma/schema.prisma's header comment and src/lib/prisma.ts.
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
