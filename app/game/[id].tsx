import { View, Text, StyleSheet, Pressable, ActivityIndicator, Share, Alert, Platform } from 'react-native';
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
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [loadTimeout, setLoadTimeout] = useState(false);

  const game = games.find(g => g.id === id);

  useEffect(() => {
    if (game) {
      incrementPlayCount(game.id);
      setDebugInfo(`Loading URL: ${game.game_url}`);
      console.log('[GamePlayer] Game loaded:', {
        id: game.id,
        title: game.title,
        url: game.game_url,
        platform: Platform.OS,
      });

      const timeout = setTimeout(() => {
        if (loading) {
          console.warn('[GamePlayer] Load timeout - game may be blocked from embedding');
          setLoadTimeout(true);
        }
      }, 15000);

      return () => clearTimeout(timeout);
    }
  }, [game?.id, loading]);

  if (!game) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Game not found</Text>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('[GamePlayer] WebView error:', {
      code: nativeEvent.code,
      description: nativeEvent.description,
      url: game.game_url,
    });
    setLoading(false);
    setError(`Failed to load game: ${nativeEvent.description || 'Unknown error'}`);
  };

  const handleWebViewHttpError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('[GamePlayer] HTTP error:', {
      statusCode: nativeEvent.statusCode,
      description: nativeEvent.description,
      url: nativeEvent.url,
    });
    setError(`HTTP Error ${nativeEvent.statusCode}: ${nativeEvent.description}`);
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setLoadTimeout(false);
    console.log('[GamePlayer] Retrying game load:', game.game_url);
  };

  const handleOpenInBrowser = async () => {
    try {
      const supported = await Linking.canOpenURL(game.game_url);
      if (supported) {
        await Linking.openURL(game.game_url);
      } else {
        Alert.alert('Error', 'Cannot open this URL');
      }
    } catch (error) {
      console.error('[GamePlayer] Error opening browser:', error);
      Alert.alert('Error', 'Failed to open game in browser');
    }
  };

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
        {error ? (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorTitle}>Unable to Load Game</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <Text style={styles.errorHint}>
              This game may block embedding in apps. Try opening it in your browser instead.
            </Text>
            <Text style={styles.debugText}>URL: {game.game_url}</Text>
            <View style={styles.errorButtons}>
              <Pressable onPress={handleOpenInBrowser} style={styles.browserButton}>
                <Text style={styles.browserButtonText}>Open in Browser</Text>
              </Pressable>
              <Pressable onPress={handleRetry} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </Pressable>
            </View>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {loading && loadTimeout && (
              <View style={styles.timeoutOverlay}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text style={styles.loadingText}>Still loading...</Text>
                <Text style={styles.timeoutHint}>
                  The game is taking longer than usual. It may not support embedding.
                </Text>
                <Pressable onPress={handleOpenInBrowser} style={styles.browserButton}>
                  <Text style={styles.browserButtonText}>Open in Browser Instead</Text>
                </Pressable>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                  <Text style={styles.backButtonText}>Go Back</Text>
                </Pressable>
              </View>
            )}
            {loading && !loadTimeout && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text style={styles.loadingText}>Loading {game.title}...</Text>
                {__DEV__ && <Text style={styles.debugText}>{debugInfo}</Text>}
              </View>
            )}
            <WebView
              key={game.id}
              source={{ uri: game.game_url }}
              style={styles.webView}
              onLoadStart={(syntheticEvent) => {
                setLoading(true);
                setLoadTimeout(false);
                console.log('[GamePlayer] Load started:', syntheticEvent.nativeEvent.url);
              }}
              onLoadEnd={(syntheticEvent) => {
                setLoading(false);
                setLoadTimeout(false);
                console.log('[GamePlayer] Load finished:', syntheticEvent.nativeEvent.url);
              }}
              onLoadProgress={({ nativeEvent }) => {
                console.log('[GamePlayer] Load progress:', nativeEvent.progress);
              }}
              onError={handleWebViewError}
              onHttpError={handleWebViewHttpError}
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
              scalesPageToFit
              originWhitelist={['*']}
              mixedContentMode="always"
              allowFileAccess
              allowUniversalAccessFromFileURLs
              onMessage={(event) => {
                console.log('[GamePlayer] Message from WebView:', event.nativeEvent.data);
              }}
            />
          </>
        )}
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
  errorOverlay: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  debugText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  errorButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  retryButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
  },
  timeoutOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    zIndex: 10,
  },
  timeoutHint: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  errorHint: {
    fontSize: 14,
    color: '#FBBF24',
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  browserButton: {
    backgroundColor: '#06B6D4',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  browserButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
