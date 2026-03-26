import { NextRequest, NextResponse } from "next/server"
import { verifyToken, extractTokenFromCookies } from "./auth-tokens"

export interface AuthenticatedRequest extends NextRequest {
  userId?: string
}

/**
 * Middleware to verify JWT token from cookies
 * Returns userId if authenticated, null if not
 */
export function getAuthenticatedUserId(request: NextRequest): string | null {
  const cookieHeader = request.headers.get("cookie")
  const token = extractTokenFromCookies(cookieHeader)

  if (!token) {
    return null
  }

  const payload = verifyToken(token)
  return payload ? payload.userId : null
}

/**
 * Require authentication middleware
 * Returns 401 if not authenticated
 */
export function requireAuth(
  request: NextRequest,
  handler: (request: NextRequest, userId: string) => Promise<NextResponse>
): Promise<NextResponse> {
  const userId = getAuthenticatedUserId(request)

  if (!userId) {
    return Promise.resolve(
      NextResponse.json(
        { error: "Unauthorized: Authentication required" },
        { status: 401 }
      )
    )
  }

  return handler(request, userId)
}

/**
 * Verify admin access (check if userId is admin)
 * For this portfolio, we only have one admin user
 */
export function isAdmin(userId: string): boolean {
  // In this simple portfolio, we only have one admin
  // The userId should be "admin" after successful authentication
  return userId === "admin"
}

/**
 * Set auth cookie with JWT token
 */
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

/**
 * Clear auth cookie (logout)
 */
export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })
}
