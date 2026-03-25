"use client"

import { motion, useScroll, useSpring, useTransform } from "framer-motion"

type Project = {
  title: string
  tag: string
  summary: string
  stack: string[]
  status: string
  liveUrl?: string
  repoUrl: string
}



const projects: Project[] = [
  {
    title: "Event Management Platform",
    tag: "Web Platform",
    summary:
      "A scalable full-stack platform Event management platform for colleges. implemented webAuthn, OAuth 2.0, OTP login along with Event CRUD API, ADMIN Dashboard",
    stack: ["Next.js", "TypeScript", "MySQL", "Docker"],
    status: "Complete",
    liveUrl: "https://now-on-campus.vercel.app/",
    repoUrl: "https://github.com/deccan-verse-08/NowOnCampus",
  },
  {
    title: "HealthJobsNow - Job Portal Application",
    tag: "SaaS Product",
    summary:
      "A job portal application built in Java Full Stack. The centralized infrastructure for the healthcare students where they can apply to the jobs which posted by healthcare sector recruiter.",
    stack: ["Next.js", "Java & Spring Boot", "Redis", "Docker","PostgresQL","AWS"],
    status: "In Progress",
    liveUrl: "",
    repoUrl: "https://github.com/deccan-verse-08/health-jobs-now-backend",
  },
  {
    title: "WorkSite - Job Portal Application",
    tag: "Web Application",
    summary:
      "A job portal application for the blue collar worker where they can apply to the jobs which posted by Blue Collar Job Contractor. Implemented authentication system and Google OAuth 2.0 for secure login.",
    stack: ["Node.js", "React.js", "OAuth 2.0", "MySql"],
    status: "Completed",
    liveUrl: "",
    repoUrl: "https://github.com/kartavyagore/worksite-portal",
  },
  {
    title: "Youtube Clone - Adaptive Streaming",
    tag: "Web Application",
    summary:
      "Engineered a single feature of Youtube (Adaptive Streaming) where I built a video pipeline that transcodes uploads into multiple resolutions using FFmpeg onto GCP Object Storage Bucket.",
    stack: ["TypeScript", "GCP Cloud Bucket", "Next.js", "FFmpeg"],
    status: "Completed",
    liveUrl: "",
    repoUrl: "https://github.com/kartavyagore/YT-Clone-GCP",
  },
]



export default function ProjectsPage() {
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.2 })
  const ySlow = useTransform(scrollYProgress, [0, 1], [0, -120])
  const yFast = useTransform(scrollYProgress, [0, 1], [0, -220])

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <motion.div className="fixed left-0 right-0 top-0 z-50 h-1 origin-left bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400" style={{ scaleX: progress }} />

      <motion.div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" style={{ y: ySlow }} />
      <motion.div className="pointer-events-none absolute -right-40 top-72 h-[28rem] w-[28rem] rounded-full bg-purple-500/20 blur-3xl" style={{ y: yFast }} />

      <section className="relative mx-auto flex min-h-[90vh] max-w-6xl flex-col justify-center px-4 py-24 sm:px-6 lg:px-8">
        {/* <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xs uppercase tracking-[0.3em] text-white/60"
        >
          Projects
        </motion.p> */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-4 w-full bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-4xl font-extrabold leading-tight text-transparent md:text-6xl"
        >
          Scroll Through My Build Journey
        </motion.h1>
        
      </section>

      <section className="relative mx-auto max-w-6xl px-4 pb-32 sm:px-6 lg:px-8">
        <div className="grid gap-8">
          {projects.map((project, index) => (
            <motion.article
              key={project.title}
              initial={{ opacity: 0, y: 80, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.03] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-8"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative grid gap-8 md:grid-cols-[1.2fr_1fr]">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/75">
                      {project.tag}
                    </span>
                    <span className="text-xs uppercase tracking-[0.16em] text-white/50">{project.status}</span>
                  </div>

                  <h2 className="mt-4 text-2xl font-bold tracking-tight text-white md:text-3xl">{project.title}</h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 md:text-base">{project.summary}</p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-white/20"
                      >
                        Live Demo
                      </a>
                    )}
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-white/20 bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      GitHub Repo
                    </a>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/35 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/55">Tech Stack</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.stack.map((tech) => (
                      <span key={tech} className="rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 text-xs text-white/85">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      
    </main>
  )
}
