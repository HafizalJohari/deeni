import { SelfReflection } from '@/types/self-reflections';

const STORAGE_KEY = 'deeni_reflections';

export const getLocalReflections = (): SelfReflection[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get reflections from local storage:', error);
    return [];
  }
};

export const saveLocalReflection = (reflection: SelfReflection): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const existing = getLocalReflections();
    const updated = [reflection, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save reflection to local storage:', error);
  }
};

export const clearLocalReflections = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear reflections from local storage:', error);
  }
};

export const syncLocalReflections = (serverReflections: SelfReflection[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serverReflections));
  } catch (error) {
    console.error('Failed to sync reflections to local storage:', error);
  }
}; 