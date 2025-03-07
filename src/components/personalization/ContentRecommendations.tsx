'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { BookOpen, Video, FileText, Heart, BookMarked, Clock, X, Check, Bookmark, Search } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

// Types
interface ContentRecommendation {
  id: string;
  user_id: string | null;
  content_type: string;
  content_id: string;
  relevance_score: number;
  status: 'new' | 'viewed' | 'saved' | 'dismissed';
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  imageUrl?: string;
  reason?: string;
}

const ContentRecommendations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hadithLoading, setHadithLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([]);
  const [currentMood, setCurrentMood] = useState('');
  const [hadithKeywords, setHadithKeywords] = useState('');
  const supabase = createClientComponentClient();

  // Fetch recommendations from the database
  const fetchRecommendations = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('content_recommendations')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'new')
        .order('relevance_score', { ascending: false });

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to fetch recommendations');
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  // Get recommendations based on current mood
  const handleGetRecommendations = async () => {
    if (!currentMood.trim()) return;
    
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to get personalized recommendations');
        return;
      }

      // Call your API to get recommendations
      const response = await fetch('/api/personalization/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          mood: currentMood,
        }),
      });

      const data = await response.json();
      
      if (data.recommendations) {
        // Store recommendations in the database
        const { error } = await supabase
          .from('content_recommendations')
          .insert(
            data.recommendations.map((rec: any) => ({
              user_id: session.user.id,
              content_type: rec.type,
              content_id: rec.id,
              relevance_score: rec.relevanceScore || 0.5,
              title: rec.title,
              description: rec.description,
              imageUrl: rec.imageUrl,
              reason: rec.reason,
            }))
          );

        if (error) throw error;
        
        // Refresh recommendations
        await fetchRecommendations();
        
        toast.success('New recommendations generated!');
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast.error('Failed to generate recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  // Get hadith recommendations based on keywords
  const handleGetHadithInsights = async () => {
    const keywords = hadithKeywords.trim();
    
    // Validate that we have at least 3 words
    const wordCount = keywords.split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount < 3) {
      toast.error('Please enter at least 3 keywords for better hadith recommendations');
      return;
    }
    
    setHadithLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to get hadith insights');
        return;
      }

      // Call API to get hadith recommendations
      const response = await fetch('/api/personalization/hadith-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          keywords: keywords,
        }),
      });

      const data = await response.json();
      
      if (data.recommendations) {
        // Store hadith recommendations in the database
        const { error } = await supabase
          .from('content_recommendations')
          .insert(
            data.recommendations.map((rec: any) => ({
              user_id: session.user.id,
              content_type: 'hadith',
              content_id: rec.id,
              relevance_score: rec.relevanceScore || 0.5,
              title: rec.title,
              description: rec.description,
              imageUrl: rec.imageUrl,
              reason: `Related to your keywords: ${keywords}`,
            }))
          );

        if (error) throw error;
        
        // Refresh recommendations
        await fetchRecommendations();
        
        // Clear the input field after successful generation
        setHadithKeywords('');
        
        toast.success('Hadith insights generated based on your keywords!');
      }
    } catch (error) {
      console.error('Error generating hadith insights:', error);
      toast.error('Failed to generate hadith insights');
    } finally {
      setHadithLoading(false);
    }
  };

  // Update recommendation status
  const handleUpdateStatus = async (id: string, status: 'viewed' | 'saved' | 'dismissed') => {
    try {
      const { error } = await supabase
        .from('content_recommendations')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setRecommendations(prev => 
        prev.filter(rec => rec.id !== id)
      );

      toast.success(`Recommendation ${status}`);
    } catch (error) {
      console.error('Error updating recommendation:', error);
      toast.error('Failed to update recommendation');
    }
  };

  // Get icon based on content type
  const getContentTypeIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'article': <FileText className="h-5 w-5" />,
      'video': <Video className="h-5 w-5" />,
      'quran': <BookOpen className="h-5 w-5" />,
      'hadith': <BookMarked className="h-5 w-5" />,
      'dua': <Heart className="h-5 w-5" />,
    };
    
    return iconMap[type.toLowerCase()] || <FileText className="h-5 w-5" />;
  };

  // Get color based on content type
  const getContentTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'article': 'bg-blue-100 text-blue-800',
      'video': 'bg-red-100 text-red-800',
      'quran': 'bg-green-100 text-green-800',
      'hadith': 'bg-amber-100 text-amber-800',
      'dua': 'bg-purple-100 text-purple-800',
    };
    
    return colorMap[type.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-8">
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
        </CardContent>
      </Card>
      
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Hadith Insights</CardTitle>
          <CardDescription>
            Discover relevant hadith based on simple keywords - no prior knowledge needed
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">What topics are you interested in?</h3>
            <div className="space-y-2">
              <textarea
                value={hadithKeywords}
                onChange={(e) => setHadithKeywords(e.target.value)}
                placeholder="Enter at least 3 keywords (e.g., 'kindness family patience' or 'prayer focus concentration')"
                className="w-full min-h-[80px] p-3 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-slate-500">Enter at least 3 keywords separated by spaces to find relevant hadith.</p>
            </div>
            
            <Button 
              onClick={handleGetHadithInsights}
              disabled={hadithLoading || hadithKeywords.trim().split(/\s+/).filter(word => word.length > 0).length < 3}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              {hadithLoading ? 'Searching hadith...' : 'Generate Hadith Insights'}
              <Search className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {recommendations.length > 0 && (
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Your Recommendations</CardTitle>
            <CardDescription>
              Content tailored to your interests and needs
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {recommendations.map((recommendation) => (
                <Card key={recommendation.id} className="border border-slate-200 hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                        <Badge className={getContentTypeColor(recommendation.content_type)}>
                          <div className="flex items-center gap-1">
                            {getContentTypeIcon(recommendation.content_type)}
                            <span className="capitalize">{recommendation.content_type}</span>
                          </div>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleUpdateStatus(recommendation.id, 'saved')}
                        >
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:text-destructive"
                          onClick={() => handleUpdateStatus(recommendation.id, 'dismissed')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <p className="text-sm text-slate-600 mb-4">{recommendation.description}</p>
                    
                    {recommendation.reason && (
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
                    )}
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleUpdateStatus(recommendation.id, 'viewed')}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Mark as Viewed
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContentRecommendations; 