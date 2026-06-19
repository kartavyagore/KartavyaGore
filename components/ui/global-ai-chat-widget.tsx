"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Bot,
  Check,
  Copy,
  KeyRound,
  Loader2,
  Send,
  Sparkles,
  Trash,
  X,
} from "@/lib/lucide-react"

import { Button } from "@/components/ui/button"
import { ToastContainer } from "@/components/ui/toast"
import type { BlogPost } from "@/lib/blogs"
import { portfolioProfile, portfolioProjects } from "@/lib/portfolio-data"
import type { GeminiAiResult } from "@/lib/gemini"

type ChatModel = "minimax" | "gemini"

const CHAT_MODEL_STORAGE_KEY = "kg:ai-chat-model"

const chatModels: Record<ChatModel, { label: string; endpoint: string; description: string }> = {
  minimax: {
    label: "MiniMax-M3",
    endpoint: "/api/ai/minimax",
    description: "Default — MiniMax-M3 via NVIDIA.",
  },
  gemini: {
    label: "Gemini",
    endpoint: "/api/ai/recruiter",
    description: "Google Gemini with structured recruiter JSON.",
  },
}

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

type ToastVariant = "success" | "error" | "warning"

export default function GlobalAiChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [model, setModel] = useState<ChatModel>("minimax")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Hi, I can answer questions about Kartavya's projects, blogs, strengths, and recruiter fit. Ask me anything.",
    },
  ])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [geminiKeyStatus, setGeminiKeyStatus] = useState<KeyStatus | null>(null)
  const [minimaxKeyStatus, setMinimaxKeyStatus] = useState<KeyStatus | null>(null)
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [keyModalTab, setKeyModalTab] = useState<ChatModel>("minimax")
  const [geminiKeyInput, setGeminiKeyInput] = useState("")
  const [minimaxKeyInput, setMinimaxKeyInput] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [savingKey, setSavingKey] = useState(false)
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [authChecking, setAuthChecking] = useState(true)
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: ToastVariant }>>([])
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
        setGeminiKeyStatus(null)
        setMinimaxKeyStatus(null)
        setShowKeyModal(false)
      } else {
        const [geminiRes, minimaxRes] = await Promise.all([
          fetch("/api/admin/gemini-key", { credentials: "include" }),
          fetch("/api/admin/minimax-key", { credentials: "include" }),
        ])
        if (geminiRes.ok) {
          const status = (await geminiRes.json()) as KeyStatus
          setGeminiKeyStatus(status)
        }
        if (minimaxRes.ok) {
          const status = (await minimaxRes.json()) as KeyStatus
          setMinimaxKeyStatus(status)
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
          const [geminiRes, minimaxRes] = await Promise.all([
            fetch("/api/admin/gemini-key", { credentials: "include" }),
            fetch("/api/admin/minimax-key", { credentials: "include" }),
          ])
          if (geminiRes.ok) {
            const status = (await geminiRes.json()) as KeyStatus
            setGeminiKeyStatus(status)
          }
          if (minimaxRes.ok) {
            const status = (await minimaxRes.json()) as KeyStatus
            setMinimaxKeyStatus(status)
          }
        } else {
          setGeminiKeyStatus(null)
          setMinimaxKeyStatus(null)
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
    try {
      const stored = window.localStorage.getItem(CHAT_MODEL_STORAGE_KEY)
      if (stored === "minimax" || stored === "gemini") {
        setModel(stored)
      }
    } catch {
      // ignore storage errors
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(CHAT_MODEL_STORAGE_KEY, model)
    } catch {
      // ignore storage errors
    }
  }, [model])

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

    const handleOpenEvent = () => setOpen(true)
    window.addEventListener("kg:open-ai-chat", handleOpenEvent)

    return () => {
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibility)
      window.removeEventListener("kg:open-ai-chat", handleOpenEvent)
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, open])

  const showToast = (message: string, type: ToastVariant = "error") => {
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

    const activeModel = chatModels[model]

    try {
      const response = await fetch(activeModel.endpoint, {
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

      const answer =
        data.result?.answer ||
        data.result?.summary ||
        data.result?.shortIntro ||
        "I couldn't generate a response."
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

  const deleteApiKey = async () => {
    const isMiniMax = keyModalTab === "minimax"
    setSavingKey(true)
    try {
      const endpoint = isMiniMax ? "/api/admin/minimax-key" : "/api/admin/gemini-key"
      const response = await fetch(endpoint, {
        method: "DELETE",
        credentials: "include",
      })
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error || "Failed to remove API key")
      }
      if (isMiniMax) {
        setMinimaxKeyStatus({ configured: false, source: "none", preview: null })
      } else {
        setGeminiKeyStatus({ configured: false, source: "none", preview: null })
      }
      showToast(
        isMiniMax ? "NVIDIA API key removed" : "Gemini API key removed",
        "success",
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to remove API key"
      showToast(message, "error")
    } finally {
      setSavingKey(false)
    }
  }

  const saveApiKey = async () => {
    const isMiniMax = keyModalTab === "minimax"
    const value = (isMiniMax ? minimaxKeyInput : geminiKeyInput).trim()
    if (!value) {
      showToast(
        isMiniMax ? "Paste your NVIDIA API key first." : "Paste your Gemini API key first.",
        "warning",
      )
      return
    }

    setSavingKey(true)
    try {
      const endpoint = isMiniMax ? "/api/admin/minimax-key" : "/api/admin/gemini-key"
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ apiKey: value }),
      })

      const data = (await response.json()) as {
        error?: string
        configured?: boolean
        source?: KeyStatus["source"]
        preview?: string | null
      }
      if (!response.ok) {
        throw new Error(data.error || "Failed to save API key")
      }

      const nextStatus: KeyStatus = {
        configured: Boolean(data.configured),
        source: data.source || "database",
        preview: data.preview || null,
      }
      if (isMiniMax) {
        setMinimaxKeyStatus(nextStatus)
        setMinimaxKeyInput("")
      } else {
        setGeminiKeyStatus(nextStatus)
        setGeminiKeyInput("")
      }
      setShowKeyModal(false)
      showToast(
        isMiniMax ? "NVIDIA API key saved" : "Gemini API key saved",
        "success",
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save API key"
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

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-label="AI chat"
            className="fixed bottom-24 right-4 z-[90] w-[calc(100vw-2rem)] max-w-md overflow-hidden rounded-3xl border border-border bg-surface/95 shadow-2xl backdrop-blur-xl sm:right-6"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Kartavya&apos;s AI</p>
                  <p className="text-[11px] text-muted-foreground">
                    Ask about projects, blogs, or recruiter fit
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {authReady && isAuthenticated && !authChecking ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowKeyModal(true)}
                    className="h-8 rounded-full px-3 text-[11px]"
                  >
                    <KeyRound className="mr-1 h-3.5 w-3.5" />
                    Manage API KEY
                  </Button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border bg-muted text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div
              role="radiogroup"
              aria-label="AI model"
              className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2"
            >
              <Sparkles className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Model
              </span>
              <div className="ml-auto flex items-center gap-1 rounded-full border border-border bg-surface p-0.5">
                {(Object.keys(chatModels) as ChatModel[]).map((option) => {
                  const isActive = option === model
                  return (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      onClick={() => setModel(option)}
                      title={chatModels[option].description}
                      className={
                        isActive
                          ? "rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-accent-foreground transition-colors"
                          : "rounded-full px-3 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
                      }
                    >
                      {chatModels[option].label}
                    </button>
                  )
                })}
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
                        ? "bg-foreground text-background"
                        : "border border-border bg-muted text-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.meta?.projectMatches?.length ? (
                      <div className="mt-3 space-y-2">
                        {message.meta.projectMatches.slice(0, 2).map((project) => (
                          <div
                            key={project.title}
                            className="rounded-xl border border-border bg-surface p-3 text-xs"
                          >
                            <div className="font-semibold text-foreground">{project.title}</div>
                            <div className="mt-1 text-muted-foreground">{project.reason}</div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
              {loading ? (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              ) : null}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-border p-3">
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
                  aria-label="Ask a question"
                  className="h-11 flex-1 rounded-full border border-border bg-muted px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-accent"
                />
                <Button
                  type="button"
                  variant="default"
                  onClick={submitMessage}
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                  className="h-11 rounded-full px-4"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={copyLastAnswer}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
          <KeyManagerModal
            activeTab={keyModalTab}
            onTabChange={(tab) => {
              setKeyModalTab(tab)
              setShowApiKey(false)
            }}
            onClose={() => setShowKeyModal(false)}
            onSave={saveApiKey}
            onRemove={deleteApiKey}
            saving={savingKey}
            showSecret={showApiKey}
            onToggleSecret={() => setShowApiKey((value) => !value)}
            statuses={{
              gemini: geminiKeyStatus,
              minimax: minimaxKeyStatus,
            }}
            inputs={{
              gemini: geminiKeyInput,
              minimax: minimaxKeyInput,
            }}
            setInputs={{
              gemini: setGeminiKeyInput,
              minimax: setMinimaxKeyInput,
            }}
          />
        ) : null}
      </AnimatePresence>
    </>
  )
}

type KeyManagerModalProps = {
  activeTab: ChatModel
  onTabChange: (tab: ChatModel) => void
  onClose: () => void
  onSave: () => void
  onRemove: () => void
  saving: boolean
  showSecret: boolean
  onToggleSecret: () => void
  statuses: Record<ChatModel, KeyStatus | null>
  inputs: Record<ChatModel, string>
  setInputs: Record<ChatModel, (value: string) => void>
}

const KEY_TAB_LABELS: Record<ChatModel, { label: string; endpoint: string; placeholder: string }> = {
  minimax: {
    label: "NVIDIA · MiniMax-M3",
    endpoint: "integrate.api.nvidia.com",
    placeholder: "Paste your nvapi-… NVIDIA key",
  },
  gemini: {
    label: "Google · Gemini",
    endpoint: "generativelanguage.googleapis.com",
    placeholder: "Paste your Google Gemini API key",
  },
}

function KeyManagerModal({
  activeTab,
  onTabChange,
  onClose,
  onSave,
  onRemove,
  saving,
  showSecret,
  onToggleSecret,
  statuses,
  inputs,
  setInputs,
}: KeyManagerModalProps) {
  const activeMeta = KEY_TAB_LABELS[activeTab]
  const activeStatus = statuses[activeTab]
  const activeInput = inputs[activeTab]
  const setActiveInput = setInputs[activeTab]
  const storedInDatabase = activeStatus?.source === "database"

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-overlay px-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-label="Manage API keys"
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
            <h3 className="font-archive text-2xl font-bold">Manage API keys</h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              Save, replace, or remove the AI provider keys. They are encrypted in the
              database and used only on the server.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0"
          >
            ×
          </Button>
        </div>

        <div
          role="tablist"
          aria-label="AI provider"
          className="mt-6 inline-flex rounded-full border border-border bg-muted p-1"
        >
          {(Object.keys(KEY_TAB_LABELS) as ChatModel[]).map((option) => {
            const isActive = option === activeTab
            return (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(option)}
                className={
                  isActive
                    ? "rounded-full bg-foreground px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-background"
                    : "rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
                }
              >
                {option === "minimax" ? "MiniMax-M3" : "Gemini"}
              </button>
            )
          })}
        </div>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Current status · {activeMeta.label}
            </label>
            <div className="rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-foreground">
              {activeStatus?.configured
                ? `Configured via ${activeStatus.source}${activeStatus.preview ? ` · ${activeStatus.preview}` : ""}`
                : activeStatus === null
                  ? "Checking…"
                  : `No key saved yet. Falling back to env var (${activeMeta.endpoint}) — set one here to override.`}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {activeTab === "minimax" ? "NVIDIA API key" : "Gemini API key"}
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3">
              <input
                type={showSecret ? "text" : "password"}
                value={activeInput}
                onChange={(event) => setActiveInput(event.target.value)}
                placeholder={activeMeta.placeholder}
                aria-label={activeTab === "minimax" ? "NVIDIA API key" : "Gemini API key"}
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:outline-none"
              />
              <Button variant="ghost" size="sm" onClick={onToggleSecret}>
                {showSecret ? "Hide" : "Show"}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            type="button"
            variant="default"
            onClick={onSave}
            disabled={saving || !activeInput.trim()}
            className="gap-2 rounded-full px-5"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Save key
          </Button>
          {storedInDatabase ? (
            <Button
              type="button"
              variant="outline"
              onClick={onRemove}
              disabled={saving}
              className="gap-2 rounded-full border-danger/40 text-danger hover:bg-danger/10"
            >
              <Trash className="h-4 w-4" />
              Remove stored key
            </Button>
          ) : null}
          <Button variant="ghost" onClick={onClose} className="rounded-full">
            Cancel
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}