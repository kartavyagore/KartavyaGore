export type PortfolioProject = {
  title: string
  tag: string
  summary: string
  stack: string[]
  status: string
  liveUrl?: string
  repoUrl: string
  recruiterNote: string
}

export const portfolioProjects: PortfolioProject[] = [
  {
    title: "Netflix Event Driven Architecture Microservice Backend Clone",
    tag: "Backend System",
    summary:
      "Built a scalable Netflix-like video streaming backend using an event-driven microservices architecture with Spring Boot, Apache Kafka, and AWS S3. The system asynchronously processes large video uploads (up to 2GB), automates encoding with FFmpeg, updates content dynamically, and enables secure high-performance streaming using Redis caching and S3 pre-signed URLs.",
    stack: ["Java", "Spring Boot", "Apache Kafka & Zookeeper", "Redis", "MySQL", "FFMPEG", "Docker"],
    status: "Complete",
    liveUrl: "",
    repoUrl: "https://github.com/kartavyagore/Netflix-Event-Driven-Architecture-Backend",
    recruiterNote: "Shows event-driven backend design, async processing, and infrastructure-heavy shipping.",
  },
  {
    title: "College Event Management Platform",
    tag: "Web Platform",
    summary:
      "A scalable full-stack platform Event management platform for colleges. implemented webAuthn, OAuth 2.0, OTP login along with Event CRUD API, ADMIN Dashboard",
    stack: ["Next.js", "TypeScript", "MySQL", "Docker"],
    status: "Complete",
    liveUrl: "https://now-on-campus.vercel.app/",
    repoUrl: "https://github.com/deccan-verse-08/NowOnCampus",
    recruiterNote: "Highlights auth work, admin workflows, and end-to-end product delivery.",
  },
  {
    title: "HealthJobsNow - Job Portal Application",
    tag: "SaaS Product",
    summary:
      "A job portal application built in Java Full Stack. The centralized infrastructure for the healthcare students where they can apply to the jobs which posted by healthcare sector recruiter.",
    stack: ["Next.js", "Java & Spring Boot", "Redis", "Docker", "PostgresQL", "AWS"],
    status: "In Progress",
    liveUrl: "",
    repoUrl: "https://github.com/deccan-verse-08/health-jobs-now-backend",
    recruiterNote: "Shows product thinking around a recruiter-driven platform and backend architecture.",
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
    recruiterNote: "Demonstrates auth, role-based product flows, and full-stack implementation.",
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
    recruiterNote: "Shows media pipeline work and performance-sensitive delivery.",
  },
]

export const recruiterHighlights = [
  {
    title: "Secure product work",
    body: "Passkey auth, password fallback, rate limiting, admin gating, and duplicate publish protection.",
  },
  {
    title: "Scalable backend systems",
    body: "Kafka, Redis, Docker, AWS, Spring Boot, and asynchronous processing for media-heavy flows.",
  },
  {
    title: "Full-stack delivery",
    body: "Next.js, TypeScript, React, MySQL, and polished admin or user-facing interfaces.",
  },
]

export const recruiterContacts = {
  email: "kartavyagore0@gmail.com",
  github: "https://github.com/kartavyagore",
  linkedin: "https://www.linkedin.com/in/kartavyagore/",
}

export const portfolioProfile = {
  name: "Kartavya Datta Gore",
  education: "Currently pursuing M.Sc Computer Science from Fergusson College and completed B.Sc. Computer Science from S.P. College, Pune.",
  role: "Java Full Stack Engineer",
  summary:
    "I build secure, production-minded web apps and backend systems with Java, Spring Boot, Next.js, TypeScript, MySQL, Docker, Kafka, Redis, AWS, and GCP.",
  strengths: [
    "Backend architecture",
    "Auth and security",
    "Event-driven systems",
    "Full-stack delivery",
    "Media pipelines",
    "Client-focused builds",
  ],
  quickFacts: [
    "Passkey auth and password fallback on the portfolio admin flow",
    "Rate limiting on auth, uploads, and AI endpoints",
    "Duplicate blog protection and blog image upload support",
    "Event-driven streaming backend with Kafka and FFmpeg",
  ],
  recruiterAngles: [
    "Use the backend and security work when the role is platform or API heavy.",
    "Use the full-stack and product delivery work when the role wants ownership end to end.",
    "Use the media pipeline work when the role touches video, storage, or performance-sensitive workflows.",
  ],
  preferredIntro:
    "I'm a Java Full Stack Engineer who likes building secure, scalable products end to end. My work often combines backend architecture, modern React frontends, and practical deployment choices that make the app easier to ship and maintain.",
}
