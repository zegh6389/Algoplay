// Enhanced Search Visualizer with Elimination Fade and Spotlight Effects
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
  withRepeat,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_PADDING = Spacing.lg * 2;
const ELEMENT_GAP = 8;
const MIDNIGHT_BLACK = '#0a0e17';

type ElementState = 'default' | 'comparing' | 'eliminated' | 'found' | 'active-range' | 'middle';

interface EnhancedSearchVisualizerProps {
  array: number[];
  target: number;
  comparingIndex?: number;
  eliminatedIndices?: number[];
  foundIndex?: number;
  searchRange?: { left: number; right: number };
  middleIndex?: number;
  algorithmType?: 'binary' | 'linear';
  currentOperation?: string;
  label?: string;
}

interface SearchElementProps {
  value: number;
  index: number;
  state: ElementState;
  totalElements: number;
  elementWidth: number;
  isTarget: boolean;
  showSpotlight: boolean;
}

// Animated spotlight ring component
function SpotlightRing({
  x,
  y,
  size,
  isActive,
}: {
  x: number;
  y: number;
  size: number;
  isActive: boolean;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const ringScale = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      opacity.value = withTiming(1, { duration: 200 });
      ringScale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 600, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.in(Easing.ease) })
        ),
        -1,
        true
      );
      scale.value = withSpring(1.1, { damping: 8, stiffness: 150 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withSpring(1, { damping: 10 });
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: x - size / 2 },
      { translateY: y - size / 2 },
      { scale: scale.value },
    ],
  }));

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: interpolate(ringScale.value, [1, 1.3], [0.8, 0.2]),
  }));

  if (!isActive) return null;

  return (
    <>
      {/* Outer pulsing ring */}
      <Animated.View
        style={[
          styles.spotlightOuter,
          {
            width: size + 20,
            height: size + 20,
            borderRadius: (size + 20) / 2,
            position: 'absolute',
            left: x - (size + 20) / 2,
            top: y - (size + 20) / 2,
          },
          ringAnimatedStyle,
        ]}
      />
      {/* Inner glow */}
      <Animated.View
        style={[
          styles.spotlightInner,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          animatedStyle,
        ]}
      />
    </>
  );
}

// Animated search element with elimination fade
function SearchElement({
  value,
  index,
  state,
  totalElements,
  elementWidth,
  isTarget,
  showSpotlight,
}: SearchElementProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const shrinkScale = useSharedValue(1);

  // State-based animations
  useEffect(() => {
    if (state === 'eliminated') {
      // Elimination fade: shrink and drop to 20% opacity
      shrinkScale.value = withTiming(0.85, { duration: 300, easing: Easing.out(Easing.ease) });
      opacity.value = withTiming(0.2, { duration: 400, easing: Easing.out(Easing.ease) });
      translateY.value = withTiming(10, { duration: 300, easing: Easing.out(Easing.ease) });
    } else if (state === 'comparing' || state === 'middle') {
      scale.value = withSequence(
        withSpring(1.15, { damping: 8, stiffness: 200 }),
        withSpring(1.1, { damping: 10, stiffness: 150 })
      );
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.5, { duration: 300 })
        ),
        -1,
        true
      );
      opacity.value = withTiming(1, { duration: 200 });
      shrinkScale.value = withTiming(1, { duration: 200 });
      translateY.value = withTiming(0, { duration: 200 });
    } else if (state === 'found') {
      scale.value = withSequence(
        withSpring(1.3, { damping: 6, stiffness: 250 }),
        withSpring(1.2, { damping: 8, stiffness: 200 })
      );
      glowOpacity.value = withTiming(1, { duration: 200 });
      opacity.value = withTiming(1, { duration: 200 });
      shrinkScale.value = withTiming(1, { duration: 200 });
    } else if (state === 'active-range') {
      scale.value = withSpring(1.05, { damping: 10, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });
      shrinkScale.value = withTiming(1, { duration: 200 });
      translateY.value = withTiming(0, { duration: 200 });
    } else {
      scale.value = withSpring(1, { damping: 10 });
      glowOpacity.value = withTiming(0, { duration: 200 });
      opacity.value = withTiming(1, { duration: 200 });
      shrinkScale.value = withTiming(1, { duration: 200 });
      translateY.value = withTiming(0, { duration: 200 });
    }
  }, [state]);

  const getElementColor = () => {
    switch (state) {
      case 'comparing':
      case 'middle':
        return Colors.neonYellow;
      case 'found':
        return Colors.neonLime;
      case 'eliminated':
        return Colors.gray600;
      case 'active-range':
        return Colors.neonCyan;
      default:
        return Colors.accent;
    }
  };

  const getGlowColor = () => {
    switch (state) {
      case 'comparing':
      case 'middle':
        return Colors.neonYellow;
      case 'found':
        return Colors.neonLime;
      default:
        return Colors.neonCyan;
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
    opacity: glowOpacity.value,
    shadowColor: getGlowColor(),
    shadowOpacity: glowOpacity.value,
  }));

  const elementColor = getElementColor();
  const textColor = state === 'eliminated' ? Colors.gray400 : MIDNIGHT_BLACK;

  return (
    <Animated.View
      style={[
        styles.elementContainer,
        { width: elementWidth, marginRight: index < totalElements - 1 ? ELEMENT_GAP : 0 },
        animatedStyle,
      ]}
    >
      <Animated.View
        style={[
          styles.element,
          glowStyle,
          {
            backgroundColor: elementColor,
            borderColor: state === 'found' ? Colors.neonLime : 'transparent',
            borderWidth: state === 'found' ? 3 : 0,
          },
        ]}
      >
        <Text style={[styles.elementValue, { color: textColor }]}>{value}</Text>
        {isTarget && state !== 'eliminated' && (
          <View style={styles.targetIndicator}>
            <Text style={styles.targetText}>TARGET</Text>
          </View>
        )}
      </Animated.View>
      <Text style={styles.indexLabel}>[{index}]</Text>
    </Animated.View>
  );
}

