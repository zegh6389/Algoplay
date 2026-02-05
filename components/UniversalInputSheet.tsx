// Universal Input Sheet - High-end glass-morphism bottom sheet for data customization
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Dimensions,
  Pressable,
  Platform,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import Slider from '@react-native-community/slider';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type InputMode = 'manual' | 'random' | 'tree';
type ValidationState = 'idle' | 'valid' | 'invalid';
type AlgorithmType = 'sorting' | 'searching' | 'tree';

interface UniversalInputSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (data: number[], target?: number) => void;
  algorithmType: AlgorithmType;
  currentArray?: number[];
  currentTarget?: number;
  maxSize?: number;
  minSize?: number;
}

interface LivePreviewProps {
  data: number[];
  maxValue: number;
  algorithmType: AlgorithmType;
  target?: number;
}

// Glass-morphism card component
function GlassCard({ children, style, highlight = false }: { children: React.ReactNode; style?: any; highlight?: boolean }) {
  return (
    <View style={[styles.glassCard, highlight && styles.glassCardHighlight, style]}>
      {children}
    </View>
  );
}

// Live Preview Component showing bar visualization
function LivePreview({ data, maxValue, algorithmType, target }: LivePreviewProps) {
  const barWidth = Math.max(12, Math.min(24, (SCREEN_WIDTH - 120) / data.length - 2));
  const maxHeight = 60;

  if (data.length === 0) {
    return (
      <View style={styles.previewEmpty}>
        <Ionicons name="eye-outline" size={24} color={Colors.gray500} />
        <Text style={styles.previewEmptyText}>Add values to preview</Text>
      </View>
    );
  }

  return (
    <View style={styles.previewContainer}>
      <View style={styles.previewHeader}>
        <View style={styles.previewTitleRow}>
          <Ionicons name="eye" size={14} color={Colors.actionTeal} />
          <Text style={styles.previewTitle}>Live Preview</Text>
        </View>
        <Text style={styles.previewCount}>{data.length} elements</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewScroll}>
        <View style={styles.previewBars}>
          {data.map((value, index) => {
            const height = (value / maxValue) * maxHeight;
            const isTarget = algorithmType === 'searching' && target !== undefined && value === target;
            return (
              <Animated.View
                key={`${index}-${value}`}
                entering={FadeIn.delay(index * 20).springify()}
                style={[
                  styles.previewBar,
                  {
                    width: barWidth,
                    height: Math.max(4, height),
                    backgroundColor: isTarget ? Colors.alertCoral : Colors.actionTeal,
                    opacity: isTarget ? 1 : 0.7,
                  },
                ]}
              >
                {barWidth >= 16 && (
                  <Text style={styles.previewBarLabel}>{value}</Text>
                )}
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
      {algorithmType === 'searching' && target !== undefined && (
        <View style={styles.targetIndicator}>
          <View style={[styles.targetDot, { backgroundColor: Colors.alertCoral }]} />
          <Text style={styles.targetIndicatorText}>Target: {target}</Text>
        </View>
      )}
    </View>
  );
}

// Manual Input Section with validation
function ManualInputSection({
  value,
  onChange,
  validationState,
  errorMessage,
}: {
  value: string;
  onChange: (text: string) => void;
  validationState: ValidationState;
  errorMessage: string;
}) {
  const shakeAnim = useSharedValue(0);

  useEffect(() => {
    if (validationState === 'invalid') {
      shakeAnim.value = withSpring(1, { damping: 2, stiffness: 500 }, () => {
        shakeAnim.value = withSpring(0);
      });
    }
  }, [validationState]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(shakeAnim.value, [0, 0.5, 1], [0, -10, 10], Extrapolation.CLAMP) },
    ],
  }));

  const getBorderColor = () => {
    switch (validationState) {
      case 'valid':
        return Colors.success;
      case 'invalid':
        return Colors.alertCoral;
      default:
        return Colors.gray600;
    }
  };

  return (
    <Animated.View style={animatedStyle}>
      <GlassCard highlight={validationState === 'valid'}>
        <View style={styles.inputHeader}>
          <View style={styles.inputLabelRow}>
            <Ionicons name="keypad-outline" size={16} color={Colors.actionTeal} />
            <Text style={styles.inputLabel}>Manual Entry</Text>
          </View>
          {validationState === 'valid' && (
            <View style={styles.validBadge}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
              <Text style={styles.validBadgeText}>Valid</Text>
            </View>
          )}
        </View>
        <TextInput
          style={[
            styles.textInput,
            { borderColor: getBorderColor() },
            validationState === 'invalid' && styles.textInputError,
          ]}
          value={value}
          onChangeText={onChange}
          placeholder="Enter comma-separated numbers (e.g., 5, 12, 3, 8, 1)"
          placeholderTextColor={Colors.gray500}
          keyboardType="default"
          multiline
          numberOfLines={2}
          autoCorrect={false}
        />
        <Text style={styles.inputHint}>
          Numbers only, separated by commas. Max 999 per value.
        </Text>
        {validationState === 'invalid' && errorMessage && (
          <Animated.View entering={FadeIn} style={styles.errorContainer}>
            <Ionicons name="warning" size={14} color={Colors.alertCoral} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </Animated.View>
        )}
      </GlassCard>
    </Animated.View>
  );
}

