import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Missing username' },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant specialized in Islamic knowledge. Provide a short, motivational daily reminder for Muslims that encourages good deeds and spiritual growth. Keep responses respectful, educational, and uplifting.'
        },
        {
          role: 'user',
          content: `Please provide a short, motivational daily reminder for ${username}. Include a relevant Quranic verse or Hadith if appropriate.`
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    return NextResponse.json({ reminder: response.choices[0].message.content });
  } catch (error: any) {
    console.error('Error generating daily reminder:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate reminder' },
      { status: 500 }
    );
  }
} 