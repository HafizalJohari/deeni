'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { generateQuranInsight } from '@/lib/openai/client';
import { generateQuranAyahPoster } from '@/lib/falai/client';
import { FaSearch, FaStar, FaRegStar, FaQuran, FaSpinner, FaImage, FaLightbulb, FaCopy, FaCheck } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { quranGuidance, getRandomGuidance } from '@/lib/islamic-guidance';
import Tooltip from '@/components/ui/Tooltip';
import { QuranSurahDropdown } from '@/components/ui/QuranSurahDropdown';
import { QuranSurah, getMaxVersesForSurah } from '@/lib/quran-data';
import { RecommendedVersesPanel } from '@/components/ui/RecommendedVersesPanel';
import { fetchQuranVerse, getPlaceholderVerseText } from '@/lib/quran-api';
import { BentoCard, BentoGrid } from '@/components/ui/bento';
import { useLanguage } from '@/contexts/LanguageContext';

type QuranInsight = {
  id: string;
  user_id: string;
  surah: number;
  ayah: number;
  text: string;
  insight: string;
  created_at: string;
  is_favorite: boolean;
  image_url?: string;
};

export default function QuranInsightsPage() {
  const [insights, setInsights] = useState<QuranInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchSurah, setSearchSurah] = useState('');
  const [searchAyah, setSearchAyah] = useState('');
  const [quranText, setQuranText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [maxVerses, setMaxVerses] = useState(0);
  const [selectedSurah, setSelectedSurah] = useState<QuranSurah | null>(null);
  const [isFetchingVerse, setIsFetchingVerse] = useState(false);
  const [verseTranslation, setVerseTranslation] = useState<string | null>(null);
  const [copiedInsightId, setCopiedInsightId] = useState<string | null>(null);
  const { insightLanguage } = useLanguage();

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        const { data, error } = await supabase
          .from('quran_insights')
          .select('*')
          .eq('user_id', userData.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setInsights(data || []);
      } catch (error) {
        console.error('Error fetching Quran insights:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, []);

  // Update max verses when surah changes
  useEffect(() => {
    if (searchSurah) {
      const surahNumber = parseInt(searchSurah);
      const maxVersesForSurah = getMaxVersesForSurah(surahNumber);
      setMaxVerses(maxVersesForSurah);
      
      // Reset ayah if it's greater than the max verses for the selected surah
      if (searchAyah && parseInt(searchAyah) > maxVersesForSurah) {
        setSearchAyah('');
      }
    } else {
      setMaxVerses(0);
    }
  }, [searchSurah, searchAyah]);

  // Fetch verse text when surah and ayah are selected
  useEffect(() => {
    const fetchVerseText = async () => {
      if (searchSurah && searchAyah) {
        try {
          setIsFetchingVerse(true);
          setError(null);
          
          const surahNum = parseInt(searchSurah);
          const ayahNum = parseInt(searchAyah);
          
          const verseData = await fetchQuranVerse(surahNum, ayahNum);
          
          if (verseData) {
            setQuranText(verseData.arabic);
            setVerseTranslation(verseData.translation);
          } else {
            // If API fails, set a placeholder
            setQuranText(getPlaceholderVerseText(surahNum, ayahNum));
            setVerseTranslation(null);
          }
        } catch (error) {
          console.error('Error fetching verse:', error);
          // Set placeholder on error
          const surahNum = parseInt(searchSurah);
          const ayahNum = parseInt(searchAyah);
          setQuranText(getPlaceholderVerseText(surahNum, ayahNum));
          setVerseTranslation(null);
        } finally {
          setIsFetchingVerse(false);
        }
      }
    };

    fetchVerseText();
  }, [searchSurah, searchAyah]);

  const handleSurahSelect = (surah: QuranSurah) => {
    setSelectedSurah(surah);
    setMaxVerses(surah.totalVerses);
    // Reset ayah when surah changes
    setSearchAyah('');
    setQuranText('');
    setVerseTranslation(null);
  };

  const handleVerseSelect = (surahNumber: number, verseNumber: number) => {
    // Convert to strings for the form inputs
    setSearchSurah(surahNumber.toString());
    setSearchAyah(verseNumber.toString());
    
    // Set the selected surah object
    const surah = surahNumber ? { 
      number: surahNumber, 
      name: `Surah ${surahNumber}`, 
      totalVerses: getMaxVersesForSurah(surahNumber) 
    } : null;
    
    setSelectedSurah(surah);
  };

  const handleGenerateInsight = async () => {
    if (!searchSurah || !searchAyah || !quranText) {
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
      const surahNum = parseInt(searchSurah);
      const ayahNum = parseInt(searchAyah);
      const insight = await generateQuranInsight(surahNum, ayahNum, quranText, insightLanguage);

      if (!insight) {
        throw new Error('Failed to generate insight');
      }

      // Save to database
      const { data, error } = await supabase.from('quran_insights').insert({
        user_id: userData.user.id,
        surah: surahNum,
        ayah: ayahNum,
        text: quranText,
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
          const imageUrl = await generateQuranAyahPoster(
            surahNum,
            ayahNum,
            quranText,
            insight.substring(0, 100)
          );

          if (imageUrl) {
            // Save the generated content to the database
            await supabase.from('ai_generated_content').insert({
              user_id: userData.user.id,
              content_type: 'quran_poster',
              content: imageUrl,
              prompt: `Quran Surah ${surahNum}, Ayah ${ayahNum}`,
              created_at: new Date().toISOString(),
              is_favorite: false,
            });

            // Update the insight with the image URL
            await supabase
              .from('quran_insights')
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
      setSearchSurah('');
      setSearchAyah('');
      setQuranText('');
      setSelectedSurah(null);
      setVerseTranslation(null);
    } catch (error: any) {
      setError(error.message || 'An error occurred while generating insight');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = async (insight: QuranInsight) => {
    try {
      setIsGeneratingImage(true);
      setError(null);

      // Generate image using Fal.AI
      const imageUrl = await generateQuranAyahPoster(
        insight.surah,
        insight.ayah,
        insight.text,
        insight.insight.substring(0, 100) // Use part of the insight as translation
      );

      if (!imageUrl) {
        throw new Error('Failed to generate image');
      }

      setGeneratedImageUrl(imageUrl);

      // Save the generated content to the database
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      await supabase.from('ai_generated_content').insert({
        user_id: userData.user.id,
        content_type: 'quran_poster',
        content: imageUrl,
        prompt: `Quran Surah ${insight.surah}, Ayah ${insight.ayah}`,
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
        .from('quran_insights')
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

  const randomQuranGuidance = getRandomGuidance(quranGuidance);

  // Generate array of verse numbers for the selected surah
  const verseOptions = maxVerses 
    ? Array.from({ length: maxVerses }, (_, i) => i + 1) 
    : [];

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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Quran Insights</h1>
          <Tooltip 
            content={
              <div>
                <h3 className="font-bold mb-1">{randomQuranGuidance.title}</h3>
                <p>{randomQuranGuidance.content}</p>
              </div>
            } 
            source={randomQuranGuidance.source}
          />
        </div>
        <p className="mt-1 text-gray-600">Explore and reflect on verses from the Quran</p>
      </div>

      {/* Recommended Verses Panel */}
      <RecommendedVersesPanel onSelectVerse={handleVerseSelect} />

      <BentoCard name="Generate New Insight" Icon={FaQuran}>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center mb-2">
            <label className="mr-2 font-medium text-gray-700 dark:text-gray-300">Select Surah:</label>
            <Tooltip 
              content="The Quran contains 114 surahs (chapters). Regular reflection on the Quran is recommended as mentioned in Surah Muhammad: 'Then do they not reflect upon the Quran, or are there locks upon their hearts?'" 
              source="Quran: Surah Muhammad 47:24"
              position="right"
            />
          </div>
          <div>
            <label htmlFor="surah" className="block text-sm font-medium text-gray-700">
              Surah
            </label>
            <QuranSurahDropdown 
              value={searchSurah}
              onChange={setSearchSurah}
              onSurahSelect={handleSurahSelect}
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="ayah" className="block text-sm font-medium text-gray-700">
              Ayah Number
            </label>
            <select
              id="ayah"
              value={searchAyah}
              onChange={(e) => setSearchAyah(e.target.value)}
              disabled={!searchSurah || maxVerses === 0}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value="">Select Ayah</option>
              {verseOptions.map((verse) => (
                <option key={verse} value={verse}>
                  {verse}
                </option>
              ))}
            </select>
            {selectedSurah && (
              <p className="mt-1 text-xs text-gray-500">
                {selectedSurah.name} has {selectedSurah.totalVerses} verses
              </p>
            )}
          </div>
          <div className="md:col-span-3">
            <div className="flex items-center justify-between">
              <label htmlFor="quranText" className="block text-sm font-medium text-gray-700">
                Verse Text
              </label>
              {isFetchingVerse && (
                <span className="text-xs text-gray-500 flex items-center">
                  <FaSpinner className="mr-1 h-3 w-3 animate-spin" />
                  Fetching verse...
                </span>
              )}
            </div>
            <textarea
              id="quranText"
              rows={3}
              value={quranText}
              onChange={(e) => setQuranText(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
              placeholder="Enter the Quranic verse text..."
              dir="rtl"
              lang="ar"
            ></textarea>
            
            {verseTranslation && (
              <div className="mt-2 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
                <div className="flex items-start">
                  <FaLightbulb className="mr-2 mt-1 h-3 w-3 text-yellow-500" />
                  <p>{verseTranslation}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <div className="flex items-center">
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
            <Tooltip 
              content="The Prophet (ﷺ) said: 'The best among you are those who learn the Quran and teach it to others.'" 
              source="Hadith: Sahih Bukhari"
              position="bottom"
            />
          </div>
        </div>
      </BentoCard>

      {generatedImageUrl && (
        <BentoCard name="Generated Poster" Icon={FaImage}>
          <div className="mt-4 flex justify-center">
            <div className="relative h-80 w-80 overflow-hidden rounded-lg">
              <Image
                src={generatedImageUrl}
                alt="Generated Quran Poster"
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
            Icon={FaQuran}
            description="Generate your first Quranic insight to start your collection"
          />
        ) : (
          <BentoGrid>
            {insights.map((insight) => (
              <BentoCard
                key={insight.id}
                name={`Surah ${insight.surah}, Ayah ${insight.ayah}`}
                description={new Date(insight.created_at).toLocaleDateString()}
              >
                <div className="absolute top-4 right-4 flex space-x-2 z-20">
                  <button
                    onClick={() => handleToggleFavorite(insight.id, insight.is_favorite)}
                    className="rounded-full p-2 text-yellow-500 hover:bg-yellow-50"
                  >
                    {insight.is_favorite ? (
                      <FaStar className="h-5 w-5" />
                    ) : (
                      <FaRegStar className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <div className="mt-4 max-h-[32rem] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {insight.image_url && (
                    <div className="mb-4 relative">
                      <div className="relative h-48 w-full overflow-hidden rounded-lg">
                        <Image
                          src={insight.image_url}
                          alt={`Generated image for Surah ${insight.surah}, Ayah ${insight.ayah}`}
                          fill
                          className="object-cover"
                        />
                        <a
                          href={insight.image_url}
                          download={`quran-surah-${insight.surah}-ayah-${insight.ayah}.png`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute bottom-2 right-2 inline-flex items-center rounded-md bg-black/50 px-2.5 py-1.5 text-sm font-medium text-white hover:bg-black/70 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            const link = document.createElement('a');
                            link.href = insight.image_url;
                            link.download = `quran-surah-${insight.surah}-ayah-${insight.ayah}.png`;
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
                  <div className="rounded-lg bg-green-50 p-4">
                    <p className="text-gray-800" dir="rtl" lang="ar">{insight.text}</p>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-md font-medium text-gray-900 flex items-center justify-between">
                      <span>Insight:</span>
                      <button
                        onClick={() => handleCopyInsight(insight.id, insight.insight)}
                        className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        aria-label="Copy insight to clipboard"
                      >
                        {copiedInsightId === insight.id ? (
                          <FaCheck className="h-4 w-4 text-green-500" />
                        ) : (
                          <FaCopy className="h-4 w-4" />
                        )}
                      </button>
                    </h4>
                    <p className="mt-2 text-gray-700">{insight.insight}</p>
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