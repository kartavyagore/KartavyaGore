import { recruiterContacts } from "@/lib/portfolio-data";
import {
  Breadcrumb,
  ChromeBottomRight,
  CloseButton,
  Wordmark,
} from "@/components/chrome";
import { SectionRule } from "@/components/section-rule";
import Link from "next/link";

/**
 * The "Contact" detail view. Full-screen, no scroll-snap. Three huge
 * serif links: email, GitHub, LinkedIn. The × close button returns
 * the user to "/".
 */
export default function ContactPage() {
  return (
    <main className="kg-page">
      <div className="kg-chrome">
        <Wordmark />
        <CloseButton to="/" />
      </div>
      <div className="kg-chrome-bottom">
        <Breadcrumb path="/contact" />
        <ChromeBottomRight />
      </div>

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
        aria-label="Availability"
        style={{ minHeight: "auto", paddingTop: "4rem", paddingBottom: "4rem" }}
      >
        <span className="kg-eyebrow">Availability</span>
        <p
          className="kg-body kg-rise"
          style={{ marginTop: "2.5rem", maxWidth: "1200px" }}
        >
          For full-stack and backend roles, freelance work, or to talk shop. I
          read every message and reply within a day or two.
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
