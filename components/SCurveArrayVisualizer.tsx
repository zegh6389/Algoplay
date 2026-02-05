// S-Curve Array Visualizer with Parabolic Arc Swaps and Advanced Animations
import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_PADDING = Spacing.lg * 2;
const BAR_GAP = 6;
const MIDNIGHT_BLACK = '#0a0e17';

type BarState = 'default' | 'comparing' | 'swapping' | 'sorted' | 'pivot' | 'left-cursor' | 'right-cursor';

interface SCurveArrayVisualizerProps {
  array: number[];
  comparingIndices?: number[];
  swappingIndices?: number[];
  sortedIndices?: number[];
  pivotIndex?: number;
  leftCursor?: number;
  rightCursor?: number;
  label?: string;
  showLabels?: boolean;
  animationSpeed?: 'slow' | 'normal' | 'fast';
  onSwapComplete?: () => void;
  previousArray?: number[];
}

interface AnimatedBarProps {
  value: number;
  maxValue: number;
  index: number;
  state: BarState;
  totalBars: number;
  barWidth: number;
  showLabel: boolean;
  isSwapping: boolean;
  swapTargetIndex?: number;
  animationSpeed: 'slow' | 'normal' | 'fast';
  onSwapDone?: () => void;
}

// S-Curve Bezier easing for smooth parabolic motion
const sCurveEasing = Easing.bezier(0.4, 0, 0.2, 1);

// Calculate parabolic arc control points for S-curve swap
function calculateSwapPath(
  startX: number,
  endX: number,
  barHeight: number,
  maxHeight: number
): { peakY: number; path: 'up' | 'down' } {
  const distance = Math.abs(endX - startX);
  const isMovingRight = endX > startX;

  // Arc height proportional to distance and bar height
  const arcHeight = Math.min(maxHeight * 0.6, distance * 0.5 + barHeight * 0.3);

  // Alternate arc direction based on movement direction
  const path = isMovingRight ? 'up' : 'down';
  const peakY = path === 'up' ? -arcHeight : arcHeight * 0.3;

  return { peakY, path };
}

