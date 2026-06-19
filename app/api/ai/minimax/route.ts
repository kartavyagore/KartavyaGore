import { NextRequest, NextResponse } from "next/server"
import { callMiniMax, getMiniMaxConfig } from "@/lib/minimax"
import { authRateLimitConfig, enforceRateLimit } from "@/lib/rate-limit"
import { portfolioProfile, portfolioProjects, recruiterContacts } from "@/lib/portfolio-data"

export const dynamic = "force-dynamic"

type MiniMaxAiRequest = {
  query: string
  context?: {
    profile?: typeof portfolioProfile
    topProjects?: Array<{
      title: string
      summary: string
      tag: string
      stack: string[]
      recruiterNote?: string
    }>
    blogs?: Array<{ title: string; slug: string; excerpt: string; tags: string[] }>
  }
}

function buildSystemInstruction() {
  return [
    "You are Kartavya Gore's compact recruiter chat assistant.",
    "You only know what the user has provided in the prompt: Kartavya's profile, top projects, and recent blog excerpts.",
    "Be concise, recruiter-friendly, and direct. Use short bullets when listing projects or skills.",
    "If a question cannot be answered from the provided context, say so plainly and suggest what the recruiter should ask next.",
    "Do not invent experience, employers, or skills that are not in the provided context.",
    "Respond in plain text — no JSON, no markdown code fences.",
  ].join(" ")
}

function buildPrompt(body: MiniMaxAiRequest) {
  const context = body.context || {}
  const profile = context.profile || portfolioProfile
  const topProjects = context.topProjects || portfolioProjects.slice(0, 4).map((project) => ({
    title: project.title,
    summary: project.summary,
    tag: project.tag,
    stack: project.stack,
    recruiterNote: project.recruiterNote,
  }))
  const blogs = context.blogs || []

  return [
    `Recruiter question: ${body.query.trim()}`,
    "",
    "## Profile",
    JSON.stringify(profile, null, 2),
    "",
    "## Contact",
    JSON.stringify(recruiterContacts, null, 2),
    "",
    "## Top projects",
    JSON.stringify(topProjects, null, 2),
    "",
    "## Recent blog excerpts",
    JSON.stringify(blogs, null, 2),
  ].join("\n")
}

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, authRateLimitConfig().aiAssistant)
  if (limited) {
    return limited
  }

  const config = getMiniMaxConfig()
  if (!config.configured) {
    return NextResponse.json(
      { error: "NVIDIA_API_KEY is not configured on the server." },
      { status: 503 },
    )
  }

  const body = (await request.json().catch(() => null)) as MiniMaxAiRequest | null
  if (!body?.query?.trim()) {
    return NextResponse.json({ error: "query is required" }, { status: 400 })
  }

  try {
    const completion = await callMiniMax({
      systemInstruction: buildSystemInstruction(),
      prompt: buildPrompt(body),
    })

    return NextResponse.json({
      ok: true,
      model: completion.model,
      result: {
        answer: completion.content,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    )
  }
}
