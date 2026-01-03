import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Compass, Heart, User } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { BlurView } from 'expo-blur';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TABS = [
  { name: 'index', label: 'Home', icon: Home },
  { name: 'explore', label: 'Discover', icon: Compass },
  { name: 'favorites', label: 'Favorites', icon: Heart },
  { name: 'profile', label: 'Profile', icon: User },
];

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors, isDark } = useTheme();
  const tabWidth = 100 / TABS.length;
  const indicatorPosition = useSharedValue(0);

  useEffect(() => {
    indicatorPosition.value = withSpring(state.index * tabWidth, {
      damping: 20,
      stiffness: 100,
    });
  }, [state.index]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value }],
  }));

  return (
    <View style={[styles.container, { borderTopColor: colors.border }]}>
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={isDark ? 80 : 95}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)' },
          ]}
        />
      )}

      <View style={styles.indicatorContainer}>
        <Animated.View
          style={[
            styles.indicator,
            { backgroundColor: colors.primary, width: `${tabWidth}%` },
            indicatorStyle,
          ]}
        />
      </View>

      <View style={styles.tabsContainer}>
        {TABS.map((tab, index) => {
          const route = state.routes[index];
          const isFocused = state.index === index;
          const IconComponent = tab.icon;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabButton
              key={tab.name}
              icon={IconComponent}
              label={tab.label}
              isFocused={isFocused}
              onPress={onPress}
              colors={colors}
            />
          );
        })}
      </View>
    </View>
  );
}

interface TabButtonProps {
  icon: typeof Home;
  label: string;
  isFocused: boolean;
  onPress: () => void;
  colors: any;
}

function TabButton({ icon: Icon, label, isFocused, onPress, colors }: TabButtonProps) {
  const scale = useSharedValue(1);
  const iconScale = useSharedValue(1);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 15 });
    iconScale.value = withSpring(0.85, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
    iconScale.value = withSpring(1, { damping: 15 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.tab, animatedContainerStyle]}>
      <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
        <Icon
          size={24}
          color={isFocused ? colors.primary : colors.textTertiary}
          strokeWidth={isFocused ? 2.5 : 2}
          fill={isFocused && (label === 'Home' || label === 'Favorites') ? colors.primary : 'transparent'}
        />
      </Animated.View>
      <Text
        style={[
          styles.label,
          {
            color: isFocused ? colors.primary : colors.textTertiary,
            fontWeight: isFocused ? '700' : '500',
          },
        ]}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    borderTopWidth: 1,
    overflow: 'hidden',
  },
  indicatorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    flexDirection: 'row',
  },
  indicator: {
    height: '100%',
    borderRadius: 2,
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
