import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
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
} from '@/utils/algorithms/pathfinding';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_SIZE = 10;
const CELL_SIZE = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm * 2) / GRID_SIZE;

interface CellProps {
  cell: GridCell;
  onPress: () => void;
  isPlacingObstacles: boolean;
}

function Cell({ cell, onPress, isPlacingObstacles }: CellProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (isPlacingObstacles && !cell.isStart && !cell.isEnd) {
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
    if (cell.isVisited) return Colors.actionTeal + '60';
    if (cell.isFrontier) return Colors.info + '80';
    return Colors.gray700;
  };

  const getCellIcon = () => {
    if (cell.isStart) return '🟢';
    if (cell.isEnd) return '🔴';
    if (cell.isPath && !cell.isStart && !cell.isEnd) return null;
    return null;
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.cell,
          animatedStyle,
          { backgroundColor: getCellColor() },
        ]}
      >
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
}

function FrontierPanel({ frontier }: FrontierPanelProps) {
  return (
    <View style={styles.frontierPanel}>
      <Text style={styles.frontierTitle}>Frontier / Priority Queue</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.frontierItems}>
          {frontier.slice(0, 8).map((item, index) => (
            <View key={index} style={styles.frontierItem}>
              <Text style={styles.frontierCoord}>({item.row},{item.col})</Text>
              {item.fCost !== undefined && (
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
    </View>
  );
}

interface AlgorithmSelectorProps {
  selectedAlgorithm: PathfindingAlgorithmKey;
  onSelect: (algorithm: PathfindingAlgorithmKey) => void;
}

function AlgorithmSelector({ selectedAlgorithm, onSelect }: AlgorithmSelectorProps) {
  const algorithms: PathfindingAlgorithmKey[] = ['dijkstra', 'astar', 'bfs'];

  return (
    <View style={styles.algorithmSelector}>
      {algorithms.map((alg) => (
        <TouchableOpacity
          key={alg}
          style={[
            styles.algorithmButton,
            selectedAlgorithm === alg && styles.algorithmButtonActive,
          ]}
          onPress={() => onSelect(alg)}
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
  );
}

export default function GridEscapeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateHighScore, addXP, completeAlgorithm } = useAppStore();

  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<PathfindingAlgorithmKey>('astar');
  const [isPlacingObstacles, setIsPlacingObstacles] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<PathfindingStep | null>(null);
  const [steps, setSteps] = useState<PathfindingStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = { row: 0, col: 0 };
  const end = { row: GRID_SIZE - 1, col: GRID_SIZE - 1 };

  // Initialize grid
  useEffect(() => {
    initializeGrid();
  }, []);

  const initializeGrid = (obstacles: { row: number; col: number }[] = []) => {
    const newGrid = createGrid(GRID_SIZE, GRID_SIZE, start, end, obstacles);
    setGrid(newGrid);
    setCurrentStep(null);
    setSteps([]);
    setStepIndex(0);
    setIsRunning(false);
    setIsPlacingObstacles(true);
  };

  const toggleObstacle = (row: number, col: number) => {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((r) => r.map((c) => ({ ...c })));
      newGrid[row][col].isObstacle = !newGrid[row][col].isObstacle;
      return newGrid;
    });
  };

  const runAlgorithm = useCallback(() => {
    setIsPlacingObstacles(false);
    setIsRunning(true);

    const generator = pathfindingGenerators[selectedAlgorithm](grid);
    const allSteps: PathfindingStep[] = [];

    for (const step of generator) {
      allSteps.push(step);
    }

    setSteps(allSteps);
    setStepIndex(0);

    // Animate through steps
    let index = 0;
    intervalRef.current = setInterval(() => {
      if (index < allSteps.length) {
        setCurrentStep(allSteps[index]);
        setStepIndex(index);

        // Update grid visualization
        setGrid(allSteps[index].grid);

        if (allSteps[index].isComplete) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          setIsRunning(false);

          // Award points if path found
          if (allSteps[index].path.length > 0) {
            updateHighScore('gridEscapeWins', 1);
            addXP(30);
            completeAlgorithm(selectedAlgorithm, 30);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }

        index++;
      }
    }, 100);
  }, [grid, selectedAlgorithm]);

  const resetGrid = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Keep obstacles when resetting
    const obstacles: { row: number; col: number }[] = [];
    grid.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell.isObstacle) {
          obstacles.push({ row: r, col: c });
        }
      });
    });

    initializeGrid(obstacles);
  };

  const clearAll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    initializeGrid();
  };

  const algorithmInfo = pathfindingAlgorithms[selectedAlgorithm];

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Grid Escape: {algorithmInfo.name}</Text>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Grid */}
        <View style={styles.gridContainer}>
          {grid.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.gridRow}>
              {row.map((cell, colIndex) => (
                <Cell
                  key={`${rowIndex}-${colIndex}`}
                  cell={cell}
                  onPress={() => toggleObstacle(rowIndex, colIndex)}
                  isPlacingObstacles={isPlacingObstacles}
                />
              ))}
            </View>
          ))}
        </View>

        {/* Frontier Panel */}
        {currentStep && currentStep.frontier.length > 0 && (
          <FrontierPanel frontier={currentStep.frontier} />
        )}

        {/* Stats */}
        {currentStep && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Nodes Visited</Text>
              <Text style={styles.statValue}>{currentStep.nodesVisited}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Operations</Text>
              <Text style={styles.statValue}>{currentStep.operationsCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Path Length</Text>
              <Text style={styles.statValue}>{currentStep.pathLength || '-'}</Text>
            </View>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, styles.obstacleButton]}
            onPress={() => setIsPlacingObstacles(!isPlacingObstacles)}
            disabled={isRunning}
          >
            <Ionicons name="add" size={20} color={Colors.white} />
            <Text style={styles.controlButtonText}>
              {isPlacingObstacles ? 'Placing...' : 'Place\nobstacles'}
            </Text>
          </TouchableOpacity>

          <AlgorithmSelector
            selectedAlgorithm={selectedAlgorithm}
            onSelect={setSelectedAlgorithm}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.clearButton]}
            onPress={clearAll}
            disabled={isRunning}
          >
            <Ionicons name="trash" size={20} color={Colors.alertCoral} />
            <Text style={[styles.actionButtonText, { color: Colors.alertCoral }]}>Clear All</Text>
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

        {/* Algorithm Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{algorithmInfo.name}</Text>
          <Text style={styles.infoDescription}>{algorithmInfo.description}</Text>
          <View style={styles.infoStats}>
            <Text style={styles.infoStat}>Time: {algorithmInfo.timeComplexity}</Text>
            <Text style={styles.infoStat}>Space: {algorithmInfo.spaceComplexity}</Text>
            <Text style={styles.infoStat}>Optimal: {algorithmInfo.optimal ? 'Yes' : 'No'}</Text>
          </View>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
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
  },
  cellIcon: {
    fontSize: 12,
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
    ...Shadows.small,
  },
  frontierTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.gray400,
    marginBottom: Spacing.sm,
  },
  frontierItems: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  frontierItem: {
    backgroundColor: Colors.info + '30',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    minWidth: 60,
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
    marginBottom: 2,
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.white,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  obstacleButton: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.gray600,
  },
  controlButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.white,
    textAlign: 'center',
  },
  algorithmSelector: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: 4,
  },
  algorithmButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  algorithmButtonActive: {
    backgroundColor: Colors.actionTeal,
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
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  clearButton: {
    backgroundColor: Colors.alertCoral + '20',
  },
  resetButton: {
    backgroundColor: Colors.logicGold + '20',
  },
  runButton: {
    backgroundColor: Colors.actionTeal,
  },
  runButtonDisabled: {
    backgroundColor: Colors.gray600,
  },
  actionButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
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
  infoStat: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    fontFamily: 'monospace',
  },
});
