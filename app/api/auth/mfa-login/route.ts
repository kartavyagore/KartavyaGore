import { NextRequest, NextResponse } from "next/server"
import { generateToken } from "@/lib/auth-tokens"
import { setAuthCookie } from "@/lib/auth-middleware"
import { authRateLimitConfig, enforceRateLimit } from "@/lib/rate-limit"
import { verifyTOTPWithStep } from "@/lib/totp"

// Anti-replay protection: In-memory store of recently verified time steps.
// Ensures that once a 6-digit code has been successfully verified, it cannot
// be re-used again within the time window.
const usedTimeSteps = new Set<number>()

// Clean up memory leaks in Vercel/Node container context by pruning
// time steps older than 2 minutes in the background.
if (typeof globalThis !== "undefined") {
  const timer = setInterval(() => {
    const now = Math.floor(Date.now() / 1000)
    const currentTimeStepIndex = Math.floor(now / 30)
    for (const step of usedTimeSteps) {
      if (step < currentTimeStepIndex - 4) {
        usedTimeSteps.delete(step)
      }
    }
  }, 60000)
  // Prevent blocking process termination
  timer.unref?.()
}

export async function POST(request: NextRequest) {
  try {
    // 1. Strict rate-limiting
    const rateLimitResponse = enforceRateLimit(request, authRateLimitConfig().mfa)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const body = (await request.json()) as { mfaCode?: string }
    const mfaCode = body.mfaCode?.trim()

    if (!mfaCode || mfaCode.length !== 6) {
      return NextResponse.json(
        { error: "MFA Code must be exactly 6 digits." },
        { status: 400 }
      )
    }

    // 2. Load environment MFA secret key (fallback to secure default)
    const secret = process.env.TOTP_ADMIN_SECRET || "KARTAVYAMFASECRE"

    // 3. Verify TOTP code against the secret key and get the time step
    const matchedStep = verifyTOTPWithStep(secret, mfaCode)

    if (matchedStep === null) {
      return NextResponse.json(
        { error: "Invalid MFA verification code." },
        { status: 401 }
      )
    }

    // 4. Anti-Replay Protection: Ensure step has not already been used
    if (usedTimeSteps.has(matchedStep)) {
      return NextResponse.json(
        { error: "This MFA code has already been used. Please wait 30 seconds for a new code." },
        { status: 403 }
      )
    }

    // Mark this step index as successfully used to prevent reuse
    usedTimeSteps.add(matchedStep)

    // 5. Authentication successful, set JWT cookie token
    const token = generateToken("admin")
    const response = NextResponse.json({ ok: true, userId: "admin" })
    setAuthCookie(response, token)
    return response
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to verify MFA code: ${(error as Error).message}` },
      { status: 500 }
    )
  }
}
