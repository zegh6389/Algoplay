// Enhanced Animation Suite: Particles, Celebrations, Micro-interactions
import React, { useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Dimensions, ViewStyle, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  runOnJS,
  Easing,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============ PARTICLE BURST FOR VICTORIES ============
interface Particle {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  size: number;
  rotation: number;
}

interface ParticleBurstProps {
  isActive: boolean;
  x?: number;
  y?: number;
  particleCount?: number;
  colors?: string[];
  onComplete?: () => void;
}

export function ParticleBurst({
  isActive,
  x = SCREEN_WIDTH / 2,
  y = SCREEN_HEIGHT / 2,
  particleCount = 30,
  colors = [Colors.neonCyan, Colors.neonLime, Colors.neonYellow, Colors.neonPink, Colors.neonPurple],
  onComplete,
}: ParticleBurstProps) {
  const particles = useMemo(() => {
    const result: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const distance = 80 + Math.random() * 150;
      result.push({
        id: i,
        startX: x,
        startY: y,
        endX: x + Math.cos(angle) * distance,
        endY: y + Math.sin(angle) * distance - 50 - Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 10,
        rotation: Math.random() * 360,
      });
    }
    return result;
  }, [x, y, particleCount, colors]);

  if (!isActive) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((particle) => (
        <ParticleItem key={particle.id} particle={particle} onComplete={particle.id === 0 ? onComplete : undefined} />
      ))}
    </View>
  );
}

function ParticleItem({ particle, onComplete }: { particle: Particle; onComplete?: () => void }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }, () => {
      if (onComplete) {
        runOnJS(onComplete)();
      }
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(progress.value, [0, 1], [particle.startX, particle.endX]);
    const translateY = interpolate(progress.value, [0, 1], [particle.startY, particle.endY]);
    const scale = interpolate(progress.value, [0, 0.2, 1], [0, 1, 0]);
    const rotate = interpolate(progress.value, [0, 1], [0, particle.rotation]);
    const opacity = interpolate(progress.value, [0, 0.8, 1], [1, 1, 0]);

    return {
      position: 'absolute',
      left: 0,
      top: 0,
      width: particle.size,
      height: particle.size,
      borderRadius: particle.size / 2,
      backgroundColor: particle.color,
      opacity,
      transform: [
        { translateX },
        { translateY },
        { scale },
        { rotate: `${rotate}deg` },
      ],
      shadowColor: particle.color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 8,
    } as ViewStyle;
  });

  return <Animated.View style={animatedStyle} />;
}

// ============ CONFETTI CELEBRATION ============
interface ConfettiProps {
  isActive: boolean;
  duration?: number;
  onComplete?: () => void;
}

export function VictoryConfetti({ isActive, duration = 3000, onComplete }: ConfettiProps) {
  const confettiPieces = useMemo(() => {
    const pieces = [];
    const colors = [Colors.neonCyan, Colors.neonLime, Colors.neonYellow, Colors.neonPink, Colors.neonPurple, '#fff'];
    for (let i = 0; i < 50; i++) {
      pieces.push({
        id: i,
        startX: Math.random() * SCREEN_WIDTH,
        endX: Math.random() * SCREEN_WIDTH,
        delay: Math.random() * 500,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 8,
        rotation: Math.random() * 720,
      });
    }
    return pieces;
  }, []);

  useEffect(() => {
    if (isActive) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (onComplete) {
        const timer = setTimeout(onComplete, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [isActive, duration, onComplete]);

  if (!isActive) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {confettiPieces.map((piece) => (
        <ConfettiPiece key={piece.id} piece={piece} duration={duration} />
      ))}
    </View>
  );
}

function ConfettiPiece({
  piece,
  duration,
}: {
  piece: { startX: number; endX: number; delay: number; color: string; size: number; rotation: number };
  duration: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      piece.delay,
      withTiming(1, { duration: duration - piece.delay, easing: Easing.linear })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [piece.startX, piece.endX + (Math.sin(progress.value * Math.PI * 4) * 30)]
    );
    const translateY = interpolate(progress.value, [0, 1], [-20, SCREEN_HEIGHT + 50]);
    const rotate = interpolate(progress.value, [0, 1], [0, piece.rotation]);
    const opacity = interpolate(progress.value, [0.8, 1], [1, 0]);

    return {
      position: 'absolute',
      left: 0,
      top: 0,
      width: piece.size,
      height: piece.size * 0.6,
      backgroundColor: piece.color,
      borderRadius: 2,
      opacity,
      transform: [
        { translateX },
        { translateY },
        { rotate: `${rotate}deg` },
        { rotateX: `${rotate * 2}deg` },
      ],
    } as ViewStyle;
  });

  return <Animated.View style={animatedStyle} />;
}

