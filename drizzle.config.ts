import type { Config } from "drizzle-kit";
import "./envConfig.ts";

export default {
  schema: "./lib/db/schema/*",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
