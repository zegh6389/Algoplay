// Tree Visualizer Component with Dynamic Spacing and Enhanced Animations
import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import Svg, { Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors, BorderRadius, Shadows } from '@/constants/theme';
import { TreeNode } from '@/utils/algorithms/trees';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_WIDTH = SCREEN_WIDTH - 32;
const NODE_SIZE = 44;
const MIN_CANVAS_HEIGHT = 350;

interface TreeVisualizerProps {
  root: TreeNode | null;
  highlightedNodeIds?: string[];
  pathNodeIds?: string[];
  visitedNodeIds?: string[];
  showGlowingTrail?: boolean;
  showShockwave?: boolean;
  enableScrolling?: boolean;
}

interface TreeNodeComponentProps {
  node: TreeNode;
  highlightedNodeIds: string[];
  pathNodeIds: string[];
  visitedNodeIds: string[];
  showGlowingTrail: boolean;
  showShockwave: boolean;
}

// Calculate tree bounds for dynamic canvas sizing
const calculateTreeBounds = (root: TreeNode | null): { minX: number; maxX: number; minY: number; maxY: number } => {
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

  // Add padding
  const padding = NODE_SIZE + 20;
  return {
    minX: Math.max(0, minX - padding),
    maxX: maxX + padding,
    minY: Math.max(0, minY - padding / 2),
    maxY: maxY + padding,
  };
};

function TreeNodeComponent({
  node,
  highlightedNodeIds,
  pathNodeIds,
  visitedNodeIds,
  showGlowingTrail,
  showShockwave,
}: TreeNodeComponentProps) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const shockwaveScale = useSharedValue(1);
  const shockwaveOpacity = useSharedValue(0);
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

  // Animate scale and glow on highlight
  React.useEffect(() => {
    if (isHighlighted || node.highlightType !== 'none') {
      scale.value = withSpring(1.15, { damping: 8, stiffness: 200 });
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.5, { duration: 400, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      // Trigger shockwave pulse for visited nodes
      if (showShockwave && (node.highlightType === 'visited' || isVisited)) {
        shockwaveScale.value = 1;
        shockwaveOpacity.value = 0.6;
        shockwaveScale.value = withTiming(2.5, { duration: 600, easing: Easing.out(Easing.ease) });
        shockwaveOpacity.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) });
      }
    } else {
      scale.value = withSpring(1, { damping: 10 });
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isHighlighted, node.highlightType, isVisited, showShockwave]);

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
    if (node.highlightType === 'inserting') return Colors.neonLime;
    if (node.highlightType === 'current') return Colors.neonYellow;
    if (node.highlightType === 'comparing') return Colors.neonPink;
    if (node.highlightType === 'path') return Colors.neonCyan;
    if (isPath) return Colors.neonCyan;
    if (isHighlighted) return Colors.neonYellow;
    return Colors.gray600;
  }, [node.highlightType, isHighlighted, isPath]);

  const getGlowColor = useCallback(() => {
    if (node.highlightType === 'inserting') return Colors.neonLime;
    if (node.highlightType === 'current') return Colors.neonYellow;
    if (node.highlightType === 'comparing') return Colors.neonPink;
    if (node.highlightType === 'path') return Colors.neonCyan;
    if (isPath) return Colors.neonCyan;
    if (isHighlighted) return Colors.neonYellow;
    return Colors.neonCyan;
  }, [node.highlightType, isHighlighted, isPath]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: posX.value - NODE_SIZE / 2 },
      { translateY: posY.value - NODE_SIZE / 2 },
      { scale: scale.value },
    ],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [
      { translateX: posX.value - NODE_SIZE / 2 - 8 },
      { translateY: posY.value - NODE_SIZE / 2 - 8 },
    ],
  }));

  const shockwaveAnimatedStyle = useAnimatedStyle(() => ({
    opacity: shockwaveOpacity.value,
    transform: [
      { translateX: posX.value - NODE_SIZE / 2 },
      { translateY: posY.value - NODE_SIZE / 2 },
      { scale: shockwaveScale.value },
    ],
  }));

  const shouldGlow = showGlowingTrail && (isPath || isHighlighted || node.highlightType !== 'none');
  const nodeColor = getNodeColor();
  const textColor = nodeColor === Colors.cardBackground ? Colors.textPrimary : Colors.background;

  return (
    <>
      {/* Shockwave effect */}
      {showShockwave && (
        <Animated.View
          style={[
            styles.shockwave,
            shockwaveAnimatedStyle,
            { borderColor: getGlowColor() },
          ]}
        />
      )}

      {/* Glow effect */}
      {shouldGlow && (
        <Animated.View
          style={[
            styles.nodeGlowOuter,
            glowAnimatedStyle,
            { backgroundColor: getGlowColor() + '30' },
          ]}
        />
      )}

      {/* Main node */}
      <Animated.View
        style={[
          styles.node,
          animatedStyle,
          {
            backgroundColor: nodeColor,
            borderColor: getBorderColor(),
          },
          shouldGlow && {
            shadowColor: getGlowColor(),
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 12,
            elevation: 10,
          },
        ]}
      >
        <Animated.Text style={[styles.nodeText, { color: textColor }]}>
          {node.value}
        </Animated.Text>
      </Animated.View>
    </>
  );
}

