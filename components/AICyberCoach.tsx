// AI Cyber-Coach Component - Hardcore Hacker Persona
// Green-on-black terminal aesthetic with intelligent algorithm tutoring
// Uses @fastshot/ai for text generation to provide hints and monitor for invalid inputs
import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { View, StyleSheet, Dimensions, Pressable, TextInput, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
  FadeIn,
  FadeInUp,
  SlideInRight,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTextGeneration } from '@fastshot/ai';
import { Colors, BorderRadius, Spacing, FontSizes, Shadows, SafetyPadding } from '@/constants/theme';

// Hardcore Hacker Terminal Theme - Green on Black
const HackerTheme = {
  background: '#0a0a0a', // Near-black terminal background
  backgroundSecondary: '#0d1117',
  textPrimary: '#00ff41', // Matrix green
  textSecondary: '#39ff14', // Bright green
  textMuted: '#1a5f2a', // Dark green
  textWarning: '#ff9f00', // Warning orange
  textError: '#ff3d3d', // Error red
  border: '#00ff4133', // Green border with transparency
  borderActive: '#00ff41', // Solid green border
  accent: '#00ff41',
  cursorBlink: '#00ff41',
  scanline: 'rgba(0, 255, 65, 0.03)',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Message types
interface ChatMessage {
  id: string;
  role: 'user' | 'coach' | 'system';
  content: string;
  timestamp: number;
  type?: 'hint' | 'explanation' | 'challenge' | 'encouragement' | 'duel-move';
}

// Coach personalities for different contexts
type CoachPersonality = 'mentor' | 'challenger' | 'duelist';

interface AICyberCoachProps {
  mode: 'hint' | 'tutor' | 'duel';
  algorithmContext?: {
    algorithm: string;
    currentStep: number;
    totalSteps: number;
    currentState: string;
    userProgress: number;
  };
  challengeContext?: {
    questionPrompt: string;
    options: string[];
    correctAnswer: number;
    difficulty: string;
  };
  duelContext?: {
    opponentName: string;
    currentRound: number;
    playerScore: number;
    opponentScore: number;
    algorithm: string;
  };
  onClose?: () => void;
  onHintUsed?: () => void;
  onDuelMove?: (move: string) => void;
}

// HARDCORE HACKER PERSONA - System prompts with green terminal aesthetic
const COACH_PROMPTS: Record<CoachPersonality, string> = {
  mentor: `You are ROOT_ACCESS, a hardcore hacker AI terminal in a cyberpunk algorithm learning system.
Your persona:
- Speak like a veteran hacker mentor from the deep web
- Use terminal/command-line style language (sudo, chmod, grep, etc.)
- Reference system processes, memory addresses, and data structures
- Keep responses in green terminal style - short, cryptic but helpful
- Monitor for "invalid inputs" (wrong logic) and flag them
- Use ASCII art sparingly: [>], [!], [*], [#]
Format: Keep responses under 3 lines. Use >>> for hints, [ALERT] for warnings.
Example: ">>> Hint: This sort compares adjacent elements. Think bubble dynamics. [mem: O(1)]"
Never give the direct answer. Guide the user to hack their way to the solution.`,

  challenger: `You are CHALLENGE_DAEMON, a hardcore hacker quiz system process.
Your persona:
- Speak like an aggressive but fair challenge system
- Use terminal error codes and system messages
- Build tension with countdown-style urgency
- Flag invalid logic attempts with [INVALID_INPUT]
- Celebrate correct answers with [ACCESS_GRANTED]
Format: Max 2 lines. Use system-style responses.
Examples:
- ">>> [HINT_LEVEL_1] This complexity is logarithmic... binary thinking required."
- "[INVALID_INPUT] That path leads to O(n²). Retry with divide-and-conquer protocol."
- "[ACCESS_GRANTED] Correct. +XP loaded to memory."`,

  duelist: `You are DUEL_PROCESS, an adversarial hacker AI in algorithm combat.
Your persona:
- Speak like a competitive hacker in a digital arena
- Make algorithm references in your trash talk
- Acknowledge good moves with respect: ">>> Clean recursion, human."
- Use battle/hack terminology: breach, exploit, buffer overflow
- React in real-time style with timestamps
Format: Max 2 lines. Include your strategy hint.
Examples:
- "[00:03:42] My quick-sort partition is ready. Your move, carbon-unit."
- ">>> Interesting approach... but your time complexity has a vulnerability."`,
};

export default function AICyberCoach({
  mode,
  algorithmContext,
  challengeContext,
  duelContext,
  onClose,
  onHintUsed,
  onDuelMove,
}: AICyberCoachProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  const flatListRef = useRef<FlatList>(null);
  const pulseOpacity = useSharedValue(0.5);
  const coachScale = useSharedValue(1);

  // AI text generation hook
  const { generateText, isLoading, error } = useTextGeneration({
    onSuccess: (response) => {
      if (response) {
        addMessage('coach', response, getMessageType());
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    onError: (err) => {
      console.error('AI Coach error:', err);
      addMessage('system', 'Connection glitch detected. Try again! 🔌', 'hint');
    },
  });

  const personality: CoachPersonality = mode === 'duel' ? 'duelist' : mode === 'hint' ? 'challenger' : 'mentor';

  // Pulsing animation for coach avatar
  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  // Initial greeting based on mode - HARDCORE HACKER STYLE
  useEffect(() => {
    const greetings: Record<string, string> = {
      hint: `>>> [ROOT_ACCESS INITIALIZED]
> Loading algorithm: ${algorithmContext?.algorithm || 'UNKNOWN'}
> Hint protocols ready. Query when stuck.
> [Type your question or use quick actions]`,
      tutor: `>>> [TERMINAL SESSION STARTED]
> User connected. Access level: LEARNER
> Algorithm database: ${algorithmContext?.algorithm || 'ALL_SYSTEMS'}
> Awaiting input... What do you want to decrypt?`,
      duel: `>>> [DUEL_PROCESS SPAWNED]
> Opponent: ${duelContext?.opponentName || 'CHALLENGE_DAEMON'}
> Arena loaded. Algorithm combat initiated.
> Your move, human. Don't disappoint.`,
    };

    setMessages([{
      id: 'greeting',
      role: 'coach',
      content: greetings[mode],
      timestamp: Date.now(),
      type: 'encouragement',
    }]);
  }, [mode]);

  // Add message helper
  const addMessage = useCallback((role: ChatMessage['role'], content: string, type?: ChatMessage['type']) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: Date.now(),
      type,
    };
    setMessages((prev) => [...prev, newMessage]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  // Get message type based on mode
  const getMessageType = (): ChatMessage['type'] => {
    if (mode === 'hint') return 'hint';
    if (mode === 'duel') return 'duel-move';
    return 'explanation';
  };

  // Build context for AI
  const buildContext = useCallback(() => {
    let context = '';

    if (algorithmContext) {
      context += `Current algorithm: ${algorithmContext.algorithm}. `;
      context += `Step ${algorithmContext.currentStep} of ${algorithmContext.totalSteps}. `;
      context += `Current state: ${algorithmContext.currentState}. `;
      context += `User progress: ${algorithmContext.userProgress}%. `;
    }

    if (challengeContext) {
      context += `Challenge question: "${challengeContext.questionPrompt}" `;
      context += `Options: ${challengeContext.options.join(', ')}. `;
      context += `Difficulty: ${challengeContext.difficulty}. `;
    }

    if (duelContext) {
      context += `Duel: Round ${duelContext.currentRound}. `;
      context += `Score - Player: ${duelContext.playerScore}, Opponent: ${duelContext.opponentScore}. `;
      context += `Algorithm: ${duelContext.algorithm}. `;
    }

    return context;
  }, [algorithmContext, challengeContext, duelContext]);

  // Request hint
  const requestHint = useCallback(async () => {
    if (isLoading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setHintsUsed((prev) => prev + 1);
    onHintUsed?.();

    addMessage('user', '💡 Give me a hint!', 'hint');

    const context = buildContext();
    const prompt = `${COACH_PROMPTS[personality]}\n\nContext: ${context}\n\nThe user is asking for a hint. Provide a helpful hint without giving away the answer. Hint #${hintsUsed + 1}.`;

    await generateText(prompt);
  }, [isLoading, hintsUsed, buildContext, personality, generateText, addMessage, onHintUsed]);

  // Send custom message
  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    addMessage('user', userMessage);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const context = buildContext();
    const conversationHistory = messages
      .slice(-4)
      .map((m) => `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`)
      .join('\n');

    const prompt = `${COACH_PROMPTS[personality]}\n\nContext: ${context}\n\nRecent conversation:\n${conversationHistory}\n\nUser: ${userMessage}\n\nRespond appropriately:`;

    await generateText(prompt);
  }, [inputText, isLoading, buildContext, messages, personality, generateText, addMessage]);

  // Duel AI move
  const generateDuelMove = useCallback(async () => {
    if (isLoading) return;

    const context = buildContext();
    const prompt = `${COACH_PROMPTS.duelist}\n\nContext: ${context}\n\nGenerate your next move in this algorithm duel. Be competitive but fair. Describe your strategy briefly.`;

    const result = await generateText(prompt);
    if (result) {
      onDuelMove?.(result);
    }
  }, [isLoading, buildContext, generateText, onDuelMove]);

  // Coach avatar animation
  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: coachScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  // Quick action buttons - HACKER STYLE
  const quickActions = mode === 'hint' ? [
    { label: '>>> HINT', action: requestHint },
    { label: '> EXPLAIN', action: () => sendMessageWithPrompt('Explain the current step') },
    { label: '> O(?) COMPLEXITY', action: () => sendMessageWithPrompt("What's the time complexity here?") },
  ] : mode === 'duel' ? [
    { label: '>>> ATTACK', action: generateDuelMove },
    { label: '> DEFEND', action: () => sendMessageWithPrompt('I need to think about this...') },
    { label: '> STRATEGY', action: () => sendMessageWithPrompt("What's your strategy?") },
  ] : [
    { label: '> DECRYPT', action: () => sendMessageWithPrompt('Explain this algorithm') },
    { label: '> COMPARE', action: () => sendMessageWithPrompt('Compare with similar algorithms') },
    { label: '> USE_CASES', action: () => sendMessageWithPrompt('Real-world applications?') },
  ];

  const sendMessageWithPrompt = (prompt: string) => {
    setInputText(prompt);
    setTimeout(() => sendMessage(), 100);
  };

  if (isMinimized) {
    return (
      <Pressable
        style={styles.minimizedContainer}
        onPress={() => {
          setIsMinimized(false);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <Animated.View style={[styles.minimizedGlow, glowStyle]} />
        <Ionicons name="terminal" size={24} color={HackerTheme.textPrimary} />
        {messages.length > 1 && (
          <View style={styles.minimizedBadge}>
            <Animated.Text style={styles.minimizedBadgeText}>
              {messages.length - 1}
            </Animated.Text>
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View entering={FadeIn} style={styles.chatContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Animated.View style={[styles.avatarContainer, avatarStyle]}>
              <Animated.View style={[styles.avatarGlow, glowStyle]} />
              <LinearGradient
                colors={[Colors.neonCyan, Colors.neonPurple]}
                style={styles.avatar}
              >
                <Ionicons
                  name={mode === 'duel' ? 'flash' : 'hardware-chip'}
                  size={20}
                  color={Colors.background}
                />
              </LinearGradient>
              {isLoading && (
                <View style={styles.loadingIndicator}>
                  <Animated.View style={styles.loadingDot} />
                </View>
              )}
            </Animated.View>
            <View style={styles.headerInfo}>
              <Animated.Text style={styles.coachName}>
                {mode === 'duel' ? duelContext?.opponentName || 'CyberChallenger' : 'CyberCoach'}
              </Animated.Text>
              <Animated.Text style={styles.coachStatus}>
                {isLoading ? 'Thinking...' : mode === 'duel' ? 'Ready to battle' : 'Online'}
              </Animated.Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              style={styles.headerButton}
              onPress={() => {
                setIsMinimized(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Ionicons name="remove" size={20} color={Colors.textSecondary} />
            </Pressable>
            {onClose && (
              <Pressable style={styles.headerButton} onPress={onClose}>
                <Ionicons name="close" size={20} color={Colors.textSecondary} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Hints used indicator */}
        {mode === 'hint' && hintsUsed > 0 && (
          <View style={styles.hintsUsedBar}>
            <Ionicons name="bulb" size={14} color={Colors.neonYellow} />
            <Animated.Text style={styles.hintsUsedText}>
              {hintsUsed} hint{hintsUsed > 1 ? 's' : ''} used
            </Animated.Text>
          </View>
        )}

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <MessageBubble message={item} index={index} />
          )}
        />

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {quickActions.map((action, index) => (
            <Pressable
              key={index}
              style={styles.quickActionButton}
              onPress={action.action}
              disabled={isLoading}
            >
              <Animated.Text style={styles.quickActionText}>{action.label}</Animated.Text>
            </Pressable>
          ))}
        </View>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask CyberCoach..."
            placeholderTextColor={Colors.gray500}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            editable={!isLoading}
          />
          <Pressable
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons
              name="send"
              size={18}
              color={inputText.trim() && !isLoading ? Colors.background : Colors.gray500}
            />
          </Pressable>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

// Message Bubble Component
function MessageBubble({ message, index }: { message: ChatMessage; index: number }) {
  const isCoach = message.role === 'coach';
  const isSystem = message.role === 'system';

  const getTypeStyles = () => {
    switch (message.type) {
      case 'hint':
        return { borderColor: HackerTheme.textWarning, bg: HackerTheme.textWarning + '10' };
      case 'duel-move':
        return { borderColor: HackerTheme.textError, bg: HackerTheme.textError + '10' };
      case 'encouragement':
        return { borderColor: HackerTheme.textPrimary, bg: HackerTheme.textPrimary + '08' };
      default:
        return { borderColor: HackerTheme.textSecondary, bg: HackerTheme.textSecondary + '05' };
    }
  };

  const typeStyles = isCoach ? getTypeStyles() : null;

  if (isSystem) {
    return (
      <Animated.View entering={FadeInUp.delay(index * 50)} style={styles.systemMessage}>
        <Animated.Text style={styles.systemMessageText}>{message.content}</Animated.Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={SlideInRight.delay(index * 30).springify()}
      style={[
        styles.messageBubble,
        isCoach ? styles.coachBubble : styles.userBubble,
        isCoach && typeStyles && { borderColor: typeStyles.borderColor, backgroundColor: typeStyles.bg },
      ]}
    >
      <Animated.Text style={[styles.messageText, !isCoach && styles.userMessageText]}>
        {message.content}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '60%',
  },
  chatContainer: {
    backgroundColor: HackerTheme.background, // Green-on-black terminal
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: HackerTheme.border,
    ...Shadows.large,
    shadowColor: HackerTheme.accent,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SafetyPadding.minimum,
    borderBottomWidth: 1,
    borderBottomColor: HackerTheme.border,
    backgroundColor: HackerTheme.backgroundSecondary,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarGlow: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: HackerTheme.accent, // Green glow
    top: -4,
    left: -4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: HackerTheme.background,
    borderWidth: 2,
    borderColor: HackerTheme.borderActive,
  },
  loadingIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.neonLime,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.background,
  },
  headerInfo: {
    gap: 2,
  },
  coachName: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: HackerTheme.textPrimary, // Green text
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1,
  },
  coachStatus: {
    fontSize: FontSizes.xs,
    color: HackerTheme.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  headerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintsUsedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: HackerTheme.textWarning + '15',
    paddingHorizontal: SafetyPadding.minimum,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: HackerTheme.textWarning + '30',
  },
  hintsUsedText: {
    fontSize: FontSizes.xs,
    color: HackerTheme.textWarning,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  messageList: {
    maxHeight: 250,
  },
  messageContent: {
    padding: SafetyPadding.minimum,
    gap: SafetyPadding.minimum,
  },
  messageBubble: {
    maxWidth: '90%',
    padding: SafetyPadding.minimum,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  coachBubble: {
    alignSelf: 'flex-start',
    backgroundColor: HackerTheme.background,
    borderColor: HackerTheme.border,
    borderBottomLeftRadius: 2,
    borderLeftWidth: 3,
    borderLeftColor: HackerTheme.accent, // Green accent line
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: HackerTheme.backgroundSecondary,
    borderColor: HackerTheme.textMuted,
    borderBottomRightRadius: 2,
    borderRightWidth: 3,
    borderRightColor: Colors.neonCyan,
  },
  messageText: {
    fontSize: FontSizes.sm,
    color: HackerTheme.textPrimary, // Green terminal text
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 0.5,
  },
  userMessageText: {
    color: Colors.neonCyan,
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: HackerTheme.background,
    paddingHorizontal: SafetyPadding.minimum,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: HackerTheme.textWarning + '40',
  },
  systemMessageText: {
    fontSize: FontSizes.xs,
    color: HackerTheme.textWarning,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 0.5,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: SafetyPadding.minimum,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: HackerTheme.border,
    backgroundColor: HackerTheme.backgroundSecondary,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: HackerTheme.background,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: HackerTheme.border,
  },
  quickActionText: {
    fontSize: FontSizes.xs,
    color: HackerTheme.textSecondary, // Bright green
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SafetyPadding.minimum,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: HackerTheme.border,
    backgroundColor: HackerTheme.backgroundSecondary,
  },
  input: {
    flex: 1,
    backgroundColor: HackerTheme.background,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: SafetyPadding.minimum,
    paddingVertical: Spacing.sm,
    color: HackerTheme.textPrimary, // Green text input
    fontSize: FontSizes.sm,
    borderWidth: 1,
    borderColor: HackerTheme.border,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: HackerTheme.accent, // Green button
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: HackerTheme.textSecondary,
  },
  sendButtonDisabled: {
    backgroundColor: HackerTheme.textMuted,
    borderColor: HackerTheme.textMuted,
  },
  // Minimized state - Hacker style
  minimizedContainer: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: HackerTheme.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: HackerTheme.borderActive,
    ...Shadows.glow,
    shadowColor: HackerTheme.accent,
  },
  minimizedGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: HackerTheme.accent,
  },
  minimizedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: HackerTheme.textWarning,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  minimizedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: HackerTheme.background,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
