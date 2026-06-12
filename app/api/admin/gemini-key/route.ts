import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUserId } from "@/lib/auth-middleware"
import { clearGeminiApiKey, getGeminiKeyStatus, saveGeminiApiKey } from "@/lib/gemini"

function isAuthorized(request: NextRequest) {
  return getAuthenticatedUserId(request) === "admin"
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const status = await getGeminiKeyStatus()
  return NextResponse.json(status)
}

export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as { apiKey?: string } | null
  const apiKey = body?.apiKey?.trim()
  if (!apiKey) {
    return NextResponse.json({ error: "Gemini API key is required" }, { status: 400 })
  }

  await saveGeminiApiKey(apiKey)
  const status = await getGeminiKeyStatus()
  return NextResponse.json({ ok: true, ...status })
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await clearGeminiApiKey()
  return NextResponse.json({ ok: true })
}
