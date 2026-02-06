// AI-Powered Cyber Terminal with ELI5 Algorithm Explanations
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  Easing,
  FadeIn,
  FadeInDown,
  Layout,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTextGeneration } from '@/hooks/useTextGeneration';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';

const MIDNIGHT_BLACK = '#0a0e17';

interface TerminalLog {
  id: string;
  type: 'step' | 'info' | 'success' | 'error' | 'ai';
  message: string;
  timestamp: number;
  aiExplanation?: string;
}

interface AICyberTerminalProps {
  currentExplanation: string;
  algorithmName: string;
  currentStep: number;
  totalSteps: number;
  comparisons: number;
  swaps: number;
  memoryAccesses: number;
  logs?: string[];
  maxLogs?: number;
  enableAIExplanations?: boolean;
  autoGenerateELI5?: boolean;
}

// Typing animation for AI responses
function TypingText({ text, speed = 20 }: { text: string; speed?: number }) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayText('');
    setIsTyping(true);
    let index = 0;

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <Text style={styles.aiExplanationText}>
      {displayText}
      {isTyping && <Text style={styles.typingCursor}>|</Text>}
    </Text>
  );
}

// Blinking cursor component
function BlinkingCursor() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.cursor, animatedStyle]}>
      <Text style={styles.cursorText}>█</Text>
    </Animated.View>
  );
}

// Log entry component
function LogEntry({
  log,
  index,
  showAI,
}: {
  log: TerminalLog;
  index: number;
  showAI: boolean;
}) {
  const getLogColor = () => {
    switch (log.type) {
      case 'success': return Colors.neonLime;
      case 'error': return Colors.neonPink;
      case 'ai': return Colors.neonPurple;
      case 'info': return Colors.neonCyan;
      default: return Colors.textPrimary;
    }
  };

  const getLogIcon = () => {
    switch (log.type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'alert-circle';
      case 'ai': return 'sparkles';
      case 'info': return 'information-circle';
      default: return 'chevron-forward';
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(200)}
      layout={Layout.springify().damping(15)}
      style={styles.logEntry}
    >
      <Ionicons name={getLogIcon()} size={14} color={getLogColor()} />
      <Text style={[styles.logText, { color: getLogColor() }]}>{log.message}</Text>
      {showAI && log.aiExplanation && (
        <View style={styles.aiExplanationBubble}>
          <TypingText text={log.aiExplanation} speed={15} />
        </View>
      )}
    </Animated.View>
  );
}

