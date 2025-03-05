"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import MoodTracker from "../../components/personalization/MoodTracker";
import GrowthPlan from "../../components/personalization/GrowthPlan";
import ContentRecommendations from "../../components/personalization/ContentRecommendations";

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Personalization</h1>
        <p className="text-gray-600">
          Track your spiritual wellbeing, get personalized growth plans, and discover content tailored to your needs
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('mood')}
            className={`${
              activeTab === 'mood'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Mood Tracker
          </button>
          <button
            onClick={() => handleTabChange('growth')}
            className={`${
              activeTab === 'growth'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Growth Plan
          </button>
          <button
            onClick={() => handleTabChange('content')}
            className={`${
              activeTab === 'content'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Content Recommendations
          </button>
          <button
            onClick={() => handleTabChange('settings')}
            className={`${
              activeTab === 'settings'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
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
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Personalization Settings</h2>
              <p className="text-gray-600 mb-6">
                Customize your personalization experience and manage your data
              </p>
              
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Data Privacy</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Control how your data is used for personalization
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">Allow data collection for personalization</span>
                      <p className="text-xs text-gray-500">
                        We use this data to provide better recommendations
                      </p>
                    </div>
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                      <span className="absolute h-4 w-4 rounded-full bg-white translate-x-6"></span>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Notification Preferences</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Manage how and when you receive personalization updates
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Daily reflection reminders</span>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-500">
                        <span className="absolute h-4 w-4 rounded-full bg-white translate-x-6"></span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Weekly growth plan updates</span>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-500">
                        <span className="absolute h-4 w-4 rounded-full bg-white translate-x-6"></span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Content recommendation alerts</span>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                        <span className="absolute h-4 w-4 rounded-full bg-white translate-x-1"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 