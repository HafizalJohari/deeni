"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import MoodTracker from "../../components/personalization/MoodTracker";
import GrowthPlan from "../../components/personalization/GrowthPlan";
import ContentRecommendations from "../../components/personalization/ContentRecommendations";
import NotificationSettings from "../../components/personalization/NotificationSettings";

export default function StandalonePersonalizationPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('mood');
  
  // Update active tab based on URL parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['mood', 'growth', 'content', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Update URL without refreshing the page
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    window.history.pushState({}, '', url);
  };

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Personalization</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your spiritual wellbeing, get personalized growth plans, and discover content tailored to your needs
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('mood')}
            className={`${
              activeTab === 'mood'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Mood Tracker
          </button>
          <button
            onClick={() => handleTabChange('growth')}
            className={`${
              activeTab === 'growth'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Growth Plan
          </button>
          <button
            onClick={() => handleTabChange('content')}
            className={`${
              activeTab === 'content'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Content Recommendations
          </button>
          <button
            onClick={() => handleTabChange('settings')}
            className={`${
              activeTab === 'settings'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Settings
          </button>
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'mood' && <MoodTracker />}
        {activeTab === 'growth' && <GrowthPlan />}
        {activeTab === 'content' && <ContentRecommendations />}
        {activeTab === 'settings' && <NotificationSettings />}
      </div>
    </div>
  );
} 