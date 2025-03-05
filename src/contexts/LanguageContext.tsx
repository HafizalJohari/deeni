'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';

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

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [insightLanguage, setInsightLanguageState] = useState<SupportedLanguage>('english');
  const [isLoading, setIsLoading] = useState(true);

  // Load language preference from Supabase on initial render
  useEffect(() => {
    const loadLanguagePreference = async () => {
      try {
        setIsLoading(true);
        const { data: userData } = await supabase.auth.getUser();
        
        if (userData.user) {
          // First check if the user_preferences table exists
          const { error: tableCheckError } = await supabase
            .from('user_preferences')
            .select('count')
            .limit(1)
            .single();
            
          // If the table doesn't exist or there's another issue, just use the default language
          if (tableCheckError && tableCheckError.code !== 'PGRST116') {
            console.log('User preferences table may not exist yet, using default language');
            setIsLoading(false);
            return;
          }
          
          // Try to get the user's language preference
          const { data, error } = await supabase
            .from('user_preferences')
            .select('insight_language')
            .eq('user_id', userData.user.id)
            .maybeSingle(); // Use maybeSingle instead of single to avoid error when no record exists
          
          if (error) {
            console.error('Error fetching language preference:', error);
          } else if (data && data.insight_language) {
            setInsightLanguageState(data.insight_language as SupportedLanguage);
          } else {
            // If no preference exists yet, create one with the default language
            await setInsightLanguage('english');
          }
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguagePreference();
  }, []);

  // Update language preference in Supabase and local state
  const setInsightLanguage = async (language: SupportedLanguage) => {
    try {
      setIsLoading(true);
      // Update the state immediately for better UX
      setInsightLanguageState(language);
      
      const { data: userData } = await supabase.auth.getUser();
      
      if (userData.user) {
        // First check if the user_preferences table exists
        const { error: tableCheckError } = await supabase
          .from('user_preferences')
          .select('count')
          .limit(1)
          .single();
          
        // If the table doesn't exist, we can't save the preference
        if (tableCheckError && tableCheckError.code !== 'PGRST116') {
          console.log('User preferences table may not exist yet, skipping save to database');
          return;
        }
        
        // Try to update the user's language preference
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: userData.user.id,
            insight_language: language,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
        
        if (error) {
          console.error('Error updating language preference:', error);
          // Don't throw the error, just log it
        }
      }
    } catch (error) {
      console.error('Error setting language preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LanguageContext.Provider value={{ insightLanguage, setInsightLanguage, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}; 