'use client';

import { useState, useEffect } from 'react';
import { usePersonalizationStore } from '../../lib/store/personalization-store';
import { getPersonalizationSettings, updatePersonalizationSettings } from '../../services/personalization-settings';
import { PersonalizationSettings } from '../../types/personalization';
import { useToast } from '../../components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const defaultSettings: Partial<PersonalizationSettings> = {
  allow_data_collection: true,
  daily_reflection_reminders: true,
  weekly_growth_updates: true,
  content_recommendation_alerts: true
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function NotificationSettings() {
  const { personalizationSettings, setPersonalizationSettings, updatePersonalizationSettings: updateStoreSettings } = usePersonalizationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  // Load settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const settings = await getPersonalizationSettings();
        if (settings) {
          setPersonalizationSettings(settings);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast({
          id: 'error-toast',
          title: 'Error',
          description: 'Failed to load notification settings', 
          variant: 'destructive',
          visible: true
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!personalizationSettings) {
      fetchSettings();
    }
  }, [personalizationSettings, setPersonalizationSettings, toast]);
  
  // Save settings to the database
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      if (!personalizationSettings) {
        // If we don't have settings, create with defaults
        const settings = await updatePersonalizationSettings(defaultSettings);
        if (settings) {
          setPersonalizationSettings(settings);
          toast({
            id: 'success-toast',
            title: 'Success', 
            description: 'Notification settings saved successfully',
            visible: true
          });
        }
      } else {
        // Update existing settings
        const updatedSettings = {
          allow_data_collection: personalizationSettings.allow_data_collection,
          daily_reflection_reminders: personalizationSettings.daily_reflection_reminders,
          weekly_growth_updates: personalizationSettings.weekly_growth_updates,
          content_recommendation_alerts: personalizationSettings.content_recommendation_alerts
        };
        
        const settings = await updatePersonalizationSettings(updatedSettings);
        if (settings) {
          setPersonalizationSettings(settings);
          toast({
            id: 'success-toast', 
            title: 'Success',
            description: 'Notification settings updated successfully',
            visible: true
          });
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notification settings',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle toggle changes
  const handleToggle = (field: keyof Omit<PersonalizationSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!personalizationSettings) {
      // Create new settings object with defaults if none exists
      const newSettings: PersonalizationSettings = {
        id: '',
        user_id: '',
        allow_data_collection: defaultSettings.allow_data_collection || true,
        daily_reflection_reminders: defaultSettings.daily_reflection_reminders || true,
        weekly_growth_updates: defaultSettings.weekly_growth_updates || true,
        content_recommendation_alerts: defaultSettings.content_recommendation_alerts || true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Toggle the specific field
      newSettings[field] = !newSettings[field];
      setPersonalizationSettings(newSettings);
    } else {
      // Toggle the field in the existing settings
      updateStoreSettings({
        [field]: !personalizationSettings[field]
      });
    }
  };
  
  // The settings we're working with (either from the store or defaults)
  const currentSettings = personalizationSettings || defaultSettings as PersonalizationSettings;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={stagger}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <motion.div 
        variants={fadeInUp}
        className="bg-white dark:bg-zinc-800/40 shadow rounded-lg p-6 backdrop-blur-sm"
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Personalization Settings</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Customize your personalization experience and manage your data
        </p>
        
        <div className="space-y-6">
          <motion.div 
            variants={fadeInUp}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <h3 className="font-medium mb-2 text-gray-900 dark:text-white">Data Privacy</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Control how your data is used for personalization
            </p>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Allow data collection for personalization</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  We use this data to provide better recommendations
                </p>
              </div>
              <Switch
                checked={currentSettings.allow_data_collection}
                onCheckedChange={() => handleToggle('allow_data_collection')}
                disabled={isLoading}
              />
            </div>
          </motion.div>
          
          <motion.div 
            variants={fadeInUp}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <h3 className="font-medium mb-2 text-gray-900 dark:text-white">Notification Preferences</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Manage how and when you receive personalization updates
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Daily reflection reminders</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Get daily reminders to reflect on your spiritual journey
                  </p>
                </div>
                <Switch
                  checked={currentSettings.daily_reflection_reminders}
                  onCheckedChange={() => handleToggle('daily_reflection_reminders')}
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Weekly growth plan updates</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Receive weekly updates about your growth plan progress
                  </p>
                </div>
                <Switch
                  checked={currentSettings.weekly_growth_updates}
                  onCheckedChange={() => handleToggle('weekly_growth_updates')}
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Content recommendation alerts</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Get notified about new personalized content recommendations
                  </p>
                </div>
                <Switch
                  checked={currentSettings.content_recommendation_alerts}
                  onCheckedChange={() => handleToggle('content_recommendation_alerts')}
                  disabled={isLoading}
                />
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          variants={fadeInUp}
          className="mt-6 flex justify-end"
        >
          <Button
            onClick={handleSaveSettings}
            disabled={isLoading || isSaving}
            className="bg-emerald-600/90 hover:bg-emerald-600 text-white transition-all"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
} 