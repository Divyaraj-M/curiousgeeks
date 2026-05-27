import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { clearCookieOptions } from '@/lib/auth'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.set(clearCookieOptions())
  return NextResponse.json({ ok: true })
}
