// Dynamic Smart Viewport with Pinch-to-Zoom, Pan, and Auto-Centering
// Fixes tree/graph cropping issues by calculating bounding box and adjusting view
import React, { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { Colors, BorderRadius } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface DynamicViewportProps {
  children: React.ReactNode;
  bounds: BoundingBox | null;
  nodeSize?: number;
  padding?: number;
  minZoom?: number;
  maxZoom?: number;
  containerHeight?: number;
  showControls?: boolean;
  onZoomChange?: (scale: number) => void;
  onPanChange?: (x: number, y: number) => void;
}

// Calculate optimal scale and offset to fit all content
function calculateOptimalView(
  bounds: BoundingBox,
  containerWidth: number,
  containerHeight: number,
  nodeSize: number,
  padding: number
): { scale: number; offsetX: number; offsetY: number } {
  const contentWidth = bounds.maxX - bounds.minX + nodeSize + padding * 2;
  const contentHeight = bounds.maxY - bounds.minY + nodeSize + padding * 2;

  // Calculate scale to fit content
  const scaleX = containerWidth / contentWidth;
  const scaleY = containerHeight / contentHeight;
  const scale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 1

  // Calculate center offset
  const scaledWidth = contentWidth * scale;
  const scaledHeight = contentHeight * scale;

  const offsetX = (containerWidth - scaledWidth) / 2 - (bounds.minX - padding) * scale;
  const offsetY = (containerHeight - scaledHeight) / 2 - (bounds.minY - padding) * scale;

  return { scale: Math.max(0.3, scale), offsetX, offsetY };
}

export default function DynamicViewport({
  children,
  bounds,
  nodeSize = 50,
  padding = 30,
  minZoom = 0.3,
  maxZoom = 2.5,
  containerHeight = 400,
  showControls = true,
  onZoomChange,
  onPanChange,
}: DynamicViewportProps) {
  const containerWidth = SCREEN_WIDTH - 32;
  const [containerDimensions, setContainerDimensions] = useState({
    width: containerWidth,
    height: containerHeight,
  });

  // Animation values
  const scale = useSharedValue(1);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

  // Gesture state
  const savedScale = useSharedValue(1);
  const savedOffsetX = useSharedValue(0);
  const savedOffsetY = useSharedValue(0);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  // Track if user has manually interacted
  const hasUserInteracted = useRef(false);

  // Handle layout changes
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerDimensions({ width, height });
  }, []);

  // Auto-fit content when bounds change (only if user hasn't manually zoomed)
  useEffect(() => {
    if (bounds && !hasUserInteracted.current) {
      const optimal = calculateOptimalView(
        bounds,
        containerDimensions.width,
        containerDimensions.height,
        nodeSize,
        padding
      );

      scale.value = withSpring(optimal.scale, { damping: 20, stiffness: 100 });
      offsetX.value = withSpring(optimal.offsetX, { damping: 20, stiffness: 100 });
      offsetY.value = withSpring(optimal.offsetY, { damping: 20, stiffness: 100 });

      savedScale.value = optimal.scale;
      savedOffsetX.value = optimal.offsetX;
      savedOffsetY.value = optimal.offsetY;
    }
  }, [bounds, containerDimensions, nodeSize, padding]);

  // Reset to auto-fit
  const resetView = useCallback(() => {
    if (bounds) {
      hasUserInteracted.current = false;
      const optimal = calculateOptimalView(
        bounds,
        containerDimensions.width,
        containerDimensions.height,
        nodeSize,
        padding
      );

      scale.value = withSpring(optimal.scale, { damping: 15, stiffness: 120 });
      offsetX.value = withSpring(optimal.offsetX, { damping: 15, stiffness: 120 });
      offsetY.value = withSpring(optimal.offsetY, { damping: 15, stiffness: 120 });

      savedScale.value = optimal.scale;
      savedOffsetX.value = optimal.offsetX;
      savedOffsetY.value = optimal.offsetY;
    }
  }, [bounds, containerDimensions, nodeSize, padding]);

  // Zoom in/out helpers
  const zoomIn = useCallback(() => {
    hasUserInteracted.current = true;
    const newScale = Math.min(savedScale.value * 1.3, maxZoom);
    scale.value = withSpring(newScale, { damping: 15 });
    savedScale.value = newScale;
    onZoomChange?.(newScale);
  }, [maxZoom, onZoomChange]);

  const zoomOut = useCallback(() => {
    hasUserInteracted.current = true;
    const newScale = Math.max(savedScale.value / 1.3, minZoom);
    scale.value = withSpring(newScale, { damping: 15 });
    savedScale.value = newScale;
    onZoomChange?.(newScale);
  }, [minZoom, onZoomChange]);

  // Pinch gesture for zooming
  const pinchGesture = Gesture.Pinch()
    .onStart((e) => {
      hasUserInteracted.current = true;
      focalX.value = e.focalX;
      focalY.value = e.focalY;
    })
    .onUpdate((e) => {
      const newScale = Math.min(Math.max(savedScale.value * e.scale, minZoom), maxZoom);
      scale.value = newScale;

      // Adjust offset to zoom towards focal point
      const focalOffsetX = (focalX.value - containerDimensions.width / 2) * (1 - e.scale);
      const focalOffsetY = (focalY.value - containerDimensions.height / 2) * (1 - e.scale);
      offsetX.value = savedOffsetX.value + focalOffsetX;
      offsetY.value = savedOffsetY.value + focalOffsetY;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      savedOffsetX.value = offsetX.value;
      savedOffsetY.value = offsetY.value;
      if (onZoomChange) {
        runOnJS(onZoomChange)(scale.value);
      }
    });

  // Pan gesture for moving
  const panGesture = Gesture.Pan()
    .onStart(() => {
      hasUserInteracted.current = true;
    })
    .onUpdate((e) => {
      offsetX.value = savedOffsetX.value + e.translationX;
      offsetY.value = savedOffsetY.value + e.translationY;
    })
    .onEnd(() => {
      savedOffsetX.value = offsetX.value;
      savedOffsetY.value = offsetY.value;
      if (onPanChange) {
        runOnJS(onPanChange)(offsetX.value, offsetY.value);
      }
    });

  // Double tap to reset view
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      runOnJS(resetView)();
    });

  // Combine gestures
  const composedGestures = Gesture.Simultaneous(
    pinchGesture,
    panGesture,
    doubleTapGesture
  );

  // Animated style for content
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={[styles.container, { height: containerHeight }]} onLayout={onLayout}>
      <GestureHandlerRootView style={styles.gestureContainer}>
        <GestureDetector gesture={composedGestures}>
          <Animated.View style={[styles.content, animatedStyle]}>
            {children}
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>

      {/* Zoom Controls */}
      {showControls && (
        <View style={styles.controls}>
          <Animated.View style={styles.controlButton}>
            <Animated.Text style={styles.controlText} onPress={zoomIn}>+</Animated.Text>
          </Animated.View>
          <Animated.View style={styles.controlButton}>
            <Animated.Text style={styles.controlText} onPress={zoomOut}>−</Animated.Text>
          </Animated.View>
          <Animated.View style={styles.controlButton}>
            <Animated.Text style={[styles.controlText, styles.resetIcon]} onPress={resetView}>⟲</Animated.Text>
          </Animated.View>
        </View>
      )}

      {/* Scale Indicator */}
      <View style={styles.scaleIndicator}>
        <ScaleDisplay scale={scale} />
      </View>
    </View>
  );
}

// Separate component for scale display to avoid re-render issues
function ScaleDisplay({ scale }: { scale: { value: number } }) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 1,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <AnimatedScaleText scale={scale} />
    </Animated.View>
  );
}

function AnimatedScaleText({ scale }: { scale: { value: number } }) {
  const [displayScale, setDisplayScale] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayScale(Math.round(scale.value * 100));
    }, 100);
    return () => clearInterval(interval);
  }, [scale]);

  return (
    <Animated.Text style={styles.scaleText}>
      {displayScale}%
    </Animated.Text>
  );
}

// Export helper to calculate bounds from tree nodes
export function calculateNodeBounds(
  nodes: Array<{ targetX: number; targetY: number }>
): BoundingBox | null {
  if (!nodes || nodes.length === 0) return null;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  nodes.forEach((node) => {
    minX = Math.min(minX, node.targetX);
    maxX = Math.max(maxX, node.targetX);
    minY = Math.min(minY, node.targetY);
    maxY = Math.max(maxY, node.targetY);
  });

  return { minX, maxX, minY, maxY };
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - 32,
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
    transformOrigin: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlText: {
    color: Colors.neonCyan,
    fontSize: 20,
    fontWeight: '600',
  },
  resetIcon: {
    fontSize: 16,
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
