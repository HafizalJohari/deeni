# Multilingual Insights Feature - Implementation Summary

## Overview

The multilingual insights feature allows users to receive AI-generated insights about Quran verses and Hadith in their preferred language. This document provides a summary of the implementation details.

## Supported Languages

- English
- Malay (Bahasa Melayu)
- Arabic (العربية)
- Mandarin (中文)

## Implementation Components

### 1. Language Context Provider

The `LanguageContext.tsx` file implements a React context provider that manages the user's language preference. It includes:

- A `SupportedLanguage` type that defines the available languages
- The `useLanguage` hook for accessing the current language and setting a new language
- Functions for loading and saving the user's language preference to Supabase
- Error handling for cases where the `user_preferences` table doesn't exist yet

### 2. OpenAI Client

The `client.ts` file has been updated to include language support in the insight generation functions:

- `generateQuranInsight` and `generateHadithInsight` functions now accept a language parameter
- The language parameter is passed to the API routes
- English is set as the default language for backward compatibility

### 3. API Routes

The API routes for Quran and Hadith insights have been updated to support multiple languages:

- Language-specific system prompts for each supported language
- Language-specific user prompts for each supported language
- The language parameter is extracted from the request body
- The language is used to select the appropriate prompts for the OpenAI API call

### 4. Database Changes

The following database changes have been made:

- Added a `language` column to the `quran_insights` table with a default value of 'english'
- Added a `language` column to the `hadith_insights` table with a default value of 'english'
- Created a new `user_preferences` table to store user language preferences
- Set up Row Level Security (RLS) policies for the `user_preferences` table

### 5. Settings UI

The settings page has been updated to include a language selection UI:

- Added a new "Content" tab in the settings page
- Added buttons for selecting the preferred language
- Added a loading spinner for when the preference is being updated
- Added explanatory text about the language feature

### 6. Migration Scripts

Several scripts have been created to help with the migration process:

- `run-migrations.js`: Runs the database migrations
- `update-existing-insights.js`: Updates existing insights to set their language to 'english'
- `test-language-feature.js`: Tests the language feature by generating insights in all supported languages

## How It Works

1. When a user logs in, the `LanguageProvider` loads their language preference from the `user_preferences` table
2. If no preference exists, it defaults to English
3. When the user selects a new language in the settings page, the preference is saved to the database
4. When the user generates a new insight, the selected language is passed to the OpenAI API
5. The API uses language-specific prompts to generate the insight in the selected language
6. The insight is saved to the database with the language information

## Future Improvements

Potential future improvements to the language feature include:

1. Adding support for more languages
2. Improving the translation quality for non-English languages
3. Adding a language detection feature to automatically detect the language of the input text
4. Adding a translation feature to translate existing insights to different languages
5. Adding language-specific fonts and text direction support for languages like Arabic