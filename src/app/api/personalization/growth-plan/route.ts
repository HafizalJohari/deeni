import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GrowthPlan, GrowthGoal, UpdateGoalProgressPayload } from '@/types/growth-plan';
import { MoodEntryDB, ProcessedMoodEntry } from '@/types/personalization';
import { generateInsightImage } from '@/services/image-generation';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const validateGrowthPlanData = (data: any): data is GrowthPlan => {
  try {
    if (!data || typeof data !== 'object') return false;
    
    // Required arrays
    const requiredArrays = ['focus_areas', 'goals', 'mood_patterns', 'recommendations'];
    for (const arr of requiredArrays) {
      if (!Array.isArray(data[arr])) {
        console.error(`Missing or invalid ${arr} array in growth plan data`);
        return false;
      }
    }
    
    // Validate goals structure
    if (!data.goals.every((goal: any) => {
      const requiredFields = ['title', 'description', 'category', 'progress', 'suggested_actions'];
      return requiredFields.every(field => {
        const hasField = goal.hasOwnProperty(field);
        if (!hasField) {
          console.error(`Missing required field ${field} in goal`);
        }
        return hasField;
      });
    })) {
      return false;
    }

    // Validate mood patterns structure
    if (!data.mood_patterns.every((pattern: any) => {
      const requiredFields = ['category', 'frequency', 'insights'];
      return requiredFields.every(field => {
        const hasField = pattern.hasOwnProperty(field);
        if (!hasField) {
          console.error(`Missing required field ${field} in mood pattern`);
        }
        return hasField;
      });
    })) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating growth plan data:', error);
    return false;
  }
};

export async function GET(request: NextRequest) {
  try {
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

    // Get authenticated user using getUser() for security
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Authentication error:', userError);
      return NextResponse.json({ 
        error: 'Authentication error',
        details: 'Failed to verify user authentication'
      }, { status: 401 });
    }

    // First, check if there's an existing active growth plan
    const { data: existingPlan, error: planError } = await supabase
      .from('growth_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (planError && planError.code !== 'PGRST116') { // Ignore "no rows returned" error
      console.error('Error fetching existing plan:', planError);
      return NextResponse.json({ 
        error: 'Database error',
        details: 'Failed to fetch existing growth plan'
      }, { status: 500 });
    }

    // If we have an active plan, return it
    if (existingPlan) {
      return NextResponse.json({ growthPlan: existingPlan });
    }

    // Fetch user's mood entries with analysis from the last 30 days
    const { data: moodEntries, error: moodError } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', user.id)
      .not('analysis', 'is', null)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (moodError) {
      console.error('Error fetching mood entries:', moodError);
      return NextResponse.json({ 
        error: 'Database error',
        details: 'Failed to fetch mood entries: ' + moodError.message
      }, { status: 500 });
    }

    // Check if there are at least 5 mood entries with analysis
    if (!moodEntries || moodEntries.length < 5) {
      const entriesNeeded = 5 - (moodEntries?.length || 0);
      return NextResponse.json({ 
        error: 'Insufficient data',
        details: `Please submit ${entriesNeeded} more mood ${entriesNeeded === 1 ? 'entry' : 'entries'} before generating a growth plan. This helps us create a more personalized plan for your spiritual growth.`,
        entriesNeeded
      }, { status: 400 });
    }

    try {
      // Analyze mood patterns and generate growth plan using OpenAI
      const analysis = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert in Islamic spiritual development and emotional analysis. 
            Your task is to analyze mood entries and their analysis to create a personalized growth plan that helps 
            Muslims improve their spiritual connection and emotional wellbeing.
            
            Consider:
            1. Patterns in spiritual states and emotions
            2. Common themes in the analysis
            3. Areas needing improvement
            4. Practical, achievable goals
            5. Islamic principles and teachings`
          },
          {
            role: "user",
            content: `Based on these mood entries and their analysis: ${JSON.stringify(moodEntries, null, 2)}, 
            create a comprehensive growth plan that includes:
            
            1. A title that reflects the main focus or theme
            2. A description of the overall plan and its objectives
            3. A start date (today) and end date (30 days from now)
            
            Return the response in this JSON structure:
            {
              "title": "string",
              "description": "string",
              "start_date": "YYYY-MM-DD",
              "end_date": "YYYY-MM-DD"
            }
            
            The plan should be practical, achievable, and grounded in Islamic teachings.`
          }
        ],
        response_format: { type: "json_object" }
      });

      const content = analysis.choices[0].message.content;
      if (!content) {
        throw new Error('OpenAI response content is null');
      }

      const planData = JSON.parse(content);
      
      // Create the growth plan
      const growthPlan = {
        user_id: user.id,
        title: planData.title,
        description: planData.description,
        start_date: planData.start_date,
        end_date: planData.end_date,
        status: 'active'
      };

      // Store the growth plan in Supabase
      const { data: insertedPlan, error: insertError } = await supabase
        .from('growth_plans')
        .insert([growthPlan])
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to save growth plan: ${insertError.message}`);
      }

      return NextResponse.json({ growthPlan: insertedPlan });
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

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        details: 'Please log in to update your growth plan'
      }, { status: 401 });
    }

    const body = await request.json();
    const { plan_id, status } = body;

    if (!plan_id || !status || !['active', 'completed', 'paused'].includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid request body',
        details: 'Please provide a valid plan_id and status (active, completed, or paused)'
      }, { status: 400 });
    }

    // Update the growth plan status
    const { error: updateError } = await supabase
      .from('growth_plans')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', plan_id)
      .eq('user_id', user.id);

    if (updateError) {
      return NextResponse.json({ 
        error: 'Failed to update growth plan',
        details: updateError.message
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });
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