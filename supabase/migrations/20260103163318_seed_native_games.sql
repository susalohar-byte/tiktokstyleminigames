/*
  # Seed Native React Native Mini Games

  1. Purpose
    - Add 8 native React Native games to the games table
    - Games are instantly playable without WebView delays
    - No CORS or embedding issues
    
  2. Games Added
    - Color Tap Frenzy (Arcade) - Tap matching colored circles
    - Math Blast (Puzzle) - Solve math problems quickly
    - Memory Flip (Puzzle) - Match pairs of cards
    - Stack Master (Arcade) - Stack platforms perfectly
    - Balloon Pop Rush (Casual) - Pop balloons before they escape
    - Reaction Speed Test (Casual) - Test your reaction time
    - Word Swipe (Puzzle) - Find hidden words in grid
    - Pattern Clone (Strategy) - Memorize and repeat patterns
    
  3. Details
    - All games are marked as game_type = 'native'
    - game_url field contains the game ID for the registry
    - thumbnail_url uses placeholder images from Pexels
    - All games are published and playable immediately
    - Ratings set between 4.0-4.8
*/

-- Insert native games only if they don't already exist
INSERT INTO games (title, description, category_id, thumbnail_url, game_url, game_type, rating, status, is_featured, play_count)
SELECT 
  'Color Tap Frenzy',
  'Tap the circles that match the target color! Fast-paced color matching action with increasing difficulty.',
  (SELECT id FROM categories WHERE name = 'Arcade' LIMIT 1),
  'https://images.pexels.com/photos/17485708/pexels-photo-17485708.jpeg',
  'color-tap-frenzy',
  'native',
  4.5,
  'published',
  true,
  0
WHERE NOT EXISTS (
  SELECT 1 FROM games WHERE game_url = 'color-tap-frenzy'
);

INSERT INTO games (title, description, category_id, thumbnail_url, game_url, game_type, rating, status, is_featured, play_count)
SELECT 
  'Math Blast',
  'Solve math problems as quickly as possible! Build a streak for bonus points in this educational brain game.',
  (SELECT id FROM categories WHERE name = 'Puzzle' LIMIT 1),
  'https://images.pexels.com/photos/3729557/pexels-photo-3729557.jpeg',
  'math-blast',
  'native',
  4.6,
  'published',
  true,
  0
WHERE NOT EXISTS (
  SELECT 1 FROM games WHERE game_url = 'math-blast'
);

INSERT INTO games (title, description, category_id, thumbnail_url, game_url, game_type, rating, status, is_featured, play_count)
SELECT 
  'Memory Flip',
  'Classic memory card game! Match all the pairs with as few moves as possible for a high score.',
  (SELECT id FROM categories WHERE name = 'Puzzle' LIMIT 1),
  'https://images.pexels.com/photos/5699456/pexels-photo-5699456.jpeg',
  'memory-flip',
  'native',
  4.7,
  'published',
  false,
  0
WHERE NOT EXISTS (
  SELECT 1 FROM games WHERE game_url = 'memory-flip'
);

INSERT INTO games (title, description, category_id, thumbnail_url, game_url, game_type, rating, status, is_featured, play_count)
SELECT 
  'Stack Master',
  'Stack platforms perfectly to build the highest tower! Misaligned drops make platforms smaller.',
  (SELECT id FROM categories WHERE name = 'Arcade' LIMIT 1),
  'https://images.pexels.com/photos/452738/pexels-photo-452738.jpeg',
  'stack-master',
  'native',
  4.4,
  'published',
  false,
  0
WHERE NOT EXISTS (
  SELECT 1 FROM games WHERE game_url = 'stack-master'
);

INSERT INTO games (title, description, category_id, thumbnail_url, game_url, game_type, rating, status, is_featured, play_count)
SELECT 
  'Balloon Pop Rush',
  'Pop balloons before they escape! Collect bonus stars for extra time, but avoid the bombs!',
  (SELECT id FROM categories WHERE name = 'Casual' LIMIT 1),
  'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg',
  'balloon-pop-rush',
  'native',
  4.3,
  'published',
  false,
  0
WHERE NOT EXISTS (
  SELECT 1 FROM games WHERE game_url = 'balloon-pop-rush'
);

INSERT INTO games (title, description, category_id, thumbnail_url, game_url, game_type, rating, status, is_featured, play_count)
SELECT 
  'Reaction Speed Test',
  'Test your reaction time! Wait for the green screen, then tap as fast as you can. Get your average over 5 rounds.',
  (SELECT id FROM categories WHERE name = 'Casual' LIMIT 1),
  'https://images.pexels.com/photos/1040160/pexels-photo-1040160.jpeg',
  'reaction-speed-test',
  'native',
  4.2,
  'published',
  false,
  0
WHERE NOT EXISTS (
  SELECT 1 FROM games WHERE game_url = 'reaction-speed-test'
);

INSERT INTO games (title, description, category_id, thumbnail_url, game_url, game_type, rating, status, is_featured, play_count)
SELECT 
  'Word Swipe',
  'Find hidden words in the letter grid! Swipe across letters to form words before time runs out.',
  (SELECT id FROM categories WHERE name = 'Puzzle' LIMIT 1),
  'https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg',
  'word-swipe',
  'native',
  4.1,
  'published',
  false,
  0
WHERE NOT EXISTS (
  SELECT 1 FROM games WHERE game_url = 'word-swipe'
);

INSERT INTO games (title, description, category_id, thumbnail_url, game_url, game_type, rating, status, is_featured, play_count)
SELECT 
  'Pattern Clone',
  'Watch the pattern carefully, then repeat it! Pattern gets longer each round. 3 lives to beat your best.',
  (SELECT id FROM categories WHERE name = 'Strategy' LIMIT 1),
  'https://images.pexels.com/photos/6984993/pexels-photo-6984993.jpeg',
  'pattern-clone',
  'native',
  4.8,
  'published',
  true,
  0
WHERE NOT EXISTS (
  SELECT 1 FROM games WHERE game_url = 'pattern-clone'
);
