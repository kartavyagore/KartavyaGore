import Link from "next/link";
import {
  portfolioProjects,
  portfolioProfile,
  recruiterContacts,
} from "@/lib/portfolio-data";
import { getAllBlogsFromDb } from "@/lib/blogs-db";
import { Breadcrumb, ChromeBottomRight, Wordmark } from "@/components/chrome";
import { SectionRule } from "@/components/section-rule";
import { CollapsibleSection } from "@/components/collapsible-section";

/* ---------------------------------------------------------------------------
   Editorial home (fionavilmer.com look).

   The home page is a single long scroll. The first section is the
   giant opening sentence (always full). Each subsequent section is
   a "row" — collapsed by default, with only a peek of its giant
   serif content visible.

     1. Hero — single huge serif sentence (always full).
     2. Projects — collapsed stream of project titles. Click → /projects.
     3. Writing — collapsed stream of post titles. Click → /blogs.
     4. Open source — collapsed stream of repo links. Click → GitHub.
     5. About — collapsed short bio. Click → /about.
     6. Contact — collapsed email + socials. Click → /contact.

   On hover (or focus), the section's body scales up slightly and
   more of the giant text is revealed. Click anywhere on the section
   to navigate to the section's index page; click an inline link to
   open that item directly.
--------------------------------------------------------------------------- */

export const revalidate = 60;

export default async function Home() {
  const posts = (await getAllBlogsFromDb()) ?? [];

  const stream = portfolioProjects;

  // Build a slug from a project title.
  const slugForProject = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  return (
    <main className="kg-page">
      {/* Fixed chrome — overlays every section. */}
      <div className="kg-chrome">
        <Wordmark />
      </div>
      <div className="kg-chrome-bottom">
        <Breadcrumb path="" />
        <ChromeBottomRight />
      </div>

      {/* 1. Hero — the single huge opening sentence. */}
      <section className="kg-section kg-edge" aria-label="Introduction">
        <p className="kg-display">
         <Link
            href="/about"
            style={{
              backgroundImage: "linear-gradient(currentColor, currentColor)",
              backgroundSize: "100% 1px",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "0 92%",
            }}
          >
          {portfolioProfile.name.split(" ")[0]} {portfolioProfile.name.split(" ")[2]}
          </Link>{" "}
          is a {portfolioProfile.role.toLowerCase()} based in Pune. He builds
          secure, production minded web apps and backend systems, mostly with{" "}
          Java, Spring Boot, Next.js, and TypeScript.
        </p>
      </section>

      <SectionRule />

      {/* 2. Projects — collapsed stream of project titles. */}
      <CollapsibleSection
        label="Projects"
        href="/projects"
        ariaLabel="Projects"
        id="projects"
      >
        <p className="kg-stream">
          {stream.map((p, i) => (
            <span key={p.title}>
              <Link
                href={`/projects/${slugForProject(p.title)}`}
                aria-label={p.title}
              >
                {p.title}
              </Link>
              {i < stream.length - 1 ? "; " : "."}
            </span>
          ))}
        </p>
      </CollapsibleSection>

      <SectionRule />

      {/* 3. Writing — collapsed stream of post titles. */}
      <CollapsibleSection
        label="Writing"
        href="/blogs"
        ariaLabel="Writing"
        id="writing"
      >
        <p className="kg-stream">
          {posts.length === 0 ? (
            <span>Notes on engineering, security, and product.</span>
          ) : (
            posts.slice(0, 5).map((post, i) => (
              <span key={post.slug}>
                <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
                {i < Math.min(posts.length, 5) - 1 ? "; " : "."}
              </span>
            ))
          )}
        </p>
      </CollapsibleSection>

      <SectionRule />

      {/* 4. Open source — collapsed stream of repo links. */}
      <CollapsibleSection
        label="Open source"
        href={recruiterContacts.github}
        ariaLabel="Open source"
        id="open-source"
        labelIsSpan
      >
        <p className="kg-stream">
          <span>
            <a
              href="https://github.com/kartavyagore/Netflix-Event-Driven-Architecture-Backend"
              target="_blank"
              rel="noopener noreferrer"
            >
              Netflix Event Driven Backend
            </a>
            ;{" "}
          </span>
          <span>
            <a
              href="https://github.com/deccan-verse-08/health-jobs-now-frontend"
              target="_blank"
              rel="noopener noreferrer"
            >
              Health Jobs Now
            </a>
            ;{" "}
          </span>
          <span>
            <a
              href="https://github.com/deccan-verse-08/NowOnCampus"
              target="_blank"
              rel="noopener noreferrer"
            >
              Now On Campus
            </a>
            ;{" "}
          </span>
          <span>
            <a
              href="https://github.com/kartavyagore/worksite-portal"
              target="_blank"
              rel="noopener noreferrer"
            >
              WorkSite
            </a>
            ;{" "}
          </span>
          <span>
            <a
              href="https://github.com/kartavyagore/YT-Clone-GCP"
              target="_blank"
              rel="noopener noreferrer"
            >
              YouTube Clone Adaptive Streaming
            </a>
            .
          </span>
        </p>
      </CollapsibleSection>

      <SectionRule />

      {/* 5. About — collapsed short bio. */}
      <CollapsibleSection
        label="About"
        href="/about"
        ariaLabel="About"
        id="about"
      >
        <p className="kg-stream">
          {portfolioProfile.preferredIntro}
        </p>
      </CollapsibleSection>

      <SectionRule />

      {/* 6. Contact — collapsed email + socials. */}
      <CollapsibleSection
        label="Contact"
        href="/contact"
        ariaLabel="Contact"
        id="contact"
      >
        <p
          className="kg-stream"
          style={{ wordBreak: "break-word" }}
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
      </CollapsibleSection>
    </main>
  );
}
