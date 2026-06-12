"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Bot, Check, Copy, KeyRound, Loader2, MessageCircle, Send, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ToastContainer } from "@/components/ui/toast"
import type { BlogPost } from "@/lib/blogs"
import { portfolioProfile, portfolioProjects } from "@/lib/portfolio-data"
import type { GeminiAiResult } from "@/lib/gemini"

type Message = {
  id: number
  role: "user" | "assistant"
  content: string
  meta?: GeminiAiResult
}

type KeyStatus = {
  configured: boolean
  source: "database" | "environment" | "none"
  preview: string | null
}

export default function GlobalAiChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "Hi, I can answer questions about Kartavya's projects, blogs, strengths, and recruiter fit. Ask me anything.",
    },
  ])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [keyStatus, setKeyStatus] = useState<KeyStatus | null>(null)
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [savingKey, setSavingKey] = useState(false)
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [authChecking, setAuthChecking] = useState(true)
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: "success" | "error" | "warning" }>>([])
  const toastCounterRef = useRef(0)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const refreshAuthState = async () => {
    setAuthChecking(true)
    try {
      const authResponse = await fetch("/api/auth/verify", { credentials: "include" })
      const loggedIn = authResponse.ok
      setIsAuthenticated(loggedIn)
      setAuthReady(true)
      if (!loggedIn) {
        setKeyStatus(null)
        setShowKeyModal(false)
      } else {
        const statusResponse = await fetch("/api/admin/gemini-key", { credentials: "include" })
        if (statusResponse.ok) {
          const status = (await statusResponse.json()) as KeyStatus
          setKeyStatus(status)
        }
      }
    } finally {
      setAuthChecking(false)
    }
  }

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
        setAuthChecking(false)

        if (authResponse.ok) {
          const statusResponse = await fetch("/api/admin/gemini-key", { credentials: "include" })
          if (statusResponse.ok) {
            const status = (await statusResponse.json()) as KeyStatus
            setKeyStatus(status)
          }
        } else {
          setKeyStatus(null)
        }

        if (blogsResponse.ok) {
          const data = (await blogsResponse.json()) as { blogs?: BlogPost[] }
          if (Array.isArray(data.blogs)) {
            setBlogs(data.blogs)
          }
        }
      })
      .catch(() => {
        if (!mounted) return
        setAuthReady(true)
        setAuthChecking(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!open) return
    void refreshAuthState()
  }, [open])

  useEffect(() => {
    const handleFocus = () => {
      void refreshAuthState()
    }

    const handleVisibility = () => {
      if (!document.hidden) {
        void refreshAuthState()
      }
    }

    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, open])

  const showToast = (message: string, type: "success" | "error" | "warning" = "error") => {
    toastCounterRef.current += 1
    setToasts((prev) => [...prev, { id: toastCounterRef.current, message, type }])
  }

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const contextSummary = useMemo(() => {
    return {
      profile: portfolioProfile,
      topProjects: portfolioProjects.slice(0, 4).map((project) => ({
        title: project.title,
        summary: project.summary,
        tag: project.tag,
        stack: project.stack,
        recruiterNote: project.recruiterNote,
      })),
      blogs: blogs.slice(0, 8).map((blog) => ({
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        tags: blog.tags,
      })),
    }
  }, [blogs])

  const submitMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || loading) return

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: trimmed,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/ai/recruiter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: trimmed,
          context: contextSummary,
        }),
      })

      const data = (await response.json()) as { error?: string; result?: GeminiAiResult }
      if (!response.ok) {
        throw new Error(data.error || "AI request failed")
      }

      const answer = data.result?.answer || data.result?.summary || data.result?.shortIntro || "I couldn't generate a response."
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: answer,
          meta: data.result,
        },
      ])
      showToast("Response ready", "success")
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI request failed"
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: message,
        },
      ])
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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save Gemini API key"
      showToast(message, "error")
    } finally {
      setSavingKey(false)
    }
  }

  const copyLastAnswer = async () => {
    const lastAssistant = [...messages].reverse().find((message) => message.role === "assistant")
    if (!lastAssistant) return
    await navigator.clipboard.writeText(lastAssistant.content)
    setCopied(true)
    showToast("Copied to clipboard", "success")
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open AI chat"
        className="fixed bottom-27 right-6 z-[90] inline-flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/15 text-cyan-50 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-transform hover:scale-105"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 z-[90] w-[calc(100vw-2rem)] max-w-md overflow-hidden rounded-3xl border border-white/10 bg-black/95 shadow-[0_30px_100px_rgba(0,0,0,0.75)] backdrop-blur-xl sm:right-6"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-cyan-300" />
                <div>
                  <p className="text-sm font-semibold text-white">Kartavya's AI</p>
                  <p className="text-[11px] text-white/45">Ask about projects, blogs, or recruiter fit</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {authReady && isAuthenticated && !authChecking ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowKeyModal(true)}
                    className="h-8 rounded-full border-white/15 bg-white/5 px-3 text-[11px]"
                  >
                    <KeyRound className="mr-1 h-3.5 w-3.5" />
                    Manage API KEY
                  </Button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.08]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[58vh] space-y-4 overflow-y-auto px-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 ${
                      message.role === "user"
                        ? "bg-white text-black"
                        : "border border-white/10 bg-white/[0.04] text-white"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.meta?.projectMatches?.length ? (
                      <div className="mt-3 space-y-2">
                        {message.meta.projectMatches.slice(0, 2).map((project) => (
                          <div key={project.title} className="rounded-xl border border-white/10 bg-black/25 p-3 text-xs">
                            <div className="font-semibold text-white">{project.title}</div>
                            <div className="mt-1 text-white/65">{project.reason}</div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
              {loading ? (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/65">
                    <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              ) : null}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-white/10 p-3">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      void submitMessage()
                    }
                  }}
                  placeholder="Ask anything about the portfolio..."
                  className="h-11 flex-1 rounded-full border border-white/15 bg-white/[0.03] px-4 text-sm text-white outline-none placeholder:text-white/35"
                />
                <Button
                  type="button"
                  onClick={submitMessage}
                  disabled={loading || !input.trim()}
                  className="h-11 rounded-full bg-white px-4 text-black hover:bg-white/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                {/* <p className="text-[11px] text-white/40">
                  Gemini {keyStatus?.configured ? "connected" : "not configured yet"}
                </p> */}
                <button
                  type="button"
                  onClick={copyLastAnswer}
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] text-white/65 hover:bg-white/[0.06]"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy answer
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showKeyModal ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
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
                    Save or replace your Google Gemini API key. It is encrypted in the database and used only on the server.
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
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
