import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Starting POST request handling');
    
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
        error: 'Unauthorized',
        details: 'No valid session found'
      }, { status: 401 });
    }

    // Get authorization header and verify it matches the session
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.log('[API] No authorization header');
      return NextResponse.json({ 
        error: 'Unauthorized',
        details: 'No authorization header'
      }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('[API] No bearer token');
      return NextResponse.json({ 
        error: 'Unauthorized',
        details: 'No bearer token'
      }, { status: 401 });
    }

    if (token !== session.access_token) {
      console.log('[API] Invalid authorization token');
      return NextResponse.json({ 
        error: 'Unauthorized',
        details: 'Invalid authorization token'
      }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    console.log('[API] Request body:', {
      hasFeeling: !!body?.feeling,
      hasFeelingIcon: !!body?.feeling_icon,
      hasReflectionText: !!body?.reflection_text
    });

    const { feeling, feeling_icon, reflection_text } = body;

    if (!feeling || !feeling_icon || !reflection_text) {
      console.log('[API] Invalid request data:', { feeling, feeling_icon, reflection_text });
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'feeling, feeling_icon, and reflection_text are required'
      }, { status: 400 });
    }

    // Analyze reflection using OpenAI
    const prompt = `As an Islamic counselor, analyze this self-reflection from a Muslim perspective:
    Feeling: ${feeling}
    Reflection: ${reflection_text}

    Provide a structured analysis including:
    1. Islamic perspective on the situation
    2. Practical recommendations based on Islamic teachings
    3. Spiritual guidance and reminders
    4. Relevant Quranic verses (if any)
    5. Relevant Hadith (if any)

    Format the response as a JSON object with these fields.`;

    const completion = await openai.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "system",
          content: "You are an expert Islamic counselor who provides guidance based on Quran and Sunnah. Your responses should be compassionate, wise, and firmly grounded in Islamic teachings."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(completion.choices[0].message.content);

    // Store in database
    const { data: reflection, error: insertError } = await supabase
      .from('self_reflections')
      .insert([
        {
          user_id: session.user.id,
          feeling,
          feeling_icon,
          reflection_text,
          analysis
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('[API] Database insert error:', insertError);
      return NextResponse.json({ 
        error: 'Failed to save reflection',
        details: insertError.message
      }, { status: 500 });
    }

    return NextResponse.json(reflection);
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

    const { data: reflections, error } = await supabase
      .from('self_reflections')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[API] Query error:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch reflections',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({ reflections });
  } catch (error) {
    console.error('[API] Unhandled error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 