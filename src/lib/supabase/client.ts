import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

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