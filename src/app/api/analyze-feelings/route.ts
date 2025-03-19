import { NextRequest, NextResponse } from 'next/server';
import { XAI } from '@/lib/xai';
import { FeelingOption } from '@/types/self-reflections';

// Initialize XAI client
const xai = new XAI({
  apiKey: process.env.XAI_API_KEY,
});

const feelingCategories = {
  positive: ['grateful', 'happy', 'peaceful', 'hopeful', 'motivated', 'content'],
  negative: ['anxious', 'sad', 'frustrated', 'overwhelmed', 'angry', 'guilty'],
  neutral: ['confused', 'uncertain', 'reflective', 'nostalgic', 'curious'],
  spiritual: ['faithful', 'blessed', 'repentant', 'guided', 'tested']
};

const feelingDescriptions = {
  grateful: 'Feeling thankful for Allah\'s blessings',
  happy: 'Experiencing joy and satisfaction',
  peaceful: 'Feeling calm and at ease',
  hopeful: 'Looking forward with optimism',
  motivated: 'Feeling driven and energetic',
  content: 'Feeling satisfied and at peace',
  anxious: 'Feeling worried or uneasy',
  sad: 'Experiencing grief or sorrow',
  frustrated: 'Feeling annoyed or discouraged',
  overwhelmed: 'Feeling burdened or stressed',
  angry: 'Experiencing strong displeasure',
  guilty: 'Feeling remorseful or regretful',
  confused: 'Feeling uncertain or unclear',
  uncertain: 'Having doubts or questions',
  reflective: 'Being thoughtful and contemplative',
  nostalgic: 'Remembering past experiences',
  curious: 'Wanting to learn or understand more',
  faithful: 'Strong in faith and trust in Allah',
  blessed: 'Feeling Allah\'s favor and mercy',
  repentant: 'Seeking forgiveness and turning back to Allah',
  guided: 'Feeling Allah\'s guidance and direction',
  tested: 'Experiencing trials and challenges'
};

const feelingIcons = {
  grateful: '🤲',
  happy: '😊',
  peaceful: '😌',
  hopeful: '🌟',
  motivated: '💪',
  content: '😊',
  anxious: '😰',
  sad: '😢',
  frustrated: '😤',
  overwhelmed: '😫',
  angry: '😠',
  guilty: '😔',
  confused: '😕',
  uncertain: '🤔',
  reflective: '🤔',
  nostalgic: '💭',
  curious: '🧐',
  faithful: '🕌',
  blessed: '☪️',
  repentant: '🤲',
  guided: '⭐',
  tested: '🔄'
};

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ 
        error: 'Invalid input',
        details: 'Text is required and must be a string'
      }, { status: 400 });
    }

    console.log('Analyzing text:', text.substring(0, 50) + '...');

    try {
      const response = await xai.analyze({
        text,
        context: {
          type: 'feeling-analysis',
          options: Object.values(feelingCategories).flat(),
          perspective: 'islamic'
        }
      });

      const suggestedFeeling = response.feeling?.toLowerCase().trim();
      console.log('Suggested feeling:', suggestedFeeling);

      if (!suggestedFeeling || !Object.values(feelingCategories).flat().includes(suggestedFeeling)) {
        console.error('Invalid feeling suggestion:', suggestedFeeling);
        return NextResponse.json({ 
          error: 'Invalid feeling suggestion',
          details: 'The analysis did not return a valid feeling'
        }, { status: 500 });
      }

      // Find the category of the feeling
      const category = Object.entries(feelingCategories).find(([_, feelings]) =>
        feelings.includes(suggestedFeeling)
      )?.[0] as 'positive' | 'negative' | 'neutral' | 'spiritual';

      const feelingOption: FeelingOption = {
        id: suggestedFeeling,
        label: suggestedFeeling,
        description: feelingDescriptions[suggestedFeeling as keyof typeof feelingDescriptions],
        icon: feelingIcons[suggestedFeeling as keyof typeof feelingIcons],
        category
      };

      return NextResponse.json({ suggestedFeeling: feelingOption });
    } catch (xaiError) {
      console.error('XAI API error:', xaiError);
      return NextResponse.json({ 
        error: 'Analysis service error',
        details: 'Failed to analyze the text using the XAI service'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error analyzing feelings:', error);
    return NextResponse.json({ 
      error: 'Server error',
      details: 'An unexpected error occurred while processing your request'
    }, { status: 500 });
  }
} 