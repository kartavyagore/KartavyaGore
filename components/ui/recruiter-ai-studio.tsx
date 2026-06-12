"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import {
  Check,
  Copy,
  KeyRound,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ToastContainer } from "@/components/ui/toast"
import type { BlogPost } from "@/lib/blogs"
import { portfolioProfile, portfolioProjects } from "@/lib/portfolio-data"
import type { GeminiAiResult, GeminiMode } from "@/lib/gemini"

type KeyStatus = {
  configured: boolean
  source: "database" | "environment" | "none"
  preview: string | null
}

const modeMeta: Record<
  GeminiMode,
  { title: string; description: string; placeholder: string; action: string }
> = {
  copilot: {
    title: "Recruiter Copilot",
    description: "Ask anything about the portfolio and get a direct answer.",
    placeholder: "What is your strongest backend project?",
    action: "Ask Copilot",
  },
  match: {
    title: "Project Matcher",
    description: "Find the best project for a specific job description or role.",
    placeholder: "Match me to a backend role that needs scalable systems.",
    action: "Match Project",
  },
  summary: {
    title: "Blog Summarizer",
    description: "Turn a blog post into a fast recruiter-friendly summary.",
    placeholder: "Summarize this blog for a recruiter.",
    action: "Summarize Blog",
  },
  search: {
    title: "Smart Search",
    description: "Search projects and blogs by meaning, not just keywords.",
    placeholder: "Find work that shows auth, security, and backend strength.",
    action: "Search Portfolio",
  },
  intro: {
    title: "Auto Intro",
    description: "Generate a polished short intro for recruiters.",
    placeholder: "Generate a concise introduction for a recruiter.",
    action: "Generate Intro",
  },
}

