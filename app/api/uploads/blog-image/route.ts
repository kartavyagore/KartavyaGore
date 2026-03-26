import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUserId } from "@/lib/auth-middleware"
import { authRateLimitConfig, enforceRateLimit } from "@/lib/rate-limit"

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
])

export const runtime = "nodejs"

function verifyAdmin(password?: string): boolean {
  const adminSecret = process.env.BLOG_ADMIN_SECRET
  return !!adminSecret && password === adminSecret
}

function isAuthenticated(request: NextRequest, adminPassword?: string): boolean {
  const userId = getAuthenticatedUserId(request)
  if (userId) {
    return true
  }
  return verifyAdmin(adminPassword)
}

function getEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`${name} is not configured`)
  }
  return value
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function getFileExtension(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase()
  if (fromName && /^[a-z0-9]+$/.test(fromName)) {
    return fromName
  }

  const mimeMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
  }

  return mimeMap[file.type] || "jpg"
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = enforceRateLimit(request, authRateLimitConfig().imageUpload)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const formData = await request.formData()
    const adminPassword = formData.get("adminPassword")
    const fallbackPassword = typeof adminPassword === "string" ? adminPassword : undefined

    if (!isAuthenticated(request, fallbackPassword)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 })
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported image type. Use JPG, PNG, WEBP, GIF, or AVIF." },
        { status: 400 },
      )
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image is too large. Maximum size is 5MB." },
        { status: 400 },
      )
    }

    const supabaseUrl = getEnv("SUPABASE_URL").replace(/\/+$/, "")
    const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY")
    const bucket = getEnv("SUPABASE_STORAGE_BUCKET")

    const safeName = sanitizeFileName(file.name.replace(/\.[^.]+$/, "")) || "image"
    const extension = getFileExtension(file)
    const filePath = `blogs/${Date.now()}-${randomUUID().slice(0, 8)}-${safeName}.${extension}`
    const encodedPath = filePath.split("/").map(encodeURIComponent).join("/")

    const uploadUrl = `${supabaseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedPath}`
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "true",
      },
      body: fileBuffer,
    })

    if (!uploadResponse.ok) {
      const details = await uploadResponse.text()
      return NextResponse.json(
        { error: `Supabase upload failed: ${details || uploadResponse.statusText}` },
        { status: 502 },
      )
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodedPath}`

    return NextResponse.json({ ok: true, url: publicUrl, path: filePath })
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to upload image: ${(error as Error).message}` },
      { status: 500 },
    )
  }
}
