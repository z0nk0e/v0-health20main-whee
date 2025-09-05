import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HOST || "srv1850.hstgr.io",
    user: process.env.DB_USER || "u883018350_admin",
    password: process.env.DB_PASSWORD || "tR&+Cr?f]!T1",
    database: process.env.DB_NAME || "u883018350_prescribers_pd",
    port: Number.parseInt(process.env.DB_PORT || "3306"),
  },
})
