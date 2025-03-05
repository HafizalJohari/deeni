import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // Handle the redirect for the standalone personalization page
  if (url.pathname === '/personalization' && !url.pathname.startsWith('/dashboard/personalization')) {
    url.pathname = '/standalone-personalization';
    return NextResponse.redirect(url);
  }
  
  // Also redirect the old personalization-standalone path to the new one
  if (url.pathname === '/personalization-standalone') {
    url.pathname = '/standalone-personalization';
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/personalization',
    '/personalization-standalone',
  ],
}; 