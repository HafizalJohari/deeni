import { NextRequest, NextResponse } from 'next/server';
import { XAI } from '@/lib/xai';

// Initialize XAI client
const xai = new XAI({
  apiKey: process.env.XAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text, feeling } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ 
        error: 'Invalid input',
        details: 'Text is required and must be a string'
      }, { status: 400 });
    }

    try {
      const response = await xai.analyze({
        text,
        context: {
          type: 'reflection-analysis',
          feeling,
          perspective: 'islamic'
        }
      });

      if (!response.analysis) {
        throw new Error('No analysis returned from service');
      }

      return NextResponse.json({ analysis: response.analysis });
    } catch (xaiError) {
      console.error('XAI API error:', xaiError);
      return NextResponse.json({ 
        error: 'Analysis service error',
        details: 'Failed to analyze the reflection using the XAI service'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error analyzing reflection:', error);
    return NextResponse.json({ 
      error: 'Server error',
      details: 'An unexpected error occurred while processing your request'
    }, { status: 500 });
  }
} 