'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { FaMoon, FaSun, FaLanguage } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { insightLanguage, setInsightLanguage } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">Manage your app preferences and configurations</p>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {/* Appearance Section */}
        <div className="py-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Appearance</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                  {theme === 'dark' ? (
                    <FaMoon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <FaSun className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Switch between light and dark themes
                  </p>
                </div>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                aria-label="Toggle dark mode"
              />
            </div>
          </div>
        </div>

        {/* Language Section */}
        <div className="py-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Language</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                  <FaLanguage className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Insight Language</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choose language for AI-generated insights
                  </p>
                </div>
              </div>
              <Switch
                checked={insightLanguage === 'ar'}
                onCheckedChange={(checked) => setInsightLanguage(checked ? 'ar' : 'en')}
                aria-label="Toggle insight language"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 