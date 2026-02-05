// Algorithm Mastery Tree - RPG-Style Skill Tree Navigation Hub
// Hierarchical progression with locked/unlocked states and glowing effects
import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Svg, { Line, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { Colors, BorderRadius, Spacing, FontSizes, Shadows } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Algorithm skill tree structure
interface SkillTreeNode {
  id: string;
  name: string;
  category: 'sorting' | 'searching' | 'graphs' | 'trees' | 'dp';
  icon: keyof typeof Ionicons.glyphMap;
  xpRequired: number;
  description: string;
  prerequisites: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  position: { row: number; col: number };
}

const SKILL_TREE: SkillTreeNode[] = [
  // Row 0 - Foundations
  {
    id: 'linear-search',
    name: 'Linear Search',
    category: 'searching',
    icon: 'search',
    xpRequired: 0,
    description: 'Sequential search through elements',
    prerequisites: [],
    difficulty: 'beginner',
    position: { row: 0, col: 0 },
  },
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'sorting',
    icon: 'swap-horizontal',
    xpRequired: 0,
    description: 'Compare adjacent elements and swap',
    prerequisites: [],
    difficulty: 'beginner',
    position: { row: 0, col: 2 },
  },
  // Row 1
  {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'searching',
    icon: 'git-compare',
    xpRequired: 100,
    description: 'Divide and conquer search',
    prerequisites: ['linear-search'],
    difficulty: 'beginner',
    position: { row: 1, col: 0 },
  },
  {
    id: 'selection-sort',
    name: 'Selection Sort',
    category: 'sorting',
    icon: 'checkmark-circle',
    xpRequired: 100,
    description: 'Find minimum and place it',
    prerequisites: ['bubble-sort'],
    difficulty: 'beginner',
    position: { row: 1, col: 1 },
  },
  {
    id: 'insertion-sort',
    name: 'Insertion Sort',
    category: 'sorting',
    icon: 'arrow-down',
    xpRequired: 100,
    description: 'Insert elements in sorted order',
    prerequisites: ['bubble-sort'],
    difficulty: 'beginner',
    position: { row: 1, col: 2 },
  },
  // Row 2
  {
    id: 'bfs',
    name: 'BFS',
    category: 'graphs',
    icon: 'layers',
    xpRequired: 200,
    description: 'Level-by-level traversal',
    prerequisites: ['binary-search'],
    difficulty: 'intermediate',
    position: { row: 2, col: 0 },
  },
  {
    id: 'dfs',
    name: 'DFS',
    category: 'graphs',
    icon: 'git-branch',
    xpRequired: 200,
    description: 'Depth-first exploration',
    prerequisites: ['binary-search'],
    difficulty: 'intermediate',
    position: { row: 2, col: 1 },
  },
  {
    id: 'merge-sort',
    name: 'Merge Sort',
    category: 'sorting',
    icon: 'git-merge',
    xpRequired: 300,
    description: 'Divide, sort, and merge',
    prerequisites: ['selection-sort', 'insertion-sort'],
    difficulty: 'intermediate',
    position: { row: 2, col: 2 },
  },
  // Row 3
  {
    id: 'dijkstra',
    name: 'Dijkstra',
    category: 'graphs',
    icon: 'navigate',
    xpRequired: 400,
    description: 'Shortest path with weights',
    prerequisites: ['bfs', 'dfs'],
    difficulty: 'advanced',
    position: { row: 3, col: 0 },
  },
  {
    id: 'quick-sort',
    name: 'Quick Sort',
    category: 'sorting',
    icon: 'flash',
    xpRequired: 400,
    description: 'Pivot-based partitioning',
    prerequisites: ['merge-sort'],
    difficulty: 'advanced',
    position: { row: 3, col: 1 },
  },
  {
    id: 'bst-operations',
    name: 'BST Operations',
    category: 'trees',
    icon: 'git-network',
    xpRequired: 400,
    description: 'Binary Search Tree mastery',
    prerequisites: ['merge-sort'],
    difficulty: 'advanced',
    position: { row: 3, col: 2 },
  },
  // Row 4 - Expert
  {
    id: 'astar',
    name: 'A* Search',
    category: 'graphs',
    icon: 'star',
    xpRequired: 600,
    description: 'Heuristic-guided pathfinding',
    prerequisites: ['dijkstra'],
    difficulty: 'expert',
    position: { row: 4, col: 0 },
  },
  {
    id: 'heap-sort',
    name: 'Heap Sort',
    category: 'sorting',
    icon: 'triangle',
    xpRequired: 600,
    description: 'Heap-based sorting',
    prerequisites: ['quick-sort', 'bst-operations'],
    difficulty: 'expert',
    position: { row: 4, col: 1 },
  },
  {
    id: 'avl-tree',
    name: 'AVL Tree',
    category: 'trees',
    icon: 'analytics',
    xpRequired: 600,
    description: 'Self-balancing BST',
    prerequisites: ['bst-operations'],
    difficulty: 'expert',
    position: { row: 4, col: 2 },
  },
];

