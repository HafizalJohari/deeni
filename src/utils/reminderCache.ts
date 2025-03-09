interface CachedReminder {
  reminder: string;
  timestamp: number;
}

interface ReminderCache {
  [sessionId: string]: CachedReminder;
}

// In-memory cache for reminders
const reminderCache: ReminderCache = {};

// Cache duration - 24 hours in milliseconds
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export const getCachedReminder = (sessionId: string): string | null => {
  const cached = reminderCache[sessionId];
  if (!cached) return null;

  // Check if cache has expired
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    delete reminderCache[sessionId];
    return null;
  }

  return cached.reminder;
};

export const setCachedReminder = (sessionId: string, reminder: string): void => {
  reminderCache[sessionId] = {
    reminder,
    timestamp: Date.now(),
  };
};

export const clearCache = (): void => {
  Object.keys(reminderCache).forEach(key => {
    if (Date.now() - reminderCache[key].timestamp > CACHE_DURATION) {
      delete reminderCache[key];
    }
  });
}; 