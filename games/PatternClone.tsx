import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { GameHUD } from '@/components/games/GameHUD';
import { GameOverlay } from '@/components/games/GameOverlay';
import { Countdown } from '@/components/games/Countdown';
import { NativeGameProps } from '@/types';

const GRID_SIZE = 4;

export default function PatternClone({ onGameOver, onExit }: NativeGameProps) {
  const [gameState, setGameState] = useState<'start' | 'countdown' | 'showing' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [pattern, setPattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [showingPattern, setShowingPattern] = useState(false);
  const [highlightedTile, setHighlightedTile] = useState<number | null>(null);
  const patternLengthRef = useRef(3);

  const generatePattern = () => {
    const length = patternLengthRef.current;
    const newPattern: number[] = [];
    for (let i = 0; i < length; i++) {
      newPattern.push(Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE)));
    }
    return newPattern;
  };

  const startGame = () => {
    console.log('[PatternClone] Starting game');
    setGameState('countdown');
  };

  const onCountdownComplete = () => {
    console.log('[PatternClone] Countdown complete, game starting');
    setScore(0);
    setLives(3);
    patternLengthRef.current = 3;
    startNewRound();
  };

  const startNewRound = () => {
    const newPattern = generatePattern();
    setPattern(newPattern);
    setUserPattern([]);
    setGameState('showing');
    showPattern(newPattern);
  };

  const showPattern = async (patternToShow: number[]) => {
    console.log('[PatternClone] Showing pattern:', patternToShow);
    setShowingPattern(true);

    for (let i = 0; i < patternToShow.length; i++) {
      setHighlightedTile(patternToShow[i]);
      await new Promise((resolve) => setTimeout(resolve, 600));
      setHighlightedTile(null);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    setShowingPattern(false);
    setGameState('playing');
    console.log('[PatternClone] Your turn!');
  };

  const handleTileTap = (index: number) => {
    if (gameState !== 'playing' || showingPattern) return;

    console.log('[PatternClone] Tile tapped:', index);
    const newUserPattern = [...userPattern, index];
    setUserPattern(newUserPattern);

    const currentStep = newUserPattern.length - 1;

    if (newUserPattern[currentStep] !== pattern[currentStep]) {
      console.log('[PatternClone] Wrong tile! Lost a life');
      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        handleGameOver();
      } else {
        setTimeout(() => {
          startNewRound();
        }, 1000);
      }
      return;
    }

    if (newUserPattern.length === pattern.length) {
      console.log('[PatternClone] Pattern completed!');
      const points = patternLengthRef.current * 10;
      setScore((prev) => prev + points);
      patternLengthRef.current += 1;

      setTimeout(() => {
        startNewRound();
      }, 1000);
    }
  };

  const handleGameOver = () => {
    console.log('[PatternClone] Game over, final score:', score);
    setGameState('gameover');
    if (score > highScore) {
      setHighScore(score);
    }
    onGameOver(score);
  };

  const handleRestart = () => {
    console.log('[PatternClone] Restarting game');
    setGameState('countdown');
  };

  return (
    <View style={styles.container}>
      {(gameState === 'showing' || gameState === 'playing') && (
        <>
          <View style={styles.gameArea}>
            <View style={styles.instructionBox}>
              <Text style={styles.instructionText}>
                {gameState === 'showing' ? 'Watch the pattern...' : 'Repeat the pattern!'}
              </Text>
              <Text style={styles.patternLength}>
                Pattern Length: {pattern.length}
              </Text>
            </View>

            <View style={styles.grid}>
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => (
                <TileButton
                  key={index}
                  index={index}
                  isHighlighted={highlightedTile === index}
                  isInUserPattern={userPattern.includes(index)}
                  onPress={handleTileTap}
                  disabled={gameState !== 'playing'}
                />
              ))}
            </View>

            {userPattern.length > 0 && (
              <View style={styles.progressBox}>
                <Text style={styles.progressText}>
                  Progress: {userPattern.length}/{pattern.length}
                </Text>
              </View>
            )}
          </View>

          <GameHUD score={score} lives={lives} maxLives={3} showPause={false} />
        </>
      )}

      {gameState === 'countdown' && <Countdown onComplete={onCountdownComplete} />}

      <GameOverlay
        visible={gameState === 'start'}
        type="start"
        title="Pattern Clone"
        message="Watch the pattern, then repeat it! Pattern gets longer each round."
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

function TileButton({
  index,
  isHighlighted,
  isInUserPattern,
  onPress,
  disabled,
}: {
  index: number;
  isHighlighted: boolean;
  isInUserPattern: boolean;
  onPress: (index: number) => void;
  disabled: boolean;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isHighlighted) {
      scale.value = withSequence(
        withTiming(1.1, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
    }
  }, [isHighlighted]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.tile, animatedStyle]}>
      <Pressable
        onPress={() => onPress(index)}
        disabled={disabled}
        style={[
          styles.tileButton,
          isHighlighted && styles.tileHighlighted,
          isInUserPattern && styles.tileInPattern,
        ]}
      />
    </Animated.View>
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
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  instructionBox: {
    alignItems: 'center',
    marginBottom: 32,
  },
  instructionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  patternLength: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  grid: {
    width: '100%',
    maxWidth: 350,
    aspectRatio: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    width: '22%',
    aspectRatio: 1,
  },
  tileButton: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#475569',
  },
  tileHighlighted: {
    backgroundColor: '#8B5CF6',
    borderColor: '#A78BFA',
  },
  tileInPattern: {
    backgroundColor: '#10B981',
    borderColor: '#34D399',
  },
  progressBox: {
    marginTop: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#A78BFA',
  },
});
