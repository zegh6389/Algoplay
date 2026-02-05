// Challenge Arena - Timed Algorithm Challenges with Point System
// Players compete to complete algorithm steps manually for points
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Dimensions, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
  FadeIn,
  FadeInDown,
  SlideInUp,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Spacing, FontSizes, Shadows } from '@/constants/theme';
import { VictoryConfetti, ParticleBurst, AchievementPopup } from './AnimationEffects';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Challenge Types
type ChallengeType = 'sorting-steps' | 'search-target' | 'traversal-order' | 'complexity-quiz';

interface ChallengeConfig {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  timeLimit: number; // seconds
  baseXP: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface ChallengeStep {
  id: string;
  prompt: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface ChallengeArenaProps {
  challenge: ChallengeConfig;
  steps: ChallengeStep[];
  onComplete: (result: ChallengeResult) => void;
  onExit: () => void;
}

interface ChallengeResult {
  score: number;
  accuracy: number;
  timeBonus: number;
  efficiencyBonus: number;
  totalXP: number;
  correctAnswers: number;
  totalSteps: number;
  timeTaken: number;
  isPersonalBest: boolean;
}

// Score calculation constants
const TIME_BONUS_MULTIPLIER = 1.5;
const ACCURACY_BASE_SCORE = 100;
const STREAK_BONUS = 25;
const PERFECT_BONUS = 200;

export default function ChallengeArena({
  challenge,
  steps,
  onComplete,
  onExit,
}: ChallengeArenaProps) {
  // Game state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(challenge.timeLimit);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ correct: boolean; message: string } | null>(null);

  // Animation values
  const timerScale = useSharedValue(1);
  const timerColor = useSharedValue(0);
  const progressWidth = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const scoreScale = useSharedValue(1);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Start the challenge
  const startChallenge = useCallback(() => {
    setIsPlaying(true);
    startTimeRef.current = Date.now();
    progressWidth.value = withTiming(100, { duration: challenge.timeLimit * 1000, easing: Easing.linear });
  }, [challenge.timeLimit]);

  // Timer countdown
  useEffect(() => {
    if (isPlaying && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1;

          // Urgent timer animation when low
          if (newTime <= 10) {
            timerScale.value = withSequence(
              withTiming(1.2, { duration: 100 }),
              withTiming(1, { duration: 100 })
            );
            timerColor.value = withTiming(1, { duration: 200 });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }

          if (newTime <= 0) {
            endChallenge();
          }

          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, timeRemaining]);

  // Handle answer selection
  const handleSelectOption = useCallback((optionIndex: number) => {
    if (selectedOption !== null || !isPlaying) return;

    setSelectedOption(optionIndex);
    const isCorrect = optionIndex === currentStep.correctAnswer;

    if (isCorrect) {
      // Correct answer
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak(Math.max(maxStreak, newStreak));
      setCorrectAnswers((prev) => prev + 1);

      // Calculate score with streak bonus
      const baseScore = ACCURACY_BASE_SCORE;
      const streakBonus = newStreak > 1 ? STREAK_BONUS * (newStreak - 1) : 0;
      const pointsEarned = baseScore + streakBonus;

      setScore((prev) => prev + pointsEarned);
      scoreScale.value = withSequence(
        withSpring(1.3, { damping: 8 }),
        withSpring(1, { damping: 10 })
      );

      setFeedbackMessage({ correct: true, message: newStreak > 1 ? `🔥 ${newStreak}x Streak! +${pointsEarned}` : `+${pointsEarned}` });
    } else {
      // Wrong answer
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setStreak(0);

      // Shake animation
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );

      setFeedbackMessage({ correct: false, message: currentStep.explanation });
    }

    // Move to next step after delay
    setTimeout(() => {
      setSelectedOption(null);
      setFeedbackMessage(null);

      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
      } else {
        endChallenge();
      }
    }, 1500);
  }, [selectedOption, isPlaying, currentStep, streak, maxStreak, currentStepIndex, steps.length]);

  // End the challenge
  const endChallenge = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const timeTaken = (Date.now() - startTimeRef.current) / 1000;
    const timeRemained = Math.max(0, challenge.timeLimit - timeTaken);
    const accuracy = (correctAnswers / steps.length) * 100;

    // Calculate bonuses
    const timeBonus = Math.floor(timeRemained * TIME_BONUS_MULTIPLIER * 10);
    const efficiencyBonus = maxStreak >= 3 ? maxStreak * STREAK_BONUS : 0;
    const perfectBonus = correctAnswers === steps.length ? PERFECT_BONUS : 0;

    const totalScore = score + timeBonus + efficiencyBonus + perfectBonus;
    const totalXP = Math.floor(totalScore * (challenge.baseXP / 100));

    // Check for achievements
    if (correctAnswers === steps.length) {
      setShowConfetti(true);
      setShowAchievement(true);
    }

    setTimeout(() => {
      setShowResult(true);
      onComplete({
        score: totalScore,
        accuracy,
        timeBonus,
        efficiencyBonus,
        totalXP,
        correctAnswers,
        totalSteps: steps.length,
        timeTaken,
        isPersonalBest: false, // This would be determined by comparing with stored best
      });
    }, correctAnswers === steps.length ? 2000 : 500);
  }, [correctAnswers, steps.length, score, maxStreak, challenge]);

  // Timer animated styles
  const timerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: timerScale.value }],
  }));

  const timerTextStyle = useAnimatedStyle(() => {
    const color = timerColor.value === 1 ? Colors.error : Colors.textPrimary;
    return { color };
  });

  const containerShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const scoreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  // Countdown screen
  if (!isPlaying && !showResult) {
    return (
      <View style={styles.container}>
        <CountdownScreen challenge={challenge} onStart={startChallenge} onExit={onExit} />
      </View>
    );
  }

  // Result screen
  if (showResult) {
    return (
      <View style={styles.container}>
        <VictoryConfetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />
        <ResultScreen
          challenge={challenge}
          score={score}
          correctAnswers={correctAnswers}
          totalSteps={steps.length}
          maxStreak={maxStreak}
          timeRemaining={timeRemaining}
          onReplay={() => {
            setCurrentStepIndex(0);
            setCorrectAnswers(0);
            setStreak(0);
            setMaxStreak(0);
            setScore(0);
            setTimeRemaining(challenge.timeLimit);
            setShowResult(false);
            setShowConfetti(false);
            timerColor.value = 0;
          }}
          onExit={onExit}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with timer and score */}
      <Animated.View entering={FadeIn} style={styles.header}>
        <Pressable style={styles.exitButton} onPress={onExit}>
          <Ionicons name="close" size={24} color={Colors.textSecondary} />
        </Pressable>

        <Animated.View style={[styles.timerContainer, timerAnimatedStyle]}>
          <Ionicons name="time-outline" size={20} color={timeRemaining <= 10 ? Colors.error : Colors.neonCyan} />
          <Animated.Text style={[styles.timerText, timerTextStyle]}>
            {timeRemaining}s
          </Animated.Text>
        </Animated.View>

        <Animated.View style={[styles.scoreContainer, scoreAnimatedStyle]}>
          <Ionicons name="star" size={18} color={Colors.neonYellow} />
          <Animated.Text style={styles.scoreText}>{score}</Animated.Text>
        </Animated.View>
      </Animated.View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Animated.Text style={styles.progressText}>
          {currentStepIndex + 1} / {steps.length}
        </Animated.Text>
      </View>

      {/* Streak indicator */}
      {streak > 0 && (
        <Animated.View entering={FadeInDown} style={styles.streakBadge}>
          <Animated.Text style={styles.streakText}>🔥 {streak}x Streak</Animated.Text>
        </Animated.View>
      )}

      {/* Question */}
      <Animated.View style={[styles.questionContainer, containerShakeStyle]}>
        <Animated.Text style={styles.questionText}>{currentStep.prompt}</Animated.Text>
      </Animated.View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {currentStep.options.map((option, index) => (
          <OptionButton
            key={index}
            option={option}
            index={index}
            isSelected={selectedOption === index}
            isCorrect={selectedOption !== null && index === currentStep.correctAnswer}
            isWrong={selectedOption === index && index !== currentStep.correctAnswer}
            onPress={() => handleSelectOption(index)}
            disabled={selectedOption !== null}
          />
        ))}
      </View>

      {/* Feedback message */}
      {feedbackMessage && (
        <Animated.View
          entering={SlideInUp}
          style={[
            styles.feedbackContainer,
            feedbackMessage.correct ? styles.feedbackCorrect : styles.feedbackWrong,
          ]}
        >
          <Animated.Text style={styles.feedbackText}>{feedbackMessage.message}</Animated.Text>
        </Animated.View>
      )}

      {/* Achievement popup */}
      <AchievementPopup
        isVisible={showAchievement}
        title="Perfect Score!"
        description="You answered all questions correctly!"
        icon="🏆"
        xpReward={PERFECT_BONUS}
        onDismiss={() => setShowAchievement(false)}
      />
    </View>
  );
}

