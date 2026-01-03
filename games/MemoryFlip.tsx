import { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GameHUD } from '@/components/games/GameHUD';
import { GameOverlay } from '@/components/games/GameOverlay';
import { Countdown } from '@/components/games/Countdown';
import { NativeGameProps } from '@/types';

const SYMBOLS = ['🎮', '🎯', '🎨', '🎭', '🎪', '🎸', '🎺', '🎻'];

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryFlip({ onGameOver, onExit }: NativeGameProps) {
  const [gameState, setGameState] = useState<'start' | 'countdown' | 'playing' | 'gameover'>('start');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const initializeCards = () => {
    const symbols = SYMBOLS.slice(0, 8);
    const pairs = [...symbols, ...symbols];
    const shuffled = pairs.sort(() => Math.random() - 0.5);
    return shuffled.map((symbol, index) => ({
      id: index,
      symbol,
      isFlipped: false,
      isMatched: false,
    }));
  };

  const startGame = () => {
    console.log('[MemoryFlip] Starting game');
    setGameState('countdown');
  };

  const onCountdownComplete = () => {
    console.log('[MemoryFlip] Countdown complete, game starting');
    setGameState('playing');
    setCards(initializeCards());
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setScore(0);
  };

  const handleCardPress = (cardId: number) => {
    if (flippedCards.length === 2) return;
    if (flippedCards.includes(cardId)) return;
    if (cards[cardId].isMatched) return;

    console.log('[MemoryFlip] Card flipped:', cardId);

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...card, isFlipped: true } : card
      )
    );

    if (newFlippedCards.length === 2) {
      setMoves((prev) => prev + 1);

      const [first, second] = newFlippedCards;
      const firstCard = cards[first];
      const secondCard = cards[second];

      if (firstCard.symbol === secondCard.symbol) {
        console.log('[MemoryFlip] Match found!');
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second
                ? { ...card, isMatched: true }
                : card
            )
          );
          const newMatches = matches + 1;
          setMatches(newMatches);
          const points = 100 - (moves * 5);
          setScore((prev) => prev + Math.max(points, 10));

          if (newMatches === 8) {
            handleGameOver();
          }
          setFlippedCards([]);
        }, 500);
      } else {
        console.log('[MemoryFlip] No match');
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const handleGameOver = () => {
    console.log('[MemoryFlip] Game over, final score:', score);
    setTimeout(() => {
      setGameState('gameover');
      if (score > highScore) {
        setHighScore(score);
      }
      onGameOver(score);
    }, 1000);
  };

  const handleRestart = () => {
    console.log('[MemoryFlip] Restarting game');
    setGameState('countdown');
  };

  return (
    <View style={styles.container}>
      {gameState === 'playing' && (
        <>
          <View style={styles.gameArea}>
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Moves</Text>
                <Text style={styles.statValue}>{moves}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Matches</Text>
                <Text style={styles.statValue}>{matches}/8</Text>
              </View>
            </View>

            <View style={styles.grid}>
              {cards.map((card) => (
                <CardComponent
                  key={card.id}
                  card={card}
                  onPress={handleCardPress}
                />
              ))}
            </View>
          </View>

          <GameHUD score={score} showPause={false} />
        </>
      )}

      {gameState === 'countdown' && <Countdown onComplete={onCountdownComplete} />}

      <GameOverlay
        visible={gameState === 'start'}
        type="start"
        title="Memory Flip"
        message="Match all the pairs! Fewer moves = higher score."
        onStart={startGame}
        onExit={onExit}
      />

      <GameOverlay
        visible={gameState === 'gameover'}
        type="gameover"
        score={score}
        highScore={highScore}
        onRestart={handleRestart}
        onExit={onExit}
      />
    </View>
  );
}

function CardComponent({ card, onPress }: { card: Card; onPress: (id: number) => void }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withTiming(card.isFlipped ? 180 : 0, { duration: 300 });
  }, [card.isFlipped]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 180], [0, 180]);
    const opacity = interpolate(rotation.value, [0, 90, 180], [1, 0, 0]);
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      opacity,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 180], [180, 360]);
    const opacity = interpolate(rotation.value, [0, 90, 180], [0, 0, 1]);
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      opacity,
    };
  });

  return (
    <Pressable
      onPress={() => !card.isMatched && onPress(card.id)}
      style={styles.cardContainer}
      disabled={card.isMatched}>
      <Animated.View style={[styles.card, frontAnimatedStyle]}>
        <LinearGradient
          colors={['#8B5CF6', '#6366F1']}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.cardQuestion}>?</Text>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
        <LinearGradient
          colors={card.isMatched ? ['#10B981', '#059669'] : ['#1E293B', '#334155']}
          style={styles.cardGradient}>
          <Text style={styles.cardSymbol}>{card.symbol}</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  gameArea: {
    flex: 1,
    paddingTop: 140,
    paddingHorizontal: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 24,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  cardContainer: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    position: 'absolute',
  },
  cardGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardQuestion: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cardSymbol: {
    fontSize: 36,
  },
});
