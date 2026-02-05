// Precision Speed HUD with 4 Speed Levels and Manual Mode
import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
  interpolate,
  FadeIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';

const MIDNIGHT_BLACK = '#0a0e17';

export type PrecisionSpeedLevel = 'turtle' | 'normal' | 'lightning' | 'manual';

interface PrecisionSpeedHUDProps {
  isPlaying: boolean;
  currentSpeed: PrecisionSpeedLevel;
  currentStep: number;
  totalSteps: number;
  onSpeedChange: (speed: PrecisionSpeedLevel) => void;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  canStepForward?: boolean;
  canStepBackward?: boolean;
  showHistory?: boolean;
  onHistoryBack?: () => void;
  historyCount?: number;
}

// Speed configuration
export const SPEED_CONFIGS: Record<PrecisionSpeedLevel, { label: string; icon: string; delay: number; color: string }> = {
  turtle: { label: 'Turtle', icon: '🐢', delay: 1500, color: Colors.neonYellow },
  normal: { label: 'Normal', icon: '⚡', delay: 500, color: Colors.neonCyan },
  lightning: { label: 'Lightning', icon: '🔥', delay: 100, color: Colors.neonLime },
  manual: { label: 'Manual', icon: '🎮', delay: 0, color: Colors.neonPurple },
};

export const getSpeedDelayPrecision = (speed: PrecisionSpeedLevel): number => {
  return SPEED_CONFIGS[speed].delay;
};

