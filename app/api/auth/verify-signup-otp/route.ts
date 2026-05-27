import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/db'
import { signSession, sessionCookieOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const { email, code } = await request.json() as { email: string; code: string }

  if (!email || !code) {
    return NextResponse.json({ error: 'Email and code required' }, { status: 400 })
  }

  const lower = email.toLowerCase().trim()

  // Find pending OTP record (code field contains JSON)
  const rows = await sql`
    select id, code from otps
    where email = ${lower}
      and expires_at > now()
      and used = false
    order by created_at desc
    limit 1
  `

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Code expired or not found. Please sign up again.' }, { status: 400 })
  }

  let pending: { code: string; firstName: string; lastName: string; passwordHash: string }
  try {
    pending = JSON.parse((rows[0] as { id: string; code: string }).code)
  } catch {
    return NextResponse.json({ error: 'Invalid signup session. Please try again.' }, { status: 400 })
  }

  if (pending.code !== code) {
    return NextResponse.json({ error: 'Incorrect code' }, { status: 400 })
  }

  // Mark OTP used
  await sql`update otps set used = true where id = ${(rows[0] as { id: string }).id}`

  // Double-check email not taken (race condition guard)
  const existing = await sql`select id from members where email = ${lower} limit 1`
  if (existing.length > 0) {
    return NextResponse.json({ error: 'Account already exists. Sign in instead.' }, { status: 409 })
  }

  const fullName = `${pending.firstName} ${pending.lastName}`

  // Create the member
  await sql`
    insert into members (first_name, last_name, name, email, password_hash)
    values (${pending.firstName}, ${pending.lastName}, ${fullName}, ${lower}, ${pending.passwordHash})
  `

  const token = await signSession({ email: lower, name: fullName })
  const cookieStore = await cookies()
  cookieStore.set(sessionCookieOptions(token))

  return NextResponse.json({ ok: true, name: fullName })
}
