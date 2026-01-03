import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useGameStore } from '@/store/gameStore';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function RootLayout() {
  useFrameworkReady();

  const { fetchGames, fetchCategories, fetchFavorites } = useGameStore();

  useEffect(() => {
    fetchCategories();
    fetchFavorites();
    fetchGames();
  }, []);

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="game/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