const NODE_SIZE = 70;
const ROW_GAP = 100;
const COL_GAP = (SCREEN_WIDTH - 40) / 3;

const difficultyColors = {
  beginner: Colors.neonLime,
  intermediate: Colors.neonYellow,
  advanced: Colors.neonOrange,
  expert: Colors.neonPink,
};

interface AlgorithmMasteryTreeProps {
  onSelectAlgorithm: (algorithmId: string) => void;
}

export default function AlgorithmMasteryTree({ onSelectAlgorithm }: AlgorithmMasteryTreeProps) {
  const { userProgress } = useAppStore();
  const totalXP = userProgress.totalXP;
  const completedAlgorithms = userProgress.completedAlgorithms;

  // Calculate which nodes are unlocked
  const nodeStates = useMemo(() => {
    const states: Record<string, 'locked' | 'available' | 'completed'> = {};

    SKILL_TREE.forEach((node) => {
      const hasXP = totalXP >= node.xpRequired;
      const hasPrereqs = node.prerequisites.every((preReq) => completedAlgorithms.includes(preReq));
      const isCompleted = completedAlgorithms.includes(node.id);

      if (isCompleted) {
        states[node.id] = 'completed';
      } else if (hasXP && hasPrereqs) {
        states[node.id] = 'available';
      } else {
        states[node.id] = 'locked';
      }
    });

    return states;
  }, [totalXP, completedAlgorithms]);

  // Generate connection lines between nodes
  const connections = useMemo(() => {
    const lines: Array<{ from: SkillTreeNode; to: SkillTreeNode; isActive: boolean }> = [];

    SKILL_TREE.forEach((node) => {
      node.prerequisites.forEach((preReqId) => {
        const preReqNode = SKILL_TREE.find((n) => n.id === preReqId);
        if (preReqNode) {
          const isActive = nodeStates[preReqId] === 'completed';
          lines.push({ from: preReqNode, to: node, isActive });
        }
      });
    });

    return lines;
  }, [nodeStates]);

  const getNodePosition = useCallback((node: SkillTreeNode) => {
    const x = 20 + node.position.col * COL_GAP + COL_GAP / 2 - NODE_SIZE / 2;
    const y = 40 + node.position.row * ROW_GAP;
    return { x, y };
  }, []);

  const maxRow = Math.max(...SKILL_TREE.map((n) => n.position.row));
  const treeHeight = (maxRow + 1) * ROW_GAP + 100;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { height: treeHeight }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Background Grid */}
      <View style={styles.gridBackground}>
        {Array.from({ length: 20 }).map((_, i) => (
          <View key={i} style={[styles.gridLine, { top: i * 50 }]} />
        ))}
      </View>

      {/* Connection Lines */}
      <Svg style={StyleSheet.absoluteFill} width={SCREEN_WIDTH - 40} height={treeHeight}>
        <Defs>
          <SvgGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={Colors.neonCyan} stopOpacity="1" />
            <Stop offset="1" stopColor={Colors.neonLime} stopOpacity="0.8" />
          </SvgGradient>
          <SvgGradient id="lockedGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={Colors.gray600} stopOpacity="0.5" />
            <Stop offset="1" stopColor={Colors.gray700} stopOpacity="0.3" />
          </SvgGradient>
        </Defs>
        {connections.map((conn, idx) => {
          const fromPos = getNodePosition(conn.from);
          const toPos = getNodePosition(conn.to);
          return (
            <React.Fragment key={idx}>
              {conn.isActive && (
                <Line
                  x1={fromPos.x + NODE_SIZE / 2}
                  y1={fromPos.y + NODE_SIZE}
                  x2={toPos.x + NODE_SIZE / 2}
                  y2={toPos.y}
                  stroke={Colors.neonCyan}
                  strokeWidth={8}
                  strokeOpacity={0.2}
                  strokeLinecap="round"
                />
              )}
              <Line
                x1={fromPos.x + NODE_SIZE / 2}
                y1={fromPos.y + NODE_SIZE}
                x2={toPos.x + NODE_SIZE / 2}
                y2={toPos.y}
                stroke={conn.isActive ? Colors.neonCyan : Colors.gray600}
                strokeWidth={conn.isActive ? 3 : 2}
                strokeLinecap="round"
                strokeDasharray={conn.isActive ? undefined : '5,5'}
              />
            </React.Fragment>
          );
        })}
      </Svg>

      {/* Skill Nodes */}
      {SKILL_TREE.map((node, index) => {
        const state = nodeStates[node.id];
        const pos = getNodePosition(node);
        return (
          <SkillNode
            key={node.id}
            node={node}
            state={state}
            position={pos}
            index={index}
            onPress={() => {
              if (state !== 'locked') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onSelectAlgorithm(node.id);
              } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              }
            }}
          />
        );
      })}

      {/* Legend */}
      <View style={styles.legend}>
        <Animated.Text style={styles.legendTitle}>Difficulty Levels</Animated.Text>
        <View style={styles.legendItems}>
          {(['beginner', 'intermediate', 'advanced', 'expert'] as const).map((diff) => (
            <View key={diff} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: difficultyColors[diff] }]} />
              <Animated.Text style={styles.legendText}>{diff}</Animated.Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

