'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { generateDailyReminder } from '@/lib/openai/client';
import { FaCalendarCheck, FaChartLine, FaMedal, FaQuran, FaBook, FaUserCog } from 'react-icons/fa';
import Link from 'next/link';
import { generalGuidance, habitGuidance, quranGuidance, hadithGuidance, getRandomGuidance } from '@/lib/islamic-guidance';
import { BentoGrid, BentoCard } from '@/components/ui/bento';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [habits, setHabits] = useState<any[]>([]);
  const [dailyReminder, setDailyReminder] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

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

        // Get user habits
        const { data: habitsData, error: habitsError } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', userData.user.id)
          .order('created_at', { ascending: false });

        if (habitsError) throw habitsError;
        setHabits(habitsData || []);

        // Generate daily reminder
        const username = profileData?.username || 'believer';
        const reminder = await generateDailyReminder(username);
        setDailyReminder(reminder || 'May Allah bless your day with peace and productivity.');
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col justify-between rounded-xl bg-white/50 backdrop-blur-sm p-6 shadow-lg sm:flex-row sm:items-center">
          <Skeleton className="h-8 w-48" />
          <div className="mt-4 flex items-center space-x-4 sm:mt-0">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-24" />
            ))}
          </div>
        </div>
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const welcomeGuidance = getRandomGuidance(generalGuidance);
  const habitTipGuidance = getRandomGuidance(habitGuidance);
  const quranTipGuidance = getRandomGuidance(quranGuidance);
  const hadithTipGuidance = getRandomGuidance(hadithGuidance);

  return (
    <div className="space-y-6 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col justify-between rounded-xl bg-white/50 backdrop-blur-sm p-6 shadow-lg sm:flex-row sm:items-center"
      >
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
            <Badge variant="outline" className="text-sm font-medium">
              {userProfile?.level ? `Level ${userProfile.level}` : 'Level 1'}
            </Badge>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Welcome back, {userProfile?.username || 'believer'}!</p>
        </div>
        <div className="mt-4 flex items-center space-x-4 sm:mt-0">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-center rounded-xl bg-gradient-to-br from-green-50 to-green-100 px-6 py-3 text-center shadow-sm transition-all hover:shadow-md"
          >
            <span className="text-sm font-medium text-gray-600">Streak</span>
            <span className="text-2xl font-bold text-green-700">{userProfile?.streak_count || 0}</span>
            <span className="text-xs text-gray-500">days</span>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-center rounded-xl bg-gradient-to-br from-green-50 to-green-100 px-6 py-3 text-center shadow-sm transition-all hover:shadow-md"
          >
            <span className="text-sm font-medium text-gray-600">Level</span>
            <span className="text-2xl font-bold text-green-700">{userProfile?.level || 1}</span>
            <span className="text-xs text-gray-500">rank</span>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-center rounded-xl bg-gradient-to-br from-green-50 to-green-100 px-6 py-3 text-center shadow-sm transition-all hover:shadow-md"
          >
            <span className="text-sm font-medium text-gray-600">Points</span>
            <span className="text-2xl font-bold text-green-700">{userProfile?.points || 0}</span>
            <span className="text-xs text-gray-500">total</span>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <BentoCard
          name="Daily Reminder"
          className="col-span-1 md:col-span-2 lg:col-span-3"
        >
          <div className="mt-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-6 text-gray-700 shadow-sm">
            <p className="italic text-lg">{dailyReminder}</p>
          </div>
        </BentoCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <BentoGrid>
          <BentoCard
            name="Active Habits"
            Icon={FaCalendarCheck}
            description="Track your daily Islamic practices and build consistency"
            href="/dashboard/habits"
            cta="View all habits"
          >
            <div className="mt-4 space-y-3">
              {habits.length > 0 ? (
                habits.slice(0, 3).map((habit) => (
                  <motion.div
                    key={habit.id}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex items-center">
                      <FaCalendarCheck className="mr-3 h-5 w-5 text-green-600" />
                      <span className="font-medium">{habit.title}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-24 rounded-full bg-gray-200">
                        <div 
                          className="h-2 rounded-full bg-green-600 transition-all"
                          style={{ width: `${(habit.current_count / habit.target_count) * 100}%` }}
                        />
                      </div>
                      <div className="text-sm font-medium text-gray-600">
                        {habit.current_count}/{habit.target_count}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 text-center">
                  <p className="text-gray-600">No habits created yet. Start tracking your good deeds!</p>
                </div>
              )}
            </div>
            <div className="mt-6">
              <Link
                href="/dashboard/habits/new"
                className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Add New Habit
              </Link>
            </div>
          </BentoCard>

          <BentoCard
            name="Personalization"
            Icon={FaUserCog}
            description="Personalize your spiritual journey with AI-powered insights"
            href="/dashboard/personalization"
            cta="Get Started"
          >
            <div className="mt-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 shadow-sm">
              <div className="text-center">
                <p className="text-gray-600">Discover content tailored to your needs</p>
                <div className="mt-4 flex justify-center space-x-2">
                  {['Quran', 'Hadith', 'Duas'].map((topic) => (
                    <Badge key={topic} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </BentoCard>

          <BentoCard
            name="Quran Insights"
            Icon={FaQuran}
            description="Explore Quranic insights to enrich your journey"
            href="/dashboard/quran"
            cta="Explore Quran"
          >
            <div className="mt-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 shadow-sm">
              <div className="text-center">
                <p className="text-gray-600">{quranTipGuidance.title}</p>
                <div className="mt-4 text-sm text-gray-500">
                  Daily verse and reflection
                </div>
              </div>
            </div>
          </BentoCard>

          <BentoCard
            name="Hadith Insights"
            Icon={FaBook}
            description="Discover wisdom from Hadith for daily application"
            href="/dashboard/hadith"
            cta="Explore Hadith"
          >
            <div className="mt-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 shadow-sm">
              <div className="text-center">
                <p className="text-gray-600">{hadithTipGuidance.title}</p>
                <div className="mt-4 text-sm text-gray-500">
                  Daily hadith and lessons
                </div>
              </div>
            </div>
          </BentoCard>
        </BentoGrid>
      </motion.div>
    </div>
  );
} 