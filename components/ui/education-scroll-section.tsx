"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type EducationItem = {
  degree: string
  school: string
  period: string
  details: string
}

const educationItems: EducationItem[] = [
  {
    degree: "Bachelor of Computer Science",
    school: "Sir Parshurambhau College",
    period: "2022 - 2025",
    details:
      "Focused on software engineering, data structures, databases, and full-stack application development.",
  },
  {
    degree: "Master of Computer Science",
    school: "Fergusson College",
    period: "2025 - 2027",
    details:
      "Built strong fundamentals in mathematics and computer science with practical coding exposure.",
  },
  {
    degree: "Certifications & Continuous Learning",
    school: "Online Platforms / Bootcamps",
    period: "2022 - Present",
    details:
      "Advanced coursework in Java & Spring Boot, React, cloud deployment, and scalable system design.",
  },
]

export function EducationScrollSection() {
  return (
    <section className="relative bg-background px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Education</p>
          <h2 className="font-archive mt-3 bg-gradient-to-r from-foreground via-accent to-purple-500 bg-clip-text text-3xl font-bold text-transparent md:text-5xl">
            Academic Journey
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">
            Replace these placeholders with your actual education details, achievements, and key learning milestones.
          </p>
        </motion.div>

        <div className="relative mx-auto max-w-3xl">
          <div className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-foreground/50 via-foreground/20 to-transparent md:left-1/2 md:-translate-x-1/2" />

          <div className="space-y-8">
            {educationItems.map((item, index) => (
              <motion.article
                key={`${item.degree}-${index}`}
                initial={{ opacity: 0, y: 60, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.55, delay: index * 0.08, ease: "easeOut" }}
                className="relative md:grid md:grid-cols-2 md:gap-8"
              >
                <div className={cn("hidden md:block", index % 2 === 0 ? "" : "md:order-2")} />

                <div
                  className={cn(
                    "md:col-span-1",
                    index % 2 === 0 ? "" : "md:order-1",
                  )}
                >
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-xl backdrop-blur"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {item.period}
                    </p>
                    <h3 className="font-archive mt-2 text-lg font-semibold md:text-xl">
                      {item.degree}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-accent">{item.school}</p>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.details}</p>
                  </motion.div>
                </div>

                <div className="absolute left-4 top-8 h-3 w-3 -translate-x-1/2 rounded-full border border-accent/60 bg-accent shadow-[0_0_20px_var(--color-accent)] md:left-1/2" />
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}