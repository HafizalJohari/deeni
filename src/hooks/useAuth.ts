'use client';

import { useState, useEffect } from 'react';
import { supabase, debugSupabaseAuth } from '@/lib/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Fetch the current session
    const getInitialSession = async () => {
      try {
        console.log('[useAuth] Initializing and checking session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[useAuth] Error getting session:', error);
          throw error;
        }
        
        console.log('[useAuth] Initial session check:', { 
          hasSession: !!session,
          userId: session?.user?.id || 'none',
          email: session?.user?.email || 'none',
          expires: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'none'
        });
        
        setAuthState({
          session,
          user: session?.user ?? null,
          isLoading: false,
          error: null,
        });
        
        // For debugging - run the auth checks
        debugSupabaseAuth.runAllChecks();
      } catch (error) {
        console.error('[useAuth] Exception during session initialization:', error);
        setAuthState((prev) => ({
          ...prev,
          error: error as Error,
          isLoading: false,
        }));
      }
    };

    getInitialSession();

    // Set up listener for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[useAuth] Auth state changed:', { 
          event, 
          hasSession: !!session,
          userId: session?.user?.id || 'none'
        });
        
        setAuthState({
          session,
          user: session?.user ?? null,
          isLoading: false,
          error: null,
        });
        
        // Run debug checks on auth state change
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          console.log(`[useAuth] Important auth event: ${event}, running debug checks...`);
          debugSupabaseAuth.runAllChecks();
        }
      }
    );

    // Clean up subscription on unmount
    return () => {
      console.log('[useAuth] Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  // Sign out function
  const signOut = async () => {
    try {
      console.log('[useAuth] Signing out...');
      setAuthState((prev) => ({ ...prev, isLoading: true }));
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[useAuth] Error during sign out:', error);
        throw error;
      }
      
      console.log('[useAuth] Successfully signed out');
    } catch (error) {
      console.error('[useAuth] Exception during sign out:', error);
      setAuthState((prev) => ({
        ...prev,
        error: error as Error,
        isLoading: false,
      }));
    }
  };

  // Debug function
  const debugAuth = async () => {
    console.group('[useAuth] Debug auth state');
    console.log('Current auth state:', authState);
    const checks = await debugSupabaseAuth.runAllChecks();
    console.groupEnd();
    return checks;
  };

  return {
    ...authState,
    signOut,
    isAuthenticated: !!authState.user,
    debugAuth, // Expose the debug function
  };
};

export default useAuth; 