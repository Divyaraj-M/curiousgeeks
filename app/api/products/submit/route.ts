import { NextResponse, type NextRequest } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function uniqueSlug(base: string): Promise<string> {
  let candidate = base
  const rows = await sql`select slug from products where slug like ${base + '%'}`
  const existing = new Set((rows as { slug: string }[]).map(r => r.slug))
  if (!existing.has(candidate)) return candidate
  candidate = `${base}-${Date.now()}`
  return candidate
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Sign in to submit a product' }, { status: 401 })
  }

  // Verify still a member
  const members = await sql`select id from members where email = ${session.email} limit 1`
  if (members.length === 0) {
    return NextResponse.json({ error: 'You must be a community member to submit' }, { status: 403 })
  }

  const { name, url, tagline, description, category, tags, stage } =
    await request.json() as {
      name: string
      url: string
      tagline: string
      description?: string
      category?: string
      tags?: string
      stage?: string
    }

  if (!name?.trim()) return NextResponse.json({ error: 'Product name is required' }, { status: 400 })
  if (!url?.trim()) return NextResponse.json({ error: 'Product URL is required' }, { status: 400 })
  if (!tagline?.trim()) return NextResponse.json({ error: 'Tagline is required' }, { status: 400 })

  const slug = await uniqueSlug(slugify(name))
  const tagsArray = tags
    ? tags.split(',').map(t => t.trim()).filter(Boolean)
    : []

  await sql`
    insert into products
      (name, slug, tagline, description, url, maker_name, maker_email, category, tags, stage, approved)
    values
      (${name.trim()}, ${slug}, ${tagline.trim()}, ${description?.trim() ?? null},
       ${url.trim()}, ${session.name}, ${session.email},
       ${category ?? null}, ${tagsArray}, ${stage ?? null}, true)
  `

  return NextResponse.json({ ok: true, slug })
}
