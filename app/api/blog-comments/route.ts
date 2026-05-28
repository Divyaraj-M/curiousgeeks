import { NextResponse, type NextRequest } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

  const rows = await sql`
    select * from blog_comments
    where post_slug = ${slug}
    order by created_at asc
  `
  return NextResponse.json({ comments: rows })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Sign in to comment' }, { status: 401 })
  }

  const members = await sql`select id from members where email = ${session.email} limit 1`
  if (!members.length) {
    return NextResponse.json({ error: 'Community members only' }, { status: 403 })
  }

  const { postSlug, body } = await request.json() as { postSlug: string; body: string }

  if (!postSlug?.trim()) return NextResponse.json({ error: 'Post slug required' }, { status: 400 })
  if (!body?.trim()) return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 })

  const rows = await sql`
    insert into blog_comments (post_slug, author_name, author_email, body)
    values (${postSlug}, ${session.name}, ${session.email}, ${body.trim()})
    returning *
  `
  return NextResponse.json({ comment: rows[0] })
}
