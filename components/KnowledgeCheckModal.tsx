import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import {
  QuizQuestion,
  AlgorithmQuiz,
  getRandomQuestions,
  calculateQuizXP,
  getMasteryLevel,
} from '@/utils/quizData';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface KnowledgeCheckModalProps {
  visible: boolean;
  onClose: () => void;
  quiz: AlgorithmQuiz;
  onComplete: (score: number, xpEarned: number, correctAnswers: number, totalQuestions: number) => void;
}

interface QuestionCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (isCorrect: boolean, selectedIndex: number) => void;
  showResult: boolean;
  selectedAnswer: number | null;
}

function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  showResult,
  selectedAnswer,
}: QuestionCardProps) {
  const handleOptionPress = (index: number) => {
    if (showResult) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const isCorrect = index === question.correctAnswer;
    onAnswer(isCorrect, index);

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const getOptionStyle = (index: number) => {
    if (!showResult) {
      return styles.optionDefault;
    }

    if (index === question.correctAnswer) {
      return styles.optionCorrect;
    }

    if (index === selectedAnswer && index !== question.correctAnswer) {
      return styles.optionIncorrect;
    }

    return styles.optionDefault;
  };

  const getOptionTextStyle = (index: number) => {
    if (!showResult) {
      return styles.optionText;
    }

    if (index === question.correctAnswer) {
      return styles.optionTextCorrect;
    }

    if (index === selectedAnswer && index !== question.correctAnswer) {
      return styles.optionTextIncorrect;
    }

    return styles.optionText;
  };

  const getTypeColor = () => {
    switch (question.type) {
      case 'complexity':
        return Colors.actionTeal;
      case 'logic':
        return Colors.logicGold;
      case 'use-case':
        return Colors.info;
      default:
        return Colors.gray400;
    }
  };

  const getTypeLabel = () => {
    switch (question.type) {
      case 'complexity':
        return 'Complexity';
      case 'logic':
        return 'Logic Flow';
      case 'use-case':
        return 'Use Case';
      default:
        return 'General';
    }
  };

  return (
    <Animated.View entering={SlideInRight.springify()} style={styles.questionCard}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              { width: `${(questionNumber / totalQuestions) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {questionNumber} / {totalQuestions}
        </Text>
      </View>

      {/* Question Type Badge */}
      <View style={[styles.typeBadge, { backgroundColor: getTypeColor() + '20' }]}>
        <Text style={[styles.typeBadgeText, { color: getTypeColor() }]}>
          {getTypeLabel()}
        </Text>
      </View>

      {/* Question */}
      <Text style={styles.questionText}>{question.question}</Text>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {question.options.map((option, index) => (
          <Animated.View
            key={index}
            entering={FadeInDown.delay(index * 100).springify()}
          >
            <TouchableOpacity
              style={[styles.optionButton, getOptionStyle(index)]}
              onPress={() => handleOptionPress(index)}
              activeOpacity={0.8}
              disabled={showResult}
            >
              <View style={styles.optionContent}>
                <View
                  style={[
                    styles.optionIndicator,
                    showResult && index === question.correctAnswer && styles.optionIndicatorCorrect,
                    showResult && index === selectedAnswer && index !== question.correctAnswer && styles.optionIndicatorIncorrect,
                  ]}
                >
                  {showResult && index === question.correctAnswer && (
                    <Ionicons name="checkmark" size={14} color={Colors.white} />
                  )}
                  {showResult && index === selectedAnswer && index !== question.correctAnswer && (
                    <Ionicons name="close" size={14} color={Colors.white} />
                  )}
                  {!showResult && (
                    <Text style={styles.optionIndicatorText}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  )}
                </View>
                <Text style={[styles.optionText, getOptionTextStyle(index)]}>{option}</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Explanation (shown after answer) */}
      {showResult && (
        <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.explanationContainer}>
          <View style={styles.explanationHeader}>
            <Ionicons name="bulb" size={18} color={Colors.logicGold} />
            <Text style={styles.explanationTitle}>Explanation</Text>
          </View>
          <Text style={styles.explanationText}>{question.explanation}</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

interface ResultsCardProps {
  correctAnswers: number;
  totalQuestions: number;
  xpEarned: number;
  onClose: () => void;
}

function ResultsCard({ correctAnswers, totalQuestions, xpEarned, onClose }: ResultsCardProps) {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const masteryLevel = getMasteryLevel([percentage]);

  const getMessage = () => {
    if (percentage === 100) return 'Perfect Score!';
    if (percentage >= 80) return 'Excellent Work!';
    if (percentage >= 60) return 'Good Job!';
    if (percentage >= 40) return 'Keep Practicing!';
    return 'Review the Material';
  };

  const getEmoji = () => {
    if (percentage === 100) return '🏆';
    if (percentage >= 80) return '⭐';
    if (percentage >= 60) return '👍';
    if (percentage >= 40) return '📚';
    return '💪';
  };

  return (
    <Animated.View entering={FadeIn.springify()} style={styles.resultsCard}>
      <Text style={styles.resultsEmoji}>{getEmoji()}</Text>
      <Text style={styles.resultsTitle}>{getMessage()}</Text>

      <View style={styles.scoreCircle}>
        <Text style={styles.scorePercentage}>{percentage}%</Text>
        <Text style={styles.scoreLabel}>Score</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Ionicons name="checkmark-circle" size={24} color={Colors.actionTeal} />
          <Text style={styles.statValue}>{correctAnswers}</Text>
          <Text style={styles.statLabel}>Correct</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Ionicons name="close-circle" size={24} color={Colors.alertCoral} />
          <Text style={styles.statValue}>{totalQuestions - correctAnswers}</Text>
          <Text style={styles.statLabel}>Incorrect</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Ionicons name="star" size={24} color={Colors.logicGold} />
          <Text style={[styles.statValue, { color: Colors.logicGold }]}>+{xpEarned}</Text>
          <Text style={styles.statLabel}>XP Earned</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
        <Text style={styles.closeButtonText}>Continue</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function KnowledgeCheckModal({
  visible,
  onClose,
  quiz,
  onComplete,
}: KnowledgeCheckModalProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFinalResults, setShowFinalResults] = useState(false);

  useEffect(() => {
    if (visible && quiz) {
      // Reset state and get random questions
      const randomQuestions = getRandomQuestions(quiz, 4);
      setQuestions(randomQuestions);
      setCurrentQuestionIndex(0);
      setCorrectAnswers(0);
      setShowResult(false);
      setSelectedAnswer(null);
      setShowFinalResults(false);
    }
  }, [visible, quiz]);

  const handleAnswer = useCallback((isCorrect: boolean, answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
    }
  }, []);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setShowResult(false);
      setSelectedAnswer(null);
    } else {
      // Quiz completed
      setShowFinalResults(true);
      const score = Math.round((correctAnswers + (showResult && selectedAnswer === questions[currentQuestionIndex]?.correctAnswer ? 1 : 0)) / questions.length * 100);
      const finalCorrect = correctAnswers + (showResult && selectedAnswer === questions[currentQuestionIndex]?.correctAnswer ? 1 : 0);
      const xp = calculateQuizXP(finalCorrect, questions.length);
      onComplete(score, xp, finalCorrect, questions.length);
    }
  }, [currentQuestionIndex, questions.length, correctAnswers, showResult, selectedAnswer, onComplete, questions]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!quiz || questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
        <View style={styles.modalContainer}>
          {/* Glass morphism card */}
          <View style={styles.glassCard}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Ionicons name="school" size={24} color={Colors.actionTeal} />
                <View>
                  <Text style={styles.headerTitle}>Knowledge Check</Text>
                  <Text style={styles.headerSubtitle}>{quiz.algorithmName}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.closeIcon} onPress={handleClose}>
                <Ionicons name="close" size={24} color={Colors.gray400} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            {!showFinalResults ? (
              <>
                <QuestionCard
                  question={currentQuestion}
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestions={questions.length}
                  onAnswer={handleAnswer}
                  showResult={showResult}
                  selectedAnswer={selectedAnswer}
                />

                {/* Next Button */}
                {showResult && (
                  <Animated.View entering={FadeInUp.delay(500).springify()}>
                    <TouchableOpacity
                      style={styles.nextButton}
                      onPress={handleNextQuestion}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.nextButtonText}>
                        {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
                      </Text>
                      <Ionicons
                        name={currentQuestionIndex < questions.length - 1 ? 'arrow-forward' : 'trophy'}
                        size={20}
                        color={Colors.midnightBlue}
                      />
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </>
            ) : (
              <ResultsCard
                correctAnswers={correctAnswers + (selectedAnswer === questions[questions.length - 1]?.correctAnswer ? 1 : 0)}
                totalQuestions={questions.length}
                xpEarned={calculateQuizXP(
                  correctAnswers + (selectedAnswer === questions[questions.length - 1]?.correctAnswer ? 1 : 0),
                  questions.length
                )}
                onClose={handleClose}
              />
            )}
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  glassCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.midnightBlue + 'F0',
    borderRadius: BorderRadius.xxl,
    borderWidth: 1,
    borderColor: Colors.actionTeal + '30',
    overflow: 'hidden',
    ...Shadows.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray700,
    backgroundColor: Colors.midnightBlueDark + '80',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
  },
  closeIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray700,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionCard: {
    padding: Spacing.lg,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.gray700,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.actionTeal,
    borderRadius: BorderRadius.full,
  },
  progressText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.gray400,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  typeBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  questionText: {
    fontSize: FontSizes.lg,
    fontWeight: '500',
    color: Colors.white,
    lineHeight: 26,
    marginBottom: Spacing.lg,
  },
  optionsContainer: {
    gap: Spacing.sm,
  },
  optionButton: {
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    overflow: 'hidden',
  },
  optionDefault: {
    backgroundColor: Colors.cardBackground,
    borderColor: Colors.gray700,
  },
  optionCorrect: {
    backgroundColor: Colors.actionTeal + '20',
    borderColor: Colors.actionTeal,
  },
  optionIncorrect: {
    backgroundColor: Colors.alertCoral + '20',
    borderColor: Colors.alertCoral,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  optionIndicator: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray700,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIndicatorCorrect: {
    backgroundColor: Colors.actionTeal,
  },
  optionIndicatorIncorrect: {
    backgroundColor: Colors.alertCoral,
  },
  optionIndicatorText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.gray400,
  },
  optionText: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.gray300,
  },
  optionTextCorrect: {
    color: Colors.actionTeal,
    fontWeight: '500',
  },
  optionTextIncorrect: {
    color: Colors.alertCoral,
    fontWeight: '500',
  },
  explanationContainer: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.logicGold + '10',
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.logicGold,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  explanationTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.logicGold,
  },
  explanationText: {
    fontSize: FontSizes.sm,
    color: Colors.gray300,
    lineHeight: 20,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.actionTeal,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  nextButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.midnightBlue,
  },
  resultsCard: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  resultsEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  resultsTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.lg,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.actionTeal + '20',
    borderWidth: 4,
    borderColor: Colors.actionTeal,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  scorePercentage: {
    fontSize: FontSizes.xxxl,
    fontWeight: '700',
    color: Colors.actionTeal,
  },
  scoreLabel: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.gray700,
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.white,
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    marginTop: 2,
  },
  closeButton: {
    width: '100%',
    backgroundColor: Colors.actionTeal,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  closeButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.midnightBlue,
    textAlign: 'center',
  },
});
