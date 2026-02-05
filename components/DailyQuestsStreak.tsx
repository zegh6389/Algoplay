// Daily Quests & Streak System - Habit Formation Module
// Features daily tasks, streak tracking with visual feedback, and Supabase sync
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, Pressable, RefreshControl } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
  FadeInDown,
  FadeInRight,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { createClient } from '@supabase/supabase-js';
import { Colors, BorderRadius, Spacing, FontSizes, Shadows } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import { NeonPulse } from './AnimationEffects';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Quest Types
interface Quest {
  id: string;
  type: 'algorithm' | 'challenge' | 'practice' | 'streak';
  title: string;
  description: string;
  target: string; // e.g., 'bfs', 'any-sort', 'challenge'
  targetCount: number;
  currentCount: number;
  xpReward: number;
  isCompleted: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  weeklyActivity: boolean[]; // Last 7 days
  totalXPFromStreaks: number;
}

// Quest templates for daily generation
const QUEST_TEMPLATES: Omit<Quest, 'id' | 'currentCount' | 'isCompleted'>[] = [
  {
    type: 'algorithm',
    title: 'Graph Explorer',
    description: 'Complete a BFS visualization',
    target: 'bfs',
    targetCount: 1,
    xpReward: 50,
    icon: 'git-network',
    difficulty: 'easy',
  },
  {
    type: 'algorithm',
    title: 'Deep Dive',
    description: 'Complete a DFS visualization',
    target: 'dfs',
    targetCount: 1,
    xpReward: 50,
    icon: 'git-branch',
    difficulty: 'easy',
  },
  {
    type: 'algorithm',
    title: 'Sort Master',
    description: 'Complete any sorting algorithm',
    target: 'any-sort',
    targetCount: 2,
    xpReward: 75,
    icon: 'bar-chart',
    difficulty: 'medium',
  },
  {
    type: 'challenge',
    title: 'Challenge Accepted',
    description: 'Complete a challenge with 80%+ accuracy',
    target: 'challenge',
    targetCount: 1,
    xpReward: 100,
    icon: 'trophy',
    difficulty: 'medium',
  },
  {
    type: 'practice',
    title: 'Practice Makes Perfect',
    description: 'Complete 3 algorithm visualizations',
    target: 'any',
    targetCount: 3,
    xpReward: 60,
    icon: 'repeat',
    difficulty: 'easy',
  },
  {
    type: 'algorithm',
    title: 'Tree Climber',
    description: 'Complete a BST operation',
    target: 'bst',
    targetCount: 1,
    xpReward: 75,
    icon: 'leaf',
    difficulty: 'medium',
  },
  {
    type: 'challenge',
    title: 'Perfectionist',
    description: 'Get a perfect score in any challenge',
    target: 'perfect-challenge',
    targetCount: 1,
    xpReward: 150,
    icon: 'star',
    difficulty: 'hard',
  },
  {
    type: 'streak',
    title: 'Consistent Coder',
    description: 'Maintain your daily streak',
    target: 'streak',
    targetCount: 1,
    xpReward: 25,
    icon: 'flame',
    difficulty: 'easy',
  },
];

// Streak milestone rewards
const STREAK_MILESTONES: { days: number; bonus: number; badge: string }[] = [
  { days: 3, bonus: 50, badge: '🔥' },
  { days: 7, bonus: 150, badge: '⭐' },
  { days: 14, bonus: 300, badge: '💎' },
  { days: 30, bonus: 500, badge: '👑' },
  { days: 60, bonus: 1000, badge: '🏆' },
  { days: 100, bonus: 2000, badge: '🌟' },
];

interface DailyQuestsStreakProps {
  userId?: string;
  onQuestComplete?: (quest: Quest) => void;
  onStreakUpdate?: (streak: StreakData) => void;
}

