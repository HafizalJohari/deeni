'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BeamsBackground } from '@/components/ui/BeamsBackground';

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
      router.push('/dashboard');
      router.refresh();
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <BeamsBackground intensity="medium">
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 rounded-xl bg-white/90 backdrop-blur-sm p-8 shadow-lg">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-green-800">Welcome to Deeni</h1>
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
    </BeamsBackground>
  );
} 