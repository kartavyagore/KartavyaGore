import { NextRequest, NextResponse } from "next/server"
import { createBlogInDb, getAllBlogsFromDb, updateBlogInDb, deleteBlogFromDb, getBlogBySlugFromDb, hasBlogWithTitleInDb } from "@/lib/blogs-db"
import { getAuthenticatedUserId } from "@/lib/auth-middleware"

function toSlug(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function randomSuffix() {
  return Math.random().toString(36).slice(2, 8)
}

function isDuplicateSlugError(error: unknown): boolean {
  const err = error as { code?: string; message?: string }
  if (err?.code === "ER_DUP_ENTRY" && err?.message?.includes("uk_blogs_slug")) {
    return true
  }
  return Boolean(err?.message?.toLowerCase().includes("duplicate entry") && err.message?.includes("uk_blogs_slug"))
}

async function generateAvailableSlug(title: string): Promise<string> {
  const baseSlug = toSlug(title) || "blog"
  const existing = await getBlogBySlugFromDb(baseSlug)
  if (!existing) {
    return baseSlug
  }

  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = `${baseSlug}-${randomSuffix()}`
    const taken = await getBlogBySlugFromDb(candidate)
    if (!taken) {
      return candidate
    }
  }

  return `${baseSlug}-${Date.now()}-${randomSuffix()}`
}

function normalizeImageUrl(input?: string): string | null {
  if (!input?.trim()) return null
  const value = input.trim()
  try {
    const parsed = new URL(value)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("Invalid image URL protocol")
    }
    return parsed.toString()
  } catch {
    throw new Error("imageUrl must be a valid http/https URL")
  }
}

function verifyAdmin(password?: string): boolean {
  const adminSecret = process.env.BLOG_ADMIN_SECRET
  return !!adminSecret && password === adminSecret
}

function isAuthenticated(request: NextRequest, adminPassword?: string): boolean {
  // Check JWT token first
  const userId = getAuthenticatedUserId(request)
  if (userId) {
    return true
  }

  // Fall back to password verification
  return verifyAdmin(adminPassword)
}

export async function GET() {
  try {
    const blogs = await getAllBlogsFromDb()
    return NextResponse.json({ blogs })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      title: string
      excerpt: string
      imageUrl?: string
      content?: string
      tags?: string
      readTime?: string
      adminPassword?: string
    }

    // Verify authentication (JWT or password)
    if (!isAuthenticated(request, body.adminPassword)) {
      return NextResponse.json({ error: "Unauthorized: Invalid admin password" }, { status: 401 })
    }

    if (!body.title?.trim() || !body.excerpt?.trim()) {
      return NextResponse.json({ error: "title and excerpt are required" }, { status: 400 })
    }

    const normalizedTitle = body.title.trim()
    const duplicateTitleExists = await hasBlogWithTitleInDb(normalizedTitle)
    if (duplicateTitleExists) {
      return NextResponse.json(
        { error: "A blog with this title is already published." },
        { status: 409 },
      )
    }

    const initialSlug = await generateAvailableSlug(normalizedTitle)
    const content = body.content || "Add your detailed blog content here."
    const tags = (body.tags || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)

    // Automatically set published date to current date/time in MySQL format
    const now = new Date()
    const publishedAt = now.toISOString().slice(0, 19).replace("T", " ")

    const imageUrl = normalizeImageUrl(body.imageUrl)

    const blogInput = {
      title: normalizedTitle,
      excerpt: body.excerpt.trim(),
      imageUrl,
      content,
      tags,
      readTime: body.readTime?.trim() || "5 min read",
      publishedAt,
    }

    let slug = initialSlug
    let published = false

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        await createBlogInDb({
          slug,
          ...blogInput,
        })
        published = true
        break
      } catch (error) {
        if (!isDuplicateSlugError(error)) {
          throw error
        }
        slug = `${toSlug(normalizedTitle) || "blog"}-${Date.now()}-${randomSuffix()}`
      }
    }

    if (!published) {
      throw new Error("Failed to generate a unique blog slug. Please try publishing again.")
    }

    return NextResponse.json({ ok: true, slug })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      slug: string
      title: string
      excerpt: string
      imageUrl?: string
      content?: string
      tags?: string
      readTime?: string
      adminPassword?: string
    }

    // Verify authentication (JWT or password)
    if (!isAuthenticated(request, body.adminPassword)) {
      return NextResponse.json({ error: "Unauthorized: Invalid admin password" }, { status: 401 })
    }

    if (!body.slug?.trim() || !body.title?.trim() || !body.excerpt?.trim()) {
      return NextResponse.json({ error: "slug, title and excerpt are required" }, { status: 400 })
    }

    const content = body.content || "Add your detailed blog content here."
    const tags = (body.tags || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)

    const imageUrl = normalizeImageUrl(body.imageUrl)

    await updateBlogInDb(body.slug, {
      title: body.title.trim(),
      excerpt: body.excerpt.trim(),
      imageUrl,
      content,
      tags,
      readTime: body.readTime?.trim() || "5 min read",
    })

    return NextResponse.json({ ok: true, slug: body.slug })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")
    const adminPassword = searchParams.get("adminPassword")

    // Verify authentication (JWT or password)
    if (!isAuthenticated(request, adminPassword || undefined)) {
      return NextResponse.json({ error: "Unauthorized: Invalid admin password" }, { status: 401 })
    }

    if (!slug) {
      return NextResponse.json({ error: "slug is required" }, { status: 400 })
    }

    await deleteBlogFromDb(slug)

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
