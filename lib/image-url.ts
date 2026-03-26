export function normalizeDisplayImageUrl(value?: string | null): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null
    }
    return parsed.toString()
  } catch {
    return null
  }
}

export function toRenderableImageSrc(value?: string | null): string | null {
  const normalized = normalizeDisplayImageUrl(value)
  if (!normalized) return null

  try {
    const parsed = new URL(normalized)
    const isSupabaseStorageUrl =
      parsed.hostname.endsWith(".supabase.co") &&
      parsed.pathname.includes("/storage/v1/object/")

    if (!isSupabaseStorageUrl) {
      return parsed.toString()
    }

    const hasDownloadParam = parsed.searchParams.has("download")
    if (!hasDownloadParam) {
      parsed.searchParams.set("download", "1")
    }

    return `/api/image-proxy?url=${encodeURIComponent(parsed.toString())}`
  } catch {
    return null
  }
}
