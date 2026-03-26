import { NextRequest, NextResponse } from "next/server"

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
])

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function validateSourceUrl(rawUrl: string): URL {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    throw new Error("Invalid image URL")
  }

  if (parsed.protocol !== "https:") {
    throw new Error("Only https image URLs are allowed")
  }

  if (!parsed.hostname.endsWith(".supabase.co")) {
    throw new Error("Only Supabase image URLs are allowed")
  }

  if (!parsed.pathname.includes("/storage/v1/object/")) {
    throw new Error("Invalid Supabase storage URL")
  }

  return parsed
}

function inferImageContentType(pathname: string): string {
  const cleanPath = pathname.split("?")[0].toLowerCase()
  if (cleanPath.endsWith(".png")) return "image/png"
  if (cleanPath.endsWith(".webp")) return "image/webp"
  if (cleanPath.endsWith(".gif")) return "image/gif"
  if (cleanPath.endsWith(".avif")) return "image/avif"
  if (cleanPath.endsWith(".svg")) return "image/svg+xml"
  return "image/jpeg"
}

function parseSupabaseObjectPath(url: URL): { bucket: string; objectPath: string } | null {
  const match = url.pathname.match(/^\/storage\/v1\/object\/(?:public|authenticated|sign)\/([^/]+)\/(.+)$/)
  if (!match) return null
  return {
    bucket: decodeURIComponent(match[1]),
    objectPath: match[2],
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sourceUrl = searchParams.get("url")
    if (!sourceUrl) {
      return NextResponse.json({ error: "url query parameter is required" }, { status: 400 })
    }

    const validatedSource = validateSourceUrl(sourceUrl)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
    const objectMeta = parseSupabaseObjectPath(validatedSource)

    const candidates: Array<{ url: string; headers?: HeadersInit }> = [
      { url: validatedSource.toString() },
    ]

    if (serviceRoleKey && objectMeta) {
      const authHeaders = {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
      }
      const encodedBucket = encodeURIComponent(objectMeta.bucket)
      candidates.push({
        url: `${validatedSource.origin}/storage/v1/object/authenticated/${encodedBucket}/${objectMeta.objectPath}`,
        headers: authHeaders,
      })
      candidates.push({
        url: `${validatedSource.origin}/storage/v1/object/${encodedBucket}/${objectMeta.objectPath}`,
        headers: authHeaders,
      })
    }

    let selectedBody: ArrayBuffer | null = null
    let selectedContentType = ""

    for (const candidate of candidates) {
      const upstream = await fetch(candidate.url, {
        method: "GET",
        headers: candidate.headers,
        cache: "no-store",
      })

      if (!upstream.ok) {
        continue
      }

      const upstreamContentType = upstream.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() || ""
      const body = await upstream.arrayBuffer()

      if (ALLOWED_CONTENT_TYPES.has(upstreamContentType)) {
        selectedBody = body
        selectedContentType = upstreamContentType
        break
      }

      if (upstreamContentType === "application/octet-stream") {
        selectedBody = body
        selectedContentType = inferImageContentType(validatedSource.pathname)
        break
      }
    }

    if (!selectedBody) {
      return NextResponse.json({ error: "Failed to fetch upstream image" }, { status: 502 })
    }

    return new NextResponse(selectedBody, {
      status: 200,
      headers: {
        "Content-Type": selectedContentType,
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
