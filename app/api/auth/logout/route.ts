import { NextResponse } from "next/server"
import { clearAuthCookie } from "@/lib/auth-middleware"

export async function POST() {
  const response = NextResponse.json({ ok: true, message: "Logged out" })
  clearAuthCookie(response)
  return response
}
