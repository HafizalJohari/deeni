import OpenAI from 'openai';

// Check if XAI API key is configured
export const isApiKeyConfigured = async () => {
  try {
    const apiKey = process.env.XAI_API_KEY;
    return !!apiKey;
  } catch (error) {
    console.error('Error checking XAI API key configuration:', error);
    return false;
  }
};

export const generateDailyReminder = async (username: string) => {
  try {
    // Make API call to our server endpoint instead of directly using OpenAI client
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
    console.error('Error generating daily reminder:', error);
    throw error;
  }
};

// Helper function to handle timeouts
const fetchWithTimeout = (url: string, options: RequestInit, timeout: number) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), timeout)
    ),
  ]) as Promise<Response>;
}; 