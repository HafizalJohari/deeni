'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { AnimatedGridPattern } from '@/components/ui/AnimatedGridPattern';

export default function NewHabitPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [frequency, setFrequency] = useState('daily');
  const [targetCount, setTargetCount] = useState(1);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create a habit');
      return;
    }
    
    if (!title) {
      setError('Please enter a title for your habit');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const { error } = await supabase.from('habits').insert({
        user_id: user.id,
        title,
        description,
        category,
        frequency,
        target_count: targetCount,
        current_count: 0,
        is_completed: false,
        start_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
      if (error) throw error;
      
      router.push('/dashboard/habits');
    } catch (err: any) {
      setError(err.message || 'Failed to create habit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6 p-6 relative">
      <AnimatedGridPattern 
        className="dark:fill-green-900/5 dark:stroke-green-900/20 fill-green-600/5 stroke-green-600/20 z-0" 
        numSquares={40}
        maxOpacity={0.3}
      />
      
      <div className="relative z-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Habit</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track your daily Islamic practices and build consistency
          </p>
        </div>
        
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        
        <div className="rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Habit Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g., Daily Quran Reading"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g., Read at least 1 page of Quran daily"
              />
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="general">General</option>
                  <option value="prayer">Prayer</option>
                  <option value="quran">Quran</option>
                  <option value="dhikr">Dhikr</option>
                  <option value="charity">Charity</option>
                  <option value="fasting">Fasting</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Frequency
                </label>
                <select
                  id="frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="targetCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Target Count
              </label>
              <input
                type="number"
                id="targetCount"
                value={targetCount}
                onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
                min={1}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="1"
              />
              <p className="mt-1 text-sm text-gray-500">
                How many times do you want to complete this habit?
              </p>
            </div>
            
            <div className="flex justify-between items-center pt-4">
              <Link
                href="/dashboard/habits"
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </Link>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-70 dark:bg-green-700 dark:hover:bg-green-600"
              >
                {isSubmitting ? 'Creating...' : 'Create Habit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 