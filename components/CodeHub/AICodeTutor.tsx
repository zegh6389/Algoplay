import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp, SlideInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTextGeneration } from '@/hooks/useTextGeneration';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import { ProgrammingLanguage, languageNames } from '@/utils/algorithms/codeImplementations';

interface AICodeTutorProps {
  visible: boolean;
  onClose: () => void;
  algorithmName: string;
  code: string;
  language: ProgrammingLanguage;
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AICodeTutor({
  visible,
  onClose,
  algorithmName,
  code,
  language,
  timeComplexity,
  spaceComplexity,
}: AICodeTutorProps) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userQuestion, setUserQuestion] = useState('');
  const [hasInitialExplanation, setHasInitialExplanation] = useState(false);

  const { generateText, data, isLoading, error, reset } = useTextGeneration({
    onSuccess: (response) => {
      if (response) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: response },
        ]);
      }
    },
    onError: (err) => {
      console.error('AI Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I encountered an error. Please try again.',
        },
      ]);
    },
  });

  // Generate initial explanation when modal opens
  useEffect(() => {
    if (visible && !hasInitialExplanation && messages.length === 0) {
      generateInitialExplanation();
    }
  }, [visible]);

  // Reset when modal closes
  useEffect(() => {
    if (!visible) {
      setMessages([]);
      setHasInitialExplanation(false);
      setUserQuestion('');
      reset();
    }
  }, [visible]);

  const generateInitialExplanation = async () => {
    const prompt = `You are an expert algorithm tutor helping students understand code. Be concise, educational, and use simple language.

Please explain this ${algorithmName} implementation in ${languageNames[language]}.

Code:
\`\`\`${language}
${code}
\`\`\`

Complexity:
- Time: Best ${timeComplexity.best}, Average ${timeComplexity.average}, Worst ${timeComplexity.worst}
- Space: ${spaceComplexity}

Explain:
1. What this algorithm does in simple terms (2-3 sentences)
2. How the code works step by step (brief, numbered)
3. Why the time/space complexity is what it is (simple explanation)
4. A real-world analogy to help understand it

Keep the total response under 300 words.`;

    try {
      await generateText(prompt);
      setHasInitialExplanation(true);
    } catch (err) {
      console.error('Failed to generate explanation:', err);
    }
  };

  const handleAskQuestion = async () => {
    if (!userQuestion.trim() || isLoading) return;

    const question = userQuestion.trim();
    setUserQuestion('');

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: question }]);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const prompt = `You are an expert algorithm tutor. The student is learning about ${algorithmName} in ${languageNames[language]}. Answer their question concisely and clearly. Use simple language and examples when helpful. Keep responses under 200 words.

Context - Algorithm: ${algorithmName}
Time Complexity: ${timeComplexity.average}
Space Complexity: ${spaceComplexity}

Student's Question: ${question}`;

    try {
      await generateText(prompt);
    } catch (err) {
      console.error('Failed to answer question:', err);
    }
  };

  const suggestedQuestions = [
    'Why is this better than brute force?',
    'When should I use this algorithm?',
    'Can you give me a real example?',
    'What are the edge cases?',
  ];

  const handleSuggestedQuestion = (question: string) => {
    setUserQuestion(question);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.content, { paddingBottom: insets.bottom + Spacing.md }]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onClose();
              }}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>AI Code Tutor</Text>
              <Text style={styles.headerSubtitle}>{algorithmName}</Text>
            </View>
            <View style={styles.newellBadge}>
              <Ionicons name="sparkles" size={14} color={Colors.actionTeal} />
              <Text style={styles.newellText}>Newell AI</Text>
            </View>
          </View>

          {/* Messages */}
          <ScrollView
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.length === 0 && isLoading ? (
              <Animated.View entering={FadeIn} style={styles.loadingContainer}>
                <View style={styles.loadingAnimation}>
                  <ActivityIndicator size="large" color={Colors.actionTeal} />
                </View>
                <Text style={styles.loadingText}>
                  Analyzing the {algorithmName} code...
                </Text>
                <Text style={styles.loadingSubtext}>
                  Preparing a clear explanation for you
                </Text>
              </Animated.View>
            ) : (
              messages.map((message, index) => (
                <Animated.View
                  key={index}
                  entering={FadeInUp.delay(index * 50)}
                  style={[
                    styles.messageBubble,
                    message.role === 'user'
                      ? styles.userBubble
                      : styles.assistantBubble,
                  ]}
                >
                  {message.role === 'assistant' && (
                    <View style={styles.assistantHeader}>
                      <View style={styles.assistantAvatar}>
                        <Ionicons
                          name="sparkles"
                          size={14}
                          color={Colors.actionTeal}
                        />
                      </View>
                      <Text style={styles.assistantLabel}>AI Tutor</Text>
                    </View>
                  )}
                  <Text
                    style={[
                      styles.messageText,
                      message.role === 'user' && styles.userMessageText,
                    ]}
                  >
                    {message.content}
                  </Text>
                </Animated.View>
              ))
            )}

            {isLoading && messages.length > 0 && (
              <View style={styles.typingIndicator}>
                <View style={styles.assistantAvatar}>
                  <Ionicons name="sparkles" size={14} color={Colors.actionTeal} />
                </View>
                <View style={styles.typingDots}>
                  <View style={styles.dot} />
                  <View style={[styles.dot, styles.dotDelay1]} />
                  <View style={[styles.dot, styles.dotDelay2]} />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Suggested Questions */}
          {messages.length > 0 && !isLoading && (
            <Animated.View entering={SlideInRight} style={styles.suggestionsContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestionsContent}
              >
                {suggestedQuestions.map((question, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionChip}
                    onPress={() => handleSuggestedQuestion(question)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.suggestionText} numberOfLines={1}>
                      {question}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ask a follow-up question..."
              placeholderTextColor={Colors.gray500}
              value={userQuestion}
              onChangeText={setUserQuestion}
              onSubmitEditing={handleAskQuestion}
              returnKeyType="send"
              multiline={false}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!userQuestion.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={handleAskQuestion}
              disabled={!userQuestion.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.gray500} />
              ) : (
                <Ionicons
                  name="send"
                  size={20}
                  color={
                    userQuestion.trim() ? Colors.midnightBlue : Colors.gray500
                  }
                />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.midnightBlue,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    maxHeight: '90%',
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray700,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
    marginTop: 2,
  },
  newellBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.actionTeal + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    gap: 4,
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
    paddingBottom: Spacing.xl,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  loadingAnimation: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.actionTeal + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  loadingText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  loadingSubtext: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
  },
  messageBubble: {
    marginBottom: Spacing.md,
    maxWidth: '90%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.actionTeal,
    borderRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    borderBottomLeftRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray700,
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  assistantAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.actionTeal + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assistantLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.actionTeal,
  },
  messageText: {
    fontSize: FontSizes.sm,
    color: Colors.gray300,
    lineHeight: 22,
  },
  userMessageText: {
    color: Colors.midnightBlue,
    fontWeight: '500',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    alignSelf: 'flex-start',
    gap: Spacing.sm,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.gray500,
  },
  dotDelay1: {
    opacity: 0.7,
  },
  dotDelay2: {
    opacity: 0.4,
  },
  suggestionsContainer: {
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray700,
  },
  suggestionsContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  suggestionChip: {
    backgroundColor: Colors.gray700,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  suggestionText: {
    fontSize: FontSizes.xs,
    color: Colors.gray300,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.sm,
    color: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray700,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.actionTeal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.gray700,
  },
});
