/**
 * Encrypted key storage in the `app_settings` MySQL table.
 * Shared by the Gemini and MiniMax admin flows — each key is one row,
 * identified by `setting_key` (e.g. "gemini_api_key", "nvidia_api_key").
 *
 * The table is created on first use (CREATE TABLE IF NOT EXISTS) and the
 * values are encrypted at rest with AES-256-GCM using the same secret as
 * the rest of the app (GEMINI_KEY_SECRET, falling back to JWT_SECRET /
 * BLOG_ADMIN_SECRET).
 */
import crypto from "crypto"
import type { RowDataPacket } from "mysql2"
import { getDbPool } from "./db"

const TABLE_NAME = "app_settings"

interface AppSettingRow extends RowDataPacket {
  setting_key: string
  encrypted_value: string
}

function getEncryptionSecret() {
  const secret = process.env.GEMINI_KEY_SECRET || process.env.JWT_SECRET || process.env.BLOG_ADMIN_SECRET
  if (!secret) {
    throw new Error("GEMINI_KEY_SECRET (or JWT_SECRET / BLOG_ADMIN_SECRET) is not set")
  }
  return secret
}

function getCipherKey() {
  return crypto.createHash("sha256").update(getEncryptionSecret()).digest()
}

function encryptApiKey(apiKey: string) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv("aes-256-gcm", getCipherKey(), iv)
  const encrypted = Buffer.concat([cipher.update(apiKey, "utf8"), cipher.final()])
  const authTag = cipher.getAuthTag()
  return [iv.toString("base64"), authTag.toString("base64"), encrypted.toString("base64")].join(":")
}

function decryptApiKey(payload: string) {
  const [ivPart, authTagPart, encryptedPart] = payload.split(":")
  if (!ivPart || !authTagPart || !encryptedPart) {
    throw new Error("Invalid encrypted API key payload")
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getCipherKey(),
    Buffer.from(ivPart, "base64"),
  )
  decipher.setAuthTag(Buffer.from(authTagPart, "base64"))
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedPart, "base64")),
    decipher.final(),
  ])
  return decrypted.toString("utf8")
}

export async function ensureSettingsTable() {
  const pool = getDbPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      setting_key VARCHAR(100) PRIMARY KEY,
      encrypted_value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)
}

export type ApiKeySource = "database" | "environment" | "none"

export type ApiKeyStatus = {
  configured: boolean
  source: ApiKeySource
  preview: string | null
}

export function maskApiKey(apiKey: string) {
  const trimmed = apiKey.trim()
  if (trimmed.length <= 8) {
    return `${trimmed.slice(0, 2)}••••`
  }
  return `${trimmed.slice(0, 4)}••••${trimmed.slice(-4)}`
}

async function readStoredKey(settingKey: string) {
  await ensureSettingsTable()
  const pool = getDbPool()
  const [rows] = await pool.query<AppSettingRow[]>(
    `SELECT setting_key, encrypted_value FROM ${TABLE_NAME} WHERE setting_key = ? LIMIT 1`,
    [settingKey],
  )
  if (!rows[0]) {
    return null
  }
  return decryptApiKey(rows[0].encrypted_value)
}

async function writeStoredKey(settingKey: string, apiKey: string) {
  const trimmed = apiKey.trim()
  if (!trimmed) {
    throw new Error("API key is required")
  }
  await ensureSettingsTable()
  const pool = getDbPool()
  const encrypted = encryptApiKey(trimmed)
  await pool.query(
    `INSERT INTO ${TABLE_NAME} (setting_key, encrypted_value) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE encrypted_value = VALUES(encrypted_value)`,
    [settingKey, encrypted],
  )
}

async function deleteStoredKey(settingKey: string) {
  await ensureSettingsTable()
  const pool = getDbPool()
  await pool.query(`DELETE FROM ${TABLE_NAME} WHERE setting_key = ?`, [settingKey])
}

/**
 * Resolve an API key from (in order): database row, env var, null.
 * The `envVarName` is consulted only if no database row exists.
 */
export async function resolveApiKey(
  settingKey: string,
  envVarName: string,
): Promise<{ value: string | null; source: ApiKeySource }> {
  const stored = await readStoredKey(settingKey)
  if (stored) {
    return { value: stored, source: "database" }
  }
  const envValue = process.env[envVarName]?.trim()
  if (envValue) {
    return { value: envValue, source: "environment" }
  }
  return { value: null, source: "none" }
}

export async function getApiKeyStatus(
  settingKey: string,
  envVarName: string,
): Promise<ApiKeyStatus> {
  const { value, source } = await resolveApiKey(settingKey, envVarName)
  return {
    configured: value !== null,
    source,
    preview: value ? maskApiKey(value) : null,
  }
}

export async function saveApiKey(settingKey: string, apiKey: string): Promise<void> {
  await writeStoredKey(settingKey, apiKey)
}

export async function clearApiKey(settingKey: string): Promise<void> {
  await deleteStoredKey(settingKey)
}
