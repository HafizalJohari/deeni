import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { FcGoogle } from 'react-icons/fc';

type GoogleLoginButtonProps = {
  redirectTo?: string;
  className?: string;
};

const GoogleLoginButton = ({ 
  redirectTo = '/dashboard',
  className = ''
}: GoogleLoginButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      console.log('[GoogleLogin] Starting OAuth flow');
      
      // Ensure the redirect URL is absolute
      const fullRedirectUrl = new URL(redirectTo, window.location.origin).toString();
      console.log(`[GoogleLogin] Redirect URL: ${fullRedirectUrl}`);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: fullRedirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }
      
      console.log('[GoogleLogin] OAuth initialized, awaiting redirect');
      // The redirect happens automatically so no need to manually redirect
    } catch (error) {
      console.error('[GoogleLogin] Error:', error);
      // Error handling is done through the redirect
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className={`flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      type="button"
      aria-label="Sign in with Google"
      tabIndex={0}
    >
      <FcGoogle className="h-5 w-5" />
      <span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
    </button>
  );
};

export default GoogleLoginButton; 