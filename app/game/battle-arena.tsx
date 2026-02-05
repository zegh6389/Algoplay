import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows, BattleColors } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Sorting algorithms available for battle
const SORTING_ALGORITHMS = [
  { id: 'bubble-sort', name: 'Bubble Sort', shortName: 'Bubble' },
  { id: 'selection-sort', name: 'Selection Sort', shortName: 'Selection' },
  { id: 'insertion-sort', name: 'Insertion Sort', shortName: 'Insertion' },
  { id: 'merge-sort', name: 'Merge Sort', shortName: 'Merge' },
  { id: 'quick-sort', name: 'Quick Sort', shortName: 'Quick' },
];

interface BattleState {
  phase: 'selection' | 'countdown' | 'racing' | 'finished';
  algorithm1: typeof SORTING_ALGORITHMS[0] | null;
  algorithm2: typeof SORTING_ALGORITHMS[0] | null;
  array1: number[];
  array2: number[];
  operations1: number;
  operations2: number;
  currentIndex1: number;
  currentIndex2: number;
  comparing1: number[];
  comparing2: number[];
  sorted1: number[];
  sorted2: number[];
  finished1: boolean;
  finished2: boolean;
  winner: 'algorithm1' | 'algorithm2' | 'tie' | null;
  startTime: number | null;
  time1: number;
  time2: number;
}

const initialBattleState: BattleState = {
  phase: 'selection',
  algorithm1: null,
  algorithm2: null,
  array1: [],
  array2: [],
  operations1: 0,
  operations2: 0,
  currentIndex1: -1,
  currentIndex2: -1,
  comparing1: [],
  comparing2: [],
  sorted1: [],
  sorted2: [],
  finished1: false,
  finished2: false,
  winner: null,
  startTime: null,
  time1: 0,
  time2: 0,
};

