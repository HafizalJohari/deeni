'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HelpGuide from '@/components/ui/HelpGuide';
import { AppDock } from '@/components/ui/Dock';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';

// Client-side authentication check directly at the layout level
// TEMPORARILY DISABLED FOR MVP
function LayoutAuthGuard({ children }: { children: React.ReactNode }) {
  // MVP MODE: Bypass all authentication
  console.log('[LayoutAuthGuard] ⚠️ Authentication bypassed for MVP development');
  return <>{children}</>;
  
  /* Authentication code disabled for MVP
  const { user, isLoading, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const [finalAuthState, setFinalAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  
  // Verify authentication
  useEffect(() => {
    // Immediate check for auth cookies - this is the most reliable approach
    const checkCookies = () => {
      const hasCookies = document.cookie.includes('sb-') || 
                         document.cookie.includes('olodqvlxkbihjxlrszut-auth-token');
      
      if (hasCookies) {
        console.log('[LayoutAuthGuard] Auth cookies found, considering user authenticated');
        setFinalAuthState('authenticated');
        return true;
      }
      return false;
    };
    
    // If cookies present, consider authenticated immediately
    if (checkCookies()) return;
    
    // Anti-stuck timer - if we haven't resolved auth in 2 seconds, check cookies again
    const timeoutId = setTimeout(() => {
      if (finalAuthState === 'loading') {
        console.log('[LayoutAuthGuard] Auth resolution timeout, checking cookies');
        if (checkCookies()) return;
        
        // No cookies found, redirect to login
        console.log('[LayoutAuthGuard] No auth detected after timeout, redirecting');
        setFinalAuthState('unauthenticated');
        router.push('/login');
      }
    }, 2000);

    const verifyAuth = async () => {
      // Skip verification if we've already determined auth state
      if (finalAuthState !== 'loading') return;
      
      // If context says we're authenticated, trust it
      if (isAuthenticated) {
        console.log('[LayoutAuthGuard] User authenticated via context');
        setFinalAuthState('authenticated');
        return;
      }
      
      // Check for auth in localStorage as a fallback
      try {
        const hasLocalStorageAuth = localStorage.getItem('supabase.auth.token') !== null;
        if (hasLocalStorageAuth) {
          console.log('[LayoutAuthGuard] Auth token found in localStorage');
          setFinalAuthState('authenticated');
          return;
        }
      } catch (err) {
        console.error('[LayoutAuthGuard] Error checking localStorage:', err);
      }
      
      // Last resort: try refreshing the session
      try {
        console.log('[LayoutAuthGuard] Attempting to refresh session');
        const { data, error } = await supabase.auth.refreshSession();
        if (data.session) {
          console.log('[LayoutAuthGuard] Session refreshed successfully');
          setFinalAuthState('authenticated');
          return;
        }
        if (error) {
          console.error('[LayoutAuthGuard] Session refresh error:', error);
        }
      } catch (err) {
        console.error('[LayoutAuthGuard] Error during session refresh:', err);
      }
      
      // If we get here and cookies are present, STILL consider authenticated
      if (checkCookies()) return;
      
      // Nothing worked, redirect to login
      console.log('[LayoutAuthGuard] No valid authentication found, redirecting to login');
      setFinalAuthState('unauthenticated');
    };
    
    // Run auth check
    verifyAuth();
    
    return () => clearTimeout(timeoutId);
  }, [finalAuthState, isAuthenticated, router]);
  
  // Show loading state
  if (finalAuthState === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
        <p className="ml-3 text-gray-500">Loading...</p>
      </div>
    );
  }
  
  // Show authentication required message
  if (finalAuthState === 'unauthenticated') {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 text-5xl">🔒</div>
          <h1 className="mb-2 text-2xl font-bold">Authentication Required</h1>
          <p className="mb-6 text-gray-600">Please wait while redirecting to login...</p>
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }
  
  // Render children if authenticated
  return <>{children}</>;
  */
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthContext();

  // First mount check
  useEffect(() => {
    setMounted(true);
    
    // Log authentication state for debugging but don't enforce it
    console.log('[DashboardLayout] ⚠️ MVP Mode: Authentication checks disabled');
    
    try {
      // Check if we have auth cookies directly
      const hasCookies = document.cookie.includes('sb-');
      const hasLocalStorage = typeof localStorage !== 'undefined' && 
                             localStorage.getItem('supabase.auth.token') !== null;
      
      // Track page view for debugging
      console.log('[DashboardLayout] Auth state (informational only):', { 
        userId: user?.id || 'none',
        url: typeof window !== 'undefined' ? window.location.href : 'SSR',
        authCookies: hasCookies,
        localStorageAuth: hasLocalStorage 
      });
    } catch (err) {
      console.error('[DashboardLayout] Error checking auth state:', err);
    }
  }, [user]);

  // Don't render anything during initial load
  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
        <p className="ml-3 text-gray-500">Loading...</p>
      </div>
    );
  }

  // Wrap all dashboard content with the LayoutAuthGuard
  return (
    <LanguageProvider>
      <LayoutAuthGuard>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <AppDock />
          
          {/* Main content */}
          <main className="flex-1">
            <div className="py-6 pb-32">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </div>
          </main>

          <HelpGuide />
        </div>
      </LayoutAuthGuard>
    </LanguageProvider>
  );
} 