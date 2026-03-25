import { getDbPool } from "@/lib/db"
import type { BlogPost, BlogRow } from "@/lib/blogs"

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

function parseContent(content: string): string[] {
  if (!content) return []
  try {
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed)) return parsed.map((p) => String(p))
  } catch {
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
  }
  return []
}

function mapBlogRow(row: BlogRow): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    publishedAt: formatDate(row.published_at),
    readTime: row.read_time || "5 min read",
    tags: parseTags(row.tags),
    content: parseContent(row.content),
  }
}

export async function getAllBlogsFromDb() {
  const pool = getDbPool()
  const [rows] = await pool.query<BlogRow[]>(
    "SELECT slug, title, excerpt, content, published_at, read_time, tags FROM blogs ORDER BY COALESCE(published_at, created_at) DESC",
  )
  return rows.map(mapBlogRow)
}

export async function getBlogBySlugFromDb(slug: string) {
  const pool = getDbPool()
  const [rows] = await pool.query<BlogRow[]>(
    "SELECT slug, title, excerpt, content, published_at, read_time, tags FROM blogs WHERE slug = ? LIMIT 1",
    [slug],
  )
  if (!rows[0]) return null
  return mapBlogRow(rows[0])
}

export async function createBlogInDb(input: {
  slug: string
  title: string
  excerpt: string
  content: string[]
  tags: string[]
  readTime: string
  publishedAt?: string
}) {
  const pool = getDbPool()
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

export async function updateBlogInDb(
  slug: string,
  input: {
    title: string
    excerpt: string
    content: string[]
    tags: string[]
    readTime: string
  },
) {
  const pool = getDbPool()
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

export async function deleteBlogFromDb(slug: string) {
  const pool = getDbPool()
  await pool.query("DELETE FROM blogs WHERE slug = ?", [slug])
}
