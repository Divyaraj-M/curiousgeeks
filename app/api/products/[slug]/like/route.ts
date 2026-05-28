import { NextResponse, type NextRequest } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Sign in to like products' }, { status: 401 })
  }

  const members = await sql`select id from members where email = ${session.email} limit 1`
  if (!members.length) {
    return NextResponse.json({ error: 'Community members only' }, { status: 403 })
  }

  const { slug } = await params

  const existing = await sql`
    select id from product_likes
    where product_slug = ${slug} and member_email = ${session.email}
    limit 1
  `

  let liked: boolean

  if (existing.length > 0) {
    await sql`
      delete from product_likes
      where product_slug = ${slug} and member_email = ${session.email}
    `
    liked = false
  } else {
    await sql`
      insert into product_likes (product_slug, member_email)
      values (${slug}, ${session.email})
      on conflict (product_slug, member_email) do nothing
    `
    liked = true
  }

  const countRows = await sql`
    select count(*) as count from product_likes where product_slug = ${slug}
  `
  const count = Number(countRows[0].count)

  return NextResponse.json({ liked, count })
}
