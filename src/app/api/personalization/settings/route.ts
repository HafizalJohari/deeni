import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET endpoint to fetch personalization settings
export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Check if user is authenticated
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    return NextResponse.json(
      { error: 'Unauthorized: Please sign in to access this resource' }, 
      { status: 401 }
    );
  }
  
  // Fetch personalization settings for the user
  const { data, error } = await supabase
    .from('personalization_settings')
    .select('*')
    .eq('user_id', session.user.id)
    .single();
  
  if (error) {
    // Return empty settings if none found (not really an error)
    if (error.code === 'PGRST116') {
      return NextResponse.json(null);
    }
    
    return NextResponse.json(
      { error: `Failed to fetch personalization settings: ${error.message}` }, 
      { status: 500 }
    );
  }
  
  return NextResponse.json(data);
}

// POST endpoint to create or update personalization settings
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Check if user is authenticated
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    return NextResponse.json(
      { error: 'Unauthorized: Please sign in to access this resource' }, 
      { status: 401 }
    );
  }
  
  // Get request body
  let requestBody;
  try {
    requestBody = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' }, 
      { status: 400 }
    );
  }
  
  // Check if settings already exist for this user
  const { data: existingData, error: fetchError } = await supabase
    .from('personalization_settings')
    .select('id')
    .eq('user_id', session.user.id)
    .single();
  
  let result;
  
  // If settings already exist, update them
  if (existingData?.id) {
    const { data, error } = await supabase
      .from('personalization_settings')
      .update({
        allow_data_collection: requestBody.allow_data_collection,
        daily_reflection_reminders: requestBody.daily_reflection_reminders,
        weekly_growth_updates: requestBody.weekly_growth_updates,
        content_recommendation_alerts: requestBody.content_recommendation_alerts,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingData.id)
      .select('*')
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: `Failed to update personalization settings: ${error.message}` }, 
        { status: 500 }
      );
    }
    
    result = data;
  } else {
    // If settings don't exist, create them
    const { data, error } = await supabase
      .from('personalization_settings')
      .insert({
        user_id: session.user.id,
        allow_data_collection: requestBody.allow_data_collection ?? true,
        daily_reflection_reminders: requestBody.daily_reflection_reminders ?? true,
        weekly_growth_updates: requestBody.weekly_growth_updates ?? true,
        content_recommendation_alerts: requestBody.content_recommendation_alerts ?? true
      })
      .select('*')
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: `Failed to create personalization settings: ${error.message}` }, 
        { status: 500 }
      );
    }
    
    result = data;
  }
  
  return NextResponse.json(result);
}

// PATCH endpoint to update specific fields of personalization settings
export async function PATCH(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Check if user is authenticated
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    return NextResponse.json(
      { error: 'Unauthorized: Please sign in to access this resource' }, 
      { status: 401 }
    );
  }
  
  // Get request body
  let requestBody;
  try {
    requestBody = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' }, 
      { status: 400 }
    );
  }
  
  // Check if settings already exist for this user
  const { data: existingData, error: fetchError } = await supabase
    .from('personalization_settings')
    .select('id')
    .eq('user_id', session.user.id)
    .single();
  
  if (!existingData?.id) {
    return NextResponse.json(
      { error: 'Settings not found. Please create settings first using POST' }, 
      { status: 404 }
    );
  }
  
  // Update only the provided fields
  const updateData: any = {
    updated_at: new Date().toISOString()
  };
  
  // Only include fields that were provided in the request
  if (typeof requestBody.allow_data_collection === 'boolean') {
    updateData.allow_data_collection = requestBody.allow_data_collection;
  }
  
  if (typeof requestBody.daily_reflection_reminders === 'boolean') {
    updateData.daily_reflection_reminders = requestBody.daily_reflection_reminders;
  }
  
  if (typeof requestBody.weekly_growth_updates === 'boolean') {
    updateData.weekly_growth_updates = requestBody.weekly_growth_updates;
  }
  
  if (typeof requestBody.content_recommendation_alerts === 'boolean') {
    updateData.content_recommendation_alerts = requestBody.content_recommendation_alerts;
  }
  
  // Update the settings
  const { data, error } = await supabase
    .from('personalization_settings')
    .update(updateData)
    .eq('id', existingData.id)
    .select('*')
    .single();
  
  if (error) {
    return NextResponse.json(
      { error: `Failed to update personalization settings: ${error.message}` }, 
      { status: 500 }
    );
  }
  
  return NextResponse.json(data);
} 