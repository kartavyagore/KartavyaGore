import Link from "next/link";
import { portfolioProjects } from "@/lib/portfolio-data";
import {
  Breadcrumb,
  ChromeBottomRight,
  CloseButton,
  Wordmark,
} from "@/components/chrome";
import { SectionRule } from "@/components/section-rule";

/**
 * The "Projects" list view. Full-screen, no scroll-snap. A single
 * giant serif stream of project titles separated by `;`, each a
 * deep-link to /projects/<slug>. The × close button returns the
 * user to "/".
 */
export default function ProjectsPage() {
  const slugFor = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  return (
    <main className="kg-page">
      <div className="kg-chrome">
        <Wordmark />
        <CloseButton to="/" />
      </div>
      <div className="kg-chrome-bottom">
        <Breadcrumb path="/projects" />
        <ChromeBottomRight />
      </div>

      <section className="kg-section kg-edge" aria-label="Projects">
        <span className="kg-eyebrow">Projects</span>
        <p className="kg-stream kg-rise" style={{ marginTop: "2.5rem" }}>
          {portfolioProjects.map((p, i) => (
            <span key={p.title}>
              <Link href={`/projects/${slugFor(p.title)}`}>{p.title}</Link>
              {i < portfolioProjects.length - 1 ? "; " : "."}
            </span>
          ))}
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
            gap: "1.2rem",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          }}
        >
          {portfolioProjects.map((p) => (
            <li key={p.title} style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <Link
                href={`/projects/${slugFor(p.title)}`}
                className="kg-title"
                style={{ fontSize: "clamp(1.25rem, 2.2vw, 2rem)", lineHeight: 1.1 }}
              >
                {p.title}
              </Link>
              <span className="kg-detail-meta">{p.tag} · {p.status}</span>
              <p
                className="kg-prose"
                style={{ fontSize: "0.95rem", lineHeight: 1.5, color: "var(--color-foreground)", marginTop: "0.3rem" }}
              >
                {p.summary}
              </p>
            </li>
          ))}
        </ul>
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
