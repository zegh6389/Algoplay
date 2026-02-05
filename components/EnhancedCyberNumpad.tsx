// Enhanced Cyber-Numpad with Plop Animation and Staging Area Preview
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  Layout,
  interpolate,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MIDNIGHT_BLACK = '#0a0e17';

interface EnhancedCyberNumpadProps {
  visible: boolean;
  onClose: () => void;
  onApply: (values: number[]) => void;
  currentArray?: number[];
  maxArraySize?: number;
  maxDigits?: number;
  title?: string;
  showStagingArea?: boolean;
}

interface PlopAnimatedNumberProps {
  value: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  index: number;
  onComplete: () => void;
}

// Enhanced Plop Animation - Number floats from keypad and bounces into array
function PlopAnimatedNumber({
  value,
  startX,
  startY,
  targetX,
  targetY,
  index,
  onComplete,
}: PlopAnimatedNumberProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0.3);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const deltaX = targetX - startX;
    const deltaY = targetY - startY;

    // Phase 1: Pop out from numpad with scale
    scale.value = withSequence(
      withTiming(1.5, { duration: 150, easing: Easing.out(Easing.back(2)) }),
      withTiming(1.2, { duration: 100 })
    );
    opacity.value = withTiming(1, { duration: 100 });

    // Phase 2: Float in parabolic arc
    translateY.value = withSequence(
      // Rise up first
      withTiming(-80, { duration: 200, easing: Easing.out(Easing.quad) }),
      // Then arc down to target
      withTiming(deltaY, { duration: 400, easing: Easing.in(Easing.cubic) })
    );

    translateX.value = withDelay(
      100,
      withTiming(deltaX, { duration: 500, easing: Easing.out(Easing.quad) })
    );

    // Spin during flight
    rotation.value = withSequence(
      withTiming(15, { duration: 150 }),
      withTiming(-10, { duration: 200 }),
      withTiming(5, { duration: 150 }),
      withTiming(0, { duration: 100 })
    );

    // Phase 3: Bounce landing
    scale.value = withDelay(
      400,
      withSequence(
        // Squash on landing
        withTiming(0.8, { duration: 80, easing: Easing.out(Easing.quad) }),
        // Stretch back
        withSpring(1.15, { damping: 6, stiffness: 300 }),
        // Settle
        withSpring(1, { damping: 10, stiffness: 200 })
      )
    );

    // Fade out after landing in staging area
    opacity.value = withDelay(
      700,
      withTiming(0, { duration: 200 }, (finished) => {
        if (finished) {
          runOnJS(onComplete)();
        }
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: startX,
    top: startY,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.neonLime,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    shadowColor: Colors.neonLime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 15,
    zIndex: 100,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text style={styles.plopNumberText}>{value}</Text>
    </Animated.View>
  );
}

// Staging Area Item with removal animation
function StagingItem({
  value,
  index,
  onRemove,
}: {
  value: number;
  index: number;
  onRemove: (index: number) => void;
}) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      index * 50,
      withSpring(1, { damping: 10, stiffness: 200 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      layout={Layout.springify().damping(15)}
      entering={FadeIn.delay(index * 30).duration(200).springify()}
      exiting={FadeOut.duration(150)}
      style={[styles.stagingItem, animatedStyle]}
    >
      <Text style={styles.stagingItemText}>{value}</Text>
      <TouchableOpacity
        style={styles.stagingItemRemove}
        onPress={() => onRemove(index)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={14} color={Colors.neonPink} />
      </TouchableOpacity>
    </Animated.View>
  );
}

// Glass-morphism Numpad Key
function GlassNumpadKey({
  label,
  onPress,
  onLongPress,
  variant = 'default',
  icon,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  onLongPress?: () => void;
  variant?: 'default' | 'action' | 'danger' | 'enter';
  icon?: string;
  disabled?: boolean;
}) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const handlePressIn = () => {
    scale.value = withTiming(0.92, { duration: 50 });
    glowOpacity.value = withTiming(1, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    glowOpacity.value = withTiming(0, { duration: 200 });
  };

  const handlePress = () => {
    Haptics.impactAsync(
      variant === 'enter'
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light
    );
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const getKeyStyle = () => {
    switch (variant) {
      case 'action': return styles.keyAction;
      case 'danger': return styles.keyDanger;
      case 'enter': return styles.keyEnter;
      default: return styles.keyDefault;
    }
  };

  const getGlowColor = () => {
    switch (variant) {
      case 'action': return Colors.neonCyan;
      case 'danger': return Colors.neonPink;
      case 'enter': return Colors.neonLime;
      default: return Colors.textPrimary;
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={onLongPress}
      activeOpacity={1}
      disabled={disabled}
    >
      <Animated.View style={[styles.key, getKeyStyle(), disabled && styles.keyDisabled, animatedStyle]}>
        {/* Glow effect */}
        <Animated.View
          style={[
            styles.keyGlow,
            { borderColor: getGlowColor(), shadowColor: getGlowColor() },
            glowStyle,
          ]}
        />
        {icon ? (
          <Ionicons
            name={icon as any}
            size={24}
            color={
              disabled
                ? Colors.gray600
                : variant === 'enter'
                  ? MIDNIGHT_BLACK
                  : variant === 'danger'
                    ? Colors.neonPink
                    : Colors.textPrimary
            }
          />
        ) : (
          <Text
            style={[
              styles.keyText,
              variant === 'enter' && styles.keyTextEnter,
              variant === 'danger' && styles.keyTextDanger,
              disabled && styles.keyTextDisabled,
            ]}
          >
            {label}
          </Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// Staging Area Preview Component
function StagingArea({
  values,
  onRemove,
  onClearAll,
}: {
  values: number[];
  onRemove: (index: number) => void;
  onClearAll: () => void;
}) {
  return (
    <View style={styles.stagingArea}>
      <View style={styles.stagingHeader}>
        <View style={styles.stagingTitleRow}>
          <Ionicons name="layers-outline" size={18} color={Colors.neonPurple} />
          <Text style={styles.stagingTitle}>Staging Area</Text>
        </View>
        <View style={styles.stagingActions}>
          <Text style={styles.stagingCount}>{values.length} items</Text>
          {values.length > 0 && (
            <TouchableOpacity style={styles.clearAllButton} onPress={onClearAll}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.stagingContent}
      >
        {values.length === 0 ? (
          <View style={styles.stagingEmpty}>
            <Ionicons name="add-circle-outline" size={24} color={Colors.gray600} />
            <Text style={styles.stagingEmptyText}>Enter numbers to preview here</Text>
          </View>
        ) : (
          values.map((value, index) => (
            <StagingItem
              key={`${index}-${value}-${Date.now()}`}
              value={value}
              index={index}
              onRemove={onRemove}
            />
          ))
        )}
      </ScrollView>

      {/* Array notation preview */}
      {values.length > 0 && (
        <View style={styles.arrayNotation}>
          <Text style={styles.arrayNotationText}>[{values.join(', ')}]</Text>
        </View>
      )}
    </View>
  );
}

export default function EnhancedCyberNumpad({
  visible,
  onClose,
  onApply,
  currentArray = [],
  maxArraySize = 15,
  maxDigits = 4,
  title = 'Data Entry',
  showStagingArea = true,
}: EnhancedCyberNumpadProps) {
  const [inputValue, setInputValue] = useState('');
  const [stagedValues, setStagedValues] = useState<number[]>([]);
  const [plopAnimations, setPlopAnimations] = useState<
    { id: number; value: number; startX: number; startY: number; targetX: number; targetY: number }[]
  >([]);
  const plopIdRef = useRef(0);
  const numpadRef = useRef<View>(null);
  const stagingRef = useRef<View>(null);

  // Reset when opened
  useEffect(() => {
    if (visible) {
      setStagedValues([]);
      setInputValue('');
    }
  }, [visible]);

  const handleDigitPress = useCallback(
    (digit: string) => {
      if (inputValue.length < maxDigits) {
        setInputValue((prev) => prev + digit);
      }
    },
    [inputValue, maxDigits]
  );

  const handleBackspace = useCallback(() => {
    setInputValue((prev) => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setInputValue('');
  }, []);

  const handleEnter = useCallback(() => {
    if (inputValue.length === 0) return;
    const totalCount = currentArray.length + stagedValues.length;
    if (totalCount >= maxArraySize) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    const value = parseInt(inputValue, 10);
    if (isNaN(value)) return;

    // Trigger plop animation
    const id = plopIdRef.current++;
    // Approximate positions (from center of numpad to staging area)
    const startX = SCREEN_WIDTH / 2 - 25;
    const startY = SCREEN_HEIGHT * 0.55;
    const targetX = (stagedValues.length % 6) * 55 + 20 - startX;
    const targetY = -200;

    setPlopAnimations((prev) => [...prev, { id, value, startX, startY, targetX, targetY }]);

    // Add to staged values
    setStagedValues((prev) => [...prev, value]);
    setInputValue('');

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [inputValue, currentArray.length, stagedValues.length, maxArraySize]);

  const handleRemoveStaged = useCallback((index: number) => {
    setStagedValues((prev) => prev.filter((_, i) => i !== index));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleClearAllStaged = useCallback(() => {
    setStagedValues([]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handlePlopComplete = useCallback((id: number) => {
    setPlopAnimations((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleApply = useCallback(() => {
    if (stagedValues.length > 0) {
      onApply(stagedValues);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onClose();
  }, [stagedValues, onApply, onClose]);

  const handleClose = useCallback(() => {
    setInputValue('');
    setStagedValues([]);
    onClose();
  }, [onClose]);

  const totalItems = currentArray.length + stagedValues.length;
  const isMaxReached = totalItems >= maxArraySize;

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['clear', '0', 'backspace'],
  ];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        {Platform.OS === 'ios' && (
          <BlurView intensity={50} style={StyleSheet.absoluteFill} tint="dark" />
        )}
        {Platform.OS === 'android' && <View style={styles.androidBlur} />}

        {/* Close button */}
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={28} color={Colors.textPrimary} />
        </TouchableOpacity>

        {/* Main container */}
        <Animated.View
          entering={SlideInDown.springify().damping(15)}
          exiting={SlideOutDown.duration(200)}
          style={styles.container}
        >
          <View style={styles.glassContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>
                  {totalItems}/{maxArraySize} total items
                </Text>
              </View>
              <View style={styles.headerBadge}>
                <Ionicons name="keypad" size={20} color={Colors.neonCyan} />
              </View>
            </View>

            {/* Staging Area Preview */}
            {showStagingArea && (
              <StagingArea
                values={stagedValues}
                onRemove={handleRemoveStaged}
                onClearAll={handleClearAllStaged}
              />
            )}

            {/* Input Display */}
            <View style={styles.inputDisplay}>
              <Text style={[styles.inputValue, !inputValue && styles.inputPlaceholder]}>
                {inputValue || '0'}
              </Text>
              {inputValue.length > 0 && (
                <Text style={styles.inputHint}>Tap Enter to stage</Text>
              )}
            </View>

            {/* Numpad Grid */}
            <View ref={numpadRef} style={styles.numpadGrid}>
              {keys.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.numpadRow}>
                  {row.map((key) => {
                    if (key === 'backspace') {
                      return (
                        <GlassNumpadKey
                          key={key}
                          label=""
                          icon="backspace-outline"
                          onPress={handleBackspace}
                          onLongPress={handleClear}
                          variant="action"
                        />
                      );
                    }
                    if (key === 'clear') {
                      return (
                        <GlassNumpadKey
                          key={key}
                          label="C"
                          onPress={handleClear}
                          variant="danger"
                        />
                      );
                    }
                    return (
                      <GlassNumpadKey
                        key={key}
                        label={key}
                        onPress={() => handleDigitPress(key)}
                        disabled={isMaxReached && inputValue.length === 0}
                      />
                    );
                  })}
                </View>
              ))}
            </View>

            {/* Enter Button */}
            <TouchableOpacity
              style={[styles.enterButton, isMaxReached && styles.enterButtonDisabled]}
              onPress={handleEnter}
              disabled={isMaxReached || inputValue.length === 0}
            >
              <Ionicons
                name="add-circle"
                size={22}
                color={isMaxReached || inputValue.length === 0 ? Colors.gray500 : MIDNIGHT_BLACK}
              />
              <Text
                style={[
                  styles.enterButtonText,
                  (isMaxReached || inputValue.length === 0) && styles.enterButtonTextDisabled,
                ]}
              >
                {isMaxReached ? 'Limit Reached' : 'Stage Number'}
              </Text>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.applyButton, stagedValues.length === 0 && styles.applyButtonDisabled]}
                onPress={handleApply}
                disabled={stagedValues.length === 0}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={stagedValues.length === 0 ? Colors.gray500 : MIDNIGHT_BLACK}
                />
                <Text
                  style={[
                    styles.applyButtonText,
                    stagedValues.length === 0 && styles.applyButtonTextDisabled,
                  ]}
                >
                  Apply ({stagedValues.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Plop Animations */}
          {plopAnimations.map((anim) => (
            <PlopAnimatedNumber
              key={anim.id}
              value={anim.value}
              startX={anim.startX}
              startY={anim.startY}
              targetX={anim.targetX}
              targetY={anim.targetY}
              index={stagedValues.length - 1}
              onComplete={() => handlePlopComplete(anim.id)}
            />
          ))}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(10, 14, 23, 0.7)',
  },
  androidBlur: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 14, 23, 0.9)',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: Colors.gray700,
  },
  container: {
    maxHeight: SCREEN_HEIGHT * 0.88,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    overflow: 'visible',
  },
  glassContainer: {
    backgroundColor: Colors.glassBackground,
    borderWidth: 1,
    borderColor: Colors.neonBorderCyan,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl + 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
    marginTop: 2,
  },
  headerBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.neonCyan + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neonCyan + '40',
  },
  stagingArea: {
    backgroundColor: Colors.cardBackgroundDark,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.neonPurple + '30',
  },
  stagingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  stagingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  stagingTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.neonPurple,
  },
  stagingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stagingCount: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
  },
  clearAllButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.neonPink + '15',
    borderRadius: BorderRadius.sm,
  },
  clearAllText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.neonPink,
  },
  stagingContent: {
    paddingVertical: Spacing.sm,
    minHeight: 60,
    alignItems: 'center',
  },
  stagingEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  stagingEmptyText: {
    fontSize: FontSizes.sm,
    color: Colors.gray600,
    fontStyle: 'italic',
  },
  stagingItem: {
    backgroundColor: Colors.neonLime + '20',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.neonLime + '40',
  },
  stagingItemText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.neonLime,
  },
  stagingItemRemove: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.neonPink + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.xs,
  },
  arrayNotation: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
  },
  arrayNotationText: {
    fontSize: FontSizes.sm,
    color: Colors.neonCyan,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlign: 'center',
  },
  inputDisplay: {
    backgroundColor: Colors.cardBackgroundDark,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.neonCyan + '40',
    minHeight: 90,
    justifyContent: 'center',
  },
  inputValue: {
    fontSize: 52,
    fontWeight: '700',
    color: Colors.neonCyan,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textShadowColor: Colors.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  inputPlaceholder: {
    color: Colors.gray600,
    textShadowRadius: 0,
  },
  inputHint: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    marginTop: Spacing.xs,
  },
  numpadGrid: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  numpadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  key: {
    width: 75,
    height: 58,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  keyGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    backgroundColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  keyDefault: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.gray700,
  },
  keyAction: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.neonCyan + '40',
  },
  keyDanger: {
    backgroundColor: Colors.neonPink + '15',
    borderWidth: 1,
    borderColor: Colors.neonPink + '40',
  },
  keyEnter: {
    backgroundColor: Colors.neonLime,
    borderWidth: 0,
  },
  keyDisabled: {
    backgroundColor: Colors.gray800,
    borderColor: Colors.gray700,
  },
  keyText: {
    fontSize: FontSizes.xxl,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  keyTextEnter: {
    color: MIDNIGHT_BLACK,
  },
  keyTextDanger: {
    color: Colors.neonPink,
    fontWeight: '700',
  },
  keyTextDisabled: {
    color: Colors.gray600,
  },
  enterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.neonLime,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadows.glowLime,
  },
  enterButtonDisabled: {
    backgroundColor: Colors.gray700,
    shadowOpacity: 0,
  },
  enterButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: MIDNIGHT_BLACK,
  },
  enterButtonTextDisabled: {
    color: Colors.gray500,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.gray700,
  },
  cancelButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  applyButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.neonCyan,
    ...Shadows.glow,
  },
  applyButtonDisabled: {
    backgroundColor: Colors.gray700,
    shadowOpacity: 0,
  },
  applyButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: MIDNIGHT_BLACK,
  },
  applyButtonTextDisabled: {
    color: Colors.gray500,
  },
  plopNumberText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: MIDNIGHT_BLACK,
  },
});
