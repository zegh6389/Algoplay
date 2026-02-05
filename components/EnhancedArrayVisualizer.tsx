// Enhanced Array Visualizer with S-curve Animations, Comparison Arrows, and State Colors
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Path, Defs, Marker, Line as SvgLine } from 'react-native-svg';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_PADDING = Spacing.lg * 2;
const BAR_GAP = 6;
const MIDNIGHT_BLACK = '#0a0e17';

// State colors matching the requirement
const STATE_COLORS = {
  default: Colors.accent, // Neon cyan
  comparing: '#e5c07b', // Yellow for comparing
  swapping: '#56b6c2', // Cyan for swapping
  sorted: '#98c379', // Green for sorted
  pivot: Colors.neonPurple,
  found: Colors.neonLime,
  eliminated: Colors.gray600,
  activeRange: Colors.accent,
};

type BarState = 'default' | 'comparing' | 'swapping' | 'sorted' | 'pivot' | 'found' | 'eliminated' | 'activeRange';

interface EnhancedArrayVisualizerProps {
  array: number[];
  comparingIndices?: number[];
  swappingIndices?: number[];
  sortedIndices?: number[];
  pivotIndex?: number;
  foundIndex?: number;
  eliminatedIndices?: number[];
  activeRangeIndices?: number[];
  showComparisonArrows?: boolean;
  showSwapAnimation?: boolean;
  animationSpeed?: number;
  onSwapComplete?: () => void;
  label?: string;
}

interface BarProps {
  value: number;
  maxValue: number;
  index: number;
  state: BarState;
  totalBars: number;
  barWidth: number;
  isPassComplete?: boolean;
  swapTargetIndex?: number;
  onSwapComplete?: () => void;
}

