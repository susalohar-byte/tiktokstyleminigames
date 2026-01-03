import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Pause, Heart, Clock } from 'lucide-react-native';

interface GameHUDProps {
  score: number;
  timeRemaining?: number;
  lives?: number;
  maxLives?: number;
  onPause?: () => void;
  showPause?: boolean;
}

export function GameHUD({
  score,
  timeRemaining,
  lives,
  maxLives = 3,
  onPause,
  showPause = true,
}: GameHUDProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <LinearGradient
        colors={['rgba(15, 23, 42, 0.9)', 'transparent']}
        style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.leftSection}>
            <Text style={styles.scoreLabel}>Score</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </View>

          <View style={styles.centerSection}>
            {timeRemaining !== undefined && (
              <View style={styles.timerContainer}>
                <Clock size={20} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
              </View>
            )}

            {lives !== undefined && (
              <View style={styles.livesContainer}>
                {Array.from({ length: maxLives }).map((_, index) => (
                  <Heart
                    key={index}
                    size={24}
                    color={index < lives ? '#EF4444' : '#475569'}
                    fill={index < lives ? '#EF4444' : 'transparent'}
                    strokeWidth={2}
                  />
                ))}
              </View>
            )}
          </View>

          {showPause && onPause && (
            <Pressable onPress={onPause} style={styles.pauseButton}>
              <LinearGradient
                colors={['rgba(30, 41, 59, 0.9)', 'rgba(30, 41, 59, 0.7)']}
                style={styles.pauseGradient}>
                <Pause size={24} color="#FFFFFF" strokeWidth={2.5} />
              </LinearGradient>
            </Pressable>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  gradient: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  livesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  pauseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  pauseGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
