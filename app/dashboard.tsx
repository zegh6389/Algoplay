import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polygon, Circle, Line, Text as SvgText } from 'react-native-svg';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows, GlassStyles } from '@/constants/theme';
import PremiumGate from '@/components/PremiumGate';
import { useAppStore } from '@/store/useAppStore';
import { getMasteryColor, getMasteryIcon } from '@/utils/quizData';
import { useAuth } from '@/components/AuthProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mastery categories for radar chart
const MASTERY_CATEGORIES = [
  { id: 'sorting', name: 'Sorting', angle: 0, algorithms: ['bubble-sort', 'selection-sort', 'insertion-sort', 'merge-sort', 'quick-sort'] },
  { id: 'searching', name: 'Searching', angle: 72, algorithms: ['linear-search', 'binary-search'] },
  { id: 'graphs', name: 'Graphs', angle: 144, algorithms: ['bfs', 'dfs', 'dijkstra', 'astar'] },
  { id: 'dp', name: 'DP', angle: 216, algorithms: ['fibonacci', 'knapsack'] },
  { id: 'greedy', name: 'Greedy', angle: 288, algorithms: ['activity-selection'] },
];

// Radar Chart Component
function MasteryRadarChart({ categoryScores }: { categoryScores: number[] }) {
  const size = SCREEN_WIDTH - Spacing.lg * 4;
  const center = size / 2;
  const maxRadius = size / 2 - 30;

  const glow = useSharedValue(0.6);

  React.useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0.6, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  // Calculate points for the radar polygon
  const points = categoryScores.map((score, i) => {
    const angle = (i * 72 - 90) * (Math.PI / 180);
    const radius = (score / 100) * maxRadius;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  });

  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Grid circles
  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <View style={styles.radarContainer}>
      <Svg width={size} height={size}>
        {/* Grid circles */}
        {gridLevels.map((level, i) => (
          <Circle
            key={i}
            cx={center}
            cy={center}
            r={maxRadius * level}
            fill="none"
            stroke={Colors.gray700}
            strokeWidth={1}
            strokeDasharray={i < 3 ? '4,4' : '0'}
          />
        ))}

        {/* Grid lines */}
        {MASTERY_CATEGORIES.map((_, i) => {
          const angle = (i * 72 - 90) * (Math.PI / 180);
          return (
            <Line
              key={i}
              x1={center}
              y1={center}
              x2={center + maxRadius * Math.cos(angle)}
              y2={center + maxRadius * Math.sin(angle)}
              stroke={Colors.gray700}
              strokeWidth={1}
            />
          );
        })}

        {/* Data polygon with glow effect */}
        <Polygon
          points={polygonPoints}
          fill={Colors.accent + '30'}
          stroke={Colors.accent}
          strokeWidth={2}
        />

        {/* Data points */}
        {points.map((point, i) => (
          <Circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={6}
            fill={Colors.accent}
            stroke={Colors.textPrimary}
            strokeWidth={2}
          />
        ))}

        {/* Category labels */}
        {MASTERY_CATEGORIES.map((category, i) => {
          const angle = (i * 72 - 90) * (Math.PI / 180);
          const labelRadius = maxRadius + 20;
          return (
            <SvgText
              key={i}
              x={center + labelRadius * Math.cos(angle)}
              y={center + labelRadius * Math.sin(angle) + 4}
              fill={Colors.gray300}
              fontSize={12}
              fontWeight="600"
              textAnchor="middle"
            >
              {category.name}
            </SvgText>
          );
        })}
      </Svg>

      {/* Center glow */}
      <View style={[styles.radarGlow, { opacity: 0.3 }]} />
    </View>
  );
}

// Glass Stat Widget
function GlassStatWidget({
  icon,
  value,
  label,
  color,
  index,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
  color: string;
  index: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(200 + index * 100).springify()}>
      <BlurView intensity={20} tint="dark" style={styles.glassWidget}>
        <View style={[styles.glassWidgetIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.glassWidgetValue}>{value}</Text>
        <Text style={styles.glassWidgetLabel}>{label}</Text>
      </BlurView>
    </Animated.View>
  );
}

