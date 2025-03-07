import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Check if user has an active plan
    const { data: existingPlan, error: planError } = await supabase
      .from('growth_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (planError && planError.code !== 'PGRST116') {
      throw planError;
    }

    if (existingPlan) {
      return NextResponse.json(
        { error: 'Conflict', details: 'User already has an active growth plan' },
        { status: 409 }
      );
    }

    // Create a new growth plan
    const newPlan = {
      user_id: user.id,
      title: 'Personal Growth Plan',
      description: 'Your personalized spiritual growth plan based on your mood entries and preferences.',
      start_date: new Date().toISOString(),
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: createdPlan, error: createError } = await supabase
      .from('growth_plans')
      .insert([newPlan])
      .select()
      .single();

    if (createError) throw createError;

    return NextResponse.json(createdPlan);
  } catch (error) {
    console.error('Error generating growth plan:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Failed to generate growth plan',
      },
      { status: 500 }
    );
  }
} 