interface SkillNodeProps {
  node: SkillTreeNode;
  state: 'locked' | 'available' | 'completed';
  position: { x: number; y: number };
  index: number;
  onPress: () => void;
}

function SkillNode({ node, state, position, index, onPress }: SkillNodeProps) {
  const glowOpacity = useSharedValue(0);
  const scale = useSharedValue(1);
  const encryptedPulse = useSharedValue(0);

  const diffColor = difficultyColors[node.difficulty];

  React.useEffect(() => {
    if (state === 'available') {
      // Pulsing glow for available nodes
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else if (state === 'locked') {
      // Encrypted glitch effect for locked nodes
      encryptedPulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 100 }),
          withTiming(0, { duration: 2000 }),
          withTiming(1, { duration: 50 }),
          withTiming(0, { duration: 1500 })
        ),
        -1
      );
    } else if (state === 'completed') {
      glowOpacity.value = 0.6;
    }
  }, [state]);

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10 });
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const encryptedStyle = useAnimatedStyle(() => ({
    opacity: encryptedPulse.value * 0.5,
  }));

  const getBgColor = () => {
    if (state === 'completed') return diffColor;
    if (state === 'available') return Colors.surfaceDark;
    return Colors.gray800;
  };

  const getBorderColor = () => {
    if (state === 'completed') return diffColor;
    if (state === 'available') return diffColor;
    return Colors.gray700;
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      style={[
        styles.nodeContainer,
        { left: position.x, top: position.y },
        containerStyle,
      ]}
    >
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        {/* Glow effect */}
        {state !== 'locked' && (
          <Animated.View
            style={[
              styles.nodeGlow,
              { backgroundColor: diffColor },
              glowStyle,
            ]}
          />
        )}

        {/* Encrypted overlay for locked nodes */}
        {state === 'locked' && (
          <Animated.View style={[styles.encryptedOverlay, encryptedStyle]}>
            <Animated.Text style={styles.encryptedText}>◈◈◈</Animated.Text>
          </Animated.View>
        )}

        {/* Main node */}
        <View
          style={[
            styles.node,
            {
              backgroundColor: getBgColor(),
              borderColor: getBorderColor(),
            },
            state === 'completed' && {
              shadowColor: diffColor,
              shadowOpacity: 0.6,
              shadowRadius: 12,
            },
          ]}
        >
          <Ionicons
            name={state === 'locked' ? 'lock-closed' : node.icon}
            size={24}
            color={state === 'locked' ? Colors.gray500 : state === 'completed' ? Colors.background : diffColor}
          />
        </View>

        {/* Node label */}
        <Animated.Text
          style={[
            styles.nodeLabel,
            state === 'locked' && styles.nodeLabelLocked,
          ]}
          numberOfLines={2}
        >
          {state === 'locked' ? '???' : node.name}
        </Animated.Text>

        {/* XP requirement badge */}
        {state === 'locked' && node.xpRequired > 0 && (
          <View style={styles.xpBadge}>
            <Animated.Text style={styles.xpBadgeText}>{node.xpRequired} XP</Animated.Text>
          </View>
        )}

        {/* Completed checkmark */}
        {state === 'completed' && (
          <View style={[styles.completedBadge, { backgroundColor: diffColor }]}>
            <Ionicons name="checkmark" size={12} color={Colors.background} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    position: 'relative',
    paddingHorizontal: 20,
  },
  gridBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.neonCyan,
  },
  nodeContainer: {
    position: 'absolute',
    width: NODE_SIZE,
    alignItems: 'center',
  },
  nodeGlow: {
    position: 'absolute',
    width: NODE_SIZE + 20,
    height: NODE_SIZE + 20,
    borderRadius: (NODE_SIZE + 20) / 2,
    top: -10,
    left: -10,
  },
  node: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.medium,
  },
  nodeLabel: {
    marginTop: 6,
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    width: NODE_SIZE + 20,
  },
  nodeLabelLocked: {
    color: Colors.gray500,
    fontStyle: 'italic',
  },
  xpBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.neonYellow,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  xpBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.background,
  },
  completedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  encryptedOverlay: {
    position: 'absolute',
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    backgroundColor: Colors.neonCyan,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  encryptedText: {
    fontSize: 14,
    color: Colors.background,
    fontWeight: '700',
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.gray700,
    padding: Spacing.md,
  },
  legendTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.gray400,
    marginBottom: Spacing.sm,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
});