// Algorithm Selection Card
function AlgorithmCard({
  algorithm,
  selected,
  onSelect,
  color,
  disabled,
}: {
  algorithm: typeof SORTING_ALGORITHMS[0];
  selected: boolean;
  onSelect: () => void;
  color: string;
  disabled: boolean;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.algorithmCard,
          selected && { borderColor: color, borderWidth: 2 },
          disabled && styles.algorithmCardDisabled,
        ]}
        onPress={onSelect}
        onPressIn={() => (scale.value = withSpring(0.95))}
        onPressOut={() => (scale.value = withSpring(1))}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <View style={[styles.algorithmIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name="code-slash" size={20} color={color} />
        </View>
        <Text style={styles.algorithmName}>{algorithm.shortName}</Text>
        {selected && (
          <Ionicons name="checkmark-circle" size={18} color={color} style={styles.checkIcon} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// Battle Visualizer Bar
function BattleBar({
  value,
  maxValue,
  isComparing,
  isSorted,
  color,
  index,
  totalBars,
}: {
  value: number;
  maxValue: number;
  isComparing: boolean;
  isSorted: boolean;
  color: string;
  index: number;
  totalBars: number;
}) {
  const height = (value / maxValue) * 100;
  const barWidth = (SCREEN_WIDTH / 2 - Spacing.lg * 2) / totalBars - 2;

  let barColor = color + '60';
  if (isComparing) barColor = Colors.logicGold;
  if (isSorted) barColor = Colors.success;

  return (
    <View
      style={[
        styles.battleBar,
        {
          height: `${height}%`,
          width: barWidth,
          backgroundColor: barColor,
        },
      ]}
    />
  );
}

// Battle Panel for each algorithm
function BattlePanel({
  side,
  algorithm,
  array,
  operations,
  comparing,
  sorted,
  finished,
  time,
  isWinner,
}: {
  side: 'left' | 'right';
  algorithm: typeof SORTING_ALGORITHMS[0] | null;
  array: number[];
  operations: number;
  comparing: number[];
  sorted: number[];
  finished: boolean;
  time: number;
  isWinner: boolean;
}) {
  const color = side === 'left' ? BattleColors.player1 : BattleColors.player2;
  const maxValue = Math.max(...array, 1);

  const EnterAnimation = side === 'left' ? FadeInLeft : FadeInRight;

  return (
    <Animated.View
      entering={EnterAnimation.delay(300).springify()}
      style={[styles.battlePanel, side === 'right' && styles.battlePanelRight]}
    >
      {/* Header */}
      <View style={[styles.panelHeader, { borderBottomColor: color + '30' }]}>
        <Text style={[styles.panelTitle, { color }]}>{algorithm?.name || 'Select Algorithm'}</Text>
        {isWinner && (
          <View style={styles.winnerBadge}>
            <Ionicons name="trophy" size={14} color={Colors.logicGold} />
            <Text style={styles.winnerText}>WINNER</Text>
          </View>
        )}
      </View>

      {/* Visualization */}
      <View style={styles.visualizationContainer}>
        <View style={styles.barsContainer}>
          {array.map((value, index) => (
            <BattleBar
              key={index}
              value={value}
              maxValue={maxValue}
              isComparing={comparing.includes(index)}
              isSorted={sorted.includes(index)}
              color={color}
              index={index}
              totalBars={array.length}
            />
          ))}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="swap-horizontal" size={14} color={Colors.gray400} />
          <Text style={styles.statValue}>{operations}</Text>
          <Text style={styles.statLabel}>ops</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="time" size={14} color={Colors.gray400} />
          <Text style={styles.statValue}>{time.toFixed(0)}</Text>
          <Text style={styles.statLabel}>ms</Text>
        </View>
        <View style={[styles.statusBadge, finished && { backgroundColor: Colors.success + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: finished ? Colors.success : color }]} />
          <Text style={[styles.statusText, finished && { color: Colors.success }]}>
            {finished ? 'Done' : 'Running'}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

// Countdown Overlay
function CountdownOverlay({ count, onComplete }: { count: number; onComplete: () => void }) {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 8 });
    if (count === 0) {
      opacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(onComplete)();
      });
    }
  }, [count]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.countdownOverlay}>
      <Animated.View style={[styles.countdownContainer, animatedStyle]}>
        <LinearGradient
          colors={[Colors.accent + '20', Colors.electricPurple + '20']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.countdownGradient}
        >
          <Text style={styles.countdownText}>
            {count === 0 ? 'GO!' : count}
          </Text>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

// Winner Podium Screen
function WinnerPodium({
  winner,
  algorithm1,
  algorithm2,
  stats,
  explanation,
  onRematch,
  onNewBattle,
}: {
  winner: 'algorithm1' | 'algorithm2' | 'tie';
  algorithm1: typeof SORTING_ALGORITHMS[0];
  algorithm2: typeof SORTING_ALGORITHMS[0];
  stats: { ops1: number; ops2: number; time1: number; time2: number };
  explanation: string;
  onRematch: () => void;
  onNewBattle: () => void;
}) {
  const winnerAlgo = winner === 'algorithm1' ? algorithm1 : winner === 'algorithm2' ? algorithm2 : null;
  const winnerColor = winner === 'algorithm1' ? BattleColors.player1 : winner === 'algorithm2' ? BattleColors.player2 : Colors.gray400;

  return (
    <Animated.View entering={FadeIn.duration(500)} style={styles.podiumContainer}>
      <BlurView intensity={40} tint="dark" style={styles.podiumBlur}>
        {/* Trophy */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.trophyContainer}>
          <LinearGradient
            colors={[Colors.logicGold, Colors.logicGoldDark]}
            style={styles.trophyGradient}
          >
            <Ionicons name="trophy" size={48} color={Colors.background} />
          </LinearGradient>
        </Animated.View>

        {/* Winner Name */}
        <Animated.Text entering={FadeInDown.delay(400).springify()} style={styles.winnerTitle}>
          {winner === 'tie' ? "It's a Tie!" : `${winnerAlgo?.name} Wins!`}
        </Animated.Text>

        {/* Stats Comparison */}
        <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.comparisonCard}>
          <View style={styles.comparisonRow}>
            <View style={[styles.comparisonSide, { alignItems: 'flex-end' }]}>
              <Text style={[styles.algoNameSmall, { color: BattleColors.player1 }]}>{algorithm1.shortName}</Text>
              <Text style={styles.comparisonValue}>{stats.ops1} ops</Text>
              <Text style={styles.comparisonSubvalue}>{stats.time1.toFixed(0)}ms</Text>
            </View>
            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>
            <View style={[styles.comparisonSide, { alignItems: 'flex-start' }]}>
              <Text style={[styles.algoNameSmall, { color: BattleColors.player2 }]}>{algorithm2.shortName}</Text>
              <Text style={styles.comparisonValue}>{stats.ops2} ops</Text>
              <Text style={styles.comparisonSubvalue}>{stats.time2.toFixed(0)}ms</Text>
            </View>
          </View>
        </Animated.View>

        {/* AI Explanation */}
        <Animated.View entering={FadeInDown.delay(800).springify()} style={styles.explanationCard}>
          <View style={styles.explanationHeader}>
            <Ionicons name="sparkles" size={16} color={Colors.electricPurple} />
            <Text style={styles.explanationTitle}>Why {winnerAlgo?.name || 'they tied'}?</Text>
          </View>
          <Text style={styles.explanationText}>{explanation}</Text>
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(1000).springify()} style={styles.podiumActions}>
          <TouchableOpacity style={styles.rematchButton} onPress={onRematch}>
            <Ionicons name="refresh" size={20} color={Colors.textPrimary} />
            <Text style={styles.rematchText}>Rematch</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.newBattleButton} onPress={onNewBattle}>
            <Text style={styles.newBattleText}>New Battle</Text>
          </TouchableOpacity>
        </Animated.View>
      </BlurView>
    </Animated.View>
  );
}

