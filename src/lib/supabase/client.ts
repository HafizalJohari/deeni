import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});

// Debug utilities for auth troubleshooting
export const debugSupabaseAuth = {
  // Check local storage for auth tokens
  checkLocalStorage: () => {
    if (typeof window === 'undefined') return { found: false, message: 'Running on server' };
    
    const keys = Object.keys(localStorage);
    const authKeys = keys.filter(key => 
      key.includes('supabase') || 
      key.includes('auth') || 
      key.includes('token') || 
      key.includes('session')
    );
    
    const values: Record<string, string> = {};
    authKeys.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          // For auth tokens, mask the actual token for security
          if (key.toLowerCase().includes('token')) {
            const parsed = JSON.parse(value);
            if (parsed && typeof parsed === 'object') {
              // Safely mask token values but preserve structure
              const maskedValue = JSON.stringify(parsed, (k, v) => {
                if (typeof v === 'string' && v.length > 20 && (k === 'access_token' || k === 'refresh_token')) {
                  return `${v.substring(0, 10)}...${v.substring(v.length - 10)}`;
                }
                return v;
              });
              values[key] = maskedValue;
            } else {
              values[key] = '[masked token]';
            }
          } else {
            values[key] = value;
          }
        }
      } catch (e) {
        values[key] = `Error parsing: ${e instanceof Error ? e.message : String(e)}`;
      }
    });
    
    console.log('[Auth Debug] LocalStorage auth items:', values);
    return { 
      found: authKeys.length > 0, 
      keys: authKeys,
      values,
      message: authKeys.length ? `Found ${authKeys.length} auth-related items` : 'No auth items found' 
    };
  },
  
  // Check cookies for auth tokens
  checkCookies: () => {
    if (typeof document === 'undefined') return { found: false, message: 'Running on server' };
    
    const cookies = document.cookie.split(';').map(c => c.trim());
    const authCookies = cookies.filter(cookie => 
      cookie.toLowerCase().includes('supabase') || 
      cookie.toLowerCase().includes('auth') || 
      cookie.toLowerCase().includes('token') ||
      cookie.toLowerCase().includes('session')
    );
    
    console.log('[Auth Debug] Auth cookies:', authCookies);
    return { 
      found: authCookies.length > 0, 
      cookies: authCookies,
      message: authCookies.length ? `Found ${authCookies.length} auth-related cookies` : 'No auth cookies found' 
    };
  },
  
  // Check session from Supabase
  checkSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      console.log('[Auth Debug] Session check:', { 
        hasSession: !!data.session,
        sessionExpiry: data.session?.expires_at 
          ? new Date(data.session.expires_at * 1000).toISOString()
          : 'N/A',
        error: error ? error.message : null
      });
      return { 
        session: data.session,
        error,
        message: data.session 
          ? `Active session found, expires: ${new Date(data.session.expires_at * 1000).toISOString()}`
          : error 
            ? `Error: ${error.message}` 
            : 'No active session'
      };
    } catch (e) {
      console.error('[Auth Debug] Error checking session:', e);
      return { 
        session: null, 
        error: e instanceof Error ? e : new Error(String(e)),
        message: `Exception: ${e instanceof Error ? e.message : String(e)}`
      };
    }
  },
  
  // Run all checks
  runAllChecks: async () => {
    console.group('[Auth Debug] Running all auth checks');
    const localStorage = debugSupabaseAuth.checkLocalStorage();
    const cookies = debugSupabaseAuth.checkCookies();
    const session = await debugSupabaseAuth.checkSession();
    console.log('[Auth Debug] Summary:', {
      hasLocalStorage: localStorage.found,
      hasCookies: cookies.found,
      hasSession: !!session.session,
      sessionExpiry: session.session?.expires_at 
        ? new Date(session.session.expires_at * 1000).toISOString()
        : 'N/A',
    });
    console.groupEnd();
    
    return { localStorage, cookies, session };
  }
};

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
          username: string | null;
          avatar_url: string | null;
          streak_count: number;
          points: number;
          level: number;
        };
        Insert: {
          id: string;
          email: string;
          created_at?: string;
          updated_at?: string;
          username?: string | null;
          avatar_url?: string | null;
          streak_count?: number;
          points?: number;
          level?: number;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
          username?: string | null;
          avatar_url?: string | null;
          streak_count?: number;
          points?: number;
          level?: number;
        };
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          created_at: string;
          updated_at: string;
          category: string;
          frequency: string;
          target_count: number;
          current_count: number;
          is_completed: boolean;
          start_date: string;
          end_date: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          category: string;
          frequency: string;
          target_count: number;
          current_count?: number;
          is_completed?: boolean;
          start_date: string;
          end_date?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          category?: string;
          frequency?: string;
          target_count?: number;
          current_count?: number;
          is_completed?: boolean;
          start_date?: string;
          end_date?: string | null;
        };
      };
      habit_logs: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          created_at: string;
          count: number;
          notes: string | null;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          created_at?: string;
          count: number;
          notes?: string | null;
        };
        Update: {
          id?: string;
          habit_id?: string;
          user_id?: string;
          created_at?: string;
          count?: number;
          notes?: string | null;
        };
      };
      quran_insights: {
        Row: {
          id: string;
          user_id: string;
          surah: number;
          ayah: number;
          text: string;
          insight: string;
          created_at: string;
          is_favorite: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          surah: number;
          ayah: number;
          text: string;
          insight: string;
          created_at?: string;
          is_favorite?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          surah?: number;
          ayah?: number;
          text?: string;
          insight?: string;
          created_at?: string;
          is_favorite?: boolean;
        };
      };
      hadith_insights: {
        Row: {
          id: string;
          user_id: string;
          collection: string;
          number: number;
          text: string;
          insight: string;
          created_at: string;
          is_favorite: boolean;
          image_url?: string | null;
          language?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          collection: string;
          number: number;
          text: string;
          insight: string;
          created_at?: string;
          is_favorite?: boolean;
          image_url?: string | null;
          language?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          collection?: string;
          number?: number;
          text?: string;
          insight?: string;
          created_at?: string;
          is_favorite?: boolean;
          image_url?: string | null;
          language?: string;
        };
      };
      ai_generated_content: {
        Row: {
          id: string;
          user_id: string;
          content_type: string;
          content: string;
          prompt: string;
          created_at: string;
          is_favorite: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          content_type: string;
          content: string;
          prompt: string;
          created_at?: string;
          is_favorite?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          content_type?: string;
          content?: string;
          prompt?: string;
          created_at?: string;
          is_favorite?: boolean;
        };
      };
    };
  };
}; 