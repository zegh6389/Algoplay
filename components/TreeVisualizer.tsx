// Tree Visualizer Component with Physics-Based Animations
import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolateColor,
  useDerivedValue,
} from 'react-native-reanimated';
import Svg, { Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors, BorderRadius, Shadows } from '@/constants/theme';
import { TreeNode } from '@/utils/algorithms/trees';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_WIDTH = SCREEN_WIDTH - 32;
const NODE_SIZE = 44;

interface TreeVisualizerProps {
  root: TreeNode | null;
  highlightedNodeIds?: string[];
  pathNodeIds?: string[];
  visitedNodeIds?: string[];
  showGlowingTrail?: boolean;
}

interface TreeNodeComponentProps {
  node: TreeNode;
  highlightedNodeIds: string[];
  pathNodeIds: string[];
  visitedNodeIds: string[];
  showGlowingTrail: boolean;
}

const AnimatedLine = Animated.createAnimatedComponent(Line);

function TreeNodeComponent({
  node,
  highlightedNodeIds,
  pathNodeIds,
  visitedNodeIds,
  showGlowingTrail,
}: TreeNodeComponentProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const posX = useSharedValue(node.targetX);
  const posY = useSharedValue(node.targetY);

  // Determine highlight state
  const isHighlighted = highlightedNodeIds.includes(node.id);
  const isPath = pathNodeIds.includes(node.id);
  const isVisited = visitedNodeIds.includes(node.id);

  // Animate position changes with spring physics
  React.useEffect(() => {
    posX.value = withSpring(node.targetX, {
      damping: 15,
      stiffness: 100,
      mass: 0.5,
    });
    posY.value = withSpring(node.targetY, {
      damping: 15,
      stiffness: 100,
      mass: 0.5,
    });
  }, [node.targetX, node.targetY]);

  // Animate scale on highlight
  React.useEffect(() => {
    if (isHighlighted || node.highlightType !== 'none') {
      scale.value = withSpring(1.15, { damping: 8, stiffness: 200 });
    } else {
      scale.value = withSpring(1, { damping: 10 });
    }
  }, [isHighlighted, node.highlightType]);

  const getNodeColor = useCallback(() => {
    if (node.highlightType === 'inserting') return Colors.success;
    if (node.highlightType === 'current') return Colors.logicGold;
    if (node.highlightType === 'comparing') return Colors.alertCoral;
    if (node.highlightType === 'path') return Colors.actionTeal;
    if (node.highlightType === 'visited') return Colors.info;
    if (node.highlightType === 'rotating') return Colors.frontier;
    if (isPath) return Colors.actionTeal;
    if (isHighlighted) return Colors.logicGold;
    if (isVisited) return Colors.info + '80';
    return Colors.cardBackground;
  }, [node.highlightType, isHighlighted, isPath, isVisited]);

  const getBorderColor = useCallback(() => {
    if (node.highlightType === 'inserting') return Colors.success;
    if (node.highlightType === 'current') return Colors.logicGold;
    if (node.highlightType === 'comparing') return Colors.alertCoral;
    if (node.highlightType === 'path') return Colors.actionTeal;
    if (isPath) return Colors.actionTeal;
    if (isHighlighted) return Colors.logicGold;
    return Colors.gray600;
  }, [node.highlightType, isHighlighted, isPath]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: posX.value - NODE_SIZE / 2 },
      { translateY: posY.value - NODE_SIZE / 2 },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const shouldGlow = showGlowingTrail && (isPath || isHighlighted || node.highlightType !== 'none');

  return (
    <Animated.View
      style={[
        styles.node,
        animatedStyle,
        {
          backgroundColor: getNodeColor(),
          borderColor: getBorderColor(),
        },
        shouldGlow && styles.nodeGlow,
      ]}
    >
      <Animated.Text style={styles.nodeText}>{node.value}</Animated.Text>
    </Animated.View>
  );
}

function TreeEdges({
  root,
  pathNodeIds,
  showGlowingTrail,
}: {
  root: TreeNode;
  pathNodeIds: string[];
  showGlowingTrail: boolean;
}) {
  const edges: { from: TreeNode; to: TreeNode; isPath: boolean }[] = [];

  const collectEdges = (node: TreeNode | null) => {
    if (!node) return;
    if (node.left) {
      const isPathEdge = pathNodeIds.includes(node.id) && pathNodeIds.includes(node.left.id);
      edges.push({ from: node, to: node.left, isPath: isPathEdge });
      collectEdges(node.left);
    }
    if (node.right) {
      const isPathEdge = pathNodeIds.includes(node.id) && pathNodeIds.includes(node.right.id);
      edges.push({ from: node, to: node.right, isPath: isPathEdge });
      collectEdges(node.right);
    }
  };

  collectEdges(root);

  return (
    <Svg style={StyleSheet.absoluteFill} width={CANVAS_WIDTH} height={400}>
      <Defs>
        <LinearGradient id="glowGradient" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={Colors.actionTeal} stopOpacity="0.3" />
          <Stop offset="0.5" stopColor={Colors.actionTeal} stopOpacity="0.8" />
          <Stop offset="1" stopColor={Colors.actionTeal} stopOpacity="0.3" />
        </LinearGradient>
      </Defs>
      {edges.map((edge, index) => (
        <React.Fragment key={index}>
          {/* Glow effect for path edges */}
          {showGlowingTrail && edge.isPath && (
            <Line
              x1={edge.from.targetX}
              y1={edge.from.targetY}
              x2={edge.to.targetX}
              y2={edge.to.targetY}
              stroke={Colors.actionTeal}
              strokeWidth={8}
              strokeOpacity={0.3}
              strokeLinecap="round"
            />
          )}
          {/* Main edge */}
          <Line
            x1={edge.from.targetX}
            y1={edge.from.targetY}
            x2={edge.to.targetX}
            y2={edge.to.targetY}
            stroke={edge.isPath ? Colors.actionTeal : Colors.gray600}
            strokeWidth={edge.isPath ? 3 : 2}
            strokeLinecap="round"
          />
        </React.Fragment>
      ))}
    </Svg>
  );
}

export default function TreeVisualizer({
  root,
  highlightedNodeIds = [],
  pathNodeIds = [],
  visitedNodeIds = [],
  showGlowingTrail = true,
}: TreeVisualizerProps) {
  const nodes = useMemo(() => {
    const result: TreeNode[] = [];
    const collectNodes = (node: TreeNode | null) => {
      if (!node) return;
      result.push(node);
      collectNodes(node.left);
      collectNodes(node.right);
    };
    collectNodes(root);
    return result;
  }, [root]);

  if (!root) {
    return (
      <View style={styles.emptyContainer}>
        <Animated.Text style={styles.emptyText}>Tree is empty</Animated.Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TreeEdges
        root={root}
        pathNodeIds={pathNodeIds}
        showGlowingTrail={showGlowingTrail}
      />
      {nodes.map((node) => (
        <TreeNodeComponent
          key={node.id}
          node={node}
          highlightedNodeIds={highlightedNodeIds}
          pathNodeIds={pathNodeIds}
          visitedNodeIds={visitedNodeIds}
          showGlowingTrail={showGlowingTrail}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CANVAS_WIDTH,
    height: 350,
    position: 'relative',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  emptyContainer: {
    width: CANVAS_WIDTH,
    height: 200,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.gray500,
    fontSize: 14,
  },
  node: {
    position: 'absolute',
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    ...Shadows.medium,
  },
  nodeGlow: {
    shadowColor: Colors.actionTeal,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
  },
  nodeText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
