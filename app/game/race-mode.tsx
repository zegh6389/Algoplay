import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import {
  sortingAlgorithms,
  SortStep,
  generateRandomArray,
  SortingAlgorithmKey,
} from '@/utils/algorithms/sorting';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AlgorithmOption {
  id: SortingAlgorithmKey;
  name: string;
  color: string;
}

const algorithmOptions: AlgorithmOption[] = [
  { id: 'bubble-sort', name: 'Bubble Sort', color: Colors.alertCoral },
  { id: 'selection-sort', name: 'Selection Sort', color: Colors.logicGold },
  { id: 'insertion-sort', name: 'Insertion Sort', color: Colors.accent },
  { id: 'quick-sort', name: 'Quick Sort', color: Colors.info },
  { id: 'merge-sort', name: 'Merge Sort', color: Colors.success },
];

interface VisualizerProps {
  array: number[];
  step: SortStep | null;
  color: string;
  label: string;
  isComplete: boolean;
  operationsCount: number;
}

function Visualizer({ array, step, color, label, isComplete, operationsCount }: VisualizerProps) {
  const maxValue = Math.max(...array, 1);
  const barWidth = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md * 2) / array.length - 2;

  const getBarColor = (index: number) => {
    if (!step) return color;
    if (step.sorted?.includes(index)) return Colors.success;
    if (step.swapping?.includes(index)) return Colors.alertCoral;
    if (step.comparing?.includes(index)) return Colors.logicGold;
    if (step.pivot === index) return Colors.info;
    return color;
  };

  return (
    <View style={styles.visualizerContainer}>
      <View style={styles.visualizerHeader}>
        <View style={[styles.labelBadge, { backgroundColor: color + '30' }]}>
          <View style={[styles.labelDot, { backgroundColor: color }]} />
          <Text style={[styles.labelText, { color }]}>{label}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.opsLabel}>Ops: </Text>
          <Text style={[styles.opsValue, { color }]}>{operationsCount}</Text>
          {isComplete && (
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} style={{ marginLeft: 4 }} />
          )}
        </View>
      </View>
      <View style={styles.visualizerBars}>
        {(step?.array || array).map((value, index) => (
          <View
            key={index}
            style={[
              styles.bar,
              {
                width: Math.max(barWidth, 4),
                height: (value / maxValue) * 80,
                backgroundColor: getBarColor(index),
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

interface AlgorithmSelectorProps {
  selectedAlgorithm: SortingAlgorithmKey;
  onSelect: (algorithm: SortingAlgorithmKey) => void;
  disabled?: boolean;
  otherSelected?: SortingAlgorithmKey;
}

function AlgorithmSelector({ selectedAlgorithm, onSelect, disabled, otherSelected }: AlgorithmSelectorProps) {
  return (
    <View style={styles.selectorContainer}>
      {algorithmOptions.map((option) => {
        const isSelected = selectedAlgorithm === option.id;
        const isOtherSelected = otherSelected === option.id;

        return (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.selectorOption,
              isSelected && [styles.selectorOptionActive, { borderColor: option.color }],
              isOtherSelected && styles.selectorOptionDisabled,
            ]}
            onPress={() => !disabled && !isOtherSelected && onSelect(option.id)}
            disabled={disabled || isOtherSelected}
          >
            <Text
              style={[
                styles.selectorOptionText,
                isSelected && { color: option.color },
                isOtherSelected && styles.selectorOptionTextDisabled,
              ]}
            >
              {option.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function RaceModeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addXP } = useAppStore();

  const [algorithm1, setAlgorithm1] = useState<SortingAlgorithmKey>('bubble-sort');
  const [algorithm2, setAlgorithm2] = useState<SortingAlgorithmKey>('quick-sort');
  const [array, setArray] = useState<number[]>([]);
  const [isRacing, setIsRacing] = useState(false);
  const [raceComplete, setRaceComplete] = useState(false);
  const [winner, setWinner] = useState<1 | 2 | null>(null);

  // Algorithm 1 state
  const [steps1, setSteps1] = useState<SortStep[]>([]);
  const [stepIndex1, setStepIndex1] = useState(0);
  const [isComplete1, setIsComplete1] = useState(false);

  // Algorithm 2 state
  const [steps2, setSteps2] = useState<SortStep[]>([]);
  const [stepIndex2, setStepIndex2] = useState(0);
  const [isComplete2, setIsComplete2] = useState(false);

  const interval1Ref = useRef<ReturnType<typeof setInterval> | null>(null);
  const interval2Ref = useRef<ReturnType<typeof setInterval> | null>(null);

  const arraySize = 15;

  useEffect(() => {
    initializeRace();
    return () => {
      if (interval1Ref.current) clearInterval(interval1Ref.current);
      if (interval2Ref.current) clearInterval(interval2Ref.current);
    };
  }, [algorithm1, algorithm2]);

  const initializeRace = () => {
    if (interval1Ref.current) clearInterval(interval1Ref.current);
    if (interval2Ref.current) clearInterval(interval2Ref.current);

    const newArray = generateRandomArray(arraySize, 10, 100);
    setArray(newArray);

    // Generate steps for both algorithms
    const alg1 = sortingAlgorithms[algorithm1];
    const alg2 = sortingAlgorithms[algorithm2];

    const generator1 = alg1.generator([...newArray]);
    const allSteps1: SortStep[] = [];
    for (const step of generator1) {
      allSteps1.push(step);
    }
    setSteps1(allSteps1);

    const generator2 = alg2.generator([...newArray]);
    const allSteps2: SortStep[] = [];
    for (const step of generator2) {
      allSteps2.push(step);
    }
    setSteps2(allSteps2);

    setStepIndex1(0);
    setStepIndex2(0);
    setIsComplete1(false);
    setIsComplete2(false);
    setIsRacing(false);
    setRaceComplete(false);
    setWinner(null);
  };

  const startRace = () => {
    setIsRacing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Start algorithm 1
    interval1Ref.current = setInterval(() => {
      setStepIndex1((prev) => {
        const next = prev + 1;
        if (next >= steps1.length - 1) {
          if (interval1Ref.current) clearInterval(interval1Ref.current);
          setIsComplete1(true);
          checkWinner(1);
        }
        return Math.min(next, steps1.length - 1);
      });
    }, 50);

    // Start algorithm 2
    interval2Ref.current = setInterval(() => {
      setStepIndex2((prev) => {
        const next = prev + 1;
        if (next >= steps2.length - 1) {
          if (interval2Ref.current) clearInterval(interval2Ref.current);
          setIsComplete2(true);
          checkWinner(2);
        }
        return Math.min(next, steps2.length - 1);
      });
    }, 50);
  };

  const checkWinner = (completed: 1 | 2) => {
    setWinner((prevWinner) => {
      if (prevWinner === null) {
        setRaceComplete(true);
        setIsRacing(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        addXP(25);
        return completed;
      }
      return prevWinner;
    });
  };

  const alg1Info = sortingAlgorithms[algorithm1].info;
  const alg2Info = sortingAlgorithms[algorithm2].info;
  const alg1Option = algorithmOptions.find((o) => o.id === algorithm1)!;
  const alg2Option = algorithmOptions.find((o) => o.id === algorithm2)!;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Race Mode</Text>
        <TouchableOpacity style={styles.resetButton} onPress={initializeRace} disabled={isRacing}>
          <Ionicons name="refresh" size={22} color={isRacing ? Colors.gray600 : Colors.gray400} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Algorithm 1 Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Algorithm 1</Text>
          <AlgorithmSelector
            selectedAlgorithm={algorithm1}
            onSelect={setAlgorithm1}
            disabled={isRacing}
            otherSelected={algorithm2}
          />
          <Visualizer
            array={array}
            step={steps1[stepIndex1] || null}
            color={alg1Option.color}
            label={alg1Info.name}
            isComplete={isComplete1}
            operationsCount={stepIndex1}
          />
        </View>

        {/* VS Divider */}
        <View style={styles.vsDivider}>
          <View style={styles.vsLine} />
          <View style={styles.vsBadge}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          <View style={styles.vsLine} />
        </View>

        {/* Algorithm 2 Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Algorithm 2</Text>
          <AlgorithmSelector
            selectedAlgorithm={algorithm2}
            onSelect={setAlgorithm2}
            disabled={isRacing}
            otherSelected={algorithm1}
          />
          <Visualizer
            array={array}
            step={steps2[stepIndex2] || null}
            color={alg2Option.color}
            label={alg2Info.name}
            isComplete={isComplete2}
            operationsCount={stepIndex2}
          />
        </View>

        {/* Complexity Comparison */}
        <View style={styles.comparisonCard}>
          <Text style={styles.comparisonTitle}>Complexity Comparison</Text>
          <View style={styles.comparisonRow}>
            <View style={styles.comparisonItem}>
              <Text style={[styles.comparisonAlg, { color: alg1Option.color }]}>{alg1Info.name}</Text>
              <Text style={styles.comparisonComplexity}>Time: {alg1Info.timeComplexity.average}</Text>
              <Text style={styles.comparisonComplexity}>Space: {alg1Info.spaceComplexity}</Text>
            </View>
            <View style={styles.comparisonDivider} />
            <View style={styles.comparisonItem}>
              <Text style={[styles.comparisonAlg, { color: alg2Option.color }]}>{alg2Info.name}</Text>
              <Text style={styles.comparisonComplexity}>Time: {alg2Info.timeComplexity.average}</Text>
              <Text style={styles.comparisonComplexity}>Space: {alg2Info.spaceComplexity}</Text>
            </View>
          </View>
        </View>

        {/* Start/Reset Button */}
        {!isRacing && !raceComplete && (
          <TouchableOpacity style={styles.startButton} onPress={startRace}>
            <Ionicons name="flag" size={24} color={Colors.background} />
            <Text style={styles.startButtonText}>Start Race</Text>
          </TouchableOpacity>
        )}

        {/* Winner Announcement */}
        {raceComplete && winner && (
          <Animated.View entering={FadeInDown} style={styles.winnerCard}>
            <Ionicons name="trophy" size={48} color={Colors.logicGold} />
            <Text style={styles.winnerTitle}>
              {winner === 1 ? alg1Info.name : alg2Info.name} Wins!
            </Text>
            <Text style={styles.winnerSubtitle}>
              Completed in {winner === 1 ? steps1.length : steps2.length} operations
            </Text>
            <View style={styles.xpBadge}>
              <Text style={styles.xpBadgeText}>+25 XP</Text>
            </View>
            <TouchableOpacity style={styles.raceAgainButton} onPress={initializeRace}>
              <Text style={styles.raceAgainText}>Race Again</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
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
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  title: {
    flex: 1,
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.gray400,
    marginBottom: Spacing.sm,
  },
  selectorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  selectorOption: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectorOptionActive: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  selectorOptionDisabled: {
    opacity: 0.3,
  },
  selectorOptionText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.gray400,
  },
  selectorOptionTextDisabled: {
    color: Colors.gray600,
  },
  visualizerContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.small,
  },
  visualizerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  labelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  labelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  labelText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  opsLabel: {
    fontSize: FontSizes.sm,
    color: Colors.gray500,
  },
  opsValue: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  visualizerBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 90,
    gap: 2,
  },
  bar: {
    borderRadius: BorderRadius.xs,
  },
  vsDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  vsLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray700,
  },
  vsBadge: {
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.gray700,
  },
  vsText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  comparisonCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    ...Shadows.small,
  },
  comparisonTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.gray400,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comparisonItem: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonDivider: {
    width: 1,
    height: 60,
    backgroundColor: Colors.gray700,
    marginHorizontal: Spacing.md,
  },
  comparisonAlg: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  comparisonComplexity: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.xl,
    gap: Spacing.sm,
    ...Shadows.medium,
  },
  startButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.background,
  },
  winnerCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xxl,
    marginTop: Spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.logicGold + '50',
    ...Shadows.large,
  },
  winnerTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  winnerSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.gray400,
    marginBottom: Spacing.lg,
  },
  xpBadge: {
    backgroundColor: Colors.logicGold,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
  },
  xpBadgeText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.background,
  },
  raceAgainButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.full,
  },
  raceAgainText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.background,
  },
});
