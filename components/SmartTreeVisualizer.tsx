// Smart Tree Visualizer - Fixes cropping with Dynamic Viewport, Auto-Centering, Pinch-to-Zoom
// Includes laser beam path tracing and shockwave pulse effects
import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Svg, { Line, Defs, LinearGradient, Stop, G, Circle } from 'react-native-svg';
import { Colors, BorderRadius, Shadows } from '@/constants/theme';
import { TreeNode } from '@/utils/algorithms/trees';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_WIDTH = SCREEN_WIDTH - 32;
const BASE_NODE_SIZE = 50;
const MIN_CANVAS_HEIGHT = 400;

interface SmartTreeVisualizerProps {
  root: TreeNode | null;
  highlightedNodeIds?: string[];
  pathNodeIds?: string[];
  visitedNodeIds?: string[];
  showLaserTracing?: boolean;
  showShockwave?: boolean;
  onNodePress?: (node: TreeNode) => void;
}

interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

// Calculate bounding box of all tree nodes
function calculateBounds(root: TreeNode | null): BoundingBox {
  if (!root) {
    return { minX: 0, maxX: CANVAS_WIDTH, minY: 0, maxY: MIN_CANVAS_HEIGHT };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

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
  const padding = BASE_NODE_SIZE + 20;
  return {
    minX: minX - padding,
    maxX: maxX + padding,
    minY: minY - padding / 2,
    maxY: maxY + padding,
  };
}

// Calculate optimal scale and position to fit all nodes
function calculateOptimalView(
  bounds: BoundingBox,
  containerWidth: number,
  containerHeight: number
): { scale: number; offsetX: number; offsetY: number } {
  const contentWidth = bounds.maxX - bounds.minX;
  const contentHeight = bounds.maxY - bounds.minY;

  // Calculate scale to fit
  const scaleX = containerWidth / contentWidth;
  const scaleY = containerHeight / contentHeight;
  const scale = Math.min(scaleX, scaleY, 1.2); // Max 1.2x zoom

  // Center the content
  const scaledWidth = contentWidth * scale;
  const scaledHeight = contentHeight * scale;
  const offsetX = (containerWidth - scaledWidth) / 2 - bounds.minX * scale;
  const offsetY = (containerHeight - scaledHeight) / 2 - bounds.minY * scale + 20;

  return { scale: Math.max(0.4, scale), offsetX, offsetY };
}

export default function SmartTreeVisualizer({
  root,
  highlightedNodeIds = [],
  pathNodeIds = [],
  visitedNodeIds = [],
  showLaserTracing = true,
  showShockwave = true,
  onNodePress,
}: SmartTreeVisualizerProps) {
  const containerWidth = CANVAS_WIDTH;
  const containerHeight = MIN_CANVAS_HEIGHT;

  // Calculate bounds and optimal view
  const bounds = useMemo(() => calculateBounds(root), [root]);
  const optimalView = useMemo(
    () => calculateOptimalView(bounds, containerWidth, containerHeight),
    [bounds, containerWidth, containerHeight]
  );

  // Gesture state
  const scale = useSharedValue(optimalView.scale);
  const offsetX = useSharedValue(optimalView.offsetX);
  const offsetY = useSharedValue(optimalView.offsetY);
  const savedScale = useSharedValue(optimalView.scale);
  const savedOffsetX = useSharedValue(optimalView.offsetX);
  const savedOffsetY = useSharedValue(optimalView.offsetY);

  // Update view when tree changes
  useEffect(() => {
    scale.value = withSpring(optimalView.scale, { damping: 20, stiffness: 100 });
    offsetX.value = withSpring(optimalView.offsetX, { damping: 20, stiffness: 100 });
    offsetY.value = withSpring(optimalView.offsetY, { damping: 20, stiffness: 100 });
    savedScale.value = optimalView.scale;
    savedOffsetX.value = optimalView.offsetX;
    savedOffsetY.value = optimalView.offsetY;
  }, [optimalView]);

  // Pinch gesture
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      const newScale = Math.min(Math.max(savedScale.value * e.scale, 0.3), 2.5);
      scale.value = newScale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  // Pan gesture
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      offsetX.value = savedOffsetX.value + e.translationX;
      offsetY.value = savedOffsetY.value + e.translationY;
    })
    .onEnd(() => {
      savedOffsetX.value = offsetX.value;
      savedOffsetY.value = offsetY.value;
    });

  // Double tap to reset
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withSpring(optimalView.scale, { damping: 15 });
      offsetX.value = withSpring(optimalView.offsetX, { damping: 15 });
      offsetY.value = withSpring(optimalView.offsetY, { damping: 15 });
      savedScale.value = optimalView.scale;
      savedOffsetX.value = optimalView.offsetX;
      savedOffsetY.value = optimalView.offsetY;
    });

  const composed = Gesture.Simultaneous(pinchGesture, panGesture, doubleTap);

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

  // Collect all edges with path/visited status
  const edges = useMemo(() => {
    const result: { from: TreeNode; to: TreeNode; isPath: boolean; isVisited: boolean }[] = [];
    const collectEdges = (node: TreeNode | null) => {
      if (!node) return;
      if (node.left) {
        const isPath = pathNodeIds.includes(node.id) && pathNodeIds.includes(node.left.id);
        const isVisited = visitedNodeIds.includes(node.id) && visitedNodeIds.includes(node.left.id);
        result.push({ from: node, to: node.left, isPath, isVisited });
        collectEdges(node.left);
      }
      if (node.right) {
        const isPath = pathNodeIds.includes(node.id) && pathNodeIds.includes(node.right.id);
        const isVisited = visitedNodeIds.includes(node.id) && visitedNodeIds.includes(node.right.id);
        result.push({ from: node, to: node.right, isPath, isVisited });
        collectEdges(node.right);
      }
    };
    collectEdges(root);
    return result;
  }, [root, pathNodeIds, visitedNodeIds]);

  const animatedContentStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
      { scale: scale.value },
    ],
  }));

  if (!root) {
    return (
      <View style={styles.emptyContainer}>
        <Animated.Text style={styles.emptyText}>Tree is empty</Animated.Text>
        <Animated.Text style={styles.emptySubtext}>Add values to build the tree</Animated.Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GestureHandlerRootView style={styles.gestureContainer}>
        <GestureDetector gesture={composed}>
          <Animated.View style={[styles.content, animatedContentStyle]}>
            {/* Edges */}
            <Svg style={StyleSheet.absoluteFill} width={bounds.maxX} height={bounds.maxY}>
              <Defs>
                <LinearGradient id="laserGradient" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={Colors.neonCyan} stopOpacity="0.2" />
                  <Stop offset="0.5" stopColor={Colors.neonCyan} stopOpacity="1" />
                  <Stop offset="1" stopColor={Colors.neonCyan} stopOpacity="0.2" />
                </LinearGradient>
              </Defs>
              {edges.map((edge, idx) => (
                <EdgeLine
                  key={idx}
                  edge={edge}
                  showLaserTracing={showLaserTracing}
                  index={idx}
                />
              ))}
            </Svg>

            {/* Nodes */}
            {nodes.map((node) => (
              <SmartTreeNode
                key={node.id}
                node={node}
                nodeSize={BASE_NODE_SIZE}
                isHighlighted={highlightedNodeIds.includes(node.id)}
                isPath={pathNodeIds.includes(node.id)}
                isVisited={visitedNodeIds.includes(node.id)}
                showShockwave={showShockwave}
                onPress={onNodePress}
              />
            ))}
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>

      {/* Zoom controls */}
      <View style={styles.controls}>
        <Animated.Text
          style={styles.controlButton}
          onPress={() => {
            const newScale = Math.min(savedScale.value * 1.3, 2.5);
            scale.value = withSpring(newScale, { damping: 15 });
            savedScale.value = newScale;
          }}
        >
          +
        </Animated.Text>
        <Animated.Text
          style={styles.controlButton}
          onPress={() => {
            const newScale = Math.max(savedScale.value / 1.3, 0.3);
            scale.value = withSpring(newScale, { damping: 15 });
            savedScale.value = newScale;
          }}
        >
          −
        </Animated.Text>
        <Animated.Text
          style={[styles.controlButton, styles.resetButton]}
          onPress={() => {
            scale.value = withSpring(optimalView.scale, { damping: 15 });
            offsetX.value = withSpring(optimalView.offsetX, { damping: 15 });
            offsetY.value = withSpring(optimalView.offsetY, { damping: 15 });
            savedScale.value = optimalView.scale;
            savedOffsetX.value = optimalView.offsetX;
            savedOffsetY.value = optimalView.offsetY;
          }}
        >
          ⟲
        </Animated.Text>
      </View>

      {/* Scale indicator */}
      <ScaleIndicator scale={scale} />
    </View>
  );
}

