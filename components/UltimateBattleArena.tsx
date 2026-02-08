// Ultimate Battle Arena - Vertical with All Advanced Animation Styles
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  withRepeat,
  runOnJS,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows, BattleColors } from '@/constants/theme';
import PrecisionSpeedHUD, { PrecisionSpeedLevel, getSpeedDelayPrecision, SPEED_CONFIGS } from './PrecisionSpeedHUD';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MIDNIGHT_BLACK = '#0a0e17';

interface BattleBarProps {
  value: number;
  maxValue: number;
  index: number;
  totalBars: number;
  isComparing: boolean;
  isSwapping: boolean;
  isSorted: boolean;
  isPivot: boolean;
  color: string;
  isTopPanel: boolean;
  swapTargetIndex?: number;
  animationSpeed: PrecisionSpeedLevel;
}

// Enhanced Battle Bar with S-Curve Swap Animation
function EnhancedBattleBar({
  value,
  maxValue,
  index,
  totalBars,
  isComparing,
  isSwapping,
  isSorted,
  isPivot,
  color,
  isTopPanel,
  swapTargetIndex,
  animationSpeed,
}: BattleBarProps) {
  const heightPercent = (value / maxValue) * 100;
  const barWidth = Math.max(4, (SCREEN_WIDTH - Spacing.lg * 4) / totalBars - 2);

  // Animation values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  const speedDurations = { turtle: 800, normal: 400, lightning: 150, manual: 400 };
  const duration = speedDurations[animationSpeed];

  // S-Curve Swap Animation
  useEffect(() => {
    if (isSwapping && swapTargetIndex !== undefined && swapTargetIndex !== index) {
      const deltaX = (swapTargetIndex - index) * (barWidth + 2);
      const isMovingRight = swapTargetIndex > index;

      // Arc height - parabolic motion
      const arcHeight = Math.min(50, Math.abs(deltaX) * 0.4);
      const peakY = isMovingRight ? -arcHeight : arcHeight * 0.5;

      // Phase 1: Lift with slight rotation
      scale.value = withTiming(1.15, { duration: duration * 0.15, easing: Easing.out(Easing.back(1.5)) });
      rotation.value = withTiming(isMovingRight ? -5 : 5, { duration: duration * 0.15 });

      // Phase 2: S-Curve arc movement
      translateY.value = withSequence(
        withTiming(peakY * (isTopPanel ? 1 : -1), { duration: duration * 0.45, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: duration * 0.4, easing: Easing.in(Easing.cubic) })
      );

      translateX.value = withDelay(
        duration * 0.1,
        withTiming(deltaX, { duration: duration * 0.8, easing: Easing.bezier(0.4, 0, 0.2, 1) })
      );

      // Phase 3: Land and settle
      scale.value = withDelay(
        duration * 0.5,
        withSequence(
          withTiming(0.85, { duration: duration * 0.1 }),
          withSpring(1.1, { damping: 6, stiffness: 300 }),
          withSpring(1, { damping: 10 })
        )
      );

      rotation.value = withDelay(duration * 0.7, withTiming(0, { duration: duration * 0.3 }));

      // Glow effect during swap
      glowOpacity.value = withSequence(
        withTiming(1, { duration: duration * 0.2 }),
        withDelay(duration * 0.5, withTiming(0.3, { duration: duration * 0.3 }))
      );
    }
  }, [isSwapping, swapTargetIndex, index, barWidth, duration, isTopPanel]);

  // State-based styling
  useEffect(() => {
    if (!isSwapping) {
      translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    }

    if (isComparing) {
      scale.value = withSequence(
        withSpring(1.12, { damping: 8, stiffness: 200 }),
        withSpring(1.06, { damping: 10 })
      );
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.9, { duration: 200 }),
          withTiming(0.5, { duration: 200 })
        ),
        -1,
        true
      );
    } else if (isSorted) {
      scale.value = withSequence(
        withSpring(1.15, { damping: 6, stiffness: 250 }),
        withSpring(1.02, { damping: 10 })
      );
      glowOpacity.value = withSequence(
        withTiming(1, { duration: 150 }),
        withTiming(0.5, { duration: 200 })
      );
    } else if (isPivot) {
      scale.value = withSpring(1.08, { damping: 10 });
      glowOpacity.value = withTiming(0.7, { duration: 200 });
    } else if (!isSwapping) {
      scale.value = withSpring(1, { damping: 12 });
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isComparing, isSorted, isPivot, isSwapping]);

  const getBarColor = () => {
    if (isSorted) return Colors.neonLime;
    if (isSwapping) return '#FF4757';
    if (isComparing) return Colors.neonYellow;
    if (isPivot) return Colors.neonPurple;
    return color + '70';
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
    shadowRadius: interpolate(glowOpacity.value, [0, 1], [2, 12]),
  }));

  const barColor = getBarColor();

  return (
    <Animated.View
      style={[
        styles.battleBar,
        {
          height: `${heightPercent}%`,
          width: barWidth,
          backgroundColor: barColor,
          shadowColor: barColor,
        },
        animatedStyle,
        glowStyle,
        isTopPanel && styles.battleBarTop,
      ]}
    />
  );
}

