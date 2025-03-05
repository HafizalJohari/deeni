import OpenAI from 'openai';
import { InsightImage } from '@/types/growth-plan';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function generateInsightImage(insight: string, category: string): Promise<InsightImage | null> {
  try {
    const prompt = `Create an inspiring Islamic art style image that represents this spiritual insight: "${insight}". 
    The image should be minimalist, beautiful, and incorporate Islamic geometric patterns or calligraphy.
    Style: Modern Islamic art with geometric patterns
    Theme: Spiritual growth and reflection
    Colors: Soft, calming tones
    Mood: Peaceful and contemplative`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "natural"
    });

    if (!response.data[0]?.url) {
      throw new Error('No image URL received from OpenAI');
    }

    return {
      url: response.data[0].url,
      alt: `Islamic art visualization for: ${insight}`,
      category
    };
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
} 