'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { AnimatedGridPattern } from '@/components/ui/AnimatedGridPattern';
import { AuthGuard } from '@/components/auth/AuthGuard';
import AuthDebugger from '@/components/auth/AuthDebugger';
import { PageHeaderCard } from '@/components/ui/PageHeaderCard';
import { FaUser, FaCamera } from 'react-icons/fa';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  created_at: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  level: number;
  points: number;
  streak_count: number;
  twitter_handle?: string;
  github_handle?: string;
}

export default function ProfilePage() {
  const { user } = useAuthContext();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
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
          toast.error('Failed to load profile');
          return;
        }
        
        setUserProfile(data);
        setEditForm(data);
      } catch (error) {
        console.error('Error:', error);
        toast.error('An unexpected error occurred');
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
  
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    setAvatarFile(file);
  };

  const handleUpdateProfile = async () => {
    if (!user || !editForm) return;
    
    try {
      setIsUpdating(true);
      
      // Upload avatar if changed
      let avatar_url = userProfile?.avatar_url;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        // Upload the file
        const { data, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error('Failed to upload avatar: ' + uploadError.message);
          return;
        }
        
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
          
        avatar_url = publicUrl;
      }
      
      const updates = {
        ...editForm,
        avatar_url,
        updated_at: new Date().toISOString(),
      };
      
      const { error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);
        
      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }
      
      setUserProfile(prev => ({ ...prev, ...updates }));
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile: ' + (error as Error).message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };
  
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
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100">
                        {userProfile.avatar_url ? (
                          <img
                            src={userProfile.avatar_url}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-green-50 dark:bg-green-900/20">
                            <FaUser className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {userProfile.full_name || userProfile.username}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{userProfile.email}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">About</h3>
                      <p className="mt-2 text-gray-600 dark:text-gray-300">
                        {userProfile.bio || 'No bio added yet'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</p>
                        <p className="mt-1 text-gray-900 dark:text-white">{userProfile.username}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</p>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {new Date(userProfile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {userProfile.twitter_handle && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Twitter</p>
                          <a
                            href={`https://twitter.com/${userProfile.twitter_handle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 text-blue-600 hover:underline"
                          >
                            @{userProfile.twitter_handle}
                          </a>
                        </div>
                      )}
                      {userProfile.github_handle && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">GitHub</p>
                          <a
                            href={`https://github.com/${userProfile.github_handle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 text-blue-600 hover:underline"
                          >
                            @{userProfile.github_handle}
                          </a>
                        </div>
                      )}
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
                    <Dialog open={isEditing} onOpenChange={setIsEditing}>
                      <DialogTrigger asChild>
                        <Button variant="default" className="bg-green-600 hover:bg-green-700">
                          Edit Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Edit Profile</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="avatar">Profile Picture</Label>
                            <div className="flex items-center space-x-4">
                              <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100">
                                {avatarFile ? (
                                  <img
                                    src={URL.createObjectURL(avatarFile)}
                                    alt="Preview"
                                    className="h-full w-full object-cover"
                                  />
                                ) : userProfile.avatar_url ? (
                                  <img
                                    src={userProfile.avatar_url}
                                    alt="Current"
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-green-50">
                                    <FaUser className="h-8 w-8 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <label className="cursor-pointer">
                                  <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                                    <FaCamera className="h-4 w-4" />
                                    <span>Change</span>
                                  </div>
                                  <input
                                    type="file"
                                    id="avatar"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="full_name">Full Name</Label>
                            <Input
                              id="full_name"
                              name="full_name"
                              value={editForm.full_name || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                              id="bio"
                              name="bio"
                              value={editForm.bio || ''}
                              onChange={handleInputChange}
                              rows={3}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="twitter_handle">Twitter Handle</Label>
                            <Input
                              id="twitter_handle"
                              name="twitter_handle"
                              value={editForm.twitter_handle || ''}
                              onChange={handleInputChange}
                              placeholder="username (without @)"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="github_handle">GitHub Handle</Label>
                            <Input
                              id="github_handle"
                              name="github_handle"
                              value={editForm.github_handle || ''}
                              onChange={handleInputChange}
                              placeholder="username"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-4">
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            disabled={isUpdating}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleUpdateProfile}
                            disabled={isUpdating}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isUpdating ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
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