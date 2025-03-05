'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage, SupportedLanguage } from '@/contexts/LanguageContext';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [prayerReminders, setPrayerReminders] = useState(true);
  const [quranReminders, setQuranReminders] = useState(false);
  const [language, setLanguage] = useState('english');
  const { insightLanguage, setInsightLanguage, isLoading } = useLanguage();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" defaultValue="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Your email" defaultValue="john.doe@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea 
                  id="bio" 
                  className="w-full min-h-[100px] p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Tell us about yourself"
                  defaultValue="I am on a journey to deepen my spiritual connection."
                />
              </div>
              <Button className="mt-4">Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Update your password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button className="mt-4">Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>
                Customize the appearance of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Dark Mode</h3>
                  <p className="text-sm text-gray-500">
                    Enable dark mode for a more comfortable viewing experience at night
                  </p>
                </div>
                <Switch 
                  checked={darkMode} 
                  onCheckedChange={setDarkMode} 
                  aria-label="Toggle dark mode"
                />
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-3">Language</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={language === 'english' ? 'default' : 'outline'} 
                    onClick={() => setLanguage('english')}
                    className="justify-start"
                  >
                    English
                  </Button>
                  <Button 
                    variant={language === 'arabic' ? 'default' : 'outline'} 
                    onClick={() => setLanguage('arabic')}
                    className="justify-start"
                  >
                    Arabic
                  </Button>
                  <Button 
                    variant={language === 'mandarin' ? 'default' : 'outline'} 
                    onClick={() => setLanguage('mandarin')}
                    className="justify-start"
                  >
                    Mandarin
                  </Button>
                  <Button 
                    variant={language === 'malay' ? 'default' : 'outline'} 
                    onClick={() => setLanguage('malay')}
                    className="justify-start"
                  >
                    Malay
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>
                Customize how content is displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="font-size">Font Size</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">A</span>
                  <input 
                    type="range" 
                    id="font-size" 
                    min="1" 
                    max="5" 
                    defaultValue="3" 
                    className="w-full"
                  />
                  <span className="text-lg">A</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-3">Quran Script</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="justify-start"
                  >
                    Uthmani
                  </Button>
                  <Button 
                    variant="default" 
                    className="justify-start"
                  >
                    IndoPak
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Email Notifications</h3>
                  <p className="text-sm text-gray-500">
                    Receive notifications via email
                  </p>
                </div>
                <Switch 
                  checked={emailNotifications} 
                  onCheckedChange={setEmailNotifications} 
                  aria-label="Toggle email notifications"
                />
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <h3 className="text-sm font-medium">Push Notifications</h3>
                  <p className="text-sm text-gray-500">
                    Receive notifications on your device
                  </p>
                </div>
                <Switch 
                  checked={pushNotifications} 
                  onCheckedChange={setPushNotifications} 
                  aria-label="Toggle push notifications"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reminder Settings</CardTitle>
              <CardDescription>
                Customize your reminders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Prayer Time Reminders</h3>
                  <p className="text-sm text-gray-500">
                    Get notified before prayer times
                  </p>
                </div>
                <Switch 
                  checked={prayerReminders} 
                  onCheckedChange={setPrayerReminders} 
                  aria-label="Toggle prayer reminders"
                />
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <h3 className="text-sm font-medium">Quran Reading Reminders</h3>
                  <p className="text-sm text-gray-500">
                    Get daily reminders to read Quran
                  </p>
                </div>
                <Switch 
                  checked={quranReminders} 
                  onCheckedChange={setQuranReminders} 
                  aria-label="Toggle Quran reminders"
                />
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-2">Reminder Time</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prayer-reminder-time">Prayer Reminder (minutes before)</Label>
                    <select 
                      id="prayer-reminder-time" 
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      defaultValue="15"
                    >
                      <option value="5">5 minutes</option>
                      <option value="10">10 minutes</option>
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quran-reminder-time">Quran Reminder Time</Label>
                    <Input 
                      id="quran-reminder-time" 
                      type="time" 
                      defaultValue="20:00" 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Insight Language Preferences</CardTitle>
              <CardDescription>
                Choose the language for Quran and Hadith insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium mb-3">Insight Language</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Select the language in which you want AI-generated insights to be provided. This affects both Quran and Hadith insights.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant={insightLanguage === 'english' ? 'default' : 'outline'} 
                    onClick={() => setInsightLanguage('english')}
                    className="justify-start"
                    disabled={isLoading}
                  >
                    English
                  </Button>
                  <Button 
                    variant={insightLanguage === 'malay' ? 'default' : 'outline'} 
                    onClick={() => setInsightLanguage('malay')}
                    className="justify-start"
                    disabled={isLoading}
                  >
                    Malay (Bahasa Melayu)
                  </Button>
                  <Button 
                    variant={insightLanguage === 'arabic' ? 'default' : 'outline'} 
                    onClick={() => setInsightLanguage('arabic')}
                    className="justify-start"
                    disabled={isLoading}
                  >
                    Arabic (العربية)
                  </Button>
                  <Button 
                    variant={insightLanguage === 'mandarin' ? 'default' : 'outline'} 
                    onClick={() => setInsightLanguage('mandarin')}
                    className="justify-start"
                    disabled={isLoading}
                  >
                    Mandarin (中文)
                  </Button>
                </div>
                {isLoading && (
                  <div className="flex items-center justify-center py-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-green-600 border-t-transparent"></div>
                    <span className="ml-2 text-sm text-gray-500">Updating preference...</span>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-2">About Insight Languages</h3>
                <p className="text-sm text-gray-500">
                  Insights are generated using AI technology and translated into your preferred language. The quality of translation may vary by language. Your insights will be saved in the language they were generated in.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 