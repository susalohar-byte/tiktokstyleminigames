export interface Category {
  id: string;
  name: string;
  icon: string;
  order?: number;
  created_at: string;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  category_id: string;
  thumbnail_url: string;
  game_url: string;
  game_type?: 'native' | 'external';
  play_count: number;
  rating: number;
  status?: 'draft' | 'published' | 'archived';
  is_featured?: boolean;
  file_path?: string;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface GameState {
  status: 'idle' | 'countdown' | 'playing' | 'paused' | 'gameover';
  score: number;
  highScore: number;
  timeRemaining?: number;
  lives?: number;
}

export interface NativeGameProps {
  onGameOver: (finalScore: number) => void;
  onExit: () => void;
}

export interface Favorite {
  id: string;
  user_id: string;
  game_id: string;
  created_at: string;
}

export interface GameWithFavorite extends Game {
  is_favorite: boolean;
}
