import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface CountdownProps {
  onComplete: () => void;
  startFrom?: number;
}

export function Countdown({ onComplete, startFrom = 3 }: CountdownProps) {
  const [count, setCount] = useState(startFrom);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.2),
      withSpring(1)
    );

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 0;
        }
        return prev - 1;
      });

      scale.value = 0;
      opacity.value = 1;
      scale.value = withSequence(
        withSpring(1.2),
        withSpring(1)
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (count === 0) return null;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.countContainer, animatedStyle]}>
        <Text style={styles.countText}>
          {count === startFrom ? 'Ready' : count === 1 ? 'GO!' : count}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  countContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  countText: {
    fontSize: 64,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
