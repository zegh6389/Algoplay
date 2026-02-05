import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  Easing,
  runOnJS,
  interpolate,
  FadeIn,
  FadeOut,
  SlideInUp,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface XPGainAnimationProps {
  visible: boolean;
  xpAmount: number;
  onComplete: () => void;
  message?: string;
  showLevelUp?: boolean;
  newLevel?: number;
}

interface FloatingXPProps {
  delay: number;
  x: number;
}

function FloatingXP({ delay, x }: FloatingXPProps) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(-100, { duration: 1500, easing: Easing.out(Easing.quad) })
    );
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(800, withTiming(0, { duration: 500 }))
      )
    );
    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 8 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: x },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.floatingXP, animatedStyle]}>
      <Ionicons name="star" size={16} color={Colors.logicGold} />
    </Animated.View>
  );
}

export default function XPGainAnimation({
  visible,
  xpAmount,
  onComplete,
  message = 'XP Earned!',
  showLevelUp = false,
  newLevel = 1,
}: XPGainAnimationProps) {
  const [showContent, setShowContent] = useState(false);

  const mainScale = useSharedValue(0);
  const xpScale = useSharedValue(0);
  const xpRotate = useSharedValue(0);
  const shimmerProgress = useSharedValue(0);
  const levelUpScale = useSharedValue(0);
  const containerOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setShowContent(true);
      startAnimation();
    } else {
      setShowContent(false);
    }
  }, [visible]);

  const startAnimation = () => {
    // Reset values
    mainScale.value = 0;
    xpScale.value = 0;
    xpRotate.value = 0;
    shimmerProgress.value = 0;
    levelUpScale.value = 0;
    containerOpacity.value = 0;

    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Container fade in
    containerOpacity.value = withTiming(1, { duration: 200 });

    // Main burst animation
    mainScale.value = withSequence(
      withSpring(1.2, { damping: 8, stiffness: 200 }),
      withSpring(1, { damping: 10 })
    );

    // XP number animation
    xpScale.value = withDelay(
      200,
      withSequence(
        withSpring(1.3, { damping: 6, stiffness: 300 }),
        withSpring(1, { damping: 8 })
      )
    );

    // Rotate sparkle effect
    xpRotate.value = withDelay(
      200,
      withSequence(
        withTiming(-5, { duration: 100 }),
        withTiming(5, { duration: 100 }),
        withTiming(0, { duration: 100 })
      )
    );

    // Shimmer effect
    shimmerProgress.value = withDelay(
      400,
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
    );

    // Level up animation (if applicable)
    if (showLevelUp) {
      levelUpScale.value = withDelay(
        800,
        withSequence(
          withSpring(1.2, { damping: 6 }),
          withSpring(1, { damping: 10 })
        )
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Auto close after animation
    const timeout = setTimeout(() => {
      containerOpacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(onComplete)();
      });
    }, showLevelUp ? 3000 : 2000);

    return () => clearTimeout(timeout);
  };

  const mainAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mainScale.value }],
  }));

  const xpAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: xpScale.value },
      { rotate: `${xpRotate.value}deg` },
    ],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(shimmerProgress.value, [0, 1], [-200, 200]) },
    ],
    opacity: interpolate(shimmerProgress.value, [0, 0.5, 1], [0, 0.5, 0]),
  }));

  const levelUpStyle = useAnimatedStyle(() => ({
    transform: [{ scale: levelUpScale.value }],
    opacity: levelUpScale.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  if (!showContent) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.container, containerStyle]}>
        <BlurView intensity={30} tint="dark" style={styles.blur}>
          <View style={styles.content}>
            {/* Floating particles */}
            {Array.from({ length: 8 }).map((_, i) => (
              <FloatingXP
                key={i}
                delay={i * 100}
                x={(Math.random() - 0.5) * 150}
              />
            ))}

            {/* Main XP Card */}
            <Animated.View style={[styles.mainCard, mainAnimatedStyle]}>
              {/* Shimmer effect */}
              <Animated.View style={[styles.shimmer, shimmerStyle]} />

              {/* Icon */}
              <View style={styles.iconContainer}>
                <Ionicons name="star" size={48} color={Colors.logicGold} />
              </View>

              {/* XP Amount */}
              <Animated.View style={[styles.xpContainer, xpAnimatedStyle]}>
                <Text style={styles.xpAmount}>+{xpAmount}</Text>
                <Text style={styles.xpLabel}>XP</Text>
              </Animated.View>

              {/* Message */}
              <Text style={styles.message}>{message}</Text>

              {/* Progress bar simulation */}
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: shimmerProgress.value > 0 ? '100%' : '0%',
                    },
                  ]}
                />
              </View>
            </Animated.View>

            {/* Level Up Card */}
            {showLevelUp && (
              <Animated.View style={[styles.levelUpCard, levelUpStyle]}>
                <View style={styles.levelUpIcon}>
                  <Ionicons name="arrow-up-circle" size={32} color={Colors.actionTeal} />
                </View>
                <Text style={styles.levelUpTitle}>Level Up!</Text>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelNumber}>{newLevel}</Text>
                </View>
              </Animated.View>
            )}
          </View>
        </BlurView>
      </Animated.View>
    </Modal>
  );
}