// Battle Panel Component
interface BattlePanelProps {
  position: 'top' | 'bottom';
  algorithmName: string | null;
  array: number[];
  operations: number;
  comparingIndices: number[];
  swappingIndices: number[];
  sortedIndices: number[];
  pivotIndex?: number;
  finished: boolean;
  time: number;
  isWinner: boolean;
  animationSpeed: PrecisionSpeedLevel;
}

function UltimateBattlePanel({
  position,
  algorithmName,
  array,
  operations,
  comparingIndices,
  swappingIndices,
  sortedIndices,
  pivotIndex,
  finished,
  time,
  isWinner,
  animationSpeed,
}: BattlePanelProps) {
  const color = position === 'top' ? BattleColors.player1 : BattleColors.player2;
  const maxValue = Math.max(...array, 1);
  const isTopPanel = position === 'top';

  const EnterAnimation = position === 'top' ? FadeInUp : FadeInDown;

  // Get swap target for each bar
  const getSwapTarget = (index: number): number | undefined => {
    if (swappingIndices.length === 2) {
      const [a, b] = swappingIndices;
      if (index === a) return b;
      if (index === b) return a;
    }
    return undefined;
  };

  return (
    <Animated.View
      entering={EnterAnimation.delay(300).springify()}
      style={[
        styles.battlePanel,
        { borderColor: color + '40' },
        isWinner && styles.winnerPanel,
      ]}
    >
      {/* Header */}
      <View style={styles.panelHeader}>
        <View style={styles.panelTitleRow}>
          <View style={[styles.playerIndicator, { backgroundColor: color }]} />
          <Text style={[styles.panelTitle, { color, textShadowColor: color }]}>
            {algorithmName || 'Select Algorithm'}
          </Text>
        </View>
        {isWinner && (
          <View style={[styles.winnerBadge, { shadowColor: BattleColors.winner }]}>
            <Ionicons name="trophy" size={12} color={BattleColors.winner} />
            <Text style={styles.winnerText}>WINNER</Text>
          </View>
        )}
      </View>

      {/* Visualization Container */}
      <View style={[
        styles.visualizationContainer,
        isTopPanel ? styles.visualizationTop : styles.visualizationBottom,
      ]}>
        <View style={[
          styles.barsContainer,
          isTopPanel && styles.barsContainerTop,
        ]}>
          {array.map((value, index) => (
            <EnhancedBattleBar
              key={`${index}-${value}`}
              value={value}
              maxValue={maxValue}
              index={index}
              totalBars={array.length}
              isComparing={comparingIndices.includes(index)}
              isSwapping={swappingIndices.includes(index)}
              isSorted={sortedIndices.includes(index)}
              isPivot={pivotIndex === index}
              color={color}
              isTopPanel={isTopPanel}
              swapTargetIndex={getSwapTarget(index)}
              animationSpeed={animationSpeed}
            />
          ))}
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.miniStatsRow}>
        <View style={styles.miniStat}>
          <Ionicons name="swap-horizontal" size={12} color={Colors.gray400} />
          <Text style={styles.miniStatValue}>{operations}</Text>
        </View>
        <View style={styles.miniStat}>
          <Ionicons name="time" size={12} color={Colors.gray400} />
          <Text style={styles.miniStatValue}>{time.toFixed(0)}ms</Text>
        </View>
        <View style={[
          styles.statusIndicator,
          { backgroundColor: finished ? Colors.neonLime + '20' : color + '20' },
        ]}>
          <View style={[
            styles.statusDot,
            { backgroundColor: finished ? Colors.neonLime : color },
          ]} />
          <Text style={[
            styles.statusText,
            { color: finished ? Colors.neonLime : color },
          ]}>
            {finished ? 'Done' : 'Racing'}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

// Floating VS HUD
function FloatingVSHUD({
  time,
  operations1,
  operations2,
  phase,
  currentSpeed,
}: {
  time: number;
  operations1: number;
  operations2: number;
  phase: string;
  currentSpeed: PrecisionSpeedLevel;
}) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (phase === 'racing') {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        true
      );
    }
  }, [phase]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const speedConfig = SPEED_CONFIGS[currentSpeed];

  return (
    <Animated.View entering={FadeIn.delay(500)} style={styles.hudContainer}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={50} tint="dark" style={styles.hudBlur}>
          <HUDContent
            time={time}
            operations1={operations1}
            operations2={operations2}
            speedConfig={speedConfig}
            pulseStyle={pulseStyle}
          />
        </BlurView>
      ) : (
        <View style={[styles.hudBlur, styles.androidHudBlur]}>
          <HUDContent
            time={time}
            operations1={operations1}
            operations2={operations2}
            speedConfig={speedConfig}
            pulseStyle={pulseStyle}
          />
        </View>
      )}
    </Animated.View>
  );
}