// Animated Bar with S-Curve Swap
function AnimatedBar({
  value,
  maxValue,
  index,
  state,
  totalBars,
  barWidth,
  showLabel,
  isSwapping,
  swapTargetIndex,
  animationSpeed,
  onSwapDone,
}: AnimatedBarProps) {
  const maxHeight = 180;
  const height = (value / maxValue) * maxHeight;

  // Position values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const shadowBlur = useSharedValue(0);

  const speedDurations = { slow: 800, normal: 500, fast: 250 };
  const duration = speedDurations[animationSpeed];

  // Handle S-Curve swap animation
  useEffect(() => {
    if (isSwapping && swapTargetIndex !== undefined && swapTargetIndex !== index) {
      const currentX = index * (barWidth + BAR_GAP);
      const targetX = swapTargetIndex * (barWidth + BAR_GAP);
      const deltaX = targetX - currentX;
      const { peakY, path } = calculateSwapPath(currentX, targetX, height, maxHeight);

      // Phase 1: Lift and rotate slightly
      scale.value = withTiming(1.15, { duration: duration * 0.15, easing: Easing.out(Easing.back(1.5)) });
      rotation.value = withTiming(path === 'up' ? -3 : 3, { duration: duration * 0.15 });

      // Phase 2: S-Curve arc movement
      translateY.value = withSequence(
        withTiming(peakY, { duration: duration * 0.45, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: duration * 0.4, easing: Easing.in(Easing.cubic) })
      );

      translateX.value = withSequence(
        withDelay(
          duration * 0.1,
          withTiming(deltaX, { duration: duration * 0.8, easing: sCurveEasing })
        )
      );

      // Phase 3: Land and settle
      scale.value = withSequence(
        withDelay(duration * 0.5, withTiming(1.05, { duration: duration * 0.2 })),
        withTiming(1, { duration: duration * 0.2, easing: Easing.out(Easing.bounce) })
      );

      rotation.value = withSequence(
        withDelay(duration * 0.7, withTiming(0, { duration: duration * 0.3 }))
      );

      // Glow during swap
      glowOpacity.value = withSequence(
        withTiming(1, { duration: duration * 0.2 }),
        withDelay(duration * 0.5, withTiming(0.3, { duration: duration * 0.3 }))
      );

      // Callback on completion
      if (onSwapDone) {
        setTimeout(() => {
          runOnJS(onSwapDone)();
        }, duration);
      }
    }
  }, [isSwapping, swapTargetIndex]);

  // Handle state animations
  useEffect(() => {
    if (!isSwapping) {
      // Reset position
      translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    }

    switch (state) {
      case 'comparing':
        scale.value = withSequence(
          withSpring(1.1, { damping: 8, stiffness: 200 }),
          withSpring(1.05, { damping: 10 })
        );
        glowOpacity.value = withTiming(0.7, { duration: 150 });
        break;
      case 'pivot':
        scale.value = withSpring(1.08, { damping: 10 });
        glowOpacity.value = withTiming(0.8, { duration: 200 });
        break;
      case 'sorted':
        scale.value = withSequence(
          withSpring(1.12, { damping: 6, stiffness: 250 }),
          withSpring(1.02, { damping: 10 })
        );
        glowOpacity.value = withSequence(
          withTiming(1, { duration: 150 }),
          withTiming(0.4, { duration: 200 })
        );
        break;
      case 'left-cursor':
      case 'right-cursor':
        scale.value = withSpring(1.05, { damping: 12 });
        glowOpacity.value = withTiming(0.5, { duration: 150 });
        break;
      default:
        if (!isSwapping) {
          scale.value = withSpring(1, { damping: 12 });
          glowOpacity.value = withTiming(0, { duration: 200 });
        }
    }
  }, [state, isSwapping]);

  const getBarColor = () => {
    switch (state) {
      case 'comparing': return Colors.neonYellow;
      case 'swapping': return Colors.neonCyan;
      case 'sorted': return Colors.neonLime;
      case 'pivot': return Colors.neonPurple;
      case 'left-cursor': return Colors.neonPink;
      case 'right-cursor': return Colors.neonOrange;
      default: return Colors.accent;
    }
  };

  const getGlowColor = () => {
    const color = getBarColor();
    return color;
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    shadowOpacity: glowOpacity.value,
    shadowRadius: interpolate(glowOpacity.value, [0, 1], [0, 16]),
  }));

  const barColor = getBarColor();
  const labelColor = state === 'default' ? Colors.textPrimary : MIDNIGHT_BLACK;

  return (
    <View style={[styles.barContainer, { width: barWidth, marginRight: BAR_GAP }]}>
      <Animated.View
        style={[
          styles.bar,
          {
            width: barWidth,
            height,
            backgroundColor: barColor,
          },
          animatedStyle,
          glowStyle,
          {
            shadowColor: getGlowColor(),
          },
        ]}
      >
        {showLabel && barWidth > 24 && (
          <Text
            style={[
              styles.barLabel,
              { color: labelColor, fontSize: barWidth > 32 ? 12 : 10 },
            ]}
          >
            {value}
          </Text>
        )}
      </Animated.View>

      {/* Index label */}
      <Text style={styles.indexLabel}>{index}</Text>

      {/* Cursor indicators */}
      {state === 'left-cursor' && (
        <View style={[styles.cursorLabel, { backgroundColor: Colors.neonPink + '40' }]}>
          <Text style={[styles.cursorText, { color: Colors.neonPink }]}>L</Text>
        </View>
      )}
      {state === 'right-cursor' && (
        <View style={[styles.cursorLabel, { backgroundColor: Colors.neonOrange + '40' }]}>
          <Text style={[styles.cursorText, { color: Colors.neonOrange }]}>R</Text>
        </View>
      )}
      {state === 'pivot' && (
        <View style={[styles.cursorLabel, { backgroundColor: Colors.neonPurple + '40' }]}>
          <Text style={[styles.cursorText, { color: Colors.neonPurple }]}>P</Text>
        </View>
      )}
    </View>
  );
}

