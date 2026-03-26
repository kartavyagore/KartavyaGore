import jwt from "jsonwebtoken"

const TOKEN_EXPIRY = "7d" // 7 days

function getJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not set")
  }
  return jwtSecret
}

export interface TokenPayload {
  userId: string
  iat: number
  exp: number
}

/**
 * Generate a JWT token for authenticated user
 */
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, getJwtSecret(), {
    expiresIn: TOKEN_EXPIRY,
  })
}

/**
 * Verify and decode a JWT token
 * Returns the payload if valid, null if invalid
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as TokenPayload
    return decoded
  } catch {
    // Token is invalid or expired
    return null
  }
}

/**
 * Refresh a token (generate a new one with updated expiry)
 */
export function refreshToken(oldToken: string): string | null {
  const payload = verifyToken(oldToken)
  if (!payload) {
    return null
  }
  
  // Generate new token with same userId
  return generateToken(payload.userId)
}

/**
 * Extract token from cookie header
 */
export function extractTokenFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null
  
  const cookies = cookieHeader.split(";").map((c) => c.trim())
  const authCookie = cookies.find((c) => c.startsWith("auth_token="))
  
  if (!authCookie) return null
  
  return authCookie.split("=")[1]
}
