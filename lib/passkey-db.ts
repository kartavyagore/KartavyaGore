import { RowDataPacket, ResultSetHeader } from "mysql2"
import type { AuthenticatorTransportFuture } from "@simplewebauthn/server"
import { getDbPool } from "./db"

export interface PasskeyCredential {
  id: string
  userId: string
  credentialId: string
  publicKey: string
  counter: number
  transports: AuthenticatorTransportFuture[] | null
  deviceName: string | null
  createdAt: string
  lastUsedAt: string | null
}

interface PasskeyCredentialRow extends RowDataPacket {
  id: string
  user_id: string
  credential_id: string
  public_key: string
  counter: number
  transports: string | null
  device_name: string | null
  created_at: string
  last_used_at: string | null
}

export interface WebAuthnChallenge {
  id: string
  challenge: string
  userId: string | null
  type: "registration" | "authentication"
  createdAt: string
  expiresAt: string
}

interface WebAuthnChallengeRow extends RowDataPacket {
  id: string
  challenge: string
  user_id: string | null
  type: "registration" | "authentication"
  created_at: string
  expires_at: string
}

function parseTransports(
  transports: string | string[] | null
): AuthenticatorTransportFuture[] | null {
  const validTransports = new Set<AuthenticatorTransportFuture>([
    "ble",
    "cable",
    "hybrid",
    "internal",
    "nfc",
    "smart-card",
    "usb",
  ])

  if (!transports) return null

  if (Array.isArray(transports)) {
    const parsed = transports
      .map((t) => String(t))
      .filter((t): t is AuthenticatorTransportFuture =>
        validTransports.has(t as AuthenticatorTransportFuture)
      )
    return parsed.length > 0 ? parsed : null
  }
  try {
    const parsed = JSON.parse(transports)
    if (Array.isArray(parsed)) {
      const filtered = parsed
        .map((t) => String(t))
        .filter((t): t is AuthenticatorTransportFuture =>
          validTransports.has(t as AuthenticatorTransportFuture)
        )
      return filtered.length > 0 ? filtered : null
    }
  } catch {
    return null
  }
  return null
}

/**
 * Save a new passkey credential to database
 */
export async function saveCredential(credential: {
  id: string
  userId: string
  credentialId: string
  publicKey: string
  counter: number
  transports?: string[]
  deviceName?: string
}): Promise<void> {
  const pool = getDbPool()
  const transportsJson = credential.transports
    ? JSON.stringify(credential.transports)
    : null

  await pool.query(
    `INSERT INTO passkey_credentials 
     (id, user_id, credential_id, public_key, counter, transports, device_name)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      credential.id,
      credential.userId,
      credential.credentialId,
      credential.publicKey,
      credential.counter,
      transportsJson,
      credential.deviceName || null,
    ]
  )
}

/**
 * Get all credentials for a specific user
 */
export async function getCredentialsByUserId(
  userId: string
): Promise<PasskeyCredential[]> {
  const pool = getDbPool()
  const [rows] = await pool.query<PasskeyCredentialRow[]>(
    `SELECT * FROM passkey_credentials WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  )

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    credentialId: row.credential_id,
    publicKey: row.public_key,
    counter: row.counter,
    transports: parseTransports(row.transports),
    deviceName: row.device_name,
    createdAt: row.created_at,
    lastUsedAt: row.last_used_at,
  }))
}

/**
 * Get a credential by its credential ID
 */
export async function getCredentialById(
  credentialId: string
): Promise<PasskeyCredential | null> {
  const pool = getDbPool()
  const [rows] = await pool.query<PasskeyCredentialRow[]>(
    `SELECT * FROM passkey_credentials WHERE credential_id = ? LIMIT 1`,
    [credentialId]
  )

  if (rows.length === 0) return null

  const row = rows[0]
  return {
    id: row.id,
    userId: row.user_id,
    credentialId: row.credential_id,
    publicKey: row.public_key,
    counter: row.counter,
    transports: parseTransports(row.transports),
    deviceName: row.device_name,
    createdAt: row.created_at,
    lastUsedAt: row.last_used_at,
  }
}

/**
 * Update credential counter (for replay attack prevention)
 */
export async function updateCredentialCounter(
  credentialId: string,
  newCounter: number
): Promise<void> {
  const pool = getDbPool()
  await pool.query(
    `UPDATE passkey_credentials 
     SET counter = ?, last_used_at = NOW() 
     WHERE credential_id = ?`,
    [newCounter, credentialId]
  )
}

/**
 * Delete a credential
 */
export async function deleteCredential(id: string): Promise<boolean> {
  const pool = getDbPool()
  const [result] = await pool.query<ResultSetHeader>(
    `DELETE FROM passkey_credentials WHERE id = ?`,
    [id]
  )

  return result.affectedRows > 0
}

/**
 * Save a WebAuthn challenge temporarily
 */
export async function saveChallenge(challenge: {
  id: string
  challenge: string
  userId?: string
  type: "registration" | "authentication"
  expiresAt: Date
}): Promise<void> {
  const pool = getDbPool()
  await pool.query(
    `INSERT INTO webauthn_challenges 
     (id, challenge, user_id, type, expires_at)
     VALUES (?, ?, ?, ?, ?)`,
    [
      challenge.id,
      challenge.challenge,
      challenge.userId || null,
      challenge.type,
      challenge.expiresAt,
    ]
  )
}

/**
 * Get a challenge by ID
 */
export async function getChallenge(
  id: string
): Promise<WebAuthnChallenge | null> {
  const pool = getDbPool()
  const [rows] = await pool.query<WebAuthnChallengeRow[]>(
    `SELECT * FROM webauthn_challenges WHERE id = ? AND expires_at > NOW() LIMIT 1`,
    [id]
  )

  if (rows.length === 0) return null

  const row = rows[0]
  return {
    id: row.id,
    challenge: row.challenge,
    userId: row.user_id,
    type: row.type,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  }
}

/**
 * Delete a challenge after use
 */
export async function deleteChallenge(id: string): Promise<void> {
  const pool = getDbPool()
  await pool.query(`DELETE FROM webauthn_challenges WHERE id = ?`, [id])
}

/**
 * Clean up expired challenges (run periodically)
 */
export async function cleanupExpiredChallenges(): Promise<void> {
  const pool = getDbPool()
  await pool.query(`DELETE FROM webauthn_challenges WHERE expires_at < NOW()`)
}
