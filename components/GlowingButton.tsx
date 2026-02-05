import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface GlowingButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  icon?: React.ReactNode;
  pulsate?: boolean;
  hapticFeedback?: boolean;
}

const variantColors = {
  primary: {
    gradient: [Colors.neonCyan, Colors.accentDark],
    glow: Colors.neonCyan,
    text: Colors.background,
  },
  secondary: {
    gradient: [Colors.neonPurple, Colors.electricPurpleDark],
    glow: Colors.neonPurple,
    text: Colors.white,
  },
  success: {
    gradient: [Colors.neonLime, Colors.successDark],
    glow: Colors.neonLime,
    text: Colors.background,
  },
  danger: {
    gradient: [Colors.error, Colors.errorDark],
    glow: Colors.error,
    text: Colors.white,
  },
  outline: {
    gradient: ['transparent', 'transparent'],
    glow: Colors.neonCyan,
    text: Colors.neonCyan,
  },
};

const sizeStyles = {
  small: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.sm,
    borderRadius: BorderRadius.md,
  },
  medium: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontSize: FontSizes.md,
    borderRadius: BorderRadius.lg,
  },
  large: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    fontSize: FontSizes.lg,
    borderRadius: BorderRadius.xl,
  },
};

export function GlowingButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  icon,
  pulsate = false,
  hapticFeedback = true,
}: GlowingButtonProps) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(pulsate ? 0.3 : 0.5);

  const colors = variantColors[variant];
  const sizing = sizeStyles[size];

  React.useEffect(() => {
    if (pulsate) {
      glowOpacity.value = withRepeat(
        withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [pulsate]);

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 200 });
    if (hapticFeedback && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const handlePress = () => {
    if (hapticFeedback && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    shadowOpacity: interpolate(glowOpacity.value, [0.3, 0.8], [0.3, 0.7]),
  }));

  return (
    <AnimatedTouchable
      style={[
        styles.buttonContainer,
        animatedButtonStyle,
        disabled && styles.disabled,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.9}
    >
      {/* Glow effect layer */}
      <Animated.View
        style={[
          styles.glowLayer,
          {
            borderRadius: sizing.borderRadius,
            shadowColor: colors.glow,
          },
          animatedGlowStyle,
        ]}
      />

      {/* Button content */}
      {variant === 'outline' ? (
        <View
          style={[
            styles.outlineContent,
            {
              paddingVertical: sizing.paddingVertical,
              paddingHorizontal: sizing.paddingHorizontal,
              borderRadius: sizing.borderRadius,
              borderColor: colors.glow,
            },
          ]}
        >
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.buttonText, { color: colors.text, fontSize: sizing.fontSize }]}>
            {title}
          </Text>
        </View>
      ) : (
        <LinearGradient
          colors={colors.gradient as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradientContent,
            {
              paddingVertical: sizing.paddingVertical,
              paddingHorizontal: sizing.paddingHorizontal,
              borderRadius: sizing.borderRadius,
            },
          ]}
        >
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.buttonText, { color: colors.text, fontSize: sizing.fontSize }]}>
            {title}
          </Text>
        </LinearGradient>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    overflow: 'visible',
  },
  glowLayer: {
    ...StyleSheet.absoluteFillObject,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    elevation: 8,
    backgroundColor: 'transparent',
  },
  gradientContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  outlineContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 2,
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
  },
  buttonText: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  iconContainer: {
    marginRight: 2,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default GlowingButton;
