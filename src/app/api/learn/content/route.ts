import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';

// Helper function to check authentication
async function checkAuth(supabase: any) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Auth error:', userError);
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    if (!user) {
      console.error('No user found in session');
      throw new Error('Unauthorized - Please log in');
    }
    
    return user;
  } catch (error) {
    console.error('Error in checkAuth:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    console.log('Fetching learning content...');
    
    // Check authentication
    try {
      await checkAuth(supabase);
    } catch (authError) {
      console.error('Authentication failed:', authError);
      return NextResponse.json(
        { error: authError instanceof Error ? authError.message : 'Authentication failed' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    console.log('Search query:', search);

    let query = supabase
      .from('learning_content')
      .select('*')
      .order('createdAt', { ascending: false });

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    console.log('Executing Supabase query...');
    const { data, error: queryError } = await query;
    
    if (queryError) {
      console.error('Supabase query error:', queryError);
      throw new Error(`Database error: ${queryError.message}`);
    }

    if (!data) {
      console.log('No data found, returning empty array');
      return NextResponse.json([]);
    }

    console.log(`Found ${data.length} content items`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/learn/content:', error);
    
    // Determine appropriate status code
    let status = 500;
    let errorMessage = 'Internal server error';
    
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized') || error.message.includes('Authentication')) {
        status = 401;
        errorMessage = error.message;
      } else if (error.message.includes('Database')) {
        status = 503;
        errorMessage = 'Database service unavailable';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const json = await request.json();
    const user = await checkAuth(supabase);

    const content = {
      id: nanoid(),
      ...json,
      authorId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { error: insertError } = await supabase
      .from('learning_content')
      .insert([content]);

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      throw new Error(`Database error: ${insertError.message}`);
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error in POST /api/learn/content:', error);
    
    let status = 500;
    let errorMessage = 'Internal server error';
    
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized') || error.message.includes('Authentication')) {
        status = 401;
        errorMessage = error.message;
      } else if (error.message.includes('Database')) {
        status = 503;
        errorMessage = 'Database service unavailable';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
} 