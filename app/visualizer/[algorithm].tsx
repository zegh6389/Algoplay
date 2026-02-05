import React, { useCallback, useEffect, useRef, useState } from 'react';
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
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import {
  sortingAlgorithms,
  SortStep,
  generateRandomArray,
  SortingAlgorithmKey,
} from '@/utils/algorithms/sorting';
import {
  searchingAlgorithms,
  SearchStep,
  SearchingAlgorithmKey,
  generateRandomArrayForSearch,
} from '@/utils/algorithms/searching';
import { dpAlgorithms, DPAlgorithmKey } from '@/utils/algorithms/dynamicProgramming';
import { getAlgorithmCode, ProgrammingLanguage } from '@/utils/algorithms/codeImplementations';
import UniversalInputSheet from '@/components/UniversalInputSheet';
import { CodeViewer, AICodeTutor, SegmentedControl, ViewMode } from '@/components/CodeHub';
import KnowledgeCheckModal from '@/components/KnowledgeCheckModal';
import XPGainAnimation from '@/components/XPGainAnimation';
import CyberTerminal from '@/components/CyberTerminal';
import SpeedController, { SpeedLevel, getSpeedDelay } from '@/components/SpeedController';
import CyberNumpad from '@/components/CyberNumpad';
import { getQuizForAlgorithm } from '@/utils/quizData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_PADDING = Spacing.lg * 2;
const BAR_GAP = 4;
const MIDNIGHT_BLACK = '#0a0e17';

type AlgorithmType = 'sorting' | 'searching';
type Step = SortStep | SearchStep;

// Type guard for SearchStep
function isSearchStep(step: Step | undefined | null): step is SearchStep {
  return step != null && 'target' in step && 'searchRange' in step;
}

// Type guard for SortStep
function isSortStep(step: Step | undefined | null): step is SortStep {
  return step != null && 'swapping' in step && !('target' in step);
}

// State colors
const STATE_COLORS = {
  default: Colors.accent,
  comparing: '#e5c07b', // Yellow
  swapping: '#56b6c2', // Cyan
  sorted: '#98c379', // Green
  pivot: Colors.neonPurple,
  found: Colors.neonLime,
  eliminated: Colors.gray600,
  activeRange: Colors.accent,
};

interface BarProps {
  value: number;
  maxValue: number;
  index: number;
  state: 'default' | 'comparing' | 'swapping' | 'sorted' | 'pivot' | 'found' | 'eliminated' | 'active-range';
  totalBars: number;
  showLabel?: boolean;
  isPassComplete?: boolean;
}

function Bar({ value, maxValue, index, state, totalBars, showLabel = true, isPassComplete }: BarProps) {
  const barWidth = (SCREEN_WIDTH - CANVAS_PADDING - BAR_GAP * (totalBars - 1)) / totalBars;
  const maxHeight = 180;
  const height = (value / maxValue) * maxHeight;

  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (state === 'comparing' || state === 'found') {
      scale.value = withSpring(1.08, { damping: 8, stiffness: 200 });
      glowOpacity.value = withTiming(0.6, { duration: 150 });
    } else if (state === 'swapping') {
      scale.value = withSequence(
        withSpring(1.15, { damping: 6, stiffness: 250 }),
        withSpring(1.08, { damping: 8, stiffness: 200 })
      );
      glowOpacity.value = withTiming(0.8, { duration: 100 });
    } else if (state === 'sorted') {
      scale.value = withSpring(1.02, { damping: 10, stiffness: 150 });
      glowOpacity.value = withTiming(0.3, { duration: 300 });
    } else {
      scale.value = withSpring(1, { damping: 10 });
      glowOpacity.value = withTiming(0, { duration: 200 });
    }

    if (isPassComplete) {
      scale.value = withSequence(
        withTiming(1.1, { duration: 100, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 100, easing: Easing.in(Easing.ease) })
      );
    }
  }, [state, isPassComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  const getBarColor = () => {
    switch (state) {
      case 'comparing':
        return STATE_COLORS.comparing;
      case 'swapping':
        return STATE_COLORS.swapping;
      case 'sorted':
        return STATE_COLORS.sorted;
      case 'pivot':
        return STATE_COLORS.pivot;
      case 'found':
        return STATE_COLORS.found;
      case 'eliminated':
        return STATE_COLORS.eliminated;
      case 'active-range':
        return STATE_COLORS.activeRange;
      default:
        return STATE_COLORS.default;
    }
  };

  const getLabelColor = () => {
    switch (state) {
      case 'comparing':
      case 'swapping':
      case 'sorted':
      case 'pivot':
      case 'found':
      case 'active-range':
        return MIDNIGHT_BLACK;
      case 'eliminated':
        return Colors.gray400;
      default:
        return MIDNIGHT_BLACK;
    }
  };

  const getGlowColor = () => {
    switch (state) {
      case 'comparing':
        return STATE_COLORS.comparing;
      case 'swapping':
        return STATE_COLORS.swapping;
      case 'sorted':
        return STATE_COLORS.sorted;
      default:
        return Colors.neonCyan;
    }
  };

  return (
    <Animated.View
      style={[
        styles.bar,
        animatedStyle,
        glowStyle,
        {
          width: Math.max(barWidth, 8),
          height,
          backgroundColor: getBarColor(),
          marginRight: index < totalBars - 1 ? BAR_GAP : 0,
          opacity: state === 'eliminated' ? 0.35 : 1,
          shadowColor: getGlowColor(),
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 8,
          elevation: state === 'swapping' || state === 'comparing' ? 8 : 0,
        },
      ]}
    >
      {barWidth > 20 && showLabel && (
        <Text style={[styles.barLabel, { color: getLabelColor() }]}>{value}</Text>
      )}
    </Animated.View>
  );
}

