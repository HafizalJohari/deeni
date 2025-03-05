-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    knowledge_level text CHECK (knowledge_level in ('beginner', 'intermediate', 'advanced')),
    interests text[] NOT NULL DEFAULT '{}',
    preferred_language text,
    preferred_content_types text[] NOT NULL DEFAULT '{}',
    notification_preferences jsonb NOT NULL DEFAULT '{
        "prayerTimes": true,
        "dailyReminders": true,
        "weeklyReports": true,
        "useVoiceNotifications": false
    }',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id)
);

-- Create mood_entries table
CREATE TABLE IF NOT EXISTS mood_entries (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    description text NOT NULL,
    analysis jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create RLS policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

-- Policies for user_preferences
CREATE POLICY "Users can view own preferences"
    ON user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
    ON user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
    ON user_preferences FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policies for mood_entries
CREATE POLICY "Users can view own mood entries"
    ON mood_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood entries"
    ON mood_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood entries"
    ON mood_entries FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER set_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_mood_entries_updated_at
    BEFORE UPDATE ON mood_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at(); 