// Compact inline XP animation for small gains
export function XPGainInline({
  xpAmount,
  onComplete,
}: {
  xpAmount: number;
  onComplete?: () => void;
}) {
  const scale = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 8 });
    opacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withDelay(1000, withTiming(0, { duration: 300 }))
    );
    translateY.value = withDelay(
      200,
      withTiming(-20, { duration: 1000, easing: Easing.out(Easing.quad) })
    );

    const timeout = setTimeout(() => {
      onComplete?.();
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.inlineContainer, animatedStyle]}>
      <Ionicons name="star" size={14} color={Colors.logicGold} />
      <Text style={styles.inlineText}>+{xpAmount} XP</Text>
    </Animated.View>
  );
}

// Mastery Badge Component
interface MasteryBadgeProps {
  level: 'none' | 'bronze' | 'silver' | 'gold';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export function MasteryBadge({ level, size = 'medium', showLabel = true }: MasteryBadgeProps) {
  const getConfig = () => {
    switch (level) {
      case 'gold':
        return {
          color: Colors.logicGold,
          icon: 'trophy' as const,
          label: 'Gold Mastery',
        };
      case 'silver':
        return {
          color: '#94A3B8',
          icon: 'medal' as const,
          label: 'Silver Mastery',
        };
      case 'bronze':
        return {
          color: '#CD7F32',
          icon: 'ribbon' as const,
          label: 'Bronze Mastery',
        };
      default:
        return {
          color: Colors.gray600,
          icon: 'ellipse-outline' as const,
          label: 'No Mastery',
        };
    }
  };

  const config = getConfig();
  const iconSize = size === 'small' ? 16 : size === 'medium' ? 24 : 32;
  const badgeSize = size === 'small' ? 28 : size === 'medium' ? 40 : 52;

  return (
    <View style={styles.masteryContainer}>
      <View
        style={[
          styles.masteryBadge,
          {
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            backgroundColor: config.color + '20',
            borderColor: config.color,
          },
        ]}
      >
        <Ionicons name={config.icon} size={iconSize} color={config.color} />
      </View>
      {showLabel && level !== 'none' && (
        <Text style={[styles.masteryLabel, { color: config.color }]}>
          {config.label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blur: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  mainCard: {
    backgroundColor: Colors.midnightBlue + 'F5',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xxl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.logicGold + '50',
    overflow: 'hidden',
    minWidth: 200,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.logicGold,
    width: 100,
    opacity: 0.3,
    transform: [{ skewX: '-20deg' }],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.logicGold + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.sm,
  },
  xpAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.logicGold,
  },
  xpLabel: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.logicGold,
    marginLeft: Spacing.xs,
  },
  message: {
    fontSize: FontSizes.md,
    color: Colors.gray400,
    marginBottom: Spacing.lg,
  },
  progressBar: {
    width: 160,
    height: 6,
    backgroundColor: Colors.gray700,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.logicGold,
    borderRadius: BorderRadius.full,
  },
  levelUpCard: {
    backgroundColor: Colors.actionTeal + '20',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.actionTeal,
  },
  levelUpIcon: {
    marginBottom: Spacing.sm,
  },
  levelUpTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.actionTeal,
    marginBottom: Spacing.sm,
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.actionTeal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.midnightBlue,
  },
  floatingXP: {
    position: 'absolute',
  },
  // Inline styles
  inlineContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.logicGold + '30',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  inlineText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.logicGold,
  },
  // Mastery Badge styles
  masteryContainer: {
    alignItems: 'center',
  },
  masteryBadge: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  masteryLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
});
