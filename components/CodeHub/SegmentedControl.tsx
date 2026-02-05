import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';

export type ViewMode = 'visualizer' | 'code';

interface SegmentedControlProps {
  selectedMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

interface SegmentProps {
  mode: ViewMode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  isSelected: boolean;
  onPress: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
}

function Segment({ mode, label, icon, isSelected, onPress, onLayout }: SegmentProps) {
  return (
    <TouchableOpacity
      style={styles.segment}
      onPress={onPress}
      activeOpacity={0.8}
      onLayout={onLayout}
    >
      <Ionicons
        name={icon}
        size={18}
        color={isSelected ? Colors.midnightBlue : Colors.gray400}
      />
      <Text
        style={[
          styles.segmentText,
          isSelected && styles.segmentTextSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function SegmentedControl({
  selectedMode,
  onModeChange,
}: SegmentedControlProps) {
  const indicatorPosition = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  const segments: { mode: ViewMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { mode: 'visualizer', label: 'Visualizer', icon: 'bar-chart-outline' },
    { mode: 'code', label: 'Code Hub', icon: 'code-slash-outline' },
  ];

  useEffect(() => {
    const index = segments.findIndex((s) => s.mode === selectedMode);
    // Simple calculation: each segment takes half the container
    indicatorPosition.value = withSpring(index * 50, {
      damping: 15,
      stiffness: 150,
    });
  }, [selectedMode]);

  const indicatorStyle = useAnimatedStyle(() => ({
    left: `${indicatorPosition.value}%` as unknown as number,
    width: '50%',
  }));

  const handlePress = (mode: ViewMode) => {
    if (mode !== selectedMode) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onModeChange(mode);
    }
  };

  return (
    <View style={styles.container}>
      {/* Animated Indicator */}
      <Animated.View style={[styles.indicator, indicatorStyle]} />

      {/* Segments */}
      {segments.map((segment) => (
        <Segment
          key={segment.mode}
          mode={segment.mode}
          label={segment.label}
          icon={segment.icon}
          isSelected={selectedMode === segment.mode}
          onPress={() => handlePress(segment.mode)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: 4,
    position: 'relative',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    backgroundColor: Colors.actionTeal,
    borderRadius: BorderRadius.md,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    zIndex: 1,
  },
  segmentText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.gray400,
  },
  segmentTextSelected: {
    color: Colors.midnightBlue,
  },
});
