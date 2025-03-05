
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
  userId: string;
  date: string;
  mood: 'excellent' | 'good' | 'neutral' | 'struggling' | 'difficult';
  notes?: string;
  practices: {
    practiceName: string;
    completed: boolean;
  }[];
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