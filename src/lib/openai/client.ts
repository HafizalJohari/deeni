import { SupportedLanguage } from '@/contexts/LanguageContext';

// Helper function for fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number = 10000) => {
  const controller = new AbortController();
  const timeoutPromise = new Promise<Response>((_, reject) => {
    setTimeout(() => {
      controller.abort();
      reject(new Error(`Request timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  const fetchPromise = fetch(url, {
    ...options,
    signal: controller.signal,
  });

  try {
    // Use Promise.race to either get the fetch result or timeout
    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
};

export const generateQuranInsight = async (surah: number, ayah: number, text: string, language: SupportedLanguage = 'english') => {
  try {
    const response = await fetchWithTimeout(
      '/api/insights/quran',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ surah, ayah, text, language }),
      },
      15000 // 15 second timeout
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate insight');
    }

    const data = await response.json();
    return data.insight;
  } catch (error) {
    console.error('Error generating Quran insight:', error);
    throw error;
  }
};

export const generateHadithInsight = async (collection: string, number: number, text: string, language: SupportedLanguage = 'english') => {
  try {
    const response = await fetchWithTimeout(
      '/api/insights/hadith',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collection, number, text, language }),
      },
      15000 // 15 second timeout
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate insight');
    }

    const data = await response.json();
    return data.insight;
  } catch (error) {
    console.error('Error generating Hadith insight:', error);
    throw error;
  }
};

// Check if API key is properly configured
const isApiKeyConfigured = async (): Promise<boolean> => {
  try {
    const response = await fetchWithTimeout('/api/test-env', {}, 5000);
    if (!response.ok) return false;
    
    const data = await response.json();
    return data.openaiKeyExists;
  } catch (error) {
    console.error('Error checking API key configuration:', error);
    return false;
  }
};

export const generateDailyReminder = async (username: string) => {
  try {
    // Check if API key is configured
    const apiKeyConfigured = await isApiKeyConfigured();
    
    if (!apiKeyConfigured) {
      console.warn('OpenAI API key not properly configured, returning default reminder');
      return `May Allah bless you with peace and success today, ${username}. Remember to approach each task with mindfulness and gratitude.`;
    }

    try {
      const response = await fetchWithTimeout(
        '/api/reminders/daily',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username }),
        },
        10000 // 10 second timeout
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate reminder');
      }

      const data = await response.json();
      return data.reminder;
    } catch (error) {
      if (error instanceof Error && error.message === 'Request timed out') {
        console.warn('Daily reminder request timed out, returning default reminder');
        return `May Allah bless you with peace and success today, ${username}. Remember to approach each task with mindfulness and gratitude.`;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error generating daily reminder:', error);
    throw error;
  }
}; 