import { View, Text, StyleSheet, FlatList, Dimensions, ActivityIndicator, Pressable } from 'react-native';
import { useGameStore } from '@/store/gameStore';
import { GameCard } from '@/components/GameCard';
import { useEffect, useRef, useState } from 'react';
import { Menu, Search } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const TAB_BAR_HEIGHT = 80;
const TOP_BAR_HEIGHT = 100;

export default function HomeScreen() {
  const { games, loading } = useGameStore();
  const flatListRef = useRef<FlatList>(null);
  const [activeTab, setActiveTab] = useState<'following' | 'foryou'>('foryou');
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

  const getItemLayout = (_: any, index: number) => ({
    length: dimensions.height,
    offset: dimensions.height * index,
    index,
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={games}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <GameCard game={item} cardHeight={dimensions.height} />}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={dimensions.height}
        snapToAlignment="start"
        decelerationRate="fast"
        getItemLayout={getItemLayout}
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        windowSize={5}
        bounces={false}
      />

      <View style={styles.topBarContainer} pointerEvents="box-none">
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.5)', 'transparent']}
          style={styles.topBarGradient}
        />
        <View style={styles.topBar}>
          <Pressable style={styles.iconButton}>
            <Menu size={24} color="#FFFFFF" strokeWidth={2.5} />
          </Pressable>

          <View style={styles.tabsContainer}>
            <Pressable
              style={styles.tab}
              onPress={() => setActiveTab('following')}>
              <Text style={[styles.tabText, activeTab === 'following' && styles.activeTabText]}>
                Following
              </Text>
              {activeTab === 'following' && <View style={styles.activeIndicator} />}
            </Pressable>

            <View style={styles.tabDivider} />

            <Pressable
              style={styles.tab}
              onPress={() => setActiveTab('foryou')}>
              <Text style={[styles.tabText, activeTab === 'foryou' && styles.activeTabText]}>
                For You
              </Text>
              {activeTab === 'foryou' && <View style={styles.activeIndicator} />}
            </Pressable>
          </View>

          <Pressable style={styles.iconButton}>
            <Search size={24} color="#FFFFFF" strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  topBarGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: TOP_BAR_HEIGHT,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  tab: {
    position: 'relative',
    paddingVertical: 8,
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 17,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    left: '25%',
    right: '25%',
    height: 2,
    backgroundColor: '#FFFFFF',
  },
  tabDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});
