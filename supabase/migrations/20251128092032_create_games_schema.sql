/*
  # Create Mini Games Platform Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Category name (Puzzle, Arcade, Action, etc.)
      - `icon` (text) - Icon name for the category
      - `created_at` (timestamptz)
    
    - `games`
      - `id` (uuid, primary key)
      - `title` (text) - Game title
      - `description` (text) - Game description
      - `category_id` (uuid, foreign key to categories)
      - `thumbnail_url` (text) - Thumbnail image URL
      - `game_url` (text) - URL to load the game
      - `play_count` (integer) - Number of times played
      - `rating` (numeric) - Average rating (0-5)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - User who favorited (for future auth)
      - `game_id` (uuid, foreign key to games)
      - `created_at` (timestamptz)
      - Unique constraint on (user_id, game_id)

  2. Security
    - Enable RLS on all tables
    - Public read access for categories and games (anyone can browse)
    - Favorites require authentication in future (for now, allow anonymous)

  3. Indexes
    - Index on games.category_id for fast filtering
    - Index on favorites.game_id for fast lookups
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  icon text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  thumbnail_url text NOT NULL,
  game_url text NOT NULL,
  play_count integer DEFAULT 0,
  rating numeric(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, game_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_games_category ON games(category_id);
CREATE INDEX IF NOT EXISTS idx_games_rating ON games(rating DESC);
CREATE INDEX IF NOT EXISTS idx_games_play_count ON games(play_count DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_game ON favorites(game_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read)
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  USING (true);

-- RLS Policies for games (public read)
CREATE POLICY "Anyone can view games"
  ON games FOR SELECT
  USING (true);

-- RLS Policies for favorites (allow all for now, will add auth later)
CREATE POLICY "Anyone can view favorites"
  ON favorites FOR SELECT
  USING (true);

CREATE POLICY "Anyone can add favorites"
  ON favorites FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete favorites"
  ON favorites FOR DELETE
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();