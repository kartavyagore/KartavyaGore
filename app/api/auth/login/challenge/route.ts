import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { generateAuthenticationOptions } from "@simplewebauthn/server"
import { getCredentialsByUserId, saveChallenge } from "@/lib/passkey-db"
import { authRateLimitConfig, enforceRateLimit } from "@/lib/rate-limit"

const RP_ID = process.env.RP_ID || "localhost"

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = enforceRateLimit(request, authRateLimitConfig().passkeyChallenge)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const body = (await request.json().catch(() => ({}))) as { userId?: string }
    const userId = body.userId || "admin"

    if (userId !== "admin") {
      return NextResponse.json({ error: "Unauthorized user" }, { status: 403 })
    }

    const credentials = await getCredentialsByUserId(userId)
    if (credentials.length === 0) {
      return NextResponse.json(
        { error: "No passkeys registered for this user" },
        { status: 404 },
      )
    }

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials: credentials.map((cred) => ({
        id: cred.credentialId,
        transports: cred.transports || undefined,
      })),
      userVerification: "preferred",
    })

    const challengeId = randomUUID()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)
    await saveChallenge({
      id: challengeId,
      challenge: options.challenge,
      userId,
      type: "authentication",
      expiresAt,
    })

    return NextResponse.json({ options, challengeId })
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to generate authentication challenge: ${(error as Error).message}` },
      { status: 500 },
    )
  }
}
