// This script runs the database migrations
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or service role key');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('Running migrations...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../db/migrations/add_language_to_insights.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSql });
    
    if (error) {
      console.error('Error running migration:', error);
      process.exit(1);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

runMigration(); 