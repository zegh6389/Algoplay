// Universal Input Dashboard - Sleek translucent overlay for data input
import React, { useState, useCallback } from 'react';
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
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type DataSourceType = 'manual' | 'random' | 'tree-constructor';
type RandomPreset = 'random' | 'nearly-sorted' | 'reversed' | 'few-unique';

interface InputDashboardProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: number[], type?: 'array' | 'tree') => void;
  title?: string;
  maxSize?: number;
  allowTreeConstructor?: boolean;
}

interface NumericKeypadProps {
  value: string;
  onChange: (value: string) => void;
  onSubmitValue: () => void;
}

function NumericKeypad({ value, onChange, onSubmitValue }: NumericKeypadProps) {
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['C', '0', '⌫'],
  ];

  const handleKeyPress = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (key === 'C') {
      onChange('');
    } else if (key === '⌫') {
      onChange(value.slice(0, -1));
    } else {
      const newValue = value + key;
      if (parseInt(newValue) <= 999) {
        onChange(newValue);
      }
    }
  };

  return (
    <View style={styles.keypadContainer}>
      <View style={styles.keypadDisplay}>
        <Text style={styles.keypadValue}>{value || '0'}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onSubmitValue}
          disabled={!value || value === '0'}
        >
          <Ionicons name="add" size={24} color={Colors.midnightBlue} />
        </TouchableOpacity>
      </View>
      <View style={styles.keypadGrid}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((key) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.keypadKey,
                  key === 'C' && styles.keypadKeyClear,
                  key === '⌫' && styles.keypadKeyBackspace,
                ]}
                onPress={() => handleKeyPress(key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.keypadKeyText,
                    (key === 'C' || key === '⌫') && styles.keypadKeyTextSpecial,
                  ]}
                >
                  {key}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

interface RandomGeneratorProps {
  onGenerate: (data: number[]) => void;
  maxSize: number;
}

function RandomGenerator({ onGenerate, maxSize }: RandomGeneratorProps) {
  const [size, setSize] = useState(10);
  const [preset, setPreset] = useState<RandomPreset>('random');

  const presets: { key: RandomPreset; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'random', label: 'Random', icon: 'shuffle' },
    { key: 'nearly-sorted', label: 'Nearly Sorted', icon: 'trending-up' },
    { key: 'reversed', label: 'Reversed', icon: 'arrow-down' },
    { key: 'few-unique', label: 'Few Unique', icon: 'copy' },
  ];

  const generateData = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    let data: number[] = [];

    switch (preset) {
      case 'random':
        data = Array.from({ length: size }, () => Math.floor(Math.random() * 99) + 1);
        break;
      case 'nearly-sorted':
        data = Array.from({ length: size }, (_, i) => i * 5 + Math.floor(Math.random() * 10));
        // Swap a few elements
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

    onGenerate(data);
  }, [size, preset, onGenerate]);

  return (
    <View style={styles.randomContainer}>
      {/* Size Selector */}
      <View style={styles.sizeSelector}>
        <Text style={styles.sizeSelectorLabel}>Array Size</Text>
        <View style={styles.sizeButtons}>
          {[5, 8, 10, 12, 15].filter(s => s <= maxSize).map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.sizeButton, size === s && styles.sizeButtonActive]}
              onPress={() => setSize(s)}
            >
              <Text
                style={[
                  styles.sizeButtonText,
                  size === s && styles.sizeButtonTextActive,
                ]}
              >
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Preset Selector */}
      <View style={styles.presetSelector}>
        <Text style={styles.sizeSelectorLabel}>Data Pattern</Text>
        <View style={styles.presetGrid}>
          {presets.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[styles.presetButton, preset === p.key && styles.presetButtonActive]}
              onPress={() => setPreset(p.key)}
            >
              <Ionicons
                name={p.icon}
                size={20}
                color={preset === p.key ? Colors.midnightBlue : Colors.gray400}
              />
              <Text
                style={[
                  styles.presetButtonText,
                  preset === p.key && styles.presetButtonTextActive,
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Generate Button */}
      <TouchableOpacity style={styles.generateButton} onPress={generateData}>
        <Ionicons name="flash" size={20} color={Colors.midnightBlue} />
        <Text style={styles.generateButtonText}>Generate Data</Text>
      </TouchableOpacity>
    </View>
  );
}

interface TreeConstructorProps {
  onSubmit: (data: number[]) => void;
}

