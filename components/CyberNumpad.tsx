// Cyber-Numpad Input System with Glass-morphism Design
import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform,
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
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MIDNIGHT_BLACK = '#0a0e17';

interface CyberNumpadProps {
  visible: boolean;
  onClose: () => void;
  onNumberEnter: (value: number) => void;
  maxDigits?: number;
  currentArray?: number[];
  maxArraySize?: number;
  title?: string;
}

interface FloatingNumberProps {
  value: number;
  onComplete: () => void;
}

// Animated floating number that "plops" into the array
function FloatingNumber({ value, onComplete }: FloatingNumberProps) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    // Float up animation
    translateY.value = withSequence(
      withTiming(-100, { duration: 300, easing: Easing.out(Easing.cubic) }),
      withDelay(100, withTiming(-200, { duration: 400, easing: Easing.inOut(Easing.cubic) }))
    );

    // Slight horizontal movement
    translateX.value = withSequence(
      withTiming(50, { duration: 350, easing: Easing.out(Easing.quad) }),
      withTiming(80, { duration: 350, easing: Easing.inOut(Easing.quad) })
    );

    // Scale bounce (0 -> 1.1 -> 1)
    scale.value = withSequence(
      withSpring(1.2, { damping: 6, stiffness: 200 }),
      withDelay(400, withSpring(1.1, { damping: 8, stiffness: 150 })),
      withDelay(100, withSpring(0.8, { damping: 10, stiffness: 100 }))
    );

    // Rotation wobble
    rotation.value = withSequence(
      withTiming(5, { duration: 100 }),
      withTiming(-5, { duration: 100 }),
      withTiming(3, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );

    // Fade out at the end
    opacity.value = withDelay(
      600,
      withTiming(0, { duration: 200 }, (finished) => {
        if (finished) {
          runOnJS(onComplete)();
        }
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.floatingNumber, animatedStyle]}>
      <Text style={styles.floatingNumberText}>{value}</Text>
    </Animated.View>
  );
}

