// This script updates the language of existing insights
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or service role key');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateExistingInsights() {
  try {
    console.log('Updating existing Quran insights...');
    
    // Update Quran insights
    const { data: quranData, error: quranError } = await supabase
      .from('quran_insights')
      .update({ language: 'english' })
      .is('language', null);
    
    if (quranError) {
      console.error('Error updating Quran insights:', quranError);
    } else {
      console.log(`Updated ${quranData?.length || 0} Quran insights`);
    }
    
    console.log('Updating existing Hadith insights...');
    
    // Update Hadith insights
    const { data: hadithData, error: hadithError } = await supabase
      .from('hadith_insights')
      .update({ language: 'english' })
      .is('language', null);
    
    if (hadithError) {
      console.error('Error updating Hadith insights:', hadithError);
    } else {
      console.log(`Updated ${hadithData?.length || 0} Hadith insights`);
    }
    
    console.log('Update completed successfully!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateExistingInsights(); 