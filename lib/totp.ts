import crypto from "crypto"

/**
 * Decodes a standard Base32 encoded string into a Buffer.
 * Supports standard Base32 alphabet (A-Z, 2-7).
 */
function base32Decode(base32: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
  const cleaned = base32.toUpperCase().replace(/=+$/, "")
  let bits = 0
  let value = 0
  const buffer = []

  for (let i = 0; i < cleaned.length; i++) {
    const idx = alphabet.indexOf(cleaned[i])
    if (idx === -1) {
      throw new Error("Invalid base32 character")
    }
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      buffer.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }
  return Buffer.from(buffer)
}

/**
 * Generates a 6-digit TOTP token for a given Base32 secret and time step index.
 */
export function generateTOTP(secret: string, timeStepIndex: number): string {
  const key = base32Decode(secret)
  const buffer = Buffer.alloc(8)
  
  // Write 64-bit big-endian time step index to buffer
  const high = Math.floor(timeStepIndex / 0x100000000)
  const low = timeStepIndex % 0x100000000
  buffer.writeUInt32BE(high, 0)
  buffer.writeUInt32BE(low, 4)

  const hmac = crypto.createHmac("sha1", key)
  hmac.update(buffer)
  const hmacResult = hmac.digest()

  // Dynamic truncation
  const offset = hmacResult[hmacResult.length - 1] & 0xf
  const binary =
    ((hmacResult[offset] & 0x7f) << 24) |
    ((hmacResult[offset + 1] & 0xff) << 16) |
    ((hmacResult[offset + 2] & 0xff) << 8) |
    (hmacResult[offset + 3] & 0xff)

  const otp = binary % 1000000
  return otp.toString().padStart(6, "0")
}

/**
 * Timing-safe string comparison for two equal-length numeric strings.
 * Prevents timing attacks on the 6-digit verification code.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

/**
 * Verifies a given TOTP code against a Base32 secret.
 * Returns the matching successfully verified time step index if valid, or null if invalid.
 * Supports standard 30-second steps and a customizable clock drift window.
 */
export function verifyTOTPWithStep(
  secret: string,
  code: string,
  windowSeconds = 30
): number | null {
  try {
    const secretKey = secret.replace(/\s+/g, "") // remove whitespace
    const cleanCode = code.trim().replace(/\s+/g, "")
    if (cleanCode.length !== 6) return null

    const timeStep = 30
    const now = Math.floor(Date.now() / 1000)
    const currentTimeStepIndex = Math.floor(now / timeStep)
    const windowSteps = Math.floor(windowSeconds / timeStep)

    // Check currentTimeStep +/- windowSteps to support slight clock drift
    for (let i = -windowSteps; i <= windowSteps; i++) {
      const stepIndex = currentTimeStepIndex + i
      const candidate = generateTOTP(secretKey, stepIndex)
      if (timingSafeEqual(candidate, cleanCode)) {
        return stepIndex
      }
    }
    return null
  } catch (error) {
    console.error("TOTP verification error:", error)
    return null
  }
}
