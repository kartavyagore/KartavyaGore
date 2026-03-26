import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUserId } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  const userId = getAuthenticatedUserId(request)
  if (!userId) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
  return NextResponse.json({ authenticated: true, userId })
}