// Animated bar with S-curve swap animation
function AnimatedBar({
  value,
  maxValue,
  index,
  state,
  totalBars,
  barWidth,
  isPassComplete,
  swapTargetIndex,
  onSwapComplete,
}: BarProps) {
  const maxHeight = 180;
  const height = (value / maxValue) * maxHeight;

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  // Scale animation based on state
  useEffect(() => {
    if (state === 'comparing') {
      scale.value = withSpring(1.08, { damping: 8, stiffness: 200 });
      glowOpacity.value = withSequence(
        withTiming(0.8, { duration: 150 }),
        withTiming(0.4, { duration: 150 })
      );
    } else if (state === 'swapping') {
      scale.value = withSequence(
        withSpring(1.15, { damping: 6, stiffness: 250 }),
        withDelay(200, withSpring(1.08, { damping: 8, stiffness: 200 }))
      );
      glowOpacity.value = withTiming(1, { duration: 100 });
    } else if (state === 'sorted') {
      scale.value = withSpring(1, { damping: 10, stiffness: 150 });
      glowOpacity.value = withTiming(0.3, { duration: 300 });
    } else {
      scale.value = withSpring(1, { damping: 10 });
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [state]);

  // Pulse animation on pass complete
  useEffect(() => {
    if (isPassComplete) {
      pulseScale.value = withSequence(
        withTiming(1.1, { duration: 150, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 150, easing: Easing.in(Easing.ease) })
      );
    }
  }, [isPassComplete]);

  // S-curve swap animation
  useEffect(() => {
    if (swapTargetIndex !== undefined && state === 'swapping') {
      const distance = (swapTargetIndex - index) * (barWidth + BAR_GAP);
      const arcHeight = -40; // Negative for upward arc

      // S-curve path: up, across, down
      translateY.value = withSequence(
        withTiming(arcHeight, { duration: 150, easing: Easing.out(Easing.cubic) }),
        withTiming(arcHeight, { duration: 200 }),
        withTiming(0, { duration: 150, easing: Easing.in(Easing.cubic) })
      );

      translateX.value = withTiming(
        distance,
        { duration: 500, easing: Easing.inOut(Easing.cubic) },
        (finished) => {
          if (finished && onSwapComplete) {
            runOnJS(onSwapComplete)();
          }
        }
      );
    } else {
      translateX.value = withSpring(0, { damping: 15, stiffness: 100 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    }
  }, [swapTargetIndex, state]);

  const getBarColor = () => {
    return STATE_COLORS[state] || STATE_COLORS.default;
  };

  const getGlowColor = () => {
    switch (state) {
      case 'comparing':
        return STATE_COLORS.comparing;
      case 'swapping':
        return STATE_COLORS.swapping;
      case 'sorted':
        return STATE_COLORS.sorted;
      default:
        return Colors.neonCyan;
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value * pulseScale.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    shadowColor: getGlowColor(),
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: glowOpacity.value,
    shadowRadius: 12,
    elevation: glowOpacity.value > 0.5 ? 8 : 0,
  }));

  const barColor = getBarColor();
  const textColor = state === 'eliminated' ? Colors.gray400 : MIDNIGHT_BLACK;

  return (
    <Animated.View
      style={[
        styles.barContainer,
        {
          width: barWidth,
          marginRight: index < totalBars - 1 ? BAR_GAP : 0,
        },
        animatedStyle,
      ]}
    >
      <Animated.View
        style={[
          styles.bar,
          glowStyle,
          {
            height,
            backgroundColor: barColor,
            opacity: state === 'eliminated' ? 0.35 : 1,
          },
        ]}
      >
        {barWidth > 20 && (
          <Text style={[styles.barLabel, { color: textColor }]}>{value}</Text>
        )}
      </Animated.View>
      <Text style={styles.indexLabel}>{index}</Text>
    </Animated.View>
  );
}

// Comparison arrows between elements
function ComparisonArrows({
  indices,
  barWidth,
  totalBars,
  canvasWidth,
}: {
  indices: number[];
  barWidth: number;
  totalBars: number;
  canvasWidth: number;
}) {
  if (indices.length < 2) return null;

  const sortedIndices = [...indices].sort((a, b) => a - b);
  const leftIndex = sortedIndices[0];
  const rightIndex = sortedIndices[sortedIndices.length - 1];

  const startX = leftIndex * (barWidth + BAR_GAP) + barWidth / 2 + CANVAS_PADDING / 2;
  const endX = rightIndex * (barWidth + BAR_GAP) + barWidth / 2 + CANVAS_PADDING / 2;
  const y = 10;

  return (
    <Svg width={canvasWidth} height={30} style={styles.arrowsSvg}>
      <Defs>
        <Marker
          id="arrowLeft"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <Path d="M 0 0 L 10 5 L 0 10 z" fill={STATE_COLORS.comparing} />
        </Marker>
        <Marker
          id="arrowRight"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <Path d="M 0 0 L 10 5 L 0 10 z" fill={STATE_COLORS.comparing} />
        </Marker>
      </Defs>
      {/* Bidirectional arrow */}
      <SvgLine
        x1={startX + 10}
        y1={y}
        x2={endX - 10}
        y2={y}
        stroke={STATE_COLORS.comparing}
        strokeWidth={2}
        markerStart="url(#arrowLeft)"
        markerEnd="url(#arrowRight)"
      />
    </Svg>
  );
}

export default function EnhancedArrayVisualizer({
  array,
  comparingIndices = [],
  swappingIndices = [],
  sortedIndices = [],
  pivotIndex,
  foundIndex,
  eliminatedIndices = [],
  activeRangeIndices = [],
  showComparisonArrows = true,
  showSwapAnimation = true,
  animationSpeed = 1,
  onSwapComplete,
  label,
}: EnhancedArrayVisualizerProps) {
  const totalBars = array.length;
  const barWidth = Math.max(
    (SCREEN_WIDTH - CANVAS_PADDING - BAR_GAP * (totalBars - 1)) / totalBars,
    24
  );
  const canvasWidth = SCREEN_WIDTH - CANVAS_PADDING / 2;
  const maxValue = Math.max(...array, 1);

  const getBarState = (index: number): BarState => {
    if (foundIndex === index) return 'found';
    if (eliminatedIndices.includes(index)) return 'eliminated';
    if (swappingIndices.includes(index)) return 'swapping';
    if (comparingIndices.includes(index)) return 'comparing';
    if (sortedIndices.includes(index)) return 'sorted';
    if (pivotIndex === index) return 'pivot';
    if (activeRangeIndices.includes(index)) return 'activeRange';
    return 'default';
  };

  // Determine swap targets for S-curve animation
  const getSwapTarget = (index: number): number | undefined => {
    if (!showSwapAnimation || swappingIndices.length !== 2) return undefined;
    const [first, second] = swappingIndices;
    if (index === first) return second;
    if (index === second) return first;
    return undefined;
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Comparison arrows */}
      {showComparisonArrows && comparingIndices.length >= 2 && (
        <ComparisonArrows
          indices={comparingIndices}
          barWidth={barWidth}
          totalBars={totalBars}
          canvasWidth={canvasWidth}
        />
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: STATE_COLORS.comparing }]} />
          <Text style={styles.legendText}>Comparing</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: STATE_COLORS.swapping }]} />
          <Text style={styles.legendText}>Swapping</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: STATE_COLORS.sorted }]} />
          <Text style={styles.legendText}>Sorted</Text>
        </View>
      </View>

      {/* Bars */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.barsContainer}>
          {array.map((value, index) => (
            <AnimatedBar
              key={`${index}-${value}`}
              value={value}
              maxValue={maxValue}
              index={index}
              state={getBarState(index)}
              totalBars={totalBars}
              barWidth={barWidth}
              swapTargetIndex={getSwapTarget(index)}
              onSwapComplete={index === swappingIndices[0] ? onSwapComplete : undefined}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.small,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.gray400,
    marginBottom: Spacing.sm,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray700,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendText: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
  },
  arrowsSvg: {
    position: 'absolute',
    top: 50,
    left: 0,
    zIndex: 10,
  },
  scrollContent: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 220,
    paddingTop: 30,
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    borderRadius: BorderRadius.sm,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 4,
    minHeight: 20,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  indexLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    marginTop: 4,
    fontFamily: 'monospace',
  },
});
