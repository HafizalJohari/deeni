'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { FaArrowLeft, FaPray, FaHandHoldingHeart, FaBook, FaUtensils, FaRunning, FaPlus } from 'react-icons/fa';

const habitSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  category: z.enum(['prayer', 'charity', 'quran', 'fasting', 'exercise', 'other']),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  target_count: z.number().min(1, 'Target must be at least 1'),
  start_date: z.string(),
  end_date: z.string().optional(),
});

type HabitFormValues = z.infer<typeof habitSchema>;

const categories = [
  { id: 'prayer', name: 'Prayer', icon: FaPray, color: 'blue' },
  { id: 'charity', name: 'Charity', icon: FaHandHoldingHeart, color: 'purple' },
  { id: 'quran', name: 'Quran', icon: FaBook, color: 'yellow' },
  { id: 'fasting', name: 'Fasting', icon: FaUtensils, color: 'red' },
  { id: 'exercise', name: 'Exercise', icon: FaRunning, color: 'green' },
  { id: 'other', name: 'Other', icon: FaPlus, color: 'gray' },
];

export default function NewHabitPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'prayer',
      frequency: 'daily',
      target_count: 1,
      start_date: new Date().toISOString().split('T')[0],
    },
  });

  const selectedCategory = watch('category');

  const handleCreateHabit = async (data: HabitFormValues) => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      // Create the habit
      const { error: habitError } = await supabase.from('habits').insert({
        user_id: userData.user.id,
        title: data.title,
        description: data.description || null,
        category: data.category,
        frequency: data.frequency,
        target_count: data.target_count,
        current_count: 0,
        is_completed: false,
        start_date: data.start_date,
        end_date: data.end_date || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (habitError) {
        throw habitError;
      }

      router.push('/dashboard/habits');
    } catch (error: any) {
      setError(error.message || 'An error occurred while creating the habit');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link
          href="/dashboard/habits"
          className="mr-4 rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        >
          <FaArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Habit</h1>
          <p className="mt-1 text-gray-600">Track a new good deed or practice</p>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit(handleCreateHabit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Habit Title
            </label>
            <input
              id="title"
              type="text"
              {...register('title')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
              placeholder="e.g., Daily Quran Reading"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description (Optional)
            </label>
            <textarea
              id="description"
              {...register('description')}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
              placeholder="Add details about your habit..."
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <div key={category.id}>
                    <button
                      type="button"
                      onClick={() => setValue('category', category.id as any)}
                      className={`flex h-24 w-full flex-col items-center justify-center rounded-lg border p-3 ${
                        selectedCategory === category.id
                          ? `border-${category.color}-500 bg-${category.color}-50 text-${category.color}-700`
                          : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`h-6 w-6 ${selectedCategory === category.id ? `text-${category.color}-600` : ''}`} />
                      <span className="mt-2 text-sm font-medium">{category.name}</span>
                    </button>
                  </div>
                );
              })}
            </div>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
                Frequency
              </label>
              <select
                id="frequency"
                {...register('frequency')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              {errors.frequency && (
                <p className="mt-1 text-sm text-red-600">{errors.frequency.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="target_count" className="block text-sm font-medium text-gray-700">
                Target Count
              </label>
              <input
                id="target_count"
                type="number"
                min="1"
                {...register('target_count', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
              />
              {errors.target_count && (
                <p className="mt-1 text-sm text-red-600">{errors.target_count.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                id="start_date"
                type="date"
                {...register('start_date')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
              />
              {errors.start_date && (
                <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
              End Date (Optional)
            </label>
            <input
              id="end_date"
              type="date"
              {...register('end_date')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              href="/dashboard/habits"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-70"
            >
              {isLoading ? 'Creating...' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 