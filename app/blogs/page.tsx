import { Suspense } from "react"
import { getAllBlogsFromDb } from "@/lib/blogs-db"
import { BlogsClient } from "@/components/ui/blogs-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function BlogsPage() {
  const blogPosts = await getAllBlogsFromDb()
  return (
    <main className="relative min-h-screen bg-black px-4 py-24 text-white sm:px-6 lg:px-8">
      <Suspense fallback={null}>
        <BlogsClient initialPosts={blogPosts} />
      </Suspense>
    </main>
  )
}
