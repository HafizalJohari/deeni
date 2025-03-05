import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            const cookie = await cookieStore.get(name);
            return cookie?.value ?? '';
          },
          async set(name: string, value: string, options: any) {
            try {
              await cookieStore.set(name, value, options);
            } catch (error) {
              // Ignore cookie setting errors in API routes
            }
          },
          async remove(name: string, options: any) {
            try {
              await cookieStore.delete(name);
            } catch (error) {
              // Ignore cookie removal errors in API routes
            }
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
        error: 'Failed to fetch mood entries' 
      }, { status: 500 });
    }

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

    let growthPlan;
    try {
      const planData = JSON.parse(analysis.choices[0].message.content);
      
      // More detailed validation
      if (!planData || typeof planData !== 'object') {
        throw new Error('Invalid response format from OpenAI');
      }

      // Validate and ensure all required fields exist with proper types
      if (!Array.isArray(planData.focus_areas)) {
        throw new Error('focus_areas must be an array');
      }
      if (!Array.isArray(planData.recommendations)) {
        throw new Error('recommendations must be an array');
      }
      if (!Array.isArray(planData.goals)) {
        throw new Error('goals must be an array');
      }
      if (!Array.isArray(planData.mood_patterns)) {
        throw new Error('mood_patterns must be an array');
      }

      // Validate each goal has required fields
      const validatedGoals = planData.goals.map((goal: any, index: number) => {
        if (!goal.title) throw new Error(`Goal at index ${index} missing title`);
        if (!goal.description) throw new Error(`Goal at index ${index} missing description`);
        if (!goal.category) throw new Error(`Goal at index ${index} missing category`);
        
        return {
          id: goal.id || crypto.randomUUID(),
          title: goal.title,
          description: goal.description,
          category: goal.category,
          progress: goal.progress || 0,
          status: goal.status || 'not_started',
          suggested_actions: Array.isArray(goal.suggested_actions) ? goal.suggested_actions : [],
          target_date: goal.target_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        };
      });

      growthPlan = {
        id: crypto.randomUUID(),
        user_id: session.user.id,
        focus_areas: planData.focus_areas,
        goals: validatedGoals,
        mood_patterns: planData.mood_patterns,
        recommendations: planData.recommendations,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Log the final growth plan for debugging
      console.log('Growth plan to be inserted:', JSON.stringify(growthPlan, null, 2));
    } catch (e) {
      console.error('Failed to parse or validate OpenAI response:', e);
      console.error('OpenAI response:', analysis.choices[0].message.content);
      return NextResponse.json({ 
        error: 'Failed to generate growth plan',
        details: e instanceof Error ? e.message : 'Unknown error'
      }, { status: 500 });
    }

    // Store the growth plan in Supabase
    const { data: insertedPlan, error: insertError } = await supabase
      .from('growth_plans')
      .upsert([growthPlan])
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      console.error('Growth plan data:', JSON.stringify(growthPlan, null, 2));
      return NextResponse.json({ 
        error: 'Failed to save growth plan',
        details: insertError.message
      }, { status: 500 });
    }

    return NextResponse.json({ growthPlan: insertedPlan });
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
          async get(name: string) {
            const cookie = await cookieStore.get(name);
            return cookie?.value ?? '';
          },
          async set(name: string, value: string, options: any) {
            try {
              await cookieStore.set(name, value, options);
            } catch (error) {
              // Ignore cookie setting errors in API routes
            }
          },
          async remove(name: string, options: any) {
            try {
              await cookieStore.delete(name);
            } catch (error) {
              // Ignore cookie removal errors in API routes
            }
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { goal_id, progress } = body;

    if (!goal_id || typeof progress !== 'number' || progress < 0 || progress > 100) {
      return NextResponse.json({ 
        error: 'Invalid goal_id or progress value' 
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
      console.error('Fetch error:', fetchError);
      return NextResponse.json({ 
        error: 'Failed to fetch growth plan' 
      }, { status: 500 });
    }

    // Update the goal progress
    const updatedGoals = currentPlan.goals.map(goal =>
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
      console.error('Update error:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update growth plan' 
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