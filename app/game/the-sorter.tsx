import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import PremiumGate from '@/components/PremiumGate';
import { useAppStore } from '@/store/useAppStore';
import { generateRandomArray, bubbleSortGenerator, SortStep } from '@/utils/algorithms/sorting';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ELEMENT_WIDTH = 60;
const ELEMENT_HEIGHT = 80;

interface SortableElement {
  id: number;
  value: number;
}

interface DraggableElementProps {
  element: SortableElement;
  index: number;
  onSwap: (fromIndex: number, toIndex: number) => void;
  totalElements: number;
  isHighlighted: boolean;
}

function DraggableElement({ element, index, onSwap, totalElements, isHighlighted }: DraggableElementProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(0);

  const containerWidth = SCREEN_WIDTH - Spacing.lg * 2;
  const spacing = (containerWidth - ELEMENT_WIDTH * totalElements) / (totalElements - 1);
  const elementSpacing = ELEMENT_WIDTH + spacing;

  const panGesture = Gesture.Pan()
    .onStart(() => {
      scale.value = withSpring(1.1);
      zIndex.value = 100;
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const moveThreshold = elementSpacing / 2;
      const movement = Math.round(event.translationX / elementSpacing);
      const newIndex = index + movement;

      if (movement !== 0 && newIndex >= 0 && newIndex < totalElements) {
        runOnJS(onSwap)(index, newIndex);
        runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
      }

      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      zIndex.value = 0;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: zIndex.value,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.element,
          animatedStyle,
          isHighlighted && styles.elementHighlighted,
        ]}
      >
        <Text style={styles.elementValue}>{element.value}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

interface ComputerElementProps {
  value: number;
  state: 'default' | 'comparing' | 'swapping' | 'sorted';
  totalElements: number;
}

function ComputerElement({ value, state, totalElements }: ComputerElementProps) {
  const maxHeight = 100;
  const maxValue = 100;
  const height = (value / maxValue) * maxHeight;

  const containerWidth = SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md * 2;
  const barWidth = containerWidth / totalElements - 4;

  const getColor = () => {
    switch (state) {
      case 'comparing':
        return Colors.logicGold;
      case 'swapping':
        return Colors.alertCoral;
      case 'sorted':
        return Colors.success;
      default:
        return Colors.accent;
    }
  };

  return (
    <Animated.View
      style={[
        styles.computerBar,
        {
          width: barWidth,
          height,
          backgroundColor: getColor(),
        },
      ]}
    />
  );
}

export default function TheSorterScreen() {
  return (
    <PremiumGate featureName="The Sorter">
      <TheSorterScreenInner />
    </PremiumGate>
  );
}

function TheSorterScreenInner() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateHighScore, addXP, completeDailyChallenge } = useAppStore();

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'won' | 'lost'>('ready');
  const [playerElements, setPlayerElements] = useState<SortableElement[]>([]);
  const [computerArray, setComputerArray] = useState<number[]>([]);
  const [computerStep, setComputerStep] = useState<SortStep | null>(null);
  const [playerTime, setPlayerTime] = useState(0);
  const [computerTime, setComputerTime] = useState(0);
  const [playerMoves, setPlayerMoves] = useState(0);

  const computerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const computerStepsRef = useRef<SortStep[]>([]);
  const computerStepIndexRef = useRef(0);

  const arraySize = 8;

  useEffect(() => {
    initializeGame();
    return () => {
      if (computerIntervalRef.current) clearInterval(computerIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const initializeGame = () => {
    const array = generateRandomArray(arraySize, 10, 99);
    setPlayerElements(array.map((value, id) => ({ id, value })));
    setComputerArray([...array]);
    setGameState('ready');
    setPlayerTime(0);
    setComputerTime(0);
    setPlayerMoves(0);
    setComputerStep(null);

    // Generate computer steps
    const generator = bubbleSortGenerator(array);
    const steps: SortStep[] = [];
    for (const step of generator) {
      steps.push(step);
    }
    computerStepsRef.current = steps;
    computerStepIndexRef.current = 0;

    if (computerIntervalRef.current) clearInterval(computerIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  const startGame = () => {
    setGameState('playing');

    // Start player timer
    timerIntervalRef.current = setInterval(() => {
      setPlayerTime((prev) => prev + 100);
    }, 100);

    // Start computer animation (slower to give player a chance)
    computerIntervalRef.current = setInterval(() => {
      const steps = computerStepsRef.current;
      const index = computerStepIndexRef.current;

      if (index < steps.length) {
        setComputerStep(steps[index]);
        setComputerArray(steps[index].array);
        computerStepIndexRef.current++;

        if (steps[index].operation === 'Array is sorted!') {
          if (computerIntervalRef.current) clearInterval(computerIntervalRef.current);
          checkGameEnd('computer');
        }
      }
    }, 500); // Computer moves every 500ms
  };

  const handleSwap = useCallback((fromIndex: number, toIndex: number) => {
    if (gameState !== 'playing') return;

    setPlayerElements((prev) => {
      const newElements = [...prev];
      [newElements[fromIndex], newElements[toIndex]] = [newElements[toIndex], newElements[fromIndex]];
      return newElements;
    });

    setPlayerMoves((prev) => prev + 1);

    // Check if player has sorted the array
    setTimeout(() => {
      setPlayerElements((current) => {
        const isSorted = current.every((el, i) => i === 0 || current[i - 1].value <= el.value);
        if (isSorted) {
          checkGameEnd('player');
        }
        return current;
      });
    }, 100);
  }, [gameState]);

  const checkGameEnd = (winner: 'player' | 'computer') => {
    if (gameState !== 'playing') return;

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (computerIntervalRef.current) clearInterval(computerIntervalRef.current);

    if (winner === 'player') {
      setGameState('won');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      updateHighScore('sorterBest', playerTime);
      addXP(100);
      completeDailyChallenge();
    } else {
      setGameState('lost');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const getBarState = (index: number): ComputerElementProps['state'] => {
    if (!computerStep) return 'default';
    if (computerStep.sorted?.includes(index)) return 'sorted';
    if (computerStep.swapping?.includes(index)) return 'swapping';
    if (computerStep.comparing?.includes(index)) return 'comparing';
    return 'default';
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const deciseconds = Math.floor((ms % 1000) / 100);
    return `${seconds}.${deciseconds}s`;
  };

  return (
    <GestureHandlerRootView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>The Sorter</Text>
        <TouchableOpacity style={styles.resetButton} onPress={initializeGame}>
          <Ionicons name="refresh" size={22} color={Colors.gray400} />
        </TouchableOpacity>
      </Animated.View>

      {/* Game Status */}
      <View style={styles.statusContainer}>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Your Time</Text>
          <Text style={[styles.statusValue, { color: Colors.accent }]}>
            {formatTime(playerTime)}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Moves</Text>
          <Text style={[styles.statusValue, { color: Colors.logicGold }]}>
            {playerMoves}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>vs Bubble</Text>
          <Text style={[styles.statusValue, { color: Colors.alertCoral }]}>
            {computerStepIndexRef.current}/{computerStepsRef.current.length}
          </Text>
        </View>
      </View>

      {/* Player Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>You</Text>
        <View style={styles.playerContainer}>
          {playerElements.map((element, index) => (
            <DraggableElement
              key={element.id}
              element={element}
              index={index}
              onSwap={handleSwap}
              totalElements={playerElements.length}
              isHighlighted={false}
            />
          ))}
        </View>
        <Text style={styles.hint}>Drag elements to sort in ascending order</Text>
      </View>

      {/* Computer Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bubble Sort (Computer)</Text>
        <View style={styles.computerContainer}>
          {computerArray.map((value, index) => (
            <ComputerElement
              key={index}
              value={value}
              state={getBarState(index)}
              totalElements={computerArray.length}
            />
          ))}
        </View>
        {computerStep && (
          <Text style={styles.computerStatus}>{computerStep.operation}</Text>
        )}
      </View>

      {/* Game State Overlay */}
      {gameState === 'ready' && (
        <View style={styles.overlay}>
          <Animated.View entering={FadeInDown} style={styles.overlayContent}>
            <Ionicons name="trophy" size={64} color={Colors.logicGold} />
            <Text style={styles.overlayTitle}>Beat the Bubble Sort!</Text>
            <Text style={styles.overlaySubtitle}>
              Sort the numbers faster than the algorithm
            </Text>
            <TouchableOpacity style={styles.startButton} onPress={startGame}>
              <Ionicons name="play" size={24} color={Colors.background} />
              <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {gameState === 'won' && (
        <View style={styles.overlay}>
          <Animated.View entering={FadeInDown} style={styles.overlayContent}>
            <Ionicons name="trophy" size={64} color={Colors.logicGold} />
            <Text style={styles.overlayTitle}>You Won!</Text>
            <Text style={styles.overlaySubtitle}>
              Time: {formatTime(playerTime)} • Moves: {playerMoves}
            </Text>
            <View style={styles.xpEarned}>
              <Text style={styles.xpEarnedText}>+100 XP</Text>
            </View>
            <TouchableOpacity style={styles.playAgainButton} onPress={initializeGame}>
              <Text style={styles.playAgainText}>Play Again</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {gameState === 'lost' && (
        <View style={styles.overlay}>
          <Animated.View entering={FadeInDown} style={[styles.overlayContent, styles.lostOverlay]}>
            <Ionicons name="sad" size={64} color={Colors.alertCoral} />
            <Text style={styles.overlayTitle}>Bubble Sort Won!</Text>
            <Text style={styles.overlaySubtitle}>
              Don&apos;t worry, try again!
            </Text>
            <TouchableOpacity style={styles.playAgainButton} onPress={initializeGame}>
              <Text style={styles.playAgainText}>Try Again</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </GestureHandlerRootView>
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
  statusContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.gray400,
    marginBottom: Spacing.md,
  },
  playerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    minHeight: 100,
    ...Shadows.medium,
  },
  element: {
    width: ELEMENT_WIDTH - 8,
    height: ELEMENT_HEIGHT,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  elementHighlighted: {
    backgroundColor: Colors.logicGold,
  },
  elementValue: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  hint: {
    fontSize: FontSizes.sm,
    color: Colors.gray500,
    textAlign: 'center',
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  computerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    minHeight: 130,
    ...Shadows.small,
  },
  computerBar: {
    borderRadius: BorderRadius.sm,
  },
  computerStatus: {
    fontSize: FontSizes.sm,
    color: Colors.gray500,
    textAlign: 'center',
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background + 'F0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  overlayContent: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xxl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    ...Shadows.large,
  },
  lostOverlay: {
    borderColor: Colors.alertCoral,
    borderWidth: 2,
  },
  overlayTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  overlaySubtitle: {
    fontSize: FontSizes.md,
    color: Colors.gray400,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  startButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.background,
  },
  xpEarned: {
    backgroundColor: Colors.logicGold,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
  },
  xpEarnedText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.background,
  },
  playAgainButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.full,
  },
  playAgainText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.background,
  },
});
