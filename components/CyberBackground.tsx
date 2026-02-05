import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Configuration for the animated background
const GRID_LINES_VERTICAL = 12;
const GRID_LINES_HORIZONTAL = 20;
const PARTICLES_COUNT = 30;
const MATRIX_COLUMNS = 8;

interface ParticleProps {
  index: number;
  x: number;
  size: number;
  color: string;
  speed: number;
  delay: number;
}

function Particle({ index, x, size, color, speed, delay }: ParticleProps) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(SCREEN_HEIGHT + 50, {
          duration: speed,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: speed * 0.1 }),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value - SCREEN_HEIGHT * 0.2 }],
    opacity: interpolate(translateY.value, [0, SCREEN_HEIGHT * 0.2, SCREEN_HEIGHT * 0.8, SCREEN_HEIGHT], [0, 0.8, 0.8, 0]),
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: x,
          width: size,
          height: size,
          backgroundColor: color,
          shadowColor: color,
          shadowOpacity: 0.8,
          shadowRadius: size * 2,
        },
        animatedStyle,
      ]}
    />
  );
}

interface GridLineProps {
  orientation: 'horizontal' | 'vertical';
  position: number;
  delay: number;
}

function GridLine({ orientation, position, delay }: GridLineProps) {
  const opacity = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0.15, { duration: 3000 + Math.random() * 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
    glow.value = withDelay(
      delay + 500,
      withRepeat(
        withTiming(1, { duration: 4000 + Math.random() * 3000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    shadowOpacity: interpolate(glow.value, [0, 1], [0.1, 0.4]),
  }));

  return (
    <Animated.View
      style={[
        orientation === 'horizontal' ? styles.gridLineHorizontal : styles.gridLineVertical,
        orientation === 'horizontal'
          ? { top: position }
          : { left: position },
        animatedStyle,
      ]}
    />
  );
}

interface MatrixCharProps {
  column: number;
  delay: number;
}

function MatrixColumn({ column, delay }: MatrixCharProps) {
  const translateY = useSharedValue(-100);
  const columnWidth = SCREEN_WIDTH / MATRIX_COLUMNS;

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(SCREEN_HEIGHT + 200, {
          duration: 8000 + Math.random() * 6000,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: interpolate(
      translateY.value,
      [-100, 0, SCREEN_HEIGHT * 0.3, SCREEN_HEIGHT * 0.7, SCREEN_HEIGHT],
      [0, 0.3, 0.5, 0.3, 0]
    ),
  }));

  // Generate random characters for the matrix effect
  const chars = useMemo(() => {
    const codeChars = '01<>{}[];=+-()*&^%$#@!ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    return Array.from({ length: 20 }, () => codeChars[Math.floor(Math.random() * codeChars.length)]).join('\n');
  }, []);

  return (
    <Animated.Text
      style={[
        styles.matrixColumn,
        { left: column * columnWidth + columnWidth * 0.3 },
        animatedStyle,
      ]}
    >
      {chars}
    </Animated.Text>
  );
}

interface CyberBackgroundProps {
  showGrid?: boolean;
  showParticles?: boolean;
  showMatrix?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

export function CyberBackground({
  showGrid = true,
  showParticles = true,
  showMatrix = true,
  intensity = 'medium',
}: CyberBackgroundProps) {
  const particleCount = intensity === 'low' ? 15 : intensity === 'high' ? 45 : PARTICLES_COUNT;
  const gridOpacity = intensity === 'low' ? 0.08 : intensity === 'high' ? 0.2 : 0.12;

  // Generate particles with random properties
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      index: i,
      x: Math.random() * SCREEN_WIDTH,
      size: 2 + Math.random() * 4,
      color: [Colors.neonCyan, Colors.neonPurple, Colors.neonLime][Math.floor(Math.random() * 3)],
      speed: 10000 + Math.random() * 15000,
      delay: Math.random() * 5000,
    }));
  }, [particleCount]);

  // Generate grid lines
  const verticalLines = useMemo(() => {
    return Array.from({ length: GRID_LINES_VERTICAL }, (_, i) => ({
      position: (i / GRID_LINES_VERTICAL) * SCREEN_WIDTH,
      delay: i * 100,
    }));
  }, []);

  const horizontalLines = useMemo(() => {
    return Array.from({ length: GRID_LINES_HORIZONTAL }, (_, i) => ({
      position: (i / GRID_LINES_HORIZONTAL) * SCREEN_HEIGHT,
      delay: i * 80,
    }));
  }, []);

  // Generate matrix columns
  const matrixColumns = useMemo(() => {
    return Array.from({ length: MATRIX_COLUMNS }, (_, i) => ({
      column: i,
      delay: i * 1000 + Math.random() * 2000,
    }));
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Base gradient effect */}
      <View style={styles.gradientOverlay} />

      {/* Animated Grid */}
      {showGrid && (
        <View style={[styles.gridContainer, { opacity: gridOpacity }]}>
          {verticalLines.map((line, i) => (
            <GridLine
              key={`v-${i}`}
              orientation="vertical"
              position={line.position}
              delay={line.delay}
            />
          ))}
          {horizontalLines.map((line, i) => (
            <GridLine
              key={`h-${i}`}
              orientation="horizontal"
              position={line.position}
              delay={line.delay}
            />
          ))}
        </View>
      )}

      {/* Matrix rain effect */}
      {showMatrix && (
        <View style={styles.matrixContainer}>
          {matrixColumns.map((col) => (
            <MatrixColumn key={col.column} column={col.column} delay={col.delay} />
          ))}
        </View>
      )}

      {/* Floating particles */}
      {showParticles && (
        <View style={styles.particlesContainer}>
          {particles.map((p) => (
            <Particle key={p.index} {...p} />
          ))}
        </View>
      )}

      {/* Corner glow effects */}
      <View style={[styles.cornerGlow, styles.cornerGlowTopLeft]} />
      <View style={[styles.cornerGlow, styles.cornerGlowBottomRight]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    opacity: 0.95,
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: Colors.neonCyan,
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 4,
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.neonCyan,
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 4,
  },
  matrixContainer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  matrixColumn: {
    position: 'absolute',
    top: 0,
    fontSize: 12,
    fontFamily: 'monospace',
    color: Colors.neonLime,
    letterSpacing: 2,
    lineHeight: 18,
    textShadowColor: Colors.neonLime,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  cornerGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.08,
  },
  cornerGlowTopLeft: {
    top: -100,
    left: -100,
    backgroundColor: Colors.neonCyan,
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 100,
  },
  cornerGlowBottomRight: {
    bottom: -100,
    right: -100,
    backgroundColor: Colors.neonPurple,
    shadowColor: Colors.neonPurple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 100,
  },
});

export default CyberBackground;
