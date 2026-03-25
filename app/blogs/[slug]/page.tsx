import { getAllBlogsFromDb, getBlogBySlugFromDb } from "@/lib/blogs-db"
import { BlogDetailClient } from "@/components/ui/blog-detail-client"

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const blogPosts = await getAllBlogsFromDb()
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params
  const post = await getBlogBySlugFromDb(slug)

  return <BlogDetailClient slug={slug} initialPost={post ?? null} />
}
