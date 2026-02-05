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
import { getAlgorithmCode, ProgrammingLanguage } from '@/utils/algorithms/codeImplementations';
import UniversalInputSheet from '@/components/UniversalInputSheet';
import { CodeViewer, AICodeTutor, SegmentedControl, ViewMode } from '@/components/CodeHub';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_PADDING = Spacing.lg * 2;
const BAR_GAP = 4;

type AlgorithmType = 'sorting' | 'searching';
type Step = SortStep | SearchStep;

// Type guard for SearchStep - safely handles undefined/null
function isSearchStep(step: Step | undefined | null): step is SearchStep {
  return step != null && 'target' in step && 'searchRange' in step;
}

// Type guard for SortStep - safely handles undefined/null
function isSortStep(step: Step | undefined | null): step is SortStep {
  return step != null && 'swapping' in step && !('target' in step);
}

interface BarProps {
  value: number;
  maxValue: number;
  index: number;
  state: 'default' | 'comparing' | 'swapping' | 'sorted' | 'pivot' | 'found' | 'eliminated' | 'active-range';
  totalBars: number;
  showLabel?: boolean;
}

function Bar({ value, maxValue, index, state, totalBars, showLabel = true }: BarProps) {
  const barWidth = (SCREEN_WIDTH - CANVAS_PADDING - BAR_GAP * (totalBars - 1)) / totalBars;
  const maxHeight = 180;
  const height = (value / maxValue) * maxHeight;

  const animatedStyle = useAnimatedStyle(() => {
    let scale = 1;
    if (state === 'comparing' || state === 'found') scale = 1.05;
    if (state === 'swapping') scale = 1.1;

    return {
      transform: [{ scaleY: withSpring(scale, { damping: 10 }) }],
    };
  });

  const getBarColor = () => {
    switch (state) {
      case 'comparing':
        return Colors.logicGold;
      case 'swapping':
        return Colors.alertCoral;
      case 'sorted':
        return Colors.success;
      case 'pivot':
        return Colors.info;
      case 'found':
        return Colors.success;
      case 'eliminated':
        return Colors.gray600;
      case 'active-range':
        return Colors.actionTeal;
      default:
        return Colors.actionTeal;
    }
  };

  return (
    <Animated.View
      style={[
        styles.bar,
        animatedStyle,
        {
          width: Math.max(barWidth, 8),
          height,
          backgroundColor: getBarColor(),
          marginRight: index < totalBars - 1 ? BAR_GAP : 0,
          opacity: state === 'eliminated' ? 0.4 : 1,
        },
      ]}
    >
      {barWidth > 20 && showLabel && (
        <Text style={styles.barLabel}>{value}</Text>
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

interface ComplexityTrackerProps {
  operationsCount: number;
  timeComplexity: string;
  spaceComplexity: string;
  arraySize: number;
  algorithmType: AlgorithmType;
  target?: number;
}

function ComplexityTracker({
  operationsCount,
  timeComplexity,
  spaceComplexity,
  arraySize,
  algorithmType,
  target,
}: ComplexityTrackerProps) {
  return (
    <View style={styles.complexityTracker}>
      <Text style={styles.complexityTitle}>Complexity Live-Tracker</Text>
      <View style={styles.complexityStats}>
        <View style={styles.complexityStat}>
          <Text style={styles.complexityLabel}>Time:</Text>
          <Text style={styles.complexityValue}>{timeComplexity}</Text>
        </View>
        <View style={styles.complexityStat}>
          <Text style={styles.complexityLabel}>Space:</Text>
          <Text style={styles.complexityValue}>{spaceComplexity}</Text>
        </View>
        <View style={styles.complexityStat}>
          <Text style={styles.complexityLabel}>Operations:</Text>
          <Text style={[styles.complexityValue, { color: Colors.logicGold }]}>
            {operationsCount}
          </Text>
        </View>
        {algorithmType === 'searching' && target !== undefined && (
          <View style={styles.complexityStat}>
            <Text style={styles.complexityLabel}>Target:</Text>
            <Text style={[styles.complexityValue, { color: Colors.alertCoral }]}>
              {target}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

interface InsightPanelProps {
  operation: string;
  algorithmType: AlgorithmType;
  found?: boolean;
}

function InsightPanel({ operation, algorithmType, found }: InsightPanelProps) {
  return (
    <View style={[styles.insightPanel, found && styles.insightPanelFound]}>
      <View style={styles.insightHeader}>
        <Ionicons
          name={found ? "checkmark-circle" : "information-circle"}
          size={20}
          color={found ? Colors.success : Colors.actionTeal}
        />
        <Text style={styles.insightTitle}>
          {found ? "Target Found!" : "Live Commentary"}
        </Text>
      </View>
      <Text style={[styles.insightText, found && styles.insightTextFound]}>
        {operation}
      </Text>
    </View>
  );
}

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStepBackward: () => void;
  onStepForward: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  canStepBackward: boolean;
  canStepForward: boolean;
}

function PlaybackControls({
  isPlaying,
  onPlay,
  onPause,
  onStepBackward,
  onStepForward,
  onReset,
  speed,
  onSpeedChange,
  canStepBackward,
  canStepForward,
}: PlaybackControlsProps) {
  return (
    <View style={styles.playbackControls}>
      <View style={styles.playbackButtons}>
        <TouchableOpacity
          style={[styles.playbackButton, styles.playbackButtonSmall]}
          onPress={onReset}
        >
          <Ionicons name="refresh" size={20} color={Colors.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playbackButton, styles.playbackButtonSmall, !canStepBackward && styles.playbackButtonDisabled]}
          onPress={onStepBackward}
          disabled={!canStepBackward}
        >
          <Ionicons name="play-skip-back" size={20} color={canStepBackward ? Colors.white : Colors.gray600} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playbackButton, styles.playbackButtonMain]}
          onPress={isPlaying ? onPause : onPlay}
        >
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color={Colors.midnightBlue} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playbackButton, styles.playbackButtonSmall, !canStepForward && styles.playbackButtonDisabled]}
          onPress={onStepForward}
          disabled={!canStepForward}
        >
          <Ionicons name="play-skip-forward" size={20} color={canStepForward ? Colors.white : Colors.gray600} />
        </TouchableOpacity>

        <View style={styles.speedControl}>
          <Text style={styles.speedLabel}>Speed</Text>
          <View style={styles.speedButtons}>
            <TouchableOpacity
              style={styles.speedButton}
              onPress={() => onSpeedChange(Math.max(0.5, speed - 0.5))}
            >
              <Ionicons name="remove" size={16} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.speedValue}>{speed}x</Text>
            <TouchableOpacity
              style={styles.speedButton}
              onPress={() => onSpeedChange(Math.min(3, speed + 0.5))}
            >
              <Ionicons name="add" size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function VisualizerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ algorithm: string }>();
  const algorithmId = params.algorithm;

  const { visualizationSettings, setVisualizationSpeed, completeAlgorithm, addXP } = useAppStore();

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
  const [operationsCount, setOperationsCount] = useState(0);
  const [showInputDashboard, setShowInputDashboard] = useState(false);

  // Code Hub state
  const [viewMode, setViewMode] = useState<ViewMode>('visualizer');
  const [showAITutor, setShowAITutor] = useState(false);
  const [aiTutorCode, setAITutorCode] = useState('');
  const [aiTutorLanguage, setAITutorLanguage] = useState<ProgrammingLanguage>('python');
  const [isAILoading, setIsAILoading] = useState(false);

  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStep = steps[currentStepIndex];
  const maxValue = Math.max(...(currentStep?.array || array), 1);

  // Initialize algorithm
  useEffect(() => {
    if (algorithm) {
      resetVisualization();
    }
  }, [algorithmId]);

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
    setOperationsCount(0);
    setIsPlaying(false);

    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
    }
  }, [algorithm, algorithmType, sortingAlgorithm, searchingAlgorithm, visualizationSettings.arraySize]);

  // Auto-play
  useEffect(() => {
    if (isPlaying && currentStepIndex < steps.length - 1) {
      playIntervalRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          const next = prev + 1;
          setOperationsCount((count) => count + 1);

          // Trigger haptic feedback on comparison/action
          const step = steps[next];
          if (step) {
            if (isSearchStep(step) && step.comparing.length > 0) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } else if (isSortStep(step) && (step.swapping?.length > 0 || step.comparing?.length > 0)) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }

          if (next >= steps.length - 1) {
            setIsPlaying(false);
            // Award XP on completion
            completeAlgorithm(algorithmId, 50);
            addXP(50);
          }
          return Math.min(next, steps.length - 1);
        });
      }, 1000 / visualizationSettings.speed);
    } else if (!isPlaying && playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, currentStepIndex, steps.length, visualizationSettings.speed]);

  const handlePlay = () => {
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
      setCurrentStepIndex((prev) => prev + 1);
      setOperationsCount((count) => count + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleStepBackward = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      setOperationsCount((count) => Math.max(0, count - 1));
    }
  };

  const handleInputApply = (newArray: number[], newTarget?: number) => {
    resetVisualization(newArray, newTarget);
  };

  const handleAskAI = (code: string, language: ProgrammingLanguage) => {
    setAITutorCode(code);
    setAITutorLanguage(language);
    setShowAITutor(true);
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

  if (!algorithm) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={Colors.alertCoral} />
          <Text style={styles.errorText}>Algorithm not found</Text>
          <Text style={styles.errorSubtext}>The algorithm "{algorithmId}" is not available.</Text>
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
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {algorithm.info.name}
        </Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setShowInputDashboard(true)}
        >
          <Ionicons name="settings" size={22} color={Colors.gray400} />
        </TouchableOpacity>
      </Animated.View>

      {/* Segmented Control */}
      {algorithmCode && (
        <SegmentedControl
          selectedMode={viewMode}
          onModeChange={setViewMode}
        />
      )}

      {viewMode === 'visualizer' ? (
        // Visualizer View
        <>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
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

              {/* Search Range Indicator for searching algorithms */}
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

            {/* Insight Panel */}
            {currentStep && (
              <InsightPanel
                operation={currentStep.operation}
                algorithmType={algorithmType}
                found={isFound}
              />
            )}

            {/* Complexity Tracker */}
            {visualizationSettings.showComplexity && (
              <ComplexityTracker
                operationsCount={operationsCount}
                timeComplexity={algorithm.info.timeComplexity.average}
                spaceComplexity={algorithm.info.spaceComplexity}
                arraySize={array.length}
                algorithmType={algorithmType}
                target={algorithmType === 'searching' ? target : undefined}
              />
            )}

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

          {/* Playback Controls */}
          <PlaybackControls
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onPause={handlePause}
            onStepBackward={handleStepBackward}
            onStepForward={handleStepForward}
            onReset={() => resetVisualization()}
            speed={visualizationSettings.speed}
            onSpeedChange={setVisualizationSpeed}
            canStepBackward={currentStepIndex > 0}
            canStepForward={currentStepIndex < steps.length - 1}
          />
        </>
      ) : (
        // Code Hub View
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
                isAILoading={isAILoading}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.midnightBlue,
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
    color: Colors.white,
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
  },
  canvasContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
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
    fontSize: 8,
    fontWeight: '600',
    color: Colors.white,
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
    color: Colors.actionTeal,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  currentIndexText: {
    fontSize: FontSizes.sm,
    color: Colors.logicGold,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  insightPanel: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.actionTeal,
    ...Shadows.small,
  },
  insightPanelFound: {
    borderLeftColor: Colors.success,
    backgroundColor: Colors.success + '15',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  insightTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.actionTeal,
    marginLeft: Spacing.sm,
  },
  insightText: {
    fontSize: FontSizes.md,
    color: Colors.gray300,
    lineHeight: 22,
  },
  insightTextFound: {
    color: Colors.success,
    fontWeight: '600',
  },
  complexityTracker: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  complexityTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.actionTeal,
    marginBottom: Spacing.md,
  },
  complexityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  complexityStat: {
    alignItems: 'center',
    minWidth: 70,
  },
  complexityLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    marginBottom: 2,
  },
  complexityValue: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.white,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  codePanel: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
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
    borderBottomColor: Colors.actionTeal,
  },
  codeTabText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.gray500,
  },
  codeTabTextActive: {
    color: Colors.actionTeal,
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
    backgroundColor: Colors.actionTeal + '30',
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
    color: Colors.white,
    fontWeight: '500',
  },
  playbackControls: {
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.gray700,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  playbackButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  playbackButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
  },
  playbackButtonSmall: {
    width: 44,
    height: 44,
    backgroundColor: Colors.gray700,
  },
  playbackButtonMain: {
    width: 56,
    height: 56,
    backgroundColor: Colors.actionTeal,
    marginHorizontal: Spacing.sm,
  },
  playbackButtonDisabled: {
    backgroundColor: Colors.gray800,
  },
  speedControl: {
    marginLeft: Spacing.lg,
    alignItems: 'center',
  },
  speedLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    marginBottom: 4,
  },
  speedButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray700,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xs,
  },
  speedButton: {
    padding: Spacing.xs,
  },
  speedValue: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.white,
    minWidth: 36,
    textAlign: 'center',
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
    backgroundColor: Colors.actionTeal,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xl,
  },
  backToLearnText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.midnightBlue,
  },
});
