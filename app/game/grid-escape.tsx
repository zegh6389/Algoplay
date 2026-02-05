import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import {
  createGrid,
  pathfindingGenerators,
  pathfindingAlgorithms,
  PathfindingStep,
  GridCell,
  PathfindingAlgorithmKey,
  generateMaze,
  levels,
  LevelConfig,
} from '@/utils/algorithms/pathfinding';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_SIZE = 10;
const CELL_SIZE = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm * 2) / GRID_SIZE;

type GameMode = 'sandbox' | 'levels';

interface CellProps {
  cell: GridCell;
  onPress: () => void;
  isPlacingObstacles: boolean;
  isRunning: boolean;
}

function Cell({ cell, onPress, isPlacingObstacles, isRunning }: CellProps) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  // Animate glow for frontier cells
  useEffect(() => {
    if (cell.isFrontier) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.4, { duration: 400, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [cell.isFrontier]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handlePress = () => {
    if (isPlacingObstacles && !cell.isStart && !cell.isEnd && !isRunning) {
      scale.value = withSequence(
        withSpring(0.8, { damping: 10 }),
        withSpring(1, { damping: 10 })
      );
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const getCellColor = () => {
    if (cell.isStart) return Colors.success;
    if (cell.isEnd) return Colors.alertCoral;
    if (cell.isPath) return Colors.logicGold;
    if (cell.isObstacle) return Colors.gray600;
    if (cell.isFrontier) return Colors.actionTeal;
    if (cell.isVisited) return Colors.actionTeal + '40';
    return Colors.gray700;
  };

  const getCellIcon = () => {
    if (cell.isStart) return '🤖';
    if (cell.isEnd) return '🎯';
    return null;
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8} disabled={isRunning}>
      <Animated.View
        style={[
          styles.cell,
          animatedStyle,
          { backgroundColor: getCellColor() },
        ]}
      >
        {/* Glow effect for frontier cells */}
        {cell.isFrontier && (
          <Animated.View
            style={[
              styles.cellGlow,
              glowStyle,
            ]}
          />
        )}
        {getCellIcon() && <Text style={styles.cellIcon}>{getCellIcon()}</Text>}
        {cell.fCost !== Infinity && cell.fCost > 0 && !cell.isStart && !cell.isEnd && cell.isVisited && (
          <Text style={styles.cellCost}>F:{Math.round(cell.fCost)}</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

interface FrontierPanelProps {
  frontier: { row: number; col: number; fCost?: number }[];
  algorithmKey: PathfindingAlgorithmKey;
}

function FrontierPanel({ frontier, algorithmKey }: FrontierPanelProps) {
  const queueName = algorithmKey === 'bfs' ? 'Queue (FIFO)' :
                   algorithmKey === 'dfs' ? 'Stack (LIFO)' : 'Priority Queue';

  return (
    <Animated.View entering={FadeInDown.delay(100)} style={styles.frontierPanel}>
      <View style={styles.frontierHeader}>
        <View style={styles.frontierDot} />
        <Text style={styles.frontierTitle}>{queueName}</Text>
        <Text style={styles.frontierCount}>{frontier.length} nodes</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.frontierItems}>
          {frontier.slice(0, 8).map((item, index) => (
            <View key={index} style={[styles.frontierItem, index === 0 && styles.frontierItemFirst]}>
              <Text style={styles.frontierCoord}>({item.row},{item.col})</Text>
              {item.fCost !== undefined && item.fCost !== Infinity && (
                <Text style={styles.frontierCost}>F-cost {Math.round(item.fCost)}</Text>
              )}
            </View>
          ))}
          {frontier.length > 8 && (
            <View style={styles.frontierMore}>
              <Text style={styles.frontierMoreText}>+{frontier.length - 8}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </Animated.View>
  );
}

interface StatsCardProps {
  nodesVisited: number;
  operations: number;
  pathLength: number;
  isComplete: boolean;
  pathFound: boolean;
}

function StatsCard({ nodesVisited, operations, pathLength, isComplete, pathFound }: StatsCardProps) {
  return (
    <Animated.View entering={FadeInDown.delay(50)} style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Nodes Visited</Text>
        <Text style={[styles.statValue, { color: Colors.actionTeal }]}>{nodesVisited}</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Operations</Text>
        <Text style={[styles.statValue, { color: Colors.logicGold }]}>{operations}</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Path Length</Text>
        <Text style={[
          styles.statValue,
          { color: isComplete ? (pathFound ? Colors.success : Colors.alertCoral) : Colors.white }
        ]}>
          {pathLength > 0 ? pathLength : (isComplete ? 'N/A' : '-')}
        </Text>
      </View>
    </Animated.View>
  );
}

interface AlgorithmSelectorProps {
  selectedAlgorithm: PathfindingAlgorithmKey;
  onSelect: (algorithm: PathfindingAlgorithmKey) => void;
  disabled: boolean;
}

function AlgorithmSelector({ selectedAlgorithm, onSelect, disabled }: AlgorithmSelectorProps) {
  const algorithms: PathfindingAlgorithmKey[] = ['dijkstra', 'astar', 'bfs'];

  const handleSelect = (alg: PathfindingAlgorithmKey) => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelect(alg);
    }
  };

  return (
    <View style={styles.algorithmSelector}>
      <Text style={styles.selectorLabel}>Algorithm</Text>
      <View style={styles.algorithmButtons}>
        {algorithms.map((alg) => (
          <TouchableOpacity
            key={alg}
            style={[
              styles.algorithmButton,
              selectedAlgorithm === alg && styles.algorithmButtonActive,
              disabled && styles.algorithmButtonDisabled,
            ]}
            onPress={() => handleSelect(alg)}
            disabled={disabled}
          >
            <Text
              style={[
                styles.algorithmButtonText,
                selectedAlgorithm === alg && styles.algorithmButtonTextActive,
              ]}
            >
              {alg === 'astar' ? 'A*' : alg.charAt(0).toUpperCase() + alg.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

interface LevelCardProps {
  level: LevelConfig;
  onSelect: () => void;
  isCompleted: boolean;
}

function LevelCard({ level, onSelect, isCompleted }: LevelCardProps) {
  const difficultyColor = level.difficulty === 'easy' ? Colors.success :
                         level.difficulty === 'medium' ? Colors.logicGold : Colors.alertCoral;

  return (
    <TouchableOpacity
      style={styles.levelCard}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onSelect();
      }}
      activeOpacity={0.8}
    >
      <View style={styles.levelHeader}>
        <View style={[styles.levelBadge, { backgroundColor: difficultyColor + '30' }]}>
          <Text style={[styles.levelBadgeText, { color: difficultyColor }]}>
            {level.difficulty.toUpperCase()}
          </Text>
        </View>
        {isCompleted && (
          <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
        )}
      </View>
      <Text style={styles.levelName}>{level.name}</Text>
      <Text style={styles.levelDescription} numberOfLines={2}>{level.description}</Text>
      <View style={styles.levelFooter}>
        <Text style={styles.levelXP}>+{level.xpReward} XP</Text>
        <View style={styles.levelAlgoBadge}>
          <Text style={styles.levelAlgoText}>
            Best: {level.recommendedAlgorithm === 'astar' ? 'A*' : level.recommendedAlgorithm.toUpperCase()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

interface AIExplainerModalProps {
  visible: boolean;
  onClose: () => void;
  algorithmKey: PathfindingAlgorithmKey;
  stats: {
    nodesVisited: number;
    pathLength: number;
    operations: number;
  };
  obstacles: { row: number; col: number }[];
  pathFound: boolean;
}

function AIExplainerModal({ visible, onClose, algorithmKey, stats, obstacles, pathFound }: AIExplainerModalProps) {
  const insets = useSafeAreaInsets();
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');

  const NEWELL_API_URL = process.env.EXPO_PUBLIC_NEWELL_API_URL;
  const PROJECT_ID = process.env.EXPO_PUBLIC_PROJECT_ID;

  const fetchExplanation = async (customQuestion?: string) => {
    setIsLoading(true);
    try {
      const algorithmInfo = pathfindingAlgorithms[algorithmKey];
      const prompt = customQuestion || `I just ran ${algorithmInfo.name} on a ${GRID_SIZE}x${GRID_SIZE} grid with ${obstacles.length} obstacles.
It visited ${stats.nodesVisited} nodes, performed ${stats.operations} operations, and ${pathFound ? `found a path of length ${stats.pathLength}` : 'did not find a path'}.

Please explain:
1. Why this algorithm behaved this way for this specific scenario
2. How the ${algorithmInfo.name} explores nodes (${algorithmKey === 'astar' ? 'using heuristics' : algorithmKey === 'dijkstra' ? 'based on distance' : 'level by level'})
3. Whether a different algorithm might have been more efficient here and why

Keep the explanation concise and educational, suitable for someone learning about pathfinding algorithms.`;

      const response = await fetch(`${NEWELL_API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Project-ID': PROJECT_ID || '',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are an expert computer science tutor explaining pathfinding algorithms. Be concise, educational, and use simple analogies when helpful. Format your response with clear sections.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          model: 'gpt-4o-mini',
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get explanation');
      }

      const data = await response.json();
      setExplanation(data.choices?.[0]?.message?.content || 'Unable to generate explanation.');
    } catch (error) {
      console.error('Error fetching explanation:', error);
      setExplanation(`**${pathfindingAlgorithms[algorithmKey].name}** explored ${stats.nodesVisited} nodes to find the path.

${algorithmKey === 'astar' ?
  "A* uses a heuristic (Manhattan distance) to prioritize nodes closer to the goal, making it efficient in open spaces." :
  algorithmKey === 'dijkstra' ?
  "Dijkstra's algorithm guarantees the shortest path by always expanding the node with the smallest known distance." :
  "BFS explores all nodes at the current depth before moving deeper, guaranteeing the shortest path in unweighted graphs."}

${pathFound ?
  `The path found has ${stats.pathLength} steps, which is optimal for this configuration.` :
  'No path was found - the obstacles completely block all routes to the goal.'}`);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (visible) {
      setExplanation('');
      setUserQuestion('');
      fetchExplanation();
    }
  }, [visible]);

  const handleAskQuestion = () => {
    if (userQuestion.trim()) {
      fetchExplanation(userQuestion);
      setUserQuestion('');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { paddingBottom: insets.bottom + Spacing.lg }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>AI Tutor</Text>
            <View style={styles.newellBadge}>
              <Text style={styles.newellBadgeText}>Newell AI</Text>
            </View>
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.actionTeal} />
                <Text style={styles.loadingText}>Analyzing your pathfinding run...</Text>
              </View>
            ) : (
              <View style={styles.explanationContainer}>
                <View style={styles.aiMessageBubble}>
                  <View style={styles.aiAvatarContainer}>
                    <Ionicons name="sparkles" size={16} color={Colors.actionTeal} />
                  </View>
                  <Text style={styles.explanationText}>{explanation}</Text>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.chatInput}
              placeholder="Ask a follow-up question..."
              placeholderTextColor={Colors.gray500}
              value={userQuestion}
              onChangeText={setUserQuestion}
              onSubmitEditing={handleAskQuestion}
            />
            <TouchableOpacity
              style={[styles.sendButton, !userQuestion.trim() && styles.sendButtonDisabled]}
              onPress={handleAskQuestion}
              disabled={!userQuestion.trim() || isLoading}
            >
              <Ionicons name="send" size={20} color={userQuestion.trim() ? Colors.midnightBlue : Colors.gray500} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function GridEscapeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateHighScore, addXP, completeAlgorithm, userProgress } = useAppStore();

  const [gameMode, setGameMode] = useState<GameMode>('sandbox');
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<PathfindingAlgorithmKey>('astar');
  const [isPlacingObstacles, setIsPlacingObstacles] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState<PathfindingStep | null>(null);
  const [currentLevel, setCurrentLevel] = useState<LevelConfig | null>(null);
  const [showAIExplainer, setShowAIExplainer] = useState(false);
  const [obstacles, setObstacles] = useState<{ row: number; col: number }[]>([]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = { row: 0, col: 0 };
  const end = { row: GRID_SIZE - 1, col: GRID_SIZE - 1 };

  // Initialize grid
  useEffect(() => {
    initializeGrid();
  }, []);

  const initializeGrid = (obstacleList: { row: number; col: number }[] = []) => {
    const newGrid = createGrid(GRID_SIZE, GRID_SIZE, start, end, obstacleList);
    setGrid(newGrid);
    setCurrentStep(null);
    setIsRunning(false);
    setIsComplete(false);
    setIsPlacingObstacles(true);
    setObstacles(obstacleList);
  };

  const toggleObstacle = (row: number, col: number) => {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((r) => r.map((c) => ({ ...c })));
      const wasObstacle = newGrid[row][col].isObstacle;
      newGrid[row][col].isObstacle = !wasObstacle;

      // Update obstacles list
      if (wasObstacle) {
        setObstacles(prev => prev.filter(o => !(o.row === row && o.col === col)));
      } else {
        setObstacles(prev => [...prev, { row, col }]);
      }

      return newGrid;
    });
  };

  const runAlgorithm = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsPlacingObstacles(false);
    setIsRunning(true);
    setIsComplete(false);

    const generator = pathfindingGenerators[selectedAlgorithm](grid);
    const allSteps: PathfindingStep[] = [];

    for (const step of generator) {
      allSteps.push(step);
    }

    // Animate through steps
    let index = 0;
    intervalRef.current = setInterval(() => {
      if (index < allSteps.length) {
        setCurrentStep(allSteps[index]);

        // Update grid visualization
        setGrid(allSteps[index].grid);

        if (allSteps[index].isComplete) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          setIsRunning(false);
          setIsComplete(true);

          // Award points if path found
          if (allSteps[index].path.length > 0) {
            updateHighScore('gridEscapeWins', 1);
            const xpReward = currentLevel ? currentLevel.xpReward : 30;
            addXP(xpReward);
            completeAlgorithm(selectedAlgorithm, xpReward);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
        }

        index++;
      }
    }, 80);
  }, [grid, selectedAlgorithm, currentLevel]);

  const resetGrid = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Keep obstacles when resetting
    const currentObstacles: { row: number; col: number }[] = [];
    grid.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell.isObstacle) {
          currentObstacles.push({ row: r, col: c });
        }
      });
    });

    initializeGrid(currentObstacles);
  };

  const clearAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCurrentLevel(null);
    initializeGrid();
  };

  const generateRandomMaze = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const densityOptions: ('light' | 'medium' | 'heavy')[] = ['light', 'medium', 'heavy'];
    const randomDensity = densityOptions[Math.floor(Math.random() * densityOptions.length)];
    const mazeObstacles = generateMaze(GRID_SIZE, GRID_SIZE, start, end, randomDensity);
    setCurrentLevel(null);
    initializeGrid(mazeObstacles);
  };

  const selectLevel = (level: LevelConfig) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCurrentLevel(level);
    setSelectedAlgorithm(level.recommendedAlgorithm);
    initializeGrid(level.obstacles);
  };

  const switchMode = (mode: GameMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setGameMode(mode);
    if (mode === 'sandbox') {
      setCurrentLevel(null);
      initializeGrid();
    }
  };

  const openAIExplainer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowAIExplainer(true);
  };

  const algorithmInfo = pathfindingAlgorithms[selectedAlgorithm];
  const pathFound = currentStep?.path && currentStep.path.length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {currentLevel ? `Level ${currentLevel.id}: ${currentLevel.name}` : `Grid Escape: ${algorithmInfo.name}`}
        </Text>
        {isComplete && (
          <TouchableOpacity style={styles.aiButton} onPress={openAIExplainer}>
            <Ionicons name="sparkles" size={20} color={Colors.actionTeal} />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Mode Tabs */}
      <View style={styles.modeTabs}>
        <TouchableOpacity
          style={[styles.modeTab, gameMode === 'sandbox' && styles.modeTabActive]}
          onPress={() => switchMode('sandbox')}
        >
          <Ionicons
            name="construct"
            size={18}
            color={gameMode === 'sandbox' ? Colors.midnightBlue : Colors.gray400}
          />
          <Text style={[
            styles.modeTabText,
            gameMode === 'sandbox' && styles.modeTabTextActive
          ]}>Sandbox</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeTab, gameMode === 'levels' && styles.modeTabActive]}
          onPress={() => switchMode('levels')}
        >
          <Ionicons
            name="trophy"
            size={18}
            color={gameMode === 'levels' ? Colors.midnightBlue : Colors.gray400}
          />
          <Text style={[
            styles.modeTabText,
            gameMode === 'levels' && styles.modeTabTextActive
          ]}>Levels</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {gameMode === 'levels' && !currentLevel ? (
          // Levels Selection
          <Animated.View entering={FadeIn}>
            <Text style={styles.sectionTitle}>Choose a Challenge</Text>
            <Text style={styles.sectionSubtitle}>
              Each level tests different algorithm strengths
            </Text>
            <View style={styles.levelsGrid}>
              {levels.map((level) => (
                <LevelCard
                  key={level.id}
                  level={level}
                  onSelect={() => selectLevel(level)}
                  isCompleted={userProgress.completedAlgorithms.includes(`level-${level.id}`)}
                />
              ))}
            </View>
          </Animated.View>
        ) : (
          <>
            {/* Grid */}
            <Animated.View entering={FadeInDown} style={styles.gridContainer}>
              {grid.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.gridRow}>
                  {row.map((cell, colIndex) => (
                    <Cell
                      key={`${rowIndex}-${colIndex}`}
                      cell={cell}
                      onPress={() => toggleObstacle(rowIndex, colIndex)}
                      isPlacingObstacles={isPlacingObstacles}
                      isRunning={isRunning}
                    />
                  ))}
                </View>
              ))}
            </Animated.View>

            {/* Frontier Panel */}
            {currentStep && currentStep.frontier.length > 0 && (
              <FrontierPanel frontier={currentStep.frontier} algorithmKey={selectedAlgorithm} />
            )}

            {/* Stats */}
            {(currentStep || isComplete) && (
              <StatsCard
                nodesVisited={currentStep?.nodesVisited || 0}
                operations={currentStep?.operationsCount || 0}
                pathLength={currentStep?.pathLength || 0}
                isComplete={isComplete}
                pathFound={!!pathFound}
              />
            )}

            {/* Algorithm Selector */}
            <AlgorithmSelector
              selectedAlgorithm={selectedAlgorithm}
              onSelect={setSelectedAlgorithm}
              disabled={isRunning}
            />

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {gameMode === 'sandbox' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.mazeButton]}
                  onPress={generateRandomMaze}
                  disabled={isRunning}
                >
                  <Ionicons name="grid" size={20} color={Colors.info} />
                  <Text style={[styles.actionButtonText, { color: Colors.info }]}>Maze</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionButton, styles.clearButton]}
                onPress={clearAll}
                disabled={isRunning}
              >
                <Ionicons name="trash" size={20} color={Colors.alertCoral} />
                <Text style={[styles.actionButtonText, { color: Colors.alertCoral }]}>Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.resetButton]}
                onPress={resetGrid}
                disabled={isRunning}
              >
                <Ionicons name="refresh" size={20} color={Colors.logicGold} />
                <Text style={[styles.actionButtonText, { color: Colors.logicGold }]}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.runButton, isRunning && styles.runButtonDisabled]}
                onPress={runAlgorithm}
                disabled={isRunning}
              >
                <Ionicons name={isRunning ? 'hourglass' : 'play'} size={20} color={Colors.midnightBlue} />
                <Text style={[styles.actionButtonText, { color: Colors.midnightBlue }]}>
                  {isRunning ? 'Running...' : 'Run'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Completion Message */}
            {isComplete && (
              <Animated.View entering={FadeInUp} style={[
                styles.completionCard,
                pathFound ? styles.completionSuccess : styles.completionFail
              ]}>
                <Ionicons
                  name={pathFound ? 'checkmark-circle' : 'close-circle'}
                  size={32}
                  color={pathFound ? Colors.success : Colors.alertCoral}
                />
                <View style={styles.completionText}>
                  <Text style={styles.completionTitle}>
                    {pathFound ? 'Path Found!' : 'No Path Found'}
                  </Text>
                  <Text style={styles.completionSubtitle}>
                    {pathFound
                      ? `${currentStep?.nodesVisited} nodes explored to find a ${currentStep?.pathLength}-step path`
                      : 'The obstacles block all possible routes'}
                  </Text>
                </View>
                <TouchableOpacity style={styles.aiExplainButton} onPress={openAIExplainer}>
                  <Ionicons name="sparkles" size={16} color={Colors.white} />
                  <Text style={styles.aiExplainText}>Explain</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Algorithm Info */}
            <Animated.View entering={FadeInDown.delay(200)} style={styles.infoCard}>
              <Text style={styles.infoTitle}>{algorithmInfo.name}</Text>
              <Text style={styles.infoDescription}>{algorithmInfo.description}</Text>
              <View style={styles.infoStats}>
                <View style={styles.infoStatItem}>
                  <Text style={styles.infoStatLabel}>Time</Text>
                  <Text style={styles.infoStatValue}>{algorithmInfo.timeComplexity}</Text>
                </View>
                <View style={styles.infoStatItem}>
                  <Text style={styles.infoStatLabel}>Space</Text>
                  <Text style={styles.infoStatValue}>{algorithmInfo.spaceComplexity}</Text>
                </View>
                <View style={styles.infoStatItem}>
                  <Text style={styles.infoStatLabel}>Optimal</Text>
                  <Text style={[
                    styles.infoStatValue,
                    { color: algorithmInfo.optimal ? Colors.success : Colors.alertCoral }
                  ]}>
                    {algorithmInfo.optimal ? 'Yes' : 'No'}
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Back to Levels Button */}
            {gameMode === 'levels' && currentLevel && (
              <TouchableOpacity
                style={styles.backToLevelsButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCurrentLevel(null);
                  initializeGrid();
                }}
              >
                <Ionicons name="arrow-back" size={18} color={Colors.actionTeal} />
                <Text style={styles.backToLevelsText}>Back to Levels</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>

      {/* AI Explainer Modal */}
      <AIExplainerModal
        visible={showAIExplainer}
        onClose={() => setShowAIExplainer(false)}
        algorithmKey={selectedAlgorithm}
        stats={{
          nodesVisited: currentStep?.nodesVisited || 0,
          pathLength: currentStep?.pathLength || 0,
          operations: currentStep?.operationsCount || 0,
        }}
        obstacles={obstacles}
        pathFound={!!pathFound}
      />
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
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.white,
  },
  aiButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.actionTeal + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeTabs: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: 4,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  modeTabActive: {
    backgroundColor: Colors.actionTeal,
  },
  modeTabText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.gray400,
  },
  modeTabTextActive: {
    color: Colors.midnightBlue,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  sectionTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
    marginBottom: Spacing.lg,
  },
  levelsGrid: {
    gap: Spacing.md,
  },
  levelCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  levelBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  levelBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
  },
  levelName: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  levelDescription: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  levelFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelXP: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.logicGold,
  },
  levelAlgoBadge: {
    backgroundColor: Colors.actionTeal + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  levelAlgoText: {
    fontSize: FontSizes.xs,
    color: Colors.actionTeal,
    fontWeight: '500',
  },
  gridContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.sm,
    marginBottom: Spacing.lg,
    ...Shadows.medium,
  },
  gridRow: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE - 2,
    height: CELL_SIZE - 2,
    margin: 1,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cellGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.actionTeal,
    borderRadius: BorderRadius.sm,
  },
  cellIcon: {
    fontSize: 14,
  },
  cellCost: {
    fontSize: 7,
    color: Colors.white,
    fontWeight: '600',
  },
  frontierPanel: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.actionTeal + '30',
    ...Shadows.small,
  },
  frontierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  frontierDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.actionTeal,
  },
  frontierTitle: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.white,
  },
  frontierCount: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
  },
  frontierItems: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  frontierItem: {
    backgroundColor: Colors.gray700,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    minWidth: 60,
  },
  frontierItemFirst: {
    backgroundColor: Colors.actionTeal + '30',
    borderWidth: 1,
    borderColor: Colors.actionTeal,
  },
  frontierCoord: {
    fontSize: FontSizes.xs,
    color: Colors.white,
    fontWeight: '600',
  },
  frontierCost: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
    marginTop: 2,
  },
  frontierMore: {
    backgroundColor: Colors.gray700,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
  },
  frontierMoreText: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    marginBottom: 4,
  },
  statValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.white,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.gray700,
    marginHorizontal: Spacing.sm,
  },
  algorithmSelector: {
    marginBottom: Spacing.lg,
  },
  selectorLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.gray400,
    marginBottom: Spacing.sm,
  },
  algorithmButtons: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: 4,
  },
  algorithmButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  algorithmButtonActive: {
    backgroundColor: Colors.actionTeal,
  },
  algorithmButtonDisabled: {
    opacity: 0.5,
  },
  algorithmButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.gray400,
  },
  algorithmButtonTextActive: {
    color: Colors.midnightBlue,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  mazeButton: {
    backgroundColor: Colors.info + '20',
  },
  clearButton: {
    backgroundColor: Colors.alertCoral + '20',
  },
  resetButton: {
    backgroundColor: Colors.logicGold + '20',
  },
  runButton: {
    backgroundColor: Colors.actionTeal,
    flex: 1.5,
  },
  runButtonDisabled: {
    backgroundColor: Colors.gray600,
  },
  actionButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  completionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  completionSuccess: {
    backgroundColor: Colors.success + '15',
    borderWidth: 1,
    borderColor: Colors.success + '30',
  },
  completionFail: {
    backgroundColor: Colors.alertCoral + '15',
    borderWidth: 1,
    borderColor: Colors.alertCoral + '30',
  },
  completionText: {
    flex: 1,
  },
  completionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 2,
  },
  completionSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
  },
  aiExplainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.actionTeal,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  aiExplainText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.white,
  },
  infoCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  infoTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  infoDescription: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  infoStats: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  infoStatItem: {
    alignItems: 'flex-start',
  },
  infoStatLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    marginBottom: 2,
  },
  infoStatValue: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.white,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  backToLevelsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  backToLevelsText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.actionTeal,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.midnightBlue,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray700,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  modalTitle: {
    flex: 1,
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.white,
  },
  newellBadge: {
    backgroundColor: Colors.actionTeal + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  newellBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.actionTeal,
  },
  modalScroll: {
    padding: Spacing.lg,
    maxHeight: 400,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.sm,
    color: Colors.gray400,
  },
  explanationContainer: {
    marginBottom: Spacing.lg,
  },
  aiMessageBubble: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.actionTeal + '30',
  },
  aiAvatarContainer: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.actionTeal + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  explanationText: {
    fontSize: FontSizes.sm,
    color: Colors.gray300,
    lineHeight: 22,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray700,
    gap: Spacing.sm,
  },
  chatInput: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSizes.sm,
    color: Colors.white,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.actionTeal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.gray700,
  },
});
