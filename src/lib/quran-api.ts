// API service for fetching Quran verses

// Define the response type from the Quran API
interface QuranAPIResponse {
  code: number;
  status: string;
  data: {
    number: number;
    text: string;
    translation: {
      en: string;
    };
    surah: {
      number: number;
      name: string;
      englishName: string;
      englishNameTranslation: string;
      revelationType: string;
      numberOfAyahs: number;
    };
    numberInSurah: number;
    juz: number;
    manzil: number;
    page: number;
    ruku: number;
    hizbQuarter: number;
    sajda: boolean;
  };
}

/**
 * Fetch a specific verse from the Quran
 * @param surahNumber The surah number (1-114)
 * @param verseNumber The verse number within the surah
 * @returns The verse text and translation, or null if not found
 */
export const fetchQuranVerse = async (
  surahNumber: number,
  verseNumber: number
): Promise<{ arabic: string; translation: string } | null> => {
  try {
    // Using the Alquran.cloud API
    const response = await fetch(
      `https://api.alquran.cloud/v1/ayah/${surahNumber}:${verseNumber}/editions/quran-simple,en.asad`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch verse: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.code === 200 && data.data && Array.isArray(data.data)) {
      // Extract Arabic text and English translation
      const arabicData = data.data[0];
      const translationData = data.data[1];
      
      return {
        arabic: arabicData.text,
        translation: translationData.text
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching Quran verse:', error);
    return null;
  }
};

/**
 * Fallback function to handle API failures
 * Returns a placeholder message when the API is unavailable
 */
export const getPlaceholderVerseText = (surahNumber: number, verseNumber: number): string => {
  return `[Please enter the text of Surah ${surahNumber}, Verse ${verseNumber} here]`;
}; 