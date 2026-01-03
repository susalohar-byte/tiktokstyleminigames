import { View, StyleSheet, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { useGameStore } from '@/store/gameStore';
import { GameCard } from '@/components/GameCard';
import { useEffect, useRef, useState } from 'react';

const TAB_BAR_HEIGHT = 60;

export default function HomeScreen() {
  const { games, loading } = useGameStore();
  const flatListRef = useRef<FlatList>(null);
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
