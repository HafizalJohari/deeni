'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { FaPlus, FaCheck, FaRegClock, FaCalendarAlt, FaEllipsisH } from 'react-icons/fa';
import { habitGuidance, getRandomGuidance } from '@/lib/islamic-guidance';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type Habit = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  frequency: string;
  target_count: number;
  current_count: number;
  is_completed: boolean;
  start_date: string;
  end_date: string | null;
};

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        setError(null);
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        const { data, error } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', userData.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setHabits(data || []);
      } catch (error: any) {
        console.error('Error fetching habits:', error);
        setError('Failed to load habits. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHabits();
  }, []);

  const handleLogProgress = async (habitId: string) => {
    try {
      // Find the habit
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) {
        throw new Error('Habit not found');
      }

      // Check if habit is already completed
      if (habit.is_completed) {
        return;
      }

      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      // Start a transaction by getting the current habit state
      const { data: currentHabit, error: habitError } = await supabase
        .from('habits')
        .select('current_count, target_count')
        .eq('id', habitId)
        .single();

      if (habitError) throw habitError;
      if (!currentHabit) {
        throw new Error('Could not fetch current habit state');
      }

      const newCount = (currentHabit.current_count || 0) + 1;
      const isCompleted = newCount >= currentHabit.target_count;

      // Create a new log entry
      const { error: logError } = await supabase.from('habit_logs').insert({
        habit_id: habitId,
        user_id: userData.user.id,
        count: 1,
        created_at: new Date().toISOString(),
      });

      if (logError) throw logError;

      // Update the habit's progress
      const { error: updateError } = await supabase
        .from('habits')
        .update({
          current_count: newCount,
          is_completed: isCompleted,
          updated_at: new Date().toISOString(),
        })
        .eq('id', habitId);

      if (updateError) throw updateError;

      // Update local state
      setHabits(
        habits.map((h) =>
          h.id === habitId
            ? {
                ...h,
                current_count: newCount,
                is_completed: isCompleted,
              }
            : h
        )
      );

      // If habit is completed, update user's points and streak
      if (isCompleted) {
        const { error: statsError } = await supabase.rpc('increment_user_stats', {
          user_id: userData.user.id,
          points_to_add: 10,
          streak_to_add: 1,
        });

        if (statsError) throw statsError;
      }
    } catch (error: any) {
      console.error('Error logging progress:', error.message || error);
      throw error; // Re-throw the error to be handled by the UI
    }
  };

  const handleLogProgressClick = async (habitId: string) => {
    try {
      setError(null);
      await handleLogProgress(habitId);
      // Optionally show success message
    } catch (error: any) {
      setError(error.message || 'Failed to log progress. Please try again.');
    }
  };

  const filteredHabits = habits.filter((habit) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return !habit.is_completed;
    if (activeFilter === 'completed') return habit.is_completed;
    return true;
  });

  const randomHabitGuidance = getRandomGuidance(habitGuidance);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Habit Tracker</h1>
          </div>
          <p className="mt-1 text-gray-600">Track your good deeds and build consistency</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center">
            <Link
              href="/dashboard/habits/new"
              className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              <FaPlus className="mr-2 h-4 w-4" />
              Add New Habit
            </Link>
          </div>
        </div>
      </div>

      <div className="flex space-x-2 rounded-lg bg-white p-2 shadow-sm">
        <button
          onClick={() => setActiveFilter('all')}
          className={`rounded-md px-4 py-2 text-sm font-medium ${
            activeFilter === 'all'
              ? 'bg-green-100 text-green-800'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveFilter('active')}
          className={`rounded-md px-4 py-2 text-sm font-medium ${
            activeFilter === 'active'
              ? 'bg-green-100 text-green-800'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setActiveFilter('completed')}
          className={`rounded-md px-4 py-2 text-sm font-medium ${
            activeFilter === 'completed'
              ? 'bg-green-100 text-green-800'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Completed
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {filteredHabits.length === 0 ? (
        <div className="flex h-60 flex-col items-center justify-center rounded-lg bg-white p-6 text-center shadow-sm">
          <div className="rounded-full bg-green-100 p-3">
            <FaCalendarAlt className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No habits found</h3>
          <p className="mt-1 text-gray-600">
            {activeFilter === 'all'
              ? "You haven't created any habits yet."
              : activeFilter === 'active'
              ? "You don't have any active habits."
              : "You haven't completed any habits yet."}
          </p>
          <Link
            href="/dashboard/habits/new"
            className="mt-4 inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <FaPlus className="mr-2 h-4 w-4" />
            Create your first habit
          </Link>
        </div>
      ) : (
        <div className="h-[calc(100vh-16rem)] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
            {filteredHabits.map((habit) => (
              <div
                key={habit.id}
                className="aspect-square flex flex-col rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      habit.category === 'prayer'
                        ? 'bg-blue-100 text-blue-800'
                        : habit.category === 'charity'
                        ? 'bg-purple-100 text-purple-800'
                        : habit.category === 'quran'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {habit.category.charAt(0).toUpperCase() + habit.category.slice(1)}
                  </span>
                  <div className="relative">
                    <button className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                      <FaEllipsisH className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{habit.title}</h3>
                  {habit.description && (
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">{habit.description}</p>
                  )}

                  <div className="mt-4 flex items-center text-sm text-gray-600">
                    <FaRegClock className="mr-1.5 h-4 w-4 flex-shrink-0" />
                    <span className="line-clamp-1">{habit.frequency}</span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-medium text-gray-700">
                        {habit.current_count}/{habit.target_count}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-green-600 transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            (habit.current_count / habit.target_count) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  {habit.is_completed ? (
                    <button
                      disabled
                      className="flex w-full items-center justify-center rounded-md bg-green-100 px-4 py-2 text-sm font-medium text-green-800"
                    >
                      <FaCheck className="mr-2 h-4 w-4" />
                      Completed
                    </button>
                  ) : (
                    <Button
                      onClick={() => handleLogProgressClick(habit.id)}
                      variant="ghost"
                      size="sm"
                      className="w-full text-green-600 hover:text-green-700 hover:bg-green-50 justify-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Log Progress
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 