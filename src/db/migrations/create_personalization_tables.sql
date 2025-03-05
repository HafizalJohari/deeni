-- Create extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create mood_entries table
CREATE TABLE IF NOT EXISTS mood_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_rating INTEGER NOT NULL CHECK (mood_rating BETWEEN 1 AND 5),
  mood_tags TEXT[] DEFAULT '{}',
  reflection_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create growth_plans table
CREATE TABLE IF NOT EXISTS growth_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create growth_plan_goals table
CREATE TABLE IF NOT EXISTS growth_plan_goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  plan_id UUID REFERENCES growth_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_completion_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create content_preferences table
CREATE TABLE IF NOT EXISTS content_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  topics TEXT[] DEFAULT '{}',
  preferred_formats TEXT[] DEFAULT '{}',
  difficulty_level TEXT DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create content_recommendations table
CREATE TABLE IF NOT EXISTS content_recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  relevance_score FLOAT CHECK (relevance_score BETWEEN 0 AND 1),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'viewed', 'saved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create personalization_settings table
CREATE TABLE IF NOT EXISTS personalization_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  allow_data_collection BOOLEAN DEFAULT true,
  daily_reflection_reminders BOOLEAN DEFAULT true,
  weekly_growth_updates BOOLEAN DEFAULT true,
  content_recommendation_alerts BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Set up Row Level Security (RLS) policies

-- mood_entries policies
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY mood_entries_select ON mood_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY mood_entries_insert ON mood_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY mood_entries_update ON mood_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY mood_entries_delete ON mood_entries
  FOR DELETE USING (auth.uid() = user_id);

-- growth_plans policies
ALTER TABLE growth_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY growth_plans_select ON growth_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY growth_plans_insert ON growth_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY growth_plans_update ON growth_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY growth_plans_delete ON growth_plans
  FOR DELETE USING (auth.uid() = user_id);

-- growth_plan_goals policies
ALTER TABLE growth_plan_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY growth_plan_goals_select ON growth_plan_goals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM growth_plans
      WHERE growth_plans.id = growth_plan_goals.plan_id
      AND growth_plans.user_id = auth.uid()
    )
  );

CREATE POLICY growth_plan_goals_insert ON growth_plan_goals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM growth_plans
      WHERE growth_plans.id = growth_plan_goals.plan_id
      AND growth_plans.user_id = auth.uid()
    )
  );

CREATE POLICY growth_plan_goals_update ON growth_plan_goals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM growth_plans
      WHERE growth_plans.id = growth_plan_goals.plan_id
      AND growth_plans.user_id = auth.uid()
    )
  );

CREATE POLICY growth_plan_goals_delete ON growth_plan_goals
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM growth_plans
      WHERE growth_plans.id = growth_plan_goals.plan_id
      AND growth_plans.user_id = auth.uid()
    )
  );

-- content_preferences policies
ALTER TABLE content_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY content_preferences_select ON content_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY content_preferences_insert ON content_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY content_preferences_update ON content_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY content_preferences_delete ON content_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- content_recommendations policies
ALTER TABLE content_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY content_recommendations_select ON content_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY content_recommendations_insert ON content_recommendations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY content_recommendations_update ON content_recommendations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY content_recommendations_delete ON content_recommendations
  FOR DELETE USING (auth.uid() = user_id);

-- personalization_settings policies
ALTER TABLE personalization_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY personalization_settings_select ON personalization_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY personalization_settings_insert ON personalization_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY personalization_settings_update ON personalization_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY personalization_settings_delete ON personalization_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_mood_entries_updated_at
  BEFORE UPDATE ON mood_entries
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_growth_plans_updated_at
  BEFORE UPDATE ON growth_plans
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_growth_plan_goals_updated_at
  BEFORE UPDATE ON growth_plan_goals
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_content_preferences_updated_at
  BEFORE UPDATE ON content_preferences
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_content_recommendations_updated_at
  BEFORE UPDATE ON content_recommendations
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_personalization_settings_updated_at
  BEFORE UPDATE ON personalization_settings
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column(); 