// Mastery Badge Display
function MasteryBadgeDisplay({ mastery, algorithmName }: { mastery: any; algorithmName: string }) {
  const color = getMasteryColor(mastery.masteryLevel);
  const icon = getMasteryIcon(mastery.masteryLevel);

  return (
    <View style={styles.masteryBadgeItem}>
      <View style={[styles.masteryBadgeIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={16} color={color} />
      </View>
      <View style={styles.masteryBadgeContent}>
        <Text style={styles.masteryBadgeName}>{algorithmName}</Text>
        <View style={styles.masteryBadgeStats}>
          <Text style={[styles.masteryLevel, { color }]}>
            {mastery.masteryLevel.charAt(0).toUpperCase() + mastery.masteryLevel.slice(1)}
          </Text>
          <Text style={styles.masteryQuizCount}>
            {mastery.quizScores.length} quizzes
          </Text>
        </View>
      </View>
      <View style={styles.masteryBadgeScore}>
        <Text style={[styles.masteryScoreValue, { color }]}>
          {mastery.quizScores.length > 0
            ? Math.round(mastery.quizScores.reduce((a: number, b: number) => a + b, 0) / mastery.quizScores.length)
            : 0}%
        </Text>
      </View>
    </View>
  );
}

// Streak Flame Animation
function StreakFlame({ streak }: { streak: number }) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withSpring(1.1, { damping: 3 }),
        withSpring(1, { damping: 3 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (streak === 0) return null;

  return (
    <Animated.View style={[styles.streakContainer, animatedStyle]}>
      <LinearGradient
        colors={[Colors.logicGold, Colors.alertCoral]}
        style={styles.streakGradient}
      >
        <Ionicons name="flame" size={32} color={Colors.textPrimary} />
        <Text style={styles.streakValue}>{streak}</Text>
      </LinearGradient>
      <Text style={styles.streakLabel}>Day Streak</Text>
    </Animated.View>
  );
}

// Algorithm name mapping
const algorithmNames: Record<string, string> = {
  'bubble-sort': 'Bubble Sort',
  'selection-sort': 'Selection Sort',
  'insertion-sort': 'Insertion Sort',
  'merge-sort': 'Merge Sort',
  'quick-sort': 'Quick Sort',
  'linear-search': 'Linear Search',
  'binary-search': 'Binary Search',
  'bfs': 'BFS',
  'dfs': 'DFS',
  'dijkstra': "Dijkstra's",
  'astar': 'A* Search',
  'fibonacci': 'Fibonacci',
  'knapsack': 'Knapsack',
};

export default function DashboardScreen() {
  return (
    <PremiumGate featureName="Advanced Analytics">
      <DashboardScreenInner />
    </PremiumGate>
  );
}

function DashboardScreenInner() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userProgress, getLevelProgress } = useAppStore();
  const { user, isAuthenticated } = useAuth();
  const { currentXP, xpForNextLevel, progress } = getLevelProgress();

  // Calculate category scores for radar chart
  const categoryScores = useMemo(() => {
    return MASTERY_CATEGORIES.map((category) => {
      const categoryMasteries = category.algorithms.map(
        (algoId) => userProgress.algorithmMastery[algoId]
      ).filter(Boolean);

      if (categoryMasteries.length === 0) return 10; // Minimum visibility

      const avgScore = categoryMasteries.reduce((sum, m) => {
        if (m.quizScores.length === 0) return sum;
        return sum + m.quizScores.reduce((a, b) => a + b, 0) / m.quizScores.length;
      }, 0) / categoryMasteries.length;

      return Math.max(avgScore, 10);
    });
  }, [userProgress.algorithmMastery]);

  // Get mastery badges sorted by level
  const masteryBadges = useMemo(() => {
    return Object.entries(userProgress.algorithmMastery)
      .filter(([_, mastery]) => mastery.masteryLevel !== 'none')
      .sort((a, b) => {
        const levelOrder = { gold: 0, silver: 1, bronze: 2, none: 3 };
        return levelOrder[a[1].masteryLevel] - levelOrder[b[1].masteryLevel];
      });
  }, [userProgress.algorithmMastery]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[Colors.background, Colors.backgroundDark]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors.textPrimary }]}>Mastery Dashboard</Text>
        <TouchableOpacity
          style={styles.leaderboardButton}
          onPress={() => router.push('/leaderboard')}
        >
          <Ionicons name="trophy" size={22} color={Colors.logicGold} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <BlurView intensity={25} tint="dark" style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={[Colors.accent, Colors.electricPurple]}
                  style={styles.avatarGradient}
                >
                  <Ionicons name="person" size={28} color={Colors.textPrimary} />
                </LinearGradient>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>{userProgress.level}</Text>
                </View>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.username}>
                  {isAuthenticated ? user?.email?.split('@')[0] : 'Algorithm Learner'}
                </Text>
                <Text style={styles.levelText}>Level {userProgress.level}</Text>
              </View>
              <StreakFlame streak={userProgress.currentStreak} />
            </View>

            {/* XP Progress */}
            <View style={styles.xpProgressContainer}>
              <View style={styles.xpProgressHeader}>
                <Text style={styles.xpProgressLabel}>Progress to Level {userProgress.level + 1}</Text>
                <Text style={styles.xpProgressValue}>{currentXP} / {xpForNextLevel} XP</Text>
              </View>
              <View style={styles.xpProgressBar}>
                <LinearGradient
                  colors={[Colors.accent, Colors.electricPurple]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.xpProgressFill, { width: `${progress * 100}%` }]}
                />
              </View>
            </View>
          </BlurView>
        </Animated.View>

        {/* Stats Widgets */}
        <View style={styles.statsGrid}>
          <GlassStatWidget
            icon="flash"
            value={userProgress.totalXP}
            label="Total XP"
            color={Colors.logicGold}
            index={0}
          />
          <GlassStatWidget
            icon="checkmark-done"
            value={userProgress.completedAlgorithms.length}
            label="Completed"
            color={Colors.success}
            index={1}
          />
          <GlassStatWidget
            icon="ribbon"
            value={masteryBadges.length}
            label="Badges"
            color={Colors.electricPurple}
            index={2}
          />
          <GlassStatWidget
            icon="game-controller"
            value={userProgress.quizHistory.length}
            label="Quizzes"
            color={Colors.accent}
            index={3}
          />
        </View>

        {/* Mastery Radar Chart */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.radarSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="analytics" size={20} color={Colors.accent} />
            <Text style={styles.sectionTitle}>Mastery Radar</Text>
          </View>
          <BlurView intensity={15} tint="dark" style={styles.radarCard}>
            <MasteryRadarChart categoryScores={categoryScores} />
          </BlurView>
        </Animated.View>

        {/* Mastery Badges */}
        {masteryBadges.length > 0 && (
          <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.badgesSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="medal" size={20} color={Colors.logicGold} />
              <Text style={styles.sectionTitle}>Mastery Badges</Text>
            </View>
            <BlurView intensity={15} tint="dark" style={styles.badgesCard}>
              {masteryBadges.map(([algorithmId, mastery]) => (
                <MasteryBadgeDisplay
                  key={algorithmId}
                  mastery={mastery}
                  algorithmName={algorithmNames[algorithmId] || algorithmId}
                />
              ))}
            </BlurView>
          </Animated.View>
        )}

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/game/battle-arena')}
          >
            <LinearGradient
              colors={[Colors.accent, Colors.electricPurple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionGradient}
            >
              <Ionicons name="flash" size={24} color={Colors.textPrimary} />
              <Text style={styles.actionText}>Battle Arena</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.textPrimary} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/cheatsheet')}
          >
            <View style={styles.actionSecondary}>
              <Ionicons name="book" size={24} color={Colors.logicGold} />
              <Text style={styles.actionTextSecondary}>Cheat Sheet</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.gray500} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Cloud Sync Status */}
        <Animated.View entering={FadeInUp.delay(700)} style={styles.syncStatus}>
          <Ionicons
            name={isAuthenticated ? 'cloud-done' : 'cloud-offline'}
            size={16}
            color={isAuthenticated ? Colors.success : Colors.gray500}
          />
          <Text style={[styles.syncText, !isAuthenticated && styles.syncTextOffline]}>
            {isAuthenticated ? 'Progress synced to cloud' : 'Sign in to sync progress'}
          </Text>
          {!isAuthenticated && (
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.syncLink}>Sign In</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  leaderboardButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.logicGold + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  // Profile Card
  profileCard: {
    borderRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  avatarGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.logicGold,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  levelBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.background,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  levelText: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
    marginTop: 2,
  },
  streakContainer: {
    alignItems: 'center',
  },
  streakGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  streakValue: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  streakLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
    marginTop: 4,
  },
  xpProgressContainer: {
    marginTop: Spacing.sm,
  },
  xpProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  xpProgressLabel: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
  },
  xpProgressValue: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.accent,
  },
  xpProgressBar: {
    height: 8,
    backgroundColor: Colors.gray700,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  xpProgressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  glassWidget: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm) / 2,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  glassWidgetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  glassWidgetValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  glassWidgetLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
    marginTop: 2,
  },
  // Radar Section
  radarSection: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  radarCard: {
    borderRadius: BorderRadius.xxl,
    padding: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
  },
  radarContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.accent,
  },
  // Badges Section
  badgesSection: {
    marginBottom: Spacing.lg,
  },
  badgesCard: {
    borderRadius: BorderRadius.xxl,
    padding: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  masteryBadgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray700,
  },
  masteryBadgeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  masteryBadgeContent: {
    flex: 1,
  },
  masteryBadgeName: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  masteryBadgeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2,
  },
  masteryLevel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  masteryQuizCount: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
  },
  masteryBadgeScore: {
    alignItems: 'flex-end',
  },
  masteryScoreValue: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  // Actions
  actionsSection: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.small,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  actionText: {
    flex: 1,
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: Spacing.md,
  },
  actionSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.gray700,
    borderRadius: BorderRadius.xl,
  },
  actionTextSecondary: {
    flex: 1,
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: Spacing.md,
  },
  // Sync Status
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
  },
  syncText: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
  },
  syncTextOffline: {
    color: Colors.gray500,
  },
  syncLink: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.accent,
    marginLeft: Spacing.sm,
  },
});
