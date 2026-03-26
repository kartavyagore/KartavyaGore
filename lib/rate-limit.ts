import { NextRequest, NextResponse } from "next/server"

type RateLimitConfig = {
  keyPrefix: string
  maxAttempts: number
  windowMs: number
}

type RateLimitState = {
  count: number
  resetAt: number
}

const attemptsStore = new Map<string, RateLimitState>()

function toPositiveNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback
  }
  return parsed
}

export function authRateLimitConfig() {
  return {
    password: {
      keyPrefix: "auth:password",
      maxAttempts: toPositiveNumber(process.env.AUTH_PASSWORD_RATE_LIMIT_MAX, 5),
      windowMs: toPositiveNumber(process.env.AUTH_PASSWORD_RATE_LIMIT_WINDOW_MS, 5 * 60 * 1000),
    },
    passkeyChallenge: {
      keyPrefix: "auth:passkey:challenge",
      maxAttempts: toPositiveNumber(process.env.AUTH_PASSKEY_CHALLENGE_RATE_LIMIT_MAX, 10),
      windowMs: toPositiveNumber(process.env.AUTH_PASSKEY_CHALLENGE_RATE_LIMIT_WINDOW_MS, 5 * 60 * 1000),
    },
    passkeyVerify: {
      keyPrefix: "auth:passkey:verify",
      maxAttempts: toPositiveNumber(process.env.AUTH_PASSKEY_VERIFY_RATE_LIMIT_MAX, 10),
      windowMs: toPositiveNumber(process.env.AUTH_PASSKEY_VERIFY_RATE_LIMIT_WINDOW_MS, 5 * 60 * 1000),
    },
    imageUpload: {
      keyPrefix: "upload:image",
      maxAttempts: toPositiveNumber(process.env.IMAGE_UPLOAD_RATE_LIMIT_MAX, 10),
      windowMs: toPositiveNumber(process.env.IMAGE_UPLOAD_RATE_LIMIT_WINDOW_MS, 5 * 60 * 1000),
    },
  }
}

function extractClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim()
    if (first) return first
  }

  const realIp = request.headers.get("x-real-ip")?.trim()
  if (realIp) return realIp

  return "unknown"
}

export function enforceRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
): NextResponse | null {
  const now = Date.now()
  const clientIp = extractClientIp(request)
  const key = `${config.keyPrefix}:${clientIp}`
  const current = attemptsStore.get(key)

  if (!current || current.resetAt <= now) {
    attemptsStore.set(key, { count: 1, resetAt: now + config.windowMs })
    return null
  }

  const nextCount = current.count + 1
  if (nextCount > config.maxAttempts) {
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000))
    return NextResponse.json(
      {
        error: `Too many requests. Try again in ${retryAfterSeconds} seconds.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
        },
      },
    )
  }

  attemptsStore.set(key, {
    count: nextCount,
    resetAt: current.resetAt,
  })
  return null
}
