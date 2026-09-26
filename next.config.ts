import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma 7's generated client and the SQLite driver adapter are native /
  // generated-code packages — keep them out of the server bundle rather
  // than letting Turbopack try to process them.
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-better-sqlite3",
    "better-sqlite3",
  ],
};

export default nextConfig;
