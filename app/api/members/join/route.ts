import { NextResponse, type NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { sql } from '@/lib/db'
import { sendSignupOtpEmail } from '@/lib/email'

// Step 1 — validate details, send OTP, DO NOT create account yet
export async function POST(request: NextRequest) {
  const { firstName, lastName, email, password } =
    await request.json() as { firstName: string; lastName: string; email: string; password: string }

  if (!firstName?.trim()) return NextResponse.json({ error: 'First name is required' }, { status: 400 })
  if (!lastName?.trim())  return NextResponse.json({ error: 'Last name is required' }, { status: 400 })
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const lower = email.toLowerCase().trim()
  const existing = await sql`select id from members where email = ${lower} limit 1`
  if (existing.length > 0) {
    return NextResponse.json({ error: 'An account with that email already exists. Sign in instead.' }, { status: 409 })
  }

  // Hash password and store temporarily in OTPs table as metadata
  const passwordHash = await bcrypt.hash(password, 12)
  const code = String(Math.floor(100000 + Math.random() * 900000))
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  // Invalidate any previous signup OTPs for this email
  await sql`update otps set used = true where email = ${lower} and used = false`

  // Store OTP + pending account details (encoded as JSON in a separate column would be ideal,
  // but we reuse the otps table and store hashed password + name as part of the code field is not ideal.
  // Instead we store them in a temp JSON approach using the code field + a separate pending record)
  // Simpler: store the full details in otps.code as JSON, encrypted or just trusted server-side
  const pendingData = JSON.stringify({
    code,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    passwordHash,
  })

  await sql`
    insert into otps (email, code, expires_at)
    values (${lower}, ${pendingData}, ${expiresAt.toISOString()})
  `

  try {
    await sendSignupOtpEmail({ email: lower, code })
  } catch (err) {
    console.error('[join] SMTP error:', err)
    return NextResponse.json(
      { error: 'Could not send confirmation email. Please try again or contact hello@curiousgeekspm.com.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, pendingEmail: lower })
}
