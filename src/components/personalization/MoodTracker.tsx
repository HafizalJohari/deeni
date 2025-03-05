'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';

// Types
interface MoodEntry {
  id: string;
  user_id: string;
  mood_description: string;
  created_at: string;
  updated_at: string;
  analysis?: {
    primaryEmotion: string;
    spiritualDimension: string;
    category: string;
    intensity: number;
    triggers: string[];
    suggestions: string[];
  };
}

const MoodTracker = () => {
  const [moodDescription, setMoodDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [activeTab, setActiveTab] = useState('log');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedMood, setSelectedMood] = useState<MoodEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch mood entries on component mount
  useEffect(() => {
    const fetchMoodEntries = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/personalization/mood-tracking');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch mood entries');
        }

        if (data.moodEntries) {
          setMoodEntries(data.moodEntries);
        }
      } catch (error) {
        console.error('Error fetching mood entries:', error);
        // Only show alert for non-auth errors
        if (error instanceof Error && !error.message.includes('Unauthorized')) {
          alert(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMoodEntries();
  }, []);

  // Submit mood entry
  const handleSubmitMood = async () => {
    if (!moodDescription.trim()) return;

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/personalization/mood-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mood_description: moodDescription,
          date: selectedDate?.toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit mood');
      }
      
      if (data.moodEntry) {
        setMoodEntries([data.moodEntry, ...moodEntries]);
        setMoodDescription('');
        setActiveTab('history');
      } else {
        throw new Error('No mood entry returned from server');
      }
    } catch (error) {
      console.error('Error submitting mood:', error);
      // Only show alert for non-auth errors
      if (error instanceof Error && !error.message.includes('Unauthorized')) {
        alert(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get color based on mood category
  const getMoodCategoryColor = (category?: string) => {
    if (!category) return 'bg-gray-100 text-gray-800';
    
    const colors: Record<string, string> = {
      'Spiritual_Connection': 'bg-green-100 text-green-800',
      'Spiritual_Growth': 'bg-blue-100 text-blue-800',
      'Spiritual_Challenge': 'bg-amber-100 text-amber-800',
      'Emotional_Positive': 'bg-purple-100 text-purple-800',
      'Emotional_Negative': 'bg-red-100 text-red-800',
      'Neutral': 'bg-gray-100 text-gray-800',
      'neutral': 'bg-gray-100 text-gray-800',
    };
    
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // Get intensity bar width
  const getIntensityWidth = (intensity?: number) => {
    if (intensity === undefined || intensity === null) return '0%';
    return `${intensity * 10}%`;
  };

  // Handle mood card click
  const handleMoodCardClick = (mood: MoodEntry) => {
    setSelectedMood(mood === selectedMood ? null : mood);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Spiritual Mood Tracker</CardTitle>
        <CardDescription>
          Track your spiritual and emotional wellbeing to gain insights and personalized guidance
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="log">Log Your Mood</TabsTrigger>
          <TabsTrigger value="history">Mood History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="log" className="space-y-4 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-2">How are you feeling today?</h3>
              <Textarea
                placeholder="Describe your spiritual and emotional state... (e.g., 'I felt connected during prayer today but struggled with focus afterward')"
                value={moodDescription}
                onChange={(e) => setMoodDescription(e.target.value)}
                className="min-h-[150px]"
              />
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Select Date</h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Guidance</h3>
              <p className="text-sm text-slate-600 mb-4">
                Reflect on both your emotional state and spiritual connection. Consider:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                <li>How connected do you feel to Allah today?</li>
                <li>What emotions are most present for you?</li>
                <li>How did your prayers or other acts of worship feel?</li>
                <li>Did any specific events impact your spiritual state?</li>
                <li>Are there any challenges affecting your ibadah (worship)?</li>
              </ul>
              <div className="mt-6">
                <p className="text-sm text-slate-600 italic">
                  Your mood entries help personalize your growth plan and content recommendations.
                </p>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleSubmitMood} 
            disabled={isSubmitting || !moodDescription.trim()} 
            className="w-full mt-4"
          >
            {isSubmitting ? 'Analyzing...' : 'Submit Mood Entry'}
          </Button>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4 p-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-2 text-slate-500">Loading mood entries...</p>
            </div>
          ) : moodEntries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">No mood entries yet. Start by logging your mood.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {moodEntries.map((entry, index) => (
                <Card 
                  key={index} 
                  className={`cursor-pointer transition-all ${selectedMood === entry ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => handleMoodCardClick(entry)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{entry.analysis?.primaryEmotion || 'Unknown Emotion'}</CardTitle>
                        <CardDescription>{format(new Date(entry.created_at), 'PPP')}</CardDescription>
                      </div>
                      <Badge className={getMoodCategoryColor(entry.analysis?.category)}>
                        {entry.analysis?.category ? entry.analysis.category.replace('_', ' ') : 'Unanalyzed'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <p className="text-sm text-slate-600 mb-2">{entry.mood_description}</p>
                    
                    <div className="mt-2">
                      <div className="text-xs text-slate-500 mb-1">Intensity</div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: getIntensityWidth(entry.analysis?.intensity) }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                  
                  {selectedMood === entry && (
                    <CardFooter className="flex flex-col items-start pt-0">
                      <div className="w-full border-t my-2"></div>
                      
                      <div className="w-full">
                        <h4 className="text-sm font-medium mb-1">Spiritual Dimension</h4>
                        <p className="text-sm text-slate-600 mb-3">{entry.analysis?.spiritualDimension || 'Unanalyzed'}</p>
                        
                        <h4 className="text-sm font-medium mb-1">Potential Triggers</h4>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {entry.analysis?.triggers?.map((trigger, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{trigger}</Badge>
                          )) || <span className="text-sm text-slate-500">No triggers identified</span>}
                        </div>
                        
                        <h4 className="text-sm font-medium mb-1">Suggestions</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {entry.analysis?.suggestions?.map((suggestion, i) => (
                            <li key={i} className="text-sm text-slate-600">{suggestion}</li>
                          )) || <li className="text-sm text-slate-500">No suggestions available</li>}
                        </ul>
                      </div>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default MoodTracker; 