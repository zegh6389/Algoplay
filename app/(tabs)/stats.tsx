import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  index: number;
}

function StatCard({ title, value, subtitle, icon, color, index }: StatCardProps) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()} style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </Animated.View>
  );
}

interface ProgressBarProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}

function ProgressBar({ label, value, maxValue, color }: ProgressBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressBarHeader}>
        <Text style={styles.progressBarLabel}>{label}</Text>
        <Text style={styles.progressBarValue}>{value}/{maxValue}</Text>
      </View>
      <View style={styles.progressBarTrack}>
        <Animated.View
          style={[
            styles.progressBarFill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

function CategoryProgress() {
  const { completedAlgorithms, skillNodes } = useAppStore((state) => state.userProgress);

  const categories = [
    { id: 'sorting', name: 'Sorting', color: Colors.alertCoral, total: 5 },
    { id: 'searching', name: 'Searching', color: Colors.actionTeal, total: 2 },
    { id: 'graphs', name: 'Graphs', color: Colors.logicGold, total: 4 },
    { id: 'dynamic-programming', name: 'Dynamic Programming', color: Colors.info, total: 2 },
    { id: 'greedy', name: 'Greedy', color: Colors.success, total: 2 },
  ];

  return (
    <Animated.View entering={FadeInDown.delay(300)} style={styles.categoryProgressSection}>
      <Text style={styles.sectionTitle}>Category Progress</Text>
      <View style={styles.categoryProgressContainer}>
        {categories.map((category) => {
          const completed = skillNodes.filter(
            (node) => node.category === category.id && node.isCompleted
          ).length;

          return (
            <ProgressBar
              key={category.id}
              label={category.name}
              value={completed}
              maxValue={category.total}
              color={category.color}
            />
          );
        })}
      </View>
    </Animated.View>
  );
}

function XPProgressCard() {
  const { level, totalXP } = useAppStore((state) => state.userProgress);
  const xpForNextLevel = level * 500;
  const currentLevelXP = totalXP - (level - 1) * 500;
  const progress = (currentLevelXP / 500) * 100;

  return (
    <Animated.View entering={FadeInDown.delay(200)} style={styles.xpCard}>
      <View style={styles.xpHeader}>
        <View style={styles.xpLevelBadge}>
          <Text style={styles.xpLevelText}>Level {level}</Text>
        </View>
        <Text style={styles.xpTotal}>{totalXP} XP Total</Text>
      </View>
      <View style={styles.xpProgressContainer}>
        <View style={styles.xpProgressTrack}>
          <Animated.View
            style={[styles.xpProgressFill, { width: `${progress}%` }]}
          />
        </View>
        <Text style={styles.xpProgressText}>
          {currentLevelXP} / 500 XP to Level {level + 1}
        </Text>
      </View>
    </Animated.View>
  );
}

function ActivityChart() {
  // Mock activity data for the last 7 days
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const activity = [3, 5, 2, 7, 4, 8, 6]; // Number of algorithms practiced
  const maxActivity = Math.max(...activity);

  return (
    <Animated.View entering={FadeInDown.delay(400)} style={styles.activitySection}>
      <Text style={styles.sectionTitle}>Weekly Activity</Text>
      <View style={styles.activityChart}>
        {days.map((day, index) => {
          const height = (activity[index] / maxActivity) * 100;
          return (
            <View key={day} style={styles.activityBarContainer}>
              <View style={styles.activityBarWrapper}>
                <Animated.View
                  style={[
                    styles.activityBar,
                    { height: `${height}%` },
                  ]}
                />
              </View>
              <Text style={styles.activityDayLabel}>{day}</Text>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}

function AchievementsList() {
  const { completedAlgorithms, currentStreak, totalXP } = useAppStore((state) => state.userProgress);

  const achievements = [
    {
      id: 'first-sort',
      title: 'First Sort',
      description: 'Complete your first sorting algorithm',
      icon: 'ribbon' as const,
      isUnlocked: completedAlgorithms.some((a) => a.includes('sort')),
      color: Colors.alertCoral,
    },
    {
      id: 'streak-3',
      title: 'On Fire!',
      description: 'Maintain a 3-day streak',
      icon: 'flame' as const,
      isUnlocked: currentStreak >= 3,
      color: Colors.logicGold,
    },
    {
      id: 'xp-1000',
      title: 'XP Hunter',
      description: 'Earn 1000 XP',
      icon: 'star' as const,
      isUnlocked: totalXP >= 1000,
      color: Colors.actionTeal,
    },
    {
      id: 'pathfinder',
      title: 'Pathfinder',
      description: 'Complete a pathfinding algorithm',
      icon: 'navigate' as const,
      isUnlocked: completedAlgorithms.some((a) => ['bfs', 'dfs', 'dijkstra', 'astar'].includes(a)),
      color: Colors.info,
    },
  ];

  return (
    <Animated.View entering={FadeInDown.delay(500)} style={styles.achievementsSection}>
      <Text style={styles.sectionTitle}>Achievements</Text>
      <View style={styles.achievementsContainer}>
        {achievements.map((achievement) => (
          <View
            key={achievement.id}
            style={[
              styles.achievementCard,
              !achievement.isUnlocked && styles.achievementCardLocked,
            ]}
          >
            <View
              style={[
                styles.achievementIcon,
                { backgroundColor: achievement.isUnlocked ? achievement.color + '20' : Colors.gray700 },
              ]}
            >
              <Ionicons
                name={achievement.icon}
                size={24}
                color={achievement.isUnlocked ? achievement.color : Colors.gray500}
              />
            </View>
            <Text
              style={[
                styles.achievementTitle,
                !achievement.isUnlocked && styles.achievementTitleLocked,
              ]}
            >
              {achievement.title}
            </Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { userProgress, gameState } = useAppStore();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(0)} style={styles.header}>
        <Text style={styles.title}>Stats</Text>
        <Text style={styles.subtitle}>Track your learning journey</Text>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Overview Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total XP"
            value={userProgress.totalXP}
            icon="flash"
            color={Colors.logicGold}
            index={0}
          />
          <StatCard
            title="Algorithms"
            value={userProgress.completedAlgorithms.length}
            subtitle="Completed"
            icon="checkmark-circle"
            color={Colors.success}
            index={1}
          />
          <StatCard
            title="Current Streak"
            value={`${userProgress.currentStreak} days`}
            icon="flame"
            color={Colors.alertCoral}
            index={2}
          />
          <StatCard
            title="Games Played"
            value={gameState.highScores.gridEscapeWins + (gameState.highScores.sorterBest > 0 ? 1 : 0)}
            icon="game-controller"
            color={Colors.actionTeal}
            index={3}
          />
        </View>

        {/* XP Progress */}
        <XPProgressCard />

        {/* Category Progress */}
        <CategoryProgress />

        {/* Weekly Activity */}
        <ActivityChart />

        {/* Achievements */}
        <AchievementsList />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.midnightBlue,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: FontSizes.title,
    fontWeight: '700',
    color: Colors.white,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.gray400,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  statCard: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm) / 2,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    margin: Spacing.xs,
    ...Shadows.small,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
    marginBottom: 2,
  },
  statValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.white,
  },
  statSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  xpCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    ...Shadows.small,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  xpLevelBadge: {
    backgroundColor: Colors.actionTeal,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  xpLevelText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.midnightBlue,
  },
  xpTotal: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
  },
  xpProgressContainer: {
    gap: Spacing.sm,
  },
  xpProgressTrack: {
    height: 8,
    backgroundColor: Colors.gray700,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  xpProgressFill: {
    height: '100%',
    backgroundColor: Colors.actionTeal,
    borderRadius: BorderRadius.full,
  },
  xpProgressText: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
    textAlign: 'center',
  },
  categoryProgressSection: {
    marginTop: Spacing.lg,
  },
  categoryProgressContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  progressBarContainer: {
    marginBottom: Spacing.md,
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  progressBarLabel: {
    fontSize: FontSizes.sm,
    color: Colors.gray300,
  },
  progressBarValue: {
    fontSize: FontSizes.sm,
    color: Colors.gray500,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: Colors.gray700,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  activitySection: {
    marginTop: Spacing.lg,
  },
  activityChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  activityBarContainer: {
    flex: 1,
    alignItems: 'center',
  },
  activityBarWrapper: {
    width: 24,
    height: 80,
    backgroundColor: Colors.gray700,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  activityBar: {
    width: '100%',
    backgroundColor: Colors.actionTeal,
    borderRadius: BorderRadius.sm,
  },
  activityDayLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    marginTop: Spacing.xs,
  },
  achievementsSection: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  achievementCard: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md) / 2,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    margin: Spacing.xs,
    alignItems: 'center',
    ...Shadows.small,
  },
  achievementCardLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  achievementTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
  },
  achievementTitleLocked: {
    color: Colors.gray500,
  },
});
