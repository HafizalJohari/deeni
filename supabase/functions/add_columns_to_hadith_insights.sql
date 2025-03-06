CREATE OR REPLACE FUNCTION add_columns_to_hadith_insights()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Add image_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'hadith_insights'
    AND column_name = 'image_url'
  ) THEN
    ALTER TABLE hadith_insights ADD COLUMN image_url TEXT;
  END IF;

  -- Add language column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'hadith_insights'
    AND column_name = 'language'
  ) THEN
    ALTER TABLE hadith_insights ADD COLUMN language TEXT DEFAULT 'english';
  END IF;
END;
$$; 