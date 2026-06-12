import crypto from "crypto"
import type { RowDataPacket } from "mysql2"
import { getDbPool } from "./db"

interface GeminiKeyRow extends RowDataPacket {
  setting_key: string
  encrypted_value: string
}

const SETTING_KEY = "gemini_api_key"
const TABLE_NAME = "app_settings"

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
    throw new Error("Invalid encrypted Gemini key payload")
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

async function ensureSettingsTable() {
  const pool = getDbPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      setting_key VARCHAR(100) PRIMARY KEY,
      encrypted_value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)
}

export async function saveGeminiApiKey(apiKey: string): Promise<void> {
  const trimmedKey = apiKey.trim()
  if (!trimmedKey) {
    throw new Error("Gemini API key is required")
  }

  await ensureSettingsTable()
  const pool = getDbPool()
  const encrypted = encryptApiKey(trimmedKey)
  await pool.query(
    `INSERT INTO ${TABLE_NAME} (setting_key, encrypted_value) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE encrypted_value = VALUES(encrypted_value)`,
    [SETTING_KEY, encrypted],
  )
}

export async function getGeminiApiKey(): Promise<string | null> {
  await ensureSettingsTable()
  const pool = getDbPool()
  const [rows] = await pool.query<GeminiKeyRow[]>(
    `SELECT setting_key, encrypted_value FROM ${TABLE_NAME} WHERE setting_key = ? LIMIT 1`,
    [SETTING_KEY],
  )

  if (rows[0]) {
    return decryptApiKey(rows[0].encrypted_value)
  }

  const envKey = process.env.GEMINI_API_KEY?.trim()
  return envKey ? envKey : null
}

export async function getGeminiKeyStatus(): Promise<{
  configured: boolean
  source: "database" | "environment" | "none"
  preview: string | null
}> {
  await ensureSettingsTable()
  const pool = getDbPool()
  const [rows] = await pool.query<GeminiKeyRow[]>(
    `SELECT setting_key, encrypted_value FROM ${TABLE_NAME} WHERE setting_key = ? LIMIT 1`,
    [SETTING_KEY],
  )

  if (rows[0]) {
    const apiKey = decryptApiKey(rows[0].encrypted_value)
    return {
      configured: true,
      source: "database",
      preview: maskApiKey(apiKey),
    }
  }

  const envKey = process.env.GEMINI_API_KEY?.trim()
  if (envKey) {
    return {
      configured: true,
      source: "environment",
      preview: maskApiKey(envKey),
    }
  }

  return {
    configured: false,
    source: "none",
    preview: null,
  }
}

export async function clearGeminiApiKey(): Promise<void> {
  await ensureSettingsTable()
  const pool = getDbPool()
  await pool.query(`DELETE FROM ${TABLE_NAME} WHERE setting_key = ?`, [SETTING_KEY])
}

export function maskApiKey(apiKey: string): string {
  const trimmed = apiKey.trim()
  if (trimmed.length <= 8) {
    return `${trimmed.slice(0, 2)}••••`
  }
  return `${trimmed.slice(0, 4)}••••${trimmed.slice(-4)}`
}

export type GeminiMode = "copilot" | "match" | "summary" | "search" | "intro"

export type GeminiAiRequest = {
  mode: GeminiMode
  query?: string
  blogSlug?: string
  blogText?: string
  tone?: string
}

export type GeminiAiResult = {
  answer: string
  summary?: string
  shortIntro?: string
  recruiterAngle?: string
  projectMatches?: Array<{ title: string; reason: string; relevance: string }>
  blogMatches?: Array<{ title: string; slug: string; reason: string; relevance: string }>
  keyTakeaways?: string[]
  sourceTitle?: string | null
}

function parseJsonResponse(text: string) {
  const trimmed = text.trim()
  const codeFenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  const payload = codeFenceMatch ? codeFenceMatch[1].trim() : trimmed
  return JSON.parse(payload) as GeminiAiResult
}

export async function callGeminiJson(prompt: string, systemInstruction: string): Promise<GeminiAiResult> {
  const apiKey = await getGeminiApiKey()
  if (!apiKey) {
    throw new Error("Gemini API key is not configured")
  }

  const model = (process.env.GEMINI_MODEL || "gemini-2.5-flash").trim()
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1200,
          responseMimeType: "application/json",
        },
      }),
    },
  )

  const raw = (await response.json().catch(() => null)) as
    | {
        candidates?: Array<{
          content?: {
            parts?: Array<{ text?: string }>
          }
        }>
        error?: { message?: string }
      }
    | null

  if (!response.ok) {
    throw new Error(raw?.error?.message || `Gemini request failed with status ${response.status}`)
  }

  const text = raw?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new Error("Gemini returned an empty response")
  }

  return parseJsonResponse(text)
}
