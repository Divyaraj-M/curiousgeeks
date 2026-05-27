import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/db'
import { signSession, sessionCookieOptions } from '@/lib/auth'
import type { Member } from '@/lib/types'

export async function POST(request: NextRequest) {
  const { email, code } = await request.json() as { email: string; code: string }

  if (!email || !code) {
    return NextResponse.json({ error: 'Email and code required' }, { status: 400 })
  }

  const lower = email.toLowerCase().trim()

  // Find valid OTP
  const otps = await sql`
    select id from otps
    where email = ${lower}
      and code = ${code}
      and expires_at > now()
      and used = false
    limit 1
  `

  if (otps.length === 0) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
  }

  // Mark OTP as used
  await sql`update otps set used = true where id = ${otps[0].id}`

  // Get member name
  const members = await sql`select name from members where email = ${lower} limit 1`
  if (members.length === 0) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  const member = members[0] as Pick<Member, 'name'>
  const token = await signSession({ email: lower, name: member.name })

  const cookieStore = await cookies()
  cookieStore.set(sessionCookieOptions(token))

  return NextResponse.json({ ok: true, name: member.name })
}
