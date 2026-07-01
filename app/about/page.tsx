import Link from "next/link";
import { portfolioProfile } from "@/lib/portfolio-data";
import {
  Breadcrumb,
  ChromeBottomRight,
  CloseButton,
  Wordmark,
} from "@/components/chrome";
import { SectionRule } from "@/components/section-rule";

/**
 * The "About" detail view. Full-screen, no scroll-snap, just a
 * single huge bio page. The × close button returns the user to
 * "/" (the home).
 */
export default function AboutPage() {
  return (
    <main className="kg-page">
      <div className="kg-chrome">
        <Wordmark />
        <CloseButton to="/" />
      </div>
      <div className="kg-chrome-bottom">
        <Breadcrumb path="/about" />
        <ChromeBottomRight />
      </div>

      <section className="kg-section kg-edge" aria-label="About">
        <span className="kg-eyebrow">About</span>
        <h1 className="kg-display kg-rise" style={{ marginTop: "2.5rem" }}>
          {portfolioProfile.preferredIntro}
        </h1>
      </section>

      <SectionRule />

      <section className="kg-section kg-edge" aria-label="Summary">
        <span className="kg-eyebrow">Now</span>
        <p
          className="kg-body kg-rise"
          style={{ marginTop: "2.5rem", maxWidth: "1200px" }}
        >
          {portfolioProfile.summary}
        </p>
        <p
          className="kg-body kg-rise"
          style={{ marginTop: "1.5rem", maxWidth: "1200px" }}
        >
          {portfolioProfile.education}
        </p>
      </section>

      <SectionRule />

      <section className="kg-section kg-edge" aria-label="Strengths">
        <span className="kg-eyebrow">Strengths</span>
        <p className="kg-stream kg-rise" style={{ marginTop: "2.5rem" }}>
          {portfolioProfile.strengths.map((s, i) => (
            <span key={s}>
              <span>{s}</span>
              {i < portfolioProfile.strengths.length - 1 ? "; " : "."}
            </span>
          ))}
        </p>
      </section>

      <SectionRule />

      <section className="kg-section kg-edge" aria-label="Quick facts">
        <span className="kg-eyebrow">Quick facts</span>
        <p className="kg-body kg-rise" style={{ marginTop: "2.5rem", maxWidth: "1200px" }}>
          {portfolioProfile.quickFacts.map((fact, i) => (
            <span key={fact}>
              {fact}
              {i < portfolioProfile.quickFacts.length - 1 ? " · " : "."}
            </span>
          ))}
        </p>
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
