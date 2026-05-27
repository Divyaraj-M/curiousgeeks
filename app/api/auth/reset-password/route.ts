import { NextResponse, type NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { sql } from '@/lib/db'

export async function POST(request: NextRequest) {
  const { token, password } = await request.json() as { token: string; password: string }

  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })
  if (!password || password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const rows = await sql`
    select email from password_resets
    where token = ${token}
      and expires_at > now()
      and used = false
    limit 1
  `

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Reset link is invalid or has expired' }, { status: 400 })
  }

  const { email } = rows[0] as { email: string }
  const passwordHash = await bcrypt.hash(password, 12)

  await sql`update members set password_hash = ${passwordHash} where email = ${email}`
  await sql`update password_resets set used = true where token = ${token}`

  return NextResponse.json({ ok: true })
}
