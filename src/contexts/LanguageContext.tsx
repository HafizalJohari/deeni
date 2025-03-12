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
        console.log('Starting to load language preference...');
        
        // Check if Supabase client is initialized
        if (!supabase) {
          console.error('Supabase client is not initialized');
          setIsLoading(false);
          return;
        }
        
        // Get current user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error getting user:', {
            code: userError.code || 'No code',
            message: userError.message || 'No message',
            stack: userError.stack || 'No stack'
          });
          setIsLoading(false);
          return;
        }
        
        if (!userData || !userData.user) {
          console.log('No authenticated user found, using default language');
          setIsLoading(false);
          return;
        }
        
        console.log('User authenticated, user ID:', userData.user.id);

        // First check if the user_preferences table exists
        try {
          const { error: tableCheckError } = await supabase
            .from('user_preferences')
            .select('count')
            .limit(1)
            .single();
            
          if (tableCheckError) {
            // Log the specific error for debugging
            console.log('Table check error details:', {
              code: tableCheckError.code || 'No code',
              message: tableCheckError.message || 'No message',
              hint: tableCheckError.hint || 'No hint',
              stack: tableCheckError.stack || 'No stack'
            });
            
            // If the error is not about the table not existing, log it and use default
            if (tableCheckError.code !== 'PGRST116') {
              console.error('Error checking user_preferences table:', tableCheckError);
              setIsLoading(false);
              return;
            }
          }
        } catch (tableCheckCatchError) {
          console.error('Exception during table check:', tableCheckCatchError);
          setIsLoading(false);
          return;
        }
        
        console.log('Table check completed, proceeding to fetch language preference');
        
        // Try to get the user's language preference
        try {
          // First try to get the user's language preference
          const { data, error } = await supabase
            .from('user_preferences')
            .select('insight_language')
            .eq('user_id', userData.user.id)
            .maybeSingle();
          
          if (error) {
            console.error('Error fetching language preference:', {
              code: error.code || 'No code',
              message: error.message || 'No message',
              hint: error.hint || 'No hint',
              stack: error.stack || 'No stack'
            });
            
            // Check if the error is due to the column not existing
            if (error.code === '42703' && error.message.includes('column user_preferences.insight_language does not exist')) {
              console.log('insight_language column does not exist, using default language');
              setIsLoading(false);
              return;
            }
            
            // For other errors, just use default language
            setIsLoading(false);
            return;
          }

          console.log('Language preference data:', data);

          if (data?.insight_language) {
            // Validate that the language is a supported one
            const language = data.insight_language.toLowerCase() as SupportedLanguage;
            if (['english', 'malay', 'arabic', 'mandarin'].includes(language)) {
              console.log('Setting language to:', language);
              setInsightLanguageState(language);
            } else {
              console.warn(`Unsupported language found in preferences: ${language}, using default`);
            }
          } else {
            console.log('No language preference found, setting default');
            // If no preference exists yet, create one with the default language
            try {
              await setInsightLanguage('english');
            } catch (error) {
              console.error('Error setting default language preference:', error);
            }
          }
        } catch (fetchError) {
          console.error('Exception during language preference fetch:', fetchError);
        }
      } catch (error) {
        console.error('Error in loadLanguagePreference:', error);
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
            insight_language: language,
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
          if (error.code === '42703' && error.message.includes('column user_preferences.insight_language does not exist')) {
            console.log('insight_language column does not exist, skipping preference save');
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
    <LanguageContext.Provider value={{ insightLanguage, setInsightLanguage, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}; 