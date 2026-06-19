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
} from "@/lib/lucide-react"

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
    <section className="relative mt-20 overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-2xl backdrop-blur-xl md:p-8">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-400/[0.08] via-transparent to-transparent" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="border border-accent/20 bg-accent-soft text-foreground">AI Studio</Badge>
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Powered by Google Gemini</span>
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Recruiter tools that answer, match, summarize, and search for you.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
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
              className="gap-2 rounded-full border-border bg-muted px-4"
            >
              <KeyRound className="h-4 w-4" />
              Manage API KEY
            </Button>
            <div className="rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground">
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
            aria-label={`Switch to ${modeMeta[item].title} mode`}
            aria-pressed={mode === item}
            className={`rounded-2xl border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              mode === item
                ? "border-accent bg-accent-soft text-foreground"
                : "border-border bg-surface text-muted-foreground hover:bg-muted"
            }`}
          >
            <div className="text-sm font-semibold">{modeMeta[item].title}</div>
            <div className="mt-1 text-xs leading-5 text-muted-foreground">{modeMeta[item].description}</div>
          </button>
        ))}
      </div>

      <div className="relative mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border bg-card text-foreground">
          <CardHeader>
            <CardTitle className="text-xl">{modeMeta[mode].title}</CardTitle>
            <CardDescription className="text-muted-foreground">{modeMeta[mode].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === "summary" ? (
              <div className="grid gap-4">
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Choose a blog</span>
                  <select
                    value={selectedBlogSlug}
                    onChange={(e) => setSelectedBlogSlug(e.target.value)}
                    aria-label="Choose a blog post"
                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Or paste custom text</span>
                  <textarea
                    value={customBlogText}
                    onChange={(e) => setCustomBlogText(e.target.value)}
                    placeholder="Paste a long blog section or a draft here..."
                    rows={6}
                    aria-label="Custom blog text"
                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm leading-7 text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-accent"
                  />
                </label>
              </div>
            ) : (
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={currentPlaceholder}
                rows={5}
                aria-label={modeMeta[mode].title}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm leading-7 text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-accent"
              />
            )}

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={runAssistant}
                disabled={loading}
                className="gap-2 rounded-full bg-foreground px-5 text-background hover:bg-foreground/90"
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
                className="gap-2 rounded-full border-border bg-muted"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-surface p-4 text-xs text-muted-foreground">
                Ask about backend strength, security, or architecture.
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4 text-xs text-muted-foreground">
                Match the best project to a job description.
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4 text-xs text-muted-foreground">
                Summarize blogs or search the portfolio by meaning.
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Suggested prompts</div>
              <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setQuery(prompt)}
                  aria-label={`Use suggested prompt: ${prompt}`}
                  className="rounded-full border border-border bg-surface px-3 py-2 text-left text-xs leading-5 text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {prompt}
                </button>
              ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card text-foreground">
          <CardHeader>
            <CardTitle className="text-xl">AI output</CardTitle>
            <CardDescription className="text-muted-foreground">
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
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Response</div>
                    <button
                      type="button"
                      onClick={copyAnswer}
                      aria-label={copied ? "Copied" : "Copy response to clipboard"}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      Copy
                    </button>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground/80">
                    {result.answer || result.summary || result.shortIntro}
                  </p>
                </div>

                {result.summary ? (
                  <div className="rounded-2xl border border-border bg-surface p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Summary</div>
                    <p className="mt-3 text-sm leading-7 text-foreground/75">{result.summary}</p>
                  </div>
                ) : null}

                {result.shortIntro ? (
                  <div className="rounded-2xl border border-border bg-surface p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Short intro</div>
                    <p className="mt-3 text-sm leading-7 text-foreground/75">{result.shortIntro}</p>
                  </div>
                ) : null}

                {result.recruiterAngle ? (
                  <div className="rounded-2xl border border-accent/15 bg-accent-soft p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-accent">Recruiter angle</div>
                    <p className="mt-3 text-sm leading-7 text-foreground">{result.recruiterAngle}</p>
                  </div>
                ) : null}

                {result.keyTakeaways?.length ? (
                  <div className="rounded-2xl border border-border bg-surface p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Key takeaways</div>
                    <ul className="mt-3 space-y-2 text-sm leading-7 text-foreground/75">
                      {result.keyTakeaways.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {result.projectMatches?.length ? (
                  <div className="space-y-3">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Project matches</div>
                    {result.projectMatches.map((project) => (
                      <div key={project.title} className="rounded-2xl border border-border bg-surface p-4">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="font-semibold text-foreground">{project.title}</h4>
                          <Badge variant="outline" className="border-border text-muted-foreground">
                            {project.relevance}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">{project.reason}</p>
                      </div>
                    ))}
                  </div>
                ) : null}

                {result.blogMatches?.length ? (
                  <div className="space-y-3">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Blog matches</div>
                    {result.blogMatches.map((blog) => (
                      <Link
                        key={blog.slug}
                        href={`/blogs/${blog.slug}`}
                        className="block rounded-2xl border border-border bg-surface p-4 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="font-semibold text-foreground">{blog.title}</h4>
                          <Badge variant="outline" className="border-border text-muted-foreground">
                            {blog.relevance}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">{blog.reason}</p>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-sm leading-7 text-muted-foreground">
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
            className="fixed inset-0 z-[80] flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm"
            onClick={() => setShowKeyModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-lg rounded-3xl border border-border bg-surface p-6 text-foreground shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold">Manage API KEY</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    Save or replace your Google Gemini API key. It is stored encrypted in the database and only used on
                    the server.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowKeyModal(false)}
                  aria-label="Close manage API key dialog"
                  className="shrink-0"
                >
                  ×
                </Button>
              </div>

              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current status</label>
                  <div className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
                    {keyStatus?.configured
                      ? `Configured via ${keyStatus.source}${keyStatus.preview ? ` · ${keyStatus.preview}` : ""}`
                      : "No Gemini key saved yet."}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Gemini API key</label>
                  <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="Paste your Google Gemini API key"
                      aria-label="Gemini API key"
                      className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-accent"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowApiKey((value) => !value)}
                      aria-label={showApiKey ? "Hide API key" : "Show API key"}
                    >
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
                  className="gap-2 rounded-full bg-foreground px-5 text-background hover:bg-foreground/90"
                >
                  {savingKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Save key
                </Button>
                <Button variant="outline" onClick={() => setShowKeyModal(false)} className="rounded-full border-border bg-muted">
                  Cancel
                </Button>
              </div>

              <p className="mt-4 text-xs leading-6 text-muted-foreground">
                Tip: if your app uses an environment Gemini key, this database key will override it.
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}
