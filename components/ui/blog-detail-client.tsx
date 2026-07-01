"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import GithubSlugger from "github-slugger"
import type { BlogPost } from "@/lib/blogs"
import { toRenderableImageSrc } from "@/lib/image-url"
import { ToastContainer } from "./toast"
import dynamic from "next/dynamic"
import { Breadcrumb, ChromeBottomRight, CloseButton, Wordmark } from "@/components/chrome"
import { SectionRule } from "@/components/section-rule"

const PasskeyLogin = dynamic(() => import("./passkey-login"), { ssr: false })

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
  const [authMethod, setAuthMethod] = useState<"passkey" | "password" | "mfa">("passkey")
  const [mfaCode, setMfaCode] = useState("")
  const [isVerifyingMfa, setIsVerifyingMfa] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [authCheckComplete, setAuthCheckComplete] = useState(false)
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: "success" | "error" | "warning" }>>([])
  const toastCounterRef = useRef(0)
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([])

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
      })
      .catch(() => {
        localStorage.removeItem("blogAdminPassword")
        setAdminPassword("")
        setIsAuthenticated(false)
      })
      .finally(() => setAuthCheckComplete(true))
  }, [])

  const showToast = (message: string, type: "success" | "error" | "warning" = "error") => {
    toastCounterRef.current += 1
    const id = toastCounterRef.current
    setToasts((prev) => [...prev, { id, message, type }])
  }
  const removeToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id))

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
      setShowPasswordFallback(false)
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
    } catch {}
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
    if (!confirm("Delete this post?")) return
    setIsDeleting(true)
    try {
      const params = new URLSearchParams({ slug })
      if (adminPassword.trim()) params.set("adminPassword", adminPassword.trim())
      const response = await fetch(`/api/blogs?${params.toString()}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!response.ok) {
        const payload = await response.json()
        showToast(payload.error || "Failed to delete blog", "error")
        return
      }
      showToast("Blog deleted", "success")
      router.push("/blogs")
    } catch {
      showToast("Failed to delete blog", "error")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!post) {
    return (
      <main className="kg-page">
        <div className="kg-chrome">
          <Wordmark />
          <CloseButton to="/blogs" />
        </div>
        <div className="kg-chrome-bottom">
          <Breadcrumb path={`/blogs/${slug}`} />
          <ChromeBottomRight />
        </div>
        <section className="kg-section kg-edge" aria-label="Not found">
          <span className="kg-eyebrow">Writing</span>
          <h1 className="kg-detail-title kg-rise" style={{ marginTop: "2.5rem" }}>
            Post not found.
          </h1>
          <p className="kg-body kg-rise" style={{ marginTop: "2rem" }}>
            <Link href="/blogs">← Back to writing</Link>
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="kg-page">
      <div className="kg-chrome">
        <Wordmark />
        <CloseButton to="/blogs" />
      </div>
      <div className="kg-chrome-bottom">
        <Breadcrumb path={`/blogs/${slug}`} />
        <ChromeBottomRight />
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <section className="kg-section kg-edge" aria-label={post.title}>
        <span className="kg-eyebrow">Writing</span>
        <h1 className="kg-detail-title kg-rise" style={{ marginTop: "2.5rem" }}>
          {post.title}
        </h1>
        <p className="kg-detail-meta" style={{ marginTop: "1.5rem" }}>
          {post.publishedAt}
          <span className="kg-dot">·</span>
          {post.readTime}
        </p>
        {post.tags.length > 0 ? (
          <p className="kg-detail-meta" style={{ marginTop: "0.5rem" }}>
            {post.tags.join(" · ")}
          </p>
        ) : null}
      </section>

      <SectionRule />

      {imageSrc ? (
        <section
          className="kg-section kg-edge"
          aria-label="Cover image"
          style={{ minHeight: "auto", paddingTop: "4rem", paddingBottom: "4rem" }}
        >
          <span className="kg-eyebrow">Cover</span>
          <div style={{ marginTop: "2.5rem" }}>
            <img src={imageSrc} alt={post.title} className="kg-feature" />
          </div>
        </section>
      ) : null}

      {imageSrc ? <SectionRule /> : null}

      <section
        className="kg-section kg-edge"
        aria-label="Body"
        style={{ minHeight: "auto", paddingTop: "4rem", paddingBottom: "4rem" }}
      >
        <span className="kg-eyebrow">Body</span>
        <div className="kg-prose kg-rise" style={{ marginTop: "2.5rem", maxWidth: "1100px" }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
            {post.content}
          </ReactMarkdown>
        </div>
      </section>

      <SectionRule />

      <section
        className="kg-section kg-edge"
        aria-label="Manage"
        style={{ minHeight: "auto", paddingTop: "4rem", paddingBottom: "4rem" }}
      >
        <span className="kg-eyebrow">Manage</span>
        <p className="kg-body kg-rise" style={{ marginTop: "2.5rem" }}>
          {isAuthenticated ? (
            <span style={{ display: "inline-flex", gap: "1.5rem", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handleEdit}
                className="kg-toggle"
                style={{ textDecoration: "underline", textUnderlineOffset: "0.32em" }}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="kg-toggle"
                style={{ textDecoration: "underline", textUnderlineOffset: "0.32em", opacity: isDeleting ? 0.5 : 1 }}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
              <Link
                href="/blogs"
                className="kg-toggle"
                style={{ textDecoration: "underline", textUnderlineOffset: "0.32em" }}
              >
                ← Back to writing
              </Link>
            </span>
          ) : authCheckComplete ? (
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="kg-toggle"
              style={{ textDecoration: "underline", textUnderlineOffset: "0.32em" }}
            >
              Login to manage this post
            </button>
          ) : null}
        </p>
      </section>

      {/* Auth modal — minimal editorial style */}
      {showAuthModal ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Admin authentication"
          className="fixed inset-0 z-[60] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => {
            setShowAuthModal(false)
            setAdminPassword("")
            setMfaCode("")
            setAuthMethod("passkey")
            setShowPasswordFallback(false)
          }}
        >
          <div
            className="kg-edge"
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
              className="kg-title kg-rise"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", marginTop: "1rem" }}
            >
              Authenticate
            </h2>
            <p
              className="kg-body"
              style={{ marginTop: "1.5rem", fontSize: "1rem", lineHeight: 1.5 }}
            >
              Manage this post with a passkey, password, or MFA code.
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
                    borderBottom: authMethod === m ? "2px solid currentColor" : "2px solid transparent",
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
                    style={{
                      width: "100%",
                      padding: "0.75rem 0",
                      background: "transparent",
                      border: "0",
                      borderBottom: "1px solid var(--color-rule)",
                      color: "var(--color-foreground)",
                      fontFamily: "var(--font-inter)",
                      fontSize: "1rem",
                      outline: "none",
                    }}
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
                  <p className="kg-sans" style={{ fontSize: "0.85rem", color: "var(--color-muted)" }}>
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
                      width: "100%",
                      padding: "0.75rem 0",
                      background: "transparent",
                      border: "0",
                      borderBottom: "1px solid var(--color-rule)",
                      color: "var(--color-foreground)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "1.5rem",
                      letterSpacing: "0.25em",
                      outline: "none",
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
                setShowPasswordFallback(false)
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
    </main>
  )
}