// Option Button Component
function OptionButton({
  option,
  index,
  isSelected,
  isCorrect,
  isWrong,
  onPress,
  disabled,
}: {
  option: string;
  index: number;
  isSelected: boolean;
  isCorrect: boolean;
  isWrong: boolean;
  onPress: () => void;
  disabled: boolean;
}) {
  const scale = useSharedValue(1);
  const letters = ['A', 'B', 'C', 'D'];

  const handlePressIn = () => {
    if (!disabled) scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getBgColor = () => {
    if (isCorrect) return Colors.neonLime + '30';
    if (isWrong) return Colors.error + '30';
    if (isSelected) return Colors.neonCyan + '30';
    return Colors.surfaceDark;
  };

  const getBorderColor = () => {
    if (isCorrect) return Colors.neonLime;
    if (isWrong) return Colors.error;
    if (isSelected) return Colors.neonCyan;
    return Colors.gray600;
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.optionButton,
          { backgroundColor: getBgColor(), borderColor: getBorderColor() },
          animatedStyle,
        ]}
      >
        <View style={[styles.optionLetter, { borderColor: getBorderColor() }]}>
          <Animated.Text style={[styles.optionLetterText, { color: getBorderColor() }]}>
            {letters[index]}
          </Animated.Text>
        </View>
        <Animated.Text style={styles.optionText}>{option}</Animated.Text>
        {isCorrect && <Ionicons name="checkmark-circle" size={24} color={Colors.neonLime} />}
        {isWrong && <Ionicons name="close-circle" size={24} color={Colors.error} />}
      </Animated.View>
    </Pressable>
  );
}

