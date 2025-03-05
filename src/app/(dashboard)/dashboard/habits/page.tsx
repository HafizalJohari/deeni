'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { FaPlus, FaCheck, FaRegClock, FaCalendarAlt, FaEllipsisH } from 'react-icons/fa';
import { habitGuidance, getRandomGuidance } from '@/lib/islamic-guidance';
import Tooltip from '@/components/ui/Tooltip';

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

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        const { data, error } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', userData.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setHabits(data || []);
      } catch (error) {
        console.error('Error fetching habits:', error);
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
      if (!habit) return;

      // Check if habit is already completed
      if (habit.is_completed) return;

      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Create a new log entry
      const { error: logError } = await supabase.from('habit_logs').insert({
        habit_id: habitId,
        user_id: userData.user.id,
        count: 1,
        created_at: new Date().toISOString(),
      });

      if (logError) throw logError;

      // Update the habit's current count
      const newCurrentCount = habit.current_count + 1;
      const isCompleted = newCurrentCount >= habit.target_count;

      const { error: updateError } = await supabase
        .from('habits')
        .update({
          current_count: newCurrentCount,
          is_completed: isCompleted,
          updated_at: new Date().toISOString(),
        })
        .eq('id', habitId);

      if (updateError) throw updateError;

      // Update local state
      setHabits((prevHabits) =>
        prevHabits.map((h) =>
          h.id === habitId
            ? {
                ...h,
                current_count: newCurrentCount,
                is_completed: isCompleted,
              }
            : h
        )
      );

      // If habit is completed, update user's points and streak
      if (isCompleted) {
        const { error: userError } = await supabase.rpc('increment_user_stats', {
          user_id: userData.user.id,
          points_to_add: 10,
          streak_to_add: 1,
        });

        if (userError) throw userError;
      }
    } catch (error) {
      console.error('Error logging progress:', error);
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
            <Tooltip 
              content={
                <div>
                  <h3 className="font-bold mb-1">{randomHabitGuidance.title}</h3>
                  <p>{randomHabitGuidance.content}</p>
                </div>
              } 
              source={randomHabitGuidance.source}
            />
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
            <Tooltip 
              content="The Quran states: 'Indeed, Allah will not change the condition of a people until they change what is in themselves.'" 
              source="Quran: Surah Ar-Ra'd 13:11"
              position="bottom"
            />
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredHabits.map((habit) => (
            <div
              key={habit.id}
              className="flex flex-col rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md"
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

              <h3 className="text-lg font-semibold text-gray-900">{habit.title}</h3>
              {habit.description && (
                <p className="mt-1 text-sm text-gray-600">{habit.description}</p>
              )}

              <div className="mt-4 flex items-center text-sm text-gray-600">
                <FaRegClock className="mr-1.5 h-4 w-4" />
                <span>{habit.frequency}</span>
              </div>

              <div className="mt-4 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-medium text-gray-700">
                    {habit.current_count}/{habit.target_count}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-green-600"
                    style={{
                      width: `${Math.min(
                        (habit.current_count / habit.target_count) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="mt-6">
                {habit.is_completed ? (
                  <Tooltip 
                    content="Consistency is key in developing good habits. The Prophet (ﷺ) emphasized the importance of consistency in all good deeds." 
                    source="Islamic Tradition"
                    position="left"
                  >
                    <button
                      disabled
                      className="flex w-full items-center justify-center rounded-md bg-green-100 px-4 py-2 text-sm font-medium text-green-800"
                    >
                      <FaCheck className="mr-2 h-4 w-4" />
                      Completed
                    </button>
                  </Tooltip>
                ) : (
                  <Tooltip 
                    content="Consistency is key in developing good habits. The Prophet (ﷺ) emphasized the importance of consistency in all good deeds." 
                    source="Islamic Tradition"
                    position="left"
                  >
                    <button
                      onClick={() => handleLogProgress(habit.id)}
                      className="flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                    >
                      Log Progress
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 