// Edge Line Component with Laser Tracing
function EdgeLine({
  edge,
  showLaserTracing,
  index,
}: {
  edge: { from: TreeNode; to: TreeNode; isPath: boolean; isVisited: boolean };
  showLaserTracing: boolean;
  index: number;
}) {
  const isActive = edge.isPath || edge.isVisited;
  const strokeColor = edge.isPath
    ? Colors.neonCyan
    : edge.isVisited
    ? Colors.visited
    : Colors.gray600;
  const strokeWidth = edge.isPath ? 3.5 : edge.isVisited ? 3 : 2;

  return (
    <G>
      {/* Glow effect for active edges */}
      {showLaserTracing && isActive && (
        <Line
          x1={edge.from.targetX}
          y1={edge.from.targetY}
          x2={edge.to.targetX}
          y2={edge.to.targetY}
          stroke={strokeColor}
          strokeWidth={12}
          strokeOpacity={0.2}
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
    </G>
  );
}

// Smart Tree Node Component
function SmartTreeNode({
  node,
  nodeSize,
  isHighlighted,
  isPath,
  isVisited,
  showShockwave,
  onPress,
}: {
  node: TreeNode;
  nodeSize: number;
  isHighlighted: boolean;
  isPath: boolean;
  isVisited: boolean;
  showShockwave: boolean;
  onPress?: (node: TreeNode) => void;
}) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const posX = useSharedValue(node.targetX);
  const posY = useSharedValue(node.targetY);
  const shockwaveScale = useSharedValue(1);
  const shockwaveOpacity = useSharedValue(0);

  const hasHighlightType = node.highlightType !== 'none';

  // Animate position
  useEffect(() => {
    posX.value = withSpring(node.targetX, { damping: 18, stiffness: 120 });
    posY.value = withSpring(node.targetY, { damping: 18, stiffness: 120 });
  }, [node.targetX, node.targetY]);

  // Animate highlights
  useEffect(() => {
    if (isHighlighted || hasHighlightType) {
      scale.value = withSpring(1.12, { damping: 10 });
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.4, { duration: 400 })
        ),
        -1,
        true
      );

      // Shockwave for visited nodes
      if (showShockwave && (node.highlightType === 'visited' || isVisited)) {
        shockwaveScale.value = 1;
        shockwaveOpacity.value = 0.6;
        shockwaveScale.value = withTiming(3, { duration: 800, easing: Easing.out(Easing.ease) });
        shockwaveOpacity.value = withTiming(0, { duration: 800 });
      }
    } else {
      scale.value = withSpring(1, { damping: 12 });
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isHighlighted, hasHighlightType, isVisited, showShockwave]);

  const getNodeColor = useCallback(() => {
    // Yellow for comparing
    if (node.highlightType === 'comparing' || node.highlightType === 'current') return Colors.neonYellow;
    // Cyan for swapping/inserting
    if (node.highlightType === 'inserting' || node.highlightType === 'path') return Colors.neonCyan;
    // Green for sorted/visited
    if (node.highlightType === 'visited') return Colors.neonLime;
    // Pink for rotating
    if (node.highlightType === 'rotating') return Colors.neonPink;
    // States from props
    if (isPath) return Colors.neonCyan;
    if (isHighlighted) return Colors.neonYellow;
    if (isVisited) return Colors.neonLime;
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
      { scale: scale.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [
      { translateX: posX.value - nodeSize / 2 - 6 },
      { translateY: posY.value - nodeSize / 2 - 6 },
    ],
  }));

  const shockwaveStyle = useAnimatedStyle(() => ({
    opacity: shockwaveOpacity.value,
    transform: [
      { translateX: posX.value - nodeSize / 2 },
      { translateY: posY.value - nodeSize / 2 },
      { scale: shockwaveScale.value },
    ],
  }));

  const nodeColor = getNodeColor();
  const shouldGlow = isPath || isHighlighted || hasHighlightType;
  const textColor = nodeColor === Colors.cardBackground ? Colors.textPrimary : Colors.background;

  return (
    <>
      {/* Shockwave */}
      {showShockwave && (isVisited || node.highlightType === 'visited') && (
        <Animated.View
          style={[
            styles.shockwave,
            { width: nodeSize, height: nodeSize, borderRadius: nodeSize / 2, borderColor: getGlowColor() },
            shockwaveStyle,
          ]}
        />
      )}

      {/* Glow */}
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
            glowStyle,
          ]}
        />
      )}

      {/* Node */}
      <Animated.View
        style={[
          styles.node,
          {
            width: nodeSize,
            height: nodeSize,
            borderRadius: nodeSize / 2,
            backgroundColor: nodeColor,
            borderColor: getBorderColor(),
          },
          shouldGlow && {
            shadowColor: getGlowColor(),
            shadowOpacity: 0.8,
            shadowRadius: 14,
          },
          animatedStyle,
        ]}
      >
        <Animated.Text
          style={[
            styles.nodeText,
            { color: textColor, fontSize: nodeSize * 0.32 },
          ]}
        >
          {node.value}
        </Animated.Text>
      </Animated.View>
    </>
  );
}

