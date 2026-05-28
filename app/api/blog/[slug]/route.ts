import { NextResponse, type NextRequest } from 'next/server'
import { getSessionFromCookieHeader } from '@/lib/auth'
import { sql } from '@/lib/db'
import { ADMIN_EMAIL } from '@/lib/posts'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await getSessionFromCookieHeader(request.headers.get('cookie') ?? '')
  if (!session || session.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const rows = await sql`select * from blog_posts where slug = ${slug} limit 1`
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ post: rows[0] })
}
