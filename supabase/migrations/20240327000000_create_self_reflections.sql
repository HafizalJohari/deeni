-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own reflections" ON self_reflections;
DROP POLICY IF EXISTS "Users can insert their own reflections" ON self_reflections;
DROP POLICY IF EXISTS "Users can update their own reflections" ON self_reflections;

-- Create the self_reflections table
CREATE TABLE IF NOT EXISTS self_reflections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feeling TEXT NOT NULL,
    feeling_icon TEXT NOT NULL,
    reflection_text TEXT NOT NULL,
    analysis JSONB NOT NULL DEFAULT '{
        "islamicPerspective": "",
        "recommendations": [],
        "spiritualGuidance": "",
        "relevantVerses": [],
        "relevantHadith": []
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_self_reflections_user_id ON self_reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_self_reflections_created_at ON self_reflections(created_at);

-- Enable Row Level Security
ALTER TABLE self_reflections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own reflections"
    ON self_reflections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reflections"
    ON self_reflections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reflections"
    ON self_reflections FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_self_reflections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_self_reflections_updated_at
    BEFORE UPDATE ON self_reflections
    FOR EACH ROW
    EXECUTE FUNCTION update_self_reflections_updated_at(); 