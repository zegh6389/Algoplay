// Tree Visualizer Screen - BST, Heap, Traversals with Physics Animations
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import TreeVisualizer from '@/components/TreeVisualizer';
import ArrayVisualizer from '@/components/ArrayVisualizer';
import InsightPanel from '@/components/InsightPanel';
import UniversalInputSheet from '@/components/UniversalInputSheet';
import {
  TreeNode,
  TreeStep,
  treeAlgorithms,
  treeAlgorithmGenerators,
  TreeAlgorithmKey,
  calculateTreePositions,
  generateSampleTreeData,
  bstInsertGenerator,
  inorderTraversalGenerator,
  preorderTraversalGenerator,
  postorderTraversalGenerator,
  bfsTraversalGenerator,
  buildMaxHeapGenerator,
  buildTreeFromArray,
  cloneTree,
} from '@/utils/algorithms/trees';
import { useAppStore } from '@/store/useAppStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type AlgorithmMode = 'bst-insert' | 'inorder' | 'preorder' | 'postorder' | 'bfs' | 'build-heap';

interface StepHistoryItem {
  step: number;
  operation: string;
  commentary: string;
  timestamp: number;
}

const algorithmOptions: { key: AlgorithmMode; label: string; category: 'build' | 'traverse' }[] = [
  { key: 'bst-insert', label: 'BST Build', category: 'build' },
  { key: 'build-heap', label: 'Build Heap', category: 'build' },
  { key: 'inorder', label: 'In-order', category: 'traverse' },
  { key: 'preorder', label: 'Pre-order', category: 'traverse' },
  { key: 'postorder', label: 'Post-order', category: 'traverse' },
  { key: 'bfs', label: 'Level-order', category: 'traverse' },
];

