"use client"

import { useEffect, useRef, useState } from "react"
import type { BlogPost } from "@/lib/blogs"
import { ToastContainer } from "./toast"
import dynamic from "next/dynamic"

const PasskeyLogin = dynamic(() => import("./passkey-login"), { ssr: false })

/**
 * Editorial publisher studio. Embedded in the /blogs page.
 * - When the user is not authenticated, shows a single "Authenticate
 *   to publish" link. Clicking it opens the auth modal (passkey /
 *   password / MFA).
 * - When authenticated, shows a "Publish a new post" link. Clicking
 *   it opens the publisher form (title, excerpt, image, content,
 *   tags, read time, save).
 *
 * The studio is intentionally editorial-styled: hairline rules, no
 * rounded cards, no gradients. The form fields use a 1px bottom
 * border on a transparent background, like the auth modal.
 */
type Props = {
  initialPosts: BlogPost[]
}

export function BlogsAdmin({ initialPosts }: Props) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authCheckComplete, setAuthCheckComplete] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMethod, setAuthMethod] = useState<"passkey" | "password" | "mfa">("passkey")
  const [adminPassword, setAdminPassword] = useState("")
  const [mfaCode, setMfaCode] = useState("")
  const [isVerifyingMfa, setIsVerifyingMfa] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingSlug, setEditingSlug] = useState<string | null>(null)

  // Form fields
  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [tags, setTags] = useState("")
  const [readTime, setReadTime] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: "success" | "error" | "warning" }>>([])
  const toastCounterRef = useRef(0)

  useEffect(() => {
    fetch("/api/auth/verify", { credentials: "include" })
      .then((response) => {
        if (response.ok) {
          setIsAuthenticated(true)
          setAuthCheckComplete(true)
          return
        }
        const storedPassword = localStorage.getItem("blogAdminPassword")
        if (!storedPassword) {
          setIsAuthenticated(false)
          setAuthCheckComplete(true)
          return
        }
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
          setAuthCheckComplete(true)
        })
      })
      .catch(() => {
        localStorage.removeItem("blogAdminPassword")
        setAdminPassword("")
        setIsAuthenticated(false)
        setAuthCheckComplete(true)
      })
  }, [])

  const showToast = (message: string, type: "success" | "error" | "warning" = "error") => {
    toastCounterRef.current += 1
    const id = toastCounterRef.current
    setToasts((prev) => [...prev, { id, message, type }])
  }
  const removeToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id))

  const refreshPosts = async () => {
    const response = await fetch("/api/blogs", { cache: "no-store" })
    if (response.ok) {
      const payload = (await response.json()) as { blogs: BlogPost[] }
      setPosts(payload.blogs)
    }
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
      if (response.status === 401) {
        showToast("Invalid password", "error")
        setAdminPassword("")
        return
      }
      localStorage.setItem("blogAdminPassword", adminPassword)
      setIsAuthenticated(true)
      setShowAuthModal(false)
      setAdminPassword("")
      showToast("Authenticated successfully!", "success")
    } catch {
      showToast("Authentication failed", "error")
      setAdminPassword("")
    }
  }

  const handleMfaLogin = async (codeToVerify?: string) => {
    const code = (codeToVerify || mfaCode).trim().replace(/\s+/g, "")
    if (code.length !== 6) {
      showToast("Please enter a 6-digit MFA code", "warning")
      return
    }
    setIsVerifyingMfa(true)
    try {
      const response = await fetch("/api/auth/mfa-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mfaCode: code }),
      })
      if (!response.ok) {
        const data = await response.json()
        showToast(data.error || "MFA validation failed", "error")
        setMfaCode("")
        return
      }
      setIsAuthenticated(true)
      setShowAuthModal(false)
      setMfaCode("")
      setAuthMethod("passkey")
      showToast("Authenticated with MFA", "success")
    } catch {
      showToast("MFA verification failed", "error")
    } finally {
      setIsVerifyingMfa(false)
    }
  }

  const handleMfaCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "")
    setMfaCode(value)
    if (value.length === 6) handleMfaLogin(value)
  }

  const handlePasskeySuccess = () => {
    setIsAuthenticated(true)
    setShowAuthModal(false)
    showToast("Logged in with passkey!", "success")
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    } catch {}
    localStorage.removeItem("blogAdminPassword")
    setAdminPassword("")
    setIsAuthenticated(false)
    setShowForm(false)
    setEditingSlug(null)
    showToast("Logged out", "success")
  }

  const resetForm = () => {
    setTitle("")
    setExcerpt("")
    setImageUrl("")
    setImageFile(null)
    setTags("")
    setReadTime("")
    setContent("")
    setEditingSlug(null)
  }

  const startEditing = (post: BlogPost) => {
    setEditingSlug(post.slug)
    setTitle(post.title)
    setExcerpt(post.excerpt)
    setImageUrl(post.imageUrl || "")
    setImageFile(null)
    setTags(post.tags.join(", "))
    setReadTime(post.readTime)
    setContent(post.content)
    setShowForm(true)
  }

  const handleDelete = async (slug: string) => {
    if (!confirm(`Delete "${slug}"? This cannot be undone.`)) return
    try {
      const params = new URLSearchParams({ slug })
      if (adminPassword.trim()) params.set("adminPassword", adminPassword.trim())
      const response = await fetch(`/api/blogs?${params.toString()}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!response.ok) {
        const payload = await response.json()
        showToast(payload.error || "Failed to delete", "error")
        return
      }
      showToast("Post deleted", "success")
      await refreshPosts()
    } catch {
      showToast("Failed to delete", "error")
    }
  }

  const uploadImageAndReturnUrl = async (): Promise<string | null> => {
    if (!imageFile) return imageUrl.trim() || null
    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append("file", imageFile)
      if (adminPassword.trim()) formData.append("adminPassword", adminPassword.trim())
      const response = await fetch("/api/uploads/blog-image", {
        method: "POST",
        credentials: "include",
        body: formData,
      })
      const payload = (await response.json()) as { error?: string; url?: string }
      if (!response.ok || !payload.url) {
        if (response.status === 401) {
          showToast("Authentication failed. Please login again.", "error")
          handleLogout()
        } else {
          showToast(payload.error || "Image upload failed", "error")
        }
        return null
      }
      setImageUrl(payload.url)
      setImageFile(null)
      showToast("Image uploaded", "success")
      return payload.url
    } catch {
      showToast("Image upload failed", "error")
      return null
    } finally {
      setIsUploadingImage(false)
    }
  }

  const submitPost = async () => {
    if (!title.trim() || !excerpt.trim() || !content.trim() || !tags.trim() || !readTime.trim()) {
      showToast("Please fill in title, excerpt, content, tags, and read time", "warning")
      return
    }
    setIsSubmitting(true)
    const resolvedImageUrl = imageFile ? await uploadImageAndReturnUrl() : imageUrl.trim() || null
    if (imageFile && !resolvedImageUrl) {
      setIsSubmitting(false)
      return
    }
    const baseBody = editingSlug
      ? {
          slug: editingSlug,
          title: title.trim(),
          excerpt: excerpt.trim(),
          imageUrl: resolvedImageUrl || undefined,
          content,
          tags,
          readTime,
        }
      : {
          title: title.trim(),
          excerpt: excerpt.trim(),
          imageUrl: resolvedImageUrl || undefined,
          content,
          tags,
          readTime,
        }
    const body = adminPassword ? { ...baseBody, adminPassword } : baseBody
    const method = editingSlug ? "PUT" : "POST"
    try {
      const response = await fetch("/api/blogs", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!response.ok) {
        const payload = await response.json()
        if (response.status === 401) {
          showToast("Authentication failed. Please login again.", "error")
          handleLogout()
          return
        }
        showToast(payload.error || "Save failed", "error")
        return
      }
      showToast(editingSlug ? "Post updated" : "Post published", "success")
      resetForm()
      setShowForm(false)
      await refreshPosts()
    } catch {
      showToast("Save failed", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Inline input style: 1px bottom border, transparent, no rounded card
  const fieldStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem 0",
    background: "transparent",
    border: "0",
    borderBottom: "1px solid var(--color-rule)",
    color: "var(--color-foreground)",
    fontFamily: "var(--font-inter)",
    fontSize: "1rem",
    outline: "none",
  }
  const fieldStyleLarge: React.CSSProperties = {
    ...fieldStyle,
    fontFamily: "var(--font-playfair)",
    fontSize: "1.5rem",
    letterSpacing: "-0.01em",
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* The admin bar — visible after the auth check completes */}
      {authCheckComplete ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          {isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={() => {
                  resetForm()
                  setShowForm((v) => !v)
                }}
                className="kg-eyebrow"
                style={{
                  textDecoration: "underline",
                  textUnderlineOffset: "0.32em",
                }}
              >
                {showForm ? "Close" : editingSlug ? "Continue editing" : "Publish a new post"}
              </button>
              <span
                className="kg-eyebrow"
                style={{ color: "var(--color-muted)", cursor: "default" }}
              >
                Authenticated
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="kg-eyebrow"
                style={{
                  textDecoration: "underline",
                  textUnderlineOffset: "0.32em",
                  color: "var(--color-muted)",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="kg-eyebrow"
              style={{
                textDecoration: "underline",
                textUnderlineOffset: "0.32em",
              }}
            >
              Authenticate to publish
            </button>
          )}
        </div>
      ) : null}

      {/* The publisher form — only when authenticated and showForm */}
      {isAuthenticated && showForm ? (
        <div style={{ marginTop: "3rem" }}>
          <hr className="kg-rule" aria-hidden="true" style={{ marginBottom: "2.5rem" }} />
          <span className="kg-eyebrow">{editingSlug ? "Editing" : "New post"}</span>
          <div style={{ display: "grid", gap: "1.5rem", marginTop: "2rem" }}>
            <div>
              <label className="kg-eyebrow" style={{ color: "var(--color-muted)" }}>
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="A descriptive title"
                style={fieldStyleLarge}
              />
            </div>
            <div>
              <label className="kg-eyebrow" style={{ color: "var(--color-muted)" }}>
                Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="One or two sentences."
                rows={2}
                style={{ ...fieldStyle, resize: "vertical" }}
              />
            </div>
            <div>
              <label className="kg-eyebrow" style={{ color: "var(--color-muted)" }}>
                Cover image URL (optional)
              </label>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                style={fieldStyle}
              />
              <div
                style={{
                  marginTop: "1rem",
                  display: "grid",
                  gap: "1rem",
                  gridTemplateColumns: "1fr auto",
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  style={{ ...fieldStyle, padding: "0.5rem 0" }}
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!imageFile) {
                      showToast("Pick an image first", "warning")
                      return
                    }
                    await uploadImageAndReturnUrl()
                  }}
                  disabled={!imageFile || isUploadingImage}
                  className="kg-eyebrow"
                  style={{
                    textDecoration: "underline",
                    textUnderlineOffset: "0.32em",
                    opacity: isUploadingImage ? 0.5 : 1,
                  }}
                >
                  {isUploadingImage ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
            <div>
              <label className="kg-eyebrow" style={{ color: "var(--color-muted)" }}>
                Content (Markdown)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={"# Heading\n\nWrite your post in Markdown."}
                rows={14}
                style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.6 }}
              />
            </div>
            <div
              style={{
                display: "grid",
                gap: "1.5rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              }}
            >
              <div>
                <label className="kg-eyebrow" style={{ color: "var(--color-muted)" }}>
                  Tags (comma separated)
                </label>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="react, nextjs, typescript"
                  style={fieldStyle}
                />
              </div>
              <div>
                <label className="kg-eyebrow" style={{ color: "var(--color-muted)" }}>
                  Read time
                </label>
                <input
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  placeholder="e.g. 6 min read"
                  style={fieldStyle}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem" }}>
              <button
                type="button"
                onClick={submitPost}
                disabled={isSubmitting || isUploadingImage}
                className="kg-eyebrow"
                style={{
                  textDecoration: "underline",
                  textUnderlineOffset: "0.32em",
                  opacity: isSubmitting ? 0.5 : 1,
                }}
              >
                {isSubmitting
                  ? editingSlug
                    ? "Updating..."
                    : "Publishing..."
                  : editingSlug
                    ? "Update post"
                    : "Publish post"}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm()
                  setShowForm(false)
                }}
                className="kg-eyebrow"
                style={{
                  color: "var(--color-muted)",
                  textDecoration: "underline",
                  textUnderlineOffset: "0.32em",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Auth modal */}
      {showAuthModal ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Admin authentication"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.4)",
          }}
          onClick={() => {
            setShowAuthModal(false)
            setAdminPassword("")
            setMfaCode("")
            setAuthMethod("passkey")
          }}
        >
          <div
            style={{
              background: "var(--color-background)",
              border: "1px solid var(--color-rule)",
              padding: "3rem 2rem",
              maxWidth: "520px",
              width: "calc(100% - 4rem)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="kg-eyebrow">Admin</span>
            <h2
              className="kg-title"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", marginTop: "1rem" }}
            >
              Authenticate
            </h2>
            <p
              className="kg-body"
              style={{ marginTop: "1.5rem", fontSize: "1rem", lineHeight: 1.5 }}
            >
              Sign in to publish or edit posts.
            </p>

            <div
              style={{
                display: "flex",
                gap: "1.5rem",
                marginTop: "2rem",
                borderBottom: "1px solid var(--color-rule)",
                paddingBottom: "0.5rem",
              }}
            >
              {(["passkey", "password", "mfa"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setAuthMethod(m)}
                  className="kg-eyebrow"
                  style={{
                    borderBottom:
                      authMethod === m ? "2px solid currentColor" : "2px solid transparent",
                    paddingBottom: "0.5rem",
                  }}
                >
                  {m === "mfa" ? "MFA Code" : m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>

            <div style={{ marginTop: "2rem", minHeight: "100px" }}>
              {authMethod === "passkey" ? (
                <PasskeyLogin onSuccess={handlePasskeySuccess} showToast={showToast} />
              ) : null}

              {authMethod === "password" ? (
                <>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="Admin password"
                    autoFocus
                    style={fieldStyle}
                  />
                  <button
                    type="button"
                    onClick={handleLogin}
                    className="kg-eyebrow"
                    style={{
                      marginTop: "1.5rem",
                      textDecoration: "underline",
                      textUnderlineOffset: "0.32em",
                    }}
                  >
                    Login
                  </button>
                </>
              ) : null}

              {authMethod === "mfa" ? (
                <div>
                  <p
                    className="kg-sans"
                    style={{ fontSize: "0.85rem", color: "var(--color-muted)" }}
                  >
                    Enter the 6-digit code from your authenticator app.
                  </p>
                  <input
                    type="text"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={6}
                    value={mfaCode}
                    onChange={handleMfaCodeChange}
                    placeholder="000000"
                    autoFocus
                    style={{
                      ...fieldStyle,
                      fontFamily: "var(--font-mono)",
                      fontSize: "1.5rem",
                      letterSpacing: "0.25em",
                    }}
                  />
                  {isVerifyingMfa ? (
                    <p className="kg-eyebrow" style={{ marginTop: "1rem" }}>
                      Verifying…
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => {
                setShowAuthModal(false)
                setAdminPassword("")
                setMfaCode("")
                setAuthMethod("passkey")
              }}
              className="kg-eyebrow"
              style={{
                marginTop: "2.5rem",
                textDecoration: "underline",
                textUnderlineOffset: "0.32em",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {/* When authenticated: show edit/delete affordances on each post */}
      {isAuthenticated && authCheckComplete && !showForm ? (
        <div style={{ marginTop: "3rem" }}>
          <hr className="kg-rule" aria-hidden="true" style={{ marginBottom: "2.5rem" }} />
          <span className="kg-eyebrow">Manage posts</span>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "2rem 0 0",
              display: "grid",
              gap: "0.5rem",
            }}
          >
            {posts.map((p) => (
              <li
                key={p.slug}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.5rem",
                  flexWrap: "wrap",
                  padding: "0.75rem 0",
                  borderBottom: "1px solid var(--color-rule)",
                }}
              >
                <span className="kg-sans" style={{ fontSize: "1rem", flex: 1, minWidth: "200px" }}>
                  {p.title}
                </span>
                <span
                  className="kg-eyebrow"
                  style={{ color: "var(--color-muted)" }}
                >
                  {p.publishedAt}
                </span>
                <button
                  type="button"
                  onClick={() => startEditing(p)}
                  className="kg-eyebrow"
                  style={{ textDecoration: "underline", textUnderlineOffset: "0.32em" }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p.slug)}
                  className="kg-eyebrow"
                  style={{
                    textDecoration: "underline",
                    textUnderlineOffset: "0.32em",
                    color: "var(--color-muted)",
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  )
}
