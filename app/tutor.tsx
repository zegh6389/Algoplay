import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTextGeneration } from '@fastshot/ai';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SYSTEM_PROMPT = `You are Algorithm Tutor, an expert AI assistant specialized in teaching data structures and algorithms. Your role is to:

1. Explain algorithms clearly with examples
2. Compare different algorithms and their trade-offs
3. Help users understand Big O notation and complexity analysis
4. Provide code examples in Python when helpful
5. Answer questions about sorting, searching, graphs, dynamic programming, and more

Keep explanations concise but thorough. Use analogies to make complex concepts accessible. When comparing algorithms, consider both theoretical complexity and practical performance factors like cache locality and constant factors.

Current context: The user is learning algorithms through an interactive app called Algoplay.`;

const SUGGESTED_QUESTIONS = [
  'Why is Quick Sort faster than Merge Sort in practice?',
  'Explain how A* pathfinding works',
  'When should I use BFS vs DFS?',
  'What makes Dynamic Programming efficient?',
];

function MessageBubble({ message, index }: { message: Message; index: number }) {
  const isUser = message.role === 'user';

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 50).springify()}
      style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.assistantBubble,
      ]}
    >
      {!isUser && (
        <View style={styles.assistantAvatar}>
          <View style={styles.avatarIcon}>
            <Ionicons name="bulb" size={16} color={Colors.actionTeal} />
          </View>
        </View>
      )}
      <View style={[styles.messageContent, isUser ? styles.userContent : styles.assistantContent]}>
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>
          {message.content}
        </Text>
      </View>
    </Animated.View>
  );
}

function SuggestedQuestions({ onSelect }: { onSelect: (question: string) => void }) {
  return (
    <View style={styles.suggestedContainer}>
      <Text style={styles.suggestedTitle}>Try asking:</Text>
      <View style={styles.suggestedList}>
        {SUGGESTED_QUESTIONS.map((question, index) => (
          <Animated.View key={index} entering={FadeInDown.delay(index * 100).springify()}>
            <TouchableOpacity
              style={styles.suggestedButton}
              onPress={() => onSelect(question)}
            >
              <Text style={styles.suggestedText} numberOfLines={2}>
                {question}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

function WelcomeMessage() {
  return (
    <Animated.View entering={FadeInDown.delay(200)} style={styles.welcomeContainer}>
      <View style={styles.welcomeIcon}>
        <Ionicons name="school" size={48} color={Colors.actionTeal} />
      </View>
      <Text style={styles.welcomeTitle}>AI Tutor</Text>
      <Text style={styles.welcomeSubtitle}>
        Ask me anything about algorithms, data structures, or complexity analysis!
      </Text>
    </Animated.View>
  );
}

export default function TutorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');

  const { generateText, isLoading, error } = useTextGeneration({
    onSuccess: (response) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: () => {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const conversationHistory = messages
      .slice(-6)
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const fullPrompt = `${SYSTEM_PROMPT}\n\nPrevious conversation:\n${conversationHistory}\n\nUser: ${text.trim()}\n\nAssistant:`;

    await generateText(fullPrompt);
  };

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header */}
      <Animated.View entering={FadeInDown} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>AI Tutor</Text>
        <View style={styles.newellBadge}>
          <Text style={styles.newellText}>Newell AI</Text>
        </View>
      </Animated.View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.length === 0 ? (
          <>
            <WelcomeMessage />
            <SuggestedQuestions onSelect={handleSuggestedQuestion} />
          </>
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageBubble key={message.id} message={message} index={index} />
            ))}
            {isLoading && (
              <Animated.View entering={FadeInRight} style={styles.loadingContainer}>
                <View style={styles.assistantAvatar}>
                  <View style={styles.avatarIcon}>
                    <Ionicons name="bulb" size={16} color={Colors.actionTeal} />
                  </View>
                </View>
                <View style={styles.typingIndicator}>
                  <ActivityIndicator size="small" color={Colors.actionTeal} />
                  <Text style={styles.typingText}>Thinking...</Text>
                </View>
              </Animated.View>
            )}
          </>
        )}
      </ScrollView>

      {/* Race Mode Button */}
      {messages.length > 0 && (
        <TouchableOpacity
          style={styles.raceModeButton}
          onPress={() => router.push('/game/race-mode')}
        >
          <Ionicons name="flag" size={16} color={Colors.alertCoral} />
          <Text style={styles.raceModeText}>Race Mode</Text>
        </TouchableOpacity>
      )}

      {/* Input Area */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + Spacing.sm }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Ask about algorithms..."
            placeholderTextColor={Colors.gray500}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() && !isLoading ? Colors.midnightBlue : Colors.gray500}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.midnightBlue,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray800,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  title: {
    flex: 1,
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.white,
  },
  newellBadge: {
    backgroundColor: Colors.actionTeal + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.actionTeal + '40',
  },
  newellText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.actionTeal,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  welcomeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.actionTeal + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  welcomeTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.gray400,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    lineHeight: 22,
  },
  suggestedContainer: {
    marginTop: Spacing.xl,
  },
  suggestedTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.gray500,
    marginBottom: Spacing.md,
  },
  suggestedList: {
    gap: Spacing.sm,
  },
  suggestedButton: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray700,
  },
  suggestedText: {
    fontSize: FontSizes.md,
    color: Colors.gray300,
    lineHeight: 22,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  assistantBubble: {
    justifyContent: 'flex-start',
  },
  assistantAvatar: {
    marginRight: Spacing.sm,
    marginTop: 4,
  },
  avatarIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.actionTeal + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContent: {
    maxWidth: '80%',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
  },
  userContent: {
    backgroundColor: Colors.actionTeal,
    marginLeft: 'auto',
    borderBottomRightRadius: BorderRadius.sm,
  },
  assistantContent: {
    backgroundColor: Colors.cardBackground,
    borderBottomLeftRadius: BorderRadius.sm,
  },
  messageText: {
    fontSize: FontSizes.md,
    color: Colors.gray200,
    lineHeight: 22,
  },
  userMessageText: {
    color: Colors.midnightBlue,
  },
  loadingContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  typingText: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
    fontStyle: 'italic',
  },
  raceModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: Colors.alertCoral + '20',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.alertCoral + '40',
  },
  raceModeText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.alertCoral,
  },
  inputContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray800,
    backgroundColor: Colors.midnightBlue,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.white,
    maxHeight: 100,
    paddingVertical: Spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.actionTeal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.gray700,
  },
});
