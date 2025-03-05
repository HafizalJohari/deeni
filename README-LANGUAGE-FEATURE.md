# Multilingual Insights Feature

This document provides instructions on how to set up and use the multilingual insights feature in the Deeni application.

## Overview

The multilingual insights feature allows users to receive AI-generated insights about Quran verses and Hadith in their preferred language. Currently, the following languages are supported:

- English
- Malay (Bahasa Melayu)
- Arabic (العربية)
- Mandarin (中文)

## Setup Instructions

### 1. Run Database Migrations

First, you need to run the database migrations to add the language column to the insights tables and create the user preferences table:

```bash
# First, create the exec_sql function in Supabase
# Log in to your Supabase dashboard, go to the SQL Editor, and run:
# (Copy the contents of src/db/migrations/create_exec_sql_function.sql)

# Then run the migration script
npm run migrate
```

### 2. Update Existing Insights

After running the migrations, you need to update existing insights to set their language to 'english':

```bash
npm run update-insights
```

This script will update all insights that have a null language value to 'english'.

### 3. Test the Language Feature

You can test the language feature by running the following command:

```bash
npm run test-language
```

This script will generate Quran and Hadith insights in all supported languages and output them to the console. It's a good way to verify that the language feature is working correctly.

### 4. Verify Database Changes

After running the migrations and updating existing insights, verify that the following changes have been made in your Supabase database:

1. The `quran_insights` table has a `language` column with a default value of 'english'
2. The `hadith_insights` table has a `language` column with a default value of 'english'
3. All existing insights have their language set to 'english'
4. A new `user_preferences` table has been created with columns for `user_id`, `insight_language`, and timestamps
5. Row Level Security (RLS) policies have been set up for the `user_preferences` table

### 5. Test the Feature in the Application

1. Log in to the application
2. Go to the Settings page and select the "Content" tab
3. Choose your preferred language for insights
4. Navigate to the Quran or Hadith insights page and generate a new insight
5. Verify that the insight is generated in your selected language

## Implementation Details

The multilingual insights feature consists of the following components:

1. **Language Context Provider**: Manages the user's language preference and provides it to the application
2. **OpenAI Client**: Sends the language parameter to the API routes
3. **API Routes**: Use language-specific prompts to generate insights in the selected language
4. **Database**: Stores the user's language preference and the language of each insight
5. **Settings UI**: Allows users to select their preferred language

## Troubleshooting

If you encounter any issues with the language feature, try the following:

1. Check the browser console for errors
2. Verify that the `user_preferences` table exists in your Supabase database
3. Check that the RLS policies are correctly set up for the `user_preferences` table
4. Ensure that the `language` column exists in both the `quran_insights` and `hadith_insights` tables
5. Make sure all existing insights have their language set to a valid value
6. Run the test script to verify that the language feature is working correctly

## Adding New Languages

To add support for a new language:

1. Update the `SupportedLanguage` type in `src/contexts/LanguageContext.tsx`
2. Add language-specific prompts in the API routes
3. Update the language selection UI in the settings page 