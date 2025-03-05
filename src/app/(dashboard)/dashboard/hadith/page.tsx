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
import { BentoCard, BentoGrid } from '@/components/ui/bento';
import { useLanguage } from '@/contexts/LanguageContext';

type HadithInsight = {
  id: string;
  user_id: string;
  collection: string;
  number: number;
  text: string;
  insight: string;
  created_at: string;
  is_favorite: boolean;
  image_url?: string;
};

const hadithCollections = [
  { id: 'bukhari', name: 'Sahih Bukhari' },
  { id: 'muslim', name: 'Sahih Muslim' },
  { id: 'abudawud', name: 'Sunan Abu Dawud' },
  { id: 'tirmidhi', name: 'Jami at-Tirmidhi' },
  { id: 'nasai', name: 'Sunan an-Nasai' },
  { id: 'ibnmajah', name: 'Sunan Ibn Majah' },
  { id: 'malik', name: 'Muwatta Malik' },
  { id: 'other', name: 'Other' },
];

export default function HadithInsightsPage() {
  const [insights, setInsights] = useState<HadithInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState('bukhari');
  const [hadithNumber, setHadithNumber] = useState('');
  const [hadithText, setHadithText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
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

      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      // Generate insight using OpenAI with the selected language
      const number = parseInt(hadithNumber);
      const insight = await generateHadithInsight(selectedCollection, number, hadithText, insightLanguage);

      if (!insight) {
        throw new Error('Failed to generate insight');
      }

      // Save to database
      const { data, error } = await supabase.from('hadith_insights').insert({
        user_id: userData.user.id,
        collection: selectedCollection,
        number,
        text: hadithText,
        insight,
        created_at: new Date().toISOString(),
        is_favorite: false,
        language: insightLanguage,
      }).select();

      if (error) throw error;

      // Update local state
      if (data && data.length > 0) {
        setInsights([data[0], ...insights]);

        // Automatically generate image
        setIsGeneratingImage(true);
        try {
          const imageUrl = await generateHadithPoster(
            selectedCollection,
            number,
            hadithText
          );

          if (imageUrl) {
            // Save the generated content to the database
            await supabase.from('ai_generated_content').insert({
              user_id: userData.user.id,
              content_type: 'hadith_poster',
              content: imageUrl,
              prompt: `Hadith from ${getCollectionName(selectedCollection)}, Number ${number}`,
              created_at: new Date().toISOString(),
              is_favorite: false,
            });

            // Update the hadith insight with the image URL
            await supabase
              .from('hadith_insights')
              .update({ image_url: imageUrl })
              .eq('id', data[0].id);

            // Update local state
            setInsights(prevInsights =>
              prevInsights.map(item =>
                item.id === data[0].id ? { ...item, image_url: imageUrl } : item
              )
            );

            setGeneratedImageUrl(imageUrl);
          }
        } catch (imageError) {
          console.error('Error generating image:', imageError);
        } finally {
          setIsGeneratingImage(false);
        }
      }

      // Clear form
      setSelectedCollection('bukhari');
      setHadithNumber('');
      setHadithText('');
    } catch (error: any) {
      setError(error.message || 'An error occurred while generating insight');
    } finally {
      setIsGenerating(false);
    }
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

      setGeneratedImageUrl(imageUrl);

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

  const getCollectionName = (collectionId: string) => {
    const collection = hadithCollections.find((c) => c.id === collectionId);
    return collection ? collection.name : 'Unknown Collection';
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
    <div className="space-y-6">
      <div>
        <div className="flex items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Hadith Insights</h1>
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
        <p className="mt-1 text-gray-600">Explore and reflect on the teachings of the Prophet Muhammad (ﷺ)</p>
      </div>

      <BentoCard name="Generate New Insight" Icon={FaBook}>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="collection" className="block text-sm font-medium text-gray-700">
              Hadith Collection
            </label>
            <select
              id="collection"
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
            >
              {hadithCollections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="hadithNumber" className="block text-sm font-medium text-gray-700">
              Hadith Number
            </label>
            <input
              id="hadithNumber"
              type="number"
              min="1"
              value={hadithNumber}
              onChange={(e) => setHadithNumber(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
              placeholder="e.g., 1"
            />
          </div>
          <div className="md:col-span-3">
            <label htmlFor="hadithText" className="block text-sm font-medium text-gray-700">
              Hadith Text
            </label>
            <textarea
              id="hadithText"
              rows={3}
              value={hadithText}
              onChange={(e) => setHadithText(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
              placeholder="Enter the Hadith text..."
            ></textarea>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleGenerateInsight}
            disabled={isGenerating}
            className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-70"
          >
            {isGenerating ? (
              <>
                <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FaSearch className="mr-2 h-4 w-4" />
                Generate Insight
              </>
            )}
          </button>
        </div>
      </BentoCard>

      {generatedImageUrl && (
        <BentoCard name="Generated Poster" Icon={FaImage}>
          <div className="mt-4 flex justify-center">
            <div className="relative h-80 w-80 overflow-hidden rounded-lg">
              <Image
                src={generatedImageUrl}
                alt="Generated Hadith Poster"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <a
              href={generatedImageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Download Image
            </a>
          </div>
        </BentoCard>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Your Insights</h2>

        {insights.length === 0 ? (
          <BentoCard
            name="No insights yet"
            Icon={FaBook}
            description="Generate your first Hadith insight to start your collection"
          />
        ) : (
          <BentoGrid>
            {insights.map((insight) => (
              <BentoCard
                key={insight.id}
                name={`${getCollectionName(insight.collection)}, No. ${insight.number}`}
                description={new Date(insight.created_at).toLocaleDateString()}
              >
                <div className="absolute top-4 right-4 flex space-x-2 z-20">
                  <button
                    onClick={() => handleToggleFavorite(insight.id, insight.is_favorite)}
                    className="rounded-full p-2 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                  >
                    {insight.is_favorite ? (
                      <FaStar className="h-5 w-5" />
                    ) : (
                      <FaRegStar className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <div className="mt-4 max-h-[32rem] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                  {insight.image_url && (
                    <div className="mb-4 relative">
                      <div className="relative h-48 w-full overflow-hidden rounded-lg">
                        <Image
                          src={insight.image_url || ''}
                          alt={`Generated image for ${getCollectionName(insight.collection)} Hadith #${insight.number}`}
                          fill
                          className="object-cover"
                        />
                        <a
                          href={insight.image_url || ''}
                          download={`hadith-${insight.collection}-${insight.number}.png`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute bottom-2 right-2 inline-flex items-center rounded-md bg-black/50 px-2.5 py-1.5 text-sm font-medium text-white hover:bg-black/70 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            const link = document.createElement('a');
                            link.href = insight.image_url || '';
                            link.download = `hadith-${insight.collection}-${insight.number}.png`;
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
                  )}
                  <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/30">
                    <p className="text-gray-800 dark:text-gray-200">{insight.text}</p>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 flex items-center justify-between">
                      <span>Insight:</span>
                      <button
                        onClick={() => handleCopyInsight(insight.id, insight.insight)}
                        className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
                        aria-label="Copy insight to clipboard"
                      >
                        {copiedInsightId === insight.id ? (
                          <FaCheck className="h-4 w-4 text-green-500" />
                        ) : (
                          <FaCopy className="h-4 w-4" />
                        )}
                      </button>
                    </h4>
                    <p className="mt-2 text-gray-700 dark:text-gray-300">{insight.insight}</p>
                  </div>
                </div>
              </BentoCard>
            ))}
          </BentoGrid>
        )}
      </div>
    </div>
  );
} 