// Animated Speed Button
function SpeedButton({
  speed,
  isSelected,
  onPress,
}: {
  speed: PrecisionSpeedLevel;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const config = SPEED_CONFIGS[speed];

  useEffect(() => {
    if (isSelected) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 600 }),
          withTiming(0.4, { duration: 600 })
        ),
        -1,
        true
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isSelected]);

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.9, { duration: 50 }),
      withSpring(1, { damping: 10, stiffness: 300 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.speedButton,
          isSelected && { borderColor: config.color, backgroundColor: config.color + '20' },
          animatedStyle,
        ]}
      >
        {isSelected && (
          <Animated.View
            style={[
              styles.speedButtonGlow,
              { backgroundColor: config.color, shadowColor: config.color },
              glowStyle,
            ]}
          />
        )}
        <Text style={styles.speedEmoji}>{config.icon}</Text>
        <Text style={[styles.speedLabel, isSelected && { color: config.color }]}>
          {config.label}
        </Text>
        {speed !== 'manual' && (
          <Text style={[styles.speedDelay, isSelected && { color: config.color }]}>
            {config.delay / 1000}s
          </Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// Progress Indicator
function ProgressIndicator({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const progress = total > 0 ? (current / total) * 100 : 0;
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withSpring(progress, { damping: 15, stiffness: 100 });
  }, [progress]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <Animated.View style={[styles.progressFill, progressStyle]} />
      </View>
      <Text style={styles.progressText}>
        Step {current}/{total}
      </Text>
    </View>
  );
}

// Manual Mode Controls
function ManualControls({
  onStepBackward,
  onStepForward,
  canStepBackward,
  canStepForward,
  onHistoryBack,
  historyCount,
  showHistory,
}: {
  onStepBackward: () => void;
  onStepForward: () => void;
  canStepBackward: boolean;
  canStepForward: boolean;
  onHistoryBack?: () => void;
  historyCount?: number;
  showHistory?: boolean;
}) {
  const backScale = useSharedValue(1);
  const forwardScale = useSharedValue(1);

  const handleBack = () => {
    if (!canStepBackward) return;
    backScale.value = withSequence(
      withTiming(0.85, { duration: 50 }),
      withSpring(1, { damping: 8 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStepBackward();
  };

  const handleForward = () => {
    if (!canStepForward) return;
    forwardScale.value = withSequence(
      withTiming(0.85, { duration: 50 }),
      withSpring(1, { damping: 8 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStepForward();
  };

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backScale.value }],
  }));

  const forwardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: forwardScale.value }],
  }));

  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.manualControls}>
      <View style={styles.manualControlsHeader}>
        <Ionicons name="game-controller" size={16} color={Colors.neonPurple} />
        <Text style={styles.manualControlsTitle}>Frame Control</Text>
      </View>

      <View style={styles.manualButtonsRow}>
        {/* Undo/History Button */}
        {showHistory && onHistoryBack && (
          <TouchableOpacity
            onPress={onHistoryBack}
            disabled={(historyCount || 0) === 0}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.manualButton,
                styles.historyButton,
                (historyCount || 0) === 0 && styles.manualButtonDisabled,
              ]}
            >
              <Ionicons
                name="arrow-undo"
                size={22}
                color={(historyCount || 0) === 0 ? Colors.gray600 : Colors.neonOrange}
              />
              {(historyCount || 0) > 0 && (
                <View style={styles.historyBadge}>
                  <Text style={styles.historyBadgeText}>{historyCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}

        {/* Step Backward */}
        <TouchableOpacity onPress={handleBack} disabled={!canStepBackward} activeOpacity={0.7}>
          <Animated.View
            style={[
              styles.manualButton,
              styles.stepBackButton,
              !canStepBackward && styles.manualButtonDisabled,
              backStyle,
            ]}
          >
            <Ionicons
              name="play-back"
              size={26}
              color={!canStepBackward ? Colors.gray600 : Colors.neonPink}
            />
            <Text
              style={[styles.manualButtonLabel, !canStepBackward && styles.manualButtonLabelDisabled]}
            >
              Prev
            </Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Step Forward */}
        <TouchableOpacity onPress={handleForward} disabled={!canStepForward} activeOpacity={0.7}>
          <Animated.View
            style={[
              styles.manualButton,
              styles.stepForwardButton,
              !canStepForward && styles.manualButtonDisabled,
              forwardStyle,
            ]}
          >
            <Ionicons
              name="play-forward"
              size={26}
              color={!canStepForward ? Colors.gray600 : Colors.neonLime}
            />
            <Text
              style={[
                styles.manualButtonLabel,
                { color: Colors.neonLime },
                !canStepForward && styles.manualButtonLabelDisabled,
              ]}
            >
              Next
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

export default function PrecisionSpeedHUD({
  isPlaying,
  currentSpeed,
  currentStep,
  totalSteps,
  onSpeedChange,
  onPlay,
  onPause,
  onReset,
  onStepForward,
  onStepBackward,
  canStepForward = true,
  canStepBackward = true,
  showHistory = false,
  onHistoryBack,
  historyCount = 0,
}: PrecisionSpeedHUDProps) {
  const playScale = useSharedValue(1);
  const resetScale = useSharedValue(1);

  const handlePlayPause = () => {
    playScale.value = withSequence(
      withTiming(0.9, { duration: 50 }),
      withSpring(1, { damping: 10, stiffness: 300 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (currentSpeed === 'manual') {
      onSpeedChange('normal');
      onPlay();
    } else if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  const handleReset = () => {
    resetScale.value = withSequence(
      withTiming(0.85, { duration: 50 }),
      withSpring(1, { damping: 10, stiffness: 300 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onReset();
  };

  const playStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playScale.value }],
  }));

  const resetStyle = useAnimatedStyle(() => ({
    transform: [{ scale: resetScale.value }],
  }));

  const isManualMode = currentSpeed === 'manual';
  const speedColor = SPEED_CONFIGS[currentSpeed].color;

  return (
    <View style={styles.container}>
      {/* Glass background */}
      {Platform.OS === 'ios' ? (
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={styles.androidBlur} />
      )}

      <View style={styles.content}>
        {/* Header with current mode indicator */}
        <View style={styles.header}>
          <View style={[styles.modeIndicator, { backgroundColor: speedColor + '20', borderColor: speedColor }]}>
            <Text style={[styles.modeIcon]}>{SPEED_CONFIGS[currentSpeed].icon}</Text>
            <Text style={[styles.modeText, { color: speedColor }]}>
              {SPEED_CONFIGS[currentSpeed].label} Mode
            </Text>
          </View>

          {/* Reset Button */}
          <TouchableOpacity onPress={handleReset} activeOpacity={0.7}>
            <Animated.View style={[styles.resetButton, resetStyle]}>
              <Ionicons name="refresh" size={20} color={Colors.neonPink} />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Progress Indicator */}
        <ProgressIndicator current={currentStep} total={totalSteps} />

        {/* Speed Selector */}
        <View style={styles.speedSelector}>
          {(Object.keys(SPEED_CONFIGS) as PrecisionSpeedLevel[]).map((speed) => (
            <SpeedButton
              key={speed}
              speed={speed}
              isSelected={currentSpeed === speed}
              onPress={() => {
                onSpeedChange(speed);
                if (speed === 'manual') {
                  onPause();
                }
              }}
            />
          ))}
        </View>

        {/* Manual Mode Frame Controls */}
        {isManualMode && (
          <ManualControls
            onStepBackward={onStepBackward}
            onStepForward={onStepForward}
            canStepBackward={canStepBackward}
            canStepForward={canStepForward}
            onHistoryBack={onHistoryBack}
            historyCount={historyCount}
            showHistory={showHistory}
          />
        )}

        {/* Main Play/Pause Control (hidden in manual mode) */}
        {!isManualMode && (
          <TouchableOpacity onPress={handlePlayPause} activeOpacity={0.8}>
            <Animated.View
              style={[
                styles.mainPlayButton,
                { backgroundColor: isPlaying ? Colors.neonPink : Colors.neonLime },
                playStyle,
              ]}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={32}
                color={MIDNIGHT_BLACK}
              />
              <Text style={styles.mainPlayButtonText}>
                {isPlaying ? 'Pause' : currentStep >= totalSteps ? 'Restart' : 'Play'}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        )}

        {/* Keyboard shortcut hints */}
        <View style={styles.hintsRow}>
          <View style={styles.hint}>
            <Text style={styles.hintKey}>←</Text>
            <Text style={styles.hintLabel}>Prev</Text>
          </View>
          <View style={styles.hint}>
            <Text style={styles.hintKey}>→</Text>
            <Text style={styles.hintLabel}>Next</Text>
          </View>
          <View style={styles.hint}>
            <Text style={styles.hintKey}>Space</Text>
            <Text style={styles.hintLabel}>Play</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.glassBackground,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderBottomWidth: 0,
  },
  androidBlur: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 22, 41, 0.95)',
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  modeIcon: {
    fontSize: 16,
  },
  modeText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neonPink + '15',
    borderWidth: 1,
    borderColor: Colors.neonPink + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    marginBottom: Spacing.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.gray700,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.neonCyan,
    borderRadius: 3,
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  progressText: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  speedSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  speedButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.gray700,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  speedButtonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BorderRadius.md,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  speedEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  speedLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.gray400,
  },
  speedDelay: {
    fontSize: 8,
    color: Colors.gray500,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  manualControls: {
    backgroundColor: Colors.neonPurple + '10',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neonPurple + '30',
  },
  manualControlsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  manualControlsTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.neonPurple,
  },
  manualButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  manualButton: {
    width: 72,
    height: 60,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.gray700,
  },
  historyButton: {
    borderColor: Colors.neonOrange + '40',
    backgroundColor: Colors.neonOrange + '10',
  },
  stepBackButton: {
    borderColor: Colors.neonPink + '40',
    backgroundColor: Colors.neonPink + '10',
  },
  stepForwardButton: {
    borderColor: Colors.neonLime + '40',
    backgroundColor: Colors.neonLime + '10',
  },
  manualButtonDisabled: {
    backgroundColor: Colors.gray800,
    borderColor: Colors.gray700,
  },
  manualButtonLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.neonPink,
    marginTop: 2,
  },
  manualButtonLabelDisabled: {
    color: Colors.gray600,
  },
  historyBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.neonOrange,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  historyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: MIDNIGHT_BLACK,
  },
  mainPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.glowLime,
  },
  mainPlayButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: MIDNIGHT_BLACK,
  },
  hintsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray700,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  hintKey: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.gray500,
    backgroundColor: Colors.gray700,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  hintLabel: {
    fontSize: 10,
    color: Colors.gray500,
  },
});
