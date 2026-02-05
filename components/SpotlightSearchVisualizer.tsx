// Spotlight Search Visualizer with Neon Ring Scanner and Array Half Fade Effects
import React, { useEffect, useMemo } from 'react';
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
  withRepeat,
  withDelay,
  Easing,
  interpolate,
  FadeIn,
} from 'react-native-reanimated';
import Svg, { Circle as SvgCircle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';

const AnimatedSvgCircle = Animated.createAnimatedComponent(SvgCircle);

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_PADDING = Spacing.lg * 2;
const ELEMENT_GAP = 10;
const MIDNIGHT_BLACK = '#0a0e17';
const FADE_OPACITY = 0.30;

type ElementState = 'default' | 'spotlight' | 'eliminated-left' | 'eliminated-right' | 'found' | 'active';

interface SpotlightSearchVisualizerProps {
  array: number[];
  target: number;
  middleIndex?: number;
  leftBound: number;
  rightBound: number;
  found?: boolean;
  foundIndex?: number;
  eliminatedIndices?: number[];
  currentOperation?: string;
  label?: string;
  animationSpeed?: 'slow' | 'normal' | 'fast';
}

interface SpotlightRingProps {
  x: number;
  y: number;
  size: number;
  isActive: boolean;
  color: string;
  animationSpeed: 'slow' | 'normal' | 'fast';
}

// Animated Spotlight Ring Component - Neon scanner effect
function SpotlightRing({ x, y, size, isActive, color, animationSpeed }: SpotlightRingProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const outerRingScale = useSharedValue(1);
  const outerRingOpacity = useSharedValue(0);
  const innerGlowOpacity = useSharedValue(0);

  const speedMultipliers = { slow: 1.5, normal: 1, fast: 0.6 };
  const speedMultiplier = speedMultipliers[animationSpeed];

  useEffect(() => {
    if (isActive) {
      // Inner spotlight pulse
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 400 * speedMultiplier, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 400 * speedMultiplier, easing: Easing.in(Easing.ease) })
        ),
        -1,
        true
      );

      // Rotating outer ring
      rotation.value = withRepeat(
        withTiming(360, { duration: 2000 * speedMultiplier, easing: Easing.linear }),
        -1,
        false
      );

      // Pulsing outer ring
      outerRingScale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 0 }),
          withTiming(2, { duration: 800 * speedMultiplier, easing: Easing.out(Easing.cubic) })
        ),
        -1,
        false
      );
      outerRingOpacity.value = withRepeat(
        withSequence(
          withTiming(0.9, { duration: 200 * speedMultiplier }),
          withTiming(0, { duration: 600 * speedMultiplier, easing: Easing.out(Easing.ease) })
        ),
        -1,
        false
      );

      innerGlowOpacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withSpring(1, { damping: 15 });
      innerGlowOpacity.value = withTiming(0, { duration: 200 });
      outerRingOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isActive, speedMultiplier]);

  const ringContainerStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x - size / 2 - 20,
    top: y - size / 2 - 20,
    width: size + 40,
    height: size + 40,
    justifyContent: 'center',
    alignItems: 'center',
  }));

  const innerGlowStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: size + 20,
    height: size + 20,
    borderRadius: (size + 20) / 2,
    backgroundColor: color + '30',
    opacity: innerGlowOpacity.value,
    transform: [{ scale: scale.value }],
  }));

  const outerRingStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: size + 10,
    height: size + 10,
    borderRadius: (size + 10) / 2,
    borderWidth: 3,
    borderColor: color,
    backgroundColor: 'transparent',
    opacity: outerRingOpacity.value,
    transform: [{ scale: outerRingScale.value }],
  }));

  // Rotating scanner line
  const scannerStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: 2,
    height: size / 2,
    backgroundColor: color,
    transform: [
      { translateY: -size / 4 },
      { rotate: `${rotation.value}deg` },
    ],
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  }));

  if (!isActive) return null;

  return (
    <Animated.View style={ringContainerStyle}>
      <Animated.View style={innerGlowStyle} />
      <Animated.View style={outerRingStyle} />
      <Animated.View style={scannerStyle} />
    </Animated.View>
  );
}