function TreeConstructor({ onSubmit }: TreeConstructorProps) {
  const [nodes, setNodes] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState('');

  const addNode = () => {
    if (inputValue && nodes.length < 15) {
      const value = parseInt(inputValue);
      if (!isNaN(value) && value > 0 && value <= 999) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setNodes([...nodes, value]);
        setInputValue('');
      }
    }
  };

  const removeNode = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNodes(nodes.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (nodes.length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSubmit(nodes);
    }
  };

  return (
    <View style={styles.treeConstructorContainer}>
      <Text style={styles.constructorHint}>
        Add values in the order you want them inserted into the tree.
        For BST, values will be inserted maintaining BST property.
      </Text>

      {/* Current nodes preview */}
      <View style={styles.nodesPreview}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.nodesRow}>
            {nodes.map((value, index) => (
              <TouchableOpacity
                key={index}
                style={styles.nodePreviewItem}
                onPress={() => removeNode(index)}
              >
                <Text style={styles.nodePreviewValue}>{value}</Text>
                <View style={styles.nodePreviewRemove}>
                  <Ionicons name="close" size={10} color={Colors.white} />
                </View>
              </TouchableOpacity>
            ))}
            {nodes.length === 0 && (
              <Text style={styles.noNodesText}>No nodes added yet</Text>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Input */}
      <View style={styles.nodeInputRow}>
        <TextInput
          style={styles.nodeInput}
          placeholder="Enter value (1-999)"
          placeholderTextColor={Colors.gray500}
          value={inputValue}
          onChangeText={setInputValue}
          keyboardType="number-pad"
          maxLength={3}
        />
        <TouchableOpacity
          style={[styles.nodeAddButton, (!inputValue || nodes.length >= 15) && styles.nodeAddButtonDisabled]}
          onPress={addNode}
          disabled={!inputValue || nodes.length >= 15}
        >
          <Ionicons name="add" size={24} color={Colors.midnightBlue} />
        </TouchableOpacity>
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitTreeButton, nodes.length === 0 && styles.submitTreeButtonDisabled]}
        onPress={handleSubmit}
        disabled={nodes.length === 0}
      >
        <Ionicons name="git-branch" size={20} color={Colors.midnightBlue} />
        <Text style={styles.submitTreeButtonText}>Build Tree ({nodes.length} nodes)</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function InputDashboard({
  visible,
  onClose,
  onSubmit,
  title = 'Input Data',
  maxSize = 15,
  allowTreeConstructor = true,
}: InputDashboardProps) {
  const [dataSource, setDataSource] = useState<DataSourceType>('random');
  const [manualValues, setManualValues] = useState<number[]>([]);
  const [currentInput, setCurrentInput] = useState('');

  const handleManualAdd = () => {
    if (currentInput && manualValues.length < maxSize) {
      const value = parseInt(currentInput);
      if (!isNaN(value) && value > 0) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setManualValues([...manualValues, value]);
        setCurrentInput('');
      }
    }
  };

  const handleManualRemove = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setManualValues(manualValues.filter((_, i) => i !== index));
  };

  const handleManualSubmit = () => {
    if (manualValues.length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSubmit(manualValues);
      setManualValues([]);
      onClose();
    }
  };

  const handleRandomGenerate = (data: number[]) => {
    onSubmit(data);
    onClose();
  };

  const handleTreeSubmit = (data: number[]) => {
    onSubmit(data, 'tree');
    onClose();
  };

  const dataSources: { key: DataSourceType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'manual', label: 'Manual', icon: 'keypad' },
    { key: 'random', label: 'Random', icon: 'shuffle' },
    ...(allowTreeConstructor
      ? [{ key: 'tree-constructor' as const, label: 'Tree', icon: 'git-branch' as const }]
      : []),
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      </Pressable>

      <Animated.View
        entering={SlideInDown.springify().damping(15)}
        exiting={SlideOutDown.springify()}
        style={styles.dashboard}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Data Source Tabs */}
        <View style={styles.tabsContainer}>
          {dataSources.map((source) => (
            <TouchableOpacity
              key={source.key}
              style={[styles.tab, dataSource === source.key && styles.tabActive]}
              onPress={() => setDataSource(source.key)}
            >
              <Ionicons
                name={source.icon}
                size={18}
                color={dataSource === source.key ? Colors.midnightBlue : Colors.gray400}
              />
              <Text
                style={[
                  styles.tabText,
                  dataSource === source.key && styles.tabTextActive,
                ]}
              >
                {source.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {dataSource === 'manual' && (
            <View>
              {/* Manual Values Preview */}
              <View style={styles.manualPreview}>
                <Text style={styles.previewLabel}>
                  Values ({manualValues.length}/{maxSize})
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.manualValuesRow}>
                    {manualValues.map((value, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.manualValueChip}
                        onPress={() => handleManualRemove(index)}
                      >
                        <Text style={styles.manualValueText}>{value}</Text>
                        <Ionicons name="close-circle" size={14} color={Colors.gray400} />
                      </TouchableOpacity>
                    ))}
                    {manualValues.length === 0 && (
                      <Text style={styles.noValuesText}>Tap keypad to add values</Text>
                    )}
                  </View>
                </ScrollView>
              </View>

              {/* Numeric Keypad */}
              <NumericKeypad
                value={currentInput}
                onChange={setCurrentInput}
                onSubmitValue={handleManualAdd}
              />

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.manualSubmitButton,
                  manualValues.length === 0 && styles.manualSubmitButtonDisabled,
                ]}
                onPress={handleManualSubmit}
                disabled={manualValues.length === 0}
              >
                <Text style={styles.manualSubmitText}>
                  Use Array ({manualValues.length} elements)
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {dataSource === 'random' && (
            <RandomGenerator onGenerate={handleRandomGenerate} maxSize={maxSize} />
          )}

          {dataSource === 'tree-constructor' && (
            <TreeConstructor onSubmit={handleTreeSubmit} />
          )}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dashboard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.midnightBlue,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    maxHeight: SCREEN_HEIGHT * 0.85,
    ...Shadows.large,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray800,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.white,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.cardBackground,
    gap: Spacing.xs,
  },
  tabActive: {
    backgroundColor: Colors.actionTeal,
  },
  tabText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.gray400,
  },
  tabTextActive: {
    color: Colors.midnightBlue,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  // Manual Input Styles
  manualPreview: {
    marginBottom: Spacing.lg,
  },
  previewLabel: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
    marginBottom: Spacing.sm,
  },
  manualValuesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  manualValueChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  manualValueText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.white,
  },
  noValuesText: {
    fontSize: FontSizes.sm,
    color: Colors.gray500,
    fontStyle: 'italic',
  },
  manualSubmitButton: {
    backgroundColor: Colors.actionTeal,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  manualSubmitButtonDisabled: {
    backgroundColor: Colors.gray700,
  },
  manualSubmitText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.midnightBlue,
  },
  // Keypad Styles
  keypadContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
  },
  keypadDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  keypadValue: {
    flex: 1,
    fontSize: FontSizes.xxxl,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: 'monospace',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.actionTeal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadGrid: {
    gap: Spacing.sm,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  keypadKey: {
    flex: 1,
    height: 56,
    backgroundColor: Colors.gray700,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadKeyClear: {
    backgroundColor: Colors.alertCoral + '20',
  },
  keypadKeyBackspace: {
    backgroundColor: Colors.logicGold + '20',
  },
  keypadKeyText: {
    fontSize: FontSizes.xxl,
    fontWeight: '600',
    color: Colors.white,
  },
  keypadKeyTextSpecial: {
    fontSize: FontSizes.lg,
  },
  // Random Generator Styles
  randomContainer: {
    gap: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  sizeSelector: {
    marginBottom: Spacing.md,
  },
  sizeSelectorLabel: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
    marginBottom: Spacing.sm,
  },
  sizeButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  sizeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
  },
  sizeButtonActive: {
    backgroundColor: Colors.actionTeal,
  },
  sizeButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.gray400,
  },
  sizeButtonTextActive: {
    color: Colors.midnightBlue,
  },
  presetSelector: {},
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  presetButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.cardBackground,
    gap: Spacing.sm,
  },
  presetButtonActive: {
    backgroundColor: Colors.actionTeal,
  },
  presetButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.gray400,
  },
  presetButtonTextActive: {
    color: Colors.midnightBlue,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.actionTeal,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  generateButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.midnightBlue,
  },
  // Tree Constructor Styles
  treeConstructorContainer: {
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  constructorHint: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  nodesPreview: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    minHeight: 60,
  },
  nodesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  nodePreviewItem: {
    backgroundColor: Colors.actionTeal + '30',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.actionTeal,
    position: 'relative',
  },
  nodePreviewValue: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.white,
  },
  nodePreviewRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.alertCoral,
    borderRadius: BorderRadius.full,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noNodesText: {
    fontSize: FontSizes.sm,
    color: Colors.gray500,
    fontStyle: 'italic',
  },
  nodeInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  nodeInput: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSizes.md,
    color: Colors.white,
  },
  nodeAddButton: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.actionTeal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeAddButtonDisabled: {
    backgroundColor: Colors.gray700,
  },
  submitTreeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.actionTeal,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  submitTreeButtonDisabled: {
    backgroundColor: Colors.gray700,
  },
  submitTreeButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.midnightBlue,
  },
});
