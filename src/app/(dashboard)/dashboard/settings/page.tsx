'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { AnimatedGridPattern } from '@/components/ui/AnimatedGridPattern';
import { AuthGuard } from '@/components/auth/AuthGuard';
import AuthDebugger from '@/components/auth/AuthDebugger';
import { supabase } from '@/lib/supabase/client';
import { PageHeaderCard } from '@/components/ui/PageHeaderCard';
import { FaCog } from 'react-icons/fa';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Separator } from '@/components/ui/separator';
import { useLanguage, SupportedLanguage } from '@/contexts/LanguageContext';

export default function SettingsPage() {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState('account');
  const { theme, setTheme } = useTheme();
  const { insightLanguage, setInsightLanguage, isLoading: languageLoading } = useLanguage();
  const [reduceAnimations, setReduceAnimations] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [updatingLanguage, setUpdatingLanguage] = useState(false);
  
  useEffect(() => {
    // Load saved preferences from localStorage
    const savedReduceAnimations = localStorage.getItem('reduceAnimations') === 'true';
    const savedHighContrast = localStorage.getItem('highContrast') === 'true';
    
    setReduceAnimations(savedReduceAnimations);
    setHighContrast(savedHighContrast);
    
    // Apply the settings
    if (savedReduceAnimations) {
      document.documentElement.classList.add('reduce-motion');
    }
    
    if (savedHighContrast) {
      document.documentElement.classList.add('high-contrast');
    }
  }, []);

  const handleReduceAnimations = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setReduceAnimations(isChecked);
    localStorage.setItem('reduceAnimations', isChecked.toString());
    
    if (isChecked) {
      document.documentElement.classList.add('reduce-motion');
      toast.success('Reduced animations enabled');
    } else {
      document.documentElement.classList.remove('reduce-motion');
      toast.success('Standard animations restored');
    }
  };

  const handleHighContrast = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setHighContrast(isChecked);
    localStorage.setItem('highContrast', isChecked.toString());
    
    if (isChecked) {
      document.documentElement.classList.add('high-contrast');
      toast.success('High contrast mode enabled');
    } else {
      document.documentElement.classList.remove('high-contrast');
      toast.success('Standard contrast restored');
    }
  };
  
  useEffect(() => {
    const checkAuthState = async () => {
      console.log('[Settings Page] Checking auth state on mount');
      const { data, error } = await supabase.auth.getSession();
      console.log('[Settings Page] Session check result:', { 
        hasSession: !!data.session,
        user: data.session?.user?.id || 'none',
        error: error ? error.message : 'none'
      });
    };
    
    checkAuthState();
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast.success(`Theme changed to ${newTheme}`);
  };

  const handleLanguageChange = async (language: SupportedLanguage) => {
    try {
      setUpdatingLanguage(true);
      await setInsightLanguage(language);
      toast.success(`Language changed to ${language.charAt(0).toUpperCase() + language.slice(1)}`);
    } catch (error) {
      toast.error('Failed to update language setting');
      console.error('Error updating language:', error);
    } finally {
      setUpdatingLanguage(false);
    }
  };

  return (
    <AuthGuard>
      <div className="container mx-auto py-6 px-4 sm:px-6">
        <PageHeaderCard
          title="Settings"
          description="Manage your account settings and preferences"
          icon={FaCog}
        />
        
        <div className="space-y-6 p-6 relative">
          <AnimatedGridPattern 
            className="dark:fill-green-900/5 dark:stroke-green-900/20 fill-green-600/5 stroke-green-600/20 z-0" 
            numSquares={40}
            maxOpacity={0.3}
          />
          
          <div className="relative z-10">
            <div className="rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('account')}
                    className={`px-6 py-3 text-sm font-medium ${
                      activeTab === 'account'
                        ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Account
                  </button>
                  <button
                    onClick={() => setActiveTab('appearance')}
                    className={`px-6 py-3 text-sm font-medium ${
                      activeTab === 'appearance'
                        ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Appearance
                  </button>
                  <button
                    onClick={() => setActiveTab('language')}
                    className={`px-6 py-3 text-sm font-medium ${
                      activeTab === 'language'
                        ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Language
                  </button>
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`px-6 py-3 text-sm font-medium ${
                      activeTab === 'notifications'
                        ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Notifications
                  </button>
                  <button
                    onClick={() => setActiveTab('privacy')}
                    className={`px-6 py-3 text-sm font-medium ${
                      activeTab === 'privacy'
                        ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Privacy
                  </button>
                </nav>
              </div>
              
              <div className="p-6">
                {activeTab === 'account' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Account Settings</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Manage your account information and password
                    </p>
                    
                    <div className="mt-6 space-y-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          defaultValue={user?.email || ''}
                          disabled
                          className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Change Password
                        </label>
                        <button
                          className="mt-1 inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                          Change Password
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Appearance Settings</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Customize how Deeni looks for you
                    </p>
                    
                    <div className="mt-6 space-y-6">
                      <div>
                        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Theme
                        </span>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          <div 
                            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                              theme === 'light' 
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                            }`}
                            onClick={() => handleThemeChange('light')}
                          >
                            <div className="flex items-start mb-4">
                              <input
                                type="radio"
                                name="theme"
                                id="theme-light"
                                value="light"
                                checked={theme === 'light'}
                                onChange={() => handleThemeChange('light')}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 mt-1"
                              />
                              <label htmlFor="theme-light" className="ml-2 block">
                                <span className="font-medium text-gray-900 dark:text-white">Light</span>
                                <span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  Bright interface with subtle shadows
                                </span>
                              </label>
                            </div>
                            <div className="rounded-md bg-white border border-gray-200 h-20 w-full flex flex-col p-2">
                              <div className="bg-green-500 h-2 w-12 rounded-full mb-2"></div>
                              <div className="bg-gray-200 h-2 w-20 rounded-full"></div>
                              <div className="mt-auto flex justify-end">
                                <div className="bg-gray-200 h-4 w-4 rounded-full"></div>
                              </div>
                            </div>
                          </div>
                          
                          <div 
                            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                              theme === 'dark' 
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                            }`}
                            onClick={() => handleThemeChange('dark')}
                          >
                            <div className="flex items-start mb-4">
                              <input
                                type="radio"
                                name="theme"
                                id="theme-dark"
                                value="dark"
                                checked={theme === 'dark'}
                                onChange={() => handleThemeChange('dark')}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 mt-1"
                              />
                              <label htmlFor="theme-dark" className="ml-2 block">
                                <span className="font-medium text-gray-900 dark:text-white">Dark</span>
                                <span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  Dark interface optimized for night use
                                </span>
                              </label>
                            </div>
                            <div className="rounded-md bg-gray-900 border border-gray-700 h-20 w-full flex flex-col p-2">
                              <div className="bg-green-500 h-2 w-12 rounded-full mb-2"></div>
                              <div className="bg-gray-700 h-2 w-20 rounded-full"></div>
                              <div className="mt-auto flex justify-end">
                                <div className="bg-gray-700 h-4 w-4 rounded-full"></div>
                              </div>
                            </div>
                          </div>
                          
                          <div 
                            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                              theme === 'system' 
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                            }`}
                            onClick={() => handleThemeChange('system')}
                          >
                            <div className="flex items-start mb-4">
                              <input
                                type="radio"
                                name="theme"
                                id="theme-system"
                                value="system"
                                checked={theme === 'system'}
                                onChange={() => handleThemeChange('system')}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 mt-1"
                              />
                              <label htmlFor="theme-system" className="ml-2 block">
                                <span className="font-medium text-gray-900 dark:text-white">System</span>
                                <span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  Follows your device preferences
                                </span>
                              </label>
                            </div>
                            <div className="flex w-full h-20 space-x-2">
                              <div className="w-1/2 rounded-md bg-white border border-gray-200 p-2">
                                <div className="bg-green-500 h-2 w-8 rounded-full"></div>
                              </div>
                              <div className="w-1/2 rounded-md bg-gray-900 border border-gray-700 p-2">
                                <div className="bg-green-500 h-2 w-8 rounded-full"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Quick Theme Toggle
                            </span>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              Quickly switch between light and dark modes
                            </p>
                          </div>
                          <ModeToggle />
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div>
                        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Additional Display Options
                        </span>
                        <div className="flex items-start mt-2">
                          <div className="flex h-5 items-center">
                            <input
                              id="reduce_animations"
                              type="checkbox"
                              checked={reduceAnimations}
                              onChange={handleReduceAnimations}
                              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="reduce_animations" className="font-medium text-gray-700 dark:text-gray-300">
                              Reduce animations
                            </label>
                            <p className="text-gray-500 dark:text-gray-400">
                              Minimize motion for a simpler experience
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start mt-4">
                          <div className="flex h-5 items-center">
                            <input
                              id="high_contrast"
                              type="checkbox"
                              checked={highContrast}
                              onChange={handleHighContrast}
                              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="high_contrast" className="font-medium text-gray-700 dark:text-gray-300">
                              High contrast mode
                            </label>
                            <p className="text-gray-500 dark:text-gray-400">
                              Enhance visual distinction between elements
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'language' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Language Settings</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Choose the language for Quran and Hadith insights
                    </p>
                    
                    <div className="mt-6 space-y-6">
                      <div>
                        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Insight Language
                        </span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          <div 
                            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                              insightLanguage === 'english' 
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                            }`}
                            onClick={() => !languageLoading && !updatingLanguage && handleLanguageChange('english')}
                          >
                            <div className="flex items-start mb-4">
                              <input
                                type="radio"
                                name="insightLanguage"
                                id="language-english"
                                value="english"
                                checked={insightLanguage === 'english'}
                                onChange={() => handleLanguageChange('english')}
                                disabled={languageLoading || updatingLanguage}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 mt-1"
                              />
                              <label htmlFor="language-english" className="ml-2 block">
                                <span className="font-medium text-gray-900 dark:text-white">English</span>
                                <span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  Display insights in English
                                </span>
                              </label>
                            </div>
                            <div className="rounded-md p-2 bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700">
                              <p className="text-sm font-medium mb-1">Sample:</p>
                              <p className="text-xs text-gray-700 dark:text-gray-300">
                                "This verse reminds us of the importance of compassion in our daily lives."
                              </p>
                            </div>
                          </div>
                          
                          <div 
                            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                              insightLanguage === 'malay' 
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                            }`}
                            onClick={() => !languageLoading && !updatingLanguage && handleLanguageChange('malay')}
                          >
                            <div className="flex items-start mb-4">
                              <input
                                type="radio"
                                name="insightLanguage"
                                id="language-malay"
                                value="malay"
                                checked={insightLanguage === 'malay'}
                                onChange={() => handleLanguageChange('malay')}
                                disabled={languageLoading || updatingLanguage}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 mt-1"
                              />
                              <label htmlFor="language-malay" className="ml-2 block">
                                <span className="font-medium text-gray-900 dark:text-white">Bahasa Melayu</span>
                                <span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  Paparkan wawasan dalam Bahasa Melayu
                                </span>
                              </label>
                            </div>
                            <div className="rounded-md p-2 bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700">
                              <p className="text-sm font-medium mb-1">Contoh:</p>
                              <p className="text-xs text-gray-700 dark:text-gray-300">
                                "Ayat ini mengingatkan kita tentang kepentingan belas kasihan dalam kehidupan harian kita."
                              </p>
                            </div>
                          </div>
                        </div>

                        {(languageLoading || updatingLanguage) && (
                          <div className="mt-4 flex items-center text-sm text-gray-500">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {languageLoading ? 'Loading language preference...' : 'Updating language preference...'}
                          </div>
                        )}
                      </div>

                      <Separator className="my-4" />

                      <div>
                        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Language Notes
                        </span>
                        <ul className="mt-2 list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2">
                          <li>This setting affects AI-generated insights for Quran and Hadith only</li>
                          <li>It does not change the language of the application interface</li>
                          <li>Original Arabic text will always be preserved</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notification Settings</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Manage how and when you receive notifications
                    </p>
                    
                    <div className="mt-6 space-y-4">
                      <div className="flex items-start">
                        <div className="flex h-5 items-center">
                          <input
                            id="email_notifications"
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="email_notifications" className="font-medium text-gray-700 dark:text-gray-300">
                            Email Notifications
                          </label>
                          <p className="text-gray-500 dark:text-gray-400">
                            Receive email notifications about your activity and reminders
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex h-5 items-center">
                          <input
                            id="prayer_reminders"
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="prayer_reminders" className="font-medium text-gray-700 dark:text-gray-300">
                            Prayer Reminders
                          </label>
                          <p className="text-gray-500 dark:text-gray-400">
                            Receive reminders for prayer times
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Privacy Settings</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Manage your privacy and data settings
                    </p>
                    
                    <div className="mt-6 space-y-4">
                      <div className="flex items-start">
                        <div className="flex h-5 items-center">
                          <input
                            id="data_collection"
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="data_collection" className="font-medium text-gray-700 dark:text-gray-300">
                            Data Collection
                          </label>
                          <p className="text-gray-500 dark:text-gray-400">
                            Allow us to collect anonymous usage data to improve the app
                          </p>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <button
                          className="text-sm font-medium text-red-600 hover:text-red-500"
                        >
                          Delete Account
                        </button>
                        <p className="mt-1 text-xs text-gray-500">
                          This will permanently delete your account and all associated data
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <AuthDebugger pageName="settings" />
    </AuthGuard>
  );
} 