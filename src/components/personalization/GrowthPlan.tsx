'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { GrowthPlan, GrowthGoal } from '@/types/growth-plan';
import { fetchGrowthPlan, updateGoalProgress } from '@/services/growth-plan';
import { getStatusColor, getCategoryColor, formatDate } from '@/utils/growth-plan';
import { toast } from 'sonner';
import Image from 'next/image';

const GrowthPlanComponent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [growthPlan, setGrowthPlan] = useState<GrowthPlan | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<GrowthGoal | null>(null);

  useEffect(() => {
    loadGrowthPlan();
  }, []);

  const loadGrowthPlan = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchGrowthPlan();
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      if (!response.data) {
        throw new Error('No growth plan data received');
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

  const handleUpdateGoalProgress = async (goalId: string, newProgress: number) => {
    if (!growthPlan) return;

    try {
      const response = await updateGoalProgress({
        goal_id: goalId,
        progress: newProgress,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Update local state
      setGrowthPlan(prevPlan => {
        if (!prevPlan) return null;
        return {
          ...prevPlan,
          goals: prevPlan.goals.map(goal =>
            goal.id === goalId
              ? { ...goal, progress: newProgress, status: newProgress >= 100 ? 'completed' : 'in_progress' }
              : goal
          ),
        };
      });

      toast.success('Goal progress updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update goal progress';
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <Button onClick={loadGrowthPlan} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (!growthPlan) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">No growth plan available. Please check back later.</p>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Spiritual Growth Plan</CardTitle>
        <CardDescription>
          Your personalized plan for Islamic spiritual development based on your mood patterns and preferences
        </CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="p-4">
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-medium mb-3">Focus Areas</h3>
              <div className="flex flex-wrap gap-2">
                {growthPlan.focus_areas.map((area, index) => (
                  <Badge key={index} className={getCategoryColor(area as any)}>
                    {area}
                  </Badge>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-medium mb-3">Recent Progress</h3>
              <div className="space-y-4">
                {growthPlan.goals
                  .filter(goal => goal.status === 'in_progress')
                  .slice(0, 3)
                  .map(goal => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{goal.title}</span>
                        <span className="text-sm text-slate-500">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>
                  ))}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-medium mb-3">Recommendations</h3>
              <ul className="space-y-2">
                {growthPlan.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-slate-600">• {rec}</li>
                ))}
              </ul>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="p-4">
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {growthPlan.goals.map(goal => (
                <Card
                  key={goal.id}
                  className={`cursor-pointer transition-all ${
                    selectedGoal?.id === goal.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedGoal(selectedGoal?.id === goal.id ? null : goal)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        <CardDescription>{goal.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getCategoryColor(goal.category as any)}>
                          {goal.category}
                        </Badge>
                        <Badge className={getStatusColor(goal.status as any)}>
                          {goal.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Progress</span>
                        <span className="text-sm font-medium">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>
                  </CardContent>

                  {selectedGoal?.id === goal.id && (
                    <CardFooter className="flex flex-col items-start pt-0">
                      <div className="w-full border-t my-2"></div>
                      <div className="w-full space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Suggested Actions</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {goal.suggested_actions.map((action, i) => (
                              <li key={i} className="text-sm text-slate-600">{action}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              const newProgress = Math.min(100, goal.progress + 10);
                              handleUpdateGoalProgress(goal.id, newProgress);
                            }}
                            disabled={goal.progress >= 100}
                          >
                            Update Progress
                          </Button>
                          {goal.target_date && (
                            <span className="text-sm text-slate-500">
                              Target: {formatDate(goal.target_date)}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="insights" className="p-4">
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-medium mb-3">Mood Patterns</h3>
              <div className="space-y-4">
                {growthPlan.mood_patterns.map((pattern, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{pattern.category}</CardTitle>
                        <Badge className={getCategoryColor(pattern.category as any)}>
                          {pattern.frequency}% frequency
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <ul className="list-disc pl-5 space-y-1">
                          {pattern.insights.map((insight, i) => (
                            <li key={i} className="text-sm text-slate-600">{insight}</li>
                          ))}
                        </ul>

                        {(pattern.category === 'Quran' || pattern.category === 'Hadith') && 
                          growthPlan.insightImages?.filter(img => 
                            img.category === pattern.category
                          ).map((image, i) => (
                            <div key={i} className="relative w-full aspect-square rounded-lg overflow-hidden">
                              <Image
                                src={image.url}
                                alt={image.alt}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                priority={i === 0}
                              />
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default GrowthPlanComponent; 