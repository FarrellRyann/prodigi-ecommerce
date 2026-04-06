import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This is a simple middleware to guard routes.
// In a real production app, we would also verify the JWT expiration/signature 
// using a library like 'jose' if we want to be 100% sure in the edge.
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Define protected routes
  const isAdminRoute = pathname.startsWith('/admin');
  const isCustomerRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/profile');
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

  // 1. If user is on an auth route but already has a token, redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. If user is on a protected route but has NO token, redirect to login
  if ((isAdminRoute || isCustomerRoute) && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. For Admin routes, we'd ideally check the 'role' claim in the JWT.
  // Since we can't easily decrypt HTTP-Only cookies here without the secret, 
  // we rely on the backend to 403 them if they are unauthorized, 
  // or we can store a non-http-only 'role' cookie as a hint.
  
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/profile/:path*', '/login', '/register'],
};
