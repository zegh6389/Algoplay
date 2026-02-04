// Array Visualizer Component with Synchronized Highlighting
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';

interface ArrayVisualizerProps {
  array: number[];
  highlightedIndices?: number[];
  sortedIndices?: number[];
  swappingIndices?: number[];
  comparingIndices?: number[];
  onElementPress?: (index: number) => void;
  showIndices?: boolean;
  showTreeConnections?: boolean; // Show parent-child connections for heap
  label?: string;
}

interface ArrayElementProps {
  value: number;
  index: number;
  isHighlighted: boolean;
  isSorted: boolean;
  isSwapping: boolean;
  isComparing: boolean;
  onPress?: () => void;
  showIndex: boolean;
  showConnections: boolean;
  arrayLength: number;
}

function ArrayElement({
  value,
  index,
  isHighlighted,
  isSorted,
  isSwapping,
  isComparing,
  onPress,
  showIndex,
  showConnections,
  arrayLength,
}: ArrayElementProps) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (isSwapping) {
      scale.value = withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 10 })
      );
    } else if (isHighlighted || isComparing) {
      scale.value = withSpring(1.1, { damping: 10 });
    } else {
      scale.value = withSpring(1, { damping: 10 });
    }
  }, [isSwapping, isHighlighted, isComparing]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getBackgroundColor = () => {
    if (isSwapping) return Colors.alertCoral;
    if (isComparing) return Colors.logicGold;
    if (isHighlighted) return Colors.actionTeal;
    if (isSorted) return Colors.success;
    return Colors.gray700;
  };

  const getBorderColor = () => {
    if (isSwapping) return Colors.alertCoralLight;
    if (isComparing) return Colors.logicGoldLight;
    if (isHighlighted) return Colors.actionTealLight;
    if (isSorted) return Colors.success;
    return Colors.gray600;
  };

  // Calculate parent and children indices for heap visualization
  const parentIndex = Math.floor((index - 1) / 2);
  const leftChildIndex = 2 * index + 1;
  const rightChildIndex = 2 * index + 2;
  const hasParent = index > 0;
  const hasLeftChild = leftChildIndex < arrayLength;
  const hasRightChild = rightChildIndex < arrayLength;

  return (
    <View style={styles.elementContainer}>
      {showConnections && hasParent && (
        <View style={styles.connectionIndicator}>
          <Text style={styles.connectionText}>↑ p:{parentIndex}</Text>
        </View>
      )}
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <Animated.View
          style={[
            styles.element,
            animatedStyle,
            {
              backgroundColor: getBackgroundColor(),
              borderColor: getBorderColor(),
            },
          ]}
        >
          <Text style={styles.elementValue}>{value}</Text>
        </Animated.View>
      </TouchableOpacity>
      {showIndex && (
        <Text style={styles.indexLabel}>[{index}]</Text>
      )}
      {showConnections && (hasLeftChild || hasRightChild) && (
        <View style={styles.childIndicator}>
          <Text style={styles.connectionText}>
            {hasLeftChild && `L:${leftChildIndex}`}
            {hasLeftChild && hasRightChild && ' '}
            {hasRightChild && `R:${rightChildIndex}`}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function ArrayVisualizer({
  array,
  highlightedIndices = [],
  sortedIndices = [],
  swappingIndices = [],
  comparingIndices = [],
  onElementPress,
  showIndices = true,
  showTreeConnections = false,
  label,
}: ArrayVisualizerProps) {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.arrayContainer}>
          {array.map((value, index) => (
            <ArrayElement
              key={`${index}-${value}`}
              value={value}
              index={index}
              isHighlighted={highlightedIndices.includes(index)}
              isSorted={sortedIndices.includes(index)}
              isSwapping={swappingIndices.includes(index)}
              isComparing={comparingIndices.includes(index)}
              onPress={onElementPress ? () => onElementPress(index) : undefined}
              showIndex={showIndices}
              showConnections={showTreeConnections}
              arrayLength={array.length}
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
  scrollContent: {
    paddingVertical: Spacing.xs,
  },
  arrayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  elementContainer: {
    alignItems: 'center',
    marginHorizontal: 2,
  },
  connectionIndicator: {
    marginBottom: 2,
  },
  connectionText: {
    fontSize: 8,
    color: Colors.gray500,
    fontFamily: 'monospace',
  },
  element: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  elementValue: {
    color: Colors.white,
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  indexLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  childIndicator: {
    marginTop: 2,
  },
});
