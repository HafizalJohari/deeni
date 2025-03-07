'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { fetchGrowthPlan, updateGrowthPlanStatus, generateGrowthPlan } from '@/services/growth-plan';
import { toast } from 'sonner';
import { PostgrestError } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';

interface GrowthPlan {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
  updated_at: string;
}

const GrowthPlanComponent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('current');
  const [growthPlan, setGrowthPlan] = useState<GrowthPlan | null>(null);

  useEffect(() => {
    loadGrowthPlan();
  }, []);

  const loadGrowthPlan = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchGrowthPlan();
      
      if (response.error) {
        const pgError = response.error as PostgrestError;
        if (pgError.code === 'PGRST116') {
          // No rows returned - this is expected when no active plan exists
          setGrowthPlan(null);
          return;
        }
        throw new Error(pgError.message || 'Failed to fetch growth plan');
      }

      setGrowthPlan(response.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load growth plan';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (status: 'active' | 'completed' | 'paused') => {
    if (!growthPlan) return;

    try {
      const response = await updateGrowthPlanStatus(growthPlan.id, status);
      if (response.error) {
        const pgError = response.error as PostgrestError;
        throw new Error(pgError.message || 'Failed to update status');
      }
      await loadGrowthPlan();
      toast.success(`Growth plan ${status}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update growth plan status';
      toast.error(message);
    }
  };

  const handleGeneratePlan = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const response = await generateGrowthPlan();
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate growth plan');
      }
      
      // Reload the growth plan after generation
      await loadGrowthPlan();
      toast.success('Growth plan generated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate growth plan';
      setError(message);
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !growthPlan) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">No Active Growth Plan</CardTitle>
          <CardDescription>
            {error || 'Submit at least 5 mood entries to generate your personalized growth plan.'}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="w-full sm:w-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Plan...
              </>
            ) : (
              'Generate Growth Plan'
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      paused: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">Current Plan</TabsTrigger>
          <TabsTrigger value="generated">Generated Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold">Current Growth Plan</CardTitle>
                <CardDescription className="mt-2">
                  Your active spiritual development plan
                </CardDescription>
              </div>
              <Badge className={getStatusColor(growthPlan.status)}>
                {growthPlan.status.charAt(0).toUpperCase() + growthPlan.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                <p className="mt-1">{formatDate(growthPlan.start_date)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">End Date</h3>
                <p className="mt-1">{growthPlan.end_date ? formatDate(growthPlan.end_date) : 'Ongoing'}</p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end space-x-2">
            {growthPlan.status === 'active' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleStatusUpdate('paused')}
                >
                  Pause Plan
                </Button>
                <Button
                  variant="default"
                  onClick={() => handleStatusUpdate('completed')}
                >
                  Complete Plan
                </Button>
              </>
            )}
            {growthPlan.status === 'paused' && (
              <Button
                variant="default"
                onClick={() => handleStatusUpdate('active')}
              >
                Resume Plan
              </Button>
            )}
            {growthPlan.status === 'completed' && (
              <Button
                variant="outline"
                onClick={loadGrowthPlan}
              >
                Generate New Plan
              </Button>
            )}
          </CardFooter>
        </TabsContent>

        <TabsContent value="generated">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{growthPlan.title}</CardTitle>
            {growthPlan.description && (
              <CardDescription className="mt-2">
                {growthPlan.description}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Generated On</h3>
                <p className="mt-1">{formatDate(growthPlan.created_at)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                <p className="mt-1">{formatDate(growthPlan.updated_at)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Plan Duration</h3>
                <p className="mt-1">
                  From {formatDate(growthPlan.start_date)}
                  {growthPlan.end_date ? ` to ${formatDate(growthPlan.end_date)}` : ' (Ongoing)'}
                </p>
              </div>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default GrowthPlanComponent; 