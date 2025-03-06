'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { generateHadithInsight } from '@/lib/openai/client';
import { generateHadithPoster } from '@/lib/falai/client';
import { FaSearch, FaStar, FaRegStar, FaBook, FaSpinner, FaImage, FaCopy, FaCheck } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { hadithGuidance, getRandomGuidance } from '@/lib/islamic-guidance';
import Tooltip from '@/components/ui/Tooltip';
import { useLanguage } from '@/contexts/LanguageContext';
import { hadithCollections, getCollectionName } from '@/lib/constants/hadith';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Shuffle, BookOpen, Info } from 'lucide-react';

type HadithInsight = {
  id: string;
  user_id: string;
  collection: string;
  number: number;
  text: string;
  insight: string;
  created_at: string;
  is_favorite: boolean;
  image_url?: string | null;
  language?: string;
};

const ImageDisplay = ({ imageUrl, collection, number }: { imageUrl: string, collection: string, number: number }) => (
  <div className="mb-4 relative">
    <div className="relative h-48 w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
      <Image
        src={imageUrl}
        alt={`Generated image for ${getCollectionName(collection)} Hadith #${number}`}
        fill
        className="object-cover transition-opacity duration-300"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={false}
        loading="lazy"
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          img.src = 'https://placehold.co/600x400/f8fafc/475569?text=Image+Unavailable';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      <a
        href={imageUrl}
        download={`hadith-${collection}-${number}.png`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 inline-flex items-center rounded-md bg-black/50 px-2.5 py-1.5 text-sm font-medium text-white hover:bg-black/70 transition-colors"
        onClick={(e) => {
          e.preventDefault();
          const link = document.createElement('a');
          link.href = imageUrl;
          link.download = `hadith-${collection}-${number}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }}
      >
        <FaImage className="mr-1.5 h-4 w-4" />
        Download
      </a>
    </div>
  </div>
);

export default function HadithInsightsPage() {
  const [insights, setInsights] = useState<HadithInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [hadithNumber, setHadithNumber] = useState('');
  const [hadithText, setHadithText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedInsightId, setCopiedInsightId] = useState<string | null>(null);
  const { insightLanguage } = useLanguage();

  const randomHadithGuidance = getRandomGuidance(hadithGuidance);

  // Extract fetchInsights outside of useEffect so it can be called elsewhere
  const fetchInsights = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('hadith_insights')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error fetching Hadith insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleGenerateInsight = async () => {
    if (!selectedCollection || !hadithNumber || !hadithText) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const number = parseInt(hadithNumber);
      const insight = await generateHadithInsight(selectedCollection, number, hadithText, insightLanguage);

      if (!insight) {
        throw new Error('Failed to generate insight');
      }

      // Save to database
      const { data, error: dbError } = await supabase.from('hadith_insights').insert({
        user_id: userData.user.id,
        collection: selectedCollection,
        number,
        text: hadithText,
        insight,
        created_at: new Date().toISOString(),
        is_favorite: false,
        language: insightLanguage,
      }).select();

      if (dbError) throw dbError;

      // Generate and save image
      if (data && data.length > 0) {
        const imageUrl = await generateHadithPoster(selectedCollection, number, hadithText);

        if (imageUrl) {
          await supabase.from('hadith_insights')
            .update({ image_url: imageUrl })
            .eq('id', data[0].id);
        }
      }

      // Clear form
      setSelectedCollection('');
      setHadithNumber('');
      setHadithText('');
      
    } catch (error: any) {
      setError(error.message || 'An error occurred while generating insight');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRandomHadith = async () => {
    const randomCollection = hadithCollections[Math.floor(Math.random() * hadithCollections.length)];
    const randomNumber = Math.floor(Math.random() * 100) + 1;
    setSelectedCollection(randomCollection.id);
    setHadithNumber(randomNumber.toString());
  };

  const handleGenerateImage = async (insight: HadithInsight) => {
    try {
      setIsGeneratingImage(true);
      setError(null);

      // Generate image using Fal.AI
      const imageUrl = await generateHadithPoster(
        insight.collection,
        insight.number,
        insight.text
      );

      if (!imageUrl) {
        throw new Error('Failed to generate image');
      }

      // Save the generated content to the database
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Update the hadith insight with the image URL
      const { error: updateError } = await supabase
        .from('hadith_insights')
        .update({ image_url: imageUrl })
        .eq('id', insight.id);

      if (updateError) throw updateError;

      // Update local state
      setInsights(
        insights.map((item) =>
          item.id === insight.id ? { ...item, image_url: imageUrl } : item
        )
      );

      // Also save to ai_generated_content table
      await supabase.from('ai_generated_content').insert({
        user_id: userData.user.id,
        content_type: 'hadith_poster',
        content: imageUrl,
        prompt: `Hadith from ${getCollectionName(insight.collection)}, Number ${insight.number}`,
        created_at: new Date().toISOString(),
        is_favorite: false,
      });
    } catch (error: any) {
      setError(error.message || 'An error occurred while generating image');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleToggleFavorite = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('hadith_insights')
        .update({ is_favorite: !currentValue })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setInsights(
        insights.map((insight) =>
          insight.id === id ? { ...insight, is_favorite: !currentValue } : insight
        )
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleCopyInsight = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedInsightId(id);
      setTimeout(() => setCopiedInsightId(null), 2000);
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Hadith Insights</h1>
          <Tooltip
            content={
              <div>
                <h3 className="font-bold mb-1">{randomHadithGuidance.title}</h3>
                <p>{randomHadithGuidance.content}</p>
              </div>
            }
            source={randomHadithGuidance.source}
          />
        </div>
        <p className="text-muted-foreground">
          Explore and reflect on the teachings of the Prophet Muhammad (ﷺ)
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Need inspiration?
              <Info className="h-4 w-4 text-muted-foreground" />
            </h2>
            <Button variant="link" className="text-green-600">
              Show more
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-24 text-left flex items-center justify-start gap-4 px-4 hover:border-green-600/20 hover:bg-green-600/10"
              onClick={handleRandomHadith}
            >
              <Shuffle className="h-6 w-6 flex-shrink-0" />
              <div>
                <div className="font-semibold">Random Hadith</div>
                <div className="text-sm text-muted-foreground">
                  Get a random hadith for reflection
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-24 text-left flex items-center justify-start gap-4 px-4 hover:border-green-600/20 hover:bg-green-600/10"
              onClick={() => {/* Implement random collection */}}
            >
              <BookOpen className="h-6 w-6 flex-shrink-0" />
              <div>
                <div className="font-semibold">Random Collection</div>
                <div className="text-sm text-muted-foreground">
                  Explore a random hadith collection
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Generate New Insight
          </h2>

          <div className="grid gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Collection</label>
                <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Collection" />
                  </SelectTrigger>
                  <SelectContent>
                    {hadithCollections.map((collection) => (
                      <SelectItem key={collection.id} value={collection.id}>
                        {collection.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Hadith Number</label>
                <Select value={hadithNumber} onValueChange={setHadithNumber}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Number" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 100 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Verse Text</label>
              <Textarea
                placeholder="Enter the Hadith text..."
                value={hadithText}
                onChange={(e) => setHadithText(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleGenerateInsight}
                disabled={isGenerating}
                className="min-w-[140px] bg-green-600 hover:bg-green-700"
              >
                {isGenerating ? 'Generating...' : 'Generate Insight'}
                <Info className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {insights.length > 0 && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your Insights</h2>
            <p className="text-sm text-muted-foreground">{insights.length} insights generated</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {insights.map((insight) => (
              <Card key={insight.id} className="overflow-hidden flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      {getCollectionName(insight.collection)}
                    </CardTitle>
                    <Badge variant="secondary">
                      <BookOpen className="h-4 w-4 mr-1" />
                      Hadith #{insight.number}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 flex-grow">
                  {insight.image_url && (
                    <div className="relative h-40 w-full overflow-hidden rounded-lg">
                      <img
                        src={insight.image_url}
                        alt={`Generated image for ${getCollectionName(insight.collection)} Hadith #${insight.number}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}

                  <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/30">
                    <p className="text-gray-800 dark:text-gray-200 text-sm">{insight.text}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Insight:</h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{insight.insight}</p>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-end gap-2 mt-auto border-t pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyInsight(insight.id, insight.insight)}
                  >
                    {copiedInsightId === insight.id ? (
                      <FaCheck className="h-4 w-4 mr-2" />
                    ) : (
                      <FaCopy className="h-4 w-4 mr-2" />
                    )}
                    Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleFavorite(insight.id, insight.is_favorite)}
                  >
                    {insight.is_favorite ? (
                      <FaStar className="h-4 w-4 mr-2 text-yellow-500" />
                    ) : (
                      <FaRegStar className="h-4 w-4 mr-2" />
                    )}
                    {insight.is_favorite ? 'Favorited' : 'Favorite'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 