// Skeleton Loader Components - Flicker Elimination System
// Uses absolute positioning and smooth transitions to prevent layout shifts
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Spacing, SafetyPadding } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

// Base Skeleton Pulse Animation Component
export function SkeletonPulse({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  const shimmerProgress = useSharedValue(0);

  useEffect(() => {
    shimmerProgress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      shimmerProgress.value,
      [0, 1],
      [Colors.surfaceDark, Colors.surface]
    ),
  }));

  return (
    <Animated.View
      style={[
        {
          width: typeof width === 'number' ? width : undefined,
          height,
          borderRadius,
        },
        typeof width === 'string' && { width: width as any },
        animatedStyle,
        style,
      ]}
    />
  );
}

// Shimmer Effect Skeleton
export function SkeletonShimmer({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  const translateX = useSharedValue(-SCREEN_WIDTH);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(SCREEN_WIDTH, { duration: 1500, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={[
        styles.shimmerContainer,
        {
          width: typeof width === 'number' ? width : '100%',
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmerOverlay, shimmerStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255, 255, 255, 0.1)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerGradient}
        />
      </Animated.View>
    </View>
  );
}

// Header Skeleton
export function SkeletonHeader() {
  return (
    <View style={styles.headerSkeleton}>
      {/* Back button */}
      <SkeletonPulse width={40} height={40} borderRadius={20} />

      {/* Title area */}
      <View style={styles.headerTitleArea}>
        <SkeletonPulse width={180} height={20} borderRadius={4} />
        <SkeletonPulse width={120} height={14} borderRadius={4} style={{ marginTop: 6 }} />
      </View>

      {/* Action button */}
      <SkeletonPulse width={44} height={44} borderRadius={22} />
    </View>
  );
}

// Tab Bar Skeleton
export function SkeletonTabBar({ tabs = 4 }: { tabs?: number }) {
  return (
    <View style={styles.tabBarSkeleton}>
      {Array.from({ length: tabs }).map((_, index) => (
        <View key={index} style={styles.tabSkeleton}>
          <SkeletonPulse width={20} height={20} borderRadius={4} />
          <SkeletonPulse width={50} height={12} borderRadius={4} style={{ marginTop: 6 }} />
        </View>
      ))}
    </View>
  );
}

// Card Skeleton
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <View style={styles.cardSkeleton}>
      {/* Icon */}
      <SkeletonPulse width={56} height={56} borderRadius={28} />

      {/* Content */}
      <View style={styles.cardContent}>
        {Array.from({ length: lines }).map((_, index) => (
          <SkeletonPulse
            key={index}
            width={index === lines - 1 ? '60%' : '90%'}
            height={index === 0 ? 16 : 12}
            borderRadius={4}
            style={{ marginTop: index > 0 ? 8 : 0 }}
          />
        ))}
      </View>
    </View>
  );
}

// Mastery Tree Node Skeleton
export function SkeletonTreeNode() {
  return (
    <View style={styles.treeNodeSkeleton}>
      <SkeletonPulse width={70} height={70} borderRadius={35} />
      <SkeletonPulse width={60} height={12} borderRadius={4} style={{ marginTop: 8 }} />
    </View>
  );
}

// Mastery Tree Skeleton (Full Layout)
export function SkeletonMasteryTree() {
  const rows = [
    [0, 2], // Row 0: 2 nodes
    [0, 1, 2], // Row 1: 3 nodes
    [0, 1, 2], // Row 2: 3 nodes
    [0, 1, 2], // Row 3: 3 nodes
    [0, 1, 2], // Row 4: 3 nodes
  ];

  return (
    <View style={styles.masteryTreeSkeleton}>
      {rows.map((cols, rowIndex) => (
        <View key={rowIndex} style={styles.treeRowSkeleton}>
          {cols.map((col) => (
            <View key={`${rowIndex}-${col}`} style={styles.treeNodeWrapper}>
              <SkeletonTreeNode />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

// Challenge Card Skeleton
export function SkeletonChallengeCard() {
  return (
    <View style={styles.challengeCardSkeleton}>
      <SkeletonPulse width={56} height={56} borderRadius={28} />
      <View style={styles.challengeContent}>
        <SkeletonPulse width={140} height={18} borderRadius={4} />
        <SkeletonPulse width={100} height={12} borderRadius={4} style={{ marginTop: 8 }} />
        <View style={styles.challengeStats}>
          <SkeletonPulse width={60} height={12} borderRadius={4} />
          <SkeletonPulse width={60} height={12} borderRadius={4} />
        </View>
      </View>
      <SkeletonPulse width={24} height={24} borderRadius={12} />
    </View>
  );
}

// Array Visualizer Skeleton
export function SkeletonArrayVisualizer({ bars = 10 }: { bars?: number }) {
  return (
    <View style={styles.arrayVisualizerSkeleton}>
      {Array.from({ length: bars }).map((_, index) => (
        <SkeletonPulse
          key={index}
          width={(SCREEN_WIDTH - 80) / bars - 4}
          height={50 + Math.random() * 100}
          borderRadius={4}
        />
      ))}
    </View>
  );
}

// Leaderboard Item Skeleton
export function SkeletonLeaderboardItem({ rank = 1 }: { rank?: number }) {
  return (
    <View style={styles.leaderboardItemSkeleton}>
      <SkeletonPulse width={28} height={28} borderRadius={14} />
      <SkeletonPulse width={40} height={40} borderRadius={20} style={{ marginLeft: 12 }} />
      <View style={styles.leaderboardContent}>
        <SkeletonPulse width={100} height={14} borderRadius={4} />
        <SkeletonPulse width={60} height={10} borderRadius={4} style={{ marginTop: 4 }} />
      </View>
      <SkeletonPulse width={60} height={14} borderRadius={4} />
    </View>
  );
}

// Full Page Loading Skeleton
export function SkeletonPlayground() {
  return (
    <View style={styles.fullPageSkeleton}>
      <SkeletonHeader />
      <SkeletonTabBar />
      <View style={styles.contentSkeleton}>
        <SkeletonMasteryTree />
      </View>
    </View>
  );
}

// Loading Overlay with Skeleton
export function SkeletonOverlay({ children, isLoading }: { children: React.ReactNode; isLoading: boolean }) {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <View style={styles.overlayContainer}>
      {children}
      <View style={styles.overlay}>
        <View style={styles.overlayContent}>
          <SkeletonPulse width={60} height={60} borderRadius={30} />
          <SkeletonPulse width={120} height={16} borderRadius={4} style={{ marginTop: 16 }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shimmerContainer: {
    backgroundColor: Colors.surfaceDark,
    overflow: 'hidden',
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
  },
  shimmerGradient: {
    flex: 1,
    width: 100,
  },
  headerSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SafetyPadding.minimum,
    paddingHorizontal: Spacing.lg,
    gap: SafetyPadding.minimum,
  },
  headerTitleArea: {
    flex: 1,
    marginHorizontal: SafetyPadding.minimum,
  },
  tabBarSkeleton: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: SafetyPadding.minimum,
  },
  tabSkeleton: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.sm,
  },
  cardSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: SafetyPadding.card,
    marginBottom: SafetyPadding.minimum,
    gap: SafetyPadding.minimum,
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  treeNodeSkeleton: {
    alignItems: 'center',
    width: 90,
  },
  treeNodeWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  masteryTreeSkeleton: {
    padding: Spacing.lg,
    gap: SafetyPadding.tree.nodeVertical,
  },
  treeRowSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: SafetyPadding.tree.nodeSibling,
  },
  challengeCardSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: SafetyPadding.card,
    marginBottom: SafetyPadding.minimum,
    gap: SafetyPadding.minimum,
  },
  challengeContent: {
    flex: 1,
  },
  challengeStats: {
    flexDirection: 'row',
    gap: SafetyPadding.minimum,
    marginTop: 8,
  },
  arrayVisualizerSkeleton: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 200,
    paddingHorizontal: Spacing.lg,
    gap: 4,
  },
  leaderboardItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SafetyPadding.card,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    marginBottom: SafetyPadding.minimum,
  },
  leaderboardContent: {
    flex: 1,
    marginLeft: SafetyPadding.minimum,
  },
  fullPageSkeleton: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentSkeleton: {
    flex: 1,
    padding: Spacing.lg,
  },
  overlayContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 14, 23, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    alignItems: 'center',
  },
});

export default {
  SkeletonPulse,
  SkeletonShimmer,
  SkeletonHeader,
  SkeletonTabBar,
  SkeletonCard,
  SkeletonTreeNode,
  SkeletonMasteryTree,
  SkeletonChallengeCard,
  SkeletonArrayVisualizer,
  SkeletonLeaderboardItem,
  SkeletonPlayground,
  SkeletonOverlay,
};
