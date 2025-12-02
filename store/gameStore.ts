import { create } from 'zustand';
import { Game, Category, GameWithFavorite } from '@/types';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface GameStore {
  games: GameWithFavorite[];
  categories: Category[];
  favorites: Set<string>;
  currentGameId: string | null;
  loading: boolean;
  error: string | null;

  fetchGames: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (gameId: string) => Promise<void>;
  setCurrentGame: (gameId: string | null) => void;
  incrementPlayCount: (gameId: string) => Promise<void>;
  getGamesByCategory: (categoryId: string) => GameWithFavorite[];
  getFavoriteGames: () => GameWithFavorite[];
}

const FAVORITES_KEY = '@minigames:favorites';

export const useGameStore = create<GameStore>((set, get) => ({
  games: [],
  categories: [],
  favorites: new Set<string>(),
  currentGameId: null,
  loading: false,
  error: null,

  fetchGames: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*, category:categories(*)')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const favorites = get().favorites;
      const gamesWithFavorites: GameWithFavorite[] = (data || []).map(game => ({
        ...game,
        is_favorite: favorites.has(game.id),
      }));

      set({ games: gamesWithFavorites, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      set({ categories: data || [] });
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  },

  fetchFavorites: async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      const favoriteIds = stored ? JSON.parse(stored) : [];
      set({ favorites: new Set(favoriteIds) });

      const games = get().games;
      if (games.length > 0) {
        const updatedGames = games.map(game => ({
          ...game,
          is_favorite: favoriteIds.includes(game.id),
        }));
        set({ games: updatedGames });
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  },

  toggleFavorite: async (gameId: string) => {
    const { favorites, games } = get();
    const newFavorites = new Set(favorites);

    if (newFavorites.has(gameId)) {
      newFavorites.delete(gameId);
    } else {
      newFavorites.add(gameId);
    }

    const updatedGames = games.map(game => ({
      ...game,
      is_favorite: newFavorites.has(game.id),
    }));

    set({ favorites: newFavorites, games: updatedGames });

    try {
      await AsyncStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(Array.from(newFavorites))
      );

      if (newFavorites.has(gameId)) {
        await supabase.from('favorites').insert({
          game_id: gameId,
        });
      } else {
        await supabase
          .from('favorites')
          .delete()
          .eq('game_id', gameId);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  },

  setCurrentGame: (gameId: string | null) => {
    set({ currentGameId: gameId });
  },

  incrementPlayCount: async (gameId: string) => {
    try {
      const game = get().games.find(g => g.id === gameId);
      if (!game) return;

      const newPlayCount = game.play_count + 1;

      const { error } = await supabase
        .from('games')
        .update({ play_count: newPlayCount })
        .eq('id', gameId);

      if (error) throw error;

      const updatedGames = get().games.map(g =>
        g.id === gameId ? { ...g, play_count: newPlayCount } : g
      );
      set({ games: updatedGames });
    } catch (error) {
      console.error('Error incrementing play count:', error);
    }
  },

  getGamesByCategory: (categoryId: string) => {
    return get().games.filter(game => game.category_id === categoryId);
  },

  getFavoriteGames: () => {
    const { games, favorites } = get();
    return games.filter(game => favorites.has(game.id));
  },
}));
