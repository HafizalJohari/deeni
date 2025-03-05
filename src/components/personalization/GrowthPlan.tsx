'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';

interface GrowthGoal {
  id: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  suggested_actions: string[];
  target_date?: string;
}

interface MoodPattern {
  category: string;
  frequency: number;
  insights: string[];
}

interface GrowthPlan {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  goals: GrowthGoal[];
  mood_patterns: MoodPattern[];
  recommendations: string[];
  focus_areas: string[];
}

const GrowthPlanComponent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [growthPlan, setGrowthPlan] = useState<GrowthPlan | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<GrowthGoal | null>(null);

  useEffect(() => {
    fetchGrowthPlan();
  }, []);

  const fetchGrowthPlan = async () => {
    try {
      const response = await fetch('/api/personalization/growth-plan');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch growth plan');
      }

      if (data.growthPlan) {
        setGrowthPlan(data.growthPlan);
      }
    } catch (error) {
      console.error('Error fetching growth plan:', error);
      if (error instanceof Error && !error.message.includes('Unauthorized')) {
        alert(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateGoalProgress = async (goalId: string, newProgress: number) => {
    if (!growthPlan) return;

    try {
      const response = await fetch('/api/personalization/growth-plan', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal_id: goalId,
          progress: newProgress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update goal progress');
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
    } catch (error) {
      console.error('Error updating goal progress:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Failed to update goal progress');
      }
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      not_started: 'bg-slate-100 text-slate-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
    };
    return colors[status as keyof typeof colors] || colors.not_started;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Prayer': 'bg-indigo-100 text-indigo-800',
      'Quran': 'bg-emerald-100 text-emerald-800',
      'Dhikr': 'bg-purple-100 text-purple-800',
      'Fasting': 'bg-amber-100 text-amber-800',
      'Community': 'bg-pink-100 text-pink-800',
      'Knowledge': 'bg-cyan-100 text-cyan-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
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
                  <Badge key={index} className={getCategoryColor(area)}>
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
                        <Badge className={getCategoryColor(goal.category)}>
                          {goal.category}
                        </Badge>
                        <Badge className={getStatusColor(goal.status)}>
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
                              Target: {new Date(goal.target_date).toLocaleDateString()}
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
                        <Badge className={getCategoryColor(pattern.category)}>
                          {pattern.frequency}% frequency
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-1">
                        {pattern.insights.map((insight, i) => (
                          <li key={i} className="text-sm text-slate-600">{insight}</li>
                        ))}
                      </ul>
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