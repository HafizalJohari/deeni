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
      return 'You are an AI assistant specialized in Islamic knowledge, particularly Hadith. Provide thoughtful, accurate insights about Hadith that help Muslims apply these teachings in their daily lives. Keep responses respectful, educational, and focused on practical application. Respond in English.';
    case 'malay':
      return 'Anda adalah pembantu AI yang pakar dalam pengetahuan Islam, khususnya Hadith. Berikan wawasan yang mendalam dan tepat tentang Hadith yang membantu umat Islam menerapkan ajaran ini dalam kehidupan sehari-hari mereka. Pastikan jawaban anda sopan, mendidik, dan fokus pada aplikasi praktis. Jawab dalam Bahasa Melayu.';
    case 'arabic':
      return 'أنت مساعد ذكاء اصطناعي متخصص في المعرفة الإسلامية، وخاصة الحديث النبوي. قدم رؤى مدروسة ودقيقة حول الأحاديث التي تساعد المسلمين على تطبيق هذه التعاليم في حياتهم اليومية. حافظ على أن تكون الردود محترمة وتعليمية وتركز على التطبيق العملي. أجب باللغة العربية.';
    case 'mandarin':
      return '您是一位专门研究伊斯兰知识，特别是圣训的AI助手。提供关于圣训的深思熟虑、准确的见解，帮助穆斯林在日常生活中应用这些教导。保持回答尊重、有教育意义，并专注于实际应用。请用中文回答。';
    default:
      return 'You are an AI assistant specialized in Islamic knowledge, particularly Hadith. Provide thoughtful, accurate insights about Hadith that help Muslims apply these teachings in their daily lives. Keep responses respectful, educational, and focused on practical application. Respond in English.';
  }
};

// Language-specific user prompts
const getUserPrompt = (collection: string, number: number, text: string, language: SupportedLanguage) => {
  switch (language) {
    case 'english':
      return `Please provide a thoughtful insight about this Hadith from ${collection} (Number ${number}): "${text}". Focus on how this Hadith can be applied in daily life and what lessons we can learn from it.`;
    case 'malay':
      return `Sila berikan pandangan yang mendalam tentang Hadith ini dari ${collection} (Nombor ${number}): "${text}". Fokus pada bagaimana Hadith ini boleh diaplikasikan dalam kehidupan seharian dan apakah pengajaran yang boleh kita pelajari daripadanya.`;
    case 'arabic':
      return `يرجى تقديم رؤية متعمقة حول هذا الحديث من ${collection} (رقم ${number}): "${text}". ركز على كيفية تطبيق هذا الحديث في الحياة اليومية وما هي الدروس التي يمكننا تعلمها منه.`;
    case 'mandarin':
      return `请提供关于这段来自${collection}的圣训（编号${number}）的深刻见解："${text}"。重点说明如何在日常生活中应用这段圣训以及我们可以从中学到什么教训。`;
    default:
      return `Please provide a thoughtful insight about this Hadith from ${collection} (Number ${number}): "${text}". Focus on how this Hadith can be applied in daily life and what lessons we can learn from it.`;
  }
};

export async function POST(request: Request) {
  try {
    const { collection, number, text, language = 'english' } = await request.json();

    if (!collection || !number || !text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: getSystemPrompt(language as SupportedLanguage)
        },
        {
          role: 'user',
          content: getUserPrompt(collection, number, text, language as SupportedLanguage)
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return NextResponse.json({ insight: response.choices[0].message.content });
  } catch (error: any) {
    console.error('Error generating Hadith insight:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate insight' },
      { status: 500 }
    );
  }
} 