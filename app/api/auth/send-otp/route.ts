import { NextResponse, type NextRequest } from 'next/server'
import { sql } from '@/lib/db'
import { sendOtpEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const { email } = await request.json() as { email: string }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const lower = email.toLowerCase().trim()

  // Check membership
  const members = await sql`select id from members where email = ${lower} limit 1`
  if (members.length === 0) {
    return NextResponse.json({ notMember: true })
  }

  // Generate 6-digit code
  const code = String(Math.floor(100000 + Math.random() * 900000))
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  // Invalidate previous unused codes for this email
  await sql`update otps set used = true where email = ${lower} and used = false`

  // Store new OTP
  await sql`
    insert into otps (email, code, expires_at)
    values (${lower}, ${code}, ${expiresAt.toISOString()})
  `

  await sendOtpEmail({ email: lower, code })

  return NextResponse.json({ sent: true })
}
