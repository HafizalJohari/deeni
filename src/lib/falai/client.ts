import { fal } from '@fal-ai/client';

// Initialize the client with the API key
fal.config({
  credentials: process.env.FAL_AI_API_KEY || '',
});

// Type definitions based on Fal.AI documentation
interface ImageSize {
  width: number;
  height: number;
}

interface Image {
  url: string;
  content_type: string;
  width?: number;
  height?: number;
}

interface GenerationInput {
  prompt: string;
  image_size?: 'square_hd' | 'square' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9' | ImageSize;
  num_inference_steps?: number;
  num_images?: number;
  enable_safety_checker?: boolean;
  seed?: number;
  sync_mode?: boolean;
}

interface GenerationOutput {
  images: Image[];
  prompt: string;
  timings?: Record<string, any>;
  seed?: number;
  has_nsfw_concepts?: boolean[];
}

// Direct call to Fal.AI API (server-side only)
export const generateWithSchnell = async (prompt: string): Promise<string> => {
  try {
    console.log('Generating image with Fal.AI schnell model...');
    
    // Use the exact approach from the documentation
    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: prompt,
        image_size: "landscape_16_9", // Widescreen format
        num_inference_steps: 4,       // Default value
        num_images: 1,                // Generate a single image
        enable_safety_checker: true   // Enable safety features
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });
    
    console.log('Generation successful, result:', result.data);
    
    if (result.data && result.data.images && result.data.images.length > 0) {
      return result.data.images[0].url;
    } else {
      throw new Error('No image URL in response');
    }
  } catch (error) {
    console.error('Error generating with Schnell model:', error);
    throw error;
  }
};

// Common function to generate images using our API endpoint (client-side safe)
const generateImageViaApi = async (prompt: string): Promise<string> => {
  try {
    console.log('Calling image generation API with prompt...');
    const response = await fetch('/api/generate/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    if (!response.ok || !data.imageUrl) {
      console.error('Error from image generation API:', data.error || 'No image URL returned');
      throw new Error(data.error || 'Failed to generate image');
    }

    return data.imageUrl;
  } catch (error) {
    console.error('Error in generateImageViaApi:', error);
    throw error;
  }
};

export const generateIslamicPoster = async (prompt: string): Promise<string> => {
  try {
    console.log('Generating serene Islamic-inspired image...');
    
    // Extract key themes from the prompt
    const themes = extractThemesFromText(prompt);
    
    return await generateImageViaApi(
      `Create a serene, harmonious and peaceful Islamic-inspired image suitable for social media. The image should evoke themes of ${themes}. Style should be beautiful, calming, and elegant with natural elements like landscapes, geometric patterns, or architectural beauty. Do NOT include any text in the image. Create a high-quality, professional image in landscape format with soft, pleasing colors.`
    );
  } catch (error) {
    console.error('Error generating Islamic-inspired image:', error);
    // Return a fallback image URL so the UI doesn't break
    return 'https://placehold.co/600x400/e2e8f0/64748b?text=Islamic+Image+Unavailable';
  }
};

export const generateQuranAyahPoster = async (surah: number, ayah: number, text: string, translation: string): Promise<string> => {
  try {
    console.log(`Generating serene image inspired by Surah ${surah}, Ayah ${ayah}...`);
    
    // Extract key themes from the text without including the actual verse
    const themes = extractThemesFromText(text, translation);
    
    return await generateImageViaApi(
      `Create a serene, harmonious and peaceful Islamic-inspired image suitable for social media. The image should evoke themes of ${themes}. Style should be beautiful, calming, and elegant with natural elements like landscapes, geometric patterns, or architectural beauty. Do NOT include any Arabic text or Quranic verses in the image. Create a high-quality, professional image in landscape format with soft, pleasing colors.`
    );
  } catch (error) {
    console.error('Error generating Quran-inspired image:', error);
    // Return a fallback image URL so the UI doesn't break
    return 'https://placehold.co/600x400/f1f5f9/334155?text=Islamic+Image+Unavailable';
  }
};

export const generateHadithPoster = async (collection: string, number: number, text: string): Promise<string> => {
  try {
    console.log(`Generating serene image inspired by Hadith from ${collection} #${number}...`);
    
    // Extract key themes from the text without including the actual hadith
    const themes = extractThemesFromText(text);
    
    return await generateImageViaApi(
      `Create a serene, harmonious and peaceful Islamic-inspired image suitable for social media. The image should evoke themes of ${themes}. Style should be beautiful, calming, and elegant with natural elements like landscapes, geometric patterns, or architectural beauty. Do NOT include any Arabic text or Hadith text in the image. Create a high-quality, professional image in landscape format with soft, pleasing colors.`
    );
  } catch (error) {
    console.error('Error generating Hadith-inspired image:', error);
    // Return a fallback image URL so the UI doesn't break
    return 'https://placehold.co/600x400/f8fafc/475569?text=Islamic+Image+Unavailable';
  }
};

/**
 * Helper function to extract themes from text without using the actual text
 */
const extractThemesFromText = (text: string, translation?: string): string => {
  // Common Islamic themes that can be used based on context
  const commonThemes = [
    'peace', 'tranquility', 'nature', 'reflection', 'mercy', 'compassion',
    'wisdom', 'patience', 'gratitude', 'hope', 'faith', 'love', 'kindness',
    'beauty', 'harmony', 'serenity', 'light', 'guidance', 'mindfulness'
  ];
  
  // Select a few random themes if we can't extract meaningful ones
  const getRandomThemes = () => {
    const shuffled = [...commonThemes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3).join(', ');
  };
  
  // Simple keyword matching - this could be enhanced with NLP in a production environment
  const combinedText = (translation || '') + ' ' + text;
  const lowerText = combinedText.toLowerCase();
  
  const matchedThemes = commonThemes.filter(theme => 
    lowerText.includes(theme.toLowerCase())
  );
  
  // If we found at least 2 themes, use those, otherwise use random ones
  return matchedThemes.length >= 2 
    ? matchedThemes.slice(0, 4).join(', ')
    : getRandomThemes();
}; 