import { View, Text, StyleSheet, FlatList, Pressable, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '@/store/gameStore';
import { Heart, Star, Play } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;

export default function FavoritesScreen() {
  const { getFavoriteGames } = useGameStore();
  const router = useRouter();
  const favoriteGames = getFavoriteGames();

  if (favoriteGames.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Favorites</Text>
          <Text style={styles.subtitle}>Your saved games</Text>
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Heart size={64} color="#8B5CF6" strokeWidth={1.5} />
          </View>
          <Text style={styles.emptyTitle}>No favorites yet!</Text>
          <Text style={styles.emptyText}>
            Explore games and tap ❤️ to save them here
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.subtitle}>{favoriteGames.length} saved games</Text>
      </View>

      <FlatList
        data={favoriteGames}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <Pressable
            style={styles.gameCard}
            onPress={() => router.push(`/game/${item.id}`)}>
            <Image
              source={{ uri: item.thumbnail_url }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(15, 23, 42, 0.95)']}
              style={styles.gradient}
            />
            <View style={styles.cardContent}>
              <Text style={styles.gameName} numberOfLines={2}>
                {item.title}
              </Text>
              <View style={styles.stats}>
                <View style={styles.statItem}>
                  <Star size={12} color="#FBBF24" fill="#FBBF24" />
                  <Text style={styles.statText}>{item.rating.toFixed(1)}</Text>
                </View>
                <View style={styles.statItem}>
                  <Play size={12} color="#06B6D4" fill="#06B6D4" />
                  <Text style={styles.statText}>
                    {item.play_count > 1000
                      ? `${(item.play_count / 1000).toFixed(1)}k`
                      : item.play_count}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.favoriteIndicator}>
              <Heart size={16} color="#EF4444" fill="#EF4444" />
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
  },
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  gameCard: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.4,
    margin: 8,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  gameName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  favoriteIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
