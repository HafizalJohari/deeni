// This script tests the language feature by generating insights in different languages
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Create OpenAI client
const openai = new OpenAI({
  apiKey: openaiApiKey,
});

// Sample Quran verse and Hadith for testing
const testQuranVerse = {
  surah: 1,
  ayah: 1,
  text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
};

const testHadith = {
  collection: "bukhari",
  number: 1,
  text: "إنما الأعمال بالنيات وإنما لكل امرئ ما نوى",
};

// Language-specific system prompts for Quran
const getQuranSystemPrompt = (language) => {
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

// Language-specific user prompts for Quran
const getQuranUserPrompt = (surah, ayah, text, language) => {
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

// Language-specific system prompts for Hadith
const getHadithSystemPrompt = (language) => {
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

// Language-specific user prompts for Hadith
const getHadithUserPrompt = (collection, number, text, language) => {
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

// Generate Quran insight
async function generateQuranInsight(language) {
  try {
    console.log(`Generating Quran insight in ${language}...`);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: getQuranSystemPrompt(language)
        },
        {
          role: 'user',
          content: getQuranUserPrompt(
            testQuranVerse.surah, 
            testQuranVerse.ayah, 
            testQuranVerse.text, 
            language
          )
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const insight = response.choices[0].message.content;
    console.log(`Quran insight in ${language}:\n${insight}\n`);
    return insight;
  } catch (error) {
    console.error(`Error generating Quran insight in ${language}:`, error);
    return null;
  }
}

// Generate Hadith insight
async function generateHadithInsight(language) {
  try {
    console.log(`Generating Hadith insight in ${language}...`);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: getHadithSystemPrompt(language)
        },
        {
          role: 'user',
          content: getHadithUserPrompt(
            testHadith.collection, 
            testHadith.number, 
            testHadith.text, 
            language
          )
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const insight = response.choices[0].message.content;
    console.log(`Hadith insight in ${language}:\n${insight}\n`);
    return insight;
  } catch (error) {
    console.error(`Error generating Hadith insight in ${language}:`, error);
    return null;
  }
}

// Test language feature
async function testLanguageFeature() {
  const languages = ['english', 'malay', 'arabic', 'mandarin'];
  
  console.log('Testing language feature...\n');
  
  for (const language of languages) {
    // Generate Quran insight
    await generateQuranInsight(language);
    
    // Generate Hadith insight
    await generateHadithInsight(language);
    
    console.log('-'.repeat(50));
  }
  
  console.log('Language feature test completed!');
}

testLanguageFeature(); 