import { NextRequest, NextResponse } from "next/server"
import { createBlogInDb, getAllBlogsFromDb, updateBlogInDb, deleteBlogFromDb } from "@/lib/blogs-db"
import { getAuthenticatedUserId } from "@/lib/auth-middleware"

function toSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
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

    const slug = toSlug(body.title) || `blog-${Date.now()}`
    const content = (body.content || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
    const tags = (body.tags || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)

    // Automatically set published date to current date/time in MySQL format
    const now = new Date()
    const publishedAt = now.toISOString().slice(0, 19).replace("T", " ")

    await createBlogInDb({
      slug,
      title: body.title.trim(),
      excerpt: body.excerpt.trim(),
      content: content.length > 0 ? content : ["Add your detailed blog content here."],
      tags,
      readTime: body.readTime?.trim() || "5 min read",
      publishedAt,
    })

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

    const content = (body.content || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
    const tags = (body.tags || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)

    await updateBlogInDb(body.slug, {
      title: body.title.trim(),
      excerpt: body.excerpt.trim(),
      content: content.length > 0 ? content : ["Add your detailed blog content here."],
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
