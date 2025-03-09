import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getCachedReminder, setCachedReminder } from '@/utils/reminderCache';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

// Initialize OpenAI client with better error handling
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('OpenAI API key is not configured');
    return null;
  }
  
  return new OpenAI({
    apiKey,
  });
};

const openai = getOpenAIClient();

// Set a timeout for OpenAI requests
const OPENAI_TIMEOUT_MS = 15000; // 15 seconds

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Missing username' },
        { status: 400 }
      );
    }

    // Get or create session ID
    const cookieStore = await cookies();
    const reminderCookie = cookieStore.get('reminder_session');
    let sessionId = reminderCookie?.value || uuidv4();

    // Check cache first
    const cachedReminder = getCachedReminder(sessionId);
    if (cachedReminder) {
      const response = NextResponse.json({ reminder: cachedReminder, cached: true });
      response.cookies.set('reminder_session', sessionId, {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      return response;
    }

    // If OpenAI client is not available, return a default response
    if (!openai) {
      const defaultReminder = `May Allah bless you with peace and success today, ${username}. Remember to approach each task with mindfulness and gratitude.`;
      setCachedReminder(sessionId, defaultReminder);
      const response = NextResponse.json({ reminder: defaultReminder });
      response.cookies.set('reminder_session', sessionId, {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      return response;
    }

    // Create a timeout for the OpenAI request
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`OpenAI request timed out after ${OPENAI_TIMEOUT_MS}ms`));
      }, OPENAI_TIMEOUT_MS);
    });

    // Create the actual request promise
    const requestPromise = openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant specialized in Islamic knowledge. Provide a short, motivational daily reminder for Muslims that encourages good deeds and spiritual growth. Keep responses respectful, educational, and uplifting. in short and concise manner.(100 words)'
        },
        {
          role: 'user',
          content: `Please provide a short, motivational daily reminder for ${username}. Include a relevant Quranic verse or Hadith if appropriate.`
        }
      ],
      temperature: 1,
      max_tokens: 80,
    });

    // Race the timeout against the actual request
    const aiResponse = await Promise.race([requestPromise, timeoutPromise]) as OpenAI.Chat.Completions.ChatCompletion;
    const reminder = aiResponse.choices[0].message.content || '';
    
    // Cache the new reminder
    if (reminder) {
      setCachedReminder(sessionId, reminder);
    }

    const response = NextResponse.json({ reminder });
    response.cookies.set('reminder_session', sessionId, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    return response;
  } catch (error: any) {
    console.error('Error generating daily reminder:', error);
    
    // Provide a more graceful response for timeouts
    if (error.message && error.message.includes('timed out')) {
      const defaultReminder = `May Allah bless you with peace and success today. Remember to be patient and steadfast in all your endeavors.`;
      return NextResponse.json(
        { 
          reminder: defaultReminder,
          error: 'The request timed out, providing a default reminder instead.'
        },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to generate reminder' },
      { status: 500 }
    );
  }
} 