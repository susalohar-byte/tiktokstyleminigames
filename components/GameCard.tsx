import { View, Text, StyleSheet, Pressable, Image, Dimensions } from 'react-native';
import { GameWithFavorite } from '@/types';
import { MessageCircle, Share2, MoreHorizontal, Play, Star, User } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface GameCardProps {
  game: GameWithFavorite;
  cardHeight: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function GameCard({ game, cardHeight }: GameCardProps) {
  const router = useRouter();
  const [showMore, setShowMore] = useState(false);
  const playScale = useSharedValue(1);

  const playAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playScale.value }],
  }));

  const handlePlay = () => {
    playScale.value = withSequence(
      withSpring(1.2, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );
    router.push(`/game/${game.id}`);
  };

  const handleComment = () => {
    router.push(`/game/${game.id}`);
  };

  const handleShare = () => {
    console.log('Share game:', game.id);
  };

  return (
    <View style={[styles.container, { height: cardHeight }]}>
      <Image
        source={{ uri: game.thumbnail_url }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.6)']}
        locations={[0.5, 1]}
        style={styles.overlay}
      />

      <View style={styles.rightSidebar}>
        <Pressable style={styles.sidebarItem}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={28} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <View style={styles.followButton}>
              <Text style={styles.followButtonText}>+</Text>
            </View>
          </View>
        </Pressable>

        <Pressable style={styles.sidebarItem} onPress={handlePlay}>
          <Animated.View style={playAnimatedStyle}>
            <View style={styles.playIconCircle}>
              <Play size={28} color="#FFFFFF" fill="#FFFFFF" strokeWidth={0} />
            </View>
          </Animated.View>
          <Text style={styles.sidebarCount}>Play</Text>
        </Pressable>

        <Pressable style={styles.sidebarItem} onPress={handleComment}>
          <MessageCircle size={32} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.sidebarCount}>{formatNumber(Math.floor(game.play_count / 10))}</Text>
        </Pressable>

        <Pressable style={styles.sidebarItem} onPress={handleShare}>
          <Share2 size={28} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.sidebarCount}>Share</Text>
        </Pressable>

        <Pressable style={styles.sidebarItem}>
          <MoreHorizontal size={28} color="#FFFFFF" strokeWidth={2} />
        </Pressable>
      </View>

      <View style={styles.bottomInfo}>
        <Pressable style={styles.creatorName}>
          <Text style={styles.creatorText}>@{game.category?.name.toLowerCase().replace(/\s+/g, '') || 'creator'}</Text>
        </Pressable>

        <Text style={styles.gameTitle} numberOfLines={1}>
          {game.title}
        </Text>

        <Pressable onPress={() => setShowMore(!showMore)}>
          <Text style={styles.gameDescription} numberOfLines={showMore ? undefined : 2}>
            {game.description || 'Play this amazing game now!'}
            {!showMore && game.description && game.description.length > 80 && (
              <Text style={styles.moreText}> ...more</Text>
            )}
          </Text>
        </Pressable>

        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Play size={11} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.statBadgeText}>{formatNumber(game.play_count)} plays</Text>
          </View>
          <View style={styles.statBadge}>
            <Star size={11} color="#FBBF24" fill="#FBBF24" />
            <Text style={styles.statBadgeText}>{game.rating.toFixed(1)}</Text>
          </View>
          <View style={[styles.categoryPill, { backgroundColor: getCategoryColor(game.category?.name) }]}>
            <Text style={styles.categoryText}>{game.category?.name || 'Game'}</Text>
          </View>
        </View>
      </View>

      <Pressable style={styles.playButton} onPress={handlePlay}>
        <Text style={styles.playButtonText}>PLAY</Text>
      </Pressable>
    </View>
  );
}

function getCategoryColor(category?: string): string {
  const colors: Record<string, string> = {
    'Action': '#EF4444',
    'Puzzle': '#8B5CF6',
    'Strategy': '#06B6D4',
    'Adventure': '#10B981',
    'Sports': '#F59E0B',
    'Racing': '#EC4899',
  };
  return colors[category || ''] || '#6366F1';
}

const styles = StyleSheet.create({
  container: {
    width,
    backgroundColor: '#000000',
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  rightSidebar: {
    position: 'absolute',
    right: 12,
    bottom: 120,
    alignItems: 'center',
    gap: 20,
    zIndex: 10,
  },
  sidebarItem: {
    alignItems: 'center',
    gap: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  followButton: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    marginLeft: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
  sidebarCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  playIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomInfo: {
    position: 'absolute',
    left: 16,
    bottom: 100,
    right: 80,
    zIndex: 10,
  },
  creatorName: {
    marginBottom: 4,
  },
  creatorText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  gameTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  gameDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    lineHeight: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  moreText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statBadgeText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  playButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    backgroundColor: '#FF006E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#FF006E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
