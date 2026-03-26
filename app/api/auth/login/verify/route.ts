import { NextRequest, NextResponse } from "next/server"
import {
  verifyAuthenticationResponse,
  type AuthenticationResponseJSON,
} from "@simplewebauthn/server"
import {
  deleteChallenge,
  getChallenge,
  getCredentialById,
  updateCredentialCounter,
} from "@/lib/passkey-db"
import { generateToken } from "@/lib/auth-tokens"
import { setAuthCookie } from "@/lib/auth-middleware"
import { authRateLimitConfig, enforceRateLimit } from "@/lib/rate-limit"

const RP_ID = process.env.RP_ID || "localhost"
const ORIGIN = process.env.NEXT_PUBLIC_ORIGIN || "http://localhost:3000"

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = enforceRateLimit(request, authRateLimitConfig().passkeyVerify)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const body = (await request.json()) as {
      response: AuthenticationResponseJSON
      challengeId: string
    }

    if (!body.challengeId || !body.response) {
      return NextResponse.json(
        { error: "challengeId and response are required" },
        { status: 400 },
      )
    }

    const challengeData = await getChallenge(body.challengeId)
    if (!challengeData || challengeData.type !== "authentication") {
      return NextResponse.json({ error: "Invalid or expired challenge" }, { status: 400 })
    }

    const credential = await getCredentialById(body.response.id)
    if (!credential) {
      return NextResponse.json({ error: "Credential not found" }, { status: 404 })
    }

    const verification = await verifyAuthenticationResponse({
      response: body.response,
      expectedChallenge: challengeData.challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: credential.credentialId,
        publicKey: Buffer.from(credential.publicKey, "base64"),
        counter: credential.counter,
        transports: credential.transports || undefined,
      },
      requireUserVerification: true,
    })

    if (!verification.verified) {
      return NextResponse.json({ error: "Authentication verification failed" }, { status: 401 })
    }

    await updateCredentialCounter(
      credential.credentialId,
      verification.authenticationInfo.newCounter,
    )
    await deleteChallenge(body.challengeId)

    const token = generateToken(credential.userId)
    const response = NextResponse.json({
      ok: true,
      verified: true,
      userId: credential.userId,
    })
    setAuthCookie(response, token)
    return response
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to verify authentication: ${(error as Error).message}` },
      { status: 500 },
    )
  }
}