// Countdown Screen
function CountdownScreen({
  challenge,
  onStart,
  onExit,
}: {
  challenge: ChallengeConfig;
  onStart: () => void;
  onExit: () => void;
}) {
  const [countdown, setCountdown] = useState(3);
  const countScale = useSharedValue(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(onStart, 500);
          return 0;
        }
        countScale.value = withSequence(
          withTiming(1.5, { duration: 200 }),
          withTiming(1, { duration: 200 })
        );
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const countStyle = useAnimatedStyle(() => ({
    transform: [{ scale: countScale.value }],
  }));

  return (
    <View style={styles.countdownContainer}>
      <Animated.Text style={styles.challengeTitle}>{challenge.title}</Animated.Text>
      <Animated.Text style={styles.challengeDesc}>{challenge.description}</Animated.Text>

      <Animated.View style={[styles.countdownNumber, countStyle]}>
        <Animated.Text style={styles.countdownText}>
          {countdown > 0 ? countdown : 'GO!'}
        </Animated.Text>
      </Animated.View>

      <View style={styles.challengeInfo}>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={20} color={Colors.neonCyan} />
          <Animated.Text style={styles.infoText}>{challenge.timeLimit}s</Animated.Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="star-outline" size={20} color={Colors.neonYellow} />
          <Animated.Text style={styles.infoText}>{challenge.baseXP} XP</Animated.Text>
        </View>
      </View>

      <Pressable style={styles.skipButton} onPress={onExit}>
        <Animated.Text style={styles.skipText}>Skip</Animated.Text>
      </Pressable>
    </View>
  );
}

