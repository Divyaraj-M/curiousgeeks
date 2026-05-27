import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { PostMeta } from './types'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

function readingTime(text: string): string {
  const words = text.trim().split(/\s+/).length
  const mins = Math.max(1, Math.round(words / 200))
  return `${mins} min read`
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'))
  return files
    .map(filename => {
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
      }
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getPostBySlug(slug: string) {
  const filePath = path.join(BLOG_DIR, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null
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
    } as PostMeta,
    content,
  }
}
