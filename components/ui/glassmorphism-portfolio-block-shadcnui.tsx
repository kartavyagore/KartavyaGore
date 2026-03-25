"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion, type Variants } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { ArrowUpRight, Briefcase, FolderGit2, Mail, X } from "lucide-react"

type Highlight = {
  title: string
  description: string
}

type SocialLink = {
  label: string
  handle: string
  href: string
  icon: LucideIcon
}

const highlights: Highlight[] = [
  {
    title: "Core stack",
    description: "Java full stack - Java, Spring Boot, Next.js",
  },
  {
    title: "Recent Work",
    description: "Founded an LLP and delivering tailored software solutions to clients, focusing on scalable and efficient systems."
  },
  {
    title: "Availability",
    description: "Open for full-time software engineering opportunities and impactful collaborations.",
  },
]

const socialLinks: SocialLink[] = [
  {
    label: "X",
    handle: "@kartavya",
    href: "https://x.com",
    icon: X,
  },
  {
    label: "LinkedIn",
    handle: "Kartavya Gore",
    href: "https://linkedin.com/in/kartavya-gore",
    icon: Briefcase,
  },
  {
    label: "GitHub",
    handle: "kartavyagore",
    href: "https://github.com/kartavyagore",
    icon: FolderGit2,
  },
  {
    label: "Email",
    handle: "kartavyagore0@gmail.com",
    href: "mailto:kartavyagore0@gmail.com",
    icon: Mail,
  },
]

const listVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.08,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
    },
  },
}

export function GlassmorphismPortfolioBlock() {
  return (
    <section className="relative min-h-screen overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl border border-white/15 bg-black/55 p-6 backdrop-blur-2xl md:p-10"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-transparent" />

          <div className="relative grid gap-10 lg:grid-cols-2">
            <div className="space-y-7">
              <Badge
                variant="outline"
                className="inline-flex items-center gap-2 rounded-full border-white/20 bg-black/20 px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-white/80 backdrop-blur transition-colors hover:bg-black/35"
              >
                Portfolio Insight
              </Badge>

              <div className="space-y-4">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-2xl font-semibold tracking-tight text-white md:text-3xl"
                >
                  Kartavya Gore, Software Engineer
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="max-w-xl text-base leading-relaxed text-white/75"
                >
                  Java full stack engineer building real-world products end-to-end, from responsive UI to reliable
                  backend services and deployment pipelines.
                </motion.p>
              </div>

              <div className="grid gap-4">
                {highlights.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    whileHover={{ y: -4 }}
                    className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.03] p-5 transition-all hover:border-white/30 hover:shadow-lg"
                  >
                    <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">{item.title}</p>
                      <p className="text-sm leading-relaxed text-white/75">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="grid grid-cols-1 gap-4"
              >
                <Button
                  size="lg"
                  onClick={() => window.open("https://github.com/kartavyagore", "_blank")}
                  className="h-12 w-full gap-2 rounded-full px-8 text-sm uppercase tracking-[0.2em] sm:w-auto"
                >
                  View projects
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-[32px] bg-gradient-to-b from-indigo-300/20 via-transparent to-transparent blur-3xl" />
              <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[28px] border border-white/15 bg-black/45 p-8 backdrop-blur-xl">
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="relative mb-6"
                  >
                    <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/15 blur-2xl" />
                    <img
                      src="https://img.icons8.com/?size=100&id=z-JBA_KtSkxG&format=png&color=000000"
                      alt="Kartavya Gore"
                      className="relative h-32 w-32 rounded-full border border-white/30 object-cover shadow-[0_25px_60px_rgba(0,0,0,0.55)]"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="space-y-1"
                  >
                    <h3 className="text-2xl font-semibold tracking-tight text-white">Kartavya Gore</h3>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55">
                      Java Full Stack Engineer
                    </p>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-4 max-w-sm text-sm leading-relaxed text-white/75"
                  >
                    Building practical software with strong engineering fundamentals and user-focused product thinking.
                  </motion.p>
                </div>

                <motion.div
                  variants={listVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-80px" }}
                  className="mt-8 flex flex-col gap-3"
                >
                  {socialLinks.map((social) => {
                    const Icon = social.icon
                    return (
                      <motion.a
                        key={social.label}
                        variants={itemVariants}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-white/30 hover:bg-black/45"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.985 }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white/85">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-white">{social.label}</p>
                            <p className="text-xs text-white/65">{social.handle}</p>
                          </div>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-white/45 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/80" />
                      </motion.a>
                    )
                  })}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
