"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import type { BlogPost } from "@/lib/blogs"
import { ArrowLeft } from "lucide-react"

type BlogDetailClientProps = {
  slug: string
  initialPost: BlogPost | null
}

export function BlogDetailClient({ slug, initialPost }: BlogDetailClientProps) {
  const [post, setPost] = useState<BlogPost | null>(initialPost)
  const router = useRouter()

  if (!post) {
    return (
      <main className="relative min-h-screen bg-black px-4 py-24 text-white sm:px-6 lg:px-8">
        <article className="mx-auto max-w-3xl rounded-3xl border border-white/15 bg-white/[0.03] p-8 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-10">
          <div className="mb-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-white/20"
            >
              Go back
            </button>
          </div>
          <h1 className="text-2xl font-bold">Blog not found</h1>
          <p className="mt-4 text-white/75">This blog may have been removed from local storage or never created.</p>
          <Link href="/blogs" className="mt-6 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.16em] text-white">
            Back to Blogs
          </Link>
        </article>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen bg-black px-4 py-24 text-white sm:px-6 lg:px-8">
      <article className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/15 bg-white/[0.03] p-8 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-white/20"
          >
            <ArrowLeft/>
          </button>
          <Link
            href="/blogs"
            className="rounded-full border border-white/20 bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/85 transition-colors hover:bg-white/10 hover:text-white"
          >
            All Blogs
          </Link>
        </div>

        <div className="mb-8 rounded-2xl border border-white/15 bg-gradient-to-r from-white/[0.08] via-white/[0.03] to-transparent p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-white/55">
            {post.publishedAt} · {post.readTime}
          </p>
          <h1 className="mt-4 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-3xl font-extrabold leading-tight text-transparent md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-5 text-base leading-8 text-white/75">{post.excerpt}</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 text-xs text-white/80">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-10 space-y-5 rounded-2xl border border-white/10 bg-black/30 p-6">
          {post.content.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-8 text-white/80 md:text-base">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </main>
  )
}
