// Cyber-Terminal Stats Box with Live Explanations and Counters
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
  FadeIn,
  SlideInLeft,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';

interface CyberTerminalProps {
  currentExplanation: string;
  comparisons: number;
  swaps: number;
  memoryAccesses: number;
  currentStep: number;
  totalSteps: number;
  algorithmName?: string;
  showCursor?: boolean;
  logs?: string[];
  maxLogs?: number;
}

interface StatCounterProps {
  label: string;
  value: number;
  icon: string;
  color: string;
}

// Animated stat counter
function StatCounter({ label, value, icon, color }: StatCounterProps) {
  const scale = useSharedValue(1);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current) {
      scale.value = withSequence(
        withTiming(1.2, { duration: 100, easing: Easing.out(Easing.back(2)) }),
        withTiming(1, { duration: 150, easing: Easing.in(Easing.ease) })
      );
      prevValue.current = value;
    }
  }, [value]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.statCounter}>
      <Ionicons name={icon as any} size={16} color={color} />
      <View style={styles.statContent}>
        <Text style={styles.statLabel}>{label}</Text>
        <Animated.Text style={[styles.statValue, { color }, animatedStyle]}>
          {value}
        </Animated.Text>
      </View>
    </View>
  );
}

// Blinking cursor component
function BlinkingCursor() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.cursor, animatedStyle]}>_</Animated.Text>
  );
}

// Terminal prompt line
function TerminalLine({ text, isLatest }: { text: string; isLatest: boolean }) {
  return (
    <Animated.View
      entering={isLatest ? SlideInLeft.duration(200) : undefined}
      style={styles.terminalLine}
    >
      <Text style={styles.promptSymbol}>{'>'}</Text>
      <Text style={styles.lineText}>{text}</Text>
      {isLatest && <BlinkingCursor />}
    </Animated.View>
  );
}

export default function CyberTerminal({
  currentExplanation,
  comparisons,
  swaps,
  memoryAccesses,
  currentStep,
  totalSteps,
  algorithmName = 'Algorithm',
  showCursor = true,
  logs = [],
  maxLogs = 5,
}: CyberTerminalProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [logs.length, currentExplanation]);

  const recentLogs = logs.slice(-maxLogs);
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Terminal Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.trafficLights}>
            <View style={[styles.trafficLight, { backgroundColor: Colors.neonPink }]} />
            <View style={[styles.trafficLight, { backgroundColor: Colors.neonYellow }]} />
            <View style={[styles.trafficLight, { backgroundColor: Colors.neonLime }]} />
          </View>
          <Text style={styles.headerTitle}>cyber-terminal</Text>
        </View>
        <Text style={styles.algorithmTag}>{algorithmName}</Text>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <StatCounter
          label="Comparisons"
          value={comparisons}
          icon="git-compare-outline"
          color={Colors.neonYellow}
        />
        <StatCounter
          label="Swaps"
          value={swaps}
          icon="swap-horizontal"
          color={Colors.neonCyan}
        />
        <StatCounter
          label="Memory"
          value={memoryAccesses}
          icon="hardware-chip-outline"
          color={Colors.neonPurple}
        />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              { width: `${progress}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Step {currentStep}/{totalSteps}
        </Text>
      </View>

      {/* Terminal Content */}
      <View style={styles.terminalContent}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.terminalScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.terminalScrollContent}
        >
          {/* Previous logs */}
          {recentLogs.map((log, index) => (
            <TerminalLine
              key={`log-${index}`}
              text={log}
              isLatest={false}
            />
          ))}

          {/* Current explanation */}
          {currentExplanation && (
            <Animated.View entering={FadeIn.duration(200)} style={styles.currentExplanation}>
              <View style={styles.explanationHeader}>
                <Ionicons name="information-circle" size={14} color={Colors.neonCyan} />
                <Text style={styles.explanationLabel}>Current Operation</Text>
              </View>
              <Text style={styles.explanationText}>
                {currentExplanation}
                {showCursor && <BlinkingCursor />}
              </Text>
            </Animated.View>
          )}
        </ScrollView>
      </View>

      {/* Bottom glow effect */}
      <View style={styles.bottomGlow} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackgroundDark,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.neonBorderCyan,
    ...Shadows.glow,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray700,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  trafficLights: {
    flexDirection: 'row',
    gap: 6,
  },
  trafficLight: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  headerTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.gray400,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  algorithmTag: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.neonCyan,
    backgroundColor: Colors.neonCyan + '15',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.surfaceDark,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray700,
  },
  statCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statContent: {
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 9,
    color: Colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.gray700,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.neonCyan,
    borderRadius: 2,
  },
  progressText: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    minWidth: 70,
    textAlign: 'right',
  },
  terminalContent: {
    minHeight: 100,
    maxHeight: 150,
  },
  terminalScroll: {
    flex: 1,
  },
  terminalScrollContent: {
    padding: Spacing.md,
  },
  terminalLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  promptSymbol: {
    fontSize: FontSizes.sm,
    color: Colors.neonLime,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginRight: Spacing.xs,
  },
  lineText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.gray400,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  cursor: {
    fontSize: FontSizes.sm,
    color: Colors.neonCyan,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  currentExplanation: {
    backgroundColor: Colors.neonCyan + '10',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.neonCyan,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  explanationLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.neonCyan,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  explanationText: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  bottomGlow: {
    height: 2,
    backgroundColor: Colors.neonCyan,
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
});
