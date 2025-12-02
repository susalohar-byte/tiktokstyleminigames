import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Trophy, Clock, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '@/store/gameStore';

export default function ProfileScreen() {
  const { games, getFavoriteGames } = useGameStore();

  const totalPlays = games.reduce((sum, game) => sum + game.play_count, 0);
  const favoriteCount = getFavoriteGames().length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Your gaming stats</Text>
      </View>

      <View style={styles.avatarContainer}>
        <LinearGradient
          colors={['#8B5CF6', '#06B6D4']}
          style={styles.avatar}>
          <User size={48} color="#FFFFFF" strokeWidth={2} />
        </LinearGradient>
        <Text style={styles.name}>Game Player</Text>
        <Text style={styles.username}>@player</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Trophy size={24} color="#FBBF24" />
          </View>
          <Text style={styles.statValue}>{games.length}</Text>
          <Text style={styles.statLabel}>Games Available</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Clock size={24} color="#06B6D4" />
          </View>
          <Text style={styles.statValue}>{totalPlays}</Text>
          <Text style={styles.statLabel}>Total Plays</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Star size={24} color="#8B5CF6" />
          </View>
          <Text style={styles.statValue}>{favoriteCount}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
      </View>

      <View style={styles.comingSoonContainer}>
        <Text style={styles.comingSoon}>🎮 More profile features coming soon!</Text>
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
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#94A3B8',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
  },
  comingSoonContainer: {
    marginTop: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  comingSoon: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
    textAlign: 'center',
  },
});
