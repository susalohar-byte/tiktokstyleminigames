import { View, Text, StyleSheet, Pressable, Image, Dimensions } from 'react-native';
import { GameWithFavorite } from '@/types';
import { Star, Heart, Play } from 'lucide-react-native';
import { useGameStore } from '@/store/gameStore';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = height * 0.75;

interface GameCardProps {
  game: GameWithFavorite;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GameCard({ game }: GameCardProps) {
  const router = useRouter();
  const { toggleFavorite } = useGameStore();
  const scale = useSharedValue(1);
  const heartScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.98, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );
    router.push(`/game/${game.id}`);
  };

  const handleDoubleTap = () => {
    toggleFavorite(game.id);
    heartScale.value = withSequence(
      withSpring(1.5, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );
  };

  return (
    <AnimatedPressable
      style={[styles.container, animatedStyle]}
      onPress={handlePress}>
      <View style={styles.card}>
        <Image
          source={{ uri: game.thumbnail_url }}
          style={styles.thumbnail}
          resizeMode="cover"
        />

        <LinearGradient
          colors={['transparent', 'rgba(15, 23, 42, 0.9)', '#0F172A']}
          style={styles.gradient}
        />

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {game.category?.name || 'Game'}
              </Text>
            </View>

            <Pressable onPress={handleDoubleTap} style={styles.favoriteButton}>
              <Animated.View style={heartAnimatedStyle}>
                <Heart
                  size={28}
                  color={game.is_favorite ? '#EF4444' : '#FFFFFF'}
                  fill={game.is_favorite ? '#EF4444' : 'transparent'}
                  strokeWidth={2}
                />
              </Animated.View>
            </Pressable>
          </View>

          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={2}>
              {game.title}
            </Text>
            {game.description ? (
              <Text style={styles.description} numberOfLines={2}>
                {game.description}
              </Text>
            ) : null}

            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Star size={16} color="#FBBF24" fill="#FBBF24" />
                <Text style={styles.statText}>{game.rating.toFixed(1)}</Text>
              </View>
              <View style={styles.statItem}>
                <Play size={16} color="#06B6D4" fill="#06B6D4" />
                <Text style={styles.statText}>
                  {game.play_count > 1000
                    ? `${(game.play_count / 1000).toFixed(1)}k`
                    : game.play_count}
                </Text>
              </View>
            </View>
          </View>

          <Pressable style={styles.playButton} onPress={handlePress}>
            <LinearGradient
              colors={['#8B5CF6', '#06B6D4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.playGradient}>
              <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.playText}>Play Now</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height: CARD_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: '#1E293B',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
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
    height: '50%',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badge: {
    backgroundColor: 'rgba(139, 92, 246, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  favoriteButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  playButton: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  playGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
  },
  playText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
