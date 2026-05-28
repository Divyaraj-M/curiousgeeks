import { NextResponse, type NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import { ADMIN_EMAIL } from '@/lib/posts'

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

async function requireAdmin(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const { getSessionFromCookieHeader } = await import('@/lib/auth')
  const session = await getSessionFromCookieHeader(cookieHeader)
  if (!session || session.email !== ADMIN_EMAIL) return null
  return session
}

// POST — create post
export async function POST(request: NextRequest) {
  const session = await requireAdmin(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, description, content, tags, publish, slug: customSlug } =
    await request.json() as {
      title: string; description: string; content: string
      tags: string; publish: boolean; slug?: string
    }

  if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  if (!content?.trim()) return NextResponse.json({ error: 'Content is required' }, { status: 400 })

  const baseSlug = customSlug?.trim() || slugify(title)
  // Ensure unique slug
  const existing = await sql`select id from blog_posts where slug = ${baseSlug} limit 1`
  const slug = existing.length ? `${baseSlug}-${Date.now()}` : baseSlug

  const tagsArray = tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []
  const publishedAt = publish ? new Date().toISOString() : null

  const rows = await sql`
    insert into blog_posts (slug, title, description, content, tags, published, published_at)
    values (${slug}, ${title.trim()}, ${description?.trim() || ''}, ${content.trim()}, ${tagsArray}, ${publish}, ${publishedAt})
    returning id, slug
  `
  return NextResponse.json({ ok: true, slug: rows[0].slug, id: rows[0].id })
}

// PATCH — update post
export async function PATCH(request: NextRequest) {
  const session = await requireAdmin(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, title, description, content, tags, publish } =
    await request.json() as {
      id: string; title: string; description: string
      content: string; tags: string; publish: boolean
    }

  const tagsArray = tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []

  const existing = await sql`select published, published_at from blog_posts where id = ${id} limit 1`
  if (!existing.length) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

  const wasPublished = existing[0].published
  const publishedAt = publish && !wasPublished ? new Date().toISOString() : existing[0].published_at

  const rows = await sql`
    update blog_posts
    set title = ${title.trim()},
        description = ${description?.trim() || ''},
        content = ${content.trim()},
        tags = ${tagsArray},
        published = ${publish},
        published_at = ${publishedAt},
        updated_at = now()
    where id = ${id}
    returning slug
  `
  return NextResponse.json({ ok: true, slug: rows[0].slug })
}
