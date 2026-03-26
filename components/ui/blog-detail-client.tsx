"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import type { BlogPost } from "@/lib/blogs"
import { ArrowLeft, X } from "lucide-react"
import { toRenderableImageSrc } from "@/lib/image-url"
import { ToastContainer } from "./toast"
import PasskeyLogin from "./passkey-login"

type BlogDetailClientProps = {
  slug: string
  initialPost: BlogPost | null
}

export function BlogDetailClient({ slug, initialPost }: BlogDetailClientProps) {
  const [post] = useState<BlogPost | null>(initialPost)
  const router = useRouter()
  const imageSrc = toRenderableImageSrc(post?.imageUrl)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showPasswordFallback, setShowPasswordFallback] = useState(false)
  const [adminPassword, setAdminPassword] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [authCheckComplete, setAuthCheckComplete] = useState(false)
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: "success" | "error" | "warning" }>>([])
  const toastCounterRef = useRef(0)

  useEffect(() => {
    fetch("/api/auth/verify", { credentials: "include" })
      .then((response) => {
        if (response.ok) {
          setIsAuthenticated(true)
          return
        }

        const storedPassword = localStorage.getItem("blogAdminPassword")
        if (!storedPassword) {
          setIsAuthenticated(false)
          return
        }

        return fetch("/api/auth/password-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ adminPassword: storedPassword }),
        }).then((fallbackResponse) => {
          if (fallbackResponse.status === 401) {
            localStorage.removeItem("blogAdminPassword")
            setAdminPassword("")
            setIsAuthenticated(false)
            return
          }
          setAdminPassword(storedPassword)
          setIsAuthenticated(true)
        })
      })
      .catch(() => {
        localStorage.removeItem("blogAdminPassword")
        setAdminPassword("")
        setIsAuthenticated(false)
      })
      .finally(() => {
        setAuthCheckComplete(true)
      })
  }, [])

  const showToast = (message: string, type: "success" | "error" | "warning" = "error") => {
    toastCounterRef.current += 1
    setToasts((prev) => [...prev, { id: toastCounterRef.current, message, type }])
  }

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const handlePasswordLogin = async () => {
    if (!adminPassword.trim()) {
      showToast("Please enter admin password", "warning")
      return
    }

    try {
      const response = await fetch("/api/auth/password-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ adminPassword }),
      })

      if (response.status === 401) {
        showToast("Invalid password", "error")
        return
      }

      localStorage.setItem("blogAdminPassword", adminPassword.trim())
      setIsAuthenticated(true)
      setShowAuthModal(false)
      setShowPasswordFallback(false)
      showToast("Authenticated successfully!", "success")
    } catch {
      showToast("Authentication failed", "error")
    }
  }

  const handlePasskeySuccess = () => {
    setIsAuthenticated(true)
    setShowAuthModal(false)
    setShowPasswordFallback(false)
    showToast("Logged in with passkey!", "success")
  }

  const ensureAuth = async (): Promise<boolean> => {
    if (isAuthenticated) return true

    try {
      const response = await fetch("/api/auth/verify", { credentials: "include" })
      if (response.ok) {
        setIsAuthenticated(true)
        return true
      }

      const storedPassword = localStorage.getItem("blogAdminPassword")
      if (storedPassword) {
        const fallback = await fetch("/api/auth/password-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ adminPassword: storedPassword }),
        })
        if (fallback.ok) {
          setAdminPassword(storedPassword)
          setIsAuthenticated(true)
          return true
        }
      }
    } catch {
      // ignore and show auth modal below
    }

    setShowAuthModal(true)
    return false
  }

  const handleEdit = async () => {
    const ok = await ensureAuth()
    if (!ok) return
    router.push(`/blogs?edit=${encodeURIComponent(slug)}`)
  }

  const handleDelete = async () => {
    const ok = await ensureAuth()
    if (!ok) return
    if (!confirm("Are you sure you want to delete this blog post?")) return

    setIsDeleting(true)
    try {
      const params = new URLSearchParams({ slug })
      if (adminPassword.trim()) {
        params.set("adminPassword", adminPassword.trim())
      }
      const response = await fetch(`/api/blogs?${params.toString()}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string }
        if (response.status === 401) {
          showToast("Authentication failed. Please login again.", "error")
          setIsAuthenticated(false)
          setShowAuthModal(true)
          return
        }
        showToast(payload.error || "Failed to delete blog", "error")
        return
      }

      showToast("Blog deleted successfully!", "success")
      router.push("/blogs")
    } catch {
      showToast("Failed to delete blog", "error")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!post) {
    return (
      <main className="relative min-h-screen bg-black px-4 py-24 text-white sm:px-6 lg:px-8">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <article className="mx-auto max-w-3xl rounded-3xl border border-white/15 bg-white/[0.03] p-8 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-10">
          <div className="mb-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-white/20"
            >
              Go back
            </button>
          </div>
          <h1 className="text-2xl font-bold">Blog not found</h1>
          <p className="mt-4 text-white/75">This blog may have been removed from local storage or never created.</p>
          <Link href="/blogs" className="mt-6 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.16em] text-white">
            Back to Blogs
          </Link>
        </article>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen bg-black px-4 py-24 text-white sm:px-6 lg:px-8">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <article className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/15 bg-white/[0.03] p-8 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-white/20"
          >
            <ArrowLeft/>
          </button>
          {isAuthenticated ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleEdit}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-white/20"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-red-200 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          ) : authCheckComplete ? (
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="text-xs uppercase tracking-[0.14em] text-white/50 transition-colors hover:text-white/80"
            >
              Login to manage this blog
            </button>
          ) : null}
        </div>

        <div className="mb-8 rounded-2xl border border-white/15 bg-gradient-to-r from-white/[0.08] via-white/[0.03] to-transparent p-6">
          {imageSrc ? (
            <div className="mb-6 overflow-hidden rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setShowImagePreview(true)}
                className="block w-full cursor-zoom-in"
              >
                <img
                  src={imageSrc}
                  alt={post.title}
                  className="h-64 w-full object-cover md:h-80"
                />
              </button>
            </div>
          ) : null}
          <p className="text-xs uppercase tracking-[0.18em] text-white/55">
            {post.publishedAt} · {post.readTime}
          </p>
          <h1 className="mt-4 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-3xl font-extrabold leading-tight text-transparent md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-5 text-base leading-8 text-white/75">{post.excerpt}</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 text-xs text-white/80">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-10 space-y-5 rounded-2xl border border-white/10 bg-black/30 p-6">
          {post.content.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-8 text-white/80 md:text-base">
              {paragraph}
            </p>
          ))}
        </div>
      </article>

      <AnimatePresence>
        {showImagePreview && imageSrc ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setShowImagePreview(false)}
          >
            <button
              type="button"
              onClick={() => setShowImagePreview(false)}
              className="absolute right-4 top-4 rounded-full border border-white/25 bg-black/40 p-2 text-white/85 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close image preview"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.img
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2 }}
              src={imageSrc}
              alt={post.title}
              className="max-h-[90vh] max-w-[95vw] rounded-xl border border-white/15 object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowAuthModal(false)
              setShowPasswordFallback(false)
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-2xl border border-white/15 bg-black/90 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-white">Admin Authentication</h3>
              <p className="mt-2 text-sm text-white/60">
                {showPasswordFallback
                  ? "Enter your admin password"
                  : "Use your passkey or password to manage this blog"}
              </p>

              <div className="mt-5">
                {!showPasswordFallback ? (
                  <PasskeyLogin
                    onSuccess={handlePasskeySuccess}
                    onFallbackToPassword={() => setShowPasswordFallback(true)}
                    showToast={showToast}
                  />
                ) : (
                  <>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handlePasswordLogin()}
                      placeholder="Enter admin password"
                      autoFocus
                      className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/45"
                    />
                    <div className="mt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={handlePasswordLogin}
                        className="flex-1 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/20"
                      >
                        Login
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPasswordFallback(false)}
                        className="rounded-full border border-white/25 bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/90 transition-colors hover:bg-white/10"
                      >
                        Back
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
