import { NextRequest, NextResponse } from "next/server"
import { generateToken } from "@/lib/auth-tokens"
import { setAuthCookie } from "@/lib/auth-middleware"

function verifyAdmin(password?: string): boolean {
  const adminSecret = process.env.BLOG_ADMIN_SECRET
  return !!adminSecret && password === adminSecret
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { adminPassword?: string }

    if (!verifyAdmin(body.adminPassword)) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid admin password" },
        { status: 401 },
      )
    }

    const token = generateToken("admin")
    const response = NextResponse.json({ ok: true, userId: "admin" })
    setAuthCookie(response, token)
    return response
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to login with password: ${(error as Error).message}` },
      { status: 500 },
    )
  }
}
