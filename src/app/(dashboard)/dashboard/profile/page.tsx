'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { AnimatedGridPattern } from '@/components/ui/AnimatedGridPattern';
import { AuthGuard } from '@/components/auth/AuthGuard';
import AuthDebugger from '@/components/auth/AuthDebugger';
import { PageHeaderCard } from '@/components/ui/PageHeaderCard';
import { FaUser } from 'react-icons/fa';

export default function ProfilePage() {
  const { user } = useAuthContext();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }
        
        setUserProfile(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [user]);
  
  useEffect(() => {
    const checkAuthState = async () => {
      console.log('[Profile Page] Checking auth state on mount');
      const { data, error } = await supabase.auth.getSession();
      console.log('[Profile Page] Session check result:', { 
        hasSession: !!data.session,
        user: data.session?.user?.id || 'none',
        error: error ? error.message : 'none'
      });
    };
    
    checkAuthState();
  }, []);
  
  return (
    <AuthGuard>
      <div className="container mx-auto py-6 px-4 sm:px-6">
        <PageHeaderCard
          title="Profile"
          description="Manage your account information"
          icon={FaUser}
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
                <p className="mt-4 text-gray-600">Loading profile...</p>
              </div>
            ) : userProfile ? (
              <div className="rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 shadow-lg">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Account Information</h2>
                    <div className="mt-4 space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</p>
                        <p className="mt-1 text-gray-900 dark:text-white">{userProfile.username}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                        <p className="mt-1 text-gray-900 dark:text-white">{userProfile.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</p>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {new Date(userProfile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Progress</h2>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Level</p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{userProfile.level || 1}</p>
                      </div>
                      <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Points</p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{userProfile.points || 0}</p>
                      </div>
                      <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Streak</p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{userProfile.streak_count || 0} days</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow">
                <p className="text-gray-600 dark:text-gray-400">Profile not found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <AuthDebugger pageName="profile" />
    </AuthGuard>
  );
} 