import { NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

// Check if the FAL API key is set
if (!process.env.FAL_AI_API_KEY) {
  console.error('WARNING: FAL_AI_API_KEY is not set in environment variables');
}

// Initialize Fal.AI client with API key
fal.config({
  credentials: process.env.FAL_AI_API_KEY,
});

// Define interfaces based on the Fal.AI schema
interface Image {
  url: string;
  content_type: string;
  width?: number;
  height?: number;
}

interface SchnellOutput {
  images: Image[];
  prompt: string;
  timings?: Record<string, any>;
  seed?: number;
  has_nsfw_concepts?: boolean[];
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt' },
        { status: 400 }
      );
    }

    console.log('Generating image with prompt:', prompt);

    try {
      // Use the Fal.AI flux/schnell model exactly as documented
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

      console.log('Image generation successful, result:', result);
      
      // Access the image URL using the documented response structure
      if (result.data && result.data.images && result.data.images[0] && result.data.images[0].url) {
        return NextResponse.json({ imageUrl: result.data.images[0].url });
      } else {
        console.error('No image URL in response:', result);
        throw new Error('No image URL in response');
      }
    } catch (err) {
      console.error('Fal.AI API error:', err);
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Unknown Fal.AI error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in image generation route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image' },
      { status: 500 }
    );
  }
} 