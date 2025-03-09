'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { GraduationCap } from "lucide-react";
import { AuthGuard } from '@/components/auth/AuthGuard';
import AuthDebugger from '@/components/auth/AuthDebugger';
import { AnimatedGridPattern } from '@/components/ui/AnimatedGridPattern';
import { PageHeaderCard } from '@/components/ui/PageHeaderCard';
import { Badge } from '@/components/ui/badge';
import { EducationalContent } from "@/components/educational/educational-content";

export default function LearnPage() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userData.user.id)
          .single();

        if (profileError) throw profileError;
        setUserProfile(profileData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const checkAuthState = async () => {
      console.log('[Learn Page] Checking auth state on mount');
      const { data, error } = await supabase.auth.getSession();
      console.log('[Learn Page] Session check result:', { 
        hasSession: !!data.session,
        user: data.session?.user?.id || 'none',
        error: error ? error.message : 'none'
      });
    };
    
    checkAuthState();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="container mx-auto py-6 px-4 sm:px-6 space-y-6 relative min-h-screen isolate">
        <AnimatedGridPattern 
          className="fixed inset-0 -z-10 opacity-40 dark:opacity-30 animate-fade-in pointer-events-none select-none" 
          width={32} 
          height={32} 
          strokeDasharray={4} 
          numSquares={40}
          maxOpacity={0.4}
          duration={5}
          repeatDelay={1}
        />
        
        <PageHeaderCard
          title="Islamic Education"
          description="Explore a wealth of Islamic knowledge through various educational resources"
          icon={GraduationCap}
          actions={
            <Badge variant="outline" className="text-sm font-medium">
              {userProfile?.level ? `Level ${userProfile.level}` : 'Level 1'}
            </Badge>
          }
        />

        <div className="relative z-3 space-y-3">
          <EducationalContent />
        </div>
      </div>
      <AuthDebugger pageName="learn" />
    </AuthGuard>
  );
} 