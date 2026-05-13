// Dynamic Programming Visualizer Screen
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  Easing,
  interpolateColor,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import { dpAlgorithms, DPStep, DPAlgorithmKey, runDPGenerator } from '@/utils/algorithms/dynamicProgramming';
import { getAlgorithmCode, ProgrammingLanguage } from '@/utils/algorithms/codeImplementations';
import SpeedController, { SpeedLevel, getSpeedDelay } from '@/components/SpeedController';
import CyberTerminal from '@/components/CyberTerminal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CELL_SIZE = 48;
const CELL_GAP = 8;
const MAX_CELLS_PER_ROW = Math.floor((SCREEN_WIDTH - Spacing.lg * 2) / (CELL_SIZE + CELL_GAP));

interface DPCellProps {
  value: number;
  index: number;
  state: 'default' | 'computing' | 'comparing' | 'computed' | 'result';
  label?: string;
}

// Memoized cell component to prevent unnecessary re-renders
const DPCell = React.memo(function DPCell({ value, index, state, label }: DPCellProps) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (state === 'computing' || state === 'comparing') {
      scale.value = withSpring(1.1, { damping: 8, stiffness: 200 });
      glowOpacity.value = withTiming(0.8, { duration: 150 });
    } else if (state === 'computed') {
      scale.value = withSequence(
        withSpring(1.15, { damping: 6, stiffness: 250 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );
      glowOpacity.value = withSequence(
        withTiming(0.6, { duration: 100 }),
        withTiming(0.2, { duration: 300 })
      );
    } else if (state === 'result') {
      scale.value = withSpring(1.05, { damping: 10 });
      glowOpacity.value = withTiming(0.5, { duration: 200 });
    } else {
      scale.value = withSpring(1, { damping: 10 });
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [state]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getColor = () => {
    switch (state) {
      case 'computing':
        return Colors.neonYellow;
      case 'comparing':
        return Colors.neonCyan;
      case 'computed':
        return Colors.neonLime;
      case 'result':
        return Colors.neonPurple;
      default:
        return Colors.gray600;
    }
  };

  const getTextColor = () => {
    switch (state) {
      case 'computing':
      case 'comparing':
      case 'computed':
      case 'result':
        return Colors.background;
      default:
        return Colors.textPrimary;
    }
  };

  return (
    <Animated.View style={[styles.dpCell, animatedStyle, { backgroundColor: getColor() }]}>
      <Text style={[styles.dpCellLabel, { color: getTextColor() }]}>F({index})</Text>
      <Text style={[styles.dpCellValue, { color: getTextColor() }]}>{value}</Text>
    </Animated.View>
  );
});

export default function DPVisualizerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ algorithm: string }>();
  // Ensure we have a valid algorithm ID
  const rawAlgorithmId = params.algorithm || 'fibonacci';
  const algorithmId = typeof rawAlgorithmId === 'string' ? rawAlgorithmId : rawAlgorithmId[0];

  const { completeAlgorithm, addXP } = useAppStore();

  // Check if algorithm exists, with fallback to fibonacci
  let algorithm = dpAlgorithms[algorithmId as DPAlgorithmKey];
  if (!algorithm && algorithmId !== 'fibonacci') {
    algorithm = dpAlgorithms['fibonacci'];
  }
  const algorithmCode = getAlgorithmCode(algorithmId);

  const [inputN, setInputN] = useState(10);
  const [steps, setSteps] = useState<DPStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedLevel, setSpeedLevel] = useState<SpeedLevel>('normal');
  const [logs, setLogs] = useState<string[]>([]);
  const [comparisons, setComparisons] = useState(0);
  const [computations, setComputations] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentStep = steps[currentStepIndex];

  // Initialize
  useEffect(() => {
    if (algorithm) {
      resetVisualization();
    }
  }, [algorithmId, inputN]);

  const resetVisualization = useCallback(() => {
    setIsPlaying(false);
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
    }

    if (!algorithm) return;

    // Generate sample array for array-based algorithms
    const sampleArray = Array.from({ length: inputN }, () => Math.floor(Math.random() * 21) - 10);

    const generator = runDPGenerator(algorithmId, inputN, sampleArray);
    if (!generator) return;

    const allSteps: DPStep[] = [];
    for (const step of generator) {
      allSteps.push(step);
    }

    setSteps(allSteps);
    setCurrentStepIndex(0);
    setLogs([]);
    setComparisons(0);
    setComputations(0);
    setHasCompleted(false);
  }, [algorithm, algorithmId, inputN]);

  // Auto-play
  useEffect(() => {
    if (speedLevel === 'manual') {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
      setIsPlaying(false);
      return;
    }

    if (isPlaying && currentStepIndex < steps.length - 1) {
      const delay = getSpeedDelay(speedLevel);
      playIntervalRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          const next = prev + 1;
          const step = steps[next];

          if (step) {
            if (step.comparing && step.comparing.length > 0) {
              setComparisons((c) => c + 1);
            }
            if (step.swapping && step.swapping.length > 0) {
              setComputations((c) => c + 1);
            }
            setLogs((prevLogs) => [...prevLogs.slice(-8), step.operation]);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }

          if (next >= steps.length - 1) {
            setIsPlaying(false);
            if (!hasCompleted) {
              setHasCompleted(true);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              completeAlgorithm(algorithmId, 50);
              addXP(50);
            }
          }
          return Math.min(next, steps.length - 1);
        });
      }, delay);
    } else if (!isPlaying && playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, currentStepIndex, steps.length, speedLevel, hasCompleted]);

  const handlePlay = () => {
    if (speedLevel === 'manual') {
      setSpeedLevel('normal');
    }
    if (currentStepIndex >= steps.length - 1) {
      resetVisualization();
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleStepForward = () => {
    if (currentStepIndex < steps.length - 1) {
      const next = currentStepIndex + 1;
      const step = steps[next];
      if (step) {
        setLogs((prevLogs) => [...prevLogs.slice(-8), step.operation]);
      }
      setCurrentStepIndex(next);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleStepBackward = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSpeedChange = (speed: SpeedLevel) => {
    setSpeedLevel(speed);
    if (speed === 'manual') {
      setIsPlaying(false);
    }
  };

  const adjustInputN = (delta: number) => {
    const newN = Math.max(3, Math.min(20, inputN + delta));
    setInputN(newN);
  };

  const getCellState = (index: number): DPCellProps['state'] => {
    if (!currentStep) return 'default';

    if (currentStep.currentIndex === index && currentStep.swapping?.includes(index)) {
      return 'computed';
    }
    if (currentStep.comparing?.includes(index)) {
      return 'comparing';
    }
    if (currentStep.sorted?.includes(index)) {
      return 'computed';
    }
    if (index === inputN && currentStepIndex === steps.length - 1) {
      return 'result';
    }
    return 'default';
  };

  if (!algorithm) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={Colors.alertCoral} />
          <Text style={styles.errorText}>Algorithm not found</Text>
          <Text style={styles.errorSubtext}>The algorithm &quot;{algorithmId}&quot; is not available.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown} style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {algorithm.info.name}
        </Text>
        <View style={styles.inputControl}>
          <TouchableOpacity
            style={styles.inputButton}
            onPress={() => adjustInputN(-1)}
            disabled={inputN <= 3}
          >
            <Ionicons name="remove" size={20} color={inputN > 3 ? Colors.textPrimary : Colors.gray600} />
          </TouchableOpacity>
          <Text style={styles.inputValue}>n={inputN}</Text>
          <TouchableOpacity
            style={styles.inputButton}
            onPress={() => adjustInputN(1)}
            disabled={inputN >= 20}
          >
            <Ionicons name="add" size={20} color={inputN < 20 ? Colors.textPrimary : Colors.gray600} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: Colors.neonCyan }]} />
            <Text style={styles.legendText}>Looking Up</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: Colors.neonYellow }]} />
            <Text style={styles.legendText}>Computing</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: Colors.neonLime }]} />
            <Text style={styles.legendText}>Computed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: Colors.neonPurple }]} />
            <Text style={styles.legendText}>Result</Text>
          </View>
        </View>

        {/* DP Table Visualization */}
        <Animated.View entering={FadeIn} style={styles.dpTableContainer}>
          <Text style={styles.sectionTitle}>Memoization Table</Text>
          <View style={styles.dpTable}>
            {(currentStep?.array || []).map((value, index) => (
              <DPCell
                key={index}
                value={value}
                index={index}
                state={getCellState(index)}
              />
            ))}
          </View>

          {/* Formula Display */}
          {currentStep && (
            <View style={styles.formulaContainer}>
              <Text style={styles.formulaLabel}>Current Operation:</Text>
              <Text style={styles.formula}>
                {currentStep.operation}
              </Text>
              {currentStep.result !== undefined && (
                <View style={styles.resultBadge}>
                  <Text style={styles.resultLabel}>Result: </Text>
                  <Text style={styles.resultValue}>{currentStep.result}</Text>
                </View>
              )}
            </View>
          )}
        </Animated.View>

        {/* Cyber Terminal */}
        <CyberTerminal
          currentExplanation={currentStep?.operation || 'Ready to compute Fibonacci sequence...'}
          comparisons={comparisons}
          swaps={computations}
          memoryAccesses={currentStep?.array?.length || 0}
          currentStep={currentStepIndex + 1}
          totalSteps={steps.length}
          algorithmName={algorithm.info.name}
          logs={logs}
          maxLogs={5}
        />

        {/* Complexity Info */}
        <View style={styles.complexityCard}>
          <Text style={styles.complexityTitle}>Time & Space Complexity</Text>
          <View style={styles.complexityRow}>
            <View style={styles.complexityItem}>
              <Text style={styles.complexityLabel}>Time</Text>
              <Text style={styles.complexityValue}>{algorithm.info.timeComplexity.average}</Text>
            </View>
            <View style={styles.complexityItem}>
              <Text style={styles.complexityLabel}>Space</Text>
              <Text style={styles.complexityValue}>{algorithm.info.spaceComplexity}</Text>
            </View>
          </View>
          <Text style={styles.complexityNote}>
            Naive recursive: O(2^n) vs DP: O(n) - exponential speedup!
          </Text>
        </View>

        {/* Code Panel */}
        <View style={styles.codePanel}>
          <Text style={styles.sectionTitle}>Python Implementation</Text>
          <ScrollView style={styles.codeScroll} horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.codeContent}>
              {algorithm.info.pythonCode.map((line, index) => (
                <View
                  key={index}
                  style={[
                    styles.codeLine,
                    currentStep?.line === index && styles.codeLineHighlighted,
                  ]}
                >
                  <Text style={styles.codeLineNumber}>{index + 1}</Text>
                  <Text
                    style={[
                      styles.codeText,
                      currentStep?.line === index && styles.codeTextHighlighted,
                    ]}
                  >
                    {line}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Speed Controller */}
      <SpeedController
        isPlaying={isPlaying}
        currentSpeed={speedLevel}
        onSpeedChange={handleSpeedChange}
        onPlay={handlePlay}
        onPause={handlePause}
        onStepForward={handleStepForward}
        onStepBackward={handleStepBackward}
        onReset={() => resetVisualization()}
        canStepBackward={currentStepIndex > 0}
        canStepForward={currentStepIndex < steps.length - 1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  inputControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xs,
    gap: Spacing.xs,
  },
  inputButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray700,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputValue: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.neonCyan,
    minWidth: 48,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendColor: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
  legendText: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  dpTableContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  dpTable: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: CELL_GAP,
  },
  dpCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  dpCellLabel: {
    fontSize: 8,
    fontWeight: '500',
    opacity: 0.8,
  },
  dpCellValue: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  formulaContainer: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray700,
    alignItems: 'center',
  },
  formulaLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    marginBottom: Spacing.xs,
  },
  formula: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.neonCyan,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlign: 'center',
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neonPurple + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neonPurple + '40',
  },
  resultLabel: {
    fontSize: FontSizes.sm,
    color: Colors.neonPurple,
    fontWeight: '500',
  },
  resultValue: {
    fontSize: FontSizes.lg,
    color: Colors.neonPurple,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  complexityCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  complexityTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  complexityRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  complexityItem: {
    alignItems: 'center',
  },
  complexityLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    marginBottom: 4,
  },
  complexityValue: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.neonLime,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  complexityNote: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  codePanel: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  codeScroll: {
    maxHeight: 200,
  },
  codeContent: {
    minWidth: '100%',
  },
  codeLine: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  codeLineHighlighted: {
    backgroundColor: Colors.neonCyan + '30',
  },
  codeLineNumber: {
    width: 24,
    fontSize: FontSizes.sm,
    color: Colors.gray600,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  codeText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.gray300,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  codeTextHighlighted: {
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorText: {
    fontSize: FontSizes.xxl,
    fontWeight: '600',
    color: Colors.alertCoral,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  errorSubtext: {
    fontSize: FontSizes.md,
    color: Colors.gray400,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  backButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xl,
  },
  backButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.background,
  },
});
