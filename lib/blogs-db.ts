import { getDbPool } from "@/lib/db"
import type { BlogPost, BlogRow } from "@/lib/blogs"
import type { RowDataPacket } from "mysql2"

function formatDate(input: string | null) {
  if (!input) return "Add Date"
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return "Add Date"
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })
}

function parseTags(tags: string | null): string[] {
  if (!tags) return []
  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? parsed.map((t) => String(t)) : []
  } catch {
    return []
  }
}

function parseContent(content: string): string {
  if (!content) return ""
  try {
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed)) return parsed.map((p) => String(p)).join("\n\n")
    if (typeof parsed === "string") return parsed
  } catch {
    return content
  }
  return content
}

function mapBlogRow(row: BlogRow): BlogPost {
  const normalizedImageUrl =
    typeof row.image_url === "string" && row.image_url.trim().length > 0
      ? row.image_url.trim()
      : null

  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    imageUrl: normalizedImageUrl,
    publishedAt: formatDate(row.published_at),
    readTime: row.read_time || "5 min read",
    tags: parseTags(row.tags),
    content: parseContent(row.content),
  }
}

interface LegacyBlogRow extends RowDataPacket {
  slug: string
  title: string
  excerpt: string
  content: string
  published_at: string | null
  read_time: string | null
  tags: string | null
}

function mapLegacyBlogRow(row: LegacyBlogRow): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    imageUrl: null,
    publishedAt: formatDate(row.published_at),
    readTime: row.read_time || "5 min read",
    tags: parseTags(row.tags),
    content: parseContent(row.content),
  }
}

function isMissingColumnError(error: unknown, columnName: string): boolean {
  const err = error as { code?: string; message?: string }
  if (err?.code === "ER_BAD_FIELD_ERROR" && err?.message?.includes(columnName)) {
    return true
  }
  return Boolean(err?.message?.includes("Unknown column") && err.message.includes(columnName))
}

function isMissingImageUrlColumnError(error: unknown): boolean {
  return isMissingColumnError(error, "image_url")
}

function isMissingCoverImageUrlColumnError(error: unknown): boolean {
  return isMissingColumnError(error, "cover_image_url")
}

export async function getAllBlogsFromDb() {
  const pool = getDbPool()
  try {
    const [rows] = await pool.query<BlogRow[]>(
      "SELECT slug, title, excerpt, COALESCE(NULLIF(image_url, ''), NULLIF(cover_image_url, '')) AS image_url, content, published_at, read_time, tags FROM blogs ORDER BY COALESCE(published_at, created_at) DESC",
    )
    return rows.map(mapBlogRow)
  } catch (error) {
    const missingImage = isMissingImageUrlColumnError(error)
    const missingCover = isMissingCoverImageUrlColumnError(error)
    if (!missingImage && !missingCover) {
      throw error
    }
  }

  try {
    const [rows] = await pool.query<BlogRow[]>(
      "SELECT slug, title, excerpt, NULLIF(image_url, '') AS image_url, content, published_at, read_time, tags FROM blogs ORDER BY COALESCE(published_at, created_at) DESC",
    )
    return rows.map(mapBlogRow)
  } catch (error) {
    if (!isMissingImageUrlColumnError(error)) {
      throw error
    }
  }

  try {
    const [rows] = await pool.query<BlogRow[]>(
      "SELECT slug, title, excerpt, NULLIF(cover_image_url, '') AS image_url, content, published_at, read_time, tags FROM blogs ORDER BY COALESCE(published_at, created_at) DESC",
    )
    return rows.map(mapBlogRow)
  } catch (error) {
    if (!isMissingCoverImageUrlColumnError(error)) {
      throw error
    }

    const [legacyRows] = await pool.query<LegacyBlogRow[]>(
      "SELECT slug, title, excerpt, content, published_at, read_time, tags FROM blogs ORDER BY COALESCE(published_at, created_at) DESC",
    )
    return legacyRows.map(mapLegacyBlogRow)
  }
}

export async function getBlogBySlugFromDb(slug: string) {
  const pool = getDbPool()
  try {
    const [rows] = await pool.query<BlogRow[]>(
      "SELECT slug, title, excerpt, COALESCE(NULLIF(image_url, ''), NULLIF(cover_image_url, '')) AS image_url, content, published_at, read_time, tags FROM blogs WHERE slug = ? LIMIT 1",
      [slug],
    )
    if (!rows[0]) return null
    return mapBlogRow(rows[0])
  } catch (error) {
    const missingImage = isMissingImageUrlColumnError(error)
    const missingCover = isMissingCoverImageUrlColumnError(error)
    if (!missingImage && !missingCover) {
      throw error
    }
  }

  try {
    const [rows] = await pool.query<BlogRow[]>(
      "SELECT slug, title, excerpt, NULLIF(image_url, '') AS image_url, content, published_at, read_time, tags FROM blogs WHERE slug = ? LIMIT 1",
      [slug],
    )
    if (!rows[0]) return null
    return mapBlogRow(rows[0])
  } catch (error) {
    if (!isMissingImageUrlColumnError(error)) {
      throw error
    }
  }

  try {
    const [rows] = await pool.query<BlogRow[]>(
      "SELECT slug, title, excerpt, NULLIF(cover_image_url, '') AS image_url, content, published_at, read_time, tags FROM blogs WHERE slug = ? LIMIT 1",
      [slug],
    )
    if (!rows[0]) return null
    return mapBlogRow(rows[0])
  } catch (error) {
    if (!isMissingCoverImageUrlColumnError(error)) {
      throw error
    }

    const [legacyRows] = await pool.query<LegacyBlogRow[]>(
      "SELECT slug, title, excerpt, content, published_at, read_time, tags FROM blogs WHERE slug = ? LIMIT 1",
      [slug],
    )
    if (!legacyRows[0]) return null
    return mapLegacyBlogRow(legacyRows[0])
  }
}