// Legend Component
function AnimationLegend() {
  const items = [
    { color: Colors.neonYellow, label: 'Comparing' },
    { color: Colors.neonCyan, label: 'Swapping' },
    { color: Colors.neonLime, label: 'Sorted' },
    { color: Colors.neonPurple, label: 'Pivot' },
    { color: Colors.neonPink, label: 'Left Cursor' },
    { color: Colors.neonOrange, label: 'Right Cursor' },
  ];

  return (
    <View style={styles.legend}>
      {items.map((item, index) => (
        <View key={index} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: item.color }]} />
          <Text style={styles.legendText}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

export default function SCurveArrayVisualizer({
  array,
  comparingIndices = [],
  swappingIndices = [],
  sortedIndices = [],
  pivotIndex,
  leftCursor,
  rightCursor,
  label,
  showLabels = true,
  animationSpeed = 'normal',
  onSwapComplete,
  previousArray,
}: SCurveArrayVisualizerProps) {
  const swapDoneRef = useRef(false);

  const totalBars = array.length;
  const maxValue = Math.max(...array, 1);

  // Calculate bar width
  const availableWidth = SCREEN_WIDTH - CANVAS_PADDING - BAR_GAP * (totalBars - 1);
  const barWidth = Math.max(Math.min(availableWidth / totalBars, 48), 20);

  // Determine swap target for each bar
  const getSwapTarget = (index: number): number | undefined => {
    if (swappingIndices.length === 2) {
      const [a, b] = swappingIndices;
      if (index === a) return b;
      if (index === b) return a;
    }
    return undefined;
  };

  // Get bar state
  const getBarState = (index: number): BarState => {
    if (sortedIndices.includes(index)) return 'sorted';
    if (swappingIndices.includes(index)) return 'swapping';
    if (pivotIndex === index) return 'pivot';
    if (leftCursor === index) return 'left-cursor';
    if (rightCursor === index) return 'right-cursor';
    if (comparingIndices.includes(index)) return 'comparing';
    return 'default';
  };

  const handleSwapDone = () => {
    if (!swapDoneRef.current && onSwapComplete) {
      swapDoneRef.current = true;
      onSwapComplete();
    }
  };

  // Reset swap done ref when swapping changes
  useEffect(() => {
    swapDoneRef.current = false;
  }, [swappingIndices]);

  // Render array from previous state when swapping to show animation
  const renderArray = swappingIndices.length === 2 && previousArray ? previousArray : array;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <AnimationLegend />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.canvas}>
          {renderArray.map((value, index) => {
            const isSwapping = swappingIndices.includes(index);
            const swapTarget = getSwapTarget(index);

            return (
              <AnimatedBar
                key={`${index}-${value}`}
                value={value}
                maxValue={maxValue}
                index={index}
                state={getBarState(index)}
                totalBars={totalBars}
                barWidth={barWidth}
                showLabel={showLabels}
                isSwapping={isSwapping}
                swapTargetIndex={swapTarget}
                animationSpeed={animationSpeed}
                onSwapDone={index === swappingIndices[0] ? handleSwapDone : undefined}
              />
            );
          })}
        </View>
      </ScrollView>

      {/* Current array display */}
      <View style={styles.arrayDisplay}>
        <Text style={styles.arrayText}>[{array.join(', ')}]</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.medium,
    borderWidth: 1,
    borderColor: Colors.neonBorderCyan,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.gray400,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray700,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 10,
    color: Colors.gray400,
  },
  scrollContent: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  canvas: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 220,
    paddingTop: Spacing.lg,
  },
  barContainer: {
    alignItems: 'center',
  },
  bar: {
    borderRadius: BorderRadius.sm,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  barLabel: {
    fontWeight: '700',
    textShadowColor: 'rgba(255, 255, 255, 0.2)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
  indexLabel: {
    fontSize: 9,
    color: Colors.gray500,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  cursorLabel: {
    position: 'absolute',
    top: -22,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  cursorText: {
    fontSize: 9,
    fontWeight: '700',
  },
  arrayDisplay: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginTop: Spacing.md,
  },
  arrayText: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
});
