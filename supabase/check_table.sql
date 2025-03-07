-- Create jakim_zones table
CREATE TABLE IF NOT EXISTS jakim_zones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  negeri TEXT NOT NULL,
  daerah TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create an index on the code column for faster lookups
CREATE INDEX IF NOT EXISTS jakim_zones_code_idx ON jakim_zones(code);

-- Add RLS policies
ALTER TABLE jakim_zones ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access"
  ON jakim_zones
  FOR SELECT
  TO public
  USING (true);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at
CREATE TRIGGER update_jakim_zones_updated_at
  BEFORE UPDATE ON jakim_zones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 