-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own growth plans" ON growth_plans;
DROP POLICY IF EXISTS "Users can insert their own growth plans" ON growth_plans;
DROP POLICY IF EXISTS "Users can update their own growth plans" ON growth_plans;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_growth_plans_updated_at ON growth_plans;

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

-- Enable Row Level Security
ALTER TABLE growth_plans ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS growth_plans_user_id_idx;
DROP INDEX IF EXISTS growth_plans_created_at_idx;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS growth_plans_user_id_idx ON growth_plans(user_id);
CREATE INDEX IF NOT EXISTS growth_plans_created_at_idx ON growth_plans(created_at);

-- Create trigger using the existing update_updated_at_column function
CREATE TRIGGER update_growth_plans_updated_at
    BEFORE UPDATE ON growth_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 