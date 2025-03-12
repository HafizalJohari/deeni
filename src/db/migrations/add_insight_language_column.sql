-- Add insight_language column to user_preferences table if it doesn't exist
DO $$
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'user_preferences'
        AND column_name = 'insight_language'
    ) THEN
        -- Add the column
        ALTER TABLE user_preferences ADD COLUMN insight_language VARCHAR(20) DEFAULT 'english';
        
        -- Log the change
        RAISE NOTICE 'Added insight_language column to user_preferences table';
    ELSE
        RAISE NOTICE 'insight_language column already exists in user_preferences table';
    END IF;
END $$;

-- Update existing rows to have a default value if they don't already have one
UPDATE user_preferences
SET insight_language = 'english'
WHERE insight_language IS NULL;

-- Grant appropriate permissions to authenticated users
GRANT ALL ON user_preferences TO authenticated;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully';
END $$; 