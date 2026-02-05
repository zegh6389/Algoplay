import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Clipboard,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import {
  ProgrammingLanguage,
  AlgorithmCode,
  languageNames,
  languageIcons,
} from '@/utils/algorithms/codeImplementations';

// One Dark Pro Theme Colors for Syntax Highlighting
const OneDarkProTheme = {
  background: '#282c34', // Main background
  surface: '#3d4451', // Slightly lighter for UI elements
  currentLine: '#2c313a', // Current line highlight
  selection: '#3d4451', // Selection
  foreground: '#abb2bf', // Main text color

  // Syntax colors (as specified in requirements)
  keyword: '#ff79c6', // Pink - keywords
  string: '#a6e3a1', // Green - strings
  number: '#f9e2af', // Yellow - numbers
  comment: '#6272a4', // Gray-blue - comments
  function: '#50fa7b', // Bright green - functions
  operator: '#ff9671', // Orange - operators
  variable: '#bd93f9', // Purple - variables
  type: '#8be9fd', // Cyan - types

  // UI colors
  lineNumber: '#5c6370', // Muted gray for line numbers
  border: '#3d4451', // Border color
};

interface CodeViewerProps {
  algorithmCode: AlgorithmCode;
  onAskAI: (code: string, language: ProgrammingLanguage) => void;
  isAILoading?: boolean;
}

interface LanguageTabProps {
  language: ProgrammingLanguage;
  isSelected: boolean;
  onSelect: () => void;
}

function LanguageTab({ language, isSelected, onSelect }: LanguageTabProps) {
  const scale = useSharedValue(1);
  const backgroundProgress = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    backgroundProgress.value = withSpring(isSelected ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      backgroundProgress.value,
      [0, 1],
      ['transparent', Colors.accent]
    ),
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 50 }),
      withSpring(1, { damping: 10 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View style={[styles.languageTab, animatedStyle]}>
        <Text style={styles.languageIcon}>{languageIcons[language]}</Text>
        <Text
          style={[
            styles.languageText,
            isSelected && styles.languageTextSelected,
          ]}
        >
          {languageNames[language]}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

interface CopyButtonProps {
  onCopy: () => void;
  copied: boolean;
}

function CopyButton({ onCopy, copied }: CopyButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.85, { duration: 50 }),
      withSpring(1, { damping: 8 })
    );
    onCopy();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.copyButton,
          copied && styles.copyButtonSuccess,
          animatedStyle,
        ]}
      >
        <Ionicons
          name={copied ? 'checkmark' : 'copy-outline'}
          size={16}
          color={copied ? Colors.success : Colors.textPrimary}
        />
        <Text style={[styles.copyText, copied && styles.copyTextSuccess]}>
          {copied ? 'Copied!' : 'Copy'}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

interface CodeLineProps {
  lineNumber: number;
  content: string;
  isHighlighted?: boolean;
}

