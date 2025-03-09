import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Mock hadith data - in a real app, this would be fetched from a database or API
const HADITH_COLLECTION = [
  {
    id: 'hadith-1',
    title: 'On Kindness',
    description: 'The Prophet (peace be upon him) said: "Allah is kind and loves kindness in all matters."',
    source: 'Sahih Bukhari',
    themes: ['kindness', 'mercy', 'compassion', 'character']
  },
  {
    id: 'hadith-2',
    title: 'On Seeking Knowledge',
    description: 'The Prophet (peace be upon him) said: "Seeking knowledge is obligatory upon every Muslim."',
    source: 'Sunan Ibn Majah',
    themes: ['knowledge', 'education', 'learning', 'study', 'obligation']
  },
  {
    id: 'hadith-3',
    title: 'On Prayer',
    description: 'The Prophet (peace be upon him) said: "The key to Paradise is prayer, and the key to prayer is cleanliness."',
    source: 'Musnad Ahmad',
    themes: ['prayer', 'cleanliness', 'paradise', 'worship', 'salah']
  },
  {
    id: 'hadith-4',
    title: 'On Family Relations',
    description: 'The Prophet (peace be upon him) said: "The best of you are those who are best to their families, and I am the best to my family."',
    source: 'Sunan al-Tirmidhi',
    themes: ['family', 'kindness', 'relationships', 'home', 'character']
  },
  {
    id: 'hadith-5',
    title: 'On Patience',
    description: 'The Prophet (peace be upon him) said: "Wonderful is the affair of the believer, for there is good for him in every matter and this is not the case with anyone except the believer. If he is happy, then he thanks Allah and thus there is good for him. If he is harmed, then he shows patience and thus there is good for him."',
    source: 'Sahih Muslim',
    themes: ['patience', 'gratitude', 'faith', 'hardship', 'optimism']
  },
  {
    id: 'hadith-6',
    title: 'On Speech',
    description: 'The Prophet (peace be upon him) said: "Whoever believes in Allah and the Last Day should speak good or remain silent."',
    source: 'Sahih Bukhari',
    themes: ['speech', 'silence', 'character', 'manners', 'faith']
  },
  {
    id: 'hadith-7',
    title: 'On Anger',
    description: 'The Prophet (peace be upon him) said: "The strong is not the one who overcomes people by his strength, but the strong is the one who controls himself while in anger."',
    source: 'Sahih Bukhari',
    themes: ['anger', 'strength', 'self-control', 'character', 'patience']
  },
  {
    id: 'hadith-8',
    title: 'On Charity',
    description: 'The Prophet (peace be upon him) said: "The believer\'s shade on the Day of Resurrection will be their charity."',
    source: 'Musnad Ahmad',
    themes: ['charity', 'giving', 'sadaqah', 'judgment day', 'generosity']
  },
  {
    id: 'hadith-9',
    title: 'On Fasting',
    description: 'The Prophet (peace be upon him) said: "Fasting is a shield. So the one who fasts should avoid sexual relation with his wife and should not behave foolishly and impudently, and if somebody fights with him or abuses him, he should say, \'I am fasting.\'"',
    source: 'Sahih Bukhari',
    themes: ['fasting', 'ramadan', 'self-control', 'worship', 'patience']
  },
  {
    id: 'hadith-10',
    title: 'On Community',
    description: 'The Prophet (peace be upon him) said: "The believers in their mutual kindness, compassion and sympathy are just like one body. When one of the limbs suffers, the whole body responds to it with wakefulness and fever."',
    source: 'Sahih Muslim',
    themes: ['community', 'brotherhood', 'unity', 'compassion', 'ummah']
  }
];

export async function POST(request: Request) {
  try {
    // Verify authentication
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { keywords } = body;

    if (!keywords || typeof keywords !== 'string') {
      return NextResponse.json(
        { error: 'Keywords are required' },
        { status: 400 }
      );
    }

    // Parse keywords into an array and normalize
    const keywordArray = keywords
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 0);

    if (keywordArray.length < 3) {
      return NextResponse.json(
        { error: 'At least 3 keywords are required' },
        { status: 400 }
      );
    }

    // Find matching hadith based on keywords
    const matchingHadith = HADITH_COLLECTION.map(hadith => {
      // Calculate relevance score based on keyword matches in themes and title
      const themeMatches = hadith.themes.filter(theme => 
        keywordArray.some(keyword => theme.includes(keyword))
      ).length;
      
      const titleMatches = keywordArray.filter(keyword => 
        hadith.title.toLowerCase().includes(keyword)
      ).length;
      
      const descriptionMatches = keywordArray.filter(keyword => 
        hadith.description.toLowerCase().includes(keyword)
      ).length;
      
      // Calculate overall relevance score (0-1)
      const maxPossibleMatches = keywordArray.length * 3;
      const actualMatches = themeMatches + titleMatches + descriptionMatches;
      const relevanceScore = Math.min(actualMatches / maxPossibleMatches, 1);
      
      return {
        ...hadith,
        relevanceScore,
        matchCount: actualMatches
      };
    })
    .filter(hadith => hadith.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5)
    .map(hadith => ({
      id: hadith.id,
      title: hadith.title,
      description: hadith.description,
      type: 'hadith',
      relevanceScore: hadith.relevanceScore,
      source: hadith.source
    }));

    // If no matches found, return a helpful response
    if (matchingHadith.length === 0) {
      const randomHadith = HADITH_COLLECTION[Math.floor(Math.random() * HADITH_COLLECTION.length)];
      
      return NextResponse.json({
        recommendations: [{
          id: randomHadith.id,
          title: 'Recommended Hadith',
          description: randomHadith.description,
          type: 'hadith',
          relevanceScore: 0.5,
          source: randomHadith.source
        }],
        message: 'No exact matches found, but you might find this hadith interesting'
      });
    }

    return NextResponse.json({
      recommendations: matchingHadith,
      keywordsUsed: keywordArray
    });
  } catch (error) {
    console.error('Error in hadith insights API:', error);
    return NextResponse.json(
      { error: 'Failed to generate hadith insights' },
      { status: 500 }
    );
  }
} 