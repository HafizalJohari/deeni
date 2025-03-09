-- Create the learning_content table
CREATE TABLE IF NOT EXISTS learning_content (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  category TEXT,
  tags TEXT[],
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_learning_content_author ON learning_content(author_id);
CREATE INDEX IF NOT EXISTS idx_learning_content_slug ON learning_content(slug);
CREATE INDEX IF NOT EXISTS idx_learning_content_category ON learning_content(category);
CREATE INDEX IF NOT EXISTS idx_learning_content_published ON learning_content(published);

-- Enable Row Level Security (RLS)
ALTER TABLE learning_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public users can read published content"
  ON learning_content
  FOR SELECT
  USING (published = true);

CREATE POLICY "Authenticated users can read all content"
  ON learning_content
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own content"
  ON learning_content
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own content"
  ON learning_content
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own content"
  ON learning_content
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_learning_content_updated_at
  BEFORE UPDATE ON learning_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 