function HUDContent({
  time,
  operations1,
  operations2,
  speedConfig,
  pulseStyle,
}: {
  time: number;
  operations1: number;
  operations2: number;
  speedConfig: typeof SPEED_CONFIGS['normal'];
  pulseStyle: any;
}) {
  return (
    <Animated.View style={[styles.hudContent, pulseStyle]}>
      {/* VS Badge */}
      <View style={styles.vsBadge}>
        <LinearGradient
          colors={[Colors.neonCyan + '60', Colors.neonPurple + '60']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.vsGradient}
        >
          <Text style={styles.vsText}>VS</Text>
        </LinearGradient>
      </View>

      {/* Stats */}
      <View style={styles.hudStats}>
        <View style={styles.hudStatItem}>
          <Ionicons name="timer-outline" size={14} color={Colors.neonCyan} />
          <Text style={styles.hudStatValue}>{(time / 1000).toFixed(1)}s</Text>
        </View>
        <View style={styles.hudDivider} />
        <View style={styles.hudStatItem}>
          <Ionicons name="analytics-outline" size={14} color={Colors.neonPurple} />
          <Text style={styles.hudStatValue}>{operations1 + operations2}</Text>
        </View>
      </View>

      {/* Speed Indicator */}
      <View style={[styles.speedBadge, { backgroundColor: speedConfig.color + '20', borderColor: speedConfig.color }]}>
        <Text style={styles.speedEmoji}>{speedConfig.icon}</Text>
        <Text style={[styles.speedBadgeText, { color: speedConfig.color }]}>{speedConfig.label}</Text>
      </View>
    </Animated.View>
  );
}

// Export component props interface
export interface UltimateBattleArenaProps {
  // Algorithm selection
  algorithm1Name: string | null;
  algorithm2Name: string | null;

  // Array states
  array1: number[];
  array2: number[];

  // Animation states
  comparingIndices1: number[];
  comparingIndices2: number[];
  swappingIndices1: number[];
  swappingIndices2: number[];
  sortedIndices1: number[];
  sortedIndices2: number[];
  pivotIndex1?: number;
  pivotIndex2?: number;

  // Stats
  operations1: number;
  operations2: number;
  time1: number;
  time2: number;

  // Status
  finished1: boolean;
  finished2: boolean;
  winner: 'algorithm1' | 'algorithm2' | 'tie' | null;
  raceTime: number;
  phase: 'selection' | 'countdown' | 'racing' | 'finished';

  // Speed control
  currentSpeed: PrecisionSpeedLevel;
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  onSpeedChange: (speed: PrecisionSpeedLevel) => void;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
}

