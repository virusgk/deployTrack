import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth');
  const authSecret = process.env.AUTH_SECRET;

  const isAuthPath = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPath = request.nextUrl.pathname === '/login';

  // If user is not authenticated and trying to access admin, redirect to login
  if (isAuthPath && (!authCookie || authCookie.value !== authSecret)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is authenticated and trying to access login, redirect to admin
  if (isLoginPath && authCookie && authCookie.value === authSecret) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}
