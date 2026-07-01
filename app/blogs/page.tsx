import { getAllBlogsFromDb } from "@/lib/blogs-db";
import {
  Breadcrumb,
  ChromeBottomRight,
  CloseButton,
  Wordmark,
} from "@/components/chrome";
import { SectionRule } from "@/components/section-rule";
import { BlogsAdmin } from "@/components/ui/blogs-admin";
import Link from "next/link";

/**
 * The "Writing" list view. Server component fetches posts and renders
 * the editorial stream. The publisher studio is embedded below the
 * Index section as a client component (BlogsAdmin) — it handles auth,
 * login, the publish form, and edit/delete controls.
 */
export const revalidate = 60;

export default async function BlogsPage() {
  const posts = (await getAllBlogsFromDb()) ?? [];

  return (
    <main className="kg-page">
      <div className="kg-chrome">
        <Wordmark />
        <CloseButton to="/" />
      </div>
      <div className="kg-chrome-bottom">
        <Breadcrumb path="/blogs" />
        <ChromeBottomRight />
      </div>

      <section className="kg-section kg-edge" aria-label="Writing">
        <span className="kg-eyebrow">Writing</span>
        <p className="kg-stream kg-rise" style={{ marginTop: "2.5rem" }}>
          {posts.length === 0 ? (
            <span>No posts yet.</span>
          ) : (
            posts.map((post, i) => (
              <span key={post.slug}>
                <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
                {i < posts.length - 1 ? "; " : "."}
              </span>
            ))
          )}
        </p>
      </section>

      <SectionRule />

      <section
        className="kg-section kg-edge"
        aria-label="Index"
        style={{ minHeight: "auto", paddingTop: "4rem", paddingBottom: "4rem" }}
      >
        <span className="kg-eyebrow">Index</span>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "2.5rem 0 0",
            display: "grid",
            gap: "2rem",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          }}
        >
          {posts.map((p) => (
            <li key={p.slug} style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <Link
                href={`/blogs/${p.slug}`}
                className="kg-title"
                style={{ fontSize: "clamp(1.25rem, 2.2vw, 2rem)", lineHeight: 1.1 }}
              >
                {p.title}
              </Link>
              <span className="kg-detail-meta">
                {p.publishedAt}
                <span className="kg-dot">·</span>
                {p.readTime}
              </span>
              {p.excerpt ? (
                <p
                  className="kg-prose"
                  style={{ fontSize: "0.95rem", lineHeight: 1.5, marginTop: "0.3rem" }}
                >
                  {p.excerpt}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <SectionRule />

      <section
        className="kg-section kg-edge"
        aria-label="Admin"
        style={{ minHeight: "auto", paddingTop: "4rem", paddingBottom: "4rem" }}
      >
        <span className="kg-eyebrow">Admin</span>
        <p
          className="kg-body kg-rise"
          style={{ marginTop: "2.5rem", maxWidth: "1100px" }}
        >
          Publish new posts, or edit and delete existing ones. Authenticate
          with a passkey, password, or MFA code.
        </p>
        <div style={{ marginTop: "2.5rem" }}>
          <BlogsAdmin initialPosts={posts} />
        </div>
      </section>

      <SectionRule />

      <section
        className="kg-section kg-edge"
        aria-label="Return home"
        style={{ minHeight: "auto", paddingTop: "4rem", paddingBottom: "4rem" }}
      >
        <Link
          href="/"
          className="kg-eyebrow"
          style={{ display: "inline-block" }}
        >
          ← Home
        </Link>
      </section>
    </main>
  );
}
