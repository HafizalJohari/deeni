import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  UserPreferences, 
  GrowthPlan, 
  MoodEntry, 
  ContentRecommendation,
  PersonalizationSettings 
} from '../../types/personalization';

interface PersonalizationState {
  userPreferences: UserPreferences | null;
  currentGrowthPlan: GrowthPlan | null;
  moodEntries: MoodEntry[];
  contentRecommendations: ContentRecommendation[];
  personalizationSettings: PersonalizationSettings | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUserPreferences: (preferences: UserPreferences) => void;
  setCurrentGrowthPlan: (plan: GrowthPlan) => void;
  addMoodEntry: (entry: MoodEntry) => void;
  updateMoodEntry: (id: string, updates: Partial<MoodEntry>) => void;
  deleteMoodEntry: (id: string) => void;
  setContentRecommendations: (recommendations: ContentRecommendation[]) => void;
  updateGrowthGoalStatus: (goalId: string, completed: boolean) => void;
  setPersonalizationSettings: (settings: PersonalizationSettings) => void;
  updatePersonalizationSettings: (updates: Partial<PersonalizationSettings>) => void;
  clearError: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const usePersonalizationStore = create<PersonalizationState>()(
  persist(
    (set) => ({
      userPreferences: null,
      currentGrowthPlan: null,
      moodEntries: [],
      contentRecommendations: [],
      personalizationSettings: null,
      isLoading: false,
      error: null,
      
      setUserPreferences: (preferences) => set({ userPreferences: preferences }),
      
      setCurrentGrowthPlan: (plan) => set({ currentGrowthPlan: plan }),
      
      addMoodEntry: (entry) => set((state) => ({ 
        moodEntries: [...state.moodEntries, entry] 
      })),
      
      updateMoodEntry: (id, updates) => set((state) => ({
        moodEntries: state.moodEntries.map((entry) => 
          entry.id === id ? { ...entry, ...updates } : entry
        )
      })),
      
      deleteMoodEntry: (id) => set((state) => ({
        moodEntries: state.moodEntries.filter((entry) => entry.id !== id)
      })),
      
      setContentRecommendations: (recommendations) => set({ 
        contentRecommendations: recommendations 
      }),
      
      setPersonalizationSettings: (settings) => set({
        personalizationSettings: settings
      }),
      
      updatePersonalizationSettings: (updates) => set((state) => ({
        personalizationSettings: state.personalizationSettings 
          ? { ...state.personalizationSettings, ...updates }
          : null
      })),
      
      updateGrowthGoalStatus: (goalId, completed) => set((state) => {
        if (!state.currentGrowthPlan) return state;
        
        const updatedGoals = state.currentGrowthPlan.goals.map((goal) =>
          goal.id === goalId ? { ...goal, completed } : goal
        );
        
        const progress = (updatedGoals.filter(goal => goal.completed).length / updatedGoals.length) * 100;
        const allCompleted = updatedGoals.every(goal => goal.completed);
        
        return {
          currentGrowthPlan: {
            ...state.currentGrowthPlan,
            goals: updatedGoals,
            progress,
            completed: allCompleted
          }
        };
      }),
      
      clearError: () => set({ error: null }),
      
      setLoading: (isLoading) => set({ isLoading })
    }),
    {
      name: 'personalization-storage',
      partialize: (state) => ({
        userPreferences: state.userPreferences,
        moodEntries: state.moodEntries,
        personalizationSettings: state.personalizationSettings,
      }),
      storage: createJSONStorage(() => {
        // Check if window is defined (browser) or not (SSR)
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // Return a mock storage for SSR
        return {
          getItem: () => null,
          setItem: () => null,
          removeItem: () => null,
        };
      }),
    }
  )
); 