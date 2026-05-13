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
import PremiumGate from '@/components/PremiumGate';
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
import {
  PathfindingChallenge,
  getAllChallenges,
  checkChallengeConstraints,
  calculateChallengeStars,
} from '@/utils/pathfindingChallenges';
import { MasteryBadge } from '@/components/XPGainAnimation';
import XPGainAnimation from '@/components/XPGainAnimation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_SIZE = 10;
const CELL_SIZE = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm * 2) / GRID_SIZE;

type GameMode = 'sandbox' | 'levels' | 'challenges';

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
    if (cell.isFrontier) return Colors.accent;
    if (cell.isVisited) return Colors.accent + '40';
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
        <Text style={[styles.statValue, { color: Colors.accent }]}>{nodesVisited}</Text>
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
          { color: isComplete ? (pathFound ? Colors.success : Colors.alertCoral) : Colors.textPrimary }
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

// Challenge Card Component
interface ChallengeCardProps {
  challenge: PathfindingChallenge;
  onSelect: () => void;
  completedChallenges: string[];
  challengeStars: Record<string, number>;
}

function ChallengeCard({ challenge, onSelect, completedChallenges, challengeStars }: ChallengeCardProps) {
  const difficultyColor = challenge.difficulty === 'easy' ? Colors.success :
                         challenge.difficulty === 'medium' ? Colors.logicGold : Colors.alertCoral;
  const isCompleted = completedChallenges.includes(challenge.id);
  const stars = challengeStars[challenge.id] || 0;

  const algorithmName = challenge.algorithmFocus === 'astar' ? 'A*' :
                        challenge.algorithmFocus === 'bfs' ? 'BFS' :
                        challenge.algorithmFocus === 'dijkstra' ? 'Dijkstra' : 'DFS';

  return (
    <Animated.View entering={FadeInDown.delay(100).springify()}>
      <TouchableOpacity
        style={[styles.challengeCard, isCompleted && styles.challengeCardCompleted]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onSelect();
        }}
        activeOpacity={0.8}
      >
        <View style={styles.challengeHeader}>
          <View style={[styles.challengeAlgoBadge, { backgroundColor: Colors.accent + '20' }]}>
            <Text style={[styles.challengeAlgoText, { color: Colors.accent }]}>
              {algorithmName}
            </Text>
          </View>
          <View style={[styles.levelBadge, { backgroundColor: difficultyColor + '30' }]}>
            <Text style={[styles.levelBadgeText, { color: difficultyColor }]}>
              {challenge.difficulty.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.challengeName}>{challenge.name}</Text>
        <Text style={styles.challengeDescription} numberOfLines={2}>{challenge.description}</Text>

        {/* Constraints Preview */}
        <View style={styles.constraintsPreview}>
          {challenge.constraints.slice(0, 2).map((constraint, idx) => (
            <View key={idx} style={styles.constraintTag}>
              <Ionicons
                name={
                  constraint.type === 'max_nodes' ? 'git-network-outline' :
                  constraint.type === 'required_algorithm' ? 'code-slash' :
                  constraint.type === 'max_path_length' ? 'resize-outline' : 'speedometer-outline'
                }
                size={12}
                color={Colors.gray400}
              />
              <Text style={styles.constraintTagText}>
                {constraint.type === 'max_nodes' ? `≤${constraint.value} nodes` :
                 constraint.type === 'required_algorithm' ? `Use ${String(constraint.value).toUpperCase()}` :
                 constraint.type === 'max_path_length' ? `Path ≤${constraint.value}` : `${constraint.value}% eff.`}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.challengeFooter}>
          <View style={styles.starsContainer}>
            {[1, 2, 3].map((s) => (
              <Ionicons
                key={s}
                name={s <= stars ? 'star' : 'star-outline'}
                size={16}
                color={s <= stars ? Colors.logicGold : Colors.gray600}
              />
            ))}
          </View>
          <Text style={styles.challengeXP}>+{challenge.xpReward} XP</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Challenge Result Modal
interface ChallengeResultModalProps {
  visible: boolean;
  onClose: () => void;
  challenge: PathfindingChallenge | null;
  passed: boolean;
  stars: number;
  nodesVisited: number;
  pathLength: number;
  algorithmUsed: PathfindingAlgorithmKey;
  failures: string[];
  xpEarned: number;
}

function ChallengeResultModal({
  visible,
  onClose,
  challenge,
  passed,
  stars,
  nodesVisited,
  pathLength,
  algorithmUsed,
  failures,
  xpEarned,
}: ChallengeResultModalProps) {
  const insets = useSafeAreaInsets();

  if (!challenge) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.resultModalContent, { paddingBottom: insets.bottom + Spacing.lg }]}>
          {/* Result Icon */}
          <View style={[styles.resultIconContainer, passed ? styles.resultIconSuccess : styles.resultIconFail]}>
            <Ionicons
              name={passed ? 'trophy' : 'close-circle'}
              size={48}
              color={passed ? Colors.logicGold : Colors.alertCoral}
            />
          </View>

          <Text style={[styles.resultTitle, { color: passed ? Colors.accent : Colors.alertCoral }]}>
            {passed ? 'Challenge Complete!' : 'Challenge Failed'}
          </Text>

          {/* Stars */}
          {passed && (
            <View style={styles.resultStars}>
              {[1, 2, 3].map((s) => (
                <Animated.View key={s} entering={FadeInUp.delay(s * 200).springify()}>
                  <Ionicons
                    name={s <= stars ? 'star' : 'star-outline'}
                    size={32}
                    color={s <= stars ? Colors.logicGold : Colors.gray600}
                  />
                </Animated.View>
              ))}
            </View>
          )}

          {/* Stats */}
          <View style={styles.resultStats}>
            <View style={styles.resultStatItem}>
              <Text style={styles.resultStatLabel}>Nodes Visited</Text>
              <Text style={styles.resultStatValue}>{nodesVisited}</Text>
              <Text style={styles.resultStatTarget}>Target: ≤{challenge.optimalNodes}</Text>
            </View>
            <View style={styles.resultStatDivider} />
            <View style={styles.resultStatItem}>
              <Text style={styles.resultStatLabel}>Path Length</Text>
              <Text style={styles.resultStatValue}>{pathLength}</Text>
              <Text style={styles.resultStatTarget}>Optimal: {challenge.optimalPath}</Text>
            </View>
          </View>

          {/* Failures (if any) */}
          {!passed && failures.length > 0 && (
            <View style={styles.failuresContainer}>
              <Text style={styles.failuresTitle}>Constraints Not Met:</Text>
              {failures.map((failure, idx) => (
                <View key={idx} style={styles.failureItem}>
                  <Ionicons name="close" size={14} color={Colors.alertCoral} />
                  <Text style={styles.failureText}>{failure}</Text>
                </View>
              ))}
            </View>
          )}

          {/* XP Earned */}
          {passed && (
            <View style={styles.xpEarnedContainer}>
              <Ionicons name="star" size={20} color={Colors.logicGold} />
              <Text style={styles.xpEarnedText}>+{xpEarned} XP</Text>
            </View>
          )}

          {/* Hints (if failed) */}
          {!passed && challenge.hints.length > 0 && (
            <View style={styles.hintsContainer}>
              <Text style={styles.hintsTitle}>Hint:</Text>
              <Text style={styles.hintText}>{challenge.hints[0]}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.resultCloseButton} onPress={onClose}>
            <Text style={styles.resultCloseText}>{passed ? 'Continue' : 'Try Again'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
              <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>AI Tutor</Text>
            <View style={styles.newellBadge}>
              <Text style={styles.newellBadgeText}>Newell AI</Text>
            </View>
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.accent} />
                <Text style={styles.loadingText}>Analyzing your pathfinding run...</Text>
              </View>
            ) : (
              <View style={styles.explanationContainer}>
                <View style={styles.aiMessageBubble}>
                  <View style={styles.aiAvatarContainer}>
                    <Ionicons name="sparkles" size={16} color={Colors.accent} />
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
              <Ionicons name="send" size={20} color={userQuestion.trim() ? Colors.background : Colors.gray500} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function GridEscapeScreen() {
  return (
    <PremiumGate featureName="Grid Escape">
      <GridEscapeScreenInner />
    </PremiumGate>
  );
}

function GridEscapeScreenInner() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateHighScore, addXP, completeAlgorithm, userProgress, recordChallengeCompletion, getAlgorithmMastery } = useAppStore();

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

  // Challenge state
  const [currentChallenge, setCurrentChallenge] = useState<PathfindingChallenge | null>(null);
  const [showChallengeResult, setShowChallengeResult] = useState(false);
  const [challengeResult, setChallengeResult] = useState<{
    passed: boolean;
    stars: number;
    failures: string[];
    xpEarned: number;
  } | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [challengeStars, setChallengeStars] = useState<Record<string, number>>({});
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [xpAnimationAmount, setXpAnimationAmount] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const allChallenges = getAllChallenges();

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

            // Handle challenge completion
            if (currentChallenge) {
              const nodesVisited = allSteps[index].nodesVisited;
              const pathLength = allSteps[index].pathLength;
              const { passed, failures } = checkChallengeConstraints(
                currentChallenge,
                selectedAlgorithm,
                nodesVisited,
                pathLength
              );
              const stars = passed ? calculateChallengeStars(currentChallenge, nodesVisited, pathLength) : 0;
              const xpEarned = passed ? currentChallenge.xpReward * stars : 0;

              setChallengeResult({ passed, stars, failures, xpEarned });
              setShowChallengeResult(true);

              if (passed) {
                addXP(xpEarned);
                recordChallengeCompletion(currentChallenge.id, selectedAlgorithm, nodesVisited, pathLength, true);
                setCompletedChallenges(prev => prev.includes(currentChallenge.id) ? prev : [...prev, currentChallenge.id]);
                setChallengeStars(prev => ({
                  ...prev,
                  [currentChallenge.id]: Math.max(prev[currentChallenge.id] || 0, stars)
                }));
              } else {
                recordChallengeCompletion(currentChallenge.id, selectedAlgorithm, nodesVisited, pathLength, false);
              }

              Haptics.notificationAsync(passed ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
            } else {
              const xpReward = currentLevel ? currentLevel.xpReward : 30;
              addXP(xpReward);
              completeAlgorithm(selectedAlgorithm, xpReward);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
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
      setCurrentChallenge(null);
      initializeGrid();
    } else if (mode === 'challenges') {
      setCurrentLevel(null);
      setCurrentChallenge(null);
    }
  };

  const selectChallenge = (challenge: PathfindingChallenge) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCurrentChallenge(challenge);
    setCurrentLevel(null);
    setSelectedAlgorithm(challenge.algorithmFocus);
    initializeGrid(challenge.obstacles);
  };

  const handleChallengeResultClose = () => {
    setShowChallengeResult(false);
    if (challengeResult?.passed && challengeResult.xpEarned > 0) {
      setXpAnimationAmount(challengeResult.xpEarned);
      setShowXPAnimation(true);
    }
    resetGrid();
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
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {currentChallenge ? currentChallenge.name :
           currentLevel ? `Level ${currentLevel.id}: ${currentLevel.name}` :
           `Grid Escape: ${algorithmInfo.name}`}
        </Text>
        {isComplete && (
          <TouchableOpacity style={styles.aiButton} onPress={openAIExplainer}>
            <Ionicons name="sparkles" size={20} color={Colors.accent} />
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
            color={gameMode === 'sandbox' ? Colors.background : Colors.gray400}
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
            color={gameMode === 'levels' ? Colors.background : Colors.gray400}
          />
          <Text style={[
            styles.modeTabText,
            gameMode === 'levels' && styles.modeTabTextActive
          ]}>Levels</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeTab, gameMode === 'challenges' && styles.modeTabActive]}
          onPress={() => switchMode('challenges')}
        >
          <Ionicons
            name="ribbon"
            size={18}
            color={gameMode === 'challenges' ? Colors.background : Colors.gray400}
          />
          <Text style={[
            styles.modeTabText,
            gameMode === 'challenges' && styles.modeTabTextActive
          ]}>Challenges</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {gameMode === 'challenges' && !currentChallenge ? (
          // Challenges Selection
          <Animated.View entering={FadeIn}>
            <Text style={styles.sectionTitle}>Mastery Challenges</Text>
            <Text style={styles.sectionSubtitle}>
              Complete challenges with constraints to earn mastery badges
            </Text>

            {/* Mastery Progress Overview */}
            <View style={styles.masteryOverview}>
              {(['bfs', 'astar', 'dijkstra'] as PathfindingAlgorithmKey[]).map((algo) => {
                const mastery = getAlgorithmMastery(algo);
                return (
                  <View key={algo} style={styles.masteryItem}>
                    <MasteryBadge level={mastery.masteryLevel} size="small" showLabel={false} />
                    <Text style={styles.masteryAlgoName}>
                      {algo === 'astar' ? 'A*' : algo.toUpperCase()}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Challenges by Algorithm */}
            {(['bfs', 'astar', 'dijkstra'] as PathfindingAlgorithmKey[]).map((algo) => {
              const algoChallenges = allChallenges.filter(c => c.algorithmFocus === algo);
              const algoName = algo === 'astar' ? 'A*' : algo === 'bfs' ? 'BFS' : 'Dijkstra';

              return (
                <View key={algo} style={styles.challengeSection}>
                  <View style={styles.challengeSectionHeader}>
                    <Text style={styles.challengeSectionTitle}>{algoName} Challenges</Text>
                    <View style={styles.challengeProgress}>
                      <Text style={styles.challengeProgressText}>
                        {algoChallenges.filter(c => completedChallenges.includes(c.id)).length}/{algoChallenges.length}
                      </Text>
                    </View>
                  </View>
                  {algoChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onSelect={() => selectChallenge(challenge)}
                      completedChallenges={completedChallenges}
                      challengeStars={challengeStars}
                    />
                  ))}
                </View>
              );
            })}
          </Animated.View>
        ) : gameMode === 'levels' && !currentLevel ? (
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
                <Ionicons name={isRunning ? 'hourglass' : 'play'} size={20} color={Colors.background} />
                <Text style={[styles.actionButtonText, { color: Colors.background }]}>
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
                  <Ionicons name="sparkles" size={16} color={Colors.textPrimary} />
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

            {/* Back to Levels/Challenges Button */}
            {gameMode === 'levels' && currentLevel && (
              <TouchableOpacity
                style={styles.backToLevelsButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCurrentLevel(null);
                  initializeGrid();
                }}
              >
                <Ionicons name="arrow-back" size={18} color={Colors.accent} />
                <Text style={styles.backToLevelsText}>Back to Levels</Text>
              </TouchableOpacity>
            )}

            {gameMode === 'challenges' && currentChallenge && (
              <TouchableOpacity
                style={styles.backToLevelsButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCurrentChallenge(null);
                  initializeGrid();
                }}
              >
                <Ionicons name="arrow-back" size={18} color={Colors.accent} />
                <Text style={styles.backToLevelsText}>Back to Challenges</Text>
              </TouchableOpacity>
            )}

            {/* Challenge Constraints Info */}
            {currentChallenge && (
              <Animated.View entering={FadeInDown.delay(250)} style={styles.constraintsCard}>
                <Text style={styles.constraintsCardTitle}>Challenge Constraints</Text>
                {currentChallenge.constraints.map((constraint, idx) => (
                  <View key={idx} style={styles.constraintRow}>
                    <Ionicons
                      name={
                        constraint.type === 'max_nodes' ? 'git-network-outline' :
                        constraint.type === 'required_algorithm' ? 'code-slash' :
                        constraint.type === 'max_path_length' ? 'resize-outline' : 'speedometer-outline'
                      }
                      size={16}
                      color={Colors.accent}
                    />
                    <Text style={styles.constraintRowText}>
                      {constraint.type === 'max_nodes' ? `Visit ≤ ${constraint.value} nodes` :
                       constraint.type === 'required_algorithm' ? `Use ${String(constraint.value).toUpperCase()} algorithm` :
                       constraint.type === 'max_path_length' ? `Path length ≤ ${constraint.value}` : `Achieve ${constraint.value}% efficiency`}
                    </Text>
                  </View>
                ))}
              </Animated.View>
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

      {/* Challenge Result Modal */}
      <ChallengeResultModal
        visible={showChallengeResult}
        onClose={handleChallengeResultClose}
        challenge={currentChallenge}
        passed={challengeResult?.passed || false}
        stars={challengeResult?.stars || 0}
        nodesVisited={currentStep?.nodesVisited || 0}
        pathLength={currentStep?.pathLength || 0}
        algorithmUsed={selectedAlgorithm}
        failures={challengeResult?.failures || []}
        xpEarned={challengeResult?.xpEarned || 0}
      />

      {/* XP Gain Animation */}
      <XPGainAnimation
        visible={showXPAnimation}
        xpAmount={xpAnimationAmount}
        onComplete={() => setShowXPAnimation(false)}
        message="Challenge Complete!"
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
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  aiButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.accent + '20',
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
    backgroundColor: Colors.accent,
  },
  modeTabText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.gray400,
  },
  modeTabTextActive: {
    color: Colors.background,
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
    color: Colors.textPrimary,
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
    color: Colors.textPrimary,
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
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  levelAlgoText: {
    fontSize: FontSizes.xs,
    color: Colors.accent,
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
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.sm,
  },
  cellIcon: {
    fontSize: 14,
  },
  cellCost: {
    fontSize: 7,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  frontierPanel: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.accent + '30',
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
    backgroundColor: Colors.accent,
  },
  frontierTitle: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
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
    backgroundColor: Colors.accent + '30',
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  frontierCoord: {
    fontSize: FontSizes.xs,
    color: Colors.textPrimary,
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
    color: Colors.textPrimary,
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
    backgroundColor: Colors.accent,
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
    color: Colors.background,
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
    backgroundColor: Colors.accent,
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
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  completionSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
  },
  aiExplainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  aiExplainText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
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
    color: Colors.textPrimary,
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
    color: Colors.textPrimary,
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
    color: Colors.accent,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
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
    color: Colors.textPrimary,
  },
  newellBadge: {
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  newellBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.accent,
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
    borderColor: Colors.accent + '30',
  },
  aiAvatarContainer: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.accent + '20',
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
    color: Colors.textPrimary,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.gray700,
  },
  // Challenge Styles
  challengeCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray700,
    ...Shadows.small,
  },
  challengeCardCompleted: {
    borderColor: Colors.accent + '50',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  challengeAlgoBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  challengeAlgoText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
  },
  challengeName: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  challengeDescription: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  constraintsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  constraintTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.gray700,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  constraintTagText: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  challengeXP: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.logicGold,
  },
  masteryOverview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  masteryItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  masteryAlgoName: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
    fontWeight: '600',
  },
  challengeSection: {
    marginBottom: Spacing.lg,
  },
  challengeSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  challengeSectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  challengeProgress: {
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  challengeProgressText: {
    fontSize: FontSizes.xs,
    color: Colors.accent,
    fontWeight: '600',
  },
  constraintsCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.accent + '30',
    ...Shadows.small,
  },
  constraintsCardTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.accent,
    marginBottom: Spacing.md,
  },
  constraintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  constraintRowText: {
    fontSize: FontSizes.sm,
    color: Colors.gray300,
  },
  // Result Modal Styles
  resultModalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  resultIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  resultIconSuccess: {
    backgroundColor: Colors.logicGold + '20',
  },
  resultIconFail: {
    backgroundColor: Colors.alertCoral + '20',
  },
  resultTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  resultStars: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  resultStats: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  resultStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  resultStatLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    marginBottom: 4,
  },
  resultStatValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  resultStatTarget: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    marginTop: 2,
  },
  resultStatDivider: {
    width: 1,
    backgroundColor: Colors.gray700,
  },
  failuresContainer: {
    width: '100%',
    backgroundColor: Colors.alertCoral + '10',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  failuresTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.alertCoral,
    marginBottom: Spacing.sm,
  },
  failureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  failureText: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
  },
  xpEarnedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  xpEarnedText: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.logicGold,
  },
  hintsContainer: {
    width: '100%',
    backgroundColor: Colors.logicGold + '10',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  hintsTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.logicGold,
    marginBottom: Spacing.xs,
  },
  hintText: {
    fontSize: FontSizes.sm,
    color: Colors.gray300,
    lineHeight: 20,
  },
  resultCloseButton: {
    width: '100%',
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  resultCloseText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.background,
  },
});
