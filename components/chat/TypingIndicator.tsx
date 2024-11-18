import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { 
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useThemeColor } from '@/hooks/useThemeColor';

export function TypingIndicator() {
  const backgroundColor = useThemeColor({}, 'text');

  const createDotStyle = (delay: number) =>
    useAnimatedStyle(() => ({
      transform: [
        {
          translateY: withRepeat(
            withSequence(
              withDelay(
                delay,
                withSpring(-8, {
                  damping: 5,
                  stiffness: 100,
                })
              ),
              withSpring(0, {
                damping: 5,
                stiffness: 100,
              })
            ),
            -1,
            true
          ),
        },
      ],
      opacity: withRepeat(
        withSequence(
          withTiming(0.3, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      ),
    }));

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor },
            createDotStyle(0),
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor },
            createDotStyle(200),
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor },
            createDotStyle(400),
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    marginHorizontal: 8,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 12,
    borderRadius: 16,
    gap: 4,
    alignSelf: 'flex-start',
    maxWidth: '60%',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
}); 