export default function DailyQuestsStreak({
  userId,
  onQuestComplete,
  onStreakUpdate,
}: DailyQuestsStreakProps) {
  const { userProgress, addXP, updateStreak: storeUpdateStreak } = useAppStore();

  const [quests, setQuests] = useState<Quest[]>([]);
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: userProgress.currentStreak,
    longestStreak: 0,
    lastActiveDate: userProgress.lastPlayedDate,
    weeklyActivity: [false, false, false, false, false, false, false],
    totalXPFromStreaks: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Generate daily quests
  const generateDailyQuests = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    let seedVal = today.split('-').reduce((a, b) => a + parseInt(b), 0);

    // Select 3-4 random quests based on day seed
    const shuffled = [...QUEST_TEMPLATES].sort(() => {
      const x = Math.sin(seedVal++) * 10000;
      return x - Math.floor(x) - 0.5;
    });

    const selectedQuests = shuffled.slice(0, 4).map((template, index) => ({
      ...template,
      id: `quest-${today}-${index}`,
      currentCount: 0,
      isCompleted: false,
    }));

    return selectedQuests;
  }, []);

  // Load quests and streak data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    const today = new Date().toISOString().split('T')[0];

    try {
      if (userId) {
        // Load from Supabase
        const { data: questsData } = await supabase
          .from('daily_quests')
          .select('*')
          .eq('user_id', userId)
          .eq('quest_date', today);

        if (questsData && questsData.length > 0) {
          // Use existing quests
          setQuests(
            questsData.map((q: any) => ({
              id: q.id,
              type: q.quest_type,
              title: QUEST_TEMPLATES.find((t) => t.target === q.quest_target)?.title || 'Quest',
              description: QUEST_TEMPLATES.find((t) => t.target === q.quest_target)?.description || '',
              target: q.quest_target,
              targetCount: q.target_count,
              currentCount: q.current_count,
              xpReward: q.xp_reward,
              isCompleted: q.is_completed,
              icon: QUEST_TEMPLATES.find((t) => t.target === q.quest_target)?.icon || 'help-circle',
              difficulty: QUEST_TEMPLATES.find((t) => t.target === q.quest_target)?.difficulty || 'easy',
            }))
          );
        } else {
          // Generate new quests for today
          const newQuests = generateDailyQuests();
          setQuests(newQuests);

          // Save to Supabase
          await Promise.all(
            newQuests.map((quest) =>
              supabase.from('daily_quests').insert({
                user_id: userId,
                quest_type: quest.type,
                quest_target: quest.target,
                target_count: quest.targetCount,
                current_count: 0,
                xp_reward: quest.xpReward,
                is_completed: false,
                quest_date: today,
              })
            )
          );
        }

        // Load streak data
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('current_streak, longest_streak, last_played_date')
          .eq('user_id', userId)
          .single();

        if (profileData) {
          // Calculate weekly activity
          const weeklyActivity = await calculateWeeklyActivity(userId);

          setStreakData({
            currentStreak: profileData.current_streak || 0,
            longestStreak: profileData.longest_streak || 0,
            lastActiveDate: profileData.last_played_date,
            weeklyActivity,
            totalXPFromStreaks: calculateStreakXP(profileData.current_streak || 0),
          });
        }
      } else {
        // Guest mode - use local state
        setQuests(generateDailyQuests());
      }
    } catch (error) {
      console.error('Error loading quest data:', error);
      // Fallback to generated quests
      setQuests(generateDailyQuests());
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [userId, generateDailyQuests]);

  // Calculate weekly activity from streak history
  const calculateWeeklyActivity = async (uid: string): Promise<boolean[]> => {
    const days: boolean[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const { data } = await supabase
        .from('streak_history')
        .select('id')
        .eq('user_id', uid)
        .eq('streak_date', dateStr)
        .single();

      days.push(!!data);
    }

    return days;
  };

  // Calculate total XP from streak bonuses
  const calculateStreakXP = (streak: number): number => {
    let total = 0;
    STREAK_MILESTONES.forEach((milestone) => {
      if (streak >= milestone.days) {
        total += milestone.bonus;
      }
    });
    return total;
  };

  // Update streak
  const updateStreak = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];

    if (streakData.lastActiveDate === today) {
      return; // Already active today
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = 1;
    if (streakData.lastActiveDate === yesterdayStr) {
      newStreak = streakData.currentStreak + 1;
    }

    const newLongest = Math.max(newStreak, streakData.longestStreak);

    // Check for milestone bonuses
    const milestone = STREAK_MILESTONES.find(
      (m) => newStreak === m.days && streakData.currentStreak < m.days
    );

    if (milestone) {
      addXP(milestone.bonus);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const newStreakData = {
      ...streakData,
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActiveDate: today,
      weeklyActivity: [...streakData.weeklyActivity.slice(1), true],
    };

    setStreakData(newStreakData);
    storeUpdateStreak();
    onStreakUpdate?.(newStreakData);

    // Sync to Supabase
    if (userId) {
      try {
        await supabase.from('user_profiles').update({
          current_streak: newStreak,
          longest_streak: newLongest,
          last_played_date: today,
        }).eq('user_id', userId);

        await supabase.from('streak_history').upsert({
          user_id: userId,
          streak_date: today,
          activities_completed: 1,
        });
      } catch (error) {
        console.error('Error updating streak:', error);
      }
    }
  }, [streakData, userId, addXP, storeUpdateStreak, onStreakUpdate]);

  // Complete a quest
  const completeQuestProgress = useCallback(
    async (questTarget: string) => {
      const quest = quests.find(
        (q) =>
          !q.isCompleted &&
          (q.target === questTarget ||
            q.target === 'any' ||
            (q.target === 'any-sort' && questTarget.includes('sort')))
      );

      if (!quest) return;

      const newCount = quest.currentCount + 1;
      const isNowCompleted = newCount >= quest.targetCount;

      // Update local state
      setQuests((prev) =>
        prev.map((q) =>
          q.id === quest.id
            ? { ...q, currentCount: newCount, isCompleted: isNowCompleted }
            : q
        )
      );

      if (isNowCompleted) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        addXP(quest.xpReward);
        onQuestComplete?.(quest);

        // Update streak
        updateStreak();
      }

      // Sync to Supabase
      if (userId) {
        try {
          await supabase
            .from('daily_quests')
            .update({
              current_count: newCount,
              is_completed: isNowCompleted,
              completed_at: isNowCompleted ? new Date().toISOString() : null,
            })
            .eq('id', quest.id);
        } catch (error) {
          console.error('Error updating quest:', error);
        }
      }
    },
    [quests, userId, addXP, onQuestComplete, updateStreak]
  );

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Next milestone
  const nextMilestone = useMemo(() => {
    return STREAK_MILESTONES.find((m) => m.days > streakData.currentStreak);
  }, [streakData.currentStreak]);

  const completedQuests = quests.filter((q) => q.isCompleted).length;
  const totalXP = quests.reduce((sum, q) => (q.isCompleted ? sum + q.xpReward : sum), 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadData();
          }}
          tintColor={Colors.neonCyan}
        />
      }
    >
      {/* Streak Section */}
      <Animated.View entering={FadeInDown.delay(100)} style={styles.streakSection}>
        <StreakDisplay
          currentStreak={streakData.currentStreak}
          longestStreak={streakData.longestStreak}
          weeklyActivity={streakData.weeklyActivity}
          nextMilestone={nextMilestone}
        />
      </Animated.View>

      {/* Quest Summary */}
      <Animated.View entering={FadeInDown.delay(200)} style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Animated.Text style={styles.summaryTitle}>Daily Quests</Animated.Text>
          <View style={styles.summaryBadge}>
            <Animated.Text style={styles.summaryBadgeText}>
              {completedQuests}/{quests.length}
            </Animated.Text>
          </View>
        </View>
        <View style={styles.summaryProgress}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(completedQuests / Math.max(quests.length, 1)) * 100}%` },
              ]}
            />
          </View>
          <Animated.Text style={styles.xpEarnedText}>+{totalXP} XP earned</Animated.Text>
        </View>
      </Animated.View>

      {/* Quest List */}
      <View style={styles.questList}>
        {quests.map((quest, index) => (
          <QuestCard key={quest.id} quest={quest} index={index} />
        ))}
      </View>

      {/* Streak Milestones */}
      <Animated.View entering={FadeInDown.delay(400)} style={styles.milestonesSection}>
        <Animated.Text style={styles.sectionTitle}>Streak Milestones</Animated.Text>
        <View style={styles.milestonesList}>
          {STREAK_MILESTONES.slice(0, 4).map((milestone, index) => (
            <MilestoneCard
              key={milestone.days}
              milestone={milestone}
              isAchieved={streakData.currentStreak >= milestone.days}
              index={index}
            />
          ))}
        </View>
      </Animated.View>
    </ScrollView>
  );
}

// Streak Display Component
function StreakDisplay({
  currentStreak,
  longestStreak,
  weeklyActivity,
  nextMilestone,
}: {
  currentStreak: number;
  longestStreak: number;
  weeklyActivity: boolean[];
  nextMilestone?: { days: number; bonus: number; badge: string };
}) {
  const fireScale = useSharedValue(1);
  const fireGlow = useSharedValue(0.3);

  useEffect(() => {
    if (currentStreak > 0) {
      fireScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      fireGlow.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 800 }),
          withTiming(0.3, { duration: 800 })
        ),
        -1,
        true
      );
    }
  }, [currentStreak]);

  const fireStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fireScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: fireGlow.value,
  }));

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date().getDay();
  const reorderedDays = [...days.slice(today - 6), ...days.slice(0, today - 6 + 1)].slice(-7);

  return (
    <View style={styles.streakCard}>
      {/* Main streak display */}
      <View style={styles.streakMain}>
        <Animated.View style={[styles.fireContainer, fireStyle]}>
          <Animated.View style={[styles.fireGlow, glowStyle]} />
          <Animated.Text style={styles.fireEmoji}>
            {currentStreak >= 30 ? '👑' : currentStreak >= 7 ? '⭐' : '🔥'}
          </Animated.Text>
        </Animated.View>
        <View style={styles.streakInfo}>
          <Animated.Text style={styles.streakCount}>{currentStreak}</Animated.Text>
          <Animated.Text style={styles.streakLabel}>Day Streak</Animated.Text>
        </View>
      </View>

      {/* Weekly activity */}
      <View style={styles.weeklyActivity}>
        {reorderedDays.map((day, index) => (
          <View key={index} style={styles.dayColumn}>
            <View
              style={[
                styles.dayDot,
                weeklyActivity[index] && styles.dayDotActive,
                index === 6 && styles.dayDotToday,
              ]}
            />
            <Animated.Text
              style={[styles.dayLabel, index === 6 && styles.dayLabelToday]}
            >
              {day}
            </Animated.Text>
          </View>
        ))}
      </View>

      {/* Next milestone progress */}
      {nextMilestone && (
        <View style={styles.nextMilestone}>
          <Animated.Text style={styles.nextMilestoneText}>
            {nextMilestone.days - currentStreak} days until {nextMilestone.badge} +{nextMilestone.bonus} XP
          </Animated.Text>
          <View style={styles.milestoneProgress}>
            <View
              style={[
                styles.milestoneProgressFill,
                { width: `${(currentStreak / nextMilestone.days) * 100}%` },
              ]}
            />
          </View>
        </View>
      )}

      {/* Longest streak */}
      <View style={styles.longestStreak}>
        <Ionicons name="trophy" size={14} color={Colors.neonYellow} />
        <Animated.Text style={styles.longestStreakText}>
          Longest: {longestStreak} days
        </Animated.Text>
      </View>
    </View>
  );
}

// Quest Card Component
function QuestCard({ quest, index }: { quest: Quest; index: number }) {
  const progress = Math.min(quest.currentCount / quest.targetCount, 1);
  const scale = useSharedValue(1);

  const handlePress = () => {
    if (!quest.isCompleted) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      scale.value = withSequence(
        withSpring(0.98, { damping: 15 }),
        withSpring(1, { damping: 10 })
      );
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const difficultyColors = {
    easy: Colors.neonLime,
    medium: Colors.neonYellow,
    hard: Colors.neonPink,
  };

  return (
    <Animated.View entering={FadeInRight.delay(index * 100)}>
      <Pressable onPress={handlePress}>
        <Animated.View
          style={[
            styles.questCard,
            quest.isCompleted && styles.questCardCompleted,
            animatedStyle,
          ]}
        >
          {/* Icon */}
          <View
            style={[
              styles.questIcon,
              { backgroundColor: difficultyColors[quest.difficulty] + '20' },
              quest.isCompleted && { backgroundColor: Colors.neonLime + '30' },
            ]}
          >
            <Ionicons
              name={quest.isCompleted ? 'checkmark' : quest.icon}
              size={20}
              color={quest.isCompleted ? Colors.neonLime : difficultyColors[quest.difficulty]}
            />
          </View>

          {/* Content */}
          <View style={styles.questContent}>
            <View style={styles.questHeader}>
              <Animated.Text
                style={[
                  styles.questTitle,
                  quest.isCompleted && styles.questTitleCompleted,
                ]}
              >
                {quest.title}
              </Animated.Text>
              <View
                style={[
                  styles.xpBadge,
                  { backgroundColor: difficultyColors[quest.difficulty] + '20' },
                ]}
              >
                <Animated.Text
                  style={[
                    styles.xpText,
                    { color: difficultyColors[quest.difficulty] },
                  ]}
                >
                  +{quest.xpReward} XP
                </Animated.Text>
              </View>
            </View>
            <Animated.Text style={styles.questDescription}>
              {quest.description}
            </Animated.Text>
            {/* Progress bar */}
            <View style={styles.questProgress}>
              <View style={styles.questProgressBar}>
                <View
                  style={[
                    styles.questProgressFill,
                    { width: `${progress * 100}%` },
                    quest.isCompleted && { backgroundColor: Colors.neonLime },
                  ]}
                />
              </View>
              <Animated.Text style={styles.questProgressText}>
                {quest.currentCount}/{quest.targetCount}
              </Animated.Text>
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

// Milestone Card Component
function MilestoneCard({
  milestone,
  isAchieved,
  index,
}: {
  milestone: { days: number; bonus: number; badge: string };
  isAchieved: boolean;
  index: number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(500 + index * 50)}
      style={[styles.milestoneCard, isAchieved && styles.milestoneCardAchieved]}
    >
      <Animated.Text style={styles.milestoneBadge}>{milestone.badge}</Animated.Text>
      <Animated.Text style={styles.milestoneDays}>{milestone.days}d</Animated.Text>
      <Animated.Text style={styles.milestoneBonus}>+{milestone.bonus}</Animated.Text>
      {isAchieved && (
        <View style={styles.achievedCheck}>
          <Ionicons name="checkmark" size={10} color={Colors.background} />
        </View>
      )}
    </Animated.View>
  );
}

// Export quest progress update function
export { DailyQuestsStreak };
export const updateQuestProgress = (target: string) => {
  // This would be called from other components when completing algorithms
  // Implementation would use a context or event system
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  streakSection: {
    marginBottom: Spacing.lg,
  },
  streakCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.neonBorderCyan,
    padding: Spacing.lg,
  },
  streakMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  fireContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  fireGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.neonOrange,
  },
  fireEmoji: {
    fontSize: 40,
  },
  streakInfo: {
    flex: 1,
  },
  streakCount: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  streakLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  weeklyActivity: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.gray700,
    marginBottom: Spacing.md,
  },
  dayColumn: {
    alignItems: 'center',
    gap: 4,
  },
  dayDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.gray700,
  },
  dayDotActive: {
    backgroundColor: Colors.neonLime,
  },
  dayDotToday: {
    borderWidth: 2,
    borderColor: Colors.neonCyan,
  },
  dayLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
  },
  dayLabelToday: {
    color: Colors.neonCyan,
    fontWeight: '600',
  },
  nextMilestone: {
    marginBottom: Spacing.sm,
  },
  nextMilestoneText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  milestoneProgress: {
    height: 4,
    backgroundColor: Colors.gray700,
    borderRadius: 2,
    overflow: 'hidden',
  },
  milestoneProgressFill: {
    height: '100%',
    backgroundColor: Colors.neonOrange,
    borderRadius: 2,
  },
  longestStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  longestStreakText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  summaryTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  summaryBadge: {
    backgroundColor: Colors.neonCyan + '30',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  summaryBadgeText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.neonCyan,
  },
  summaryProgress: {
    gap: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.gray700,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.neonCyan,
    borderRadius: 4,
  },
  xpEarnedText: {
    fontSize: FontSizes.xs,
    color: Colors.neonLime,
    fontWeight: '600',
    textAlign: 'right',
  },
  questList: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  questCard: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.gray700,
    padding: Spacing.md,
  },
  questCardCompleted: {
    borderColor: Colors.neonLime + '50',
    backgroundColor: Colors.neonLime + '08',
  },
  questIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  questContent: {
    flex: 1,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  questTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  questTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  xpBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  xpText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
  },
  questDescription: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  questProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  questProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.gray700,
    borderRadius: 2,
    overflow: 'hidden',
  },
  questProgressFill: {
    height: '100%',
    backgroundColor: Colors.neonCyan,
    borderRadius: 2,
  },
  questProgressText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    minWidth: 30,
    textAlign: 'right',
  },
  milestonesSection: {
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  milestonesList: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  milestoneCard: {
    flex: 1,
    backgroundColor: Colors.surfaceDark,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.gray700,
  },
  milestoneCardAchieved: {
    borderColor: Colors.neonLime,
    backgroundColor: Colors.neonLime + '10',
  },
  milestoneBadge: {
    fontSize: 24,
    marginBottom: 2,
  },
  milestoneDays: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  milestoneBonus: {
    fontSize: FontSizes.xs,
    color: Colors.neonLime,
    fontWeight: '600',
  },
  achievedCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.neonLime,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
