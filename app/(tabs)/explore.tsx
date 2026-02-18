import { View, Text, StyleSheet, FlatList, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '@/store/gameStore';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { GameCard } from '@/components/GameCard';
import { ArrowLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 65;

export default function ExploreScreen() {
  const { categories, getGamesByCategory } = useGameStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState(() => {
    const { height } = Dimensions.get('window');
    return { height: height - TAB_BAR_HEIGHT };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ height: window.height - TAB_BAR_HEIGHT });
    });

    return () => subscription?.remove();
  }, []);

  const filteredGames = selectedCategory
    ? getGamesByCategory(selectedCategory)
    : [];

  if (selectedCategory) {
    const category = categories.find(c => c.id === selectedCategory);
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => setSelectedCategory(null)}
            style={styles.backButton}>
            <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.headerTitle}>{category?.name}</Text>
          </Pressable>
        </View>
        <FlatList
          data={filteredGames}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <GameCard game={item} cardHeight={dimensions.height} />}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={dimensions.height}
          snapToAlignment="start"
          decelerationRate="fast"
          bounces={false}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Explore Games</Text>
        <Text style={styles.subtitle}>Browse by category</Text>
      </View>

      <FlatList
        key="categories-grid"
        data={categories}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <Pressable
            style={styles.categoryCard}
            onPress={() => setSelectedCategory(item.id)}>
            <LinearGradient
              colors={['#8B5CF6', '#06B6D4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.categoryGradient}>
              <Text style={styles.categoryIcon}>{item.icon}</Text>
              <Text style={styles.categoryName}>{item.name}</Text>
              <Text style={styles.categoryCount}>
                {getGamesByCategory(item.id).length} games
              </Text>
            </LinearGradient>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },
  categoryCard: {
    flex: 1,
    margin: 8,
    borderRadius: 20,
    overflow: 'hidden',
    minHeight: 160,
  },
  categoryGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    fontSize: 48,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
