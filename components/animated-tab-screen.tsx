import { useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

interface AnimatedTabScreenProps {
  children: React.ReactNode;
}

export function AnimatedTabScreen({ children }: AnimatedTabScreenProps) {
  const opacity = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      // Sade ve minimal fade-in animasyonu
      opacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      });

      return () => {
        // Ekran blur olduğunda hızlıca sıfırla
        opacity.value = 0;
      };
    }, [])
  );

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: opacity.value,
    };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.animatedView, animatedStyle]}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animatedView: {
    flex: 1,
  },
});

