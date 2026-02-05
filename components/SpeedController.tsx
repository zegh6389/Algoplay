// Interactive Speed Controller with Manual Mode and HUD
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';

const MIDNIGHT_BLACK = '#0a0e17';

type SpeedLevel = 'turtle' | 'normal' | 'lightning' | 'manual';

interface SpeedControllerProps {
  isPlaying: boolean;
  currentSpeed: SpeedLevel;
  onSpeedChange: (speed: SpeedLevel) => void;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  canStepForward: boolean;
  canStepBackward: boolean;
  showFloating?: boolean;
}

// Speed level configurations
const SPEED_CONFIG = {
  turtle: {
    label: 'Turtle',
    icon: 'hourglass-outline',
    delay: 1500, // 1.5s per step
    color: Colors.neonLime,
  },
  normal: {
    label: 'Normal',
    icon: 'play-outline',
    delay: 500, // 0.5s per step
    color: Colors.neonCyan,
  },
  lightning: {
    label: 'Lightning',
    icon: 'flash-outline',
    delay: 100, // 0.1s per step
    color: Colors.neonYellow,
  },
  manual: {
    label: 'Manual',
    icon: 'hand-left-outline',
    delay: 0, // Step-by-step
    color: Colors.neonPurple,
  },
};

// Animated speed button
function SpeedButton({
  level,
  isActive,
  onPress,
}: {
  level: SpeedLevel;
  isActive: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const config = SPEED_CONFIG[level];

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

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Animated.View
        style={[
          styles.speedButton,
          isActive && {
            backgroundColor: config.color + '20',
            borderColor: config.color,
          },
          animatedStyle,
        ]}
      >
        <Ionicons
          name={config.icon as any}
          size={18}
          color={isActive ? config.color : Colors.gray400}
        />
        <Text style={[styles.speedLabel, isActive && { color: config.color }]}>
          {config.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// Main control button (Play/Pause)
function MainControlButton({
  isPlaying,
  onPlay,
  onPause,
  isManualMode,
}: {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  isManualMode: boolean;
}) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.85, { duration: 80 }),
      withSpring(1, { damping: 8, stiffness: 250 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  // In manual mode, show disabled state
  if (isManualMode) {
    return (
      <View style={[styles.mainButton, styles.mainButtonDisabled]}>
        <Ionicons name="pause" size={32} color={Colors.gray600} />
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.mainButton,
          isPlaying ? styles.mainButtonPlaying : styles.mainButtonPaused,
          animatedStyle,
        ]}
      >
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={32}
          color={isPlaying ? Colors.neonPink : MIDNIGHT_BLACK}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

// Step control buttons for manual mode
function StepControlButton({
  direction,
  onPress,
  disabled,
}: {
  direction: 'backward' | 'forward';
  onPress: () => void;
  disabled: boolean;
}) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    if (disabled) return;
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

  const icon = direction === 'backward' ? 'play-skip-back' : 'play-skip-forward';
  const label = direction === 'backward' ? 'Undo' : 'Next';
  const color = direction === 'backward' ? Colors.neonPink : Colors.neonLime;

  return (
    <TouchableOpacity onPress={handlePress} disabled={disabled} activeOpacity={0.7}>
      <Animated.View
        style={[
          styles.stepButton,
          disabled && styles.stepButtonDisabled,
          animatedStyle,
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={disabled ? Colors.gray600 : color}
        />
        <Text style={[styles.stepLabel, disabled && { color: Colors.gray600 }]}>
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function SpeedController({
  isPlaying,
  currentSpeed,
  onSpeedChange,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onReset,
  canStepForward,
  canStepBackward,
  showFloating = false,
}: SpeedControllerProps) {
  const isManualMode = currentSpeed === 'manual';

  const speedLevels: SpeedLevel[] = ['turtle', 'normal', 'lightning', 'manual'];

  return (
    <View style={[styles.container, showFloating && styles.containerFloating]}>
      {/* Speed Level Selector */}
      <View style={styles.speedSelector}>
        <Text style={styles.sectionTitle}>Speed</Text>
        <View style={styles.speedButtons}>
          {speedLevels.map((level) => (
            <SpeedButton
              key={level}
              level={level}
              isActive={currentSpeed === level}
              onPress={() => onSpeedChange(level)}
            />
          ))}
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Playback Controls */}
      <View style={styles.playbackSection}>
        {/* Reset Button */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={onReset}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        {/* Step Back / Main Control / Step Forward */}
        <View style={styles.mainControls}>
          {isManualMode ? (
            <>
              <StepControlButton
                direction="backward"
                onPress={onStepBackward}
                disabled={!canStepBackward}
              />
              <View style={styles.manualModeIndicator}>
                <Ionicons name="hand-left" size={24} color={Colors.neonPurple} />
                <Text style={styles.manualModeText}>Manual</Text>
              </View>
              <StepControlButton
                direction="forward"
                onPress={onStepForward}
                disabled={!canStepForward}
              />
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.stepButtonSmall, !canStepBackward && styles.stepButtonDisabled]}
                onPress={onStepBackward}
                disabled={!canStepBackward}
              >
                <Ionicons
                  name="play-skip-back"
                  size={20}
                  color={canStepBackward ? Colors.textPrimary : Colors.gray600}
                />
              </TouchableOpacity>

              <MainControlButton
                isPlaying={isPlaying}
                onPlay={onPlay}
                onPause={onPause}
                isManualMode={false}
              />

              <TouchableOpacity
                style={[styles.stepButtonSmall, !canStepForward && styles.stepButtonDisabled]}
                onPress={onStepForward}
                disabled={!canStepForward}
              >
                <Ionicons
                  name="play-skip-forward"
                  size={20}
                  color={canStepForward ? Colors.textPrimary : Colors.gray600}
                />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Speed indicator */}
        <View style={styles.speedIndicator}>
          <Text style={styles.speedIndicatorLabel}>
            {SPEED_CONFIG[currentSpeed].delay > 0
              ? `${SPEED_CONFIG[currentSpeed].delay / 1000}s/step`
              : 'Step-by-step'}
          </Text>
        </View>
      </View>
    </View>
  );
}

// Export speed delay helper
export const getSpeedDelay = (speed: SpeedLevel): number => {
  return SPEED_CONFIG[speed].delay;
};

export type { SpeedLevel };

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.gray700,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  containerFloating: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: BorderRadius.xl,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    margin: Spacing.md,
    ...Shadows.large,
  },
  speedSelector: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.gray500,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  speedButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  speedButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    backgroundColor: Colors.gray700,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  speedLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.gray400,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray700,
    marginVertical: Spacing.sm,
  },
  playbackSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resetButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray700,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  mainButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.medium,
  },
  mainButtonPaused: {
    backgroundColor: Colors.neonLime,
    shadowColor: Colors.neonLime,
  },
  mainButtonPlaying: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 2,
    borderColor: Colors.neonPink,
  },
  mainButtonDisabled: {
    backgroundColor: Colors.gray700,
    shadowOpacity: 0,
  },
  stepButtonSmall: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray700,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepButton: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.gray700,
    borderRadius: BorderRadius.lg,
  },
  stepButtonDisabled: {
    backgroundColor: Colors.gray800,
    opacity: 0.5,
  },
  stepLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  manualModeIndicator: {
    alignItems: 'center',
    gap: 4,
  },
  manualModeText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.neonPurple,
  },
  speedIndicator: {
    width: 80,
    alignItems: 'flex-end',
  },
  speedIndicatorLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
