'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Loader2, RefreshCw, BookOpen, Heart, Share2, Save } from 'lucide-react';
import { hadithCollections, getCollectionName } from '@/lib/constants/hadith';
import { generateHadithInsight } from '@/lib/openai/client';
import { generateHadithPoster } from '@/lib/falai/client';
import { supabase } from '@/lib/supabase/client';

interface RandomHadith {
  collection: string;
  number: number;
  text: string;
  insight?: string;
  imageUrl?: string;
}

const RandomHadithCollection = () => {
  const [randomHadiths, setRandomHadiths] = useState<RandomHadith[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Generate a random number between min and max
  const getRandomNumber = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Generate random hadiths
  const generateRandomHadiths = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // For demo purposes, we'll generate 3 random hadiths
      // In a real app, you would fetch these from an actual hadith API
      const mockHadiths = [
        {
          collection: selectedCollection || hadithCollections[getRandomNumber(0, hadithCollections.length - 1)].id,
          number: getRandomNumber(1, 100),
          text: "The Prophet (ﷺ) said, 'The best among you are those who learn the Quran and teach it to others.'",
        },
        {
          collection: selectedCollection || hadithCollections[getRandomNumber(0, hadithCollections.length - 1)].id,
          number: getRandomNumber(1, 100),
          text: "The Prophet (ﷺ) said, 'None of you truly believes until he loves for his brother what he loves for himself.'",
        },
        {
          collection: selectedCollection || hadithCollections[getRandomNumber(0, hadithCollections.length - 1)].id,
          number: getRandomNumber(1, 100),
          text: "The Prophet (ﷺ) said, 'The strong person is not the one who can wrestle others down. The strong person is the one who can control himself when angry.'",
        }
      ];

      // Generate insights and images for each hadith
      const hadithsWithInsights = await Promise.all(
        mockHadiths.map(async (hadith) => {
          const insight = await generateHadithInsight(
            hadith.collection,
            hadith.number,
            hadith.text
          );

          const imageUrl = await generateHadithPoster(
            hadith.collection,
            hadith.number,
            hadith.text
          );

          return {
            ...hadith,
            insight,
            imageUrl
          };
        })
      );

      setRandomHadiths(hadithsWithInsights);
    } catch (error: any) {
      setError(error.message || 'An error occurred while generating random hadiths');
    } finally {
      setIsLoading(false);
    }
  };

  // Save hadith to favorites
  const saveToFavorites = async (hadith: RandomHadith) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      await supabase.from('hadith_insights').insert({
        user_id: userData.user.id,
        collection: hadith.collection,
        number: hadith.number,
        text: hadith.text,
        insight: hadith.insight,
        image_url: hadith.imageUrl,
        created_at: new Date().toISOString(),
        is_favorite: true
      });

      // Show success message (you can implement a toast notification here)
    } catch (error) {
      console.error('Error saving to favorites:', error);
    }
  };

  // Share hadith
  const shareHadith = async (hadith: RandomHadith) => {
    try {
      await navigator.share({
        title: `Hadith from ${getCollectionName(hadith.collection)}`,
        text: `${hadith.text}\n\nInsight: ${hadith.insight}`,
        url: window.location.href
      });
    } catch (error) {
      console.error('Error sharing hadith:', error);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Random Hadith Collection</CardTitle>
        <CardDescription>
          Discover random hadiths from various collections and reflect on their teachings
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            className="flex h-10 w-full sm:w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">All Collections</option>
            {hadithCollections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>

          <Button
            onClick={generateRandomHadiths}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Generate Random Hadiths
          </Button>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {randomHadiths.map((hadith, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {getCollectionName(hadith.collection)}
                  </CardTitle>
                  <Badge variant="secondary">
                    <BookOpen className="h-4 w-4 mr-1" />
                    Hadith #{hadith.number}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {hadith.imageUrl && (
                  <div className="relative h-48 w-full overflow-hidden rounded-lg">
                    <img
                      src={hadith.imageUrl}
                      alt={`Generated image for ${getCollectionName(hadith.collection)} Hadith #${hadith.number}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}

                <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/30">
                  <p className="text-gray-800 dark:text-gray-200">{hadith.text}</p>
                </div>

                {hadith.insight && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Insight:</h4>
                    <p className="text-gray-700 dark:text-gray-300">{hadith.insight}</p>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareHadith(hadith)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => saveToFavorites(hadith)}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RandomHadithCollection; 