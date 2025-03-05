export interface GrowthGoal {
  id: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  suggested_actions: string[];
  target_date?: string;
}

export interface MoodPattern {
  category: string;
  frequency: number;
  insights: string[];
  insightImage?: string; // URL of the generated image
}

export interface InsightImage {
  url: string;
  alt: string;
  category: string;
}

export interface GrowthPlan {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  goals: GrowthGoal[];
  mood_patterns: MoodPattern[];
  recommendations: string[];
  focus_areas: string[];
  insightImages?: InsightImage[];
}

export type GoalCategory = 'Prayer' | 'Quran' | 'Dhikr' | 'Fasting' | 'Community' | 'Knowledge';
export type GoalStatus = 'not_started' | 'in_progress' | 'completed';

export interface UpdateGoalProgressPayload {
  goal_id: string;
  progress: number;
}

export interface APIResponse<T> {
  data?: T;
  error?: {
    message: string;
    details?: string;
    hint?: string;
  };
} 