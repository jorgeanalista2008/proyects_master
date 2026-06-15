// Safe dotenv import block
try {
  require("dotenv").config();
} catch (e) {
  // Silent fallback
}
import { defineConfig } from "prisma/config";

const databaseUrl = process.env.NODE_ENV === "production" 
  ? process.env.PROD_DATABASE_URL 
  : (process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
