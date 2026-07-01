import Link from "next/link";
import {
  portfolioProjects,
  recruiterContacts,
  recruiterHighlights,
} from "@/lib/portfolio-data";
import {
  Breadcrumb,
  ChromeBottomRight,
  CloseButton,
  Wordmark,
} from "@/components/chrome";
import { SectionRule } from "@/components/section-rule";

/**
 * The "Recruiter" view. Editorial design — same as the rest of the
 * site. Short, scannable: highlights, projects, contact, and a
 * link to the admin (passkey / MFA / AI studio) at /recruiter/admin.
 */
export default function RecruiterPage() {
  return (
    <main className="kg-page">
      <div className="kg-chrome">
        <Wordmark />
        <CloseButton to="/" />
      </div>
      <div className="kg-chrome-bottom">
        <Breadcrumb path="/recruiter" />
        <ChromeBottomRight />
      </div>

      <section className="kg-section kg-edge" aria-label="Recruiter view">
        <span className="kg-eyebrow">Recruiter view</span>
        <h1 className="kg-display kg-rise" style={{ marginTop: "2.5rem" }}>
          A short, scannable view of my work.
        </h1>
        <p className="kg-body kg-rise" style={{ marginTop: "2.5rem", maxWidth: "1100px" }}>
          Five projects, three highlights, three ways to reach me. For full
          editor access (passkey, MFA, AI studio), open the{" "}
          <Link
            href="/recruiter/admin"
            style={{ textDecoration: "underline", textUnderlineOffset: "0.32em" }}
          >
            admin
          </Link>
          .
        </p>
      </section>

      <SectionRule />

      <section className="kg-section kg-edge" aria-label="Highlights">
        <span className="kg-eyebrow">Highlights</span>
        <p className="kg-stream kg-rise" style={{ marginTop: "2.5rem" }}>
          {recruiterHighlights.map((h, i) => (
            <span key={h.title}>
              <span style={{ fontWeight: 500 }}>{h.title}</span>
              {" — "}
              {h.body}
              {i < recruiterHighlights.length - 1 ? "; " : "."}
            </span>
          ))}
        </p>
      </section>

      <SectionRule />

      <section className="kg-section kg-edge" aria-label="Selected projects">
        <span className="kg-eyebrow">Selected projects</span>
        <p className="kg-stream kg-rise" style={{ marginTop: "2.5rem" }}>
          {portfolioProjects.map((p, i) => (
            <span key={p.title}>
              <span style={{ fontWeight: 500 }}>{p.title}</span>
              {i < portfolioProjects.length - 1 ? "; " : "."}
            </span>
          ))}
        </p>
        <p className="kg-body kg-rise" style={{ marginTop: "2.5rem", maxWidth: "1100px" }}>
          {portfolioProjects.slice(0, 3).map((p, i) => (
            <span key={p.title} style={{ display: "block", marginBottom: "1.2rem" }}>
              <span style={{ fontWeight: 500 }}>{p.title}.</span>{" "}
              {p.recruiterNote}
              {i < 2 ? "" : ""}
            </span>
          ))}
        </p>
      </section>

      <SectionRule />

      <section className="kg-section kg-edge" aria-label="Contact">
        <span className="kg-eyebrow">Contact</span>
        <p
          className="kg-stream kg-rise"
          style={{ marginTop: "2.5rem", wordBreak: "break-word" }}
        >
          <a href={`mailto:${recruiterContacts.email}`}>
            {recruiterContacts.email}
          </a>
          ;{" "}
          <a
            href={recruiterContacts.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          ;{" "}
          <a
            href={recruiterContacts.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          .
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
