/*
  # Add game_type column to games table

  1. Changes
    - Add `game_type` column to games table
      - Type: text with CHECK constraint
      - Values: 'native' | 'external'
      - Default: 'external' (for backwards compatibility)
      - NOT NULL constraint
    
  2. Purpose
    - Distinguish between native React Native games and external WebView games
    - Native games: Built with React Native, instant playability
    - External games: Loaded via WebView from external URLs
    
  3. Migration Safety
    - Uses IF NOT EXISTS pattern
    - Sets default value to avoid breaking existing data
    - All existing games will be marked as 'external'
*/

-- Add game_type column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'game_type'
  ) THEN
    ALTER TABLE games 
    ADD COLUMN game_type text NOT NULL DEFAULT 'external' 
    CHECK (game_type IN ('native', 'external'));
  END IF;
END $$;