export default function TreeVisualizerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { visualizationSettings, setVisualizationSpeed, addXP, completeAlgorithm } = useAppStore();

  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmMode>('bst-insert');
  const [inputValues, setInputValues] = useState<number[]>(generateSampleTreeData(8));
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [steps, setSteps] = useState<TreeStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInputDashboard, setShowInputDashboard] = useState(false);
  const [stepHistory, setStepHistory] = useState<StepHistoryItem[]>([]);

  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStep = steps[currentStepIndex];
  const algorithmInfo = treeAlgorithms[selectedAlgorithm] || treeAlgorithms['bst-insert'];

  // Initialize visualization
  useEffect(() => {
    resetVisualization();
  }, [selectedAlgorithm, inputValues]);

  const resetVisualization = useCallback(() => {
    setIsPlaying(false);
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
    }

    const allSteps: TreeStep[] = [];

    if (selectedAlgorithm === 'bst-insert') {
      const generator = bstInsertGenerator(inputValues);
      for (const step of generator) {
        allSteps.push(step);
      }
    } else if (selectedAlgorithm === 'build-heap') {
      const generator = buildMaxHeapGenerator(inputValues);
      for (const step of generator) {
        allSteps.push(step as TreeStep);
      }
    } else {
      // For traversals, first build the tree
      const buildGenerator = bstInsertGenerator(inputValues);
      let lastBuildStep: TreeStep | null = null;
      for (const step of buildGenerator) {
        lastBuildStep = step;
      }

      if (lastBuildStep?.tree) {
        // Now generate traversal steps
        let traversalGenerator: Generator<TreeStep>;
        const rootTree = lastBuildStep.tree;
        calculateTreePositions(rootTree, SCREEN_WIDTH - 64);

        switch (selectedAlgorithm) {
          case 'inorder':
            traversalGenerator = inorderTraversalGenerator(rootTree, rootTree);
            break;
          case 'preorder':
            traversalGenerator = preorderTraversalGenerator(rootTree, rootTree);
            break;
          case 'postorder':
            traversalGenerator = postorderTraversalGenerator(rootTree, rootTree);
            break;
          case 'bfs':
            traversalGenerator = bfsTraversalGenerator(rootTree);
            break;
          default:
            traversalGenerator = inorderTraversalGenerator(rootTree, rootTree);
        }

        for (const step of traversalGenerator) {
          allSteps.push(step);
        }
      }
    }

    setSteps(allSteps);
    setCurrentStepIndex(0);
    setStepHistory([]);

    if (allSteps.length > 0) {
      const firstStep = allSteps[0];
      if (firstStep.tree) {
        calculateTreePositions(firstStep.tree, SCREEN_WIDTH - 64);
      }
      setTree(firstStep.tree);
      setStepHistory([{
        step: 1,
        operation: firstStep.operation,
        commentary: firstStep.commentary,
        timestamp: Date.now(),
      }]);
    }
  }, [selectedAlgorithm, inputValues]);

  // Auto-play
  useEffect(() => {
    if (isPlaying && currentStepIndex < steps.length - 1) {
      playIntervalRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          const next = prev + 1;
          const step = steps[next];

          if (step) {
            if (step.tree) {
              calculateTreePositions(step.tree, SCREEN_WIDTH - 64);
            }
            setTree(step.tree);

            setStepHistory((history) => [
              ...history,
              {
                step: next + 1,
                operation: step.operation,
                commentary: step.commentary,
                timestamp: Date.now(),
              },
            ]);

            // Haptic feedback
            if (step.operation === 'swap' || step.operation === 'swapping' || step.operation === 'insert') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }

          if (next >= steps.length - 1) {
            setIsPlaying(false);
            addXP(30);
            completeAlgorithm(selectedAlgorithm, 30);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }

          return Math.min(next, steps.length - 1);
        });
      }, 1200 / visualizationSettings.speed);
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
      const next = currentStepIndex + 1;
      const step = steps[next];

      if (step) {
        if (step.tree) {
          calculateTreePositions(step.tree, SCREEN_WIDTH - 64);
        }
        setTree(step.tree);
        setStepHistory((history) => [
          ...history,
          {
            step: next + 1,
            operation: step.operation,
            commentary: step.commentary,
            timestamp: Date.now(),
          },
        ]);
      }

      setCurrentStepIndex(next);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleStepBackward = () => {
    if (currentStepIndex > 0) {
      const prev = currentStepIndex - 1;
      const step = steps[prev];

      if (step) {
        if (step.tree) {
          calculateTreePositions(step.tree, SCREEN_WIDTH - 64);
        }
        setTree(step.tree);
      }

      setCurrentStepIndex(prev);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleStepSelect = (step: number) => {
    const index = step - 1;
    if (index >= 0 && index < steps.length) {
      setIsPlaying(false);
      const selectedStep = steps[index];

      if (selectedStep) {
        if (selectedStep.tree) {
          calculateTreePositions(selectedStep.tree, SCREEN_WIDTH - 64);
        }
        setTree(selectedStep.tree);
      }

      setCurrentStepIndex(index);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleInputSubmit = (data: number[], _target?: number) => {
    setInputValues(data);
    setShowInputDashboard(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          Tree Visualizer
        </Text>
        <TouchableOpacity style={styles.inputButton} onPress={() => setShowInputDashboard(true)}>
          <Ionicons name="keypad" size={20} color={Colors.accent} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Algorithm Selector */}
        <View style={styles.algorithmSelector}>
          <Text style={styles.selectorLabel}>Build</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.algorithmButtons}>
              {algorithmOptions
                .filter((opt) => opt.category === 'build')
                .map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.algorithmButton,
                      selectedAlgorithm === opt.key && styles.algorithmButtonActive,
                    ]}
                    onPress={() => setSelectedAlgorithm(opt.key)}
                  >
                    <Text
                      style={[
                        styles.algorithmButtonText,
                        selectedAlgorithm === opt.key && styles.algorithmButtonTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </ScrollView>

          <Text style={[styles.selectorLabel, { marginTop: Spacing.sm }]}>Traverse</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.algorithmButtons}>
              {algorithmOptions
                .filter((opt) => opt.category === 'traverse')
                .map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.algorithmButton,
                      selectedAlgorithm === opt.key && styles.algorithmButtonActive,
                    ]}
                    onPress={() => setSelectedAlgorithm(opt.key)}
                  >
                    <Text
                      style={[
                        styles.algorithmButtonText,
                        selectedAlgorithm === opt.key && styles.algorithmButtonTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </ScrollView>
        </View>

        {/* Tree Visualization */}
        <View style={styles.visualizationContainer}>
          <TreeVisualizer
            root={tree}
            highlightedNodeIds={currentStep?.currentNode ? [currentStep.currentNode.id] : []}
            pathNodeIds={currentStep?.pathNodes || []}
            visitedNodeIds={currentStep?.visitedNodes || []}
            showGlowingTrail={true}
          />
        </View>

        {/* Array Representation */}
        {currentStep?.array && currentStep.array.length > 0 && (
          <View style={styles.arraySection}>
            <Text style={styles.arraySectionTitle}>
              {selectedAlgorithm.includes('heap') ? 'Heap Array' : 'Traversal Result'}
            </Text>
            <ArrayVisualizer
              array={currentStep.array}
              highlightedIndices={currentStep.highlightedIndices || []}
              showIndices={true}
              showTreeConnections={selectedAlgorithm.includes('heap')}
            />
          </View>
        )}

        {/* Insight Panel */}
        {currentStep && (
          <InsightPanel
            currentStep={currentStepIndex + 1}
            totalSteps={steps.length}
            currentCommentary={currentStep.commentary}
            operation={currentStep.operation}
            stepHistory={stepHistory}
            isPlaying={isPlaying}
            onStepSelect={handleStepSelect}
            complexityInfo={{
              time: algorithmInfo.timeComplexity.average,
              space: algorithmInfo.spaceComplexity,
              operations: currentStepIndex + 1,
            }}
          />
        )}
      </ScrollView>

      {/* Playback Controls */}
      <View style={styles.playbackControls}>
        <View style={styles.playbackButtons}>
          <TouchableOpacity
            style={[styles.playbackButton, styles.playbackButtonSmall]}
            onPress={resetVisualization}
          >
            <Ionicons name="refresh" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.playbackButton,
              styles.playbackButtonSmall,
              currentStepIndex === 0 && styles.playbackButtonDisabled,
            ]}
            onPress={handleStepBackward}
            disabled={currentStepIndex === 0}
          >
            <Ionicons
              name="play-skip-back"
              size={20}
              color={currentStepIndex > 0 ? Colors.textPrimary : Colors.gray600}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.playbackButton, styles.playbackButtonMain]}
            onPress={isPlaying ? handlePause : handlePlay}
          >
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color={Colors.background} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.playbackButton,
              styles.playbackButtonSmall,
              currentStepIndex >= steps.length - 1 && styles.playbackButtonDisabled,
            ]}
            onPress={handleStepForward}
            disabled={currentStepIndex >= steps.length - 1}
          >
            <Ionicons
              name="play-skip-forward"
              size={20}
              color={currentStepIndex < steps.length - 1 ? Colors.textPrimary : Colors.gray600}
            />
          </TouchableOpacity>

          <View style={styles.speedControl}>
            <Text style={styles.speedLabel}>Speed</Text>
            <View style={styles.speedButtons}>
              <TouchableOpacity
                style={styles.speedButton}
                onPress={() => setVisualizationSpeed(Math.max(0.5, visualizationSettings.speed - 0.5))}
              >
                <Ionicons name="remove" size={16} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.speedValue}>{visualizationSettings.speed}x</Text>
              <TouchableOpacity
                style={styles.speedButton}
                onPress={() => setVisualizationSpeed(Math.min(3, visualizationSettings.speed + 0.5))}
              >
                <Ionicons name="add" size={16} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Universal Input Sheet */}
      <UniversalInputSheet
        visible={showInputDashboard}
        onClose={() => setShowInputDashboard(false)}
        onApply={handleInputSubmit}
        algorithmType="tree"
        currentArray={inputValues}
        maxSize={12}
        minSize={3}
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
  inputButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.accent + '40',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  algorithmSelector: {
    marginBottom: Spacing.lg,
  },
  selectorLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.gray500,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
  },
  algorithmButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  algorithmButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  algorithmButtonActive: {
    backgroundColor: Colors.accent + '20',
    borderColor: Colors.accent,
  },
  algorithmButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.gray400,
  },
  algorithmButtonTextActive: {
    color: Colors.accent,
  },
  visualizationContainer: {
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  arraySection: {
    marginBottom: Spacing.lg,
  },
  arraySectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.gray400,
    marginBottom: Spacing.sm,
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
    backgroundColor: Colors.accent,
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
    color: Colors.textPrimary,
    minWidth: 36,
    textAlign: 'center',
  },
});
