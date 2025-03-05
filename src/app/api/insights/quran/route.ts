import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SupportedLanguage } from '@/contexts/LanguageContext';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Language-specific system prompts
const getSystemPrompt = (language: SupportedLanguage) => {
  switch (language) {
    case 'english':
      return 'You are an AI assistant specialized in Islamic knowledge, particularly the Quran. Provide thoughtful, accurate insights about Quranic verses that help Muslims apply these teachings in their daily lives. Keep responses respectful, educational, and focused on practical application. Respond in English.';
    case 'malay':
      return 'Anda adalah pembantu AI yang pakar dalam pengetahuan Islam, khususnya Al-Quran. Berikan wawasan yang mendalam dan tepat tentang ayat-ayat Al-Quran yang membantu umat Islam menerapkan ajaran ini dalam kehidupan sehari-hari mereka. Pastikan jawaban anda sopan, mendidik, dan fokus pada aplikasi praktis. Jawab dalam Bahasa Melayu.';
    case 'arabic':
      return 'أنت مساعد ذكاء اصطناعي متخصص في المعرفة الإسلامية، وخاصة القرآن الكريم. قدم رؤى مدروسة ودقيقة حول آيات القرآن التي تساعد المسلمين على تطبيق هذه التعاليم في حياتهم اليومية. حافظ على أن تكون الردود محترمة وتعليمية وتركز على التطبيق العملي. أجب باللغة العربية.';
    case 'mandarin':
      return '您是一位专门研究伊斯兰知识，特别是古兰经的AI助手。提供关于古兰经经文的深思熟虑、准确的见解，帮助穆斯林在日常生活中应用这些教导。保持回答尊重、有教育意义，并专注于实际应用。请用中文回答。';
    default:
      return 'You are an AI assistant specialized in Islamic knowledge, particularly the Quran. Provide thoughtful, accurate insights about Quranic verses that help Muslims apply these teachings in their daily lives. Keep responses respectful, educational, and focused on practical application. Respond in English.';
  }
};

// Language-specific user prompts
const getUserPrompt = (surah: number, ayah: number, text: string, language: SupportedLanguage) => {
  switch (language) {
    case 'english':
      return `Please provide a thoughtful insight about this verse from the Quran (Surah ${surah}, Ayah ${ayah}): "${text}". Focus on how this verse can be applied in daily life and what lessons we can learn from it.`;
    case 'malay':
      return `Sila berikan pandangan yang mendalam tentang ayat ini dari Al-Quran (Surah ${surah}, Ayat ${ayah}): "${text}". Fokus pada bagaimana ayat ini boleh diaplikasikan dalam kehidupan seharian dan apakah pengajaran yang boleh kita pelajari daripadanya.`;
    case 'arabic':
      return `يرجى تقديم رؤية متعمقة حول هذه الآية من القرآن الكريم (سورة ${surah}، آية ${ayah}): "${text}". ركز على كيفية تطبيق هذه الآية في الحياة اليومية وما هي الدروس التي يمكننا تعلمها منها.`;
    case 'mandarin':
      return `请提供关于这节古兰经经文的深刻见解（第${surah}章，第${ayah}节）："${text}"。重点说明如何在日常生活中应用这节经文以及我们可以从中学到什么教训。`;
    default:
      return `Please provide a thoughtful insight about this verse from the Quran (Surah ${surah}, Ayah ${ayah}): "${text}". Focus on how this verse can be applied in daily life and what lessons we can learn from it.`;
  }
};

export async function POST(request: Request) {
  try {
    const { surah, ayah, text, language = 'english' } = await request.json();

    if (!surah || !ayah || !text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: getSystemPrompt(language as SupportedLanguage)
        },
        {
          role: 'user',
          content: getUserPrompt(surah, ayah, text, language as SupportedLanguage)
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return NextResponse.json({ insight: response.choices[0].message.content });
  } catch (error: any) {
    console.error('Error generating Quran insight:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate insight' },
      { status: 500 }
    );
  }
} 