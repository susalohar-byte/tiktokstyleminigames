import { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { GameHUD } from '@/components/games/GameHUD';
import { GameOverlay } from '@/components/games/GameOverlay';
import { Countdown } from '@/components/games/Countdown';
import { NativeGameProps } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';

const WORD_LIST = ['CAT', 'DOG', 'SUN', 'STAR', 'MOON', 'TREE', 'FISH', 'BIRD'];

const GRID = [
  ['C', 'A', 'T', 'S'],
  ['D', 'O', 'G', 'F'],
  ['M', 'O', 'N', 'I'],
  ['S', 'U', 'N', 'R'],
  ['T', 'R', 'E', 'E'],
];

export default function WordSwipe({ onGameOver, onExit }: NativeGameProps) {
  const [gameState, setGameState] = useState<'start' | 'countdown' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(60);

  const startGame = () => {
    console.log('[WordSwipe] Starting game');
    setGameState('countdown');
  };

  const onCountdownComplete = () => {
    console.log('[WordSwipe] Countdown complete, game starting');
    setGameState('playing');
    setScore(0);
    setFoundWords([]);
    setTimeRemaining(60);
  };

  useEffect(() => {
    if (gameState === 'playing') {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState]);

  const handleGameOver = () => {
    console.log('[WordSwipe] Game over, final score:', score);
    setGameState('gameover');
    if (score > highScore) {
      setHighScore(score);
    }
    onGameOver(score);
  };

  const handleRestart = () => {
    console.log('[WordSwipe] Restarting game');
    setGameState('countdown');
  };

  return (
    <View style={styles.container}>
      {gameState === 'playing' && (
        <>
          <View style={styles.gameArea}>
            <View style={styles.wordsToFind}>
              <Text style={styles.wordsTitle}>Find These Words:</Text>
              <View style={styles.wordsList}>
                {WORD_LIST.map((word) => (
                  <View
                    key={word}
                    style={[
                      styles.wordChip,
                      foundWords.includes(word) && styles.wordChipFound,
                    ]}>
                    <Text
                      style={[
                        styles.wordChipText,
                        foundWords.includes(word) && styles.wordChipTextFound,
                      ]}>
                      {word}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.grid}>
              {GRID.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.gridRow}>
                  {row.map((letter, colIndex) => (
                    <View key={`${rowIndex}-${colIndex}`} style={styles.gridCell}>
                      <LinearGradient
                        colors={['#1E293B', '#334155']}
                        style={styles.cellGradient}>
                        <Text style={styles.cellLetter}>{letter}</Text>
                      </LinearGradient>
                    </View>
                  ))}
                </View>
              ))}
            </View>

            <View style={styles.hintBox}>
              <Text style={styles.hintText}>
                Swipe feature coming soon! For now, this is a demo grid showing word positions.
              </Text>
            </View>
          </View>

          <GameHUD score={score} timeRemaining={timeRemaining} showPause={false} />
        </>
      )}

      {gameState === 'countdown' && <Countdown onComplete={onCountdownComplete} />}

      <GameOverlay
        visible={gameState === 'start'}
        type="start"
        title="Word Swipe"
        message="Find all the hidden words in the grid!"
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
    paddingTop: 140,
    paddingHorizontal: 16,
  },
  wordsToFind: {
    marginBottom: 24,
  },
  wordsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 12,
  },
  wordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#475569',
  },
  wordChipFound: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  wordChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  wordChipTextFound: {
    color: '#FFFFFF',
    textDecorationLine: 'line-through',
  },
  grid: {
    gap: 8,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gridCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cellGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellLetter: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  hintBox: {
    marginTop: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    padding: 16,
    borderRadius: 12,
  },
  hintText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A78BFA',
    textAlign: 'center',
  },
});
