import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client with API key from environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { userId, moodEntries, practices } = await request.json();

    // Validate the request
    if (!userId || !moodEntries || !practices) {
      return NextResponse.json(
        { error: 'User ID, mood entries, and practices are required' },
        { status: 400 }
      );
    }

    // Create the prompt for OpenAI
    const prompt = `
      Analyze the following mood entries and spiritual practices for a user:
      
      Mood Entries: ${JSON.stringify(moodEntries)}
      Practices: ${JSON.stringify(practices)}
      
      Identify patterns between mood and spiritual practices. Consider:
      1. Which practices correlate with positive moods
      2. Which practices may be challenging for the user
      3. Recommendations for improving spiritual well-being
      
      Format the response as a JSON object with the following structure:
      {
        "positivePatterns": ["pattern1", "pattern2", ...],
        "challengingPatterns": ["pattern1", "pattern2", ...],
        "recommendations": ["recommendation1", "recommendation2", ...]
      }
    `;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an AI assistant specializing in analyzing spiritual well-being patterns. in 100 words' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
    });

    // Extract the content from the response
    const completion = response.choices[0].message.content;
    if (!completion) {
      throw new Error('Failed to analyze patterns');
    }

    // Parse the JSON response
    const analysis = JSON.parse(completion);

    // Return the analysis
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error analyzing mood patterns:', error);
    return NextResponse.json(
      { error: 'Failed to analyze mood patterns' },
      { status: 500 }
    );
  }
} 