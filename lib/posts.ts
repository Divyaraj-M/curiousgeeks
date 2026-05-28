import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { sql } from './db'
import type { PostMeta } from './types'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

export const ADMIN_EMAIL = 'divyaraj.murugan@curiousgeekspm.com'

function readingTime(text: string): string {
  const words = text.trim().split(/\s+/).length
  const mins = Math.max(1, Math.round(words / 200))
  return `${mins} min read`
}

// Neon returns timestamps as JS Date objects, not strings — use toISOString() not String()
function toDateStr(val: Date | string | null | undefined): string {
  if (!val) return ''
  const d = val instanceof Date ? val : new Date(val as string)
  return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
}

function fsPost(filename: string): PostMeta & { source: 'fs' } {
  const slug = filename.replace(/\.md$/, '')
  const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf8')
  const { data, content } = matter(raw)
  return {
    title: data.title || slug,
    description: data.description || '',
    date: data.date ? String(data.date).slice(0, 10) : '',
    tags: data.tags || [],
    slug,
    readingTime: readingTime(content),
    source: 'fs',
  }
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const fsPosts: PostMeta[] = fs.existsSync(BLOG_DIR)
    ? fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md')).map(fsPost)
    : []

  const dbRows = await sql`
    select slug, title, description, tags, content, published_at, created_at
    from blog_posts
    where published = true
    order by created_at desc
  `
  const dbPosts: PostMeta[] = dbRows.map(r => ({
    title: r.title,
    description: r.description || '',
    date: toDateStr(r.published_at ?? r.created_at),
    tags: r.tags || [],
    slug: r.slug,
    readingTime: readingTime(r.content),
  }))

  return [...fsPosts, ...dbPosts].sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getPostBySlug(slug: string): Promise<{ meta: PostMeta; content: string } | null> {
  // Check filesystem first
  const filePath = path.join(BLOG_DIR, `${slug}.md`)
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(raw)
    return {
      meta: {
        title: data.title || slug,
        description: data.description || '',
        date: data.date ? String(data.date).slice(0, 10) : '',
        tags: data.tags || [],
        slug,
        readingTime: readingTime(content),
      },
      content,
    }
  }

  // Then check database
  const rows = await sql`select * from blog_posts where slug = ${slug} and published = true limit 1`
  if (!rows.length) return null
  const r = rows[0]
  return {
    meta: {
      title: r.title,
      description: r.description || '',
      date: toDateStr(r.published_at ?? r.created_at),
      tags: r.tags || [],
      slug: r.slug,
      readingTime: readingTime(r.content),
    },
    content: r.content,
  }
}

// Admin-only: get all posts including drafts
export async function getAllPostsAdmin() {
  const rows = await sql`
    select id, slug, title, description, tags, published, published_at, created_at, updated_at
    from blog_posts
    order by created_at desc
  `
  return rows
}

export async function getPostBySlugAdmin(slug: string) {
  const rows = await sql`select * from blog_posts where slug = ${slug} limit 1`
  return rows[0] ?? null
}
