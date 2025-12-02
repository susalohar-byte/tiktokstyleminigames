import { View, StyleSheet, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { useGameStore } from '@/store/gameStore';
import { GameCard } from '@/components/GameCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useRef } from 'react';

const { height } = Dimensions.get('window');
const CARD_HEIGHT = height * 0.75;

export default function HomeScreen() {
  const { games, loading } = useGameStore();
  const flatListRef = useRef<FlatList>(null);

  const getItemLayout = (_: any, index: number) => ({
    length: CARD_HEIGHT,
    offset: CARD_HEIGHT * index,
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        ref={flatListRef}
        data={games}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <GameCard game={item} />}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={CARD_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        getItemLayout={getItemLayout}
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        windowSize={5}
      />
    </SafeAreaView>
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
