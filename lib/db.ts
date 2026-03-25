import mysql, { type Pool } from "mysql2/promise"

let pool: Pool | null = null

export function getDbPool() {
  if (pool) return pool

  const databaseUrl =
    process.env.DATABASE_URL ||
    process.env.TIDB_DATABASE_URL ||
    process.env.MYSQL_URL ||
    process.env.DB_URL

  if (!databaseUrl) {
    throw new Error("Database URL is not set. Use DATABASE_URL (or TIDB_DATABASE_URL / MYSQL_URL / DB_URL).")
  }

  pool = mysql.createPool({
    uri: databaseUrl,
    connectionLimit: 10,
    enableKeepAlive: true,
    waitForConnections: true,
    queueLimit: 0,
    ssl: {},
  })

  return pool
}
