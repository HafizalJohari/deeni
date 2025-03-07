import { GrowthPlan, UpdateGoalProgressPayload, APIResponse } from '@/types/growth-plan';
import { supabase } from '@/lib/supabase/client';

export const fetchGrowthPlan = async () => {
  try {
    const { data, error } = await supabase
      .from('growth_plans')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return { error };
    }

    return { data };
  } catch (error) {
    return { error };
  }
};

export const updateGrowthPlanStatus = async (planId: string, status: 'active' | 'completed' | 'paused') => {
  try {
    const { data, error } = await supabase
      .from('growth_plans')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', planId)
      .select()
      .single();

    if (error) {
      return { error };
    }

    return { data };
  } catch (error) {
    return { error };
  }
};

export async function updateGoalProgress(payload: UpdateGoalProgressPayload): Promise<APIResponse<void>> {
  try {
    const response = await fetch('/api/personalization/growth-plan', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: {
          message: data.error,
          details: data.details,
          hint: data.hint
        }
      };
    }

    return { data: undefined };
  } catch (error) {
    return {
      error: {
        message: 'Failed to update goal progress',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

export const generateGrowthPlan = async (): Promise<APIResponse<GrowthPlan>> => {
  try {
    const response = await fetch('/api/personalization/growth-plan/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: {
          message: data.error,
          details: data.details,
          hint: data.hint
        }
      };
    }

    return { data };
  } catch (error) {
    return {
      error: {
        message: 'Failed to generate growth plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}; 