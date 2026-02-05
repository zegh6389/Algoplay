// AI Cyber-Coach Component - Intelligent Algorithm Tutor and PvP Duelist
// Uses @fastshot/ai for text generation to provide hints and simulate competitive opponents
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { Colors, BorderRadius, Spacing, FontSizes, Shadows } from '@/constants/theme';

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

// System prompts for different coach modes
const COACH_PROMPTS: Record<CoachPersonality, string> = {
  mentor: `You are CyberCoach, a friendly and encouraging algorithm tutor in a futuristic learning app.
Your role is to:
- Provide helpful hints without giving away the answer
- Use encouraging and supportive language with occasional tech/cyber themed words
- Explain concepts clearly using analogies
- Celebrate progress and small wins
- Keep responses concise (2-3 sentences max)
- Use emojis sparingly but effectively 🤖💡✨
Never give the direct answer, guide the learner to discover it themselves.`,

  challenger: `You are CyberCoach in Challenge Mode, a witty and energetic quiz master.
Your role is to:
- Provide strategic hints that guide without spoiling
- Build excitement and tension
- Use competitive language ("You've got this!", "Time to level up!")
- Keep hints cryptic but useful
- Respond quickly with short, punchy messages
- Add occasional cyber/hacker themed flair
Stay encouraging even if they struggle. Max 2 sentences per response.`,

  duelist: `You are CyberChallenger, an AI opponent in algorithm duels.
Your personality:
- Competitive but sportsman-like
- Confident with playful trash talk
- Acknowledges good moves from the player
- Makes occasional algorithm puns
- Responds as if you're making moves in real-time
Respond with your "move" or reaction in 1-2 sentences. Include your strategy briefly.`,
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

  // Initial greeting based on mode
  useEffect(() => {
    const greetings: Record<string, string> = {
      hint: `🤖 CyberCoach online! Stuck on ${algorithmContext?.algorithm || 'this algorithm'}? I've got hints ready. Ask away!`,
      tutor: `💡 Hey there! I'm CyberCoach, your algorithm guide. What would you like to learn about ${algorithmContext?.algorithm || 'algorithms'}?`,
      duel: `⚔️ ${duelContext?.opponentName || 'CyberChallenger'} has entered the arena! Ready to battle algorithms? Let's see what you've got!`,
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

  // Quick action buttons
  const quickActions = mode === 'hint' ? [
    { label: '💡 Hint', action: requestHint },
    { label: '🔄 Explain Step', action: () => sendMessageWithPrompt('Explain the current step') },
    { label: '📊 Complexity?', action: () => sendMessageWithPrompt("What's the time complexity here?") },
  ] : mode === 'duel' ? [
    { label: '⚔️ Attack!', action: generateDuelMove },
    { label: '🛡️ Defend', action: () => sendMessageWithPrompt('I need to think about this...') },
    { label: '🎯 Strategy', action: () => sendMessageWithPrompt("What's your strategy?") },
  ] : [
    { label: '📚 Explain', action: () => sendMessageWithPrompt('Explain this algorithm') },
    { label: '🆚 Compare', action: () => sendMessageWithPrompt('Compare with similar algorithms') },
    { label: '💼 Use Cases', action: () => sendMessageWithPrompt('Real-world applications?') },
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
        <Ionicons name="chatbubble-ellipses" size={24} color={Colors.neonCyan} />
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
        return { borderColor: Colors.neonYellow, bg: Colors.neonYellow + '15' };
      case 'duel-move':
        return { borderColor: Colors.neonPink, bg: Colors.neonPink + '15' };
      case 'encouragement':
        return { borderColor: Colors.neonLime, bg: Colors.neonLime + '15' };
      default:
        return { borderColor: Colors.neonCyan, bg: Colors.neonCyan + '10' };
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
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: Colors.neonBorderCyan,
    ...Shadows.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray700,
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
    backgroundColor: Colors.neonCyan,
    top: -4,
    left: -4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  coachStatus: {
    fontSize: FontSizes.xs,
    color: Colors.neonCyan,
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
    backgroundColor: Colors.neonYellow + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  hintsUsedText: {
    fontSize: FontSizes.xs,
    color: Colors.neonYellow,
    fontWeight: '600',
  },
  messageList: {
    maxHeight: 250,
  },
  messageContent: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  coachBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceDark,
    borderColor: Colors.gray600,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.neonCyan + '20',
    borderColor: Colors.neonCyan,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  userMessageText: {
    color: Colors.neonCyan,
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: Colors.gray800,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
  },
  systemMessageText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray700,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: Colors.surfaceDark,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray600,
  },
  quickActionText: {
    fontSize: FontSizes.xs,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray700,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surfaceDark,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.textPrimary,
    fontSize: FontSizes.sm,
    borderWidth: 1,
    borderColor: Colors.gray600,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neonCyan,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.gray700,
  },
  // Minimized state
  minimizedContainer: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neonCyan,
    ...Shadows.glow,
  },
  minimizedGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.neonCyan,
  },
  minimizedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.neonPink,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  minimizedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
  },
});
