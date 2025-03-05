-- Add language column to quran_insights table
ALTER TABLE quran_insights
ADD COLUMN IF NOT EXISTS language VARCHAR(20) DEFAULT 'english';

-- Add language column to hadith_insights table
ALTER TABLE hadith_insights
ADD COLUMN IF NOT EXISTS language VARCHAR(20) DEFAULT 'english';

-- Create user_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_language VARCHAR(20) DEFAULT 'english',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT user_preferences_user_id_key UNIQUE (user_id)
);

-- Add RLS policies for user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy for selecting user's own preferences
CREATE POLICY select_own_preferences ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for inserting user's own preferences
CREATE POLICY insert_own_preferences ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for updating user's own preferences
CREATE POLICY update_own_preferences ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for deleting user's own preferences
CREATE POLICY delete_own_preferences ON user_preferences
  FOR DELETE USING (auth.uid() = user_id); 