// Target Selector for Searching algorithms
function TargetSelector({
  target,
  onTargetChange,
  minValue,
  maxValue,
  array,
}: {
  target: number;
  onTargetChange: (value: number) => void;
  minValue: number;
  maxValue: number;
  array: number[];
}) {
  const [inputValue, setInputValue] = useState(target.toString());
  const isInArray = array.includes(target);

  const handleSliderChange = (value: number) => {
    const roundedValue = Math.round(value);
    onTargetChange(roundedValue);
    setInputValue(roundedValue.toString());
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    const num = parseInt(text, 10);
    if (!isNaN(num) && num >= 1 && num <= 999) {
      onTargetChange(num);
    }
  };

  const handleQuickSelect = (value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTargetChange(value);
    setInputValue(value.toString());
  };

  return (
    <GlassCard>
      <View style={styles.inputHeader}>
        <View style={styles.inputLabelRow}>
          <Ionicons name="locate-outline" size={16} color={Colors.alertCoral} />
          <Text style={styles.inputLabel}>Search Target</Text>
        </View>
        <View style={[styles.inArrayBadge, isInArray && styles.inArrayBadgeActive]}>
          <Ionicons
            name={isInArray ? "checkmark-circle" : "close-circle"}
            size={12}
            color={isInArray ? Colors.success : Colors.gray500}
          />
          <Text style={[styles.inArrayText, isInArray && styles.inArrayTextActive]}>
            {isInArray ? "In array" : "Not in array"}
          </Text>
        </View>
      </View>

      <View style={styles.targetInputRow}>
        <TextInput
          style={styles.targetTextInput}
          value={inputValue}
          onChangeText={handleInputChange}
          keyboardType="number-pad"
          maxLength={3}
        />
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={minValue}
            maximumValue={maxValue}
            value={target}
            onValueChange={handleSliderChange}
            minimumTrackTintColor={Colors.alertCoral}
            maximumTrackTintColor={Colors.gray600}
            thumbTintColor={Colors.alertCoral}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>{minValue}</Text>
            <Text style={styles.sliderLabel}>{maxValue}</Text>
          </View>
        </View>
      </View>

      {array.length > 0 && (
        <View style={styles.quickSelectSection}>
          <Text style={styles.quickSelectLabel}>Quick Select from Array:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.quickSelectRow}>
              {array.slice(0, 10).map((value, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.quickSelectChip,
                    target === value && styles.quickSelectChipActive,
                  ]}
                  onPress={() => handleQuickSelect(value)}
                >
                  <Text
                    style={[
                      styles.quickSelectText,
                      target === value && styles.quickSelectTextActive,
                    ]}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </GlassCard>
  );
}

// Randomization Tool
function RandomizationTool({
  onGenerate,
  minSize,
  maxSize,
  algorithmType,
}: {
  onGenerate: (data: number[], target?: number) => void;
  minSize: number;
  maxSize: number;
  algorithmType: AlgorithmType;
}) {
  const [size, setSize] = useState(10);
  const [pattern, setPattern] = useState<'random' | 'nearly-sorted' | 'reversed' | 'few-unique'>('random');

  const patterns = [
    { key: 'random', label: 'Random', icon: 'shuffle' as const, color: Colors.actionTeal },
    { key: 'nearly-sorted', label: 'Nearly Sorted', icon: 'trending-up' as const, color: Colors.success },
    { key: 'reversed', label: 'Reversed', icon: 'arrow-down' as const, color: Colors.alertCoral },
    { key: 'few-unique', label: 'Few Unique', icon: 'copy' as const, color: Colors.logicGold },
  ];

  const handleGenerate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    let data: number[] = [];

    switch (pattern) {
      case 'random':
        data = Array.from({ length: size }, () => Math.floor(Math.random() * 99) + 1);
        break;
      case 'nearly-sorted':
        data = Array.from({ length: size }, (_, i) => i * 5 + Math.floor(Math.random() * 10));
        for (let i = 0; i < Math.floor(size / 4); i++) {
          const idx1 = Math.floor(Math.random() * size);
          const idx2 = Math.floor(Math.random() * size);
          [data[idx1], data[idx2]] = [data[idx2], data[idx1]];
        }
        break;
      case 'reversed':
        data = Array.from({ length: size }, (_, i) => (size - i) * 5);
        break;
      case 'few-unique':
        const uniqueValues = [10, 25, 50, 75, 90];
        data = Array.from({ length: size }, () =>
          uniqueValues[Math.floor(Math.random() * uniqueValues.length)]
        );
        break;
    }

    // For searching, pick a random target from the array
    if (algorithmType === 'searching') {
      // Sort array for binary search compatibility
      data.sort((a, b) => a - b);
      const target = data[Math.floor(Math.random() * data.length)];
      onGenerate(data, target);
    } else {
      onGenerate(data);
    }
  };

  return (
    <GlassCard>
      <View style={styles.inputHeader}>
        <View style={styles.inputLabelRow}>
          <Ionicons name="flash" size={16} color={Colors.logicGold} />
          <Text style={styles.inputLabel}>Generate Random</Text>
        </View>
      </View>

      {/* Size Slider */}
      <View style={styles.sizeSelectorSection}>
        <View style={styles.sizeHeader}>
          <Text style={styles.sizeLabel}>Array Size</Text>
          <View style={styles.sizeValueBadge}>
            <Text style={styles.sizeValue}>{size}</Text>
          </View>
        </View>
        <Slider
          style={styles.sizeSlider}
          minimumValue={minSize}
          maximumValue={maxSize}
          step={1}
          value={size}
          onValueChange={(value) => setSize(Math.round(value))}
          minimumTrackTintColor={Colors.actionTeal}
          maximumTrackTintColor={Colors.gray600}
          thumbTintColor={Colors.actionTeal}
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>{minSize}</Text>
          <Text style={styles.sliderLabel}>{maxSize}</Text>
        </View>
      </View>

      {/* Pattern Selection */}
      <View style={styles.patternSection}>
        <Text style={styles.sizeLabel}>Data Pattern</Text>
        <View style={styles.patternGrid}>
          {patterns.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[
                styles.patternButton,
                pattern === p.key && styles.patternButtonActive,
                pattern === p.key && { borderColor: p.color },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setPattern(p.key as typeof pattern);
              }}
            >
              <Ionicons
                name={p.icon}
                size={18}
                color={pattern === p.key ? p.color : Colors.gray400}
              />
              <Text
                style={[
                  styles.patternText,
                  pattern === p.key && { color: p.color },
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Generate Button */}
      <TouchableOpacity style={styles.generateButton} onPress={handleGenerate}>
        <LinearGradient
          colors={[Colors.actionTeal, Colors.actionTealDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.generateButtonGradient}
        >
          <Ionicons name="sparkles" size={20} color={Colors.midnightBlue} />
          <Text style={styles.generateButtonText}>Generate Data</Text>
        </LinearGradient>
      </TouchableOpacity>
    </GlassCard>
  );
}

// Tree Input Section
function TreeInputSection({
  values,
  onValuesChange,
}: {
  values: number[];
  onValuesChange: (values: number[]) => void;
}) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue && values.length < 15) {
      const num = parseInt(inputValue, 10);
      if (!isNaN(num) && num >= 1 && num <= 999) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onValuesChange([...values, num]);
        setInputValue('');
      }
    }
  };

  const handleRemove = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onValuesChange(values.filter((_, i) => i !== index));
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onValuesChange([]);
  };

  return (
    <GlassCard>
      <View style={styles.inputHeader}>
        <View style={styles.inputLabelRow}>
          <Ionicons name="git-branch" size={16} color={Colors.info} />
          <Text style={styles.inputLabel}>Tree Builder</Text>
        </View>
        {values.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.treeHint}>
        Values will be inserted one-by-one to build a Binary Search Tree.
        Tap a node to remove it.
      </Text>

      {/* Node Preview */}
      <View style={styles.treeNodesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.treeNodesRow}>
            {values.map((value, index) => (
              <Animated.View
                key={index}
                entering={FadeIn.springify()}
                exiting={FadeOut.duration(200)}
              >
                <TouchableOpacity
                  style={styles.treeNode}
                  onPress={() => handleRemove(index)}
                >
                  <Text style={styles.treeNodeValue}>{value}</Text>
                  <View style={styles.treeNodeIndex}>
                    <Text style={styles.treeNodeIndexText}>{index + 1}</Text>
                  </View>
                  <View style={styles.treeNodeRemove}>
                    <Ionicons name="close" size={10} color={Colors.white} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
            {values.length === 0 && (
              <Text style={styles.noNodesText}>No nodes added yet</Text>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Input Row */}
      <View style={styles.treeInputRow}>
        <TextInput
          style={styles.treeInput}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="Enter value (1-999)"
          placeholderTextColor={Colors.gray500}
          keyboardType="number-pad"
          maxLength={3}
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity
          style={[
            styles.treeAddButton,
            (!inputValue || values.length >= 15) && styles.treeAddButtonDisabled,
          ]}
          onPress={handleAdd}
          disabled={!inputValue || values.length >= 15}
        >
          <Ionicons
            name="add"
            size={24}
            color={(!inputValue || values.length >= 15) ? Colors.gray500 : Colors.midnightBlue}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.treeFooter}>
        <Text style={styles.treeNodeCount}>{values.length}/15 nodes</Text>
      </View>
    </GlassCard>
  );
}

// Main Component
export default function UniversalInputSheet({
  visible,
  onClose,
  onApply,
  algorithmType,
  currentArray = [],
  currentTarget = 50,
  maxSize = 15,
  minSize = 5,
}: UniversalInputSheetProps) {
  const [inputMode, setInputMode] = useState<InputMode>('random');
  const [manualInput, setManualInput] = useState(currentArray.join(', '));
  const [validationState, setValidationState] = useState<ValidationState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [previewData, setPreviewData] = useState<number[]>(currentArray);
  const [target, setTarget] = useState(currentTarget);
  const [treeValues, setTreeValues] = useState<number[]>([]);

  const maxValue = useMemo(() => Math.max(...previewData, 100), [previewData]);

  // Reset state when opening
  useEffect(() => {
    if (visible) {
      setManualInput(currentArray.join(', '));
      setPreviewData(currentArray);
      setTarget(currentTarget);
      setValidationState('idle');
      setErrorMessage('');
      setTreeValues([]);
    }
  }, [visible, currentArray, currentTarget]);

  // Validate manual input
  const validateAndParse = useCallback((text: string): { valid: boolean; data: number[]; error: string } => {
    if (!text.trim()) {
      return { valid: false, data: [], error: '' };
    }

    // Filter out non-numeric characters except commas, spaces, and digits
    const cleanedText = text.replace(/[^\d,\s]/g, '');

    if (cleanedText !== text) {
      return { valid: false, data: [], error: 'Only numbers and commas allowed' };
    }

    const parts = cleanedText.split(/[,\s]+/).filter(Boolean);
    const numbers: number[] = [];

    for (const part of parts) {
      const num = parseInt(part, 10);
      if (isNaN(num)) {
        return { valid: false, data: [], error: `Invalid number: "${part}"` };
      }
      if (num < 1 || num > 999) {
        return { valid: false, data: [], error: `Number out of range (1-999): ${num}` };
      }
      numbers.push(num);
    }

    if (numbers.length > maxSize) {
      return { valid: false, data: numbers, error: `Too many values (max ${maxSize})` };
    }

    if (numbers.length < minSize) {
      return { valid: true, data: numbers, error: '' };
    }

    return { valid: true, data: numbers, error: '' };
  }, [maxSize, minSize]);

  // Handle manual input change with validation
  const handleManualInputChange = useCallback((text: string) => {
    setManualInput(text);
    const { valid, data, error } = validateAndParse(text);

    if (error && !valid) {
      setValidationState('invalid');
      setErrorMessage(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else if (data.length > 0) {
      setValidationState('valid');
      setErrorMessage('');
      setPreviewData(data);
    } else {
      setValidationState('idle');
      setErrorMessage('');
      setPreviewData([]);
    }
  }, [validateAndParse]);

  // Handle random generation
  const handleRandomGenerate = useCallback((data: number[], generatedTarget?: number) => {
    setPreviewData(data);
    if (generatedTarget !== undefined) {
      setTarget(generatedTarget);
    }
    setManualInput(data.join(', '));
    setValidationState('valid');
  }, []);

  // Handle tree values change
  const handleTreeValuesChange = useCallback((values: number[]) => {
    setTreeValues(values);
    setPreviewData(values);
  }, []);

  // Handle apply
  const handleApply = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    let finalData: number[];
    if (inputMode === 'tree') {
      finalData = treeValues;
    } else {
      finalData = previewData;
    }

    if (finalData.length < minSize) {
      setValidationState('invalid');
      setErrorMessage(`Need at least ${minSize} values`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    onApply(finalData, algorithmType === 'searching' ? target : undefined);
    onClose();
  }, [inputMode, treeValues, previewData, target, algorithmType, minSize, onApply, onClose]);

  const modes: { key: InputMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'random', label: 'Random', icon: 'shuffle' },
    { key: 'manual', label: 'Manual', icon: 'keypad' },
    ...(algorithmType === 'tree' ? [{ key: 'tree' as const, label: 'Tree', icon: 'git-branch' as const }] : []),
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={StyleSheet.absoluteFill}
        >
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        </Animated.View>
      </Pressable>

      <Animated.View
        entering={SlideInDown.springify().damping(18).stiffness(100)}
        exiting={SlideOutDown.springify().damping(15)}
        style={styles.sheet}
      >
        {/* Gradient Border Top */}
        <LinearGradient
          colors={[Colors.actionTeal, Colors.actionTealDark, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBorder}
        />

        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Ionicons name="options" size={20} color={Colors.actionTeal} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Customize Data</Text>
              <Text style={styles.headerSubtitle}>
                {algorithmType === 'sorting' ? 'Sorting' : algorithmType === 'searching' ? 'Searching' : 'Tree'} Algorithm
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.gray400} />
          </TouchableOpacity>
        </View>

        {/* Mode Selector */}
        <View style={styles.modeSelector}>
          {modes.map((mode) => (
            <TouchableOpacity
              key={mode.key}
              style={[styles.modeButton, inputMode === mode.key && styles.modeButtonActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setInputMode(mode.key);
              }}
            >
              <Ionicons
                name={mode.icon}
                size={18}
                color={inputMode === mode.key ? Colors.midnightBlue : Colors.gray400}
              />
              <Text
                style={[
                  styles.modeText,
                  inputMode === mode.key && styles.modeTextActive,
                ]}
              >
                {mode.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Live Preview */}
          <LivePreview
            data={previewData}
            maxValue={maxValue}
            algorithmType={algorithmType}
            target={algorithmType === 'searching' ? target : undefined}
          />

          {/* Mode Content */}
          {inputMode === 'manual' && (
            <ManualInputSection
              value={manualInput}
              onChange={handleManualInputChange}
              validationState={validationState}
              errorMessage={errorMessage}
            />
          )}

          {inputMode === 'random' && (
            <RandomizationTool
              onGenerate={handleRandomGenerate}
              minSize={minSize}
              maxSize={maxSize}
              algorithmType={algorithmType}
            />
          )}

          {inputMode === 'tree' && (
            <TreeInputSection
              values={treeValues}
              onValuesChange={handleTreeValuesChange}
            />
          )}

          {/* Target Selector for Searching */}
          {algorithmType === 'searching' && previewData.length > 0 && (
            <TargetSelector
              target={target}
              onTargetChange={setTarget}
              minValue={1}
              maxValue={Math.max(...previewData, 99)}
              array={previewData}
            />
          )}
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.applySection}>
          <TouchableOpacity
            style={[
              styles.applyButton,
              previewData.length < minSize && styles.applyButtonDisabled,
            ]}
            onPress={handleApply}
            disabled={previewData.length < minSize}
          >
            <LinearGradient
              colors={
                previewData.length >= minSize
                  ? [Colors.actionTeal, Colors.actionTealDark]
                  : [Colors.gray600, Colors.gray700]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.applyButtonGradient}
            >
              <Ionicons
                name="play"
                size={20}
                color={previewData.length >= minSize ? Colors.midnightBlue : Colors.gray400}
              />
              <Text
                style={[
                  styles.applyButtonText,
                  previewData.length < minSize && styles.applyButtonTextDisabled,
                ]}
              >
                Apply & Visualize
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          {previewData.length < minSize && previewData.length > 0 && (
            <Text style={styles.minSizeWarning}>
              Need {minSize - previewData.length} more values
            </Text>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.midnightBlue,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    maxHeight: SCREEN_HEIGHT * 0.9,
    ...Shadows.large,
  },
  gradientBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: Spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.gray600,
    borderRadius: BorderRadius.full,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.actionTeal + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeSelector: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: 4,
    gap: 4,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  modeButtonActive: {
    backgroundColor: Colors.actionTeal,
  },
  modeText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.gray400,
  },
  modeTextActive: {
    color: Colors.midnightBlue,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  // Glass Card
  glassCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.gray700,
    ...Shadows.small,
  },
  glassCardHighlight: {
    borderColor: Colors.success + '50',
  },
  // Input Section
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  inputLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.white,
  },
  validBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success + '20',
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  validBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.success,
  },
  textInput: {
    backgroundColor: Colors.midnightBlueDark,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.white,
    borderWidth: 2,
    borderColor: Colors.gray600,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  textInputError: {
    borderColor: Colors.alertCoral,
    backgroundColor: Colors.alertCoral + '10',
  },
  inputHint: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    marginTop: Spacing.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.alertCoral + '15',
    borderRadius: BorderRadius.md,
  },
  errorText: {
    fontSize: FontSizes.sm,
    color: Colors.alertCoral,
    flex: 1,
  },
  // Preview
  previewContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray700,
  },
  previewEmpty: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.gray700,
    borderStyle: 'dashed',
  },
  previewEmptyText: {
    fontSize: FontSizes.sm,
    color: Colors.gray500,
    marginTop: Spacing.sm,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  previewTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  previewTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.actionTeal,
  },
  previewCount: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  previewScroll: {
    flexGrow: 0,
  },
  previewBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    minHeight: 70,
    paddingBottom: Spacing.sm,
  },
  previewBar: {
    borderRadius: BorderRadius.sm,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  previewBarLabel: {
    fontSize: 7,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 2,
  },
  targetIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.gray700,
  },
  targetDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  targetIndicatorText: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
  },
  // Target Selector
  inArrayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.gray700,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  inArrayBadgeActive: {
    backgroundColor: Colors.success + '20',
  },
  inArrayText: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
    color: Colors.gray500,
  },
  inArrayTextActive: {
    color: Colors.success,
  },
  targetInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  targetTextInput: {
    backgroundColor: Colors.midnightBlueDark,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.alertCoral,
    width: 80,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: Colors.alertCoral + '40',
  },
  sliderContainer: {
    flex: 1,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  sliderLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
  },
  quickSelectSection: {
    marginTop: Spacing.md,
  },
  quickSelectLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    marginBottom: Spacing.sm,
  },
  quickSelectRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickSelectChip: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray700,
  },
  quickSelectChipActive: {
    backgroundColor: Colors.alertCoral,
  },
  quickSelectText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.gray400,
  },
  quickSelectTextActive: {
    color: Colors.white,
  },
  // Random Generator
  sizeSelectorSection: {
    marginBottom: Spacing.md,
  },
  sizeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  sizeLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.gray400,
  },
  sizeValueBadge: {
    backgroundColor: Colors.actionTeal + '20',
    paddingVertical: 4,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  sizeValue: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.actionTeal,
  },
  sizeSlider: {
    width: '100%',
    height: 40,
  },
  patternSection: {
    marginBottom: Spacing.md,
  },
  patternGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  patternButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.midnightBlueDark,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: Spacing.sm,
  },
  patternButtonActive: {
    backgroundColor: Colors.midnightBlueDark,
    borderWidth: 2,
  },
  patternText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.gray400,
  },
  generateButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  generateButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.midnightBlue,
  },
  // Tree Input
  treeHint: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  treeNodesContainer: {
    backgroundColor: Colors.midnightBlueDark,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    minHeight: 70,
    marginBottom: Spacing.md,
  },
  treeNodesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  treeNode: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.info + '30',
    borderWidth: 2,
    borderColor: Colors.info,
    justifyContent: 'center',
    alignItems: 'center',
  },
  treeNodeValue: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.white,
  },
  treeNodeIndex: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.gray700,
    justifyContent: 'center',
    alignItems: 'center',
  },
  treeNodeIndexText: {
    fontSize: 8,
    fontWeight: '700',
    color: Colors.gray300,
  },
  treeNodeRemove: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.alertCoral,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noNodesText: {
    fontSize: FontSizes.sm,
    color: Colors.gray500,
    fontStyle: 'italic',
  },
  treeInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  treeInput: {
    flex: 1,
    backgroundColor: Colors.midnightBlueDark,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSizes.md,
    color: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray600,
  },
  treeAddButton: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.actionTeal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  treeAddButtonDisabled: {
    backgroundColor: Colors.gray700,
  },
  treeFooter: {
    alignItems: 'flex-end',
    marginTop: Spacing.sm,
  },
  treeNodeCount: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
  },
  clearButton: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
  },
  clearButtonText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.alertCoral,
  },
  // Apply Section
  applySection: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.gray800,
  },
  applyButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  applyButtonDisabled: {
    opacity: 0.8,
  },
  applyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  applyButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.midnightBlue,
  },
  applyButtonTextDisabled: {
    color: Colors.gray400,
  },
  minSizeWarning: {
    fontSize: FontSizes.xs,
    color: Colors.logicGold,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