// Range indicator showing active search area
function RangeIndicator({
  left,
  right,
  elementWidth,
  totalElements,
}: {
  left: number;
  right: number;
  elementWidth: number;
  totalElements: number;
}) {
  const rangeWidth = (right - left + 1) * (elementWidth + ELEMENT_GAP) - ELEMENT_GAP;
  const rangeLeft = left * (elementWidth + ELEMENT_GAP);

  return (
    <View style={[styles.rangeIndicator, { width: rangeWidth, left: rangeLeft }]}>
      <View style={styles.rangeLine} />
      <View style={styles.rangeLabels}>
        <Text style={styles.rangeLabelText}>L: {left}</Text>
        <Text style={styles.rangeLabelText}>R: {right}</Text>
      </View>
    </View>
  );
}

export default function EnhancedSearchVisualizer({
  array,
  target,
  comparingIndex,
  eliminatedIndices = [],
  foundIndex,
  searchRange = { left: 0, right: array.length - 1 },
  middleIndex,
  algorithmType = 'binary',
  currentOperation,
  label,
}: EnhancedSearchVisualizerProps) {
  const totalElements = array.length;
  const elementWidth = Math.max(
    (SCREEN_WIDTH - CANVAS_PADDING - ELEMENT_GAP * (totalElements - 1)) / totalElements,
    40
  );

  const getElementState = (index: number): ElementState => {
    if (foundIndex === index) return 'found';
    if (eliminatedIndices.includes(index)) return 'eliminated';
    if (middleIndex === index) return 'middle';
    if (comparingIndex === index) return 'comparing';
    if (index >= searchRange.left && index <= searchRange.right) return 'active-range';
    return 'default';
  };

  // Calculate spotlight position for middle element
  const spotlightX = middleIndex !== undefined
    ? middleIndex * (elementWidth + ELEMENT_GAP) + elementWidth / 2 + CANVAS_PADDING / 4
    : 0;
  const spotlightY = 50;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Target Display */}
      <View style={styles.targetDisplay}>
        <Text style={styles.targetDisplayLabel}>Searching for:</Text>
        <View style={styles.targetValue}>
          <Text style={styles.targetValueText}>{target}</Text>
        </View>
      </View>

      {/* Current Operation */}
      {currentOperation && (
        <View style={styles.operationDisplay}>
          <Text style={styles.operationText}>{currentOperation}</Text>
        </View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: Colors.neonCyan }]} />
          <Text style={styles.legendText}>Active Range</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: Colors.neonYellow }]} />
          <Text style={styles.legendText}>Checking</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: Colors.gray600, opacity: 0.3 }]} />
          <Text style={styles.legendText}>Eliminated</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: Colors.neonLime }]} />
          <Text style={styles.legendText}>Found</Text>
        </View>
      </View>

      {/* Visualization Area */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.visualizationArea}>
          {/* Range Indicator */}
          {algorithmType === 'binary' && (
            <RangeIndicator
              left={searchRange.left}
              right={searchRange.right}
              elementWidth={elementWidth}
              totalElements={totalElements}
            />
          )}

          {/* Spotlight for middle element (Binary Search) */}
          {algorithmType === 'binary' && middleIndex !== undefined && (
            <SpotlightRing
              x={spotlightX}
              y={spotlightY}
              size={elementWidth}
              isActive={middleIndex !== undefined}
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
                totalElements={totalElements}
                elementWidth={elementWidth}
                isTarget={value === target}
                showSpotlight={middleIndex === index}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Binary Search Middle Indicator */}
      {algorithmType === 'binary' && middleIndex !== undefined && (
        <View style={styles.middleIndicator}>
          <Text style={styles.middleIndicatorText}>
            Middle Index: {middleIndex} | Value: {array[middleIndex]}
          </Text>
        </View>
      )}
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
  targetDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray700,
  },
  targetDisplayLabel: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
  },
  targetValue: {
    backgroundColor: Colors.neonPink + '20',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neonPink,
  },
  targetValueText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.neonPink,
  },
  operationDisplay: {
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
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendText: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
  },
  scrollContent: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  visualizationArea: {
    position: 'relative',
    minHeight: 140,
  },
  elementsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
  },
  elementContainer: {
    alignItems: 'center',
  },
  element: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
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
  targetIndicator: {
    position: 'absolute',
    top: -8,
    backgroundColor: Colors.neonPink,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  targetText: {
    fontSize: 6,
    fontWeight: '700',
    color: MIDNIGHT_BLACK,
  },
  indexLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  rangeIndicator: {
    position: 'absolute',
    top: 0,
    height: 30,
  },
  rangeLine: {
    height: 2,
    backgroundColor: Colors.neonCyan,
    marginTop: 10,
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  rangeLabelText: {
    fontSize: 10,
    color: Colors.neonCyan,
    fontWeight: '600',
  },
  spotlightOuter: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: Colors.neonYellow,
    backgroundColor: 'transparent',
  },
  spotlightInner: {
    position: 'absolute',
    backgroundColor: Colors.neonYellow + '30',
  },
  middleIndicator: {
    backgroundColor: Colors.neonYellow + '15',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.neonYellow,
  },
  middleIndicatorText: {
    fontSize: FontSizes.sm,
    color: Colors.neonYellow,
    fontWeight: '600',
    textAlign: 'center',
  },
});
