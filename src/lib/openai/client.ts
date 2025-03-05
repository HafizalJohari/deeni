import { SupportedLanguage } from '@/contexts/LanguageContext';

export const generateQuranInsight = async (surah: number, ayah: number, text: string, language: SupportedLanguage = 'english') => {
  try {
    const response = await fetch('/api/insights/quran', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ surah, ayah, text, language }),
    });

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
    const response = await fetch('/api/insights/hadith', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collection, number, text, language }),
    });

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

export const generateDailyReminder = async (username: string) => {
  try {
    const response = await fetch('/api/reminders/daily', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate reminder');
    }

    const data = await response.json();
    return data.reminder;
  } catch (error) {
    console.error('Error generating daily reminder:', error);
    throw error;
  }
}; 