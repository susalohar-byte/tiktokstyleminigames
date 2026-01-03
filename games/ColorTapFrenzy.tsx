import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Dimensions, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { GameHUD } from '@/components/games/GameHUD';
import { GameOverlay } from '@/components/games/GameOverlay';
import { Countdown } from '@/components/games/Countdown';
import { NativeGameProps } from '@/types';

const COLORS = [
  { name: 'Red', value: '#EF4444' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
];

interface Circle {
  id: string;
  color: typeof COLORS[0];
  x: number;
  y: number;
}

export default function ColorTapFrenzy({ onGameOver, onExit }: NativeGameProps) {
  const { width, height } = Dimensions.get('window');
  const [gameState, setGameState] = useState<'start' | 'countdown' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [targetColor, setTargetColor] = useState(COLORS[0]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const spawnIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const gameAreaHeight = height - 200;
  const gameAreaWidth = width;

  const spawnCircle = () => {
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const circleSize = 80;
    const newCircle: Circle = {
      id: Date.now().toString() + Math.random(),
      color: randomColor,
      x: Math.random() * (gameAreaWidth - circleSize),
      y: Math.random() * (gameAreaHeight - circleSize - 150) + 150,
    };
    setCircles((prev) => [...prev, newCircle]);

    setTimeout(() => {
      setCircles((prev) => prev.filter((c) => c.id !== newCircle.id));
    }, 2000);
  };

  const startGame = () => {
    console.log('[ColorTapFrenzy] Starting game');
    setGameState('countdown');
  };

  const onCountdownComplete = () => {
    console.log('[ColorTapFrenzy] Countdown complete, game starting');
    setGameState('playing');
    setScore(0);
    setTimeRemaining(30);
    setCircles([]);
    setTargetColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
  };

  useEffect(() => {
    if (gameState === 'playing') {
      spawnIntervalRef.current = setInterval(() => {
        spawnCircle();
      }, 800);

      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current as NodeJS.Timeout);
        if (timerRef.current) clearInterval(timerRef.current as NodeJS.Timeout);
      };
    }
  }, [gameState]);

  const handleGameOver = () => {
    console.log('[ColorTapFrenzy] Game over, final score:', score);
    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current as NodeJS.Timeout);
    if (timerRef.current) clearInterval(timerRef.current as NodeJS.Timeout);
    setGameState('gameover');
    if (score > highScore) {
      setHighScore(score);
    }
    onGameOver(score);
  };

  const handleCircleTap = (circle: Circle) => {
    console.log('[ColorTapFrenzy] Circle tapped:', circle.color.name, 'Target:', targetColor.name);
    setCircles((prev) => prev.filter((c) => c.id !== circle.id));

    if (circle.color.name === targetColor.name) {
      const points = 10;
      setScore((prev) => prev + points);
      console.log('[ColorTapFrenzy] Correct! +' + points + ' points');
    } else {
      const penalty = 5;
      setScore((prev) => Math.max(0, prev - penalty));
      console.log('[ColorTapFrenzy] Wrong color! -' + penalty + ' points');
    }

    if (Math.random() > 0.7) {
      const newTarget = COLORS[Math.floor(Math.random() * COLORS.length)];
      setTargetColor(newTarget);
      console.log('[ColorTapFrenzy] Target color changed to:', newTarget.name);
    }
  };

  const handleRestart = () => {
    console.log('[ColorTapFrenzy] Restarting game');
    setGameState('countdown');
  };

  return (
    <View style={styles.container}>
      <View style={styles.gameArea}>
        {gameState === 'playing' && (
          <>
            <View style={styles.targetColorContainer}>
              <Text style={styles.targetLabel}>Tap</Text>
              <View style={[styles.targetColor, { backgroundColor: targetColor.value }]} />
              <Text style={styles.targetName}>{targetColor.name}</Text>
            </View>

            {circles.map((circle) => (
              <AnimatedCircle
                key={circle.id}
                circle={circle}
                onTap={handleCircleTap}
              />
            ))}
          </>
        )}
      </View>

      {gameState === 'playing' && (
        <GameHUD
          score={score}
          timeRemaining={timeRemaining}
          showPause={false}
        />
      )}

      {gameState === 'countdown' && <Countdown onComplete={onCountdownComplete} />}

      <GameOverlay
        visible={gameState === 'start'}
        type="start"
        title="Color Tap Frenzy"
        message="Tap the circles that match the target color! Wrong taps lose points."
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

function AnimatedCircle({ circle, onTap }: { circle: Circle; onTap: (circle: Circle) => void }) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(1);
    setTimeout(() => {
      opacity.value = withTiming(0, { duration: 300 });
    }, 1700);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.circle,
        { backgroundColor: circle.color.value, left: circle.x, top: circle.y },
        animatedStyle,
      ]}>
      <Pressable
        onPress={() => onTap(circle)}
        style={StyleSheet.absoluteFillObject}
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
    position: 'relative',
  },
  targetColorContainer: {
    position: 'absolute',
    top: 160,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  targetLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 8,
  },
  targetColor: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  targetName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  circle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
