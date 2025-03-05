# Database Migrations

This directory contains SQL migration files for the Deeni application database.

## Available Migrations

- `create_exec_sql_function.sql`: Creates a SQL function to execute SQL statements (required for running migrations)
- `add_language_to_insights.sql`: Adds language support to insights tables and creates user preferences table

## How to Run Migrations

### Step 1: Create the exec_sql function

First, you need to create the `exec_sql` function in your Supabase database. This function allows executing SQL statements from the migration script.

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Copy the contents of `create_exec_sql_function.sql`
4. Run the SQL query

### Step 2: Run the migration script

After creating the `exec_sql` function, you can run the migration script:

```bash
npm run migrate
```

This will execute the SQL in `add_language_to_insights.sql` to:
- Add a language column to the quran_insights and hadith_insights tables
- Create a user_preferences table to store user language preferences
- Set up Row Level Security policies for the user_preferences table

## Creating New Migrations

To create a new migration:

1. Create a new SQL file in this directory with a descriptive name
2. Update the migration script in `src/scripts/run-migrations.js` to include your new migration file
3. Follow the steps above to run the migration 