export default function UltimateBattleArena({
  algorithm1Name,
  algorithm2Name,
  array1,
  array2,
  comparingIndices1,
  comparingIndices2,
  swappingIndices1,
  swappingIndices2,
  sortedIndices1,
  sortedIndices2,
  pivotIndex1,
  pivotIndex2,
  operations1,
  operations2,
  time1,
  time2,
  finished1,
  finished2,
  winner,
  raceTime,
  phase,
  currentSpeed,
  isPlaying,
  currentStep,
  totalSteps,
  onSpeedChange,
  onPlay,
  onPause,
  onReset,
  onStepForward,
  onStepBackward,
}: UltimateBattleArenaProps) {
  return (
    <View style={styles.container}>
      {/* Top Panel (Cyan - Algorithm 1) */}
      <UltimateBattlePanel
        position="top"
        algorithmName={algorithm1Name}
        array={array1}
        operations={operations1}
        comparingIndices={comparingIndices1}
        swappingIndices={swappingIndices1}
        sortedIndices={sortedIndices1}
        pivotIndex={pivotIndex1}
        finished={finished1}
        time={time1}
        isWinner={winner === 'algorithm1'}
        animationSpeed={currentSpeed}
      />

      {/* Floating VS HUD */}
      {phase === 'racing' && (
        <FloatingVSHUD
          time={raceTime}
          operations1={operations1}
          operations2={operations2}
          phase={phase}
          currentSpeed={currentSpeed}
        />
      )}

      {/* Bottom Panel (Purple - Algorithm 2) */}
      <UltimateBattlePanel
        position="bottom"
        algorithmName={algorithm2Name}
        array={array2}
        operations={operations2}
        comparingIndices={comparingIndices2}
        swappingIndices={swappingIndices2}
        sortedIndices={sortedIndices2}
        pivotIndex={pivotIndex2}
        finished={finished2}
        time={time2}
        isWinner={winner === 'algorithm2'}
        animationSpeed={currentSpeed}
      />

      {/* Speed HUD at bottom */}
      {(phase === 'racing' || phase === 'countdown') && (
        <View style={styles.speedHUDContainer}>
          <PrecisionSpeedHUD
            isPlaying={isPlaying}
            currentSpeed={currentSpeed}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onSpeedChange={onSpeedChange}
            onPlay={onPlay}
            onPause={onPause}
            onReset={onReset}
            onStepForward={onStepForward}
            onStepBackward={onStepBackward}
            canStepForward={!finished1 || !finished2}
            canStepBackward={currentStep > 0}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  battlePanel: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    marginVertical: Spacing.xs,
    overflow: 'hidden',
  },
  winnerPanel: {
    borderWidth: 2,
    borderColor: BattleColors.winner + '60',
    shadowColor: BattleColors.winner,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  panelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  playerIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  panelTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  winnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BattleColors.winner + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  winnerText: {
    fontSize: 10,
    fontWeight: '700',
    color: BattleColors.winner,
  },
  visualizationContainer: {
    flex: 1,
    paddingVertical: Spacing.sm,
  },
  visualizationTop: {
    justifyContent: 'flex-end',
  },
  visualizationBottom: {
    justifyContent: 'flex-start',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: '100%',
    gap: 2,
  },
  barsContainerTop: {
    alignItems: 'flex-start',
    transform: [{ scaleY: -1 }],
  },
  battleBar: {
    borderRadius: 2,
    minHeight: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  battleBarTop: {
    transform: [{ scaleY: -1 }],
  },
  miniStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
  },
  miniStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniStatValue: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  // Floating HUD
  hudContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -70 }, { translateY: -55 }],
    zIndex: 100,
  },
  hudBlur: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  androidHudBlur: {
    backgroundColor: 'rgba(15, 22, 41, 0.95)',
  },
  hudContent: {
    padding: Spacing.md,
    alignItems: 'center',
    minWidth: 140,
  },
  vsBadge: {
    marginBottom: Spacing.sm,
    borderRadius: 18,
    overflow: 'hidden',
    ...Shadows.glow,
  },
  vsGradient: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  vsText: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: Colors.white,
  },
  hudStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  hudStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  hudStatValue: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  hudDivider: {
    width: 1,
    height: 14,
    backgroundColor: Colors.glassBorder,
  },
  speedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  speedEmoji: {
    fontSize: 12,
  },
  speedBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  speedHUDContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
