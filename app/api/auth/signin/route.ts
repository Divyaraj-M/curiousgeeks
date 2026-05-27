import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { sql } from '@/lib/db'
import { signSession, sessionCookieOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json() as { email: string; password: string }

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  const lower = email.toLowerCase().trim()
  const rows = await sql`
    select first_name, last_name, password_hash from members
    where email = ${lower} limit 1
  `

  if (rows.length === 0) {
    return NextResponse.json({ error: 'No account found with that email' }, { status: 401 })
  }

  const member = rows[0] as { first_name: string; last_name: string; password_hash: string }

  if (!member.password_hash) {
    return NextResponse.json({ error: 'Account has no password set — contact support' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, member.password_hash)
  if (!valid) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const name = `${member.first_name} ${member.last_name}`.trim()
  const token = await signSession({ email: lower, name })
  const cookieStore = await cookies()
  cookieStore.set(sessionCookieOptions(token))

  return NextResponse.json({ ok: true, name })
}
