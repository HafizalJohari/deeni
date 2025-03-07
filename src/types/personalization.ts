export interface UserPreferences {
  knowledgeLevel: 'beginner' | 'intermediate' | 'advanced';
  interests: string[];
  preferredLanguage: string;
  preferredContentTypes: ('articles' | 'videos' | 'audio' | 'interactive')[];
  notificationPreferences: {
    prayerTimes: boolean;
    dailyReminders: boolean;
    weeklyReports: boolean;
    useVoiceNotifications: boolean;
  };
}

export interface MoodEntry {
  id: string;
  user_id: string;
  mood_rating: number;
  mood_description: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface MoodAnalysis {
  id: string;
  mood_entry_id: string;
  content: {
    sentiment: string;
    themes: string[];
    insights: string[];
    recommendations: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface MoodEntryDB {
  id: string;
  user_id: string;
  mood_rating: number;
  mood_description: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  analysis?: MoodAnalysis;
}

export interface GrowthPlan {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  type: 'daily' | 'weekly';
  goals: GrowthGoal[];
  progress: number;
  completed: boolean;
}

export interface GrowthGoal {
  id: string;
  title: string;
  description: string;
  category: 'prayer' | 'quran' | 'knowledge' | 'character' | 'community';
  difficulty: 'easy' | 'moderate' | 'challenging';
  completed: boolean;
  dueDate?: string;
}

export interface ContentRecommendation {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'audio' | 'interactive';
  category: string;
  url: string;
  imageUrl?: string;
  durationMinutes?: number;
  knowledgeLevel: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

export interface ProcessedMoodEntry {
  id: string;
  mood_description: string;
  created_at: string;
  analysis: {
    primaryEmotion?: string;
    spiritualDimension?: string;
    category?: string;
    intensity?: number;
    triggers?: string[];
    suggestions?: string[];
  } | null;
}

export interface PersonalizationSettings {
  id: string;
  user_id: string;
  allow_data_collection: boolean;
  daily_reflection_reminders: boolean;
  weekly_growth_updates: boolean;
  content_recommendation_alerts: boolean;
  created_at: string;
  updated_at: string;
} 