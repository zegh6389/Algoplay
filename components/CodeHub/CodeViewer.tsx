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

// Dracula Theme Colors
const DraculaTheme = {
  background: '#282A36',
  currentLine: '#44475A',
  selection: '#44475A',
  foreground: '#F8F8F2',
  comment: '#6272A4',
  cyan: '#8BE9FD',
  green: '#50FA7B',
  orange: '#FFB86C',
  pink: '#FF79C6',
  purple: '#BD93F9',
  red: '#FF5555',
  yellow: '#F1FA8C',
  lineNumber: '#6272A4',
  border: '#44475A',
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
      ['transparent', Colors.actionTeal]
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
          color={copied ? Colors.success : Colors.white}
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
  // Simple syntax highlighting based on patterns
  const highlightCode = (code: string) => {
    const parts: { text: string; color: string }[] = [];
    let remaining = code;

    // Keywords
    const keywords = [
      'def', 'return', 'if', 'else', 'elif', 'for', 'while', 'in', 'range',
      'and', 'or', 'not', 'True', 'False', 'None', 'class', 'import', 'from',
      'public', 'private', 'static', 'void', 'int', 'boolean', 'new', 'this',
      'extends', 'implements', 'interface', 'abstract', 'final', 'package',
      'using', 'namespace', 'include', 'auto', 'const', 'template', 'typename',
      'break', 'continue', 'try', 'catch', 'throw', 'throws', 'sizeof',
    ];

    // Check if line is a comment
    const trimmed = remaining.trim();
    if (trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return [{ text: remaining, color: DraculaTheme.comment }];
    }

    // Check for string literals
    if (trimmed.includes('"') || trimmed.includes("'")) {
      let result = [];
      let i = 0;
      let inString = false;
      let stringChar = '';
      let currentText = '';

      while (i < remaining.length) {
        const char = remaining[i];

        if (!inString && (char === '"' || char === "'")) {
          if (currentText) {
            result.push({ text: currentText, color: DraculaTheme.foreground });
          }
          currentText = char;
          inString = true;
          stringChar = char;
        } else if (inString && char === stringChar && remaining[i-1] !== '\\') {
          currentText += char;
          result.push({ text: currentText, color: DraculaTheme.yellow });
          currentText = '';
          inString = false;
        } else {
          currentText += char;
        }
        i++;
      }

      if (currentText) {
        result.push({ text: currentText, color: inString ? DraculaTheme.yellow : DraculaTheme.foreground });
      }

      // Highlight keywords in non-string parts
      return result.map(part => {
        if (part.color === DraculaTheme.foreground) {
          for (const keyword of keywords) {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            if (regex.test(part.text)) {
              return { ...part, text: part.text, color: DraculaTheme.pink };
            }
          }
        }
        return part;
      });
    }

    // Simple keyword highlighting
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`);
      if (regex.test(remaining)) {
        parts.push({ text: remaining, color: DraculaTheme.foreground });
        return parts.map(p => {
          let text = p.text;
          for (const kw of keywords) {
            const kwRegex = new RegExp(`\\b${kw}\\b`, 'g');
            if (kwRegex.test(text)) {
              // Return with keyword color
              return { ...p };
            }
          }
          return p;
        });
      }
    }

    // Numbers
    if (/\d/.test(remaining)) {
      return [{ text: remaining, color: DraculaTheme.purple }];
    }

    return [{ text: remaining, color: DraculaTheme.foreground }];
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
          <Ionicons name="code-slash" size={20} color={Colors.actionTeal} />
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
              <ActivityIndicator size="small" color={Colors.actionTeal} />
            ) : (
              <>
                <Ionicons name="sparkles" size={16} color={Colors.actionTeal} />
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
          <Ionicons name="time-outline" size={14} color={Colors.logicGold} />
          <Text style={styles.infoText}>
            Time: {algorithmCode.timeComplexity.average}
          </Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoItem}>
          <Ionicons name="cube-outline" size={14} color={Colors.actionTeal} />
          <Text style={styles.infoText}>
            Space: {algorithmCode.spaceComplexity}
          </Text>
        </View>
      </View>

      {/* Code Display */}
      <View style={styles.codeContainer}>
        {/* Window Controls (decorative) */}
        <View style={styles.windowControls}>
          <View style={[styles.windowDot, { backgroundColor: '#FF5F56' }]} />
          <View style={[styles.windowDot, { backgroundColor: '#FFBD2E' }]} />
          <View style={[styles.windowDot, { backgroundColor: '#27C93F' }]} />
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
    backgroundColor: Colors.cardBackground,
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
    backgroundColor: Colors.midnightBlueDark,
    borderBottomWidth: 1,
    borderBottomColor: DraculaTheme.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.white,
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
    color: Colors.white,
  },
  copyTextSuccess: {
    color: Colors.success,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.actionTeal + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.actionTeal + '40',
    gap: Spacing.xs,
  },
  aiButtonLoading: {
    opacity: 0.7,
  },
  aiButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.actionTeal,
  },
  languageTabs: {
    flexDirection: 'row',
    backgroundColor: DraculaTheme.background,
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
    color: Colors.gray400,
  },
  languageTextSelected: {
    color: Colors.midnightBlue,
    fontWeight: '600',
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DraculaTheme.currentLine,
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
    color: Colors.gray300,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  infoDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.gray600,
    marginHorizontal: Spacing.md,
  },
  codeContainer: {
    backgroundColor: DraculaTheme.background,
  },
  windowControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: DraculaTheme.border,
    gap: Spacing.xs,
  },
  windowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  windowTitle: {
    fontSize: FontSizes.xs,
    color: DraculaTheme.comment,
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
    backgroundColor: DraculaTheme.selection,
  },
  lineNumber: {
    width: 40,
    fontSize: FontSizes.sm,
    color: DraculaTheme.lineNumber,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlign: 'right',
    marginRight: Spacing.md,
    userSelect: 'none',
  },
  codeContent: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: DraculaTheme.foreground,
  },
  description: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: DraculaTheme.border,
  },
  descriptionText: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
    lineHeight: 20,
  },
});
