'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuthContext } from '@/contexts/AuthContext';

export type SupportedLanguage = 'english' | 'malay' | 'arabic' | 'mandarin';

interface LanguageContextType {
  insightLanguage: SupportedLanguage;
  setInsightLanguage: (language: SupportedLanguage) => Promise<void>;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<string>('en');
  const supabase = createClientComponentClient();
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);

  const loadLanguagePreference = useCallback(async () => {
    try {
      // Only try to load preferences if we have a user
      if (!user) {
        console.log('No user logged in, using default language');
        return;
      }

      const { data: preferences, error } = await supabase
        .from('user_preferences')
        .select('language')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading language preference:', error);
        return;
      }

      if (preferences?.language) {
        setLanguage(preferences.language);
      }
    } catch (error) {
      console.error('Error in loadLanguagePreference:', error);
    }
  }, [supabase, user]);

  useEffect(() => {
    loadLanguagePreference();
  }, [loadLanguagePreference]);

  // Update language preference in Supabase and local state
  const setInsightLanguage = async (language: SupportedLanguage) => {
    try {
      setIsLoading(true);
      // Update the state immediately for better UX
      setLanguage(language);
      
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting user for language update:', {
          code: userError.code || 'No code',
          message: userError.message || 'No message',
          stack: userError.stack || 'No stack'
        });
        setIsLoading(false);
        return;
      }
      
      if (!userData || !userData.user) {
        console.warn('No authenticated user found, skipping preference save');
        setIsLoading(false);
        return;
      }
      
      console.log('Updating language preference to:', language);
      
      // Try to update the user's language preference
      try {
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: userData.user.id,
            language: language,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
        
        if (error) {
          console.error('Error updating language preference:', {
            code: error.code || 'No code',
            message: error.message || 'No message',
            hint: error.hint || 'No hint',
            stack: error.stack || 'No stack'
          });
          
          // Check if the error is due to the column not existing
          if (error.code === '42703' && error.message.includes('column user_preferences.language does not exist')) {
            console.log('language column does not exist, skipping preference save');
            setIsLoading(false);
            return;
          }
        } else {
          console.log('Language preference updated successfully');
        }
      } catch (updateError) {
        console.error('Exception during language preference update:', updateError);
      }
    } catch (error) {
      console.error('Error in setInsightLanguage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LanguageContext.Provider value={{ insightLanguage: language as SupportedLanguage, setInsightLanguage, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
} 