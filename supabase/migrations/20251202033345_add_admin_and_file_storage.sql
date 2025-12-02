/*
  # Add Admin Users and File Storage Support

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `email` (text, unique) - Admin email
      - `password_hash` (text) - Hashed password
      - `role` (text) - Admin role (super_admin, editor, viewer)
      - `created_at` (timestamptz)
      - `last_login` (timestamptz)
    
    - `game_files`
      - `id` (uuid, primary key)
      - `game_id` (uuid, foreign key to games)
      - `file_path` (text) - Path in storage bucket
      - `file_size` (bigint) - File size in bytes
      - `file_type` (text) - MIME type
      - `created_at` (timestamptz)
    
    - `admin_logs`
      - `id` (uuid, primary key)
      - `admin_id` (uuid, foreign key to admin_users)
      - `action` (text) - Action performed
      - `resource_type` (text) - Type of resource (game, category, etc)
      - `resource_id` (uuid) - ID of affected resource
      - `created_at` (timestamptz)

  2. Schema Updates
    - Add `status` column to games (draft, published, archived)
    - Add `is_featured` column to games
    - Add `file_path` column to games for uploaded HTML5 files
    - Add `order` column to categories for sorting

  3. Security
    - Enable RLS on all new tables
    - Admin operations require authentication
    - Audit all admin actions
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'editor' CHECK (role IN ('super_admin', 'editor', 'viewer')),
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Create game_files table
CREATE TABLE IF NOT EXISTS game_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  file_path text NOT NULL,
  file_size bigint DEFAULT 0,
  file_type text DEFAULT 'text/html',
  created_at timestamptz DEFAULT now()
);

-- Create admin_logs table
CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Add new columns to games table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'status'
  ) THEN
    ALTER TABLE games ADD COLUMN status text DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE games ADD COLUMN is_featured boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'file_path'
  ) THEN
    ALTER TABLE games ADD COLUMN file_path text;
  END IF;
END $$;

-- Add order column to categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'order'
  ) THEN
    ALTER TABLE categories ADD COLUMN "order" integer DEFAULT 0;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_game_files_game ON game_files(game_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_featured ON games(is_featured) WHERE is_featured = true;

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_users (only for authenticated admins)
CREATE POLICY "Admins can view all admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can manage admin users"
  ON admin_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'super_admin'
    )
  );

-- RLS Policies for game_files (public read for serving games)
CREATE POLICY "Anyone can view game files"
  ON game_files FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage game files"
  ON game_files FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for admin_logs (read-only for admins)
CREATE POLICY "Admins can view logs"
  ON admin_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert logs"
  ON admin_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Update games table policies to consider status
DROP POLICY IF EXISTS "Anyone can view games" ON games;

CREATE POLICY "Anyone can view published games"
  ON games FOR SELECT
  USING (status = 'published' OR auth.role() = 'authenticated');

-- Allow authenticated users to manage games
CREATE POLICY "Authenticated users can insert games"
  ON games FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update games"
  ON games FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete games"
  ON games FOR DELETE
  TO authenticated
  USING (true);

-- Allow authenticated users to manage categories
CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  p_action text,
  p_resource_type text,
  p_resource_id uuid,
  p_details jsonb DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
  INSERT INTO admin_logs (admin_id, action, resource_type, resource_id, details)
  VALUES (auth.uid(), p_action, p_resource_type, p_resource_id, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;