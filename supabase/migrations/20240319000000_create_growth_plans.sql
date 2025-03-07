-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own growth plans" ON growth_plans;
DROP POLICY IF EXISTS "Users can insert their own growth plans" ON growth_plans;
DROP POLICY IF EXISTS "Users can update their own growth plans" ON growth_plans;
DROP POLICY IF EXISTS "Users can view their own mood entries" ON mood_entries;
DROP POLICY IF EXISTS "Users can insert their own mood entries" ON mood_entries;
DROP POLICY IF EXISTS "Users can update their own mood entries" ON mood_entries;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_growth_plans_updated_at ON growth_plans;
DROP TRIGGER IF EXISTS update_mood_entries_updated_at ON mood_entries;

-- Create the mood_entries table if it doesn't exist
CREATE TABLE IF NOT EXISTS mood_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mood_rating INTEGER NOT NULL CHECK (mood_rating BETWEEN 1 AND 5),
    mood_description TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the mood_analysis table if it doesn't exist
CREATE TABLE IF NOT EXISTS mood_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mood_entry_id UUID NOT NULL REFERENCES mood_entries(id) ON DELETE CASCADE,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the growth_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS growth_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    focus_areas TEXT[] NOT NULL DEFAULT '{}',
    goals JSONB NOT NULL DEFAULT '[]',
    mood_patterns JSONB NOT NULL DEFAULT '[]',
    recommendations TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security for all tables
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for mood_entries
CREATE POLICY "Users can view their own mood entries"
    ON mood_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mood entries"
    ON mood_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood entries"
    ON mood_entries FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create policies for mood_analysis
CREATE POLICY "Users can view their own mood analysis"
    ON mood_analysis FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM mood_entries
        WHERE mood_entries.id = mood_analysis.mood_entry_id
        AND mood_entries.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own mood analysis"
    ON mood_analysis FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM mood_entries
        WHERE mood_entries.id = mood_analysis.mood_entry_id
        AND mood_entries.user_id = auth.uid()
    ));

-- Create policies for growth_plans
CREATE POLICY "Users can view their own growth plans"
    ON growth_plans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own growth plans"
    ON growth_plans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own growth plans"
    ON growth_plans FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS mood_entries_user_id_idx ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS mood_entries_created_at_idx ON mood_entries(created_at);
CREATE INDEX IF NOT EXISTS mood_analysis_mood_entry_id_idx ON mood_analysis(mood_entry_id);
CREATE INDEX IF NOT EXISTS growth_plans_user_id_idx ON growth_plans(user_id);
CREATE INDEX IF NOT EXISTS growth_plans_created_at_idx ON growth_plans(created_at);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mood_entries_updated_at
    BEFORE UPDATE ON mood_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mood_analysis_updated_at
    BEFORE UPDATE ON mood_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_growth_plans_updated_at
    BEFORE UPDATE ON growth_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 