"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useScroll } from "framer-motion"
import type { BlogPost } from "@/lib/blogs"
import { ArrowLeft, X, Link as LinkIcon, Check } from "lucide-react"

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
  </svg>
)
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import GithubSlugger from "github-slugger"
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
  
  const { scrollYProgress } = useScroll()
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([])
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    if (!post?.content) return
    const slugger = new GithubSlugger()
    const headingRegex = /^(#{1,3})\s+(.+)$/gm
    const extractedToc: { id: string; text: string; level: number }[] = []
    let match
    while ((match = headingRegex.exec(post.content)) !== null) {
      extractedToc.push({
        level: match[1].length,
        text: match[2],
        id: slugger.slug(match[2]),
      })
    }
    setToc(extractedToc)
  }, [post?.content])

  const shareUrl = typeof window !== "undefined" ? window.location.href : ""
  
  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post?.title || "")}`, "_blank")
  }
  
  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank")
  }
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

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
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <div className="mx-auto max-w-6xl flex flex-col xl:flex-row gap-8 items-start">
        <article className="flex-1 w-full min-w-0 overflow-hidden rounded-3xl border border-white/15 bg-white/[0.03] p-8 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push("/blogs")}
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

        <div className="mt-10 rounded-2xl border border-white/10 bg-black/30 p-6 md:p-8">
          <div className="text-white/85">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeSlug]}
              components={{
                p: ({node, ...props}) => <p className="mb-6 leading-relaxed md:text-lg md:leading-8 last:mb-0 whitespace-pre-wrap" {...props} />,
                h1: ({node, ...props}) => <h1 className="text-3xl font-extrabold text-white mt-12 mb-6" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-white mt-10 mb-5" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-xl font-bold text-white mt-8 mb-4" {...props} />,
                h4: ({node, ...props}) => <h4 className="text-lg font-bold text-white mt-6 mb-4" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-8 space-y-3 md:text-lg" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-8 space-y-3 md:text-lg" {...props} />,
                li: ({node, ...props}) => <li className="leading-relaxed pl-1" {...props} />,
                a: ({node, ...props}) => <a className="text-blue-400 hover:text-blue-300 underline underline-offset-4" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500 pl-4 py-1 mb-8 text-white/70 italic bg-white/[0.02] rounded-r-lg" {...props} />,
                code: ({node, inline, className, children, ...props}: any) => {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline ? (
                    <div className="relative mb-8 mt-4 rounded-xl overflow-hidden border border-white/10 bg-[#0d1117]">
                      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10 text-xs text-white/50">
                        <span>{match?.[1] || 'code'}</span>
                      </div>
                      <pre className="p-4 overflow-x-auto text-sm text-purple-300">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  ) : (
                    <code className="bg-white/10 text-purple-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </div>
      </article>

      {/* Sidebar for TOC and Share */}
      <aside className="w-full xl:w-72 shrink-0 space-y-6 xl:sticky xl:top-24">
        {/* Table of Contents */}
        {toc.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md">
            <h3 className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4 font-semibold">Table of Contents</h3>
            <ul className="space-y-3 text-sm">
              {toc.map((item) => (
                <li key={item.id} style={{ paddingLeft: `${(item.level - 1) * 12}px` }}>
                  <a href={`#${item.id}`} className="text-white/70 hover:text-white transition-colors line-clamp-2">
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Social Share */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md">
          <h3 className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4 font-semibold">Share this post</h3>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleShareTwitter} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-colors hover:bg-black hover:text-[#1DA1F2]">
              <TwitterIcon className="h-4 w-4" />
            </button>
            <button onClick={handleShareLinkedIn} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-colors hover:bg-black hover:text-[#0A66C2]">
              <LinkedinIcon className="h-4 w-4" />
            </button>
            <button onClick={handleCopyLink} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-colors hover:bg-white/10 hover:text-white">
              {copiedLink ? <Check className="h-4 w-4 text-green-400" /> : <LinkIcon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </aside>
      </div>

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
