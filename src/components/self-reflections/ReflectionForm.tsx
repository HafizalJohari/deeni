'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface FeelingOption {
  value: string;
  label: string;
  icon: string;
}

const FEELING_OPTIONS: FeelingOption[] = [
  { value: 'grateful', label: 'Grateful', icon: '🙏' },
  { value: 'peaceful', label: 'Peaceful', icon: '😌' },
  { value: 'hopeful', label: 'Hopeful', icon: '🌟' },
  { value: 'reflective', label: 'Reflective', icon: '🤔' },
  { value: 'challenged', label: 'Challenged', icon: '💪' },
  { value: 'anxious', label: 'Anxious', icon: '😰' },
  { value: 'overwhelmed', label: 'Overwhelmed', icon: '😩' },
  { value: 'motivated', label: 'Motivated', icon: '🔥' }
];

export default function ReflectionForm() {
  const { user } = useAuthContext();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [hasValidSession, setHasValidSession] = useState(false);

  // Verify auth on mount and after any auth state changes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('Initial session check:', {
          hasSession: !!session,
          sessionError: error,
          userId: session?.user?.id,
          contextUserId: user?.id
        });

        if (error) {
          console.error('Auth session error:', error);
          setHasValidSession(false);
          return;
        }

        // If we have a user in context but no valid session, sign out
        if (user && !session) {
          console.log('Session expired, signing out...');
          await supabase.auth.signOut();
          router.push('/login');
          return;
        }

        setHasValidSession(!!session);
      } catch (error) {
        console.error('Error checking auth:', error);
        setHasValidSession(false);
      }
    };

    checkAuth();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, 'Has session:', !!session);
      setHasValidSession(!!session);
      
      if (event === 'SIGNED_OUT') {
        router.push('/auth/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, user, router]);

  const analyzeFeelings = async (text: string) => {
    if (!text.trim() || text.length < 20) return;

    try {
      setIsAnalyzing(true);
      const response = await fetch('/api/analyze-feelings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 503) {
          console.error('Analysis service not configured:', data.details);
          return;
        }
        throw new Error(data.details || 'Failed to analyze feelings');
      }

      const { suggestedFeeling } = data;
      if (suggestedFeeling) {
        setSelectedFeeling(suggestedFeeling.label);
        toast.success('Feeling analyzed and suggested');
      }
    } catch (error) {
      console.error('Failed to analyze feelings:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setReflectionText(text);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const newTimeout = setTimeout(() => {
      analyzeFeelings(text);
    }, 1000);

    setTypingTimeout(newTimeout);
  };

  const handleFeelingSelect = (feeling: string) => {
    setSelectedFeeling(feeling);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to submit reflections');
      return;
    }

    if (!reflectionText.trim() || !selectedFeeling) {
      toast.error('Please enter your reflection and select a feeling');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Find the selected feeling option to get its icon
      const feelingOption = FEELING_OPTIONS.find(f => f.value === selectedFeeling);
      if (!feelingOption) {
        throw new Error('Invalid feeling selected');
      }

      // First, analyze the reflection
      const analysisResponse = await fetch('/api/analyze-reflection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: reflectionText,
          feeling: selectedFeeling
        }),
      });

      if (!analysisResponse.ok) {
        const error = await analysisResponse.json();
        throw new Error(error.details || 'Failed to analyze reflection');
      }

      const { analysis } = await analysisResponse.json();

      // Then save the reflection with the analysis
      const { error } = await supabase.from('self_reflections').insert([
        {
          user_id: user.id,
          reflection_text: reflectionText,
          feeling: selectedFeeling,
          feeling_icon: feelingOption.icon,
          created_at: new Date().toISOString(),
          analysis
        },
      ]);

      if (error) {
        console.error('Error submitting reflection:', error);
        throw error;
      }

      toast.success('Reflection submitted and analyzed successfully');
      setReflectionText('');
      setSelectedFeeling(null);
      router.refresh();
    } catch (error) {
      console.error('Error submitting reflection:', error);
      toast.error('Error submitting reflection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="reflection" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Your Reflection
        </label>
        <textarea
          id="reflection"
          value={reflectionText}
          onChange={handleTextChange}
          placeholder="Share your thoughts and feelings..."
          className="w-full min-h-[150px] p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          How are you feeling?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {FEELING_OPTIONS.map((feeling) => (
            <button
              key={feeling.value}
              type="button"
              onClick={() => setSelectedFeeling(feeling.value)}
              className={cn(
                'p-2 rounded-md border text-sm font-medium transition-colors flex items-center justify-center gap-2',
                selectedFeeling === feeling.value
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500'
              )}
              disabled={isSubmitting}
            >
              <span>{feeling.icon}</span>
              <span>{feeling.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !reflectionText.trim() || !selectedFeeling}
          className={cn(
            'px-4 py-2 rounded-md text-white font-medium transition-colors',
            (isSubmitting || !reflectionText.trim() || !selectedFeeling)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
          )}
        >
          {isSubmitting ? (
            <>
              <span className="mr-2">
                {isAnalyzing ? 'Analyzing...' : 'Submitting...'}
              </span>
              <span className="inline-block animate-spin">⏳</span>
            </>
          ) : (
            'Submit Reflection'
          )}
        </button>
      </div>
    </form>
  );
} 