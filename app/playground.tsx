// Ultimate Algorithm Playground - Main Hub Screen
// Combines Mastery Tree, Challenges, Daily Quests, Leaderboard, and AI Coach
// Security & Performance Optimized with MMKV, Lifecycle Cleanup, and Skeleton Loaders
import React, { useState, useCallback, useEffect, memo, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Dimensions, Modal } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInRight,
  SlideInUp,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Spacing, FontSizes, Shadows, SafetyPadding, HeaderTheme } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import AlgorithmMasteryTree from '@/components/AlgorithmMasteryTree';
import DailyQuestsStreak from '@/components/DailyQuestsStreak';
import GlobalLeaderboard from '@/components/GlobalLeaderboard';
import ChallengeArena, { createSortingChallenge } from '@/components/ChallengeArena';
import AICyberCoach from '@/components/AICyberCoach';
import { VictoryConfetti, AchievementPopup, ParticleBurst, XPGainFloat } from '@/components/AnimationEffects';
import { MidnightHeader, MidnightTabBar } from '@/components/MidnightHeader';
import { SkeletonPlayground, SkeletonMasteryTree, SkeletonChallengeCard } from '@/components/SkeletonLoader';
import { useLifecycleManager, useAppStateLifecycle } from '@/hooks/useLifecycleCleanup';
import { performSecurityHandshake, securelyPersistProgress } from '@/lib/security';
import { UserDataStorage } from '@/lib/secureStorage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type PlaygroundTab = 'mastery' | 'quests' | 'challenge' | 'leaderboard';

