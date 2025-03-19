'use client';

import { useState, useEffect, useId, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';

interface AnimatedGridPatternProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  strokeDasharray?: any;
  numSquares?: number;
  className?: string;
  maxOpacity?: number;
  duration?: number;
  repeatDelay?: number;
}

function AnimatedGridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  numSquares = 50,
  className,
  maxOpacity = 0.5,
  duration = 4,
  repeatDelay = 0.5,
  ...props
}: AnimatedGridPatternProps) {
  const id = useId();
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [squares, setSquares] = useState(() => generateSquares(numSquares));

  function getPos() {
    return [
      Math.floor((Math.random() * dimensions.width) / width),
      Math.floor((Math.random() * dimensions.height) / height),
    ];
  }

  function generateSquares(count: number) {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      pos: getPos(),
    }));
  }

  const updateSquarePosition = (id: number) => {
    setSquares((currentSquares) =>
      currentSquares.map((sq) =>
        sq.id === id
          ? {
              ...sq,
              pos: getPos(),
            }
          : sq,
      ),
    );
  };

  useEffect(() => {
    if (dimensions.width && dimensions.height) {
      setSquares(generateSquares(numSquares));
    }
  }, [dimensions, numSquares]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [containerRef]);

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30",
        className,
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      <svg x={x} y={y} className="overflow-visible">
        {squares.map(({ pos: [x, y], id }, index) => (
          <motion.rect
            initial={{ opacity: 0 }}
            animate={{ opacity: maxOpacity }}
            transition={{
              duration,
              repeat: 1,
              delay: index * 0.1,
              repeatType: "reverse",
            }}
            onAnimationComplete={() => updateSquarePosition(id)}
            key={`${x}-${y}-${index}`}
            width={width - 1}
            height={height - 1}
            x={x * width + 1}
            y={y * height + 1}
            fill="currentColor"
            strokeWidth="0"
          />
        ))}
      </svg>
    </svg>
  );
}

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [currentEmail, setCurrentEmail] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    const registered = searchParams.get('registered');
    if (registered === 'true') {
      setRegistrationSuccess(true);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleResendConfirmation = async () => {
    try {
      setIsResendingEmail(true);
      setError(null);
      const email = currentEmail || getValues('email');
      
      if (!email) {
        setError('Please enter your email address first');
        return;
      }

      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (resendError) {
        throw resendError;
      }

      setResendSuccess(true);
    } catch (error: any) {
      console.error('Resend confirmation error:', error);
      setError(error.message || 'Failed to resend confirmation email');
    } finally {
      setIsResendingEmail(false);
    }
  };

  const handleLogin = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentEmail(data.email);

      // Log attempt
      console.log(`[Login] Attempting login for ${data.email}`);

      // First, ensure no existing session
      await supabase.auth.signOut();

      // Attempt login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        if (authError.message.includes('Email not confirmed')) {
          setError('Please confirm your email address. Check your inbox for the confirmation link.');
          return;
        }
        throw authError;
      }

      if (!authData?.user) {
        throw new Error('No user data returned');
      }

      // Successful login
      console.log('[Login] Authentication successful, preparing redirection');
      
      // Get the return_to or redirect parameter, fallback to dashboard
      const returnTo = searchParams.get('redirect') || searchParams.get('return_to') || '/dashboard';
      console.log(`[Login] Will redirect user to: ${returnTo}`);
      
      // Ensure we have a fresh session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('[Login] Session refresh error:', refreshError);
        throw refreshError;
      }
      
      if (!refreshData.session) {
        throw new Error('Session not established after refresh');
      }
      
      // Double check session is established
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        throw new Error('Session verification failed');
      }
      
      console.log(`[Login] Session established and verified, redirecting to ${returnTo}`);
      
      // Use window.location for a full page reload to ensure clean state
      window.location.href = returnTo;
      
    } catch (error: any) {
      console.error('[Login] Error:', error);
      setError(error.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedGridPattern className="absolute inset-0" />
      <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 rounded-xl bg-white/90 backdrop-blur-sm p-8 shadow-lg">
          <div className="text-center">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-bold text-green-800">DEENI</h1>
            </Link>
            <p className="mt-2 text-gray-600">Sign in to your account</p>
          </div>

          {registrationSuccess && (
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
              Registration successful! Please check your email to confirm your account before signing in.
            </div>
          )}

          {resendSuccess && (
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
              Confirmation email has been resent. Please check your inbox.
            </div>
          )}

          {error && (
            <div className="space-y-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
              <p>{error}</p>
              {error.includes('Email not confirmed') && (
                <button
                  onClick={handleResendConfirmation}
                  disabled={isResendingEmail}
                  className="text-red-600 hover:text-red-500 underline focus:outline-none disabled:opacity-50"
                >
                  {isResendingEmail ? 'Sending...' : 'Resend confirmation email'}
                </button>
              )}
            </div>
          )}

          <div className="mt-6">
            <GoogleLoginButton redirectTo="/dashboard" />
            
            <div className="mt-4 flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <div className="mx-4 text-sm text-gray-500">or</div>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit(handleLogin)} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="text-center text-sm">
              <Link href="/register" className="text-green-600 hover:text-green-500">
                Don't have an account? Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 