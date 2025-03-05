import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { mood, preferences, history } = await request.json();

    if (!mood) {
      return NextResponse.json(
        { error: 'Mood data is required' },
        { status: 400 }
      );
    }

    // Prepare the prompt for OpenAI
    const prompt = `
      Based on the following user information, provide 3-5 personalized content recommendations for Islamic learning and spiritual growth:
      
      Current Mood: ${mood}
      User Preferences: ${JSON.stringify(preferences || {})}
      Recent Learning History: ${JSON.stringify(history || [])}
      
      For each recommendation, provide:
      1. Title
      2. Type (e.g., Article, Video, Quran chapter, Hadith, Dua)
      3. Brief description
      4. Reason why it's recommended based on their current mood and preferences
      
      Format the response as a JSON array of recommendation objects.
    `;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a knowledgeable Islamic scholar and spiritual guide." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    // Extract and parse the recommendations
    const responseContent = completion.choices[0].message.content;
    const recommendations = JSON.parse(responseContent || '{"recommendations":[]}');

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
} 