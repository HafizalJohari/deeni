import { OpenAI } from 'openai';
import { GrowthPlan, UserPreferences, ContentRecommendation } from '../../types/personalization';

// Helper function for generating UUIDs
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Create a mock OpenAI client for client-side rendering
// In a real application, you would use an API route to handle OpenAI calls
const createMockOpenAI = () => {
  return {
    chat: {
      completions: {
        create: async () => {
          return {
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    goals: [
                      {
                        title: 'Complete 5 Daily Prayers',
                        description: 'Ensure you perform all five daily prayers on time.',
                        category: 'prayer',
                        difficulty: 'moderate'
                      },
                      {
                        title: 'Read Quran for 15 minutes',
                        description: 'Dedicate at least 15 minutes to reading and reflecting on the Quran.',
                        category: 'quran',
                        difficulty: 'easy'
                      },
                      {
                        title: 'Learn a new hadith',
                        description: 'Study and memorize one new hadith from the collection of authentic hadiths.',
                        category: 'knowledge',
                        difficulty: 'easy'
                      }
                    ]
                  })
                }
              }
            ]
          };
        }
      }
    }
  };
};

// Create a mock recommendations generator
const createMockRecommendations = () => {
  return [
    {
      id: generateUUID(),
      title: 'Understanding the Basics of Tawheed',
      description: 'An introductory article on the concept of Oneness of Allah in Islam.',
      type: 'article' as 'article',
      category: 'Islamic Beliefs',
      url: 'https://example.com/tawheed-basics',
      imageUrl: 'https://example.com/images/tawheed.jpg',
      durationMinutes: 10,
      knowledgeLevel: 'beginner' as 'beginner',
      tags: ['tawheed', 'beliefs', 'fundamentals']
    },
    {
      id: generateUUID(),
      title: 'The Life of Prophet Muhammad (PBUH)',
      description: 'A comprehensive video series about the life and teachings of Prophet Muhammad.',
      type: 'video' as 'video',
      category: 'Seerah',
      url: 'https://example.com/prophet-life',
      imageUrl: 'https://example.com/images/prophet.jpg',
      durationMinutes: 45,
      knowledgeLevel: 'beginner' as 'beginner',
      tags: ['prophet', 'seerah', 'history']
    },
    {
      id: generateUUID(),
      title: 'Understanding Surah Al-Fatiha',
      description: 'An in-depth analysis of the opening chapter of the Quran.',
      type: 'audio' as 'audio',
      category: 'Quran Study',
      url: 'https://example.com/fatiha-tafsir',
      imageUrl: 'https://example.com/images/quran.jpg',
      durationMinutes: 30,
      knowledgeLevel: 'intermediate' as 'intermediate',
      tags: ['quran', 'tafsir', 'fatiha']
    }
  ] as ContentRecommendation[];
};

// Create a mock analysis result
const createMockAnalysis = () => {
  return {
    positivePatterns: [
      'Regular prayer correlates with more positive moods',
      'Quran reading appears to have a calming effect',
      'Community service activities boost your spiritual well-being'
    ],
    challengingPatterns: [
      'You seem to struggle with consistency in early morning prayers',
      'Fasting days are sometimes challenging for your mood'
    ],
    recommendations: [
      'Try to establish a regular Quran reading routine in the evening',
      'Consider joining group activities for additional motivation',
      'Set realistic goals for voluntary worship to avoid feeling overwhelmed'
    ]
  };
};

// Use a mock OpenAI client for client-side rendering
const openai = typeof window !== 'undefined' ? createMockOpenAI() : new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateGrowthPlan = async (
  userId: string,
  preferences: UserPreferences,
  planType: 'daily' | 'weekly'
): Promise<GrowthPlan> => {
  try {
    // Use the API route if we're in the browser
    if (typeof window !== 'undefined') {
      const response = await fetch('/api/personalization/growth-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          preferences,
          planType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate growth plan');
      }

      const data = await response.json();
      return data.growthPlan;
    }

    // Fallback to mock data if API call fails or we're in SSR
    const currentDate = new Date();
    const endDate = new Date(currentDate);
    
    if (planType === 'daily') {
      endDate.setDate(endDate.getDate() + 1);
    } else {
      endDate.setDate(endDate.getDate() + 7);
    }
    
    // In a real application, this would be an API call to a server-side endpoint
    // that handles the OpenAI API call
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an AI assistant specializing in Islamic spiritual growth guidance.' },
        { role: 'user', content: `Generate a personalized Islamic ${planType} growth plan` }
      ],
      response_format: { type: 'json_object' },
    });

    const completion = response.choices[0].message.content;
    if (!completion) {
      throw new Error('Failed to generate growth plan');
    }

    const aiResponse = JSON.parse(completion);
    
    return {
      id: generateUUID(),
      userId,
      startDate: currentDate.toISOString(),
      endDate: endDate.toISOString(),
      type: planType,
      goals: aiResponse.goals.map((goal: any) => ({
        id: generateUUID(),
        title: goal.title,
        description: goal.description,
        category: goal.category,
        difficulty: goal.difficulty,
        completed: false,
      })),
      progress: 0,
      completed: false,
    };
  } catch (error) {
    console.error('Error generating growth plan:', error);
    throw error;
  }
};

export const getPersonalizedContentRecommendations = async (
  preferences: UserPreferences,
  count: number = 5
): Promise<ContentRecommendation[]> => {
  try {
    // Use the API route if we're in the browser
    if (typeof window !== 'undefined') {
      try {
        const response = await fetch('/api/personalization/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            preferences,
            count,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get recommendations');
        }

        const data = await response.json();
        return data.recommendations;
      } catch (error) {
        console.error('Error fetching recommendations from API:', error);
        // Fallback to mock data if API call fails
        return createMockRecommendations();
      }
    }

    // Fallback to mock data if we're in SSR
    return createMockRecommendations();
  } catch (error) {
    console.error('Error generating content recommendations:', error);
    throw error;
  }
};

export const analyzeSpiritudaHabitPatterns = async (
  userId: string,
  moodEntries: any[],
  practices: any[]
): Promise<any> => {
  try {
    // Use the API route if we're in the browser
    if (typeof window !== 'undefined') {
      try {
        const response = await fetch('/api/personalization/mood-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            moodEntries,
            practices,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to analyze patterns');
        }

        const data = await response.json();
        return data.analysis;
      } catch (error) {
        console.error('Error fetching analysis from API:', error);
        // Fallback to mock data if API call fails
        return createMockAnalysis();
      }
    }

    // Fallback to mock data if we're in SSR
    return createMockAnalysis();
  } catch (error) {
    console.error('Error analyzing patterns:', error);
    throw error;
  }
}; 