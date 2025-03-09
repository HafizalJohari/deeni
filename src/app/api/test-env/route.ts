import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET() {
  // Check if environment variables are loaded
  const openaiKey = process.env.OPENAI_API_KEY;
  const openaiKeyValid = !!openaiKey && openaiKey.startsWith('sk-');

  // Attempt to initialize OpenAI client as a validation step
  let openaiClientValid = false;
  if (openaiKeyValid) {
    try {
      const tempClient = new OpenAI({
        apiKey: openaiKey,
      });
      // We don't actually make an API call, just check if initialization works
      openaiClientValid = true;
    } catch (error) {
      console.error('Error initializing OpenAI client:', error);
      openaiClientValid = false;
    }
  }

  const envVariables = {
    nodeEnv: process.env.NODE_ENV,
    openaiKeyExists: !!openaiKey,
    openaiKeyValid: openaiKeyValid,
    openaiClientValid: openaiClientValid,
    // Only show first 5 characters if the key exists for security
    openaiKeyPrefix: openaiKey ? 
      `${openaiKey.substring(0, 5)}...` : null,
  };

  return NextResponse.json(envVariables);
} 