// Helper function to generate images via our API endpoint
export const generateImage = async (prompt: string): Promise<string> => {
  try {
    console.log('Calling image generation API with prompt...');
    
    // Call our server-side API endpoint that safely handles Fal.AI integration
    const response = await fetch('/api/generate/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Image generation API error:', data.error);
      throw new Error(data.error || 'Failed to generate image');
    }
    
    if (!data.imageUrl) {
      console.error('No image URL returned from the API');
      throw new Error('No image URL returned from the API');
    }

    console.log('Successfully generated image URL');
    return data.imageUrl;
  } catch (apiError) {
    console.warn('Could not generate image, using fallback placeholder image', apiError);
    
    // Return a fallback image URL instead of failing
    // This ensures the UI doesn't break even if image generation fails
    return 'https://placehold.co/600x400/e2e8f0/64748b?text=Image+Generation+Unavailable';
  }
};

// Different types of Islamic posters with specialized prompts
export const generateHadithPoster = async (collection: string, number: number, hadithText: string): Promise<string> => {
  try {
    console.log(`Generating Hadith poster for ${collection} #${number}...`);
    const prompt = `Calm and harmonious Islamic art poster with elegant geometric patterns and arabesque designs in a serene color palette. Modern minimalist style with gold accents. The poster should convey the essence of Hadith ${number} from ${collection} in a respectful manner. No text, no human figures, no faces, and no religious texts displayed.`;
    return await generateImage(prompt);
  } catch (error) {
    console.error('Error generating Hadith poster:', error);
    // Return a fallback image so the UI doesn't break
    return 'https://placehold.co/600x400/f8fafc/475569?text=Hadith+Poster+Unavailable';
  }
};

export const generateQuranPoster = async (surah: number, ayah: number, arabicText: string, translation: string): Promise<string> => {
  try {
    console.log(`Generating calm and harmonious Quran-inspired poster for Surah ${surah}, Ayah ${ayah}...`);
      const prompt = `Calm and harmonious Islamic art poster with elegant geometric patterns and arabesque designs in a serene color palette. Modern minimalist style with gold accents. The poster should feature beautiful Islamic motifs and artistic elements in a respectful manner. No text, no human figures, no faces, and no religious texts displayed.`;
    return await generateImage(prompt);
  } catch (error) {
    console.error('Error generating Quran poster:', error);
    // Return a fallback image so the UI doesn't break
    return 'https://placehold.co/600x400/f1f5f9/334155?text=Quran+Poster+Unavailable';
  }
}; 