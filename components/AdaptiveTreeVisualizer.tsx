// Adaptive Tree Visualizer with Dynamic Scaling, Laser Path Tracing, and Shockwave Pulses
import React, { useMemo, useCallback, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  Easing,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Line, Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import { Colors, BorderRadius, Shadows } from '@/constants/theme';
import { TreeNode } from '@/utils/algorithms/trees';

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_WIDTH = SCREEN_WIDTH - 32;
const BASE_NODE_SIZE = 52;
const MIN_NODE_SIZE = 22;
const MIN_CANVAS_HEIGHT = 380;
const MIDNIGHT_BLACK = '#0a0e17';

interface AdaptiveTreeVisualizerProps {
  root: TreeNode | null;
  highlightedNodeIds?: string[];
  pathNodeIds?: string[];
  visitedNodeIds?: string[];
  showLaserTracing?: boolean;
  showShockwave?: boolean;
  enableScrolling?: boolean;
  animationSpeed?: 'slow' | 'normal' | 'fast';
  onNodeVisited?: (nodeId: string) => void;
}

interface TreeMetrics {
  depth: number;
  width: number;
  totalNodes: number;
  maxNodesAtLevel: number;
  scaleFactor: number;
  nodeSize: number;
}

// Calculate comprehensive tree metrics for adaptive sizing
const calculateTreeMetrics = (root: TreeNode | null): TreeMetrics => {
  if (!root) {
    return { depth: 0, width: 0, totalNodes: 0, maxNodesAtLevel: 0, scaleFactor: 1, nodeSize: BASE_NODE_SIZE };
  }

  let totalNodes = 0;
  let maxDepth = 0;
  const nodesPerLevel: number[] = [];

  const traverse = (node: TreeNode | null, depth: number) => {
    if (!node) return;
    totalNodes++;
    maxDepth = Math.max(maxDepth, depth);
    nodesPerLevel[depth] = (nodesPerLevel[depth] || 0) + 1;
    traverse(node.left, depth + 1);
    traverse(node.right, depth + 1);
  };

  traverse(root, 0);

  const maxNodesAtLevel = Math.max(...nodesPerLevel, 1);

  // Adaptive scaling logic: scale down from 1.0x to 0.4x based on depth and width
  // Depth factor: deeper trees need smaller nodes
  const depthFactor = Math.max(0.4, 1 - (maxDepth - 3) * 0.12);
  // Width factor: wider trees need smaller nodes
  const widthFactor = Math.max(0.4, 1 - (maxNodesAtLevel - 4) * 0.1);
  // Total nodes factor
  const totalFactor = Math.max(0.5, 1 - (totalNodes - 7) * 0.05);

  // Combined scale factor, clamped between 0.4 and 1.0
  const scaleFactor = Math.min(1, Math.max(0.4, depthFactor * widthFactor * totalFactor));
  const nodeSize = Math.max(MIN_NODE_SIZE, BASE_NODE_SIZE * scaleFactor);

  return {
    depth: maxDepth + 1,
    width: maxNodesAtLevel,
    totalNodes,
    maxNodesAtLevel,
    scaleFactor,
    nodeSize,
  };
};

// Count descendants for spacing calculation
const countDescendants = (node: TreeNode | null): number => {
  if (!node) return 0;
  return 1 + countDescendants(node.left) + countDescendants(node.right);
};

// Calculate adaptive positions based on descendant counts
const calculateAdaptivePositions = (
  root: TreeNode | null,
  canvasWidth: number,
  metrics: TreeMetrics,
  startY: number = 50
): void => {
  if (!root) return;

  const { nodeSize, depth } = metrics;
  const minHorizontalGap = nodeSize * 0.4;
  const verticalGap = Math.max(60, 85 - (depth - 3) * 8);

  // Calculate position using descendant-based "neighborhood" room
  const positionSubtree = (
    node: TreeNode | null,
    leftBound: number,
    rightBound: number,
    y: number,
    nodeDepth: number
  ): void => {
    if (!node) return;

    const availableWidth = rightBound - leftBound;
    const leftDescendants = countDescendants(node.left);
    const rightDescendants = countDescendants(node.right);
    const totalDescendants = leftDescendants + rightDescendants;

    // Calculate position based on descendant distribution
    let nodeX: number;
    if (totalDescendants === 0) {
      nodeX = (leftBound + rightBound) / 2;
    } else {
      // Weight position by descendants to prevent overlap
      const leftWeight = leftDescendants + 0.5;
      const rightWeight = rightDescendants + 0.5;
      const totalWeight = leftWeight + rightWeight;
      nodeX = leftBound + (leftWeight / totalWeight) * availableWidth;
    }

    // Clamp to bounds with padding
    const padding = nodeSize / 2 + minHorizontalGap;
    nodeX = Math.max(leftBound + padding, Math.min(rightBound - padding, nodeX));

    node.targetX = nodeX;
    node.targetY = y;
    node.depth = nodeDepth;

    // Calculate child bounds based on descendant counts
    if (node.left || node.right) {
      const childY = y + verticalGap;

      if (node.left && node.right) {
        // Split available space proportionally
        const leftRatio = (leftDescendants + 1) / (totalDescendants + 2);
        const splitPoint = leftBound + (rightBound - leftBound) * leftRatio;

        positionSubtree(node.left, leftBound, splitPoint, childY, nodeDepth + 1);
        positionSubtree(node.right, splitPoint, rightBound, childY, nodeDepth + 1);
      } else if (node.left) {
        positionSubtree(node.left, leftBound, nodeX, childY, nodeDepth + 1);
      } else if (node.right) {
        positionSubtree(node.right, nodeX, rightBound, childY, nodeDepth + 1);
      }
    }
  };

  positionSubtree(root, 0, canvasWidth, startY, 0);
};

// Shockwave Pulse Effect Component
function ShockwavePulse({
  x,
  y,
  nodeSize,
  color,
  isActive,
  delay = 0,
}: {
  x: number;
  y: number;
  nodeSize: number;
  color: string;
  isActive: boolean;
  delay?: number;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      scale.value = 1;
      opacity.value = 0;

      scale.value = withDelay(
        delay,
        withSequence(
          withTiming(1, { duration: 0 }),
          withTiming(3, { duration: 800, easing: Easing.out(Easing.cubic) })
        )
      );
      opacity.value = withDelay(
        delay,
        withSequence(
          withTiming(0.7, { duration: 100 }),
          withTiming(0, { duration: 700, easing: Easing.out(Easing.ease) })
        )
      );
    }
  }, [isActive, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x - nodeSize / 2,
    top: y - nodeSize / 2,
    width: nodeSize,
    height: nodeSize,
    borderRadius: nodeSize / 2,
    borderWidth: 2,
    borderColor: color,
    backgroundColor: 'transparent',
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={animatedStyle} />;
}

// Tree Node Component with adaptive sizing and animations
function AdaptiveTreeNode({
  node,
  nodeSize,
  highlightedNodeIds,
  pathNodeIds,
  visitedNodeIds,
  showShockwave,
  onVisited,
}: {
  node: TreeNode;
  nodeSize: number;
  highlightedNodeIds: string[];
  pathNodeIds: string[];
  visitedNodeIds: string[];
  showShockwave: boolean;
  onVisited?: (nodeId: string) => void;
}) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const posX = useSharedValue(node.targetX);
  const posY = useSharedValue(node.targetY);
  const pulseScale = useSharedValue(1);

  const isHighlighted = highlightedNodeIds.includes(node.id);
  const isPath = pathNodeIds.includes(node.id);
  const isVisited = visitedNodeIds.includes(node.id);
  const hasHighlightType = node.highlightType !== 'none';

  // Animate position changes
  useEffect(() => {
    posX.value = withSpring(node.targetX, { damping: 18, stiffness: 120, mass: 0.6 });
    posY.value = withSpring(node.targetY, { damping: 18, stiffness: 120, mass: 0.6 });
  }, [node.targetX, node.targetY]);

  // Animate highlight states
  useEffect(() => {
    if (isHighlighted || hasHighlightType) {
      scale.value = withSpring(1.12, { damping: 10, stiffness: 180 });
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 350, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.4, { duration: 350, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      // Pulse animation for newly visited nodes
      if (node.highlightType === 'visited' || isVisited) {
        pulseScale.value = withSequence(
          withTiming(1.25, { duration: 150, easing: Easing.out(Easing.back(2)) }),
          withSpring(1, { damping: 8, stiffness: 200 })
        );
        if (onVisited) onVisited(node.id);
      }
    } else {
      scale.value = withSpring(1, { damping: 12 });
      glowOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [isHighlighted, hasHighlightType, isVisited]);

  const getNodeColor = useCallback(() => {
    if (node.highlightType === 'inserting') return Colors.neonLime;
    if (node.highlightType === 'current') return Colors.neonYellow;
    if (node.highlightType === 'comparing') return Colors.neonPink;
    if (node.highlightType === 'path') return Colors.neonCyan;
    if (node.highlightType === 'visited') return Colors.info;
    if (node.highlightType === 'rotating') return Colors.neonPurple;
    if (isPath) return Colors.neonCyan;
    if (isHighlighted) return Colors.neonYellow;
    if (isVisited) return Colors.visited;
    return Colors.cardBackground;
  }, [node.highlightType, isHighlighted, isPath, isVisited]);

  const getBorderColor = useCallback(() => {
    if (node.highlightType !== 'none') return getNodeColor();
    if (isPath) return Colors.neonCyan;
    if (isHighlighted) return Colors.neonYellow;
    return Colors.gray600;
  }, [node.highlightType, isHighlighted, isPath, getNodeColor]);

  const getGlowColor = useCallback(() => {
    const color = getNodeColor();
    return color === Colors.cardBackground ? Colors.neonCyan : color;
  }, [getNodeColor]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: posX.value - nodeSize / 2 },
      { translateY: posY.value - nodeSize / 2 },
      { scale: scale.value * pulseScale.value },
    ],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [
      { translateX: posX.value - nodeSize / 2 - 6 },
      { translateY: posY.value - nodeSize / 2 - 6 },
    ],
  }));

  const nodeColor = getNodeColor();
  const shouldGlow = isPath || isHighlighted || hasHighlightType;

  // High-contrast text: Midnight Black for neon backgrounds
  const textColor = nodeColor === Colors.cardBackground ? Colors.textPrimary : MIDNIGHT_BLACK;

  // Dynamic font size based on node size and value
  const fontSize = Math.max(10, Math.min(16, nodeSize * 0.32));
  const valueStr = String(node.value);
  const fontSizeAdjusted = valueStr.length > 2 ? fontSize * 0.85 : fontSize;

  return (
    <>
      {/* Shockwave pulse effect */}
      {showShockwave && (isVisited || node.highlightType === 'visited') && (
        <ShockwavePulse
          x={node.targetX}
          y={node.targetY}
          nodeSize={nodeSize}
          color={getGlowColor()}
          isActive={isVisited || node.highlightType === 'visited'}
        />
      )}

      {/* Glow effect */}
      {shouldGlow && (
        <Animated.View
          style={[
            styles.nodeGlow,
            {
              width: nodeSize + 12,
              height: nodeSize + 12,
              borderRadius: (nodeSize + 12) / 2,
              backgroundColor: getGlowColor() + '25',
            },
            glowAnimatedStyle,
          ]}
        />
      )}

      {/* Main node */}
      <Animated.View
        style={[
          styles.node,
          {
            width: nodeSize,
            height: nodeSize,
            borderRadius: nodeSize / 2,
            backgroundColor: nodeColor,
            borderColor: getBorderColor(),
            borderWidth: Math.max(2, nodeSize * 0.06),
          },
          shouldGlow && {
            shadowColor: getGlowColor(),
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 14,
            elevation: 12,
          },
          animatedStyle,
        ]}
      >
        <Animated.Text
          style={[
            styles.nodeText,
            {
              color: textColor,
              fontSize: fontSizeAdjusted,
              fontWeight: '700',
            },
          ]}
        >
          {node.value}
        </Animated.Text>
      </Animated.View>
    </>
  );
}