// ============ ACHIEVEMENT POPUP ============
interface AchievementPopupProps {
  isVisible: boolean;
  title: string;
  description: string;
  icon?: string;
  xpReward?: number;
  onDismiss?: () => void;
}

export function AchievementPopup({
  isVisible,
  title,
  description,
  icon = '🏆',
  xpReward,
  onDismiss,
}: AchievementPopupProps) {
  const translateY = useSharedValue(-200);
  const scale = useSharedValue(0.8);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      translateY.value = withSpring(60, { damping: 12, stiffness: 100 });
      scale.value = withSpring(1, { damping: 10, stiffness: 150 });
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600 }),
          withTiming(0.4, { duration: 600 })
        ),
        -1,
        true
      );

      // Auto dismiss after 4 seconds
      const timer = setTimeout(() => {
        translateY.value = withTiming(-200, { duration: 400 });
        onDismiss?.();
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      translateY.value = withTiming(-200, { duration: 300 });
    }
  }, [isVisible]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.achievementContainer, containerStyle]}>
      <Animated.View style={[styles.achievementGlow, glowStyle]} />
      <View style={styles.achievementContent}>
        <View style={styles.achievementIcon}>
          <Animated.Text style={styles.achievementIconText}>{icon}</Animated.Text>
        </View>
        <View style={styles.achievementTextContainer}>
          <Animated.Text style={styles.achievementTitle}>{title}</Animated.Text>
          <Animated.Text style={styles.achievementDescription}>{description}</Animated.Text>
          {xpReward && (
            <Animated.Text style={styles.achievementXP}>+{xpReward} XP</Animated.Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

// ============ NEON PULSE EFFECT ============
interface NeonPulseProps {
  children: React.ReactNode;
  color?: string;
  isActive?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

export function NeonPulse({
  children,
  color = Colors.neonCyan,
  isActive = true,
  intensity = 'medium',
}: NeonPulseProps) {
  const glowOpacity = useSharedValue(0.3);

  const intensityValues = {
    low: { min: 0.2, max: 0.5, duration: 1200 },
    medium: { min: 0.3, max: 0.8, duration: 800 },
    high: { min: 0.5, max: 1, duration: 500 },
  };

  const { min, max, duration } = intensityValues[intensity];

  useEffect(() => {
    if (isActive) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(max, { duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(min, { duration, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isActive, intensity]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: glowOpacity.value,
    shadowRadius: 16,
    elevation: 8,
  }));

  return <Animated.View style={glowStyle}>{children}</Animated.View>;
}

// ============ RIPPLE BUTTON EFFECT ============
interface RippleButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  rippleColor?: string;
  disabled?: boolean;
}

export function RippleButton({
  children,
  onPress,
  style,
  rippleColor = Colors.neonCyan,
  disabled = false,
}: RippleButtonProps) {
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  const handlePress = useCallback(() => {
    if (disabled) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Button press animation
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 50 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );

    // Ripple effect
    rippleScale.value = 0;
    rippleOpacity.value = 0.3;
    rippleScale.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) });
    rippleOpacity.value = withDelay(200, withTiming(0, { duration: 200 }));

    onPress();
  }, [onPress, disabled]);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: '200%',
    height: '200%',
    borderRadius: 999,
    backgroundColor: rippleColor,
    opacity: rippleOpacity.value,
    transform: [{ scale: rippleScale.value }],
    left: '-50%',
    top: '-50%',
  }));

  return (
    <Pressable onPress={handlePress} disabled={disabled}>
      <Animated.View style={[style, buttonStyle, { overflow: 'hidden' }]}>
        <Animated.View style={rippleStyle} />
        {children}
      </Animated.View>
    </Pressable>
  );
}

// ============ SHOCKWAVE PULSE (for graph/tree nodes) ============
interface ShockwavePulseProps {
  isActive: boolean;
  x: number;
  y: number;
  size: number;
  color?: string;
  rings?: number;
}

export function ShockwavePulse({
  isActive,
  x,
  y,
  size,
  color = Colors.neonCyan,
  rings = 3,
}: ShockwavePulseProps) {
  if (!isActive) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
      {Array.from({ length: rings }).map((_, i) => (
        <ShockwaveRing key={i} x={x} y={y} size={size} color={color} delay={i * 150} />
      ))}
    </View>
  );
}