function TreeEdges({
  root,
  pathNodeIds,
  visitedNodeIds,
  showGlowingTrail,
  canvasWidth,
  canvasHeight,
}: {
  root: TreeNode;
  pathNodeIds: string[];
  visitedNodeIds: string[];
  showGlowingTrail: boolean;
  canvasWidth: number;
  canvasHeight: number;
}) {
  const edges: { from: TreeNode; to: TreeNode; isPath: boolean; isVisited: boolean }[] = [];

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
        <LinearGradient id="glowGradient" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={Colors.neonCyan} stopOpacity="0.3" />
          <Stop offset="0.5" stopColor={Colors.neonCyan} stopOpacity="0.8" />
          <Stop offset="1" stopColor={Colors.neonCyan} stopOpacity="0.3" />
        </LinearGradient>
        <LinearGradient id="visitedGradient" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={Colors.visited} stopOpacity="0.3" />
          <Stop offset="0.5" stopColor={Colors.visited} stopOpacity="0.6" />
          <Stop offset="1" stopColor={Colors.visited} stopOpacity="0.3" />
        </LinearGradient>
        <LinearGradient id="pathGradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={Colors.neonCyan} stopOpacity="0.8" />
          <Stop offset="1" stopColor={Colors.neonLime} stopOpacity="0.8" />
        </LinearGradient>
      </Defs>
      {edges.map((edge, index) => {
        const isActive = edge.isPath || edge.isVisited;
        const strokeColor = edge.isPath
          ? Colors.neonCyan
          : edge.isVisited
          ? Colors.visited
          : Colors.gray600;
        const strokeWidth = edge.isPath ? 3 : edge.isVisited ? 2.5 : 2;

        return (
          <React.Fragment key={index}>
            {/* Glow effect for active edges */}
            {showGlowingTrail && isActive && (
              <Line
                x1={edge.from.targetX}
                y1={edge.from.targetY}
                x2={edge.to.targetX}
                y2={edge.to.targetY}
                stroke={edge.isPath ? Colors.neonCyan : Colors.visited}
                strokeWidth={10}
                strokeOpacity={0.25}
                strokeLinecap="round"
              />
            )}
            {/* Main edge */}
            <Line
              x1={edge.from.targetX}
              y1={edge.from.targetY}
              x2={edge.to.targetX}
              y2={edge.to.targetY}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

export default function TreeVisualizer({
  root,
  highlightedNodeIds = [],
  pathNodeIds = [],
  visitedNodeIds = [],
  showGlowingTrail = true,
  showShockwave = true,
  enableScrolling = true,
}: TreeVisualizerProps) {
  const bounds = useMemo(() => calculateTreeBounds(root), [root]);
  const canvasWidth = Math.max(CANVAS_WIDTH, bounds.maxX);
  const canvasHeight = Math.max(MIN_CANVAS_HEIGHT, bounds.maxY);
  const needsScroll = canvasWidth > CANVAS_WIDTH;

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

  const content = (
    <View style={[styles.innerContainer, { width: canvasWidth, height: canvasHeight }]}>
      <TreeEdges
        root={root}
        pathNodeIds={pathNodeIds}
        visitedNodeIds={visitedNodeIds}
        showGlowingTrail={showGlowingTrail}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
      />
      {nodes.map((node) => (
        <TreeNodeComponent
          key={node.id}
          node={node}
          highlightedNodeIds={highlightedNodeIds}
          pathNodeIds={pathNodeIds}
          visitedNodeIds={visitedNodeIds}
          showGlowingTrail={showGlowingTrail}
          showShockwave={showShockwave}
        />
      ))}
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

const styles = StyleSheet.create({
  container: {
    width: CANVAS_WIDTH,
    minHeight: MIN_CANVAS_HEIGHT,
    position: 'relative',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
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
  nodeGlowOuter: {
    position: 'absolute',
    width: NODE_SIZE + 16,
    height: NODE_SIZE + 16,
    borderRadius: (NODE_SIZE + 16) / 2,
  },
  nodeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  shockwave: {
    position: 'absolute',
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
});
