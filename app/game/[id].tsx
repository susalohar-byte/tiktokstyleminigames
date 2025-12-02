import { View, Text, StyleSheet, Pressable, ActivityIndicator, Share, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MoreVertical, Share2, Heart, Flag } from 'lucide-react-native';
import { useGameStore } from '@/store/gameStore';
import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';

export default function GamePlayerScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { games, incrementPlayCount, toggleFavorite } = useGameStore();
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  const game = games.find(g => g.id === id);

  useEffect(() => {
    if (game) {
      incrementPlayCount(game.id);
    }
  }, [game?.id]);

  if (!game) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Game not found</Text>
      </View>
    );
  }

  const handleShare = async () => {
    try {
      const url = Linking.createURL(`/game/${game.id}`);
      await Share.share({
        message: `Check out ${game.title}! ${url}`,
        title: game.title,
      });
      setShowMenu(false);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleFavorite = () => {
    toggleFavorite(game.id);
    setShowMenu(false);
  };

  const handleReport = () => {
    Alert.alert('Report Game', 'This feature is coming soon!');
    setShowMenu(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <LinearGradient
            colors={['rgba(30, 41, 59, 0.9)', 'rgba(30, 41, 59, 0.7)']}
            style={styles.iconGradient}>
            <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2.5} />
          </LinearGradient>
        </Pressable>

        <Pressable onPress={() => setShowMenu(!showMenu)} style={styles.iconButton}>
          <LinearGradient
            colors={['rgba(30, 41, 59, 0.9)', 'rgba(30, 41, 59, 0.7)']}
            style={styles.iconGradient}>
            <MoreVertical size={24} color="#FFFFFF" strokeWidth={2.5} />
          </LinearGradient>
        </Pressable>
      </View>

      {showMenu && (
        <View style={styles.menu}>
          <Pressable style={styles.menuItem} onPress={handleShare}>
            <Share2 size={20} color="#E2E8F0" />
            <Text style={styles.menuText}>Share</Text>
          </Pressable>

          <Pressable style={styles.menuItem} onPress={handleFavorite}>
            <Heart
              size={20}
              color={game.is_favorite ? '#EF4444' : '#E2E8F0'}
              fill={game.is_favorite ? '#EF4444' : 'transparent'}
            />
            <Text style={styles.menuText}>
              {game.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </Text>
          </Pressable>

          <Pressable style={styles.menuItem} onPress={handleReport}>
            <Flag size={20} color="#E2E8F0" />
            <Text style={styles.menuText}>Report</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.webViewContainer}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Loading {game.title}...</Text>
          </View>
        )}
        <WebView
          source={{ uri: game.game_url }}
          style={styles.webView}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            Alert.alert('Error', 'Failed to load game. Please try again.');
          }}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 8,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 220,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
  },
});
