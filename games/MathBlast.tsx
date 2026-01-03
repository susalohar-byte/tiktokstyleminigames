import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GameHUD } from '@/components/games/GameHUD';
import { GameOverlay } from '@/components/games/GameOverlay';
import { Countdown } from '@/components/games/Countdown';
import { NativeGameProps } from '@/types';

interface Question {
  num1: number;
  num2: number;
  operation: '+' | '-' | '×';
  correctAnswer: number;
  options: number[];
}

export default function MathBlast({ onGameOver, onExit }: NativeGameProps) {
  const [gameState, setGameState] = useState<'start' | 'countdown' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [streak, setStreak] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const generateQuestion = (): Question => {
    const operations: Array<'+' | '-' | '×'> = ['+', '-', '×'];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let num1: number;
    let num2: number;
    let correctAnswer: number;

    if (operation === '+') {
      num1 = Math.floor(Math.random() * 50) + 1;
      num2 = Math.floor(Math.random() * 50) + 1;
      correctAnswer = num1 + num2;
    } else if (operation === '-') {
      num1 = Math.floor(Math.random() * 50) + 20;
      num2 = Math.floor(Math.random() * num1) + 1;
      correctAnswer = num1 - num2;
    } else {
      num1 = Math.floor(Math.random() * 12) + 1;
      num2 = Math.floor(Math.random() * 12) + 1;
      correctAnswer = num1 * num2;
    }

    const options: number[] = [correctAnswer];
    while (options.length < 4) {
      const offset = Math.floor(Math.random() * 10) - 5;
      const wrongAnswer = correctAnswer + offset;
      if (wrongAnswer > 0 && !options.includes(wrongAnswer)) {
        options.push(wrongAnswer);
      }
    }

    options.sort(() => Math.random() - 0.5);

    return { num1, num2, operation, correctAnswer, options };
  };

  const startGame = () => {
    console.log('[MathBlast] Starting game');
    setGameState('countdown');
  };

  const onCountdownComplete = () => {
    console.log('[MathBlast] Countdown complete, game starting');
    setGameState('playing');
    setScore(0);
    setStreak(0);
    setTimeRemaining(60);
    setCurrentQuestion(generateQuestion());
  };

  useEffect(() => {
    if (gameState === 'playing') {
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
        if (timerRef.current) clearInterval(timerRef.current as NodeJS.Timeout);
      };
    }
  }, [gameState]);

  const handleGameOver = () => {
    console.log('[MathBlast] Game over, final score:', score);
    if (timerRef.current) clearInterval(timerRef.current as NodeJS.Timeout);
    setGameState('gameover');
    if (score > highScore) {
      setHighScore(score);
    }
    onGameOver(score);
  };

  const handleAnswer = (selectedAnswer: number) => {
    if (!currentQuestion) return;

    console.log('[MathBlast] Answer selected:', selectedAnswer, 'Correct:', currentQuestion.correctAnswer);

    if (selectedAnswer === currentQuestion.correctAnswer) {
      const newStreak = streak + 1;
      const points = 10 + (newStreak * 2);
      setScore((prev) => prev + points);
      setStreak(newStreak);
      console.log('[MathBlast] Correct! +' + points + ' points, streak:', newStreak);
    } else {
      setStreak(0);
      console.log('[MathBlast] Wrong! Streak reset');
    }

    setCurrentQuestion(generateQuestion());
  };

  const handleRestart = () => {
    console.log('[MathBlast] Restarting game');
    setGameState('countdown');
  };

  return (
    <View style={styles.container}>
      {gameState === 'playing' && currentQuestion && (
        <>
          <View style={styles.gameArea}>
            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>
                {currentQuestion.num1} {currentQuestion.operation} {currentQuestion.num2}
              </Text>
              {streak > 0 && (
                <View style={styles.streakBadge}>
                  <Text style={styles.streakText}>🔥 {streak} Streak!</Text>
                </View>
              )}
            </View>

            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleAnswer(option)}
                  style={styles.optionButton}>
                  <LinearGradient
                    colors={['#1E293B', '#334155']}
                    style={styles.optionGradient}>
                    <Text style={styles.optionText}>{option}</Text>
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
          </View>

          <GameHUD
            score={score}
            timeRemaining={timeRemaining}
            showPause={false}
          />
        </>
      )}

      {gameState === 'countdown' && <Countdown onComplete={onCountdownComplete} />}

      <GameOverlay
        visible={gameState === 'start'}
        type="start"
        title="Math Blast"
        message="Solve math problems as quickly as possible! Build a streak for bonus points."
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  questionContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  questionText: {
    fontSize: 64,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  streakBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  streakText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  optionsContainer: {
    width: '100%',
    gap: 16,
  },
  optionButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  optionGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#475569',
  },
  optionText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
