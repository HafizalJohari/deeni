-- Add analysis column to self_reflections table if it doesn't exist
DO $$
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'self_reflections'
        AND column_name = 'analysis'
    ) THEN
        -- Add the column with default value
        ALTER TABLE self_reflections 
        ADD COLUMN analysis JSONB NOT NULL DEFAULT '{
            "islamicPerspective": "",
            "recommendations": [],
            "spiritualGuidance": "",
            "relevantVerses": [],
            "relevantHadith": []
        }';
        
        RAISE NOTICE 'Added analysis column to self_reflections table';
    ELSE
        RAISE NOTICE 'analysis column already exists in self_reflections table';
    END IF;
END $$;

-- Update existing rows to have the default value if they don't already have one
UPDATE self_reflections
SET analysis = '{
    "islamicPerspective": "",
    "recommendations": [],
    "spiritualGuidance": "",
    "relevantVerses": [],
    "relevantHadith": []
}'
WHERE analysis IS NULL;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully';
END $$; 