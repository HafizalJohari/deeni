'use client';

import { useState } from 'react';
import { FaRandom, FaBookOpen, FaStar } from 'react-icons/fa';
import { recommendedVerses, getRandomSurah, getRandomVerseFromSurah, QuranSurah, getSurahByNumber } from '@/lib/quran-data';
import { BentoCard } from '@/components/ui/bento';

interface RecommendedVersesPanelProps {
  onSelectVerse: (surahNumber: number, verseNumber: number) => void;
  className?: string;
}

export const RecommendedVersesPanel = ({
  onSelectVerse,
  className = '',
}: RecommendedVersesPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRandomVerse = () => {
    const randomSurah = getRandomSurah();
    const randomVerse = getRandomVerseFromSurah(randomSurah.number);
    onSelectVerse(randomSurah.number, randomVerse);
  };

  const handleSelectRecommended = (surah: number, verse: number) => {
    onSelectVerse(surah, verse);
  };

  return (
    <BentoCard
      name="Need inspiration?"
      className={className}
    >
      <div className="mt-2 flex justify-end">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm font-medium text-green-600 hover:text-green-700 z-20"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 z-20">
        <button
          onClick={handleRandomVerse}
          className="flex items-center justify-center rounded-md border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
        >
          <FaRandom className="mr-2 h-4 w-4" />
          Random Verse
        </button>
        
        <button
          onClick={() => {
            const surah = getRandomSurah();
            onSelectVerse(surah.number, 1);
          }}
          className="flex items-center justify-center rounded-md border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
        >
          <FaBookOpen className="mr-2 h-4 w-4" />
          Random Surah
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 z-20">
          <h4 className="mb-2 text-sm font-medium text-gray-700">Popular Verses:</h4>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {recommendedVerses.map((rec, index) => {
              const surah = getSurahByNumber(rec.surah);
              return (
                <button
                  key={index}
                  onClick={() => handleSelectRecommended(rec.surah, rec.verse)}
                  className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    <FaStar className="mr-2 h-3 w-3 text-yellow-500" />
                    <span>{rec.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {surah?.name} {rec.verse}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </BentoCard>
  );
}; 