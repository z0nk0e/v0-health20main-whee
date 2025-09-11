import { drizzle } from "drizzle-orm/mysql2"
import mysql from "mysql2/promise"

export function getDb() {
  const host = process.env.DB_HOST
  const user = process.env.DB_USER
  const password = process.env.DB_PASSWORD
  const database = process.env.DB_NAME
  const port = Number.parseInt(process.env.DB_PORT || "3306")

  if (!host || !user || !password || !database) {
    throw new Error("Database configuration missing. Set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, and optionally DB_PORT.")
  }

  const pool = mysql.createPool({
    host,
    user,
    password,
    database,
    port,
    connectionLimit: 1, // For serverless, limit to 1
    connectTimeout: 5000,
  })

  return drizzle(pool)
}