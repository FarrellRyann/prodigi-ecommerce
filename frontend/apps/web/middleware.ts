import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;
  const { pathname } = request.nextUrl;

  // Define protected pathways
  const isAdminRoute = pathname.startsWith('/admin');
  const isProtectedRoute = pathname.startsWith('/library') || 
                          isAdminRoute || 
                          pathname.startsWith('/checkout') ||
                          pathname.startsWith('/profile');

  // Enforce authentication
  if (isProtectedRoute && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Enforce role-based access for Admin routes
  if (isAdminRoute && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Always allow access to login/register, even if a token is present, 
  // to avoid redirect loops if the token is stale/invalid.
  // The UI will handle switching between user profile and login buttons.

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/library/:path*',
    '/admin/:path*',
    '/checkout/:path*',
    '/profile/:path*',
    '/login',
    '/register',
  ],
};