// Laser Path Tracing Edge Component
function LaserEdge({
  from,
  to,
  isPath,
  isVisited,
  showLaserTracing,
  index,
  animationSpeed,
}: {
  from: TreeNode;
  to: TreeNode;
  isPath: boolean;
  isVisited: boolean;
  showLaserTracing: boolean;
  index: number;
  animationSpeed: 'slow' | 'normal' | 'fast';
}) {
  const progress = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  const speedMap = { slow: 600, normal: 400, fast: 200 };
  const duration = speedMap[animationSpeed];

  useEffect(() => {
    if (showLaserTracing && (isPath || isVisited)) {
      progress.value = 0;
      glowOpacity.value = 0;

      progress.value = withDelay(
        index * 100,
        withTiming(1, { duration, easing: Easing.out(Easing.cubic) })
      );
      glowOpacity.value = withDelay(
        index * 100,
        withSequence(
          withTiming(1, { duration: duration / 2 }),
          withTiming(0.4, { duration: duration / 2 })
        )
      );
    } else if (!isPath && !isVisited) {
      progress.value = withTiming(1, { duration: 100 });
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isPath, isVisited, showLaserTracing]);

  const isActive = isPath || isVisited;
  const strokeColor = isPath ? Colors.neonCyan : isVisited ? Colors.visited : Colors.gray600;
  const strokeWidth = isPath ? 3.5 : isVisited ? 3 : 2;

  return (
    <G>
      {/* Glow layer for active edges */}
      {showLaserTracing && isActive && (
        <Line
          x1={from.targetX}
          y1={from.targetY}
          x2={to.targetX}
          y2={to.targetY}
          stroke={strokeColor}
          strokeWidth={12}
          strokeOpacity={0.2}
          strokeLinecap="round"
        />
      )}
      {/* Main edge */}
      <Line
        x1={from.targetX}
        y1={from.targetY}
        x2={to.targetX}
        y2={to.targetY}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </G>
  );
}

// Tree Edges Container with Laser Tracing
function AdaptiveTreeEdges({
  root,
  pathNodeIds,
  visitedNodeIds,
  showLaserTracing,
  canvasWidth,
  canvasHeight,
  animationSpeed,
}: {
  root: TreeNode;
  pathNodeIds: string[];
  visitedNodeIds: string[];
  showLaserTracing: boolean;
  canvasWidth: number;
  canvasHeight: number;
  animationSpeed: 'slow' | 'normal' | 'fast';
}) {
  const edges: { from: TreeNode; to: TreeNode; isPath: boolean; isVisited: boolean }[] = [];
  let edgeIndex = 0;

  const collectEdges = (node: TreeNode | null) => {
    if (!node) return;
    if (node.left) {
      const isPathEdge = pathNodeIds.includes(node.id) && pathNodeIds.includes(node.left.id);
      const isVisitedEdge = visitedNodeIds.includes(node.id) && visitedNodeIds.includes(node.left.id);
      edges.push({ from: node, to: node.left, isPath: isPathEdge, isVisited: isVisitedEdge });
      collectEdges(node.left);
    }
    if (node.right) {
      const isPathEdge = pathNodeIds.includes(node.id) && pathNodeIds.includes(node.right.id);
      const isVisitedEdge = visitedNodeIds.includes(node.id) && visitedNodeIds.includes(node.right.id);
      edges.push({ from: node, to: node.right, isPath: isPathEdge, isVisited: isVisitedEdge });
      collectEdges(node.right);
    }
  };

  collectEdges(root);

  return (
    <Svg style={StyleSheet.absoluteFill} width={canvasWidth} height={canvasHeight}>
      <Defs>
        <LinearGradient id="laserGradient" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={Colors.neonCyan} stopOpacity="0.2" />
          <Stop offset="0.5" stopColor={Colors.neonCyan} stopOpacity="1" />
          <Stop offset="1" stopColor={Colors.neonCyan} stopOpacity="0.2" />
        </LinearGradient>
        <LinearGradient id="visitedGradient" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={Colors.visited} stopOpacity="0.2" />
          <Stop offset="0.5" stopColor={Colors.visited} stopOpacity="0.8" />
          <Stop offset="1" stopColor={Colors.visited} stopOpacity="0.2" />
        </LinearGradient>
      </Defs>
      {edges.map((edge, idx) => (
        <LaserEdge
          key={idx}
          from={edge.from}
          to={edge.to}
          isPath={edge.isPath}
          isVisited={edge.isVisited}
          showLaserTracing={showLaserTracing}
          index={idx}
          animationSpeed={animationSpeed}
        />
      ))}
    </Svg>
  );
}

// Calculate tree bounds
const calculateTreeBounds = (
  root: TreeNode | null,
  metrics: TreeMetrics
): { minX: number; maxX: number; minY: number; maxY: number } => {
  if (!root) return { minX: 0, maxX: CANVAS_WIDTH, minY: 0, maxY: MIN_CANVAS_HEIGHT };

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

  const traverse = (node: TreeNode | null) => {
    if (!node) return;
    minX = Math.min(minX, node.targetX);
    maxX = Math.max(maxX, node.targetX);
    minY = Math.min(minY, node.targetY);
    maxY = Math.max(maxY, node.targetY);
    traverse(node.left);
    traverse(node.right);
  };

  traverse(root);

  const padding = metrics.nodeSize + 25;
  return {
    minX: Math.max(0, minX - padding),
    maxX: maxX + padding,
    minY: Math.max(0, minY - padding / 2),
    maxY: maxY + padding,
  };
};

export default function AdaptiveTreeVisualizer({
  root,
  highlightedNodeIds = [],
  pathNodeIds = [],
  visitedNodeIds = [],
  showLaserTracing = true,
  showShockwave = true,
  enableScrolling = true,
  animationSpeed = 'normal',
  onNodeVisited,
}: AdaptiveTreeVisualizerProps) {
  // Calculate adaptive metrics
  const metrics = useMemo(() => calculateTreeMetrics(root), [root]);

  // Apply adaptive positioning
  useMemo(() => {
    if (root) {
      calculateAdaptivePositions(root, CANVAS_WIDTH, metrics);
    }
  }, [root, metrics]);

  const bounds = useMemo(() => calculateTreeBounds(root, metrics), [root, metrics]);
  const canvasWidth = Math.max(CANVAS_WIDTH, bounds.maxX);
  const canvasHeight = Math.max(MIN_CANVAS_HEIGHT, bounds.maxY);
  const needsScroll = canvasWidth > CANVAS_WIDTH;

  // Collect all nodes
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
        <Animated.Text style={styles.emptySubtext}>Add values to build the tree</Animated.Text>
      </View>
    );
  }

  const content = (
    <View style={[styles.innerContainer, { width: canvasWidth, height: canvasHeight }]}>
      {/* Edges with laser tracing */}
      <AdaptiveTreeEdges
        root={root}
        pathNodeIds={pathNodeIds}
        visitedNodeIds={visitedNodeIds}
        showLaserTracing={showLaserTracing}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        animationSpeed={animationSpeed}
      />

      {/* Nodes with adaptive sizing */}
      {nodes.map((node) => (
        <AdaptiveTreeNode
          key={node.id}
          node={node}
          nodeSize={metrics.nodeSize}
          highlightedNodeIds={highlightedNodeIds}
          pathNodeIds={pathNodeIds}
          visitedNodeIds={visitedNodeIds}
          showShockwave={showShockwave}
          onVisited={onNodeVisited}
        />
      ))}

      {/* Scale indicator */}
      <View style={styles.scaleIndicator}>
        <Animated.Text style={styles.scaleText}>
          Scale: {(metrics.scaleFactor * 100).toFixed(0)}% | Nodes: {metrics.totalNodes}
        </Animated.Text>
      </View>
    </View>
  );

  if (needsScroll && enableScrolling) {
    return (
      <View style={[styles.container, { height: canvasHeight }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={{ width: canvasWidth }}
        >
          {content}
        </ScrollView>
      </View>
    );
  }

  return <View style={[styles.container, { height: canvasHeight }]}>{content}</View>;
}

// Export tree metrics for use in other components
export { calculateTreeMetrics, calculateAdaptivePositions };
export type { TreeMetrics };

const styles = StyleSheet.create({
  container: {
    width: CANVAS_WIDTH,
    minHeight: MIN_CANVAS_HEIGHT,
    position: 'relative',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.neonBorderCyan,
  },
  innerContainer: {
    position: 'relative',
  },
  emptyContainer: {
    width: CANVAS_WIDTH,
    height: 200,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray700,
  },
  emptyText: {
    color: Colors.gray400,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    color: Colors.gray500,
    fontSize: 12,
    marginTop: 4,
  },
  node: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.medium,
  },
  nodeGlow: {
    position: 'absolute',
  },
  nodeText: {
    textAlign: 'center',
  },
  scaleIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: Colors.surfaceDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.gray700,
  },
  scaleText: {
    fontSize: 10,
    color: Colors.gray500,
    fontFamily: 'monospace',
  },
});
