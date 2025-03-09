'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

interface AuthDebuggerProps {
  pageName?: string;
}

export default function AuthDebugger({ pageName = 'unknown' }: AuthDebuggerProps) {
  useEffect(() => {
    const checkAuth = async () => {
      console.log(`[AuthDebugger:${pageName}] Running auth check`);
      const { data, error } = await supabase.auth.getSession();
      
      // Check cookies directly
      const hasCookies = document.cookie.includes('sb-');
      const cookieNames = document.cookie.split(';')
        .map(c => c.trim())
        .filter(c => c.startsWith('sb-'))
        .map(c => c.split('=')[0]);
      
      console.log(`[AuthDebugger:${pageName}] Auth state:`, {
        hasSession: !!data.session,
        userId: data.session?.user?.id || 'none',
        error: error?.message || 'none',
        url: window.location.href,
        hasCookies,
        cookieNames
      });
      
      // Check local storage
      try {
        const localStorageKeys = Object.keys(localStorage).filter(key => 
          key.includes('supabase') || key.includes('sb-') || key.includes('auth')
        );
        console.log(`[AuthDebugger:${pageName}] LocalStorage:`, {
          hasAuthItems: localStorageKeys.length > 0,
          keys: localStorageKeys
        });
      } catch (e) {
        console.error(`[AuthDebugger:${pageName}] Error checking localStorage:`, e);
      }
    };
    
    checkAuth();
  }, [pageName]);

  return null; // This component doesn't render anything
} 