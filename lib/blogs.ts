import { RowDataPacket } from "mysql2"

export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  publishedAt: string
  readTime: string
  tags: string[]
  content: string[]
}

export interface BlogRow extends RowDataPacket {
  slug: string
  title: string
  excerpt: string
  content: string
  published_at: string | null
  read_time: string | null
  tags: string | null
}

