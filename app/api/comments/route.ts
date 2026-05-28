import { NextResponse, type NextRequest } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import type { Comment } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug')
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug param' }, { status: 400 })
  }

  const rows = await sql`
    select * from comments
    where product_slug = ${slug}
    order by created_at asc
  `
  return NextResponse.json({ comments: rows as Comment[] })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Sign in to leave a review' }, { status: 401 })
  }

  // Verify still a member
  const members = await sql`select id from members where email = ${session.email} limit 1`
  if (members.length === 0) {
    return NextResponse.json({ error: 'Community members only' }, { status: 403 })
  }

  const { productSlug, body, rating } = await request.json() as { productSlug: string; body: string; rating: number }

  if (!productSlug?.trim()) {
    return NextResponse.json({ error: 'Product slug required' }, { status: 400 })
  }
  if (!body?.trim()) {
    return NextResponse.json({ error: 'Review cannot be empty' }, { status: 400 })
  }
  if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'A star rating (1–5) is required' }, { status: 400 })
  }

  const rows = await sql`
    insert into comments (product_slug, author_name, author_email, body, rating)
    values (${productSlug}, ${session.name}, ${session.email}, ${body.trim()}, ${rating})
    returning *
  `

  return NextResponse.json({ comment: rows[0] as Comment })
}