// Result Screen
function ResultScreen({
  challenge,
  score,
  correctAnswers,
  totalSteps,
  maxStreak,
  timeRemaining,
  onReplay,
  onExit,
}: {
  challenge: ChallengeConfig;
  score: number;
  correctAnswers: number;
  totalSteps: number;
  maxStreak: number;
  timeRemaining: number;
  onReplay: () => void;
  onExit: () => void;
}) {
  const accuracy = Math.round((correctAnswers / totalSteps) * 100);
  const isPerfect = correctAnswers === totalSteps;

  return (
    <View style={styles.resultContainer}>
      <Animated.View entering={FadeInDown.delay(200)} style={styles.resultHeader}>
        <Animated.Text style={styles.resultTitle}>
          {isPerfect ? '🏆 Perfect!' : accuracy >= 70 ? '⭐ Great Job!' : '💪 Keep Trying!'}
        </Animated.Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400)} style={styles.scoreCard}>
        <Animated.Text style={styles.finalScore}>{score}</Animated.Text>
        <Animated.Text style={styles.scoreLabel}>POINTS</Animated.Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(600)} style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Animated.Text style={styles.statValue}>{accuracy}%</Animated.Text>
          <Animated.Text style={styles.statLabel}>Accuracy</Animated.Text>
        </View>
        <View style={styles.statItem}>
          <Animated.Text style={styles.statValue}>{correctAnswers}/{totalSteps}</Animated.Text>
          <Animated.Text style={styles.statLabel}>Correct</Animated.Text>
        </View>
        <View style={styles.statItem}>
          <Animated.Text style={styles.statValue}>{maxStreak}x</Animated.Text>
          <Animated.Text style={styles.statLabel}>Best Streak</Animated.Text>
        </View>
        <View style={styles.statItem}>
          <Animated.Text style={styles.statValue}>{timeRemaining}s</Animated.Text>
          <Animated.Text style={styles.statLabel}>Time Left</Animated.Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(800)} style={styles.buttonRow}>
        <Pressable style={styles.replayButton} onPress={onReplay}>
          <Ionicons name="refresh" size={20} color={Colors.textPrimary} />
          <Animated.Text style={styles.replayText}>Replay</Animated.Text>
        </Pressable>
        <Pressable style={styles.doneButton} onPress={onExit}>
          <Animated.Text style={styles.doneText}>Done</Animated.Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.background} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  exitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceDark,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: 6,
  },
  timerText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceDark,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: 6,
  },
  scoreText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.neonYellow,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.gray700,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.neonCyan,
    borderRadius: 3,
  },
  progressText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  streakBadge: {
    alignSelf: 'center',
    backgroundColor: Colors.neonOrange + '30',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.neonOrange,
    marginBottom: Spacing.md,
  },
  streakText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.neonOrange,
  },
  questionContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.neonBorderCyan,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    ...Shadows.medium,
  },
  questionText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 26,
  },
  optionsContainer: {
    gap: Spacing.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceDark,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.gray600,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLetterText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  optionText: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  feedbackContainer: {
    position: 'absolute',
    bottom: 40,
    left: Spacing.lg,
    right: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  feedbackCorrect: {
    backgroundColor: Colors.neonLime + '30',
    borderWidth: 1,
    borderColor: Colors.neonLime,
  },
  feedbackWrong: {
    backgroundColor: Colors.error + '30',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  feedbackText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  // Countdown Screen
  countdownContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  challengeTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  challengeDesc: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxxl,
    textAlign: 'center',
  },
  countdownNumber: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.neonCyan + '20',
    borderWidth: 4,
    borderColor: Colors.neonCyan,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  countdownText: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.neonCyan,
  },
  challengeInfo: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  infoText: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  skipButton: {
    position: 'absolute',
    bottom: 40,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  skipText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  // Result Screen
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  resultHeader: {
    marginBottom: Spacing.xl,
  },
  resultTitle: {
    fontSize: FontSizes.title,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  scoreCard: {
    backgroundColor: Colors.neonCyan + '20',
    borderRadius: BorderRadius.xxl,
    borderWidth: 2,
    borderColor: Colors.neonCyan,
    padding: Spacing.xxl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    minWidth: 160,
  },
  finalScore: {
    fontSize: 56,
    fontWeight: '800',
    color: Colors.neonCyan,
  },
  scoreLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.xxl,
    width: '100%',
  },
  statItem: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    minWidth: (SCREEN_WIDTH - 80) / 2 - Spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  replayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceDark,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.gray600,
  },
  replayText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.neonCyan,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  doneText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.background,
  },
});

// Export challenge configuration helper
export function createSortingChallenge(difficulty: 'easy' | 'medium' | 'hard'): { config: ChallengeConfig; steps: ChallengeStep[] } {
  const configs: Record<string, { time: number; xp: number }> = {
    easy: { time: 120, xp: 50 },
    medium: { time: 90, xp: 100 },
    hard: { time: 60, xp: 200 },
  };

  const { time, xp } = configs[difficulty];

  const config: ChallengeConfig = {
    id: `sorting-${difficulty}-${Date.now()}`,
    type: 'sorting-steps',
    title: 'Sorting Challenge',
    description: 'Predict the next step in the sorting algorithm',
    timeLimit: time,
    baseXP: xp,
    difficulty,
  };

  // Example steps - these would be dynamically generated based on algorithm
  const steps: ChallengeStep[] = [
    {
      id: '1',
      prompt: 'In Bubble Sort, after comparing [5, 3], what happens?',
      options: ['Swap them', 'Leave them', 'Move to next pair', 'Start over'],
      correctAnswer: 0,
      explanation: 'Since 5 > 3, we swap them to get [3, 5]',
    },
    {
      id: '2',
      prompt: 'What is the time complexity of Bubble Sort?',
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(1)'],
      correctAnswer: 2,
      explanation: 'Bubble Sort has O(n²) time complexity due to nested loops',
    },
    {
      id: '3',
      prompt: 'Which sorting algorithm uses a pivot element?',
      options: ['Bubble Sort', 'Merge Sort', 'Quick Sort', 'Insertion Sort'],
      correctAnswer: 2,
      explanation: 'Quick Sort partitions the array around a pivot element',
    },
  ];

  return { config, steps };
}
