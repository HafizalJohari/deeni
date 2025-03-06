-- Add image_url and language columns to hadith_insights table
ALTER TABLE hadith_insights
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'english'; 