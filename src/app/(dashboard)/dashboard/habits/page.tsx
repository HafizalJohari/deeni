'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { AnimatedGridPattern } from '@/components/ui/AnimatedGridPattern';
import Link from 'next/link';
import { AuthGuard } from '@/components/auth/AuthGuard';
import AuthDebugger from '@/components/auth/AuthDebugger';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { PageHeaderCard } from '@/components/ui/PageHeaderCard';
import { Button } from '@/components/ui/button';
import { FaTasks, FaPlus } from 'react-icons/fa';

interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  created_at: string;
  count: number;
  notes?: string;
}

interface Habit {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  category: string;
  frequency: string;
  target_count: number;
  current_count: number;
  is_completed: boolean;
  start_date: string;
  end_date?: string;
  last_tracked_at?: string;
}

export default function HabitsPage() {
  const { user } = useAuthContext();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingHabitId, setUpdatingHabitId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchHabits = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching habits:', error);
          return;
        }
        
        setHabits(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHabits();
  }, [user]);
  
  useEffect(() => {
    const checkAuthState = async () => {
      console.log('[Habits Page] Checking auth state on mount');
      const { data, error } = await supabase.auth.getSession();
      console.log('[Habits Page] Session check result:', { 
        hasSession: !!data.session,
        user: data.session?.user?.id || 'none',
        error: error ? error.message : 'none'
      });
    };
    
    checkAuthState();
  }, []);
  
  const handleLogProgress = async (habitId: string) => {
    if (!user || updatingHabitId) return;

    try {
      setUpdatingHabitId(habitId);
      
      // Get the current habit
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      // Check if target is already reached
      if (habit.current_count >= habit.target_count) {
        toast.info("You've already reached your target for this habit!");
        return;
      }

      // Start a Supabase transaction
      const newCount = habit.current_count + 1;
      const isNowCompleted = newCount >= habit.target_count;
      const now = new Date().toISOString();

      // First, create a log entry
      const { error: logError } = await supabase
        .from('habit_logs')
        .insert({
          habit_id: habitId,
          user_id: user.id,
          count: 1,
          created_at: now
        });

      if (logError) {
        throw logError;
      }

      // Then update the habit
      const { data, error: habitError } = await supabase
        .from('habits')
        .update({ 
          current_count: newCount,
          last_tracked_at: now,
          is_completed: isNowCompleted,
          updated_at: now
        })
        .eq('id', habitId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (habitError) {
        throw habitError;
      }

      // Update local state
      setHabits(habits.map(h => 
        h.id === habitId ? { 
          ...h, 
          current_count: newCount,
          last_tracked_at: now,
          is_completed: isNowCompleted,
          updated_at: now
        } : h
      ));

      // Show success message
      toast.success('Progress logged successfully!');

      // Check if target reached
      if (isNowCompleted) {
        toast.success("Congratulations! You've reached your target! 🎉");
      }

    } catch (error) {
      console.error('Error logging progress:', error);
      toast.error('Failed to log progress. Please try again.');
    } finally {
      setUpdatingHabitId(null);
    }
  };

  return (
    <AuthGuard>
      <div className="container mx-auto py-6 px-4 sm:px-6">
        <PageHeaderCard
          title="Habits Tracker"
          description="Track and manage your daily Islamic habits to build consistency"
          icon={FaTasks}
          actions={
            <Link
              href="/dashboard/habits/new"
              className="inline-flex items-center"
            >
              <Button size="sm">
                <FaPlus className="mr-2 h-3 w-3 text-green-600" />
                New Habit
              </Button>
            </Link>
          }
        />
        
        <div className="space-y-6 p-6 relative">
          <AnimatedGridPattern 
            className="dark:fill-green-900/5 dark:stroke-green-900/20 fill-green-600/5 stroke-green-600/20 z-0" 
            numSquares={40}
            maxOpacity={0.3}
          />
          
          <div className="relative z-10">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Loading habits...</p>
              </div>
            ) : habits.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {habits.map((habit) => (
                  <div 
                    key={habit.id}
                    className="flex flex-col justify-between rounded-xl bg-white dark:bg-gray-800 p-6 shadow-md transition-all hover:shadow-lg"
                  >
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{habit.title}</h3>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{habit.description}</p>
                      
                      <div className="mt-4">
                        <div className="flex justify-between text-sm font-medium text-gray-900 dark:text-white">
                          <span>Progress</span>
                          <span>{habit.current_count} / {habit.target_count}</span>
                        </div>
                        <div className="mt-1 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                          <div 
                            className="h-2 rounded-full bg-green-600 transition-all duration-300"
                            style={{ width: `${Math.min((habit.current_count / habit.target_count) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {habit.last_tracked_at 
                          ? `Last tracked: ${new Date(habit.last_tracked_at).toLocaleDateString()}`
                          : `Created: ${new Date(habit.created_at).toLocaleDateString()}`
                        }
                      </span>
                      <button
                        onClick={() => handleLogProgress(habit.id)}
                        disabled={updatingHabitId === habit.id || habit.current_count >= habit.target_count}
                        className={cn(
                          "rounded-md px-3 py-1 text-sm font-medium transition-all",
                          updatingHabitId === habit.id
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : habit.current_count >= habit.target_count
                            ? "bg-green-100 text-green-700 cursor-not-allowed"
                            : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30"
                        )}
                      >
                        {updatingHabitId === habit.id 
                          ? 'Updating...' 
                          : habit.current_count >= habit.target_count
                          ? 'Completed!'
                          : 'Log Progress'
                        }
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow">
                <p className="text-gray-600 dark:text-gray-400">You haven't created any habits yet.</p>
                <p className="mt-2 text-gray-500 dark:text-gray-500">Start tracking your good deeds and build consistency in your practice.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <AuthDebugger pageName="habits" />
    </AuthGuard>
  );
} 