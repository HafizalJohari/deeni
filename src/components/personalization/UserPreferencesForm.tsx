import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPreferences } from '../../types/personalization';
import { usePersonalizationStore } from '../../lib/store/personalization-store';

const preferencesSchema = z.object({
  knowledgeLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  interests: z.array(z.string()).min(1, 'Please select at least one interest'),
  preferredLanguage: z.string().min(1, 'Please select a language'),
  preferredContentTypes: z.array(z.enum(['articles', 'videos', 'audio', 'interactive'])).min(1, 'Please select at least one content type'),
  notificationPreferences: z.object({
    prayerTimes: z.boolean(),
    dailyReminders: z.boolean(),
    weeklyReports: z.boolean(),
    useVoiceNotifications: z.boolean(),
  }),
});

const interestOptions = [
  'Quran Study',
  'Hadith',
  'Islamic History',
  'Prayer',
  'Fasting',
  'Zakat',
  'Hajj',
  'Islamic Ethics',
  'Family in Islam',
  'Spirituality',
  'Contemporary Issues',
  'Islamic Art',
  'Islamic Architecture',
  'Personal Development',
  'Community Service',
];

const languageOptions = [
  'English',
  'Arabic',
  'Mandarin',
  'Turkish',
  'Malay',
  'Indonesian',
  'French',
  'German',
  'Spanish',
];

const contentTypeOptions = [
  { value: 'articles', label: 'Articles' },
  { value: 'videos', label: 'Videos' },
  { value: 'audio', label: 'Audio Lectures' },
  { value: 'interactive', label: 'Interactive Activities' },
];

export default function UserPreferencesForm() {
  const { userPreferences, setUserPreferences } = usePersonalizationStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: UserPreferences = userPreferences || {
    knowledgeLevel: 'beginner',
    interests: ['Quran Study', 'Prayer'],
    preferredLanguage: 'English',
    preferredContentTypes: ['articles', 'videos'],
    notificationPreferences: {
      prayerTimes: true,
      dailyReminders: true,
      weeklyReports: true,
      useVoiceNotifications: false,
    },
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<UserPreferences>({
    resolver: zodResolver(preferencesSchema),
    defaultValues,
  });

  const watchedInterests = watch('interests', defaultValues.interests);
  const watchedContentTypes = watch('preferredContentTypes', defaultValues.preferredContentTypes);

  const handleInterestToggle = (interest: string) => {
    const currentInterests = watchedInterests;
    if (currentInterests.includes(interest)) {
      setValue('interests', currentInterests.filter((i) => i !== interest));
    } else {
      setValue('interests', [...currentInterests, interest]);
    }
  };

  const handleContentTypeToggle = (contentType: string) => {
    const currentTypes = watchedContentTypes;
    if (currentTypes.includes(contentType as any)) {
      setValue(
        'preferredContentTypes',
        currentTypes.filter((t) => t !== contentType)
      );
    } else {
      setValue('preferredContentTypes', [...currentTypes, contentType as any]);
    }
  };

  const onSubmit = async (data: UserPreferences) => {
    setIsSubmitting(true);
    try {
      setUserPreferences(data);
      // Here you would typically save to database as well
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Personalize Your Experience</h2>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          {/* Knowledge Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Knowledge Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['beginner', 'intermediate', 'advanced'].map((level) => (
                <div key={level}>
                  <input
                    type="radio"
                    id={`level-${level}`}
                    value={level}
                    className="sr-only peer"
                    {...register('knowledgeLevel')}
                  />
                  <label
                    htmlFor={`level-${level}`}
                    className="flex items-center justify-center p-3 border rounded-md cursor-pointer transition-colors peer-checked:bg-emerald-50 peer-checked:border-emerald-500 hover:bg-gray-50"
                  >
                    <span className="capitalize">{level}</span>
                  </label>
                </div>
              ))}
            </div>
            {errors.knowledgeLevel && (
              <p className="mt-1 text-sm text-red-600">{errors.knowledgeLevel.message}</p>
            )}
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Interests (Select at least one)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {interestOptions.map((interest) => (
                <div key={interest} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`interest-${interest}`}
                    value={interest}
                    checked={watchedInterests.includes(interest)}
                    onChange={() => handleInterestToggle(interest)}
                    className="h-4 w-4 text-emerald-600 rounded border-gray-300"
                  />
                  <label htmlFor={`interest-${interest}`} className="ml-2 text-sm text-gray-700">
                    {interest}
                  </label>
                </div>
              ))}
            </div>
            {errors.interests && (
              <p className="mt-1 text-sm text-red-600">{errors.interests.message as string}</p>
            )}
          </div>

          {/* Preferred Language */}
          <div>
            <label htmlFor="preferredLanguage" className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Language
            </label>
            <select
              id="preferredLanguage"
              {...register('preferredLanguage')}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
            >
              {languageOptions.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
            {errors.preferredLanguage && (
              <p className="mt-1 text-sm text-red-600">{errors.preferredLanguage.message}</p>
            )}
          </div>

          {/* Content Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Content Types
            </label>
            <div className="grid grid-cols-2 gap-3">
              {contentTypeOptions.map((option) => (
                <div key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`content-${option.value}`}
                    value={option.value}
                    checked={watchedContentTypes.includes(option.value as any)}
                    onChange={() => handleContentTypeToggle(option.value)}
                    className="h-4 w-4 text-emerald-600 rounded border-gray-300"
                  />
                  <label htmlFor={`content-${option.value}`} className="ml-2 text-sm text-gray-700">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
            {errors.preferredContentTypes && (
              <p className="mt-1 text-sm text-red-600">
                {errors.preferredContentTypes.message as string}
              </p>
            )}
          </div>

          {/* Notification Preferences */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">Notification Preferences</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  id="prayerTimes"
                  type="checkbox"
                  {...register('notificationPreferences.prayerTimes')}
                  className="h-4 w-4 text-emerald-600 rounded border-gray-300"
                />
                <label htmlFor="prayerTimes" className="ml-2 text-sm text-gray-700">
                  Prayer Time Reminders
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="dailyReminders"
                  type="checkbox"
                  {...register('notificationPreferences.dailyReminders')}
                  className="h-4 w-4 text-emerald-600 rounded border-gray-300"
                />
                <label htmlFor="dailyReminders" className="ml-2 text-sm text-gray-700">
                  Daily Inspiration and Reminders
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="weeklyReports"
                  type="checkbox"
                  {...register('notificationPreferences.weeklyReports')}
                  className="h-4 w-4 text-emerald-600 rounded border-gray-300"
                />
                <label htmlFor="weeklyReports" className="ml-2 text-sm text-gray-700">
                  Weekly Progress Reports
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="useVoiceNotifications"
                  type="checkbox"
                  {...register('notificationPreferences.useVoiceNotifications')}
                  className="h-4 w-4 text-emerald-600 rounded border-gray-300"
                />
                <label htmlFor="useVoiceNotifications" className="ml-2 text-sm text-gray-700">
                  Enable Voice Notifications
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 