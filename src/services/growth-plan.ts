import { GrowthPlan, UpdateGoalProgressPayload, APIResponse } from '@/types/growth-plan';

export async function fetchGrowthPlan(): Promise<APIResponse<GrowthPlan>> {
  try {
    const response = await fetch('/api/personalization/growth-plan');
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

    return { data: data.growthPlan };
  } catch (error) {
    return {
      error: {
        message: 'Failed to fetch growth plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

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