interface CodePanelProps {
  pseudocode: string[];
  pythonCode: string[];
  currentLine: number;
  showPython: boolean;
  onToggle: () => void;
}

function CodePanel({ pseudocode, pythonCode, currentLine, showPython, onToggle }: CodePanelProps) {
  const code = showPython ? pythonCode : pseudocode;

  return (
    <View style={styles.codePanel}>
      <View style={styles.codePanelHeader}>
        <TouchableOpacity
          style={[styles.codeTab, !showPython && styles.codeTabActive]}
          onPress={() => onToggle()}
        >
          <Text style={[styles.codeTabText, !showPython && styles.codeTabTextActive]}>
            Pseudocode
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.codeTab, showPython && styles.codeTabActive]}
          onPress={() => onToggle()}
        >
          <Text style={[styles.codeTabText, showPython && styles.codeTabTextActive]}>
            Python
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.codeContent} showsVerticalScrollIndicator={false}>
        {code.map((line, index) => (
          <View
            key={index}
            style={[
              styles.codeLine,
              index === currentLine && styles.codeLineHighlighted,
            ]}
          >
            <Text style={styles.codeLineNumber}>{index + 1}</Text>
            <Text
              style={[
                styles.codeText,
                index === currentLine && styles.codeTextHighlighted,
              ]}
            >
              {line}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

interface LegendProps {
  algorithmType: AlgorithmType;
}

function Legend({ algorithmType }: LegendProps) {
  const items = algorithmType === 'sorting'
    ? [
        { color: STATE_COLORS.comparing, label: 'Comparing' },
        { color: STATE_COLORS.swapping, label: 'Swapping' },
        { color: STATE_COLORS.sorted, label: 'Sorted' },
      ]
    : [
        { color: STATE_COLORS.activeRange, label: 'Active Range' },
        { color: STATE_COLORS.comparing, label: 'Checking' },
        { color: STATE_COLORS.found, label: 'Found' },
        { color: STATE_COLORS.eliminated, label: 'Eliminated' },
      ];

  return (
    <View style={styles.legend}>
      {items.map((item, index) => (
        <View key={index} style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: item.color }]} />
          <Text style={styles.legendText}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

export default function VisualizerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ algorithm: string }>();
  const algorithmId = params.algorithm || '';

  // Check if it's a DP algorithm - redirect will happen via useEffect
  const isDPAlgorithm = algorithmId && typeof dpAlgorithms === 'object' && algorithmId in dpAlgorithms;

  const { visualizationSettings, setVisualizationSpeed, completeAlgorithm, addXP, recordQuizScore, userProgress } = useAppStore();

  // Determine algorithm type and get algorithm
  const algorithmType: AlgorithmType = algorithmId in searchingAlgorithms ? 'searching' : 'sorting';

  const sortingAlgorithm = algorithmType === 'sorting'
    ? sortingAlgorithms[algorithmId as SortingAlgorithmKey]
    : null;

  const searchingAlgorithm = algorithmType === 'searching'
    ? searchingAlgorithms[algorithmId as SearchingAlgorithmKey]
    : null;

  const algorithm = sortingAlgorithm || searchingAlgorithm;
  const algorithmCode = getAlgorithmCode(algorithmId);

  const [array, setArray] = useState<number[]>([]);
  const [target, setTarget] = useState<number>(0);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPython, setShowPython] = useState(false);
  const [showInputDashboard, setShowInputDashboard] = useState(false);
  const [showNumpad, setShowNumpad] = useState(false);

  // Enhanced state
  const [speedLevel, setSpeedLevel] = useState<SpeedLevel>('normal');
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const [memoryAccesses, setMemoryAccesses] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  // Code Hub state
  const [viewMode, setViewMode] = useState<ViewMode>('visualizer');
  const [showAITutor, setShowAITutor] = useState(false);
  const [aiTutorCode, setAITutorCode] = useState('');
  const [aiTutorLanguage, setAITutorLanguage] = useState<ProgrammingLanguage>('python');

  // Quiz and XP state
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [hasCompletedVisualization, setHasCompletedVisualization] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);
  const algorithmQuiz = getQuizForAlgorithm(algorithmId);

  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStep = steps[currentStepIndex];
  const maxValue = Math.max(...(currentStep?.array || array), 1);

  // Redirect DP algorithms to the DP visualizer
  useEffect(() => {
    if (isDPAlgorithm && algorithmId) {
      router.replace(`/visualizer/dp?algorithm=${algorithmId}` as any);
    }
  }, [isDPAlgorithm, algorithmId, router]);

  // Initialize algorithm
  useEffect(() => {
    if (algorithm && !isDPAlgorithm) {
      resetVisualization();
    }
  }, [algorithmId, isDPAlgorithm]);

  const resetVisualization = useCallback((customArray?: number[], customTarget?: number) => {
    let newArray: number[];
    let newTarget: number;

    if (algorithmType === 'searching') {
      if (customArray && customTarget !== undefined) {
        newArray = customArray;
        newTarget = customTarget;
      } else {
        const generated = generateRandomArrayForSearch(visualizationSettings.arraySize);
        newArray = generated.array;
        newTarget = generated.target;
      }
      setArray(newArray);
      setTarget(newTarget);

      if (searchingAlgorithm) {
        const generator = searchingAlgorithm.generator(newArray, newTarget);
        const allSteps: SearchStep[] = [];
        for (const step of generator) {
          allSteps.push(step);
        }
        setSteps(allSteps);
      }
    } else {
      newArray = customArray || generateRandomArray(visualizationSettings.arraySize);
      setArray(newArray);

      if (sortingAlgorithm) {
        const generator = sortingAlgorithm.generator(newArray);
        const allSteps: SortStep[] = [];
        for (const step of generator) {
          allSteps.push(step);
        }
        setSteps(allSteps);
      }
    }

    setCurrentStepIndex(0);
    setComparisons(0);
    setSwaps(0);
    setMemoryAccesses(0);
    setLogs([]);
    setIsPlaying(false);
    setHasCompletedVisualization(false);
    setEarnedXP(0);
    setShowLevelUp(false);

    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
    }
  }, [algorithm, algorithmType, sortingAlgorithm, searchingAlgorithm, visualizationSettings.arraySize]);

  // Update stats based on current step
  const updateStats = useCallback((step: Step) => {
    if (isSearchStep(step)) {
      if (step.comparing && step.comparing.length > 0) {
        setComparisons((c) => c + 1);
        setMemoryAccesses((m) => m + step.comparing!.length);
      }
    } else if (isSortStep(step)) {
      if (step.comparing && step.comparing.length > 0) {
        setComparisons((c) => c + 1);
      }
      if (step.swapping && step.swapping.length > 0) {
        setSwaps((s) => s + 1);
      }
      setMemoryAccesses((m) => m + 2); // Each comparison/swap accesses 2 elements
    }

    // Add log entry
    setLogs((prevLogs) => [...prevLogs.slice(-10), step.operation]);
  }, []);

  // Auto-play with dynamic speed
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
            updateStats(step);

            // Haptic feedback
            if (isSearchStep(step) && step.comparing && step.comparing.length > 0) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } else if (isSortStep(step) && (step.swapping?.length > 0 || step.comparing?.length > 0)) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }

          if (next >= steps.length - 1) {
            setIsPlaying(false);
            if (!hasCompletedVisualization) {
              setHasCompletedVisualization(true);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

              if (algorithmQuiz) {
                setTimeout(() => setShowQuizModal(true), 500);
              } else {
                completeAlgorithm(algorithmId, 50);
                addXP(50);
                setEarnedXP(50);
                setTimeout(() => setShowXPAnimation(true), 300);
              }
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
  }, [isPlaying, currentStepIndex, steps.length, speedLevel]);

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
        updateStats(step);
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

  const handleInputApply = (newArray: number[], newTarget?: number) => {
    resetVisualization(newArray, newTarget);
  };

  const handleNumpadEntry = (value: number) => {
    // Add number to array via numpad
    const newArray = [...array, value];
    resetVisualization(newArray, target);
  };

  const handleAskAI = (code: string, language: ProgrammingLanguage) => {
    setAITutorCode(code);
    setAITutorLanguage(language);
    setShowAITutor(true);
  };

  const handleQuizComplete = (score: number, xpEarned: number, correctAnswers: number, totalQuestions: number) => {
    const baseVisualizationXP = 50;
    const totalXP = baseVisualizationXP + xpEarned;

    recordQuizScore(algorithmId, score, correctAnswers, totalQuestions);

    const currentLevel = userProgress.level;
    completeAlgorithm(algorithmId, totalXP);
    addXP(totalXP);
    setEarnedXP(totalXP);

    const newTotalXP = userProgress.totalXP + totalXP;
    const calculatedNewLevel = Math.floor(newTotalXP / 500) + 1;
    if (calculatedNewLevel > currentLevel) {
      setShowLevelUp(true);
      setNewLevel(calculatedNewLevel);
    }

    setShowQuizModal(false);
    setTimeout(() => setShowXPAnimation(true), 300);
  };

  const handleXPAnimationComplete = () => {
    setShowXPAnimation(false);
  };

  const getBarState = (index: number): BarProps['state'] => {
    if (!currentStep) return 'default';

    if (isSearchStep(currentStep)) {
      if (currentStep.found && currentStep.comparing?.includes(index)) return 'found';
      if (currentStep.eliminated?.includes(index)) return 'eliminated';
      if (currentStep.comparing?.includes(index)) return 'comparing';
      if (index >= currentStep.searchRange.left && index <= currentStep.searchRange.right) {
        return 'active-range';
      }
      return 'default';
    }

    if (isSortStep(currentStep)) {
      if (currentStep.sorted?.includes(index)) return 'sorted';
      if (currentStep.pivot === index) return 'pivot';
      if (currentStep.swapping?.includes(index)) return 'swapping';
      if (currentStep.comparing?.includes(index)) return 'comparing';
    }

    return 'default';
  };

  // Show loading state while redirecting to DP visualizer
  if (isDPAlgorithm) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="analytics" size={64} color={Colors.neonPurple} />
          <Text style={[styles.errorText, { color: Colors.neonPurple }]}>Loading DP Visualizer...</Text>
          <Text style={styles.errorSubtext}>Redirecting to the Dynamic Programming visualizer.</Text>
        </View>
      </View>
    );
  }

  if (!algorithm) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={Colors.alertCoral} />
          <Text style={styles.errorText}>Algorithm not found</Text>
          <Text style={styles.errorSubtext}>The algorithm &quot;{algorithmId}&quot; is not available.</Text>
          <TouchableOpacity style={styles.backToLearnButton} onPress={() => router.back()}>
            <Text style={styles.backToLearnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isFound = isSearchStep(currentStep) && currentStep?.found;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {algorithm.info.name}
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.numpadButton}
            onPress={() => setShowNumpad(true)}
          >
            <Ionicons name="keypad" size={20} color={Colors.neonLime} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowInputDashboard(true)}
          >
            <Ionicons name="settings" size={22} color={Colors.gray400} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Segmented Control */}
      {algorithmCode && (
        <SegmentedControl
          selectedMode={viewMode}
          onModeChange={setViewMode}
        />
      )}

      {viewMode === 'visualizer' ? (
        <>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Legend */}
            <Legend algorithmType={algorithmType} />

            {/* Interactive Canvas */}
            <Animated.View
              entering={FadeIn}
              style={[styles.canvasContainer, isFound && styles.canvasContainerFound]}
            >
              <View style={styles.canvas}>
                {(currentStep?.array || array).map((value, index) => (
                  <Bar
                    key={index}
                    value={value}
                    maxValue={maxValue}
                    index={index}
                    state={getBarState(index)}
                    totalBars={array.length}
                  />
                ))}
              </View>

              {/* Search Range Indicator */}
              {algorithmType === 'searching' && isSearchStep(currentStep) && (
                <View style={styles.searchRangeIndicator}>
                  <Text style={styles.searchRangeText}>
                    Search Range: [{currentStep.searchRange.left}, {currentStep.searchRange.right}]
                  </Text>
                  {currentStep.currentIndex >= 0 && (
                    <Text style={styles.currentIndexText}>
                      Checking Index: {currentStep.currentIndex}
                    </Text>
                  )}
                </View>
              )}
            </Animated.View>

            {/* Cyber Terminal */}
            <CyberTerminal
              currentExplanation={currentStep?.operation || 'Ready to start...'}
              comparisons={comparisons}
              swaps={swaps}
              memoryAccesses={memoryAccesses}
              currentStep={currentStepIndex + 1}
              totalSteps={steps.length}
              algorithmName={algorithm.info.name}
              logs={logs}
              maxLogs={5}
            />

            {/* Code Panel */}
            {visualizationSettings.showCode && (
              <CodePanel
                pseudocode={algorithm.info.pseudocode}
                pythonCode={algorithm.info.pythonCode}
                currentLine={currentStep?.line || 0}
                showPython={showPython}
                onToggle={() => setShowPython(!showPython)}
              />
            )}
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
        </>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {algorithmCode && (
            <Animated.View entering={FadeIn}>
              <CodeViewer
                algorithmCode={algorithmCode}
                onAskAI={handleAskAI}
                isAILoading={false}
              />
            </Animated.View>
          )}
        </ScrollView>
      )}

      {/* Universal Input Sheet */}
      <UniversalInputSheet
        visible={showInputDashboard}
        onClose={() => setShowInputDashboard(false)}
        onApply={handleInputApply}
        algorithmType={algorithmType}
        currentArray={array}
        currentTarget={target}
        maxSize={15}
        minSize={5}
      />

      {/* Cyber Numpad */}
      <CyberNumpad
        visible={showNumpad}
        onClose={() => setShowNumpad(false)}
        onNumberEnter={handleNumpadEntry}
        currentArray={array}
        maxArraySize={15}
        title="Add Numbers"
      />

      {/* AI Code Tutor Modal */}
      {algorithmCode && (
        <AICodeTutor
          visible={showAITutor}
          onClose={() => setShowAITutor(false)}
          algorithmName={algorithmCode.name}
          code={aiTutorCode || algorithmCode.implementations.python}
          language={aiTutorLanguage}
          timeComplexity={algorithmCode.timeComplexity}
          spaceComplexity={algorithmCode.spaceComplexity}
        />
      )}

      {/* Knowledge Check Quiz Modal */}
      {algorithmQuiz && (
        <KnowledgeCheckModal
          visible={showQuizModal}
          onClose={() => {
            setShowQuizModal(false);
            if (!earnedXP) {
              completeAlgorithm(algorithmId, 50);
              addXP(50);
              setEarnedXP(50);
              setTimeout(() => setShowXPAnimation(true), 300);
            }
          }}
          quiz={algorithmQuiz}
          onComplete={handleQuizComplete}
        />
      )}

      {/* XP Gain Animation */}
      <XPGainAnimation
        visible={showXPAnimation}
        xpAmount={earnedXP}
        onComplete={handleXPAnimationComplete}
        message={algorithmQuiz ? 'Quiz Completed!' : 'Visualization Complete!'}
        showLevelUp={showLevelUp}
        newLevel={newLevel}
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
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  numpadButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neonLime + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neonLime + '40',
  },
  settingsButton: {
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
  canvasContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  canvasContainerFound: {
    borderWidth: 2,
    borderColor: Colors.success,
  },
  canvas: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 200,
    paddingTop: Spacing.md,
  },
  bar: {
    borderRadius: BorderRadius.sm,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '700',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 1,
  },
  searchRangeIndicator: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray700,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchRangeText: {
    fontSize: FontSizes.sm,
    color: Colors.accent,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  currentIndexText: {
    fontSize: FontSizes.sm,
    color: Colors.logicGold,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  codePanel: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.small,
  },
  codePanelHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.midnightBlueDark,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray700,
  },
  codeTab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  codeTabActive: {
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 2,
    borderBottomColor: Colors.accent,
  },
  codeTabText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.gray500,
  },
  codeTabTextActive: {
    color: Colors.accent,
  },
  codeContent: {
    maxHeight: 200,
    padding: Spacing.sm,
  },
  codeLine: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  codeLineHighlighted: {
    backgroundColor: Colors.accent + '30',
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
  backToLearnButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xl,
  },
  backToLearnText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.background,
  },
});
