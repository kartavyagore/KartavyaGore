import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import {
  verifyRegistrationResponse,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server"
import { getChallenge, deleteChallenge, saveCredential } from "@/lib/passkey-db"
import { generateToken } from "@/lib/auth-tokens"
import { getAuthenticatedUserId, setAuthCookie } from "@/lib/auth-middleware"

const RP_ID = process.env.RP_ID || "localhost"
const ORIGIN = process.env.NEXT_PUBLIC_ORIGIN || "http://localhost:3000"

export async function POST(request: NextRequest) {
  try {
    const authenticatedUserId = getAuthenticatedUserId(request)
    if (!authenticatedUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await request.json()) as {
      response: RegistrationResponseJSON
      challengeId: string
      deviceName?: string
    }

    if (!body.challengeId || !body.response) {
      return NextResponse.json(
        { error: "challengeId and response are required" },
        { status: 400 },
      )
    }

    const challengeData = await getChallenge(body.challengeId)
    if (!challengeData || challengeData.type !== "registration") {
      return NextResponse.json({ error: "Invalid or expired challenge" }, { status: 400 })
    }
    if (!challengeData.userId || challengeData.userId !== authenticatedUserId) {
      return NextResponse.json({ error: "Unauthorized challenge" }, { status: 403 })
    }

    const verification = await verifyRegistrationResponse({
      response: body.response,
      expectedChallenge: challengeData.challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: true,
    })

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ error: "Registration verification failed" }, { status: 400 })
    }

    const { credential } = verification.registrationInfo

    await saveCredential({
      id: randomUUID(),
      userId: challengeData.userId,
      credentialId: credential.id,
      publicKey: Buffer.from(credential.publicKey).toString("base64"),
      counter: credential.counter,
      transports: body.response.response.transports,
      deviceName: body.deviceName?.trim() || "Unnamed Device",
    })

    await deleteChallenge(body.challengeId)

    const token = generateToken(challengeData.userId)
    const response = NextResponse.json({ ok: true, verified: true })
    setAuthCookie(response, token)
    return response
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to verify registration: ${(error as Error).message}` },
      { status: 500 },
    )
  }
}
