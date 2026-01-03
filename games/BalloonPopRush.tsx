import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Dimensions, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { GameHUD } from '@/components/games/GameHUD';
import { GameOverlay } from '@/components/games/GameOverlay';
import { Countdown } from '@/components/games/Countdown';
import { NativeGameProps } from '@/types';

const { width, height } = Dimensions.get('window');

interface Balloon {
  id: string;
  x: number;
  type: 'normal' | 'bonus' | 'bomb';
  color: string;
  points: number;
}

const BALLOON_TYPES = [
  { type: 'normal' as const, color: '#EF4444', points: 10, emoji: '🔴' },
  { type: 'normal' as const, color: '#3B82F6', points: 10, emoji: '🔵' },
  { type: 'normal' as const, color: '#10B981', points: 10, emoji: '🟢' },
  { type: 'normal' as const, color: '#F59E0B', points: 10, emoji: '🟡' },
  { type: 'bonus' as const, color: '#8B5CF6', points: 25, emoji: '⭐' },
  { type: 'bomb' as const, color: '#1F2937', points: -20, emoji: '💣' },
];

export default function BalloonPopRush({ onGameOver, onExit }: NativeGameProps) {
  const [gameState, setGameState] = useState<'start' | 'countdown' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const spawnIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const spawnBalloon = () => {
    const balloonType = BALLOON_TYPES[Math.floor(Math.random() * BALLOON_TYPES.length)];
    const newBalloon: Balloon = {
      id: Date.now().toString() + Math.random(),
      x: Math.random() * (width - 60),
      type: balloonType.type,
      color: balloonType.emoji,
      points: balloonType.points,
    };
    setBalloons((prev) => [...prev, newBalloon]);

    setTimeout(() => {
      setBalloons((prev) => prev.filter((b) => b.id !== newBalloon.id));
    }, 4000);
  };

  const startGame = () => {
    console.log('[BalloonPopRush] Starting game');
    setGameState('countdown');
  };

  const onCountdownComplete = () => {
    console.log('[BalloonPopRush] Countdown complete, game starting');
    setGameState('playing');
    setScore(0);
    setTimeRemaining(30);
    setBalloons([]);
  };

  useEffect(() => {
    if (gameState === 'playing') {
      spawnIntervalRef.current = setInterval(() => {
        spawnBalloon();
      }, 600);

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
    console.log('[BalloonPopRush] Game over, final score:', score);
    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current as NodeJS.Timeout);
    if (timerRef.current) clearInterval(timerRef.current as NodeJS.Timeout);
    setGameState('gameover');
    if (score > highScore) {
      setHighScore(score);
    }
    onGameOver(score);
  };

  const handleBalloonPop = (balloon: Balloon) => {
    console.log('[BalloonPopRush] Balloon popped:', balloon.type, balloon.points);
    setBalloons((prev) => prev.filter((b) => b.id !== balloon.id));

    if (balloon.type === 'bonus') {
      setTimeRemaining((prev) => prev + 5);
      console.log('[BalloonPopRush] Bonus time! +5 seconds');
    }

    setScore((prev) => Math.max(0, prev + balloon.points));
  };

  const handleRestart = () => {
    console.log('[BalloonPopRush] Restarting game');
    setGameState('countdown');
  };

  return (
    <View style={styles.container}>
      <View style={styles.gameArea}>
        {gameState === 'playing' &&
          balloons.map((balloon) => (
            <AnimatedBalloon
              key={balloon.id}
              balloon={balloon}
              onPop={handleBalloonPop}
            />
          ))}
      </View>

      {gameState === 'playing' && (
        <GameHUD score={score} timeRemaining={timeRemaining} showPause={false} />
      )}

      {gameState === 'countdown' && <Countdown onComplete={onCountdownComplete} />}

      <GameOverlay
        visible={gameState === 'start'}
        type="start"
        title="Balloon Pop Rush"
        message="Pop balloons before they escape! ⭐ gives bonus time, avoid 💣 bombs!"
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

function AnimatedBalloon({
  balloon,
  onPop,
}: {
  balloon: Balloon;
  onPop: (balloon: Balloon) => void;
}) {
  const translateY = useSharedValue(height);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withTiming(-100, {
      duration: 4000,
      easing: Easing.linear,
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.balloon,
        { left: balloon.x },
        animatedStyle,
      ]}>
      <Pressable onPress={() => onPop(balloon)} style={styles.balloonTouchable}>
        <Text style={styles.balloonEmoji}>{balloon.color}</Text>
      </Pressable>
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
  balloon: {
    position: 'absolute',
    bottom: 0,
    width: 60,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balloonTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balloonEmoji: {
    fontSize: 50,
  },
});