// Individual Search Element with elimination fade
interface SearchElementProps {
  value: number;
  index: number;
  state: ElementState;
  elementWidth: number;
  isTarget: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  delayOffset: number;
}

function SearchElement({
  value,
  index,
  state,
  elementWidth,
  isTarget,
  animationSpeed,
  delayOffset,
}: SearchElementProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const shrinkScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const speedMultipliers = { slow: 1.5, normal: 1, fast: 0.6 };
  const baseDuration = 400 * speedMultipliers[animationSpeed];

  useEffect(() => {
    switch (state) {
      case 'eliminated-left':
      case 'eliminated-right':
        // Shrink and fade to 30% opacity
        shrinkScale.value = withDelay(
          delayOffset,
          withTiming(0.75, { duration: baseDuration, easing: Easing.out(Easing.ease) })
        );
        opacity.value = withDelay(
          delayOffset,
          withTiming(FADE_OPACITY, { duration: baseDuration * 1.2, easing: Easing.out(Easing.ease) })
        );
        translateY.value = withDelay(
          delayOffset,
          withTiming(15, { duration: baseDuration, easing: Easing.out(Easing.ease) })
        );
        glowOpacity.value = withTiming(0, { duration: 200 });
        break;

      case 'spotlight':
        scale.value = withSpring(1.2, { damping: 8, stiffness: 180 });
        opacity.value = withTiming(1, { duration: 200 });
        shrinkScale.value = withTiming(1, { duration: 200 });
        translateY.value = withTiming(-8, { duration: 300 });
        glowOpacity.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 350 }),
            withTiming(0.5, { duration: 350 })
          ),
          -1,
          true
        );
        break;

      case 'found':
        scale.value = withSequence(
          withSpring(1.4, { damping: 6, stiffness: 250 }),
          withSpring(1.25, { damping: 8 })
        );
        opacity.value = withTiming(1, { duration: 100 });
        translateY.value = withTiming(-12, { duration: 200 });
        glowOpacity.value = withTiming(1, { duration: 200 });
        break;

      case 'active':
        scale.value = withSpring(1.05, { damping: 12 });
        opacity.value = withTiming(1, { duration: 200 });
        shrinkScale.value = withTiming(1, { duration: 200 });
        translateY.value = withTiming(0, { duration: 200 });
        glowOpacity.value = withTiming(0.3, { duration: 200 });
        break;

      default:
        scale.value = withSpring(1, { damping: 12 });
        opacity.value = withTiming(1, { duration: 200 });
        shrinkScale.value = withTiming(1, { duration: 200 });
        translateY.value = withTiming(0, { duration: 200 });
        glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [state, delayOffset]);

  const getElementColor = () => {
    switch (state) {
      case 'spotlight': return Colors.neonYellow;
      case 'found': return Colors.neonLime;
      case 'eliminated-left':
      case 'eliminated-right':
        return Colors.gray600;
      case 'active': return Colors.neonCyan;
      default: return Colors.accent;
    }
  };

  const getGlowColor = () => {
    switch (state) {
      case 'spotlight': return Colors.neonYellow;
      case 'found': return Colors.neonLime;
      default: return Colors.neonCyan;
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value * shrinkScale.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  const color = getElementColor();
  const isEliminated = state === 'eliminated-left' || state === 'eliminated-right';
  const textColor = isEliminated ? Colors.gray400 : MIDNIGHT_BLACK;

  return (
    <View style={[styles.elementWrapper, { width: elementWidth, marginRight: ELEMENT_GAP }]}>
      <Animated.View
        style={[
          styles.element,
          {
            backgroundColor: color,
            width: elementWidth,
            height: elementWidth,
            borderRadius: BorderRadius.md,
            borderColor: state === 'found' ? Colors.neonLime : 'transparent',
            borderWidth: state === 'found' ? 3 : 0,
            shadowColor: getGlowColor(),
          },
          animatedStyle,
          glowStyle,
        ]}
      >
        <Text style={[styles.elementValue, { color: textColor }]}>{value}</Text>
        {isTarget && !isEliminated && (
          <View style={styles.targetBadge}>
            <Text style={styles.targetBadgeText}>?</Text>
          </View>
        )}
      </Animated.View>
      <Text style={[styles.indexText, isEliminated && { opacity: FADE_OPACITY }]}>[{index}]</Text>
    </View>
  );
}

// Range bracket indicator
function RangeBracket({
  leftIndex,
  rightIndex,
  elementWidth,
  totalElements,
}: {
  leftIndex: number;
  rightIndex: number;
  elementWidth: number;
  totalElements: number;
}) {
  const leftPos = leftIndex * (elementWidth + ELEMENT_GAP);
  const width = (rightIndex - leftIndex + 1) * (elementWidth + ELEMENT_GAP) - ELEMENT_GAP;

  const animatedStyle = useAnimatedStyle(() => ({
    left: withSpring(leftPos, { damping: 15 }),
    width: withSpring(width, { damping: 15 }),
  }));

  return (
    <Animated.View style={[styles.rangeBracket, animatedStyle]}>
      <View style={styles.rangeLine} />
      <View style={styles.rangeEndpoints}>
        <View style={styles.rangeEndpoint}>
          <Text style={styles.rangeText}>L={leftIndex}</Text>
        </View>
        <View style={styles.rangeEndpoint}>
          <Text style={styles.rangeText}>R={rightIndex}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function SpotlightSearchVisualizer({
  array,
  target,
  middleIndex,
  leftBound,
  rightBound,
  found = false,
  foundIndex,
  eliminatedIndices = [],
  currentOperation,
  label,
  animationSpeed = 'normal',
}: SpotlightSearchVisualizerProps) {
  const totalElements = array.length;
  const elementWidth = Math.max(
    Math.min((SCREEN_WIDTH - CANVAS_PADDING - ELEMENT_GAP * (totalElements - 1)) / totalElements, 55),
    40
  );

  // Determine state for each element
  const getElementState = (index: number): ElementState => {
    if (found && foundIndex === index) return 'found';
    if (middleIndex === index) return 'spotlight';

    if (eliminatedIndices.includes(index)) {
      return index < leftBound ? 'eliminated-left' : 'eliminated-right';
    }

    if (index >= leftBound && index <= rightBound) return 'active';
    return 'default';
  };

  // Calculate delay offset for cascade elimination effect
  const getDelayOffset = (index: number): number => {
    if (!eliminatedIndices.includes(index)) return 0;

    const isLeft = index < leftBound;
    if (isLeft) {
      // Cascade from right to left for left elimination
      const elimLeftIndices = eliminatedIndices.filter(i => i < leftBound);
      const posFromRight = elimLeftIndices.length - elimLeftIndices.indexOf(index) - 1;
      return posFromRight * 50;
    } else {
      // Cascade from left to right for right elimination
      const elimRightIndices = eliminatedIndices.filter(i => i > rightBound);
      const posFromLeft = elimRightIndices.indexOf(index);
      return posFromLeft * 50;
    }
  };

  // Spotlight position
  const spotlightX = middleIndex !== undefined
    ? middleIndex * (elementWidth + ELEMENT_GAP) + elementWidth / 2
    : 0;
  const spotlightY = elementWidth / 2 + 50;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Target display */}
      <View style={styles.targetDisplay}>
        <Text style={styles.targetLabel}>Target:</Text>
        <View style={styles.targetValue}>
          <Text style={styles.targetValueText}>{target}</Text>
        </View>
        {middleIndex !== undefined && (
          <View style={styles.middleInfo}>
            <Text style={styles.middleLabel}>Mid={middleIndex}</Text>
            <Text style={styles.middleValue}>Val={array[middleIndex]}</Text>
          </View>
        )}
      </View>

      {/* Current operation */}
      {currentOperation && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.operationBox}>
          <Text style={styles.operationText}>{currentOperation}</Text>
        </Animated.View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.neonCyan }]} />
          <Text style={styles.legendText}>Active Range</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.neonYellow }]} />
          <Text style={styles.legendText}>Spotlight (Mid)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.gray600, opacity: FADE_OPACITY }]} />
          <Text style={styles.legendText}>Eliminated</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.neonLime }]} />
          <Text style={styles.legendText}>Found!</Text>
        </View>
      </View>

      {/* Visualization area */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.visualizationArea}>
          {/* Range bracket */}
          <RangeBracket
            leftIndex={leftBound}
            rightIndex={rightBound}
            elementWidth={elementWidth}
            totalElements={totalElements}
          />

          {/* Spotlight ring */}
          {middleIndex !== undefined && !found && (
            <SpotlightRing
              x={spotlightX}
              y={spotlightY}
              size={elementWidth + 20}
              isActive={true}
              color={Colors.neonYellow}
              animationSpeed={animationSpeed}
            />
          )}

          {/* Found celebration ring */}
          {found && foundIndex !== undefined && (
            <SpotlightRing
              x={foundIndex * (elementWidth + ELEMENT_GAP) + elementWidth / 2}
              y={spotlightY}
              size={elementWidth + 30}
              isActive={true}
              color={Colors.neonLime}
              animationSpeed={animationSpeed}
            />
          )}

          {/* Elements */}
          <View style={styles.elementsRow}>
            {array.map((value, index) => (
              <SearchElement
                key={`${index}-${value}`}
                value={value}
                index={index}
                state={getElementState(index)}
                elementWidth={elementWidth}
                isTarget={value === target}
                animationSpeed={animationSpeed}
                delayOffset={getDelayOffset(index)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Binary search info */}
      <View style={styles.infoBox}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Left Bound</Text>
          <Text style={[styles.infoValue, { color: Colors.neonPink }]}>{leftBound}</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Right Bound</Text>
          <Text style={[styles.infoValue, { color: Colors.neonOrange }]}>{rightBound}</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Elements Left</Text>
          <Text style={[styles.infoValue, { color: Colors.neonCyan }]}>{rightBound - leftBound + 1}</Text>
        </View>
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
  targetDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray700,
  },
  targetLabel: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
  },
  targetValue: {
    backgroundColor: Colors.neonPink + '20',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.neonPink,
  },
  targetValueText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.neonPink,
  },
  middleInfo: {
    backgroundColor: Colors.neonYellow + '15',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.neonYellow,
  },
  middleLabel: {
    fontSize: 10,
    color: Colors.neonYellow,
    fontFamily: 'monospace',
  },
  middleValue: {
    fontSize: 10,
    color: Colors.neonYellow,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  operationBox: {
    backgroundColor: Colors.surfaceDark,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  operationText: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
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
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  visualizationArea: {
    position: 'relative',
    minHeight: 160,
    paddingTop: 40,
  },
  elementsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  elementWrapper: {
    alignItems: 'center',
  },
  element: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 8,
  },
  elementValue: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  targetBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.neonPink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: MIDNIGHT_BLACK,
  },
  indexText: {
    fontSize: 10,
    color: Colors.gray500,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  rangeBracket: {
    position: 'absolute',
    top: 0,
    height: 35,
  },
  rangeLine: {
    height: 3,
    backgroundColor: Colors.neonCyan,
    marginTop: 15,
    borderRadius: 2,
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  rangeEndpoints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  rangeEndpoint: {},
  rangeText: {
    fontSize: 9,
    color: Colors.neonCyan,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.surfaceDark,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginTop: Spacing.md,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 9,
    color: Colors.gray500,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  infoDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.gray700,
  },
});