// Scale Indicator Component
function ScaleIndicator({ scale }: { scale: { value: number } }) {
  const [displayScale, setDisplayScale] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayScale(Math.round(scale.value * 100));
    }, 100);
    return () => clearInterval(interval);
  }, [scale]);

  return (
    <View style={styles.scaleIndicator}>
      <Animated.Text style={styles.scaleText}>{displayScale}%</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CANVAS_WIDTH,
    height: MIN_CANVAS_HEIGHT,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.neonBorderCyan,
    overflow: 'hidden',
    position: 'relative',
  },
  gestureContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    position: 'absolute',
    width: CANVAS_WIDTH * 2,
    height: MIN_CANVAS_HEIGHT * 2,
    transformOrigin: 'center',
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
    borderWidth: 3,
    ...Shadows.medium,
  },
  nodeGlow: {
    position: 'absolute',
  },
  nodeText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  shockwave: {
    position: 'absolute',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  controls: {
    position: 'absolute',
    right: 12,
    top: 12,
    gap: 8,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceDark,
    borderWidth: 1,
    borderColor: Colors.neonBorderCyan,
    color: Colors.neonCyan,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 34,
    overflow: 'hidden',
  },
  resetButton: {
    fontSize: 16,
    lineHeight: 36,
  },
  scaleIndicator: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: Colors.surfaceDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.gray700,
  },
  scaleText: {
    fontSize: 11,
    color: Colors.gray400,
    fontFamily: 'monospace',
  },
});
