import { RowDataPacket } from "mysql2"

export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  imageUrl?: string | null
  publishedAt: string
  readTime: string
  tags: string[]
  content: string[]
}

export interface BlogRow extends RowDataPacket {
  slug: string
  title: string
  excerpt: string
  image_url: string | null
  content: string
  published_at: string | null
  read_time: string | null
  tags: string | null
}

