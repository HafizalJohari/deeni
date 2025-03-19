'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, isLoading, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Single source of truth for auth redirects
  useEffect(() => {
    if (isRedirecting) return; // Prevent multiple redirects

    if (!isLoading && !isAuthenticated) {
      setIsRedirecting(true);
      console.log('[AuthGuard] User not authenticated, redirecting to login');
      
      // Store the current path for redirect after login
      const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.push(loginUrl);
    }
  }, [isLoading, isAuthenticated, router, isRedirecting, pathname]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  // Show redirect state if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 text-4xl">🔒</div>
        <h2 className="mb-2 text-xl font-semibold">Authentication Required</h2>
        <p className="mb-4 text-gray-600">Please wait while redirecting to login...</p>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  // Render children if authenticated
  return <>{children}</>;
}; 