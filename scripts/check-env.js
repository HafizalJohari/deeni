#!/usr/bin/env node

/**
 * This script checks if all required environment variables are set
 * Run it with: node scripts/check-env.js
 */

const dotenv = require('dotenv');
const path = require('path');

// Load .env.local first (if it exists), then .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const requiredEnvVars = [
  {
    name: 'OPENAI_API_KEY',
    description: 'Required for AI features like daily reminders and insights',
    prefix: 'sk-',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    description: 'Required for Supabase connection',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Required for Supabase client-side authentication',
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Required for Supabase server-side operations',
  },
];

let hasErrors = false;
console.log('\n===== Environment Variables Check =====\n');

requiredEnvVars.forEach(({ name, description, prefix }) => {
  const value = process.env[name];
  
  if (!value) {
    console.error(`❌ ${name}: Not set - ${description}`);
    hasErrors = true;
  } else if (prefix && !value.startsWith(prefix)) {
    console.warn(`⚠️ ${name}: Value doesn't start with expected prefix '${prefix}' - This may not be a valid key`);
    hasErrors = true;
  } else {
    // For security, only show a portion of the actual value
    const displayValue = value.substring(0, 5) + '...' + value.substring(value.length - 4);
    console.log(`✅ ${name}: ${displayValue} - Properly configured`);
  }
});

if (hasErrors) {
  console.log('\n⚠️ Some environment variables are missing or invalid.');
  console.log('Please check your .env or .env.local file and configure the missing variables.');
  console.log('You can use the .env.example file as a template.\n');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are properly configured!\n');
} 