function CodeLine({ lineNumber, content, isHighlighted }: CodeLineProps) {
  // Enhanced syntax highlighting based on patterns
  const highlightCode = (code: string) => {
    const parts: { text: string; color: string }[] = [];

    // Keywords for different languages
    const keywords = [
      'def', 'return', 'if', 'else', 'elif', 'for', 'while', 'in', 'range',
      'and', 'or', 'not', 'True', 'False', 'None', 'class', 'import', 'from',
      'public', 'private', 'static', 'void', 'int', 'boolean', 'new', 'this',
      'extends', 'implements', 'interface', 'abstract', 'final', 'package',
      'using', 'namespace', 'include', 'auto', 'const', 'template', 'typename',
      'break', 'continue', 'try', 'catch', 'throw', 'throws', 'sizeof', 'let',
      'var', 'function', 'async', 'await', 'export', 'default', 'switch', 'case',
    ];

    // Types
    const types = [
      'int', 'float', 'double', 'char', 'string', 'bool', 'boolean', 'void',
      'long', 'short', 'byte', 'String', 'Integer', 'Double', 'Boolean',
      'List', 'Array', 'Map', 'Set', 'Dict', 'Tuple', 'Vector',
    ];

    // Built-in functions
    const functions = [
      'print', 'len', 'range', 'str', 'int', 'float', 'list', 'dict', 'set',
      'min', 'max', 'sum', 'abs', 'sorted', 'enumerate', 'zip', 'map', 'filter',
      'System', 'Math', 'Arrays', 'Collections', 'printf', 'scanf', 'cout', 'cin',
    ];

    // Check if line is a comment
    const trimmed = code.trim();
    if (trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return [{ text: code, color: OneDarkProTheme.comment }];
    }

    // Parse the code character by character for better highlighting
    let result: { text: string; color: string }[] = [];
    let i = 0;
    let currentToken = '';
    let currentColor = OneDarkProTheme.foreground;

    const flushToken = () => {
      if (currentToken) {
        result.push({ text: currentToken, color: currentColor });
        currentToken = '';
        currentColor = OneDarkProTheme.foreground;
      }
    };

    while (i < code.length) {
      const char = code[i];
      const restOfLine = code.slice(i);

      // Check for strings
      if (char === '"' || char === "'") {
        flushToken();
        const stringChar = char;
        currentToken = char;
        i++;
        while (i < code.length && code[i] !== stringChar) {
          if (code[i] === '\\' && i + 1 < code.length) {
            currentToken += code[i] + code[i + 1];
            i += 2;
          } else {
            currentToken += code[i];
            i++;
          }
        }
        if (i < code.length) {
          currentToken += code[i];
          i++;
        }
        result.push({ text: currentToken, color: OneDarkProTheme.string });
        currentToken = '';
        continue;
      }

      // Check for numbers
      if (/\d/.test(char) && (currentToken === '' || /\s/.test(currentToken[currentToken.length - 1]))) {
        flushToken();
        currentToken = char;
        i++;
        while (i < code.length && /[\d.]/.test(code[i])) {
          currentToken += code[i];
          i++;
        }
        result.push({ text: currentToken, color: OneDarkProTheme.number });
        currentToken = '';
        continue;
      }

      // Check for operators
      if (/[+\-*/%=<>!&|^~?:]/.test(char)) {
        flushToken();
        currentToken = char;
        // Check for multi-character operators
        if (i + 1 < code.length && /[=<>&|]/.test(code[i + 1])) {
          currentToken += code[i + 1];
          i++;
        }
        result.push({ text: currentToken, color: OneDarkProTheme.operator });
        currentToken = '';
        i++;
        continue;
      }

      // Check for word boundaries
      if (/[a-zA-Z_]/.test(char)) {
        flushToken();
        currentToken = char;
        i++;
        while (i < code.length && /[a-zA-Z0-9_]/.test(code[i])) {
          currentToken += code[i];
          i++;
        }

        // Determine color based on word type
        if (keywords.includes(currentToken)) {
          result.push({ text: currentToken, color: OneDarkProTheme.keyword });
        } else if (types.includes(currentToken)) {
          result.push({ text: currentToken, color: OneDarkProTheme.type });
        } else if (functions.includes(currentToken)) {
          result.push({ text: currentToken, color: OneDarkProTheme.function });
        } else if (code[i] === '(') {
          // Function call
          result.push({ text: currentToken, color: OneDarkProTheme.function });
        } else {
          result.push({ text: currentToken, color: OneDarkProTheme.foreground });
        }
        currentToken = '';
        continue;
      }

      // Default: add to current token
      currentToken += char;
      i++;
    }

    flushToken();
    return result.length > 0 ? result : [{ text: code, color: OneDarkProTheme.foreground }];
  };

  const codeParts = highlightCode(content);

  return (
    <View style={[styles.codeLine, isHighlighted && styles.codeLineHighlighted]}>
      <Text style={styles.lineNumber}>
        {String(lineNumber).padStart(3, ' ')}
      </Text>
      <Text style={styles.codeContent}>
        {codeParts.map((part, index) => (
          <Text key={index} style={{ color: part.color }}>
            {part.text}
          </Text>
        ))}
      </Text>
    </View>
  );
}

