export interface SelfReflection {
  id: string;
  user_id: string;
  feeling: string;
  feeling_icon: string;
  reflection_text: string;
  analysis: {
    islamicPerspective: string;
    recommendations: string[];
    spiritualGuidance: string;
    relevantVerses: Array<{
      surah: number;
      ayah: number;
      text: string;
    }>;
    relevantHadith: Array<{
      collection: string;
      number: number;
      text: string;
    }>;
  };
  created_at: string;
  updated_at: string;
}

export interface SelfReflectionFormData {
  feeling: string;
  feeling_icon: string;
  reflection_text: string;
}

export interface FeelingOption {
  id: string;
  label: string;
  icon: string;
  description: string;
  category: 'positive' | 'negative' | 'neutral' | 'spiritual';
} 