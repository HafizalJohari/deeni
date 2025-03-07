import { PersonalizationSettings } from '../types/personalization';

/**
 * Fetch personalization settings for the current user
 */
export const getPersonalizationSettings = async (): Promise<PersonalizationSettings | null> => {
  try {
    const response = await fetch('/api/personalization/settings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error fetching personalization settings:', error);
      return null;
    }

    const data = await response.json();
    return data as PersonalizationSettings;
  } catch (error) {
    console.error('Error fetching personalization settings:', error);
    return null;
  }
};

/**
 * Create or update personalization settings for the current user
 */
export const updatePersonalizationSettings = async (
  settings: Partial<PersonalizationSettings>
): Promise<PersonalizationSettings | null> => {
  try {
    const response = await fetch('/api/personalization/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error updating personalization settings:', error);
      return null;
    }

    const data = await response.json();
    return data as PersonalizationSettings;
  } catch (error) {
    console.error('Error updating personalization settings:', error);
    return null;
  }
};

/**
 * Update specific fields of personalization settings
 */
export const patchPersonalizationSettings = async (
  settings: Partial<PersonalizationSettings>
): Promise<PersonalizationSettings | null> => {
  try {
    const response = await fetch('/api/personalization/settings', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error patching personalization settings:', error);
      return null;
    }

    const data = await response.json();
    return data as PersonalizationSettings;
  } catch (error) {
    console.error('Error patching personalization settings:', error);
    return null;
  }
}; 