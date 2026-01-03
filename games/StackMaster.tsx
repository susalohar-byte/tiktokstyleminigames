import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Dimensions, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { GameHUD } from '@/components/games/GameHUD';
import { GameOverlay } from '@/components/games/GameOverlay';
import { Countdown } from '@/components/games/Countdown';
import { NativeGameProps } from '@/types';

const { width } = Dimensions.get('window');
const INITIAL_PLATFORM_WIDTH = 150;
const PLATFORM_HEIGHT = 40;
const MIN_PLATFORM_WIDTH = 30;

interface Platform {
  id: number;
  x: number;
  y: number;
  width: number;
}

export default function StackMaster({ onGameOver, onExit }: NativeGameProps) {
  const [gameState, setGameState] = useState<'start' | 'countdown' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [movingPlatformWidth, setMovingPlatformWidth] = useState(INITIAL_PLATFORM_WIDTH);
  const movingPlatformX = useSharedValue(0);
  const movementDirection = useRef(1);

  const startGame = () => {
    console.log('[StackMaster] Starting game');
    setGameState('countdown');
  };

  const onCountdownComplete = () => {
    console.log('[StackMaster] Countdown complete, game starting');
    setGameState('playing');
    setScore(0);
    setPlatforms([
      {
        id: 0,
        x: (width - INITIAL_PLATFORM_WIDTH) / 2,
        y: 600,
        width: INITIAL_PLATFORM_WIDTH,
      },
    ]);
    setMovingPlatformWidth(INITIAL_PLATFORM_WIDTH);
    startMovingPlatform();
  };

  const startMovingPlatform = () => {
    movingPlatformX.value = 0;
    movingPlatformX.value = withRepeat(
      withTiming(width - movingPlatformWidth, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1,
      true
    );
  };

  const handleDrop = () => {
    console.log('[StackMaster] Platform dropped');

    const currentX = movingPlatformX.value;
    const lastPlatform = platforms[platforms.length - 1];

    const overlapStart = Math.max(currentX, lastPlatform.x);
    const overlapEnd = Math.min(
      currentX + movingPlatformWidth,
      lastPlatform.x + lastPlatform.width
    );
    const overlapWidth = Math.max(0, overlapEnd - overlapStart);

    if (overlapWidth < 10) {
      console.log('[StackMaster] Missed! Game over');
      handleGameOver();
      return;
    }

    const newPlatform: Platform = {
      id: platforms.length,
      x: overlapStart,
      y: lastPlatform.y - PLATFORM_HEIGHT - 5,
      width: overlapWidth,
    };

    setPlatforms((prev) => [...prev, newPlatform]);

    const accuracy = overlapWidth / lastPlatform.width;
    let points = 10;
    if (accuracy > 0.95) {
      points = 50;
      console.log('[StackMaster] Perfect drop! +50 points');
    } else if (accuracy > 0.8) {
      points = 30;
      console.log('[StackMaster] Great drop! +30 points');
    }

    setScore((prev) => prev + points);
    setMovingPlatformWidth(Math.max(overlapWidth, MIN_PLATFORM_WIDTH));

    if (overlapWidth <= MIN_PLATFORM_WIDTH) {
      console.log('[StackMaster] Platform too small! Game over');
      handleGameOver();
    }
  };

  const handleGameOver = () => {
    console.log('[StackMaster] Game over, final score:', score);
    setGameState('gameover');
    if (score > highScore) {
      setHighScore(score);
    }
    onGameOver(score);
  };

  const handleRestart = () => {
    console.log('[StackMaster] Restarting game');
    setGameState('countdown');
  };

  const movingPlatformStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: movingPlatformX.value }],
  }));

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.gameArea}
        onPress={gameState === 'playing' ? handleDrop : undefined}>
        {gameState === 'playing' && (
          <>
            <View style={styles.stackContainer}>
              {platforms.map((platform) => (
                <View
                  key={platform.id}
                  style={[
                    styles.platform,
                    {
                      left: platform.x,
                      top: platform.y,
                      width: platform.width,
                    },
                  ]}
                />
              ))}
            </View>

            <Animated.View
              style={[
                styles.movingPlatform,
                { width: movingPlatformWidth },
                movingPlatformStyle,
              ]}
            />

            <Text style={styles.tapHint}>Tap to Drop</Text>
          </>
        )}
      </Pressable>

      {gameState === 'playing' && <GameHUD score={score} showPause={false} />}

      {gameState === 'countdown' && <Countdown onComplete={onCountdownComplete} />}

      <GameOverlay
        visible={gameState === 'start'}
        type="start"
        title="Stack Master"
        message="Stack platforms perfectly to build the highest tower! Misaligned drops make the platform smaller."
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  stackContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
  },
  platform: {
    position: 'absolute',
    height: PLATFORM_HEIGHT,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  movingPlatform: {
    position: 'absolute',
    top: 120,
    height: PLATFORM_HEIGHT,
    backgroundColor: '#10B981',
    borderRadius: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  tapHint: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#94A3B8',
  },
});
