import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://sms_api:sms_api_password@127.0.0.1:5432/sms",
  },
  verbose: true,
  strict: true,
});