export default function BattleArenaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addXP } = useAppStore();

  const [battleState, setBattleState] = useState<BattleState>(initialBattleState);
  const [countdown, setCountdown] = useState(3);
  const [aiExplanation, setAiExplanation] = useState('');

  const battleRef = useRef<{ running: boolean }>({ running: false });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate random array
  const generateArray = useCallback((size: number = 15) => {
    return Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 5);
  }, []);

  // Handle algorithm selection
  const selectAlgorithm = (slot: 1 | 2, algorithm: typeof SORTING_ALGORITHMS[0]) => {
    if (slot === 1) {
      setBattleState((prev) => ({ ...prev, algorithm1: algorithm }));
    } else {
      setBattleState((prev) => ({ ...prev, algorithm2: algorithm }));
    }
  };

  // Start battle countdown
  const startBattle = () => {
    const array = generateArray(15);
    setBattleState((prev) => ({
      ...prev,
      phase: 'countdown',
      array1: [...array],
      array2: [...array],
      operations1: 0,
      operations2: 0,
      comparing1: [],
      comparing2: [],
      sorted1: [],
      sorted2: [],
      finished1: false,
      finished2: false,
      winner: null,
      time1: 0,
      time2: 0,
    }));
    setCountdown(3);

    // Countdown timer
    let count = 3;
    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);
  };

  // Begin racing after countdown
  const beginRace = () => {
    setBattleState((prev) => ({
      ...prev,
      phase: 'racing',
      startTime: Date.now(),
    }));
    battleRef.current.running = true;
    runSortingRace();
  };

  // Sorting algorithms implementations
  const bubbleSort = (arr: number[]): { steps: { array: number[]; comparing: number[]; sorted: number[] }[]; operations: number } => {
    const array = [...arr];
    const steps: { array: number[]; comparing: number[]; sorted: number[] }[] = [];
    let operations = 0;
    const sorted: number[] = [];

    for (let i = 0; i < array.length - 1; i++) {
      for (let j = 0; j < array.length - i - 1; j++) {
        operations++;
        steps.push({ array: [...array], comparing: [j, j + 1], sorted: [...sorted] });
        if (array[j] > array[j + 1]) {
          [array[j], array[j + 1]] = [array[j + 1], array[j]];
          operations++;
        }
      }
      sorted.unshift(array.length - 1 - i);
    }
    sorted.unshift(0);
    steps.push({ array: [...array], comparing: [], sorted: [...sorted] });
    return { steps, operations };
  };

  const selectionSort = (arr: number[]): { steps: { array: number[]; comparing: number[]; sorted: number[] }[]; operations: number } => {
    const array = [...arr];
    const steps: { array: number[]; comparing: number[]; sorted: number[] }[] = [];
    let operations = 0;
    const sorted: number[] = [];

    for (let i = 0; i < array.length - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < array.length; j++) {
        operations++;
        steps.push({ array: [...array], comparing: [minIdx, j], sorted: [...sorted] });
        if (array[j] < array[minIdx]) {
          minIdx = j;
        }
      }
      if (minIdx !== i) {
        [array[i], array[minIdx]] = [array[minIdx], array[i]];
        operations++;
      }
      sorted.push(i);
    }
    sorted.push(array.length - 1);
    steps.push({ array: [...array], comparing: [], sorted: [...sorted] });
    return { steps, operations };
  };

  const insertionSort = (arr: number[]): { steps: { array: number[]; comparing: number[]; sorted: number[] }[]; operations: number } => {
    const array = [...arr];
    const steps: { array: number[]; comparing: number[]; sorted: number[] }[] = [];
    let operations = 0;
    const sorted: number[] = [0];

    for (let i = 1; i < array.length; i++) {
      const key = array[i];
      let j = i - 1;
      while (j >= 0 && array[j] > key) {
        operations++;
        steps.push({ array: [...array], comparing: [j, j + 1], sorted: [...sorted] });
        array[j + 1] = array[j];
        j--;
      }
      array[j + 1] = key;
      operations++;
      sorted.push(i);
    }
    steps.push({ array: [...array], comparing: [], sorted: [...sorted] });
    return { steps, operations };
  };

  const mergeSort = (arr: number[]): { steps: { array: number[]; comparing: number[]; sorted: number[] }[]; operations: number } => {
    const array = [...arr];
    const steps: { array: number[]; comparing: number[]; sorted: number[] }[] = [];
    let operations = 0;

    const merge = (arr: number[], l: number, m: number, r: number) => {
      const left = arr.slice(l, m + 1);
      const right = arr.slice(m + 1, r + 1);
      let i = 0, j = 0, k = l;

      while (i < left.length && j < right.length) {
        operations++;
        steps.push({ array: [...arr], comparing: [l + i, m + 1 + j], sorted: [] });
        if (left[i] <= right[j]) {
          arr[k] = left[i];
          i++;
        } else {
          arr[k] = right[j];
          j++;
        }
        k++;
      }

      while (i < left.length) {
        arr[k] = left[i];
        i++;
        k++;
      }

      while (j < right.length) {
        arr[k] = right[j];
        j++;
        k++;
      }
    };

    const sort = (arr: number[], l: number, r: number) => {
      if (l < r) {
        const m = Math.floor((l + r) / 2);
        sort(arr, l, m);
        sort(arr, m + 1, r);
        merge(arr, l, m, r);
      }
    };

    sort(array, 0, array.length - 1);
    steps.push({ array: [...array], comparing: [], sorted: array.map((_, i) => i) });
    return { steps, operations };
  };

  const quickSort = (arr: number[]): { steps: { array: number[]; comparing: number[]; sorted: number[] }[]; operations: number } => {
    const array = [...arr];
    const steps: { array: number[]; comparing: number[]; sorted: number[] }[] = [];
    let operations = 0;
    const sorted: number[] = [];

    const partition = (arr: number[], low: number, high: number): number => {
      const pivot = arr[high];
      let i = low - 1;

      for (let j = low; j < high; j++) {
        operations++;
        steps.push({ array: [...arr], comparing: [j, high], sorted: [...sorted] });
        if (arr[j] < pivot) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
      }
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      return i + 1;
    };

    const sort = (arr: number[], low: number, high: number) => {
      if (low < high) {
        const pi = partition(arr, low, high);
        sorted.push(pi);
        sort(arr, low, pi - 1);
        sort(arr, pi + 1, high);
      }
    };

    sort(array, 0, array.length - 1);
    steps.push({ array: [...array], comparing: [], sorted: array.map((_, i) => i) });
    return { steps, operations };
  };

  const getSortingSteps = (algorithmId: string, array: number[]) => {
    switch (algorithmId) {
      case 'bubble-sort':
        return bubbleSort(array);
      case 'selection-sort':
        return selectionSort(array);
      case 'insertion-sort':
        return insertionSort(array);
      case 'merge-sort':
        return mergeSort(array);
      case 'quick-sort':
        return quickSort(array);
      default:
        return bubbleSort(array);
    }
  };

  // Run the sorting race
  const runSortingRace = () => {
    const { algorithm1, algorithm2, array1, array2 } = battleState;
    if (!algorithm1 || !algorithm2) return;

    const steps1 = getSortingSteps(algorithm1.id, array1);
    const steps2 = getSortingSteps(algorithm2.id, array2);

    let step1Index = 0;
    let step2Index = 0;
    const startTime = Date.now();

    intervalRef.current = setInterval(() => {
      if (!battleRef.current.running) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }

      let finished1 = step1Index >= steps1.steps.length - 1;
      let finished2 = step2Index >= steps2.steps.length - 1;

      setBattleState((prev) => {
        const newState = { ...prev };

        if (step1Index < steps1.steps.length) {
          const step = steps1.steps[step1Index];
          newState.array1 = step.array;
          newState.comparing1 = step.comparing;
          newState.sorted1 = step.sorted;
          newState.operations1 = Math.min(step1Index + 1, steps1.operations);
          step1Index++;
        }
        if (!finished1 && step1Index >= steps1.steps.length - 1) {
          newState.finished1 = true;
          newState.time1 = Date.now() - startTime;
          finished1 = true;
        }

        if (step2Index < steps2.steps.length) {
          const step = steps2.steps[step2Index];
          newState.array2 = step.array;
          newState.comparing2 = step.comparing;
          newState.sorted2 = step.sorted;
          newState.operations2 = Math.min(step2Index + 1, steps2.operations);
          step2Index++;
        }
        if (!finished2 && step2Index >= steps2.steps.length - 1) {
          newState.finished2 = true;
          newState.time2 = Date.now() - startTime;
          finished2 = true;
        }

        // Check if race is over
        if (finished1 && finished2) {
          battleRef.current.running = false;
          if (intervalRef.current) clearInterval(intervalRef.current);

          const winner = newState.operations1 < newState.operations2
            ? 'algorithm1'
            : newState.operations2 < newState.operations1
              ? 'algorithm2'
              : 'tie';

          newState.winner = winner;
          newState.phase = 'finished';

          // Generate AI explanation
          generateExplanation(algorithm1, algorithm2, {
            ops1: steps1.operations,
            ops2: steps2.operations,
            time1: newState.time1,
            time2: newState.time2,
          });

          // Award XP
          addXP(50);
        }

        return newState;
      });
    }, 50);
  };

  // Generate AI explanation using newell-ai
  const generateExplanation = async (
    algo1: typeof SORTING_ALGORITHMS[0],
    algo2: typeof SORTING_ALGORITHMS[0],
    stats: { ops1: number; ops2: number; time1: number; time2: number }
  ) => {
    const winner = stats.ops1 < stats.ops2 ? algo1.name : stats.ops2 < stats.ops1 ? algo2.name : null;

    // Default explanation based on algorithm characteristics
    const explanations: Record<string, Record<string, string>> = {
      'quick-sort': {
        default: `Quick Sort typically performs well due to its efficient partitioning strategy and good cache locality. With ${stats.ops1} operations, it demonstrates its O(n log n) average-case performance.`,
      },
      'merge-sort': {
        default: `Merge Sort maintains consistent O(n log n) performance regardless of input. Its divide-and-conquer approach with ${stats.ops1} operations shows predictable behavior.`,
      },
      'insertion-sort': {
        default: `Insertion Sort performed with ${stats.ops1} operations. It excels with small or nearly sorted arrays, building the sorted portion one element at a time.`,
      },
      'bubble-sort': {
        default: `Bubble Sort completed with ${stats.ops1} operations. Despite its O(n²) complexity, it remains simple and can be efficient for nearly sorted data.`,
      },
      'selection-sort': {
        default: `Selection Sort used ${stats.ops1} operations. It always performs O(n²) comparisons but minimizes the number of swaps.`,
      },
    };

    let explanation = '';
    if (winner) {
      if (winner === algo1.name) {
        explanation = `${algo1.name} won with ${stats.ops1} operations vs ${algo2.name}'s ${stats.ops2}. `;
        explanation += explanations[algo1.id]?.default || '';
      } else {
        explanation = `${algo2.name} won with ${stats.ops2} operations vs ${algo1.name}'s ${stats.ops1}. `;
        explanation += explanations[algo2.id]?.default || '';
      }
    } else {
      explanation = `Both algorithms tied at ${stats.ops1} operations! This can happen when the input data suits both algorithms equally well.`;
    }

    setAiExplanation(explanation);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      battleRef.current.running = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Handle rematch
  const handleRematch = () => {
    const array = generateArray(15);
    setBattleState((prev) => ({
      ...prev,
      phase: 'countdown',
      array1: [...array],
      array2: [...array],
      operations1: 0,
      operations2: 0,
      comparing1: [],
      comparing2: [],
      sorted1: [],
      sorted2: [],
      finished1: false,
      finished2: false,
      winner: null,
      time1: 0,
      time2: 0,
    }));
    setCountdown(3);

    let count = 3;
    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);
  };

  // Handle new battle
  const handleNewBattle = () => {
    setBattleState(initialBattleState);
    setAiExplanation('');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[Colors.background, Colors.backgroundDark]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Algorithm Battle</Text>
          <Text style={styles.headerSubtitle}>Versus Mode</Text>
        </View>
        <View style={{ width: 44 }} />
      </Animated.View>

      {battleState.phase === 'selection' && (
        <ScrollView style={styles.selectionContainer} contentContainerStyle={styles.selectionContent}>
          {/* Player 1 Selection */}
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.selectionSection}>
            <View style={styles.sectionHeader}>
              <View style={[styles.playerBadge, { backgroundColor: BattleColors.player1 }]}>
                <Text style={styles.playerBadgeText}>P1</Text>
              </View>
              <Text style={styles.sectionTitle}>Select Algorithm 1</Text>
            </View>
            <View style={styles.algorithmsGrid}>
              {SORTING_ALGORITHMS.map((algo) => (
                <AlgorithmCard
                  key={algo.id}
                  algorithm={algo}
                  selected={battleState.algorithm1?.id === algo.id}
                  onSelect={() => selectAlgorithm(1, algo)}
                  color={BattleColors.player1}
                  disabled={battleState.algorithm2?.id === algo.id}
                />
              ))}
            </View>
          </Animated.View>

          {/* VS Divider */}
          <Animated.View entering={FadeIn.delay(400)} style={styles.vsDivider}>
            <View style={styles.vsLine} />
            <View style={styles.vsCircle}>
              <Text style={styles.vsText}>VS</Text>
            </View>
            <View style={styles.vsLine} />
          </Animated.View>

          {/* Player 2 Selection */}
          <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.selectionSection}>
            <View style={styles.sectionHeader}>
              <View style={[styles.playerBadge, { backgroundColor: BattleColors.player2 }]}>
                <Text style={styles.playerBadgeText}>P2</Text>
              </View>
              <Text style={styles.sectionTitle}>Select Algorithm 2</Text>
            </View>
            <View style={styles.algorithmsGrid}>
              {SORTING_ALGORITHMS.map((algo) => (
                <AlgorithmCard
                  key={algo.id}
                  algorithm={algo}
                  selected={battleState.algorithm2?.id === algo.id}
                  onSelect={() => selectAlgorithm(2, algo)}
                  color={BattleColors.player2}
                  disabled={battleState.algorithm1?.id === algo.id}
                />
              ))}
            </View>
          </Animated.View>

          {/* Start Battle Button */}
          <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.startButtonContainer}>
            <TouchableOpacity
              style={[
                styles.startButton,
                (!battleState.algorithm1 || !battleState.algorithm2) && styles.startButtonDisabled,
              ]}
              onPress={startBattle}
              disabled={!battleState.algorithm1 || !battleState.algorithm2}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  battleState.algorithm1 && battleState.algorithm2
                    ? [Colors.accent, Colors.electricPurple]
                    : [Colors.gray600, Colors.gray700]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startButtonGradient}
              >
                <Ionicons name="flash" size={24} color={Colors.textPrimary} />
                <Text style={styles.startButtonText}>Start Battle</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      )}

      {(battleState.phase === 'countdown' || battleState.phase === 'racing') && (
        <View style={styles.battleContainer}>
          {/* Battle Panels */}
          <View style={styles.panelsRow}>
            <BattlePanel
              side="left"
              algorithm={battleState.algorithm1}
              array={battleState.array1}
              operations={battleState.operations1}
              comparing={battleState.comparing1}
              sorted={battleState.sorted1}
              finished={battleState.finished1}
              time={battleState.time1}
              isWinner={battleState.winner === 'algorithm1'}
            />
            <View style={styles.centerDivider}>
              <Text style={styles.centerVs}>VS</Text>
            </View>
            <BattlePanel
              side="right"
              algorithm={battleState.algorithm2}
              array={battleState.array2}
              operations={battleState.operations2}
              comparing={battleState.comparing2}
              sorted={battleState.sorted2}
              finished={battleState.finished2}
              time={battleState.time2}
              isWinner={battleState.winner === 'algorithm2'}
            />
          </View>

          {/* Countdown Overlay */}
          {battleState.phase === 'countdown' && (
            <CountdownOverlay count={countdown} onComplete={beginRace} />
          )}
        </View>
      )}

      {battleState.phase === 'finished' && battleState.algorithm1 && battleState.algorithm2 && (
        <WinnerPodium
          winner={battleState.winner || 'tie'}
          algorithm1={battleState.algorithm1}
          algorithm2={battleState.algorithm2}
          stats={{
            ops1: battleState.operations1,
            ops2: battleState.operations2,
            time1: battleState.time1,
            time2: battleState.time2,
          }}
          explanation={aiExplanation}
          onRematch={handleRematch}
          onNewBattle={handleNewBattle}
        />
      )}
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
    marginTop: 2,
  },
  // Selection Phase
  selectionContainer: {
    flex: 1,
  },
  selectionContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  selectionSection: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  playerBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  playerBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  algorithmsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  algorithmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    paddingRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray700,
    minWidth: 110,
  },
  algorithmCardDisabled: {
    opacity: 0.4,
  },
  algorithmIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  algorithmName: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  checkIcon: {
    marginLeft: Spacing.xs,
  },
  vsDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  vsLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray700,
  },
  vsCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.gray600,
  },
  vsText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.gray400,
  },
  startButtonContainer: {
    marginTop: Spacing.xl,
  },
  startButton: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  startButtonText: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  // Battle Phase
  battleContainer: {
    flex: 1,
    padding: Spacing.md,
  },
  panelsRow: {
    flex: 1,
    flexDirection: 'row',
  },
  battlePanel: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: BattleColors.player1 + '30',
  },
  battlePanelRight: {
    borderColor: BattleColors.player2 + '30',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.sm,
    borderBottomWidth: 1,
  },
  panelTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  winnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.logicGold + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  winnerText: {
    fontSize: 8,
    fontWeight: '700',
    color: Colors.logicGold,
  },
  visualizationContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingVertical: Spacing.sm,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: '100%',
    gap: 2,
  },
  battleBar: {
    borderRadius: 2,
    minHeight: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray700,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray700 + '50',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
    color: Colors.gray400,
  },
  centerDivider: {
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerVs: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.gray500,
  },
  // Countdown
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  countdownContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
  },
  countdownGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 64,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  // Winner Podium
  podiumContainer: {
    ...StyleSheet.absoluteFillObject,
    top: 100,
    left: Spacing.lg,
    right: Spacing.lg,
    bottom: Spacing.xxxl,
  },
  podiumBlur: {
    flex: 1,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  trophyContainer: {
    marginBottom: Spacing.lg,
  },
  trophyGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.large,
  },
  winnerTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  comparisonCard: {
    backgroundColor: Colors.backgroundDark,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    width: '100%',
    marginBottom: Spacing.lg,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comparisonSide: {
    flex: 1,
    gap: 4,
  },
  algoNameSmall: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  comparisonValue: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  comparisonSubvalue: {
    fontSize: FontSizes.sm,
    color: Colors.gray500,
  },
  vsContainer: {
    width: 40,
    alignItems: 'center',
  },
  explanationCard: {
    backgroundColor: Colors.electricPurple + '15',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    width: '100%',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.electricPurple + '30',
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  explanationTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.electricPurple,
  },
  explanationText: {
    fontSize: FontSizes.sm,
    color: Colors.gray300,
    lineHeight: 20,
  },
  podiumActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: 'auto',
  },
  rematchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray700,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  rematchText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  newBattleButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  newBattleText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.background,
  },
});
