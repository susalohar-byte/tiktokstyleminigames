import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GameHUD } from '@/components/games/GameHUD';
import { GameOverlay } from '@/components/games/GameOverlay';
import { NativeGameProps } from '@/types';

export default function ReactionSpeedTest({ onGameOver, onExit }: NativeGameProps) {
  const [gameState, setGameState] = useState<'start' | 'waiting' | 'tap' | 'results'>('start');
  const [currentRound, setCurrentRound] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [averageTime, setAverageTime] = useState(0);
  const [bestTime, setBestTime] = useState(0);
  const [tooEarly, setTooEarly] = useState(false);
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const TOTAL_ROUNDS = 5;

  const startGame = () => {
    console.log('[ReactionSpeedTest] Starting game');
    setGameState('waiting');
    setCurrentRound(1);
    setReactionTimes([]);
    setTooEarly(false);
    startRound();
  };

  const startRound = () => {
    console.log('[ReactionSpeedTest] Starting round');
    setTooEarly(false);

    const delay = Math.random() * 3000 + 2000;
    timeoutRef.current = setTimeout(() => {
      console.log('[ReactionSpeedTest] TAP NOW!');
      setGameState('tap');
      startTimeRef.current = Date.now();
    }, delay) as NodeJS.Timeout;
  };

  const handleTap = () => {
    if (gameState === 'waiting') {
      console.log('[ReactionSpeedTest] Tapped too early!');
      setTooEarly(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setTimeout(() => {
        if (currentRound < TOTAL_ROUNDS) {
          setGameState('waiting');
          startRound();
        } else {
          finishGame();
        }
      }, 1500);
      return;
    }

    if (gameState === 'tap') {
      const reactionTime = Date.now() - startTimeRef.current;
      console.log('[ReactionSpeedTest] Reaction time:', reactionTime, 'ms');

      const newTimes = [...reactionTimes, reactionTime];
      setReactionTimes(newTimes);

      if (currentRound < TOTAL_ROUNDS) {
        setCurrentRound((prev) => prev + 1);
        setGameState('waiting');
        setTimeout(() => {
          startRound();
        }, 1000);
      } else {
        finishGame(newTimes);
      }
    }
  };

  const finishGame = (times: number[] = reactionTimes) => {
    console.log('[ReactionSpeedTest] Game finished');
    const validTimes = times.filter((t) => t > 0);
    if (validTimes.length > 0) {
      const avg = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
      const best = Math.min(...validTimes);
      setAverageTime(Math.round(avg));
      setBestTime(best);
      console.log('[ReactionSpeedTest] Average:', avg, 'Best:', best);
    }
    setGameState('results');
  };

  const calculateScore = () => {
    if (averageTime === 0) return 0;
    return Math.max(0, 1000 - averageTime);
  };

  const handleRestart = () => {
    console.log('[ReactionSpeedTest] Restarting game');
    startGame();
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleGameOver = () => {
    const score = calculateScore();
    console.log('[ReactionSpeedTest] Final score:', score);
    onGameOver(score);
  };

  useEffect(() => {
    if (gameState === 'results') {
      handleGameOver();
    }
  }, [gameState]);

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.gameArea}
        onPress={handleTap}>
        {(gameState === 'waiting' || gameState === 'tap') && (
          <>
            <View style={styles.roundIndicator}>
              <Text style={styles.roundText}>Round {currentRound}/{TOTAL_ROUNDS}</Text>
            </View>

            <LinearGradient
              colors={
                tooEarly
                  ? ['#EF4444', '#DC2626']
                  : gameState === 'tap'
                  ? ['#10B981', '#059669']
                  : ['#1E293B', '#334155']
              }
              style={styles.tapArea}>
              <Text style={styles.tapText}>
                {tooEarly
                  ? 'Too Early!'
                  : gameState === 'tap'
                  ? 'TAP NOW!'
                  : 'Wait...'}
              </Text>
            </LinearGradient>

            {reactionTimes.length > 0 && (
              <View style={styles.timesContainer}>
                {reactionTimes.map((time, index) => (
                  <View key={index} style={styles.timeChip}>
                    <Text style={styles.timeText}>{time}ms</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {gameState === 'results' && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Results</Text>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Average Time</Text>
              <Text style={styles.resultValue}>{averageTime}ms</Text>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Best Time</Text>
              <Text style={styles.resultValue}>{bestTime}ms</Text>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Score</Text>
              <Text style={styles.resultValue}>{calculateScore()}</Text>
            </View>

            <View style={styles.allTimesContainer}>
              <Text style={styles.allTimesLabel}>All Times:</Text>
              <View style={styles.allTimesList}>
                {reactionTimes.map((time, index) => (
                  <Text key={index} style={styles.allTimesText}>
                    {index + 1}. {time}ms
                  </Text>
                ))}
              </View>
            </View>

            <View style={styles.buttonRow}>
              <Pressable onPress={handleRestart} style={styles.primaryButton}>
                <LinearGradient
                  colors={['#8B5CF6', '#6366F1']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}>
                  <Text style={styles.buttonText}>Try Again</Text>
                </LinearGradient>
              </Pressable>

              <Pressable onPress={onExit} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Exit</Text>
              </Pressable>
            </View>
          </View>
        )}
      </Pressable>

      <GameOverlay
        visible={gameState === 'start'}
        type="start"
        title="Reaction Speed Test"
        message="Wait for the green screen, then tap as fast as possible! Don't tap too early."
        onStart={startGame}
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  roundIndicator: {
    position: 'absolute',
    top: 60,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  roundText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tapArea: {
    width: '100%',
    height: 300,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  timesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 32,
    justifyContent: 'center',
  },
  timeChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  resultsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  resultsTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 32,
  },
  resultBox: {
    width: '100%',
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  allTimesContainer: {
    width: '100%',
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  allTimesLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 12,
  },
  allTimesList: {
    gap: 8,
  },
  allTimesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  buttonRow: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
