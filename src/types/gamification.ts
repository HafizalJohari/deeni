export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  category: 'prayer' | 'quran' | 'learning' | 'social' | 'challenge';
  unlockedAt?: Date;
};

export type Challenge = {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  startDate: Date;
  endDate: Date;
  type: 'daily' | 'weekly' | 'monthly';
  requirements: ChallengeRequirement[];
  progress: number;
  completed: boolean;
};

export type ChallengeRequirement = {
  type: 'prayer_count' | 'quran_reading' | 'dhikr_count' | 'quiz_completion';
  target: number;
  current: number;
};

export type Streak = {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: Date;
  freezesAvailable: number;
  freezesUsed: number;
};

export type HabitTree = {
  userId: string;
  treeLevel: number;
  totalPoints: number;
  habits: HabitNode[];
};

export type HabitNode = {
  id: string;
  title: string;
  description: string;
  progress: number;
  children: string[]; // IDs of child habits
  completed: boolean;
  unlockedAt?: Date;
};

export type Quiz = {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
  points: number;
  timeLimit?: number;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export type UserProgress = {
  userId: string;
  totalPoints: number;
  level: number;
  achievements: Achievement[];
  completedChallenges: string[];
  quizScores: Record<string, number>;
  habitTree: HabitTree;
  streak: Streak;
}; 