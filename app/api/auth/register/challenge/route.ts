import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { generateRegistrationOptions } from "@simplewebauthn/server"
import { getAuthenticatedUserId } from "@/lib/auth-middleware"
import { getCredentialsByUserId, saveChallenge } from "@/lib/passkey-db"

const RP_NAME = process.env.RP_NAME || "Portfolio Admin"
const RP_ID = process.env.RP_ID || "localhost"

export async function POST(request: NextRequest) {
  try {
    const authenticatedUserId = getAuthenticatedUserId(request)
    if (!authenticatedUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await request.json().catch(() => ({}))) as {
      userId?: string
      userName?: string
    }
    const userId = body.userId || authenticatedUserId
    const userName = body.userName || "Admin User"

    if (userId !== authenticatedUserId) {
      return NextResponse.json({ error: "Unauthorized user" }, { status: 403 })
    }

    const existingCredentials = await getCredentialsByUserId(userId)

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userName,
      userID: Buffer.from(userId, "utf8"),
      attestationType: "none",
      excludeCredentials: existingCredentials.map((cred) => ({
        id: cred.credentialId,
        transports: cred.transports || undefined,
      })),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
    })

    const challengeId = randomUUID()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    await saveChallenge({
      id: challengeId,
      challenge: options.challenge,
      userId,
      type: "registration",
      expiresAt,
    })

    return NextResponse.json({ options, challengeId })
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to generate registration challenge: ${(error as Error).message}` },
      { status: 500 },
    )
  }
}
