// Live Commentary Insight Panel with Step History
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';

interface StepHistoryItem {
  step: number;
  operation: string;
  commentary: string;
  timestamp: number;
}

interface InsightPanelProps {
  currentStep: number;
  totalSteps: number;
  currentCommentary: string;
  operation: string;
  stepHistory: StepHistoryItem[];
  isPlaying: boolean;
  onStepSelect?: (step: number) => void;
  complexityInfo?: {
    time: string;
    space: string;
    operations: number;
  };
}

function LiveIndicator() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withSpring(0.3, { duration: 500 }),
        withSpring(1, { duration: 500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.liveIndicator, animatedStyle]}>
      <View style={styles.liveDot} />
      <Text style={styles.liveText}>LIVE</Text>
    </Animated.View>
  );
}

function StepHistoryList({
  history,
  currentStep,
  onStepSelect,
}: {
  history: StepHistoryItem[];
  currentStep: number;
  onStepSelect?: (step: number) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Auto-scroll to current step
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [history.length]);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.historyScrollView}
      showsVerticalScrollIndicator={false}
    >
      {history.slice(-10).map((item, index) => {
        const isCurrentStep = item.step === currentStep;
        return (
          <Animated.View
            key={item.step}
            entering={FadeInRight.delay(index * 30)}
          >
            <TouchableOpacity
              style={[
                styles.historyItem,
                isCurrentStep && styles.historyItemActive,
              ]}
              onPress={() => onStepSelect?.(item.step)}
              activeOpacity={0.7}
            >
              <View style={styles.historyItemLeft}>
                <View
                  style={[
                    styles.stepBadge,
                    isCurrentStep && styles.stepBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepBadgeText,
                      isCurrentStep && styles.stepBadgeTextActive,
                    ]}
                  >
                    {item.step}
                  </Text>
                </View>
                <View style={styles.historyItemContent}>
                  <Text
                    style={[
                      styles.historyOperation,
                      isCurrentStep && styles.historyOperationActive,
                    ]}
                  >
                    {formatOperation(item.operation)}
                  </Text>
                  <Text
                    style={styles.historyCommentary}
                    numberOfLines={2}
                  >
                    {item.commentary}
                  </Text>
                </View>
              </View>
              {isCurrentStep && (
                <Ionicons name="chevron-forward" size={16} color={Colors.actionTeal} />
              )}
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </ScrollView>
  );
}

function formatOperation(operation: string): string {
  const operationMap: Record<string, string> = {
    compare: 'Comparing',
    swap: 'Swapping',
    swapped: 'Swapped',
    insert: 'Inserting',
    process: 'Processing',
    visit: 'Visiting',
    visit_left: 'Going Left',
    visit_right: 'Going Right',
    found: 'Found!',
    not_found: 'Not Found',
    complete: 'Complete',
    heapify_start: 'Heapifying',
    extract_max: 'Extracting Max',
    heapify_root: 'Heapify Root',
    start: 'Starting',
  };
  return operationMap[operation] || operation;
}

function getOperationColor(operation: string): string {
  const colorMap: Record<string, string> = {
    compare: Colors.logicGold,
    swap: Colors.alertCoral,
    swapped: Colors.alertCoral,
    insert: Colors.success,
    process: Colors.actionTeal,
    visit: Colors.info,
    found: Colors.success,
    not_found: Colors.alertCoral,
    complete: Colors.success,
  };
  return colorMap[operation] || Colors.gray400;
}

export default function InsightPanel({
  currentStep,
  totalSteps,
  currentCommentary,
  operation,
  stepHistory,
  isPlaying,
  onStepSelect,
  complexityInfo,
}: InsightPanelProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.02, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );
  }, [currentStep]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="bulb" size={18} color={Colors.actionTeal} />
          <Text style={styles.headerTitle}>Live Commentary</Text>
          {isPlaying && <LiveIndicator />}
        </View>
        <Text style={styles.stepCounter}>
          Step {currentStep}/{totalSteps}
        </Text>
      </View>

      {/* Current Commentary */}
      <Animated.View style={[styles.currentCommentary, animatedStyle]}>
        <View style={styles.commentaryHeader}>
          <View
            style={[
              styles.operationBadge,
              { backgroundColor: getOperationColor(operation) + '20' },
            ]}
          >
            <Text
              style={[
                styles.operationText,
                { color: getOperationColor(operation) },
              ]}
            >
              {formatOperation(operation)}
            </Text>
          </View>
        </View>
        <Text style={styles.commentaryText}>{currentCommentary}</Text>
      </Animated.View>

      {/* Complexity Info */}
      {complexityInfo && (
        <View style={styles.complexityRow}>
          <View style={styles.complexityStat}>
            <Ionicons name="time-outline" size={14} color={Colors.gray400} />
            <Text style={styles.complexityLabel}>Time:</Text>
            <Text style={styles.complexityValue}>{complexityInfo.time}</Text>
          </View>
          <View style={styles.complexityStat}>
            <Ionicons name="cube-outline" size={14} color={Colors.gray400} />
            <Text style={styles.complexityLabel}>Space:</Text>
            <Text style={styles.complexityValue}>{complexityInfo.space}</Text>
          </View>
          <View style={styles.complexityStat}>
            <Ionicons name="flash-outline" size={14} color={Colors.logicGold} />
            <Text style={styles.complexityLabel}>Ops:</Text>
            <Text style={[styles.complexityValue, { color: Colors.logicGold }]}>
              {complexityInfo.operations}
            </Text>
          </View>
        </View>
      )}

      {/* Step History */}
      {stepHistory.length > 1 && (
        <View style={styles.historySection}>
          <View style={styles.historySectionHeader}>
            <Text style={styles.historySectionTitle}>Step History</Text>
            <Text style={styles.historyHint}>Tap to rewind</Text>
          </View>
          <StepHistoryList
            history={stepHistory}
            currentStep={currentStep}
            onStepSelect={onStepSelect}
          />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.actionTeal,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.alertCoral + '20',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.sm,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.alertCoral,
  },
  liveText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.alertCoral,
  },
  stepCounter: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
    fontFamily: 'monospace',
  },
  currentCommentary: {
    backgroundColor: Colors.midnightBlueLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.actionTeal,
    marginBottom: Spacing.md,
  },
  commentaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  operationBadge: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  operationText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  commentaryText: {
    fontSize: FontSizes.md,
    color: Colors.gray200,
    lineHeight: 22,
  },
  complexityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.midnightBlueLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  complexityStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  complexityLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
  },
  complexityValue: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.white,
    fontFamily: 'monospace',
  },
  historySection: {
    marginTop: Spacing.sm,
  },
  historySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  historySectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.gray400,
  },
  historyHint: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    fontStyle: 'italic',
  },
  historyScrollView: {
    maxHeight: 180,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  historyItemActive: {
    backgroundColor: Colors.actionTeal + '15',
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray700,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBadgeActive: {
    backgroundColor: Colors.actionTeal,
  },
  stepBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.gray400,
  },
  stepBadgeTextActive: {
    color: Colors.midnightBlue,
  },
  historyItemContent: {
    flex: 1,
  },
  historyOperation: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.gray400,
    marginBottom: 2,
  },
  historyOperationActive: {
    color: Colors.actionTeal,
  },
  historyCommentary: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    lineHeight: 16,
  },
});
