import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CookieOptions } from '@supabase/ssr';

interface MoodAnalysis {
  primaryEmotion: string;
  spiritualDimension: string;
  category: 'Spiritual_Connection' | 'Spiritual_Growth' | 'Spiritual_Challenge' | 'Emotional_Positive' | 'Emotional_Negative' | 'Neutral';
  intensity: number;
  triggers: string[];
  suggestions: string[];
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Starting POST request handling');
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    console.log('[API] Auth header present:', !!authHeader);

    if (!authHeader?.startsWith('Bearer ')) {
      console.log('[API] Invalid or missing authorization header');
      return NextResponse.json({ 
        error: 'Unauthorized',
        details: 'Invalid authorization header'
      }, { status: 401 });
    }

    // Create Supabase client
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get session using the route handler client
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('[API] Session check:', {
      hasSession: !!session,
      hasError: !!sessionError,
      userEmail: session?.user?.email || 'No email',
      tokenPresent: !!session?.access_token
    });

    if (sessionError || !session?.access_token) {
      console.error('[API] Session error:', sessionError);
      return NextResponse.json({ 
        error: 'Authentication error',
        details: sessionError?.message || 'Invalid session'
      }, { status: 401 });
    }

    // Verify that the token matches
    const token = authHeader.split(' ')[1];
    if (token !== session.access_token) {
      console.log('[API] Token mismatch');
      return NextResponse.json({ 
        error: 'Unauthorized',
        details: 'Invalid authentication token'
      }, { status: 401 });
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
      console.log('[API] Request body:', {
        hasMoodDescription: !!body?.mood_description,
        hasDate: !!body?.date
      });
    } catch (e) {
      console.error('[API] Failed to parse request body:', e);
      return NextResponse.json({ 
        error: 'Invalid request body',
        details: 'Could not parse JSON body'
      }, { status: 400 });
    }

    const { mood_description } = body;

    if (!mood_description || typeof mood_description !== 'string') {
      console.log('[API] Invalid mood description:', { received: mood_description });
      return NextResponse.json({ 
        error: 'Mood description is required and must be a string',
        details: 'Invalid or missing mood_description field'
      }, { status: 400 });
    }

    // Check if mood_entries table exists and create if it doesn't
    const { error: tableCheckError } = await supabase
      .from('mood_entries')
      .select('count')
      .limit(1);

    if (tableCheckError) {
      console.error('[API] Table check error:', tableCheckError);
      // Create the table if it doesn't exist
      const { error: createTableError } = await supabase.rpc('create_mood_entries_table');
      if (createTableError) {
        console.error('[API] Failed to create table:', createTableError);
        return NextResponse.json({ 
          error: 'Database setup error',
          details: createTableError.message 
        }, { status: 500 });
      }
    }

    // Analyze mood using OpenAI
    let moodAnalysis: MoodAnalysis;
    try {
      const analysis = await openai.chat.completions.create({
        model: "gpt-4o-mini",
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
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      if (!analysis.choices[0]?.message?.content) {
        throw new Error('Empty response from OpenAI');
      }

      try {
        const parsedContent = JSON.parse(analysis.choices[0].message.content);
        
        // Validate the response structure
        const requiredFields = ['primaryEmotion', 'spiritualDimension', 'category', 'intensity', 'triggers', 'suggestions'] as const;
        const missingFields = requiredFields.filter(field => !(field in parsedContent));
        
        if (missingFields.length > 0) {
          throw new Error(`Invalid response structure. Missing fields: ${missingFields.join(', ')}`);
        }

        // Validate intensity is a number between 1 and 10
        if (typeof parsedContent.intensity !== 'number' || parsedContent.intensity < 1 || parsedContent.intensity > 10) {
          throw new Error('Intensity must be a number between 1 and 10');
        }

        // Validate category is one of the allowed values
        const validCategories = ['Spiritual_Connection', 'Spiritual_Growth', 'Spiritual_Challenge', 'Emotional_Positive', 'Emotional_Negative', 'Neutral'];
        if (!validCategories.includes(parsedContent.category)) {
          throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
        }

        moodAnalysis = parsedContent as MoodAnalysis;
      } catch (e) {
        console.error('Failed to parse or validate OpenAI response:', e);
        throw new Error('Failed to analyze mood: Invalid response format');
      }

      // Insert the mood entry with retry logic
      let retryCount = 0;
      const maxRetries = 3;
      let moodEntry;
      let insertError;

      while (retryCount < maxRetries) {
        const result = await supabase
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

        if (!result.error) {
          moodEntry = result.data;
          break;
        }

        insertError = result.error;
        retryCount++;
        
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
        }
      }

      if (!moodEntry) {
        console.error('Insert error after retries:', insertError);
        return NextResponse.json({ 
          error: 'Failed to save mood entry',
          details: insertError?.message || 'Database error after multiple retries'
        }, { status: 500 });
      }

      return NextResponse.json({ moodEntry });
    } catch (error) {
      console.error('OpenAI or database error:', error);
      return NextResponse.json({ 
        error: 'Failed to analyze mood',
        details: error instanceof Error ? error.message : 'Unknown error occurred during analysis'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('[API] Unhandled error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('[API] Starting GET request handling');
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    console.log('[API] Auth header present:', !!authHeader);

    // Create Supabase client
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get session using the route handler client
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('[API] Session check:', {
      hasSession: !!session,
      hasError: !!sessionError,
      userEmail: session?.user?.email || 'No email'
    });

    if (sessionError) {
      console.error('[API] Session error:', sessionError);
      return NextResponse.json({ 
        error: 'Authentication error',
        details: sessionError.message
      }, { status: 401 });
    }

    if (!session) {
      console.log('[API] No session found');
      return NextResponse.json({ 
        error: 'Unauthorized - Please log in',
        details: 'No valid session found'
      }, { status: 401 });
    }

    const { data: moodEntries, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('[API] Query error:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch mood entries',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({ moodEntries });
  } catch (error) {
    console.error('[API] Unhandled error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 