import { NextRequest, NextResponse } from 'next/server';

// Define public routes that don't need authentication
const publicRoutes = [
  '/',
  '/api/auth',
];

// Define routes that need authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/api/protected',
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if route requires authentication
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // For protected routes, check for session cookie
  if (isProtected) {
    // Better-Auth uses cookies for session
    const sessionCookie = request.cookies.get('better-auth.session_token');
    
    if (!sessionCookie) {
      // Redirect to home if no session
      const url = new URL('/', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes - let them through)
     * - _next/static (static files)
     * - _next/image (image optimization files)  
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
