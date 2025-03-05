import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value ?? '';
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set(name, value, options);
            } catch (error) {
              // Ignore cookie setting errors in API routes
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.delete(name);
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

    const { mood_description } = body;

    if (!mood_description || typeof mood_description !== 'string') {
      return NextResponse.json({ 
        error: 'Mood description is required and must be a string' 
      }, { status: 400 });
    }

    // Check if mood_entries table exists
    const { error: tableCheckError } = await supabase
      .from('mood_entries')
      .select('count')
      .limit(1);

    if (tableCheckError) {
      console.error('Table check error:', tableCheckError);
      // Create the table if it doesn't exist
      const { error: createTableError } = await supabase.rpc('create_mood_entries_table');
      if (createTableError) {
        console.error('Failed to create table:', createTableError);
        return NextResponse.json({ 
          error: 'Database setup error' 
        }, { status: 500 });
      }
    }

    // Analyze mood using OpenAI
    const analysis = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert in emotional and spiritual analysis from an Islamic perspective. Analyze the following mood description and provide insights in a structured format."
        },
        {
          role: "user",
          content: `Analyze this mood description: "${mood_description}". Return a JSON object with the following structure: {
            "primaryEmotion": "main emotion felt",
            "spiritualDimension": "how this relates to spiritual state",
            "category": "one of: Spiritual_Connection, Spiritual_Growth, Spiritual_Challenge, Emotional_Positive, Emotional_Negative, Neutral",
            "intensity": "number 1-10",
            "triggers": ["potential trigger 1", "potential trigger 2"],
            "suggestions": ["suggestion 1", "suggestion 2"]
          }`
        }
      ]
    });

    let moodAnalysis;
    try {
      moodAnalysis = JSON.parse(analysis.choices[0].message.content);
    } catch (e) {
      console.error('Failed to parse OpenAI response:', e);
      return NextResponse.json({ 
        error: 'Failed to analyze mood' 
      }, { status: 500 });
    }

    // Insert the mood entry
    const { data: moodEntry, error: insertError } = await supabase
      .from('mood_entries')
      .insert([
        {
          user_id: session.user.id,
          mood_description,
          analysis: moodAnalysis,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ 
        error: 'Failed to save mood entry',
        details: insertError.message
      }, { status: 500 });
    }

    return NextResponse.json({ moodEntry });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value ?? '';
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set(name, value, options);
            } catch (error) {
              // Ignore cookie setting errors in API routes
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.delete(name);
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

    const { data: moodEntries, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Query error:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch mood entries',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({ moodEntries });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 