function ShockwaveRing({
  x,
  y,
  size,
  color,
  delay,
}: {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = 1;
    opacity.value = 0;
    scale.value = withDelay(delay, withTiming(3, { duration: 800, easing: Easing.out(Easing.ease) }));
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(0.7, { duration: 100 }),
        withTiming(0, { duration: 700 })
      )
    );
  }, [delay]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x - size / 2,
    top: y - size / 2,
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: 2,
    borderColor: color,
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={style} />;
}

// ============ LASER BEAM PATH EFFECT ============
interface LaserBeamProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color?: string;
  isActive: boolean;
  duration?: number;
}

export function LaserBeam({
  fromX,
  fromY,
  toX,
  toY,
  color = Colors.neonCyan,
  isActive,
  duration = 300,
}: LaserBeamProps) {
  const progress = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      progress.value = 0;
      glowOpacity.value = 0;
      progress.value = withTiming(1, { duration, easing: Easing.out(Easing.ease) });
      glowOpacity.value = withSequence(
        withTiming(1, { duration: duration / 2 }),
        withTiming(0.5, { duration: duration / 2 })
      );
    }
  }, [isActive, duration]);

  const lineLength = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2);
  const angle = Math.atan2(toY - fromY, toX - fromX) * (180 / Math.PI);

  const beamStyle = useAnimatedStyle(() => {
    const currentLength = lineLength * progress.value;
    return {
      position: 'absolute',
      left: fromX,
      top: fromY - 2,
      width: currentLength,
      height: 4,
      backgroundColor: color,
      transform: [{ rotate: `${angle}deg` }],
      transformOrigin: 'left',
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: glowOpacity.value,
      shadowRadius: 12,
    };
  });

  if (!isActive) return null;

  return <Animated.View style={beamStyle} />;
}

// ============ ELEMENT STATE HIGHLIGHTS ============
export const ElementStateColors = {
  comparing: Colors.neonYellow, // Yellow for comparisons
  swapping: Colors.neonCyan, // Cyan for swaps
  sorted: Colors.neonLime, // Green for sorted
  active: Colors.neonPink, // Pink for active
  default: Colors.gray600,
};

interface ElementHighlightProps {
  state: 'comparing' | 'swapping' | 'sorted' | 'active' | 'default';
  children: React.ReactNode;
  style?: ViewStyle;
}

export function ElementHighlight({ state, children, style }: ElementHighlightProps) {
  const glowOpacity = useSharedValue(0);
  const scale = useSharedValue(1);

  const color = ElementStateColors[state];

  useEffect(() => {
    if (state !== 'default') {
      scale.value = withSequence(
        withTiming(1.1, { duration: 100 }),
        withSpring(1, { damping: 10 })
      );
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 400 }),
          withTiming(0.4, { duration: 400 })
        ),
        -1,
        true
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(1, { duration: 200 });
    }
  }, [state]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: state !== 'default' ? glowOpacity.value : 0,
    shadowRadius: 12,
    backgroundColor: color,
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

// ============ XP GAIN FLOATING TEXT ============
interface XPGainFloatProps {
  amount: number;
  x: number;
  y: number;
  isVisible: boolean;
  onComplete?: () => void;
}

export function XPGainFloat({ amount, x, y, isVisible, onComplete }: XPGainFloatProps) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    if (isVisible) {
      translateY.value = 0;
      opacity.value = 0;
      scale.value = 0.5;

      scale.value = withSpring(1.2, { damping: 8 }, () => {
        scale.value = withTiming(1, { duration: 200 });
      });
      opacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(800, withTiming(0, { duration: 400 }, () => {
          if (onComplete) runOnJS(onComplete)();
        }))
      );
      translateY.value = withTiming(-60, { duration: 1400, easing: Easing.out(Easing.ease) });
    }
  }, [isVisible]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x - 30,
    top: y,
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  if (!isVisible) return null;

  return (
    <Animated.View style={style}>
      <Animated.Text style={styles.xpGainText}>+{amount} XP</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  achievementContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    backgroundColor: Colors.surfaceDark,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.neonLime,
    padding: 16,
    zIndex: 1000,
  },
  achievementGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    backgroundColor: Colors.neonLime,
    opacity: 0.1,
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.neonLime + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementIconText: {
    fontSize: 28,
  },
  achievementTextContainer: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  achievementXP: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neonLime,
    marginTop: 4,
  },
  xpGainText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.neonLime,
    textShadowColor: Colors.neonLime,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