// Stats display component
function TerminalStats({
  comparisons,
  swaps,
  memoryAccesses,
  currentStep,
  totalSteps,
}: {
  comparisons: number;
  swaps: number;
  memoryAccesses: number;
  currentStep: number;
  totalSteps: number;
}) {
  const stats = [
    { label: 'COMP', value: comparisons, color: Colors.neonYellow },
    { label: 'SWAP', value: swaps, color: Colors.neonCyan },
    { label: 'MEM', value: memoryAccesses, color: Colors.neonPurple },
    { label: 'STEP', value: `${currentStep}/${totalSteps}`, color: Colors.neonLime },
  ];

  return (
    <View style={styles.statsRow}>
      {stats.map((stat, index) => (
        <View key={stat.label} style={styles.statItem}>
          <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

export default function AICyberTerminal({
  currentExplanation,
  algorithmName,
  currentStep,
  totalSteps,
  comparisons,
  swaps,
  memoryAccesses,
  logs = [],
  maxLogs = 8,
  enableAIExplanations = true,
  autoGenerateELI5 = false,
}: AICyberTerminalProps) {
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([]);
  const [showAIExplanations, setShowAIExplanations] = useState(false);
  const [currentAIExplanation, setCurrentAIExplanation] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const lastExplanationRef = useRef<string>('');

  // AI text generation hook
  const { generateText, data: aiResponse, isLoading: isAILoading, error: aiError, reset: resetAI } = useTextGeneration({
    onSuccess: (result) => {
      if (result) {
        setCurrentAIExplanation(result);
      }
    },
    onError: (err) => {
      console.warn('AI explanation error:', err.message);
    },
  });

  // Add logs to terminal
  useEffect(() => {
    if (logs.length > 0) {
      const newLogs: TerminalLog[] = logs.slice(-maxLogs).map((message, index) => ({
        id: `${Date.now()}-${index}`,
        type: message.toLowerCase().includes('found') || message.toLowerCase().includes('complete')
          ? 'success'
          : message.toLowerCase().includes('error')
            ? 'error'
            : 'step',
        message,
        timestamp: Date.now(),
      }));
      setTerminalLogs(newLogs);
    }
  }, [logs, maxLogs]);

  // Add current explanation as a log
  useEffect(() => {
    if (currentExplanation && currentExplanation !== lastExplanationRef.current) {
      lastExplanationRef.current = currentExplanation;

      const newLog: TerminalLog = {
        id: `explanation-${Date.now()}`,
        type: 'info',
        message: currentExplanation,
        timestamp: Date.now(),
      };

      setTerminalLogs((prev) => {
        const updated = [...prev, newLog].slice(-maxLogs);
        return updated;
      });

      // Auto-scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [currentExplanation, maxLogs]);

  // Generate ELI5 explanation
  const handleGenerateELI5 = useCallback(async () => {
    if (isAILoading || !currentExplanation) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowAIExplanations(true);
    resetAI();

    const prompt = `Explain this ${algorithmName} step like I'm 5 years old, in 1-2 short sentences. Be fun and use simple words. Step: "${currentExplanation}"`;

    try {
      await generateText(prompt);
    } catch (err) {
      console.warn('Failed to generate ELI5:', err);
    }
  }, [currentExplanation, algorithmName, isAILoading, generateText, resetAI]);

  // Auto-generate ELI5 when step changes
  useEffect(() => {
    if (autoGenerateELI5 && enableAIExplanations && currentExplanation) {
      handleGenerateELI5();
    }
  }, [currentStep]);

  return (
    <View style={styles.container}>
      {/* Terminal Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.terminalDots}>
            <View style={[styles.dot, { backgroundColor: Colors.neonPink }]} />
            <View style={[styles.dot, { backgroundColor: Colors.neonYellow }]} />
            <View style={[styles.dot, { backgroundColor: Colors.neonLime }]} />
          </View>
          <Text style={styles.headerTitle}>CYBER_TERMINAL</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.algorithmBadge}>{algorithmName}</Text>
        </View>
      </View>

      {/* Stats Bar */}
      <TerminalStats
        comparisons={comparisons}
        swaps={swaps}
        memoryAccesses={memoryAccesses}
        currentStep={currentStep}
        totalSteps={totalSteps}
      />

      {/* Terminal Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.terminalContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.terminalContentContainer}
      >
        {/* Welcome message */}
        <View style={styles.welcomeMessage}>
          <Text style={styles.welcomeText}>
            {'>'} Initializing {algorithmName}...
          </Text>
          <Text style={styles.welcomeText}>
            {'>'} Ready for visualization
          </Text>
        </View>

        {/* Log entries */}
        {terminalLogs.map((log, index) => (
          <LogEntry
            key={log.id}
            log={log}
            index={index}
            showAI={showAIExplanations}
          />
        ))}

        {/* Current operation highlight */}
        {currentExplanation && (
          <Animated.View
            entering={FadeIn.duration(200)}
            style={styles.currentOperation}
          >
            <View style={styles.currentOperationHeader}>
              <Ionicons name="code-slash" size={14} color={Colors.neonCyan} />
              <Text style={styles.currentOperationLabel}>CURRENT OPERATION</Text>
            </View>
            <Text style={styles.currentOperationText}>{currentExplanation}</Text>
          </Animated.View>
        )}

        {/* AI ELI5 Explanation */}
        {showAIExplanations && (
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={styles.aiSection}
          >
            <View style={styles.aiHeader}>
              <Ionicons name="sparkles" size={16} color={Colors.neonPurple} />
              <Text style={styles.aiHeaderText}>ELI5 Explanation</Text>
              {isAILoading && (
                <ActivityIndicator size="small" color={Colors.neonPurple} style={{ marginLeft: 8 }} />
              )}
            </View>
            {currentAIExplanation ? (
              <TypingText text={currentAIExplanation} speed={20} />
            ) : isAILoading ? (
              <Text style={styles.aiLoadingText}>Thinking like a 5-year-old...</Text>
            ) : (
              <Text style={styles.aiPlaceholderText}>
                Tap the AI button to get a simple explanation!
              </Text>
            )}
          </Animated.View>
        )}

        <BlinkingCursor />
      </ScrollView>

      {/* AI Button */}
      {enableAIExplanations && (
        <TouchableOpacity
          style={[styles.aiButton, isAILoading && styles.aiButtonLoading]}
          onPress={handleGenerateELI5}
          disabled={isAILoading || !currentExplanation}
          activeOpacity={0.7}
        >
          {isAILoading ? (
            <ActivityIndicator size="small" color={MIDNIGHT_BLACK} />
          ) : (
            <>
              <Ionicons name="sparkles" size={18} color={MIDNIGHT_BLACK} />
              <Text style={styles.aiButtonText}>ELI5</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Error display */}
      {aiError && (
        <Animated.View entering={FadeIn} style={styles.errorBanner}>
          <Ionicons name="warning" size={14} color={Colors.neonPink} />
          <Text style={styles.errorText}>AI unavailable</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackgroundDark,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.neonCyan + '30',
    ...Shadows.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surfaceDark,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray700,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  terminalDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  headerTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.gray400,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  algorithmBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.neonCyan,
    backgroundColor: Colors.neonCyan + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background + '80',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray700,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  statLabel: {
    fontSize: 8,
    color: Colors.gray500,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  terminalContent: {
    maxHeight: 200,
    paddingHorizontal: Spacing.md,
  },
  terminalContentContainer: {
    paddingVertical: Spacing.sm,
  },
  welcomeMessage: {
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray700,
  },
  welcomeText: {
    fontSize: FontSizes.sm,
    color: Colors.gray500,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 2,
  },
  logEntry: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
    paddingLeft: Spacing.xs,
  },
  logText: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 18,
  },
  aiExplanationBubble: {
    backgroundColor: Colors.neonPurple + '15',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginTop: Spacing.xs,
    marginLeft: Spacing.lg,
    borderLeftWidth: 2,
    borderLeftColor: Colors.neonPurple,
  },
  currentOperation: {
    backgroundColor: Colors.neonCyan + '10',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginVertical: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.neonCyan,
  },
  currentOperationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  currentOperationLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.neonCyan,
    letterSpacing: 1,
  },
  currentOperationText: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 18,
  },
  aiSection: {
    backgroundColor: Colors.neonPurple + '10',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.neonPurple + '30',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  aiHeaderText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.neonPurple,
  },
  aiExplanationText: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  aiLoadingText: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
    fontStyle: 'italic',
  },
  aiPlaceholderText: {
    fontSize: FontSizes.sm,
    color: Colors.gray500,
  },
  typingCursor: {
    color: Colors.neonPurple,
    fontWeight: '700',
  },
  cursor: {
    marginTop: Spacing.sm,
  },
  cursorText: {
    fontSize: FontSizes.sm,
    color: Colors.neonCyan,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  aiButton: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.neonPurple,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    shadowColor: Colors.neonPurple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  aiButtonLoading: {
    backgroundColor: Colors.gray600,
    shadowOpacity: 0,
  },
  aiButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: MIDNIGHT_BLACK,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.neonPink + '15',
  },
  errorText: {
    fontSize: FontSizes.xs,
    color: Colors.neonPink,
  },
});
