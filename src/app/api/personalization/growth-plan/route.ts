import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GrowthPlan, GrowthGoal, UpdateGoalProgressPayload } from '@/types/growth-plan';
import { generateInsightImage } from '@/services/image-generation';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const validateGrowthPlanData = (data: any): data is GrowthPlan => {
  if (!data || typeof data !== 'object') return false;
  if (!Array.isArray(data.focus_areas)) return false;
  if (!Array.isArray(data.goals)) return false;
  if (!Array.isArray(data.mood_patterns)) return false;
  if (!Array.isArray(data.recommendations)) return false;
  
  // Validate goals structure
  return data.goals.every((goal: any) => (
    goal.title &&
    goal.description &&
    goal.category &&
    typeof goal.progress === 'number' &&
    Array.isArray(goal.suggested_actions)
  ));
};

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value ?? '';
          },
          set(name: string, value: string, options: any) {
            // Cookie setting will be handled by NextResponse
          },
          remove(name: string, options: any) {
            // Cookie removal will be handled by NextResponse
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        details: 'Please log in to access your growth plan'
      }, { status: 401 });
    }

    // Fetch user's mood entries
    const { data: moodEntries, error: moodError } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (moodError) {
      console.error('Error fetching mood entries:', moodError);
      return NextResponse.json({ 
        error: 'Failed to fetch mood entries',
        details: moodError.message
      }, { status: 500 });
    }

    if (!moodEntries || moodEntries.length === 0) {
      return NextResponse.json({ 
        error: 'No mood entries found',
        details: 'Please add some mood entries before generating a growth plan'
      }, { status: 404 });
    }

    try {
      // Analyze mood patterns using OpenAI
      const analysis = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert in Islamic spiritual development and emotional analysis. Analyze the following mood entries and create a comprehensive growth plan."
          },
          {
            role: "user",
            content: `Based on these mood entries: ${JSON.stringify(moodEntries)}, create a growth plan that includes:
            1. Focus areas for spiritual development
            2. Specific goals with suggested actions
            3. Analysis of mood patterns and their spiritual significance
            4. Personalized recommendations
            
            Return a JSON object with this structure:
            {
              "focus_areas": ["area1", "area2", ...],
              "goals": [
                {
                  "id": "unique_string",
                  "title": "goal title",
                  "description": "detailed description",
                  "category": "Prayer|Quran|Dhikr|Fasting|Community|Knowledge",
                  "progress": 0,
                  "status": "not_started",
                  "suggested_actions": ["action1", "action2", ...],
                  "target_date": "ISO date string"
                }
              ],
              "mood_patterns": [
                {
                  "category": "pattern category",
                  "frequency": "percentage number",
                  "insights": ["insight1", "insight2", ...]
                }
              ],
              "recommendations": ["recommendation1", "recommendation2", ...]
            }`
          }
        ]
      });

      const content = analysis.choices[0].message.content;
      if (!content) {
        throw new Error('OpenAI response content is null');
      }

      const planData = JSON.parse(content);
      if (!validateGrowthPlanData(planData)) {
        throw new Error('Invalid growth plan data structure');
      }

      // Generate images for insights
      const insightImages = [];
      for (const pattern of planData.mood_patterns) {
        if (pattern.category === 'Quran' || pattern.category === 'Hadith') {
          for (const insight of pattern.insights) {
            const image = await generateInsightImage(insight, pattern.category);
            if (image) {
              insightImages.push(image);
            }
          }
        }
      }

      const growthPlan: GrowthPlan = {
        id: crypto.randomUUID(),
        user_id: session.user.id,
        focus_areas: planData.focus_areas,
        goals: planData.goals.map((goal: any) => ({
          id: goal.id || crypto.randomUUID(),
          title: goal.title,
          description: goal.description,
          category: goal.category,
          progress: 0,
          status: 'not_started',
          suggested_actions: goal.suggested_actions,
          target_date: goal.target_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })),
        mood_patterns: planData.mood_patterns,
        recommendations: planData.recommendations,
        insightImages,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Store the growth plan in Supabase
      const { data: insertedPlan, error: insertError } = await supabase
        .from('growth_plans')
        .upsert([growthPlan])
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to save growth plan: ${insertError.message}`);
      }

      if (!insertedPlan) {
        throw new Error('No data was returned from the insert operation');
      }

      const response = NextResponse.json({ growthPlan: insertedPlan });
      
      if (session) {
        response.cookies.set('session', session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 1 week
        });
      }

      return response;
    } catch (error) {
      console.error('Error generating growth plan:', error);
      return NextResponse.json({ 
        error: 'Failed to generate growth plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value ?? '';
          },
          set(name: string, value: string, options: any) {
            // Cookie setting will be handled by NextResponse
          },
          remove(name: string, options: any) {
            // Cookie removal will be handled by NextResponse
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        details: 'Please log in to update your growth plan'
      }, { status: 401 });
    }

    const body = await request.json();
    const { goal_id, progress } = body as UpdateGoalProgressPayload;

    if (!goal_id || typeof progress !== 'number' || progress < 0 || progress > 100) {
      return NextResponse.json({ 
        error: 'Invalid request body',
        details: 'Please provide a valid goal_id and progress value (0-100)'
      }, { status: 400 });
    }

    // Fetch the current growth plan
    const { data: currentPlan, error: fetchError } = await supabase
      .from('growth_plans')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError) {
      return NextResponse.json({ 
        error: 'Failed to fetch growth plan',
        details: fetchError.message
      }, { status: 500 });
    }

    // Update the goal progress
    const updatedGoals = currentPlan.goals.map((goal: GrowthGoal) =>
      goal.id === goal_id
        ? { ...goal, progress, status: progress >= 100 ? 'completed' : 'in_progress' }
        : goal
    );

    // Update the growth plan
    const { error: updateError } = await supabase
      .from('growth_plans')
      .update({
        goals: updatedGoals,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentPlan.id);

    if (updateError) {
      return NextResponse.json({ 
        error: 'Failed to update growth plan',
        details: updateError.message
      }, { status: 500 });
    }

    const response = NextResponse.json({ success: true });
    
    if (session) {
      response.cookies.set('session', session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
    }

    return response;
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to analyze mood patterns
function analyzeMoodPatterns(moodData: any[]) {
  // Group moods by category
  const moodsByCategory: Record<string, number> = {};
  const moodTrends: Record<string, any> = {};
  
  // Process mood data
  moodData.forEach((entry, index) => {
    // Count occurrences of each mood category
    if (entry.category) {
      moodsByCategory[entry.category] = (moodsByCategory[entry.category] || 0) + 1;
    }
    
    // Identify trends (simplified)
    if (index > 0 && entry.category && moodData[index-1].category) {
      const transition = `${moodData[index-1].category}_to_${entry.category}`;
      moodTrends[transition] = (moodTrends[transition] || 0) + 1;
    }
  });
  
  // Find dominant mood
  let dominantMood = '';
  let maxCount = 0;
  
  Object.entries(moodsByCategory).forEach(([category, count]) => {
    if (count > maxCount) {
      dominantMood = category;
      maxCount = count;
    }
  });
  
  return {
    dominantMood,
    moodDistribution: moodsByCategory,
    moodTransitions: moodTrends,
    dataPoints: moodData.length
  };
} 