export default function PlaygroundScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userProgress, addXP } = useAppStore();

  // Lifecycle management for memory leak prevention
  const { timers, subscriptions, cleanupAll } = useLifecycleManager();

  // State
  const [activeTab, setActiveTab] = useState<PlaygroundTab>('mastery');
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showCoach, setShowCoach] = useState(false);
  const [challengeConfig, setChallengeConfig] = useState<ReturnType<typeof createSortingChallenge> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [securityVerified, setSecurityVerified] = useState(false);

  // Animation states
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementData, setAchievementData] = useState({ title: '', description: '', xp: 0 });
  const [xpGain, setXPGain] = useState<{ amount: number; x: number; y: number; visible: boolean }>({
    amount: 0,
    x: 0,
    y: 0,
    visible: false,
  });

  // Animation values
  const headerGlow = useSharedValue(0.3);
  const coachPulse = useSharedValue(1);

  // Security handshake and data loading on mount
  useEffect(() => {
    const initializeScreen = async () => {
      try {
        // Perform security handshake
        const securityResult = await performSecurityHandshake();
        setSecurityVerified(securityResult.isValid);

        if (!securityResult.isValid) {
          console.warn('[Playground] Security issues detected:', securityResult.issues);
        }

        // Load persisted data from MMKV
        const storedXP = UserDataStorage.getXP();
        const storedLevel = UserDataStorage.getLevel();
        const storedStreak = UserDataStorage.getStreak();

        // Simulate minimum loading time for smooth transition
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('[Playground] Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeScreen();

    // Cleanup on unmount
    return () => {
      cleanupAll();
    };
  }, [cleanupAll]);

  // App state lifecycle handling (pause/resume)
  useAppStateLifecycle({
    onForeground: () => {
      // Resume animations and refresh data
      console.log('[Playground] App returned to foreground');
    },
    onBackground: () => {
      // Persist current state to MMKV
      securelyPersistProgress({
        xp: userProgress.totalXP,
        level: userProgress.level,
        completedAlgorithms: userProgress.completedAlgorithms,
      });
    },
  });

  useEffect(() => {
    headerGlow.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    coachPulse.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  // Handle algorithm selection from mastery tree
  const handleAlgorithmSelect = useCallback((algorithmId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/visualizer/${algorithmId}` as any);
  }, [router]);

  // Handle quest completion
  const handleQuestComplete = useCallback((quest: any) => {
    setAchievementData({
      title: 'Quest Complete!',
      description: quest.title,
      xp: quest.xpReward,
    });
    setShowAchievement(true);
    setXPGain({
      amount: quest.xpReward,
      x: SCREEN_WIDTH / 2,
      y: SCREEN_HEIGHT / 3,
      visible: true,
    });
  }, []);

  // Start challenge
  const startChallenge = useCallback((difficulty: 'easy' | 'medium' | 'hard') => {
    const challenge = createSortingChallenge(difficulty);
    setChallengeConfig(challenge);
    setShowChallengeModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, []);

  // Handle challenge complete
  const handleChallengeComplete = useCallback((result: any) => {
    if (result.accuracy >= 80) {
      setShowConfetti(true);
      setAchievementData({
        title: result.accuracy === 100 ? 'Perfect Score!' : 'Challenge Complete!',
        description: `Accuracy: ${result.accuracy}% | Streak: ${result.correctAnswers}`,
        xp: result.totalXP,
      });
      setShowAchievement(true);
    }
    addXP(result.totalXP);
  }, [addXP]);

  // Tab navigation items - memoized for performance
  const tabs = useMemo(() => [
    { key: 'mastery', label: 'Mastery', icon: 'git-network' as const },
    { key: 'quests', label: 'Quests', icon: 'list' as const },
    { key: 'challenge', label: 'Arena', icon: 'flash' as const },
    { key: 'leaderboard', label: 'Ranks', icon: 'podium' as const },
  ], []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: headerGlow.value,
  }));

  const coachButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: coachPulse.value }],
  }));

  // Memoized content renderer to prevent re-renders
  const renderContent = useCallback(() => {
    if (isLoading) {
      return <SkeletonMasteryTree />;
    }

    switch (activeTab) {
      case 'mastery':
        return <AlgorithmMasteryTree onSelectAlgorithm={handleAlgorithmSelect} />;
      case 'quests':
        return (
          <DailyQuestsStreak
            onQuestComplete={handleQuestComplete}
          />
        );
      case 'challenge':
        return <ChallengeSelector onStartChallenge={startChallenge} />;
      case 'leaderboard':
        return <GlobalLeaderboard />;
      default:
        return null;
    }
  }, [activeTab, isLoading, handleAlgorithmSelect, handleQuestComplete, startChallenge]);

  // Show skeleton loader during initial load
  if (isLoading) {
    return <SkeletonPlayground />;
  }

  return (
    <View style={styles.container}>
      {/* Translucent Midnight Black Header with Neon Border */}
      <MidnightHeader
        title="Algorithm Playground"
        subtitle={`Level ${userProgress.level} • ${userProgress.totalXP.toLocaleString()} XP`}
        onBack={() => router.back()}
        onAction={() => {
          setShowCoach(true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
        actionIcon="terminal"
        statusText={securityVerified ? 'SECURE' : 'VERIFY'}
        statusType={securityVerified ? 'success' : 'warning'}
      >
        {/* Tab Navigation integrated into header */}
        <MidnightTabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(key) => {
            setActiveTab(key as PlaygroundTab);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        />
      </MidnightHeader>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Challenge Modal */}
      <Modal
        visible={showChallengeModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        {challengeConfig && (
          <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
            <ChallengeArena
              challenge={challengeConfig.config}
              steps={challengeConfig.steps}
              onComplete={(result) => {
                handleChallengeComplete(result);
                setTimeout(() => setShowChallengeModal(false), 2000);
              }}
              onExit={() => setShowChallengeModal(false)}
            />
          </View>
        )}
      </Modal>

      {/* AI Coach */}
      {showCoach && (
        <AICyberCoach
          mode="tutor"
          algorithmContext={{
            algorithm: 'General',
            currentStep: 0,
            totalSteps: 0,
            currentState: '',
            userProgress: (userProgress.completedAlgorithms.length / 15) * 100,
          }}
          onClose={() => setShowCoach(false)}
        />
      )}

      {/* Celebration Effects */}
      <VictoryConfetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />
      <AchievementPopup
        isVisible={showAchievement}
        title={achievementData.title}
        description={achievementData.description}
        xpReward={achievementData.xp}
        onDismiss={() => setShowAchievement(false)}
      />
      <XPGainFloat
        amount={xpGain.amount}
        x={xpGain.x}
        y={xpGain.y}
        isVisible={xpGain.visible}
        onComplete={() => setXPGain((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

// Challenge Selector Component - Memoized for performance
const ChallengeSelector = memo(function ChallengeSelector({
  onStartChallenge,
}: {
  onStartChallenge: (difficulty: 'easy' | 'medium' | 'hard') => void;
}) {
  const challenges = [
    {
      difficulty: 'easy' as const,
      title: 'Rookie Arena',
      description: 'Perfect for beginners',
      time: '120s',
      xp: '50-100 XP',
      color: Colors.neonLime,
      icon: 'leaf' as const,
    },
    {
      difficulty: 'medium' as const,
      title: 'Warrior Arena',
      description: 'Test your skills',
      time: '90s',
      xp: '100-200 XP',
      color: Colors.neonYellow,
      icon: 'flash' as const,
    },
    {
      difficulty: 'hard' as const,
      title: 'Champion Arena',
      description: 'Only for the brave',
      time: '60s',
      xp: '200-400 XP',
      color: Colors.neonPink,
      icon: 'skull' as const,
    },
  ];

  return (
    <ScrollView
      style={styles.challengeContainer}
      contentContainerStyle={styles.challengeContent}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown} style={styles.challengeHeader}>
        <Animated.Text style={styles.challengeTitle}>⚔️ Challenge Arena</Animated.Text>
        <Animated.Text style={styles.challengeSubtitle}>
          Test your algorithm knowledge under pressure
        </Animated.Text>
      </Animated.View>

      {challenges.map((challenge, index) => (
        <Animated.View key={challenge.difficulty} entering={FadeInDown.delay(100 + index * 100)}>
          <Pressable
            style={({ pressed }) => [
              styles.challengeCard,
              { borderColor: challenge.color + '60' },
              pressed && { transform: [{ scale: 0.98 }] },
            ]}
            onPress={() => onStartChallenge(challenge.difficulty)}
          >
            <LinearGradient
              colors={[challenge.color + '20', 'transparent']}
              style={styles.challengeCardGradient}
            />
            <View style={[styles.challengeIcon, { backgroundColor: challenge.color + '30' }]}>
              <Ionicons name={challenge.icon} size={28} color={challenge.color} />
            </View>
            <View style={styles.challengeInfo}>
              <Animated.Text style={[styles.challengeCardTitle, { color: challenge.color }]}>
                {challenge.title}
              </Animated.Text>
              <Animated.Text style={styles.challengeDesc}>{challenge.description}</Animated.Text>
              <View style={styles.challengeStats}>
                <View style={styles.challengeStat}>
                  <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                  <Animated.Text style={styles.challengeStatText}>{challenge.time}</Animated.Text>
                </View>
                <View style={styles.challengeStat}>
                  <Ionicons name="star" size={14} color={Colors.neonYellow} />
                  <Animated.Text style={styles.challengeStatText}>{challenge.xp}</Animated.Text>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={challenge.color} />
          </Pressable>
        </Animated.View>
      ))}

      {/* Daily Challenge */}
      <Animated.View entering={FadeInDown.delay(400)} style={styles.dailyChallenge}>
        <LinearGradient
          colors={[Colors.neonPurple + '30', Colors.neonCyan + '20']}
          style={styles.dailyChallengeGradient}
        />
        <View style={styles.dailyChallengeContent}>
          <Animated.Text style={styles.dailyChallengeLabel}>🎯 Daily Challenge</Animated.Text>
          <Animated.Text style={styles.dailyChallengeTitle}>
            Sorting Showdown
          </Animated.Text>
          <Animated.Text style={styles.dailyChallengeDesc}>
            Complete all sorting challenges for bonus XP
          </Animated.Text>
          <Pressable style={styles.dailyChallengeButton}>
            <Animated.Text style={styles.dailyChallengeButtonText}>Coming Soon</Animated.Text>
          </Pressable>
        </View>
      </Animated.View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Challenge Selector - Safety Padding System
  challengeContainer: {
    flex: 1,
  },
  challengeContent: {
    padding: SafetyPadding.section,
    paddingBottom: 100,
    gap: SafetyPadding.minimum,
  },
  challengeHeader: {
    marginBottom: SafetyPadding.section,
  },
  challengeTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  challengeSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: SafetyPadding.card,
    marginBottom: SafetyPadding.minimum,
    position: 'relative',
    overflow: 'hidden',
    gap: SafetyPadding.minimum,
  },
  challengeCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  challengeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeInfo: {
    flex: 1,
  },
  challengeCardTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: 2,
  },
  challengeDesc: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  challengeStats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  challengeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  challengeStatText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  dailyChallenge: {
    marginTop: SafetyPadding.section,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.neonPurple + '40',
  },
  dailyChallengeGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dailyChallengeContent: {
    padding: SafetyPadding.card,
  },
  dailyChallengeLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.neonPurple,
    marginBottom: Spacing.xs,
  },
  dailyChallengeTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  dailyChallengeDesc: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  dailyChallengeButton: {
    backgroundColor: Colors.neonPurple + '30',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.neonPurple,
  },
  dailyChallengeButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.neonPurple,
  },
});
