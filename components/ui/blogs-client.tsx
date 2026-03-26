"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import type { BlogPost } from "@/lib/blogs"
import { ToastContainer } from "./toast"
import PasskeyLogin from "./passkey-login"
import PasskeyManager from "./passkey-manager"

type BlogsClientProps = {
  initialPosts: BlogPost[]
}

export function BlogsClient({ initialPosts }: BlogsClientProps) {
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts)
  const [showForm, setShowForm] = useState(false)
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [tags, setTags] = useState("")
  const [content, setContent] = useState("")
  const [readTime, setReadTime] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: "success" | "error" | "warning" }>>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [adminPassword, setAdminPassword] = useState("")
  const [showPasswordFallback, setShowPasswordFallback] = useState(false)
  const [showPasskeyManager, setShowPasskeyManager] = useState(false)
  const toastCounterRef = useRef(0)

  useEffect(() => {
    // Check if user is authenticated via JWT cookie
    fetch("/api/auth/verify", { credentials: "include" })
      .then((response) => {
        if (response.ok) {
          setIsAuthenticated(true)
          return
        }
        // Fall back to checking localStorage password
        const storedPassword = localStorage.getItem("blogAdminPassword")
        if (storedPassword) {
          // Re-authenticate using password fallback and refresh auth cookie
          return fetch("/api/auth/password-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ adminPassword: storedPassword }),
          }).then((response) => {
            if (response.status === 401) {
              localStorage.removeItem("blogAdminPassword")
              setAdminPassword("")
              setIsAuthenticated(false)
            } else {
              setAdminPassword(storedPassword)
              setIsAuthenticated(true)
            }
          })
        }
      })
      .catch(() => {
        // On error, clear authentication
        localStorage.removeItem("blogAdminPassword")
        setAdminPassword("")
        setIsAuthenticated(false)
      })
  }, [])

  const showToast = (message: string, type: "success" | "error" | "warning" = "error") => {
    toastCounterRef.current += 1
    const id = toastCounterRef.current
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const handleLogin = async () => {
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

      // Check authentication response
      if (response.status === 401) {
        showToast("Invalid password. Redirecting...", "error")
        setAdminPassword("")
        setShowAuthModal(false)
        // Redirect to blogs page after short delay
        setTimeout(() => {
          router.push("/blogs")
        }, 1500)
        return
      }

      localStorage.setItem("blogAdminPassword", adminPassword)
      setIsAuthenticated(true)
      setShowAuthModal(false)
      setShowForm(true) // Open the form after successful authentication
      showToast("Authenticated successfully!", "success")
    } catch (error) {
      showToast("Authentication failed. Please try again.", "error")
      setAdminPassword("")
    }
  }

  const handleLogout = async () => {
    // Call logout API to clear JWT cookie
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout error:", error)
    }

    // Clear localStorage password as well
    localStorage.removeItem("blogAdminPassword")
    setAdminPassword("")
    setIsAuthenticated(false)
    setShowForm(false)
    setEditingSlug(null)
    setShowPasskeyManager(false)
    showToast("Logged out successfully", "success")
  }

  const handlePasskeyLoginSuccess = () => {
    setIsAuthenticated(true)
    setShowAuthModal(false)
    setShowPasswordFallback(false)
    setShowForm(true)
    showToast("Logged in with passkey!", "success")
  }

  const handlePasswordFallback = () => {
    setShowPasswordFallback(true)
  }

  const handleAddBlogClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
    } else {
      setShowForm(true)
    }
  }

  useEffect(() => {
    setPosts(initialPosts)
  }, [initialPosts])

  const handleEdit = (post: BlogPost) => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }
    setEditingSlug(post.slug)
    setTitle(post.title)
    setExcerpt(post.excerpt)
    setTags(post.tags.join(", "))
    setContent(post.content.join("\n"))
    setReadTime(post.readTime)
    setShowForm(true)
  }

  const handleCancelEdit = () => {
    setEditingSlug(null)
    setTitle("")
    setExcerpt("")
    setTags("")
    setContent("")
    setReadTime("")
    setShowForm(false)
  }

  const handleDelete = async (slug: string) => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    if (!confirm("Are you sure you want to delete this blog post?")) {
      return
    }

    try {
      const params = new URLSearchParams({ slug })
      if (adminPassword) {
        params.set("adminPassword", adminPassword)
      }
      const response = await fetch(`/api/blogs?${params.toString()}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string }
        if (response.status === 401) {
          showToast("Authentication failed. Please login again.", "error")
          handleLogout()
          return
        }
        showToast(payload.error || "Failed to delete blog", "error")
        return
      }

      showToast("Blog deleted successfully!", "success")

      // Refresh the list
      const refreshed = await fetch("/api/blogs", { cache: "no-store" })
      if (refreshed.ok) {
        const payload = (await refreshed.json()) as { blogs: BlogPost[] }
        setPosts(payload.blogs)
      }
    } catch (error) {
      showToast("Failed to delete blog", "error")
    }
  }

  const validateForm = (): boolean => {
    const missingFields: string[] = []

    if (!title.trim()) missingFields.push("Title")
    if (!excerpt.trim()) missingFields.push("Excerpt")
    if (!content.trim()) missingFields.push("Content")
    if (!tags.trim()) missingFields.push("Tags")
    if (!readTime.trim()) missingFields.push("Read Time")

    if (missingFields.length > 0) {
      showToast(`Please fill in: ${missingFields.join(", ")}`, "warning")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    const method = editingSlug ? "PUT" : "POST"
    const baseBody = editingSlug
      ? {
          slug: editingSlug,
          title: title.trim(),
          excerpt: excerpt.trim(),
          content,
          tags,
          readTime,
        }
      : {
          title: title.trim(),
          excerpt: excerpt.trim(),
          content,
          tags,
          readTime,
        }

    const body = adminPassword
      ? { ...baseBody, adminPassword }
      : baseBody

    const response = await fetch("/api/blogs", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string }
      if (response.status === 401) {
        showToast("Authentication failed. Please login again.", "error")
        handleLogout()
        setIsSubmitting(false)
        return
      }
      showToast(payload.error || `Failed to ${editingSlug ? "update" : "publish"} blog`, "error")
      setIsSubmitting(false)
      return
    }

    showToast(`Blog ${editingSlug ? "updated" : "published"} successfully!`, "success")

    const refreshed = await fetch("/api/blogs", { cache: "no-store" })
    if (refreshed.ok) {
      const payload = (await refreshed.json()) as { blogs: BlogPost[] }
      setPosts(payload.blogs)
    }

    setTitle("")
    setExcerpt("")
    setTags("")
    setContent("")
    setReadTime("")
    setEditingSlug(null)
    setShowForm(false)
    setIsSubmitting(false)
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <section className="mx-auto max-w-6xl">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-xs uppercase tracking-[0.28em] text-white/55"
        >
          Blogs
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-4 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-4xl font-extrabold text-transparent md:text-6xl"
        >
          Ideas, Builds & Learnings
        </motion.h1>
      </section>

      <section className="mx-auto mt-10 max-w-6xl rounded-2xl border border-white/15 bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">{editingSlug ? "Edit Blog" : "Write Blogs"}</h2>
          <div className="flex gap-2">
            {isAuthenticated && (
              <>
                <button
                  type="button"
                  onClick={() => setShowPasskeyManager(!showPasskeyManager)}
                  className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300 transition-colors hover:bg-blue-500/20"
                >
                  {showPasskeyManager ? "Hide Passkeys" : "Manage Passkeys"}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-300 transition-colors hover:bg-red-500/20"
                >
                  Logout
                </button>
              </>
            )}
            {!showForm ? (
              <button
                type="button"
                onClick={handleAddBlogClick}
                className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/20"
              >
                Add a blog
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-full border border-white/25 bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/90 transition-colors hover:bg-white/10"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Passkey Manager */}
        {showPasskeyManager && (
          <div className="mt-6 p-6 rounded-xl border border-blue-500/20 bg-blue-500/5">
            <PasskeyManager isAuthenticated={isAuthenticated} showToast={showToast} />
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
            <div>
              <label className="mb-1 block text-xs text-white/60">
                Blog title <span className="text-red-400">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter blog title"
                className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/45"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/60">
                Short excerpt <span className="text-red-400">*</span>
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief description of your blog"
                rows={3}
                className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/45"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/60">
                Full content <span className="text-red-400">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your blog content here (use new lines for paragraphs)"
                rows={5}
                className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/45"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-white/60">
                  Tags <span className="text-red-400">*</span>
                </label>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="react, nextjs, typescript"
                  className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/45"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/60">
                  Read time <span className="text-red-400">*</span>
                </label>
                <input
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  placeholder="e.g. 6 min read"
                  className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/45"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed md:w-fit"
            >
              {isSubmitting ? (editingSlug ? "Updating..." : "Publishing...") : editingSlug ? "Update Blog" : "Publish Blog"}
            </button>
          </form>
        )}
      </section>

      <section className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post, index) => (
          <motion.article
            key={post.slug}
            initial={{ opacity: 0, y: 48, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, delay: index * 0.07 }}
            whileHover={{ y: -5 }}
            className="group relative rounded-2xl border border-white/15 bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          >
            {isAuthenticated && (
              <div className="absolute right-3 top-3 flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    handleEdit(post)
                  }}
                  className="rounded-lg border border-white/20 bg-black/40 px-2 py-1 text-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  title="Edit blog"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    handleDelete(post.slug)
                  }}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs text-red-300 transition-colors hover:bg-red-500/20 hover:text-red-200"
                  title="Delete blog"
                >
                  Delete
                </button>
              </div>
            )}
            <Link href={`/blogs/${post.slug}`} className="block">
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">
                {post.publishedAt} · {post.readTime}
              </p>
              <h2 className="mt-3 text-xl font-semibold leading-snug text-white">{post.title}</h2>
              <p className="mt-3 text-sm leading-7 text-white/75">{post.excerpt}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 text-xs text-white/80">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          </motion.article>
        ))}
      </section>

      {/* Authentication Modal */}
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
              setAdminPassword("")
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
                  : "Use your passkey or password to manage blogs"}
              </p>

              <div className="mt-5">
                {!showPasswordFallback ? (
                  <PasskeyLogin
                    onSuccess={handlePasskeyLoginSuccess}
                    onFallbackToPassword={handlePasswordFallback}
                    showToast={showToast}
                  />
                ) : (
                  <>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      placeholder="Enter admin password"
                      autoFocus
                      className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/45"
                    />
                    <div className="mt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={handleLogin}
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

              {!showPasswordFallback && (
                <button
                  type="button"
                  onClick={() => {
                    setShowAuthModal(false)
                    setAdminPassword("")
                    setShowPasswordFallback(false)
                  }}
                  className="mt-4 w-full rounded-full border border-white/25 bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/90 transition-colors hover:bg-white/10"
                >
                  Cancel
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
