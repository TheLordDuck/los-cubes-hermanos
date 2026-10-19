// proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_COOKIE, isValidAdminSession } from '@/lib/admin-auth'

const READ_ONLY_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // The login page itself (and its form submission) stays reachable
  if (pathname === '/admin/login') return NextResponse.next()

  // Public pages read the API; only writes need an admin session
  const isApi = pathname.startsWith('/api/')
  if (isApi && READ_ONLY_METHODS.has(request.method)) return NextResponse.next()

  const token = request.cookies.get(ADMIN_COOKIE)?.value
  if (await isValidAdminSession(token)) return NextResponse.next()

  if (isApi) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const loginUrl = new URL('/admin/login', request.url)
  loginUrl.searchParams.set('next', pathname + request.nextUrl.search)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}
