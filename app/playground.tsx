// Ultimate Algorithm Playground - Main Hub Screen
// Combines Mastery Tree, Challenges, Daily Quests, Leaderboard, and AI Coach
import React, { useState, useCallback, useEffect } from 'react';
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
import { Colors, BorderRadius, Spacing, FontSizes, Shadows } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import AlgorithmMasteryTree from '@/components/AlgorithmMasteryTree';
import DailyQuestsStreak from '@/components/DailyQuestsStreak';
import GlobalLeaderboard from '@/components/GlobalLeaderboard';
import ChallengeArena, { createSortingChallenge } from '@/components/ChallengeArena';
import AICyberCoach from '@/components/AICyberCoach';
import { VictoryConfetti, AchievementPopup, ParticleBurst, XPGainFloat } from '@/components/AnimationEffects';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type PlaygroundTab = 'mastery' | 'quests' | 'challenge' | 'leaderboard';

export default function PlaygroundScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userProgress, addXP } = useAppStore();

  // State
  const [activeTab, setActiveTab] = useState<PlaygroundTab>('mastery');
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showCoach, setShowCoach] = useState(false);
  const [challengeConfig, setChallengeConfig] = useState<ReturnType<typeof createSortingChallenge> | null>(null);

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

  // Tab navigation items
  const tabs: { key: PlaygroundTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'mastery', label: 'Mastery', icon: 'git-network' },
    { key: 'quests', label: 'Quests', icon: 'list' },
    { key: 'challenge', label: 'Arena', icon: 'flash' },
    { key: 'leaderboard', label: 'Ranks', icon: 'podium' },
  ];

  const glowStyle = useAnimatedStyle(() => ({
    opacity: headerGlow.value,
  }));

  const coachButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: coachPulse.value }],
  }));

  const renderContent = () => {
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
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown} style={styles.header}>
        <Animated.View style={[styles.headerGlow, glowStyle]} />
        <View style={styles.headerContent}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Animated.Text style={styles.headerTitle}>Algorithm Playground</Animated.Text>
            <Animated.Text style={styles.headerSubtitle}>
              Level {userProgress.level} • {userProgress.totalXP.toLocaleString()} XP
            </Animated.Text>
          </View>
          <Pressable
            style={styles.coachButton}
            onPress={() => {
              setShowCoach(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
          >
            <Animated.View style={coachButtonStyle}>
              <LinearGradient
                colors={[Colors.neonCyan, Colors.neonPurple]}
                style={styles.coachButtonGradient}
              >
                <Ionicons name="chatbubble-ellipses" size={20} color={Colors.background} />
              </LinearGradient>
            </Animated.View>
          </Pressable>
        </View>
      </Animated.View>

      {/* Tab Navigation */}
      <Animated.View entering={FadeInDown.delay(100)} style={styles.tabBar}>
        {tabs.map((tab, index) => (
          <TabButton
            key={tab.key}
            tab={tab}
            isActive={activeTab === tab.key}
            onPress={() => {
              setActiveTab(tab.key);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            index={index}
          />
        ))}
      </Animated.View>

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

// Tab Button Component
function TabButton({
  tab,
  isActive,
  onPress,
  index,
}: {
  tab: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap };
  isActive: boolean;
  onPress: () => void;
  index: number;
}) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInRight.delay(index * 50)}>
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View style={[styles.tab, isActive && styles.tabActive, animatedStyle]}>
          <Ionicons
            name={tab.icon}
            size={20}
            color={isActive ? Colors.neonCyan : Colors.gray500}
          />
          <Animated.Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
            {tab.label}
          </Animated.Text>
          {isActive && <View style={styles.tabIndicator} />}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

// Challenge Selector Component
function ChallengeSelector({
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    position: 'relative',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: Colors.neonCyan,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.neonCyan,
    marginTop: 2,
  },
  coachButton: {
    width: 44,
    height: 44,
  },
  coachButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray700,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    gap: 6,
    borderRadius: BorderRadius.lg,
    marginHorizontal: 4,
    position: 'relative',
  },
  tabActive: {
    backgroundColor: Colors.neonCyan + '15',
  },
  tabLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.gray500,
  },
  tabLabelActive: {
    color: Colors.neonCyan,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 2,
    backgroundColor: Colors.neonCyan,
    borderRadius: 1,
  },
  content: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Challenge Selector
  challengeContainer: {
    flex: 1,
  },
  challengeContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  challengeHeader: {
    marginBottom: Spacing.xl,
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
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    position: 'relative',
    overflow: 'hidden',
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
    marginRight: Spacing.md,
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
    marginTop: Spacing.lg,
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
    padding: Spacing.lg,
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
