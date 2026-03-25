"use client"

import { motion } from "framer-motion"

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
    details: "Focused on software engineering, data structures, databases, and full-stack application development.",
  },
  {
    degree: "Master of Computer Science",
    school: "Fergusson College",
    period: "2025 - 2027",
    details: "Built strong fundamentals in mathematics and computer science with practical coding exposure.",
  },
  {
    degree: "Certifications & Continuous Learning",
    school: "Online Platforms / Bootcamps",
    period: "2022 - Present",
    details: "Advanced coursework in Java & Spring Boot, React, cloud deployment, and scalable system design.",
  },
]

export function EducationScrollSection() {
  return (
    <section className="relative bg-black px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-white/60">Education</p>
          <h2 className="mt-3 bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-3xl font-bold text-transparent md:text-5xl">
            Academic Journey
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-white/75 md:text-base">
            Replace these placeholders with your actual education details, achievements, and key learning milestones.
          </p>
        </motion.div>

        <div className="relative mx-auto max-w-3xl">
          <div className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-white/50 via-white/20 to-transparent md:left-1/2 md:-translate-x-1/2" />

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
                <div className={`hidden md:block ${index % 2 === 0 ? "" : "md:order-2"}`} />

                <div className={`md:col-span-1 ${index % 2 === 0 ? "" : "md:order-1"}`}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="rounded-2xl border border-white/15 bg-white/[0.04] p-5 text-white shadow-xl backdrop-blur"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-white/60">{item.period}</p>
                    <h3 className="mt-2 text-lg font-semibold md:text-xl">{item.degree}</h3>
                    <p className="mt-1 text-sm font-medium text-blue-200">{item.school}</p>
                    <p className="mt-3 text-sm leading-7 text-white/80">{item.details}</p>
                  </motion.div>
                </div>

                <div className="absolute left-4 top-8 h-3 w-3 -translate-x-1/2 rounded-full border border-white/60 bg-blue-300 shadow-[0_0_20px_rgba(147,197,253,0.8)] md:left-1/2" />
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

