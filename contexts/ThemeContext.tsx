import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export type Theme = 'light' | 'dark' | 'auto';

interface ThemeColors {
  background: string;
  surface: string;
  surfaceVariant: string;
  primary: string;
  primaryVariant: string;
  secondary: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  cardBackground: string;
  cardBorder: string;
  overlay: string;
  shadow: string;
}

export const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F8FAFC',
  surfaceVariant: '#F1F5F9',
  primary: '#8B5CF6',
  primaryVariant: '#7C3AED',
  secondary: '#06B6D4',
  text: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  border: '#E2E8F0',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  cardBackground: '#FFFFFF',
  cardBorder: '#E2E8F0',
  overlay: 'rgba(15, 23, 42, 0.5)',
  shadow: '#000000',
};

export const darkColors: ThemeColors = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceVariant: '#334155',
  primary: '#A78BFA',
  primaryVariant: '#8B5CF6',
  secondary: '#22D3EE',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textTertiary: '#94A3B8',
  border: '#334155',
  error: '#F87171',
  success: '#34D399',
  warning: '#FBBF24',
  cardBackground: '#1E293B',
  cardBorder: '#334155',
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: '#000000',
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('auto');
  const [isLoading, setIsLoading] = useState(true);

  const isDark = theme === 'auto'
    ? systemColorScheme === 'dark'
    : theme === 'dark';

  const colors = isDark ? darkColors : lightColors;

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto')) {
        setThemeState(savedTheme as Theme);
      }
    } catch (error) {
      console.error('[Theme] Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem('theme', newTheme);
      console.log('[Theme] Theme changed to:', newTheme);
    } catch (error) {
      console.error('[Theme] Error saving theme:', error);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, colors, isDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
