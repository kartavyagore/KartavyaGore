"use client"

import Link from "next/link"
import { ArrowRight, BriefcaseBusiness, Mail, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  portfolioProjects,
  recruiterContacts,
  recruiterHighlights,
} from "@/lib/portfolio-data"

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
)

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
      clipRule="evenodd"
    />
  </svg>
)

export default function RecruiterMode() {
  const featuredProjects = portfolioProjects.slice(0, 3)

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16),transparent_35%)]" />

      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-cyan-100"
          >
            <BriefcaseBusiness className="h-3.5 w-3.5" />
            Recruiter Mode
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-7xl"
          >
            A fast scan of what I build, how I ship, and why it matters.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-6 max-w-2xl text-base leading-8 text-white/72 sm:text-lg"
          >
            This view keeps the signal high: secure systems, full-stack delivery, and a few projects that show
            real product thinking.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <a
              href={`mailto:${recruiterContacts.email}`}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5"
            >
              <Mail className="h-4 w-4" />
              Email Me
            </a>
            <a
              href={recruiterContacts.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <LinkedinIcon className="h-4 w-4" />
              LinkedIn
            </a>
            <a
              href={recruiterContacts.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <GithubIcon className="h-4 w-4" />
              GitHub
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition-colors hover:bg-cyan-400/15"
            >
              <Sparkles className="h-4 w-4" />
              Full Portfolio
            </Link>
          </motion.div>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {recruiterHighlights.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <Card className="h-full border-white/10 bg-white/[0.04] text-white backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription className="text-white/65">{item.body}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {featuredProjects.map((project, index) => (
            <motion.article
              key={project.title}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, delay: index * 0.08 }}
              className="group rounded-3xl border border-white/12 bg-white/[0.03] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.42)] backdrop-blur-xl"
            >
              <div className="flex items-center justify-between gap-3">
                <Badge className="border border-white/15 bg-white/10 text-white/80">{project.tag}</Badge>
                <span className="text-xs uppercase tracking-[0.18em] text-white/45">{project.status}</span>
              </div>

              <h2 className="mt-5 text-2xl font-bold tracking-tight text-white">{project.title}</h2>
              <p className="mt-4 text-sm leading-7 text-white/72">{project.summary}</p>

              <div className="mt-5 rounded-2xl border border-cyan-400/15 bg-cyan-400/8 p-4 text-sm text-cyan-50">
                {project.recruiterNote}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs text-white/80"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-3">
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/85 transition-colors hover:bg-white/10"
                >
                  Repo
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
                {project.liveUrl ? (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-black transition-transform hover:-translate-y-0.5"
                  >
                    Live Demo
                  </a>
                ) : null}
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </main>
  )
}