export default function RecruiterAIStudio() {
  const [mode, setMode] = useState<GeminiMode>("copilot")
  const [query, setQuery] = useState("")
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [selectedBlogSlug, setSelectedBlogSlug] = useState("")
  const [customBlogText, setCustomBlogText] = useState("")
  const [result, setResult] = useState<GeminiAiResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const [authReady, setAuthReady] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [keyStatus, setKeyStatus] = useState<KeyStatus | null>(null)
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [savingKey, setSavingKey] = useState(false)
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: "success" | "error" | "warning" }>>([])
  const toastCounterRef = useRef(0)

  useEffect(() => {
    let mounted = true
    Promise.all([
      fetch("/api/auth/verify", { credentials: "include" }),
      fetch("/api/blogs", { credentials: "include" }),
    ])
      .then(async ([authResponse, blogsResponse]) => {
        if (!mounted) return

        setIsAuthenticated(authResponse.ok)
        setAuthReady(true)

        if (authResponse.ok) {
          const statusResponse = await fetch("/api/admin/gemini-key", { credentials: "include" })
          if (statusResponse.ok) {
            const status = (await statusResponse.json()) as KeyStatus
            setKeyStatus(status)
          }
        }

        if (blogsResponse.ok) {
          const data = (await blogsResponse.json()) as { blogs?: BlogPost[] }
          if (Array.isArray(data.blogs)) {
            const nextBlogs = data.blogs
            setBlogs(nextBlogs)
            setSelectedBlogSlug((current) => current || nextBlogs[0]?.slug || "")
          }
        }
      })
      .catch(() => {
        if (!mounted) return
        setAuthReady(true)
      })

    return () => {
      mounted = false
    }
  }, [])

  const selectedBlog = useMemo(() => blogs.find((blog) => blog.slug === selectedBlogSlug) || null, [blogs, selectedBlogSlug])
  const suggestedPrompts = useMemo(
    () => [
      portfolioProfile.preferredIntro,
      `Show me the best project for ${portfolioProfile.strengths[0].toLowerCase()}.`,
      `What blog best explains ${portfolioProjects[0]?.title || "my backend work"}?`,
    ],
    [],
  )

  const showToast = (message: string, type: "success" | "error" | "warning" = "error") => {
    toastCounterRef.current += 1
    setToasts((prev) => [...prev, { id: toastCounterRef.current, message, type }])
  }

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const runAssistant = async () => {
    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch("/api/ai/recruiter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          query: query.trim(),
          blogSlug: selectedBlogSlug || undefined,
          blogText: customBlogText.trim() || undefined,
          tone: mode === "intro" ? "concise, polished, recruiter-friendly" : undefined,
        }),
      })

      const data = (await response.json()) as { error?: string; result?: GeminiAiResult }
      if (!response.ok) {
        throw new Error(data.error || "AI request failed")
      }

      if (!data.result) {
        throw new Error("AI response was empty")
      }

      setResult(data.result)
      showToast("AI response ready", "success")
    } catch (err) {
      const message = err instanceof Error ? err.message : "AI request failed"
      setError(message)
      showToast(message, "error")
    } finally {
      setLoading(false)
    }
  }

  const saveGeminiKey = async () => {
    if (!apiKeyInput.trim()) {
      showToast("Paste your Gemini API key first.", "warning")
      return
    }

    setSavingKey(true)
    try {
      const response = await fetch("/api/admin/gemini-key", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ apiKey: apiKeyInput.trim() }),
      })

      const data = (await response.json()) as { error?: string; configured?: boolean; source?: KeyStatus["source"]; preview?: string | null }
      if (!response.ok) {
        throw new Error(data.error || "Failed to save Gemini API key")
      }

      setKeyStatus({
        configured: Boolean(data.configured),
        source: data.source || "database",
        preview: data.preview || null,
      })
      setApiKeyInput("")
      setShowKeyModal(false)
      showToast("Gemini API key saved", "success")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save Gemini API key"
      showToast(message, "error")
    } finally {
      setSavingKey(false)
    }
  }

  const copyAnswer = async () => {
    const text = result?.answer || result?.summary || result?.shortIntro
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    showToast("Copied to clipboard", "success")
    window.setTimeout(() => setCopied(false), 1800)
  }

  const currentPlaceholder = modeMeta[mode].placeholder

  return (
    <section className="relative mt-20 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-8">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-400/[0.08] via-transparent to-transparent" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="border border-cyan-400/20 bg-cyan-400/10 text-cyan-50">AI Studio</Badge>
            <span className="text-xs uppercase tracking-[0.2em] text-white/45">Powered by Google Gemini</span>
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Recruiter tools that answer, match, summarize, and search for you.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 md:text-base">
            Use this studio to answer recruiter questions, find the best project for a role, summarize a blog, search by
            meaning, or generate a polished intro.
          </p>
        </div>

        {authReady && isAuthenticated ? (
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowKeyModal(true)}
              className="gap-2 rounded-full border-white/20 bg-white/5 px-4"
            >
              <KeyRound className="h-4 w-4" />
              Manage API KEY
            </Button>
            <div className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs text-white/55">
              {keyStatus?.configured
                ? `Gemini key active (${keyStatus.source}${keyStatus.preview ? ` · ${keyStatus.preview}` : ""})`
                : "Gemini key not configured"}
            </div>
          </div>
        ) : null}
      </div>

      <div className="relative mt-8 grid gap-3 md:grid-cols-5">
        {(["copilot", "match", "summary", "search", "intro"] as GeminiMode[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setMode(item)
              setResult(null)
              setError("")
            }}
            className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
              mode === item
                ? "border-cyan-400/30 bg-cyan-400/10 text-white"
                : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
            }`}
          >
            <div className="text-sm font-semibold">{modeMeta[item].title}</div>
            <div className="mt-1 text-xs leading-5 text-white/55">{modeMeta[item].description}</div>
          </button>
        ))}
      </div>

      <div className="relative mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/10 bg-black/35 text-white">
          <CardHeader>
            <CardTitle className="text-xl">{modeMeta[mode].title}</CardTitle>
            <CardDescription className="text-white/65">{modeMeta[mode].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === "summary" ? (
              <div className="grid gap-4">
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.18em] text-white/50">Choose a blog</span>
                  <select
                    value={selectedBlogSlug}
                    onChange={(e) => setSelectedBlogSlug(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none"
                  >
                    <option value="">Select a blog post</option>
                    {blogs.map((blog) => (
                      <option key={blog.slug} value={blog.slug}>
                        {blog.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.18em] text-white/50">Or paste custom text</span>
                  <textarea
                    value={customBlogText}
                    onChange={(e) => setCustomBlogText(e.target.value)}
                    placeholder="Paste a long blog section or a draft here..."
                    rows={6}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm leading-7 text-white outline-none placeholder:text-white/35"
                  />
                </label>
              </div>
            ) : (
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={currentPlaceholder}
                rows={5}
                className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm leading-7 text-white outline-none placeholder:text-white/35"
              />
            )}

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={runAssistant}
                disabled={loading}
                className="gap-2 rounded-full bg-white px-5 text-black hover:bg-white/90"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {modeMeta[mode].action}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setQuery("")
                  setCustomBlogText("")
                  setResult(null)
                  setError("")
                }}
                className="gap-2 rounded-full border-white/20 bg-white/5"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white/65">
                Ask about backend strength, security, or architecture.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white/65">
                Match the best project to a job description.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white/65">
                Summarize blogs or search the portfolio by meaning.
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs uppercase tracking-[0.18em] text-white/45">Suggested prompts</div>
              <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setQuery(prompt)}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-xs leading-5 text-white/70 transition-colors hover:bg-white/[0.06]"
                >
                  {prompt}
                </button>
              ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/35 text-white">
          <CardHeader>
            <CardTitle className="text-xl">AI output</CardTitle>
            <CardDescription className="text-white/65">
              {selectedBlog ? `Selected blog: ${selectedBlog.title}` : "The result will appear here."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? (
              <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-100">
                {error}
              </div>
            ) : null}

            {result ? (
              <div className="space-y-5">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs uppercase tracking-[0.18em] text-white/45">Response</div>
                    <button
                      type="button"
                      onClick={copyAnswer}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70 hover:bg-white/[0.08]"
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      Copy
                    </button>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/80">
                    {result.answer || result.summary || result.shortIntro}
                  </p>
                </div>

                {result.summary ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-white/45">Summary</div>
                    <p className="mt-3 text-sm leading-7 text-white/75">{result.summary}</p>
                  </div>
                ) : null}

                {result.shortIntro ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-white/45">Short intro</div>
                    <p className="mt-3 text-sm leading-7 text-white/75">{result.shortIntro}</p>
                  </div>
                ) : null}

                {result.recruiterAngle ? (
                  <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">Recruiter angle</div>
                    <p className="mt-3 text-sm leading-7 text-cyan-50">{result.recruiterAngle}</p>
                  </div>
                ) : null}

                {result.keyTakeaways?.length ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-white/45">Key takeaways</div>
                    <ul className="mt-3 space-y-2 text-sm leading-7 text-white/75">
                      {result.keyTakeaways.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {result.projectMatches?.length ? (
                  <div className="space-y-3">
                    <div className="text-xs uppercase tracking-[0.18em] text-white/45">Project matches</div>
                    {result.projectMatches.map((project) => (
                      <div key={project.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="font-semibold text-white">{project.title}</h4>
                          <Badge variant="outline" className="border-white/15 text-white/70">
                            {project.relevance}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm leading-7 text-white/70">{project.reason}</p>
                      </div>
                    ))}
                  </div>
                ) : null}

                {result.blogMatches?.length ? (
                  <div className="space-y-3">
                    <div className="text-xs uppercase tracking-[0.18em] text-white/45">Blog matches</div>
                    {result.blogMatches.map((blog) => (
                      <Link
                        key={blog.slug}
                        href={`/blogs/${blog.slug}`}
                        className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.06]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="font-semibold text-white">{blog.title}</h4>
                          <Badge variant="outline" className="border-white/15 text-white/70">
                            {blog.relevance}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm leading-7 text-white/70">{blog.reason}</p>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-sm leading-7 text-white/55">
                Run a prompt to see recruiter-ready answers, project matches, search results, or a short intro.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AnimatePresence>
        {showKeyModal ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
            onClick={() => setShowKeyModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-lg rounded-3xl border border-white/10 bg-black/95 p-6 text-white shadow-[0_25px_80px_rgba(0,0,0,0.55)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold">Manage API KEY</h3>
                  <p className="mt-2 text-sm leading-7 text-white/65">
                    Save or replace your Google Gemini API key. It is stored encrypted in the database and only used on
                    the server.
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowKeyModal(false)} className="shrink-0">
                  ×
                </Button>
              </div>

              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.18em] text-white/45">Current status</label>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70">
                    {keyStatus?.configured
                      ? `Configured via ${keyStatus.source}${keyStatus.preview ? ` · ${keyStatus.preview}` : ""}`
                      : "No Gemini key saved yet."}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.18em] text-white/45">Gemini API key</label>
                  <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-black/40 px-4 py-3">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="Paste your Google Gemini API key"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                    />
                    <Button variant="ghost" size="sm" onClick={() => setShowApiKey((value) => !value)}>
                      {showApiKey ? "Hide" : "Show"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={saveGeminiKey}
                  disabled={savingKey}
                  className="gap-2 rounded-full bg-white px-5 text-black hover:bg-white/90"
                >
                  {savingKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Save key
                </Button>
                <Button variant="outline" onClick={() => setShowKeyModal(false)} className="rounded-full border-white/20 bg-white/5">
                  Cancel
                </Button>
              </div>

              <p className="mt-4 text-xs leading-6 text-white/45">
                Tip: if your app uses an environment Gemini key, this database key will override it.
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}