export async function createBlogInDb(input: {
  slug: string
  title: string
  excerpt: string
  imageUrl?: string | null
  content: string
  tags: string[]
  readTime: string
  publishedAt?: string
}) {
  const pool = getDbPool()
  try {
    await pool.query(
      "INSERT INTO blogs (slug, title, excerpt, image_url, cover_image_url, content, tags, read_time, status, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', ?)",
      [
        input.slug,
        input.title,
        input.excerpt,
        input.imageUrl || null,
        input.imageUrl || null,
        JSON.stringify(input.content),
        JSON.stringify(input.tags),
        input.readTime,
        input.publishedAt || null,
      ],
    )
    return
  } catch (error) {
    const missingImage = isMissingImageUrlColumnError(error)
    const missingCover = isMissingCoverImageUrlColumnError(error)
    if (!missingImage && !missingCover) {
      throw error
    }
  }

  try {
    await pool.query(
      "INSERT INTO blogs (slug, title, excerpt, image_url, content, tags, read_time, status, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?)",
      [
        input.slug,
        input.title,
        input.excerpt,
        input.imageUrl || null,
        JSON.stringify(input.content),
        JSON.stringify(input.tags),
        input.readTime,
        input.publishedAt || null,
      ],
    )
    return
  } catch (error) {
    if (!isMissingImageUrlColumnError(error)) {
      throw error
    }
  }

  try {
    await pool.query(
      "INSERT INTO blogs (slug, title, excerpt, cover_image_url, content, tags, read_time, status, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?)",
      [
        input.slug,
        input.title,
        input.excerpt,
        input.imageUrl || null,
        JSON.stringify(input.content),
        JSON.stringify(input.tags),
        input.readTime,
        input.publishedAt || null,
      ],
    )
  } catch (error) {
    if (!isMissingCoverImageUrlColumnError(error)) {
      throw error
    }

    await pool.query(
      "INSERT INTO blogs (slug, title, excerpt, content, tags, read_time, status, published_at) VALUES (?, ?, ?, ?, ?, ?, 'published', ?)",
      [
        input.slug,
        input.title,
        input.excerpt,
        JSON.stringify(input.content),
        JSON.stringify(input.tags),
        input.readTime,
        input.publishedAt || null,
      ],
    )
  }
}

export async function updateBlogInDb(
  slug: string,
  input: {
    title: string
    excerpt: string
    imageUrl?: string | null
    content: string
    tags: string[]
    readTime: string
  },
) {
  const pool = getDbPool()
  try {
    await pool.query(
      "UPDATE blogs SET title = ?, excerpt = ?, image_url = ?, cover_image_url = ?, content = ?, tags = ?, read_time = ? WHERE slug = ?",
      [
        input.title,
        input.excerpt,
        input.imageUrl || null,
        input.imageUrl || null,
        JSON.stringify(input.content),
        JSON.stringify(input.tags),
        input.readTime,
        slug,
      ],
    )
    return
  } catch (error) {
    const missingImage = isMissingImageUrlColumnError(error)
    const missingCover = isMissingCoverImageUrlColumnError(error)
    if (!missingImage && !missingCover) {
      throw error
    }
  }

  try {
    await pool.query(
      "UPDATE blogs SET title = ?, excerpt = ?, image_url = ?, content = ?, tags = ?, read_time = ? WHERE slug = ?",
      [
        input.title,
        input.excerpt,
        input.imageUrl || null,
        JSON.stringify(input.content),
        JSON.stringify(input.tags),
        input.readTime,
        slug,
      ],
    )
    return
  } catch (error) {
    if (!isMissingImageUrlColumnError(error)) {
      throw error
    }
  }

  try {
    await pool.query(
      "UPDATE blogs SET title = ?, excerpt = ?, cover_image_url = ?, content = ?, tags = ?, read_time = ? WHERE slug = ?",
      [
        input.title,
        input.excerpt,
        input.imageUrl || null,
        JSON.stringify(input.content),
        JSON.stringify(input.tags),
        input.readTime,
        slug,
      ],
    )
  } catch (error) {
    if (!isMissingCoverImageUrlColumnError(error)) {
      throw error
    }

    await pool.query(
      "UPDATE blogs SET title = ?, excerpt = ?, content = ?, tags = ?, read_time = ? WHERE slug = ?",
      [
        input.title,
        input.excerpt,
        JSON.stringify(input.content),
        JSON.stringify(input.tags),
        input.readTime,
        slug,
      ],
    )
  }
}

export async function deleteBlogFromDb(slug: string) {
  const pool = getDbPool()
  await pool.query("DELETE FROM blogs WHERE slug = ?", [slug])
}

export async function hasBlogWithTitleInDb(title: string): Promise<boolean> {
  const pool = getDbPool()
  const normalizedTitle = title.trim()
  if (!normalizedTitle) return false

  const [rows] = await pool.query<Array<RowDataPacket & { count: number }>>(
    "SELECT COUNT(*) AS count FROM blogs WHERE LOWER(TRIM(title)) = LOWER(TRIM(?)) LIMIT 1",
    [normalizedTitle],
  )
  return (rows[0]?.count || 0) > 0
}
