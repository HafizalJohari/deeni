import { ReactNode } from 'react';
// import { render } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { Session, User } from '@/supabase/supabase-js';

// Mock Supabase client
export const mockSupabaseClient = {
  auth: {
    signInWithPassword: jest.fn(),
    signInWithOAuth: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
    resend: jest.fn(),
  },
};

// Mock user data
export const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2024-01-01',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
};

// Mock session data
export const mockSession: Session = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  expires_in: 3600,
  expires_at: 1234567890,
  token_type: 'bearer',
  user: mockUser,
};

interface RenderWithAuthOptions {
  initialSession?: Session | null;
}

// Custom render function that includes AuthProvider
export function renderWithAuth(
  ui: ReactNode,
  options: RenderWithAuthOptions = {}
) {
  const { initialSession = null } = options;

  // Mock the initial session
  mockSupabaseClient.auth.getSession.mockResolvedValue({
    data: { session: initialSession },
    error: null,
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  return render(ui, { wrapper: Wrapper });
}

// Helper to simulate successful login
export const simulateSuccessfulLogin = () => {
  mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
    data: { session: mockSession, user: mockUser },
    error: null,
  });
};

// Helper to simulate failed login
export const simulateFailedLogin = (errorMessage: string) => {
  mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
    data: { session: null, user: null },
    error: new Error(errorMessage),
  });
};

// Helper to simulate successful registration
export const simulateSuccessfulRegistration = () => {
  mockSupabaseClient.auth.signUp.mockResolvedValue({
    data: { session: null, user: mockUser },
    error: null,
  });
};

// Helper to simulate failed registration
export const simulateFailedRegistration = (errorMessage: string) => {
  mockSupabaseClient.auth.signUp.mockResolvedValue({
    data: { session: null, user: null },
    error: new Error(errorMessage),
  });
};

// Mock next/navigation
export const mockRouter = {
  push: jest.fn(),
  refresh: jest.fn(),
};

// Mock next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
})); 