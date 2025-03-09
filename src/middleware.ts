import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// TEMPORARILY DISABLED FOR MVP DEVELOPMENT
// This middleware now allows all routes without authentication checks

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl;
  
  console.log(`[Middleware] ⚠️ MVP Mode - Authentication bypassed for: ${pathname}`);
  
  // Allow all requests without authentication checks
  return NextResponse.next();

  /* Authentication code disabled for MVP
  // Maximum number of redirects to prevent infinite loops
  const MAX_REDIRECTS = 3;
  const REDIRECT_COOKIE_NAME = 'deeni_redirect_count';
  const AUTH_DEBUG_COOKIE = 'deeni_auth_debug';

  // List of routes to bypass auth checks completely (to break the redirect loop)
  const BYPASS_ROUTES = [
    '/dashboard/habits',
    '/dashboard/hadith',
    '/dashboard/quran',
    '/dashboard/profile',
    '/dashboard/settings'
  ];

  // MOST IMPORTANT FIX: BYPASS MIDDLEWARE FOR ANY NESTED DASHBOARD ROUTE
  // Only retain middleware auth check for the main dashboard route
  if (pathname.startsWith('/dashboard/')) {
    console.log(`[Middleware] BYPASSING MIDDLEWARE for sub-route: ${pathname}`);
    
    // Add debug cookie to indicate we bypassed middleware
    const response = NextResponse.next();
    response.cookies.set(AUTH_DEBUG_COOKIE, 'bypassed_middleware', {
      maxAge: 3600,
      path: '/',
    });
    
    // Let client-side auth handle protection
    return response;
  }
  
  // Create a response that we'll modify
  const res = NextResponse.next();
  
  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ 
    req: request, 
    res 
  });
  
  // Fetch the session with more detailed error handling
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  // Check all cookies for auth tokens
  const cookieString = request.headers.get('cookie') || '';
  const hasCookies = cookieString.includes('sb-');
  
  // Direct cookie check as additional verification - more comprehensive detection
  const hasSupabaseCookies = hasCookies || 
                            request.cookies.has('sb-access-token') || 
                            request.cookies.has('sb-refresh-token') ||
                            cookieString.includes('olodqvlxkbihjxlrszut-auth-token');
  
  // Enhanced logging for better debugging
  console.log(`[Middleware] Auth State: 
    - Path: ${pathname}
    - Has Session: ${!!session}
    - Session User ID: ${session?.user?.id || 'none'}
    - Session Expires: ${session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'none'}
    - Session Error: ${sessionError ? sessionError.message : 'none'}
    - Auth Cookies Present: ${hasSupabaseCookies}
    - Cookie String: ${cookieString.slice(0, 50)}${cookieString.length > 50 ? '...' : ''}
  `);
  
  // Set debug cookie with auth state information
  res.cookies.set(AUTH_DEBUG_COOKIE, `session:${!!session}|cookies:${hasSupabaseCookies}`, {
    maxAge: 3600,
    path: '/',
  });
  
  // Check if we're on an auth page (login, register, etc.)
  const isAuthPage = pathname.startsWith('/login') || 
                     pathname.startsWith('/register') || 
                     pathname.startsWith('/reset-password');
                     
  // Check if we're on an auth callback page
  const isAuthCallback = pathname.startsWith('/auth/callback') || 
                         request.nextUrl.search.includes('code=') || 
                         pathname.startsWith('/api/auth');
  
  // Check if the current path is a dashboard route
  const isDashboardPage = pathname.startsWith('/dashboard');
  
  // More specific page categorization for debugging
  let pageCategory = 'unknown';
  
  if (pathname.includes('/dashboard/hadith')) {
    pageCategory = 'hadith';
  } else if (pathname.includes('/dashboard/habits')) {
    pageCategory = 'habits';
  } else if (pathname.includes('/dashboard/quran')) {
    pageCategory = 'quran';
  } else if (pathname.includes('/dashboard/profile')) {
    pageCategory = 'profile';
  } else if (pathname.includes('/dashboard/settings')) {
    pageCategory = 'settings';
  } else if (isDashboardPage) {
    pageCategory = 'dashboard-main';
  } else if (isAuthPage) {
    pageCategory = 'auth';
  } else if (isAuthCallback) {
    pageCategory = 'auth-callback';
  }

  console.log(`[Middleware] Page Category: ${pageCategory}, Auth Page: ${isAuthPage}, Dashboard: ${isDashboardPage}, Auth Callback: ${isAuthCallback}`);

  // IMPORTANT: Use a dual-check approach for authentication
  // Consider user authenticated if EITHER the session exists OR we have valid Supabase cookies
  const isAuthenticated = !!session || hasSupabaseCookies;

  // If user is signed in and trying to access an auth page, redirect to the main dashboard
  if (isAuthenticated && isAuthPage) {
    console.log(`[Middleware] User is signed in but trying to access auth page, redirecting to dashboard`);
    const redirectUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is not signed in and trying to access the main dashboard page
  // ONLY CHECK THE MAIN DASHBOARD ROUTE, NOT SUB-ROUTES
  if (!isAuthenticated && pathname === '/dashboard') {
    console.log(`[Middleware] User is not signed in but trying to access main dashboard, redirecting to login`);
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('return_to', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // For other routes, return the response with refreshed auth cookies
  console.log(`[Middleware] Proceeding with request to ${pathname} (${pageCategory})`);
  return res;
  */
}

// Add a matcher for the paths we want to handle
export const config = {
  matcher: [
    // Match dashboard routes
    '/dashboard',
    '/dashboard/:path*',
    // Auth pages
    '/login',
    '/register',
    '/reset-password',
    // Auth callback
    '/auth/callback'
  ],
}; 