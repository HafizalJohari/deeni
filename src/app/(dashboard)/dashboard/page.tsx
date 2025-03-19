'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { generateDailyReminder } from '@/lib/xai/client';
import { FaCalendarCheck, FaChartLine, FaMedal, FaQuran, FaBook, FaUserCog, FaSearch, FaStar, FaRegStar, FaSpinner, FaCopy, FaCheck } from 'react-icons/fa';
import Link from 'next/link';
import { generalGuidance, habitGuidance, quranGuidance, hadithGuidance, getRandomGuidance } from '@/lib/islamic-guidance';
import { BentoGrid, BentoCard } from '@/components/ui/bento';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AnimatedGridPattern } from '@/components/ui/AnimatedGridPattern';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Book, BookOpenText, Brain, Calendar, HeartHandshake, UserCog } from 'lucide-react';

function AuthDebugger() {
  useEffect(() => {
    const checkAuth = async () => {
      console.log("[Dashboard] Running auth check on dashboard page render");
      const { data, error } = await supabase.auth.getSession();
      console.log("[Dashboard] Auth state on dashboard page:", {
        hasSession: !!data.session,
        userId: data.session?.user?.id || 'none',
        error: error?.message || 'none',
        url: window.location.href,
        cookies: document.cookie.includes('sb-') ? 'Auth cookies present' : 'No auth cookies'
      });
    };
    
    checkAuth();
  }, []);

  return null; // This component doesn't render anything
}

export default function DashboardPage() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [habits, setHabits] = useState<any[]>([]);
  const [dailyReminder, setDailyReminder] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('Fetching user data, user:', user);
        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user?.id)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          setIsLoading(false);
          return;
        }

        console.log('Profile data loaded:', profileData);
        setUserProfile(profileData);

        // Get user habits
        const { data: habitsData, error: habitsError } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false });

        if (habitsError) {
          console.error('Error fetching habits:', habitsError);
          // Continue loading the dashboard even if habits fail
        } else {
          console.log('Habits data loaded:', habitsData?.length || 0, 'habits found');
          setHabits(habitsData || []);
        }

        // Generate daily reminder - handle this separately so it doesn't block the dashboard
        try {
          const username = profileData?.username || 'believer';
          const reminder = await generateDailyReminder(username);
          setDailyReminder(reminder || 'May Allah bless your day with peace and productivity. Remember to approach each task with mindfulness and gratitude.');
          console.log('Daily reminder generated');
        } catch (reminderError) {
          console.error('Error generating daily reminder:', reminderError);
          setDailyReminder(`May Allah bless your day with peace and productivity. Remember to approach each task with mindfulness and gratitude.`);
        }

        // Set loading to false regardless of reminder success
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsLoading(false);
      }
    };

    // Check if user is available before trying to fetch data
    console.log('useEffect triggered, user state:', !!user, 'isLoading:', isLoading);
    
    if (!user) {
      console.log('No user found, waiting for authentication...');
      // Don't keep showing loading if there's no user
      if (isLoading) {
        setIsLoading(false);
      }
      return;
    }
    
    fetchUserData();
  }, [user]); // Only depend on user, not isLoading

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
        <div className="text-center py-4">
          <p className="text-gray-600">Loading your dashboard data...</p>
          <p className="text-sm text-gray-500 mt-2">If this takes too long, please refresh the page</p>
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

  // Fallback if no user profile is loaded but we're not in loading state
  if (!userProfile) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden">
        <AnimatedGridPattern 
          className="absolute inset-0 w-full h-full dark:fill-green-900/5 dark:stroke-green-900/20 fill-green-600/5 stroke-green-600/20" 
          numSquares={20}
          maxOpacity={0.3}
          duration={5}
          width={40}
          height={40}
          repeatDelay={1}
        />
        <div className="space-y-6 p-6 relative">
          <div className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Welcome to Deeni</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">We couldn't load your profile information. Please try refreshing the page or contact support if the issue persists.</p>
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  const welcomeGuidance = getRandomGuidance(generalGuidance);
  const habitTipGuidance = getRandomGuidance(habitGuidance);
  const quranTipGuidance = getRandomGuidance(quranGuidance);
  const hadithTipGuidance = getRandomGuidance(hadithGuidance);

  return (
    <AuthGuard>
      <AuthDebugger />
      <div className="min-h-screen w-full relative overflow-hidden">
        <AnimatedGridPattern 
          className="absolute inset-0 w-full h-full dark:fill-green-900/5 dark:stroke-green-900/20 fill-green-600/5 stroke-green-600/20" 
          numSquares={20}
          maxOpacity={0.3}
          duration={5}
          width={40}
          height={40}
          repeatDelay={1}
        />
        <div className="space-y-6 p-6 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col justify-between rounded-xl bg-white/50 backdrop-blur-sm p-6 shadow-lg sm:flex-row sm:items-center relative z-10"
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
                Icon={Calendar}
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
                Icon={UserCog}
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
                Icon={Book}
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
                Icon={BookOpenText}
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

              <BentoCard
                name="Self Reflection"
                Icon={HeartHandshake}
                description="Track your spiritual and emotional journey through daily reflections"
                href="/dashboard/self-reflections"
                cta="Start Reflecting"
              >
                <div className="mt-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 shadow-sm">
                  <div className="text-center">
                    <p className="text-gray-600">Record your daily spiritual journey</p>
                    <div className="mt-4 flex justify-center space-x-2">
                      {['Mood', 'Goals', 'Growth'].map((topic) => (
                        <Badge key={topic} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </BentoCard>
            </BentoGrid>
          </motion.div>
        </div>
      </div>
    </AuthGuard>
  );
} 