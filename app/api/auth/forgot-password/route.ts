import { NextResponse, type NextRequest } from 'next/server'
import { randomBytes } from 'crypto'
import { sql } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const { email } = await request.json() as { email: string }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const lower = email.toLowerCase().trim()

  // Always return ok — don't reveal whether email exists
  const members = await sql`select id from members where email = ${lower} limit 1`
  if (members.length === 0) {
    return NextResponse.json({ ok: true })
  }

  // Invalidate previous tokens
  await sql`update password_resets set used = true where email = ${lower} and used = false`

  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await sql`
    insert into password_resets (email, token, expires_at)
    values (${lower}, ${token}, ${expiresAt.toISOString()})
  `

  sendPasswordResetEmail({ email: lower, token }).catch(err => {
    console.error('[forgot-password] SMTP error:', err)
  })

  return NextResponse.json({ ok: true })
}
