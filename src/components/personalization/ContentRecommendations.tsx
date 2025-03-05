'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { BookOpen, Video, FileText, Heart, BookMarked, Clock } from 'lucide-react';

// Mock user ID for demo purposes
const MOCK_USER_ID = 'user-123';

// Types
interface Recommendation {
  title: string;
  type: string;
  description: string;
  reason: string;
}

interface RecommendationsResponse {
  recommendations: Recommendation[];
}

const ContentRecommendations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [currentMood, setCurrentMood] = useState('');

  // Get recommendations based on current mood
  const handleGetRecommendations = async () => {
    if (!currentMood.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Mock preferences - in a real app, this would come from user settings
      const mockPreferences = {
        knowledgeLevel: "intermediate",
        interests: ["Quran", "Hadith", "Personal Development"],
        preferredContentTypes: ["articles", "videos", "audio"]
      };
      
      // Mock history - in a real app, this would come from user activity
      const mockHistory = [
        { title: "Understanding Surah Al-Fatiha", type: "Article", date: new Date(Date.now() - 86400000).toISOString() },
        { title: "The Life of Prophet Muhammad (PBUH)", type: "Video", date: new Date(Date.now() - 172800000).toISOString() },
        { title: "Morning and Evening Adhkar", type: "Dua", date: new Date(Date.now() - 259200000).toISOString() }
      ];
      
      const response = await fetch('/api/personalization/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: MOCK_USER_ID,
          mood: currentMood,
          preferences: mockPreferences,
          history: mockHistory
        }),
      });

      const data = await response.json() as RecommendationsResponse;
      
      if (data.recommendations) {
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get icon based on content type
  const getContentTypeIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'Article': <FileText className="h-5 w-5" />,
      'Video': <Video className="h-5 w-5" />,
      'Quran': <BookOpen className="h-5 w-5" />,
      'Hadith': <BookMarked className="h-5 w-5" />,
      'Dua': <Heart className="h-5 w-5" />,
    };
    
    return iconMap[type] || <FileText className="h-5 w-5" />;
  };

  // Get color based on content type
  const getContentTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'Article': 'bg-blue-100 text-blue-800',
      'Video': 'bg-red-100 text-red-800',
      'Quran': 'bg-green-100 text-green-800',
      'Hadith': 'bg-amber-100 text-amber-800',
      'Dua': 'bg-purple-100 text-purple-800',
    };
    
    return colorMap[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Content Recommendations</CardTitle>
        <CardDescription>
          Personalized Islamic content based on your current mood and preferences
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">How are you feeling right now?</h3>
          <textarea
            value={currentMood}
            onChange={(e) => setCurrentMood(e.target.value)}
            placeholder="Describe your current mood and spiritual state... (e.g., 'I'm feeling anxious about work and finding it hard to focus on prayer')"
            className="w-full min-h-[100px] p-3 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          
          <Button 
            onClick={handleGetRecommendations} 
            disabled={isLoading || !currentMood.trim()} 
            className="w-full"
          >
            {isLoading ? 'Finding recommendations...' : 'Get Personalized Recommendations'}
          </Button>
        </div>
        
        {recommendations.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Your Recommendations</h3>
            
            <div className="grid grid-cols-1 gap-4">
              {recommendations.map((recommendation, index) => (
                <Card key={index} className="border border-slate-200">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                      <Badge className={getContentTypeColor(recommendation.type)}>
                        <div className="flex items-center gap-1">
                          {getContentTypeIcon(recommendation.type)}
                          <span>{recommendation.type}</span>
                        </div>
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <p className="text-sm text-slate-600 mb-4">{recommendation.description}</p>
                    
                    <div className="bg-slate-50 p-3 rounded-md">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 text-primary">
                          <Heart className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-primary mb-1">Why this is recommended for you:</h4>
                          <p className="text-sm text-slate-600">{recommendation.reason}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <Clock className="h-4 w-4 mr-2" />
                      Save for Later
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentRecommendations; 