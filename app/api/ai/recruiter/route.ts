import { NextRequest, NextResponse } from "next/server"
import { getBlogBySlugFromDb, getAllBlogsFromDb } from "@/lib/blogs-db"
import { authRateLimitConfig, enforceRateLimit } from "@/lib/rate-limit"
import { callGeminiJson, type GeminiAiRequest } from "@/lib/gemini"
import { portfolioProfile, portfolioProjects, recruiterContacts } from "@/lib/portfolio-data"

export const dynamic = "force-dynamic"

function buildProjectContext() {
  return portfolioProjects.map((project) => ({
    title: project.title,
    tag: project.tag,
    summary: project.summary,
    stack: project.stack,
    status: project.status,
    recruiterNote: project.recruiterNote,
    repoUrl: project.repoUrl,
    liveUrl: project.liveUrl || null,
  }))
}

function buildBlogContext(blogs: Awaited<ReturnType<typeof getAllBlogsFromDb>>) {
  return blogs.slice(0, 10).map((blog) => ({
    slug: blog.slug,
    title: blog.title,
    excerpt: blog.excerpt,
    tags: blog.tags,
    publishedAt: blog.publishedAt,
    readTime: blog.readTime,
  }))
}

function buildSystemInstruction() {
  return [
    "You are a compact recruiter chat assistant for Kartavya Gore's portfolio.",
    "Only use the portfolio data, project data, and blog data provided in the prompt.",
    "Infer the user's intent from the question and answer in the most useful recruiter-friendly way.",
    "If the user asks for a recommendation, choose the strongest project.",
    "If the user asks for a blog summary, summarize the most relevant blog.",
    "If the user asks for a search, return the closest matching projects or blogs.",
    "If the user asks for an intro, write a short recruiter-facing intro.",
    "Return valid JSON only.",
  ].join(" ")
}

function buildPrompt(body: GeminiAiRequest, context: {
  profile: typeof portfolioProfile
  projects: ReturnType<typeof buildProjectContext>
  blogs: ReturnType<typeof buildBlogContext>
  selectedBlog?: { slug: string; title: string; excerpt: string; content: string; readTime: string; tags: string[] } | null
}) {
  const baseContext = {
    profile: context.profile,
    contact: recruiterContacts,
    projects: context.projects,
    blogs: context.blogs,
  }

  return JSON.stringify(
    {
      task: "Answer recruiter questions about Kartavya's portfolio.",
      query: body.query || "What should a recruiter know about this portfolio?",
      blogContext: context.selectedBlog || null,
      outputShape: {
        answer: "A concise answer with bullets if needed.",
        summary: "Optional summary when relevant.",
        shortIntro: "Optional short intro when relevant.",
        projectMatches: [{ title: "Project title", relevance: "high", reason: "why it fits" }],
        blogMatches: [{ title: "Blog title", slug: "blog-slug", relevance: "high", reason: "why it matches" }],
        keyTakeaways: ["Optional highlights"],
        recruiterAngle: "Why this matters for recruiters.",
      },
      portfolio: baseContext,
    },
    null,
    2,
  )
}

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, authRateLimitConfig().aiAssistant)
  if (limited) {
    return limited
  }

  const body = (await request.json().catch(() => null)) as GeminiAiRequest | null
  if (!body?.query?.trim()) {
    return NextResponse.json({ error: "query is required" }, { status: 400 })
  }

  const blogs = await getAllBlogsFromDb()
  let selectedBlog = null
  const normalizedQuery = body.query.toLowerCase()
  if (body.blogSlug) {
    const blog = await getBlogBySlugFromDb(body.blogSlug)
    if (blog) {
      selectedBlog = {
        slug: blog.slug,
        title: blog.title,
        excerpt: blog.excerpt,
        content: body.blogText?.trim() || blog.content,
        readTime: blog.readTime,
        tags: blog.tags,
      }
    }
  } else if (body.blogText?.trim()) {
    selectedBlog = {
      slug: "custom-text",
      title: "Custom text",
      excerpt: body.query,
      content: body.blogText.trim(),
      readTime: "custom text",
      tags: [],
    }
  } else if (normalizedQuery.includes("summar") || normalizedQuery.includes("blog")) {
    const latestBlog = blogs[0]
    if (latestBlog) {
      const fullBlog = await getBlogBySlugFromDb(latestBlog.slug)
      if (fullBlog) {
        selectedBlog = {
          slug: fullBlog.slug,
          title: fullBlog.title,
          excerpt: fullBlog.excerpt,
          content: fullBlog.content,
          readTime: fullBlog.readTime,
          tags: fullBlog.tags,
        }
      }
    }
  }

  try {
    const result = await callGeminiJson(
      buildPrompt(body, {
        profile: portfolioProfile,
        projects: buildProjectContext(),
        blogs: buildBlogContext(blogs),
        selectedBlog,
      }),
      buildSystemInstruction(),
    )

    return NextResponse.json({
      ok: true,
      mode: body.mode,
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      result,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
