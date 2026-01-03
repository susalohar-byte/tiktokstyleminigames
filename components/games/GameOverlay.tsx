import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, RotateCcw, X } from 'lucide-react-native';

interface GameOverlayProps {
  visible: boolean;
  type: 'start' | 'gameover' | 'pause';
  score?: number;
  highScore?: number;
  onStart?: () => void;
  onRestart?: () => void;
  onExit?: () => void;
  onResume?: () => void;
  title?: string;
  message?: string;
}

export function GameOverlay({
  visible,
  type,
  score = 0,
  highScore = 0,
  onStart,
  onRestart,
  onExit,
  onResume,
  title,
  message,
}: GameOverlayProps) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <LinearGradient
          colors={['rgba(15, 23, 42, 0.95)', 'rgba(30, 41, 59, 0.95)']}
          style={styles.content}>

          {type === 'start' && (
            <>
              <Text style={styles.title}>{title || 'Ready to Play?'}</Text>
              {message && <Text style={styles.message}>{message}</Text>}

              <Pressable onPress={onStart} style={styles.primaryButton}>
                <LinearGradient
                  colors={['#8B5CF6', '#6366F1']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}>
                  <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.buttonText}>Start Game</Text>
                </LinearGradient>
              </Pressable>

              {onExit && (
                <Pressable onPress={onExit} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Exit</Text>
                </Pressable>
              )}
            </>
          )}

          {type === 'gameover' && (
            <>
              <Text style={styles.title}>Game Over!</Text>

              <View style={styles.scoreContainer}>
                <Text style={styles.scoreLabel}>Score</Text>
                <Text style={styles.scoreValue}>{score}</Text>
              </View>

              {highScore > 0 && (
                <View style={styles.highScoreContainer}>
                  <Text style={styles.highScoreText}>
                    {score > highScore ? '🎉 New High Score!' : `Best: ${highScore}`}
                  </Text>
                </View>
              )}

              <View style={styles.buttonRow}>
                <Pressable onPress={onRestart} style={styles.primaryButton}>
                  <LinearGradient
                    colors={['#8B5CF6', '#6366F1']}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}>
                    <RotateCcw size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Play Again</Text>
                  </LinearGradient>
                </Pressable>
              </View>

              {onExit && (
                <Pressable onPress={onExit} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Exit</Text>
                </Pressable>
              )}
            </>
          )}

          {type === 'pause' && (
            <>
              <Text style={styles.title}>Paused</Text>

              <Pressable onPress={onResume} style={styles.primaryButton}>
                <LinearGradient
                  colors={['#8B5CF6', '#6366F1']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}>
                  <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.buttonText}>Resume</Text>
                </LinearGradient>
              </Pressable>

              {onExit && (
                <Pressable onPress={onExit} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Exit Game</Text>
                </Pressable>
              )}
            </>
          )}
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  highScoreContainer: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 24,
  },
  highScoreText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#A78BFA',
  },
  buttonRow: {
    width: '100%',
    marginBottom: 12,
  },
  primaryButton: {
    width: '100%',
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
