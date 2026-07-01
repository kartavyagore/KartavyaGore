import { notFound } from "next/navigation";
import Link from "next/link";
import { portfolioProjects } from "@/lib/portfolio-data";
import {
  Breadcrumb,
  ChromeBottomRight,
  CloseButton,
  Wordmark,
} from "@/components/chrome";
import { SectionRule } from "@/components/section-rule";

/* ---------------------------------------------------------------------------
   /projects/[slug] — the "popped out" project detail view.

   Server component. No client-side state. Static export.
--------------------------------------------------------------------------- */

export const dynamicParams = true;

type PageProps = {
  params: Promise<{ slug: string }>;
};

function slugFor(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function generateStaticParams() {
  return portfolioProjects.map((p) => ({ slug: slugFor(p.title) }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const project = portfolioProjects.find((p) => slugFor(p.title) === slug);
  if (!project) return { title: "Project — Kartavya Gore" };
  return {
    title: `${project.title} — Kartavya Gore`,
    description: project.summary,
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = portfolioProjects.find((p) => slugFor(p.title) === slug);
  if (!project) notFound();

  return (
    <main className="kg-page">
      <div className="kg-chrome">
        <Wordmark />
        <CloseButton to="/projects" />
      </div>
      <div className="kg-chrome-bottom">
        <Breadcrumb path={`/projects/${slug}`} />
        <ChromeBottomRight />
      </div>

      <section className="kg-section kg-edge" aria-label={project.title}>
        <span className="kg-eyebrow">Projects</span>
        <h1
          className="kg-detail-title kg-rise"
          style={{ marginTop: "2.5rem" }}
        >
          {project.title}
        </h1>
        <p
          className="kg-detail-meta"
          style={{ marginTop: "1.5rem" }}
        >
          {project.tag}
          <span className="kg-dot">·</span>
          {project.status}
        </p>
      </section>

      <SectionRule />

      <section
        className="kg-section kg-edge"
        aria-label="Summary"
        style={{ minHeight: "auto", paddingTop: "4rem", paddingBottom: "4rem" }}
      >
        <span className="kg-eyebrow">Summary</span>
        <p
          className="kg-body kg-rise"
          style={{ marginTop: "2.5rem", maxWidth: "1200px" }}
        >
          {project.summary}
        </p>
      </section>

      <SectionRule />

      <section
        className="kg-section kg-edge"
        aria-label="Stack"
        style={{ minHeight: "auto", paddingTop: "4rem", paddingBottom: "4rem" }}
      >
        <span className="kg-eyebrow">Stack</span>
        <p className="kg-stream kg-rise" style={{ marginTop: "2.5rem" }}>
          {project.stack.map((s, i) => (
            <span key={s}>
              <span>{s}</span>
               {i < project.stack.length - 1 ? "; " : "."}
            </span>
          ))}
        </p>
      </section>

      <SectionRule />

      <section
        className="kg-section kg-edge"
        aria-label="Links"
        style={{ minHeight: "auto", paddingTop: "4rem", paddingBottom: "4rem" }}
      >
        <span className="kg-eyebrow">Links</span>
        <p
          className="kg-stream kg-rise"
          style={{ marginTop: "2.5rem", wordBreak: "break-word" }}
        >
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Source
          </a>
          <br />
          {project.liveUrl ? (
            <>
              <a
                href={
                  project.liveUrl.startsWith("http")
                    ? project.liveUrl
                    : `https://${project.liveUrl}`
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                Live
              </a>
              <br />
            </>
          ) : null}
          <Link href="/projects">← Back to all projects</Link>
        </p>
      </section>

      <SectionRule />

      <section
        className="kg-section kg-edge"
        aria-label="Recruiter note"
        style={{ minHeight: "auto", paddingTop: "4rem", paddingBottom: "4rem" }}
      >
        <span className="kg-eyebrow">Note</span>
        <p
          className="kg-body kg-rise"
          style={{ marginTop: "2.5rem", maxWidth: "1200px" }}
        >
          {project.recruiterNote}
        </p>
      </section>
    </main>
  );
}