// Numpad key component with press animation
function NumpadKey({
  label,
  onPress,
  variant = 'default',
  icon,
}: {
  label: string;
  onPress: () => void;
  variant?: 'default' | 'action' | 'danger' | 'enter';
  icon?: string;
}) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.9, { duration: 50 }),
      withSpring(1, { damping: 10, stiffness: 300 })
    );
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

  const getKeyStyle = () => {
    switch (variant) {
      case 'action':
        return styles.keyAction;
      case 'danger':
        return styles.keyDanger;
      case 'enter':
        return styles.keyEnter;
      default:
        return styles.keyDefault;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'enter':
        return styles.keyTextEnter;
      case 'danger':
        return styles.keyTextDanger;
      case 'action':
        return styles.keyTextAction;
      default:
        return styles.keyText;
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Animated.View style={[styles.key, getKeyStyle(), animatedStyle]}>
        {icon ? (
          <Ionicons
            name={icon as any}
            size={24}
            color={variant === 'enter' ? MIDNIGHT_BLACK : variant === 'danger' ? Colors.neonPink : Colors.textPrimary}
          />
        ) : (
          <Text style={getTextStyle()}>{label}</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// Mini array preview showing entered numbers
function ArrayPreview({ array, maxSize }: { array: number[]; maxSize: number }) {
  return (
    <View style={styles.arrayPreview}>
      <View style={styles.arrayPreviewHeader}>
        <Text style={styles.arrayPreviewTitle}>Current Array</Text>
        <Text style={styles.arrayPreviewCount}>
          {array.length}/{maxSize}
        </Text>
      </View>
      <View style={styles.arrayPreviewItems}>
        {array.length === 0 ? (
          <Text style={styles.arrayPreviewEmpty}>Empty - enter numbers below</Text>
        ) : (
          array.map((num, index) => (
            <Animated.View
              key={`${index}-${num}`}
              entering={FadeIn.delay(index * 50).duration(200)}
              style={styles.arrayPreviewItem}
            >
              <Text style={styles.arrayPreviewItemText}>{num}</Text>
            </Animated.View>
          ))
        )}
      </View>
    </View>
  );
}

export default function CyberNumpad({
  visible,
  onClose,
  onNumberEnter,
  maxDigits = 5,
  currentArray = [],
  maxArraySize = 15,
  title = 'Enter Numbers',
}: CyberNumpadProps) {
  const [inputValue, setInputValue] = useState('');
  const [localArray, setLocalArray] = useState<number[]>(currentArray);
  const [floatingNumbers, setFloatingNumbers] = useState<{ id: number; value: number }[]>([]);
  const floatingIdRef = useRef(0);

  React.useEffect(() => {
    setLocalArray(currentArray);
  }, [currentArray]);

  const handleDigitPress = useCallback((digit: string) => {
    if (inputValue.length < maxDigits) {
      setInputValue((prev) => prev + digit);
    }
  }, [inputValue, maxDigits]);

  const handleBackspace = useCallback(() => {
    setInputValue((prev) => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setInputValue('');
  }, []);

  const handleReset = useCallback(() => {
    setInputValue('');
    setLocalArray([]);
  }, []);

  const handleEnter = useCallback(() => {
    if (inputValue.length === 0) return;
    if (localArray.length >= maxArraySize) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    const value = parseInt(inputValue, 10);
    if (isNaN(value)) return;

    // Add floating animation
    const id = floatingIdRef.current++;
    setFloatingNumbers((prev) => [...prev, { id, value }]);

    // Add to local array
    setLocalArray((prev) => [...prev, value]);
    setInputValue('');

    // Notify parent
    onNumberEnter(value);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [inputValue, localArray.length, maxArraySize, onNumberEnter]);

  const handleFloatingComplete = useCallback((id: number) => {
    setFloatingNumbers((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleClose = useCallback(() => {
    setInputValue('');
    onClose();
  }, [onClose]);

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['clear', '0', 'backspace'],
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* Blur background */}
        {Platform.OS === 'ios' && (
          <BlurView intensity={40} style={StyleSheet.absoluteFill} tint="dark" />
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
          {/* Glass effect border */}
          <View style={styles.glassContainer}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleReset}
              >
                <Ionicons name="refresh" size={18} color={Colors.neonPink} />
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
            </View>

            {/* Array Preview */}
            <ArrayPreview array={localArray} maxSize={maxArraySize} />

            {/* Input Display */}
            <View style={styles.inputDisplay}>
              <Text style={styles.inputValue}>
                {inputValue || '0'}
              </Text>
              {inputValue.length > 0 && (
                <Text style={styles.inputHint}>
                  Press Enter to add
                </Text>
              )}
            </View>

            {/* Numpad Grid */}
            <View style={styles.numpadGrid}>
              {keys.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.numpadRow}>
                  {row.map((key) => {
                    if (key === 'backspace') {
                      return (
                        <NumpadKey
                          key={key}
                          label=""
                          icon="backspace-outline"
                          onPress={handleBackspace}
                          variant="action"
                        />
                      );
                    }
                    if (key === 'clear') {
                      return (
                        <NumpadKey
                          key={key}
                          label="C"
                          onPress={handleClear}
                          variant="danger"
                        />
                      );
                    }
                    return (
                      <NumpadKey
                        key={key}
                        label={key}
                        onPress={() => handleDigitPress(key)}
                      />
                    );
                  })}
                </View>
              ))}
            </View>

            {/* Enter Button */}
            <TouchableOpacity
              style={[
                styles.enterButton,
                localArray.length >= maxArraySize && styles.enterButtonDisabled,
              ]}
              onPress={handleEnter}
              disabled={localArray.length >= maxArraySize}
            >
              <Text style={styles.enterButtonText}>
                {localArray.length >= maxArraySize ? 'Array Full' : 'Neon Enter'}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={localArray.length >= maxArraySize ? Colors.gray500 : MIDNIGHT_BLACK}
              />
            </TouchableOpacity>

            {/* Done Button */}
            <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Floating numbers */}
          {floatingNumbers.map((item) => (
            <FloatingNumber
              key={item.id}
              value={item.value}
              onComplete={() => handleFloatingComplete(item.id)}
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
    backgroundColor: 'rgba(10, 14, 23, 0.85)',
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
  },
  container: {
    maxHeight: SCREEN_HEIGHT * 0.85,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    overflow: 'hidden',
  },
  glassContainer: {
    backgroundColor: Colors.glassBackground,
    borderWidth: 1,
    borderColor: Colors.neonBorderCyan,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
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
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.neonPink + '20',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neonPink + '40',
  },
  resetText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.neonPink,
  },
  arrayPreview: {
    backgroundColor: Colors.cardBackgroundDark,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.gray700,
  },
  arrayPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  arrayPreviewTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.gray400,
  },
  arrayPreviewCount: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.neonCyan,
  },
  arrayPreviewItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  arrayPreviewEmpty: {
    fontSize: FontSizes.sm,
    color: Colors.gray500,
    fontStyle: 'italic',
  },
  arrayPreviewItem: {
    backgroundColor: Colors.neonCyan + '20',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.neonCyan + '40',
  },
  arrayPreviewItemText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.neonCyan,
  },
  inputDisplay: {
    backgroundColor: Colors.cardBackgroundDark,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.neonCyan + '40',
    minHeight: 80,
    justifyContent: 'center',
  },
  inputValue: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.neonCyan,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textShadowColor: Colors.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
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
    width: 72,
    height: 56,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
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
  keyText: {
    fontSize: FontSizes.xxl,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  keyTextAction: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.neonCyan,
  },
  keyTextDanger: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.neonPink,
  },
  keyTextEnter: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: MIDNIGHT_BLACK,
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
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: MIDNIGHT_BLACK,
  },
  doneButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.gray700,
  },
  doneButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  floatingNumber: {
    position: 'absolute',
    bottom: 200,
    left: SCREEN_WIDTH / 2 - 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.neonLime,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.glowLime,
  },
  floatingNumberText: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: MIDNIGHT_BLACK,
  },
});