export default function CodeViewer({ algorithmCode, onAskAI, isAILoading }: CodeViewerProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage>('python');
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const languages: ProgrammingLanguage[] = ['python', 'java', 'cpp'];
  const currentCode = algorithmCode.implementations[selectedLanguage];
  const codeLines = currentCode.split('\n');

  const handleCopy = useCallback(async () => {
    try {
      // Use Clipboard API (deprecated but still works)
      Clipboard.setString(currentCode);
      setCopied(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [currentCode]);

  const handleLanguageSelect = (language: ProgrammingLanguage) => {
    setSelectedLanguage(language);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleAskAI = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAskAI(currentCode, selectedLanguage);
  };

  return (
    <Animated.View entering={FadeInDown.delay(100)} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="code-slash" size={20} color={Colors.accent} />
          <Text style={styles.headerTitle}>Code Hub</Text>
        </View>
        <View style={styles.headerActions}>
          <CopyButton onCopy={handleCopy} copied={copied} />
          <TouchableOpacity
            style={[styles.aiButton, isAILoading && styles.aiButtonLoading]}
            onPress={handleAskAI}
            disabled={isAILoading}
            activeOpacity={0.8}
          >
            {isAILoading ? (
              <ActivityIndicator size="small" color={Colors.accent} />
            ) : (
              <>
                <Ionicons name="sparkles" size={16} color={Colors.accent} />
                <Text style={styles.aiButtonText}>Explain</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Language Tabs */}
      <View style={styles.languageTabs}>
        {languages.map((lang) => (
          <LanguageTab
            key={lang}
            language={lang}
            isSelected={selectedLanguage === lang}
            onSelect={() => handleLanguageSelect(lang)}
          />
        ))}
      </View>

      {/* Algorithm Info Bar */}
      <View style={styles.infoBar}>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={14} color={Colors.warning} />
          <Text style={styles.infoText}>
            Time: {algorithmCode.timeComplexity.average}
          </Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoItem}>
          <Ionicons name="cube-outline" size={14} color={Colors.accent} />
          <Text style={styles.infoText}>
            Space: {algorithmCode.spaceComplexity}
          </Text>
        </View>
      </View>

      {/* Code Display */}
      <View style={styles.codeContainer}>
        {/* Window Controls (decorative) */}
        <View style={styles.windowControls}>
          <View style={[styles.windowDot, { backgroundColor: Colors.error }]} />
          <View style={[styles.windowDot, { backgroundColor: Colors.warning }]} />
          <View style={[styles.windowDot, { backgroundColor: Colors.success }]} />
          <Text style={styles.windowTitle}>
            {algorithmCode.name.toLowerCase().replace(/\s+/g, '_')}.{selectedLanguage === 'python' ? 'py' : selectedLanguage === 'java' ? 'java' : 'cpp'}
          </Text>
        </View>

        {/* Code Content */}
        <ScrollView
          ref={scrollRef}
          style={styles.codeScroll}
          horizontal={false}
          showsVerticalScrollIndicator={true}
          showsHorizontalScrollIndicator={false}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.codeScrollContent}
          >
            <View style={styles.codeBlock}>
              {codeLines.map((line, index) => (
                <CodeLine
                  key={index}
                  lineNumber={index + 1}
                  content={line}
                />
              ))}
            </View>
          </ScrollView>
        </ScrollView>
      </View>

      {/* Description */}
      <View style={styles.description}>
        <Text style={styles.descriptionText}>{algorithmCode.description}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.backgroundDark,
    borderBottomWidth: 1,
    borderBottomColor: OneDarkProTheme.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray700,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  copyButtonSuccess: {
    backgroundColor: Colors.success + '20',
    borderWidth: 1,
    borderColor: Colors.success + '40',
  },
  copyText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  copyTextSuccess: {
    color: Colors.success,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.accent + '40',
    gap: Spacing.xs,
  },
  aiButtonLoading: {
    opacity: 0.7,
  },
  aiButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.accent,
  },
  languageTabs: {
    flexDirection: 'row',
    backgroundColor: OneDarkProTheme.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  languageTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  languageIcon: {
    fontSize: 14,
  },
  languageText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  languageTextSelected: {
    color: Colors.background,
    fontWeight: '600',
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: OneDarkProTheme.currentLine,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  infoText: {
    fontSize: FontSizes.xs,
    color: Colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  infoDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.gray600,
    marginHorizontal: Spacing.md,
  },
  codeContainer: {
    backgroundColor: OneDarkProTheme.background,
  },
  windowControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: OneDarkProTheme.border,
    gap: Spacing.xs,
  },
  windowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  windowTitle: {
    fontSize: FontSizes.xs,
    color: OneDarkProTheme.comment,
    marginLeft: Spacing.md,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  codeScroll: {
    maxHeight: 350,
  },
  codeScrollContent: {
    paddingVertical: Spacing.md,
  },
  codeBlock: {
    paddingHorizontal: Spacing.sm,
  },
  codeLine: {
    flexDirection: 'row',
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    minWidth: '100%',
  },
  codeLineHighlighted: {
    backgroundColor: OneDarkProTheme.selection,
  },
  lineNumber: {
    width: 40,
    fontSize: FontSizes.sm,
    color: OneDarkProTheme.lineNumber,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlign: 'right',
    marginRight: Spacing.md,
    userSelect: 'none',
  },
  codeContent: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: OneDarkProTheme.foreground,
  },
  description: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: OneDarkProTheme.border,
  },
  descriptionText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
