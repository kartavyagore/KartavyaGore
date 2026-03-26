import { getAllBlogsFromDb, getBlogBySlugFromDb } from "@/lib/blogs-db"
import { BlogDetailClient } from "@/components/ui/blog-detail-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params
  const post = await getBlogBySlugFromDb(slug)

  return <BlogDetailClient slug={slug} initialPost={post ?? null} />
}
