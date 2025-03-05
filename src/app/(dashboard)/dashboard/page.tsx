'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { generateDailyReminder } from '@/lib/openai/client';
import { FaCalendarCheck, FaChartLine, FaMedal, FaQuran, FaBook, FaUserCog } from 'react-icons/fa';
import Link from 'next/link';
import { generalGuidance, habitGuidance, quranGuidance, hadithGuidance, getRandomGuidance } from '@/lib/islamic-guidance';
import Tooltip from '@/components/ui/Tooltip';
import { BentoGrid, BentoCard } from '@/components/ui/bento';

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
      <div className="flex h-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  const welcomeGuidance = getRandomGuidance(generalGuidance);
  const habitTipGuidance = getRandomGuidance(habitGuidance);
  const quranTipGuidance = getRandomGuidance(quranGuidance);
  const hadithTipGuidance = getRandomGuidance(hadithGuidance);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between rounded-lg bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
            <Tooltip 
              content={
                <div>
                  <h3 className="font-bold mb-1">{welcomeGuidance.title}</h3>
                  <p>{welcomeGuidance.content}</p>
                </div>
              } 
              source={welcomeGuidance.source}
            />
          </div>
          <p className="mt-1 text-gray-600">Welcome to your Deeni dashboard</p>
        </div>
        <div className="mt-4 flex items-center space-x-4 sm:mt-0">
          <div className="flex flex-col items-center rounded-lg bg-green-50 px-4 py-2 text-center">
            <span className="text-sm font-medium text-gray-600">Streak</span>
            <span className="text-xl font-bold text-green-700">{userProfile?.streak_count || 0}</span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-green-50 px-4 py-2 text-center">
            <span className="text-sm font-medium text-gray-600">Level</span>
            <span className="text-xl font-bold text-green-700">{userProfile?.level || 1}</span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-green-50 px-4 py-2 text-center">
            <span className="text-sm font-medium text-gray-600">Points</span>
            <span className="text-xl font-bold text-green-700">{userProfile?.points || 0}</span>
          </div>
        </div>
      </div>

      <BentoCard
        name="Daily Reminder"
        className="col-span-1 md:col-span-2 lg:col-span-3"
      >
        <div className="mt-4 rounded-lg bg-green-50 p-4 text-gray-700">
          <p className="italic">{dailyReminder}</p>
        </div>
      </BentoCard>

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
                <div key={habit.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center">
                    <FaCalendarCheck className="mr-3 h-5 w-5 text-green-600" />
                    <span className="font-medium">{habit.title}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {habit.current_count}/{habit.target_count}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No habits created yet. Start tracking your good deeds!</p>
            )}
          </div>
          <div className="mt-4">
            <Link
              href="/dashboard/habits/new"
              className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
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
          <div className="mt-4 flex items-center justify-center rounded-lg bg-gray-50 p-4">
            <div className="text-center">
              <p className="text-gray-600">Discover content tailored to your needs</p>
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
          <div className="mt-4 flex items-center justify-center rounded-lg bg-gray-50 p-4">
            <div className="text-center">
              <p className="text-gray-600">{quranTipGuidance.title}</p>
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
          <div className="mt-4 flex items-center justify-center rounded-lg bg-gray-50 p-4">
            <div className="text-center">
              <p className="text-gray-600">{hadithTipGuidance.title}</p>
            </div>
          </div>
        </BentoCard>
      </BentoGrid>
    </div>
  );
} 