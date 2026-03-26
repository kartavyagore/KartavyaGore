import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUserId } from "@/lib/auth-middleware"
import { deleteCredential, getCredentialsByUserId } from "@/lib/passkey-db"

export async function GET(request: NextRequest) {
  const userId = getAuthenticatedUserId(request)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const credentials = await getCredentialsByUserId(userId)
    return NextResponse.json({
      passkeys: credentials.map((cred) => ({
        id: cred.id,
        deviceName: cred.deviceName,
        createdAt: cred.createdAt,
        lastUsedAt: cred.lastUsedAt,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to load passkeys: ${(error as Error).message}` },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  const userId = getAuthenticatedUserId(request)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    const credentials = await getCredentialsByUserId(userId)
    const owned = credentials.some((cred) => cred.id === id)
    if (!owned) {
      return NextResponse.json({ error: "Passkey not found" }, { status: 404 })
    }

    const deleted = await deleteCredential(id)
    if (!deleted) {
      return NextResponse.json({ error: "Passkey not found" }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to delete passkey: ${(error as Error).message}` },
      { status: 500 },
    )
  }
}
