import { NextResponse, type NextRequest } from 'next/server'
import { getSessionFromCookieHeader } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const session = await getSessionFromCookieHeader(cookieHeader)

  if (!session) {
    const from = request.nextUrl.pathname
    const url = request.nextUrl.clone()
    url.pathname = '/signin'
    url.searchParams.set('from', from)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/products/submit'],
}
