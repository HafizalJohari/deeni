'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import AuthDebugger from '@/components/auth/AuthDebugger';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import ReflectionForm from '@/components/self-reflections/ReflectionForm';
import ReflectionAnalysis from '@/components/self-reflections/ReflectionAnalysis';
import { SelfReflection } from '@/types/self-reflections';
import { AnimatedGridPattern } from '@/components/ui/AnimatedGridPattern';
import { getLocalReflections, clearLocalReflections } from '@/utils/localStorageUtils';
import { toast } from 'sonner';
import { PageHeaderCard } from '@/components/ui/PageHeaderCard';
import { FaBookJournalWhills } from 'react-icons/fa6';
import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function SelfReflectionsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthContext();
  const supabase = createClientComponentClient();
  const [reflections, setReflections] = useState<SelfReflection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('[SelfReflections] Checking session state...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[SelfReflections] Session check error:', error);
          return;
        }

        console.log('[SelfReflections] Session state:', {
          hasSession: !!session,
          hasUser: !!user,
          isLoading: authLoading
        });

        // Only redirect if we've confirmed there's no session AND auth is done loading
        if (!session && !authLoading) {
          console.log('[SelfReflections] No valid session found, redirecting to login');
          const currentPath = window.location.pathname;
          router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
          return;
        }

        setHasCheckedAuth(true);
      } catch (error) {
        console.error('[SelfReflections] Error checking session:', error);
      }
    };

    checkSession();
  }, [authLoading, router, supabase.auth, user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !hasCheckedAuth) return;
      
      try {
        console.log('[SelfReflections] Starting data fetch for user:', user.id);
        
        // First try to get existing profile
        let { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('[SelfReflections] Error fetching profile:', profileError);
          throw profileError;
        }

        // If no profile exists, create one
        if (!profileData && user) {
          console.log('[SelfReflections] Creating new user profile');
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert([
              {
                id: user.id,
                email: user.email,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                level: 1
              }
            ])
            .select()
            .single();

          if (createError) {
            console.error('[SelfReflections] Error creating user profile:', createError);
            throw createError;
          }

          profileData = newProfile;
        }

        if (profileData) {
          console.log('[SelfReflections] User profile loaded:', profileData.id);
          setUserProfile(profileData);
        }

        // Get reflections from server
        const { data: reflectionsData, error: reflectionsError } = await supabase
          .from('self_reflections')
          .select('id, user_id, feeling, feeling_icon, reflection_text, analysis, created_at, updated_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (reflectionsError) {
          console.error('[SelfReflections] Error fetching reflections:', reflectionsError);
          throw reflectionsError;
        }

        // Get local reflections
        const localReflections = getLocalReflections();
        console.log('[SelfReflections] Local reflections found:', localReflections.length);

        // Try to sync local reflections if any exist
        if (localReflections.length > 0) {
          console.log('[SelfReflections] Attempting to sync local reflections');
          
          // Format local reflections for server
          const formattedLocalReflections = localReflections.map(reflection => ({
            user_id: user.id,
            reflection_text: reflection.reflection_text,
            feeling: reflection.feeling,
            feeling_icon: reflection.feeling_icon,
            created_at: reflection.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            analysis: reflection.analysis || {
              islamicPerspective: '',
              recommendations: [],
              spiritualGuidance: '',
              relevantVerses: [],
              relevantHadith: []
            }
          }));

          console.log('[SelfReflections] Attempting to sync reflections:', {
            count: formattedLocalReflections.length,
            sample: formattedLocalReflections[0]
          });

          // Insert local reflections to server
          const { error: syncError } = await supabase
            .from('self_reflections')
            .insert(formattedLocalReflections)
            .select();

          if (syncError) {
            console.error('[SelfReflections] Error syncing local reflections:', {
              error: syncError,
              code: syncError.code,
              details: syncError.details,
              hint: syncError.hint
            });
            toast.error('Failed to sync offline reflections. Your data is still saved locally.');
          } else {
            console.log('[SelfReflections] Local reflections synced successfully');
            clearLocalReflections();
          }

          // Fetch updated reflections after sync attempt
          const { data: updatedData, error: updateError } = await supabase
            .from('self_reflections')
            .select('id, user_id, feeling, feeling_icon, reflection_text, analysis, created_at, updated_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (updateError) {
            console.error('[SelfReflections] Error fetching updated reflections:', updateError);
          } else {
            console.log('[SelfReflections] Updated reflections fetched:', updatedData?.length || 0);
            setReflections(updatedData || []);
          }
        } else {
          // If no local reflections, just use server data
          setReflections(reflectionsData || []);
        }

      } catch (error: any) {
        console.error('[SelfReflections] Error in data fetch:', error);
        toast.error('Failed to load reflections. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    };

    if (hasCheckedAuth && user && !authLoading) {
      fetchData();
    }
  }, [user, authLoading, supabase, hasCheckedAuth]);

  // Show loading state while auth is being checked
  if (authLoading || !hasCheckedAuth) {
    return (
      <div className="container mx-auto py-6 px-4 sm:px-6 space-y-6">
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  // If no user after auth check, render nothing (redirect will happen)
  if (!user) {
    return null;
  }

  return (
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

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[100px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : (
        <>
          <PageHeaderCard
            title="Self-Reflections"
            description="Record and analyze your spiritual journey"
            icon={FaBookJournalWhills}
            actions={
              <Badge variant="outline" className="text-sm font-medium">
                {userProfile?.level ? `Level ${userProfile.level}` : 'Level 1'}
              </Badge>
            }
          />

          <Card className="relative z-10">
            <Tabs defaultValue="new" className="p-6">
              <TabsList className="mb-4">
                <TabsTrigger value="new">New Reflection</TabsTrigger>
                <TabsTrigger value="history">History & Analysis</TabsTrigger>
              </TabsList>
              <TabsContent value="new">
                <ReflectionForm />
              </TabsContent>
              <TabsContent value="history">
                {reflections.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No reflections yet. Start by creating a new reflection.
                  </div>
                ) : (
                  <ReflectionAnalysis reflections={reflections} />
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </>
      )}

      <AuthDebugger pageName="self-reflections" />
    </div>
  );
} 