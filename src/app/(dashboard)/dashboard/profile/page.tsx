'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { FaUser, FaMedal, FaChartLine, FaCalendarCheck, FaStar, FaQuran, FaBook } from 'react-icons/fa';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalHabits: 0,
    completedHabits: 0,
    quranInsights: 0,
    hadithInsights: 0,
    favoriteInsights: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: '',
      email: '',
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current user
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;
        setUser(userData.user);

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userData.user.id)
          .single();

        if (profileError) throw profileError;
        setUserProfile(profileData);

        // Set form values
        reset({
          username: profileData.username || '',
          email: userData.user.email || '',
        });

        // Get user stats
        const [
          { count: totalHabits },
          { count: completedHabits },
          { count: quranInsights },
          { count: hadithInsights },
          { count: favoriteQuranInsights },
          { count: favoriteHadithInsights },
        ] = await Promise.all([
          supabase.from('habits').select('*', { count: 'exact', head: true }).eq('user_id', userData.user.id),
          supabase.from('habits').select('*', { count: 'exact', head: true }).eq('user_id', userData.user.id).eq('is_completed', true),
          supabase.from('quran_insights').select('*', { count: 'exact', head: true }).eq('user_id', userData.user.id),
          supabase.from('hadith_insights').select('*', { count: 'exact', head: true }).eq('user_id', userData.user.id),
          supabase.from('quran_insights').select('*', { count: 'exact', head: true }).eq('user_id', userData.user.id).eq('is_favorite', true),
          supabase.from('hadith_insights').select('*', { count: 'exact', head: true }).eq('user_id', userData.user.id).eq('is_favorite', true),
        ]);

        setStats({
          totalHabits: totalHabits || 0,
          completedHabits: completedHabits || 0,
          quranInsights: quranInsights || 0,
          hadithInsights: hadithInsights || 0,
          favoriteInsights: (favoriteQuranInsights || 0) + (favoriteHadithInsights || 0),
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [reset]);

  const handleUpdateProfile = async (data: ProfileFormValues) => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({
          username: data.username,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update user email if changed
      if (data.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email,
        });

        if (emailError) throw emailError;
      }

      // Update local state
      setUserProfile({
        ...userProfile,
        username: data.username,
      });

      setSuccessMessage('Profile updated successfully');
    } catch (error: any) {
      setError(error.message || 'An error occurred while updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        <p className="mt-1 text-gray-600">Manage your account and view your progress</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <FaUser className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900">{userProfile?.username || 'User'}</h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <div className="flex justify-center">
                <FaMedal className="h-6 w-6 text-green-600" />
              </div>
              <p className="mt-2 text-sm font-medium text-gray-600">Level</p>
              <p className="text-xl font-bold text-gray-900">{userProfile?.level || 1}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <div className="flex justify-center">
                <FaChartLine className="h-6 w-6 text-green-600" />
              </div>
              <p className="mt-2 text-sm font-medium text-gray-600">Points</p>
              <p className="text-xl font-bold text-gray-900">{userProfile?.points || 0}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <div className="flex justify-center">
                <FaCalendarCheck className="h-6 w-6 text-green-600" />
              </div>
              <p className="mt-2 text-sm font-medium text-gray-600">Streak</p>
              <p className="text-xl font-bold text-gray-900">{userProfile?.streak_count || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Your Stats</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <FaCalendarCheck className="h-5 w-5 text-blue-600" />
                </div>
                <span className="ml-3 text-gray-700">Total Habits</span>
              </div>
              <span className="font-semibold text-gray-900">{stats.totalHabits}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <FaCalendarCheck className="h-5 w-5 text-green-600" />
                </div>
                <span className="ml-3 text-gray-700">Completed Habits</span>
              </div>
              <span className="font-semibold text-gray-900">{stats.completedHabits}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                  <FaQuran className="h-5 w-5 text-yellow-600" />
                </div>
                <span className="ml-3 text-gray-700">Quran Insights</span>
              </div>
              <span className="font-semibold text-gray-900">{stats.quranInsights}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                  <FaBook className="h-5 w-5 text-purple-600" />
                </div>
                <span className="ml-3 text-gray-700">Hadith Insights</span>
              </div>
              <span className="font-semibold text-gray-900">{stats.hadithInsights}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <FaStar className="h-5 w-5 text-red-600" />
                </div>
                <span className="ml-3 text-gray-700">Favorite Insights</span>
              </div>
              <span className="font-semibold text-gray-900">{stats.favoriteInsights}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mt-4 rounded-md bg-green-50 p-4 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(handleUpdateProfile)} className="mt-4 space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              type="text"
              {...register('username')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-70"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 