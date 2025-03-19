import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// TEMPORARILY DISABLED FOR MVP DEVELOPMENT
// This middleware now allows all routes without authentication checks

export async function middleware(request: NextRequest) {
  try {
    // Create a response to modify
    const res = NextResponse.next();
    
    // Create the Supabase client
    const supabase = createMiddlewareClient({ req: request, res });
    
    // Refresh session if expired - this will update the cookie if needed
    const { data: { session }, error } = await supabase.auth.getSession();

    // Log auth state for debugging
    console.log('[Middleware] Auth check:', {
      path: request.nextUrl.pathname,
      hasSession: !!session,
      hasError: !!error,
      userEmail: session?.user?.email || 'No email',
      cookies: request.cookies.getAll().map(c => c.name)
    });

    // Define protected routes that require authentication
    const protectedRoutes = [
      '/dashboard',
      '/profile',
      '/settings',
      '/api/personalization'
    ];

    // Define auth routes (login/register)
    const authRoutes = ['/login', '/register'];

    // Get the current path
    const currentPath = request.nextUrl.pathname;

    // Check if the current path is a protected route
    const isProtectedRoute = protectedRoutes.some(route => 
      currentPath.startsWith(route)
    );

    // Check if the current path is an auth route
    const isAuthRoute = authRoutes.some(route => 
      currentPath.startsWith(route)
    );

    // If accessing a protected route and not authenticated
    if (isProtectedRoute && !session) {
      // Store the attempted URL to redirect back after login
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', currentPath);
      
      // Create a response that redirects
      const redirectRes = NextResponse.redirect(redirectUrl);
      
      // Copy any new cookies that Supabase might have set
      res.headers.getAll('set-cookie').forEach((cookie) => {
        redirectRes.headers.append('set-cookie', cookie);
      });
      
      return redirectRes;
    }

    // If accessing auth routes while authenticated, redirect to dashboard
    // But only if they're not already being redirected from somewhere
    if (session && isAuthRoute && !request.nextUrl.searchParams.has('redirect')) {
      // Create a response that redirects
      const redirectRes = NextResponse.redirect(new URL('/dashboard', request.url));
      
      // Copy any new cookies that Supabase might have set
      res.headers.getAll('set-cookie').forEach((cookie) => {
        redirectRes.headers.append('set-cookie', cookie);
      });
      
      return redirectRes;
    }

    // For API routes that require auth
    if (currentPath.startsWith('/api/') && !currentPath.startsWith('/api/public')) {
      if (!session) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication required' },
          { status: 401 }
        );
      }

      // Add the user's token to the request headers
      const token = session.access_token;
      if (token) {
        res.headers.set('Authorization', `Bearer ${token}`);
      }
    }

    // Ensure cookies are properly set in the response
    return res;
  } catch (e) {
    console.error('[Middleware] Error:', e);
    // On error, allow the request to continue to avoid blocking the user
    return NextResponse.next();
  }
}

// Add a matcher for the paths we want to handle
export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/login',
    '/register'
  ],
}; 