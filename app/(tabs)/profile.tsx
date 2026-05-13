import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import { MasteryBadge } from '@/components/XPGainAnimation';
import { getMasteryColor } from '@/utils/quizData';
import CyberBackground from '@/components/CyberBackground';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  color?: string;
}

function SettingItem({ icon, title, subtitle, onPress, rightElement, color = Colors.gray400 }: SettingItemProps) {
  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.settingIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (onPress && <Ionicons name="chevron-forward" size={20} color={Colors.gray500} />)}
    </TouchableOpacity>
  );
}

function ProfileHeader() {
  const { userProgress } = useAppStore();

  return (
    <Animated.View entering={FadeInDown.delay(100)} style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <LinearGradient
          colors={[Colors.accent, Colors.electricPurple]}
          style={styles.avatar}
        >
          <Ionicons name="person" size={40} color={Colors.textPrimary} />
        </LinearGradient>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>{userProgress.level}</Text>
        </View>
      </View>
      <Text style={styles.username}>Algorithm Learner</Text>
      <Text style={styles.userStats}>
        Level {userProgress.level} • {userProgress.totalXP} XP
      </Text>

    </Animated.View>
  );
}

function QuickStats() {
  const { userProgress, gameState } = useAppStore();

  return (
    <Animated.View entering={FadeInDown.delay(200)} style={styles.quickStats}>
      <View style={styles.quickStatItem}>
        <Text style={styles.quickStatValue}>{userProgress.completedAlgorithms.length}</Text>
        <Text style={styles.quickStatLabel}>Algorithms</Text>
      </View>
      <View style={styles.quickStatDivider} />
      <View style={styles.quickStatItem}>
        <Text style={styles.quickStatValue}>{userProgress.currentStreak}</Text>
        <Text style={styles.quickStatLabel}>Day Streak</Text>
      </View>
      <View style={styles.quickStatDivider} />
      <View style={styles.quickStatItem}>
        <Text style={styles.quickStatValue}>{gameState.highScores.gridEscapeWins}</Text>
        <Text style={styles.quickStatLabel}>Games Won</Text>
      </View>
    </Animated.View>
  );
}

// Helper to get algorithm name from id
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

function MasteryOverview() {
  const { userProgress } = useAppStore();
  const masteryEntries = Object.entries(userProgress.algorithmMastery);

  if (masteryEntries.length === 0) {
    return null;
  }

  // Group masteries by level
  const goldCount = masteryEntries.filter(([_, m]) => m.masteryLevel === 'gold').length;
  const silverCount = masteryEntries.filter(([_, m]) => m.masteryLevel === 'silver').length;
  const bronzeCount = masteryEntries.filter(([_, m]) => m.masteryLevel === 'bronze').length;

  return (
    <Animated.View entering={FadeInDown.delay(250)} style={styles.masterySection}>
      <Text style={styles.sectionTitle}>Algorithm Mastery</Text>
      <View style={styles.masteryCard}>
        {/* Mastery Summary */}
        <View style={styles.masterySummary}>
          <View style={styles.masterySummaryItem}>
            <View style={[styles.masteryDot, { backgroundColor: getMasteryColor('gold') }]}>
              <Ionicons name="trophy" size={12} color={Colors.background} />
            </View>
            <Text style={[styles.masterySummaryCount, { color: getMasteryColor('gold') }]}>{goldCount}</Text>
            <Text style={styles.masterySummaryLabel}>Gold</Text>
          </View>
          <View style={styles.masterySummaryItem}>
            <View style={[styles.masteryDot, { backgroundColor: getMasteryColor('silver') }]}>
              <Ionicons name="medal" size={12} color={Colors.background} />
            </View>
            <Text style={[styles.masterySummaryCount, { color: getMasteryColor('silver') }]}>{silverCount}</Text>
            <Text style={styles.masterySummaryLabel}>Silver</Text>
          </View>
          <View style={styles.masterySummaryItem}>
            <View style={[styles.masteryDot, { backgroundColor: getMasteryColor('bronze') }]}>
              <Ionicons name="ribbon" size={12} color={Colors.background} />
            </View>
            <Text style={[styles.masterySummaryCount, { color: getMasteryColor('bronze') }]}>{bronzeCount}</Text>
            <Text style={styles.masterySummaryLabel}>Bronze</Text>
          </View>
        </View>

        {/* Individual Algorithm Masteries */}
        <View style={styles.masteryList}>
          {masteryEntries.slice(0, 5).map(([algorithmId, mastery]) => (
            <View key={algorithmId} style={styles.masteryListItem}>
              <MasteryBadge level={mastery.masteryLevel} size="small" showLabel={false} />
              <View style={styles.masteryListContent}>
                <Text style={styles.masteryListName}>{algorithmNames[algorithmId] || algorithmId}</Text>
                <Text style={styles.masteryListScore}>
                  Avg: {mastery.quizScores.length > 0
                    ? Math.round(mastery.quizScores.reduce((a, b) => a + b, 0) / mastery.quizScores.length)
                    : 0}%
                </Text>
              </View>
              <View style={styles.masteryListStats}>
                <Text style={styles.masteryListStatsText}>
                  {mastery.quizScores.length} quiz{mastery.quizScores.length !== 1 ? 'es' : ''}
                </Text>
              </View>
            </View>
          ))}
          {masteryEntries.length > 5 && (
            <Text style={styles.masteryMoreText}>
              +{masteryEntries.length - 5} more algorithms
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    visualizationSettings,
    setVisualizationSpeed,
    toggleShowComplexity,
    toggleShowCode,
    resetProgress,
  } = useAppStore();

  const [haptics, setHaptics] = React.useState(true);
  const [notifications, setNotifications] = React.useState(true);

  const handleResetProgress = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset all your progress? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            resetProgress();
          },
        },
      ]
    );
  };

  const handleNavigation = (route: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(route as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Cyber Background */}
      <CyberBackground showGrid showParticles={false} showMatrix={false} intensity="low" />

      {/* Header */}
      <Animated.View entering={FadeInDown.delay(0)} style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <ProfileHeader />

        {/* Quick Stats */}
        <QuickStats />

        {/* Mastery Overview */}
        <MasteryOverview />

        {/* Visualization Settings */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>Visualization Settings</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon="speedometer"
              title="Animation Speed"
              subtitle={`${visualizationSettings.speed}x`}
              color={Colors.accent}
              rightElement={
                <View style={styles.speedControls}>
                  <TouchableOpacity
                    style={styles.speedButton}
                    onPress={() => setVisualizationSpeed(visualizationSettings.speed - 0.5)}
                  >
                    <Ionicons name="remove" size={18} color={Colors.textPrimary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.speedButton}
                    onPress={() => setVisualizationSpeed(visualizationSettings.speed + 0.5)}
                  >
                    <Ionicons name="add" size={18} color={Colors.textPrimary} />
                  </TouchableOpacity>
                </View>
              }
            />
            <SettingItem
              icon="analytics"
              title="Show Complexity Tracker"
              color={Colors.logicGold}
              rightElement={
                <Switch
                  value={visualizationSettings.showComplexity}
                  onValueChange={toggleShowComplexity}
                  trackColor={{ false: Colors.gray700, true: Colors.accent }}
                  thumbColor={Colors.textPrimary}
                />
              }
            />
            <SettingItem
              icon="code-slash"
              title="Show Code Panel"
              color={Colors.info}
              rightElement={
                <Switch
                  value={visualizationSettings.showCode}
                  onValueChange={toggleShowCode}
                  trackColor={{ false: Colors.gray700, true: Colors.accent }}
                  thumbColor={Colors.textPrimary}
                />
              }
            />
          </View>
        </Animated.View>

        {/* Premium & Community */}
        <Animated.View entering={FadeInDown.delay(350)} style={styles.section}>
          <Text style={styles.sectionTitle}>Community & Premium</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon="trophy"
              title="Elite Arena"
              subtitle="Global leaderboards & rankings"
              color={Colors.neonYellow}
              onPress={() => handleNavigation('/elite-arena')}
            />
            <SettingItem
              icon="diamond"
              title="Go Premium"
              subtitle="Unlock all features & algorithms"
              color={Colors.neonPurple}
              onPress={() => handleNavigation('/premium')}
            />
          </View>
        </Animated.View>

        {/* App Settings */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon="phone-portrait"
              title="Haptic Feedback"
              subtitle="Vibration during interactions"
              color={Colors.alertCoral}
              rightElement={
                <Switch
                  value={haptics}
                  onValueChange={setHaptics}
                  trackColor={{ false: Colors.gray700, true: Colors.accent }}
                  thumbColor={Colors.textPrimary}
                />
              }
            />
            <SettingItem
              icon="notifications"
              title="Notifications"
              subtitle="Daily challenge reminders"
              color={Colors.logicGold}
              rightElement={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: Colors.gray700, true: Colors.accent }}
                  thumbColor={Colors.textPrimary}
                />
              }
            />
          </View>
        </Animated.View>

        {/* Quick Access */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon="analytics"
              title="Mastery Dashboard"
              subtitle="View your progress and achievements"
              color={Colors.neonPurple}
              onPress={() => handleNavigation('/dashboard')}
            />
            <SettingItem
              icon="book"
              title="Cheat Sheet"
              subtitle="Big-O reference and when to use"
              color={Colors.neonYellow}
              onPress={() => handleNavigation('/cheatsheet')}
            />
            <SettingItem
              icon="trophy"
              title="Leaderboard"
              subtitle="See top algorithm learners"
              color={Colors.neonPink}
              onPress={() => handleNavigation('/leaderboard')}
            />
          </View>
        </Animated.View>

        {/* Resources */}
        <Animated.View entering={FadeInDown.delay(550)} style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon="chatbubbles"
              title="AI Tutor"
              subtitle="Get help from Algorithm Tutor"
              color={Colors.neonCyan}
              onPress={() => handleNavigation('/tutor')}
            />
            <SettingItem
              icon="help-circle"
              title="Help & FAQ"
              subtitle="Common questions answered"
              color={Colors.gray400}
              onPress={() => {}}
            />
          </View>
        </Animated.View>

        {/* Danger Zone */}
        <Animated.View entering={FadeInDown.delay(600)} style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon="refresh"
              title="Reset Progress"
              subtitle="Clear all learning data"
              color={Colors.alertCoral}
              onPress={handleResetProgress}
            />
          </View>
        </Animated.View>

        {/* App Info */}
        <Animated.View entering={FadeInDown.delay(700)} style={styles.appInfo}>
          <Text style={styles.appName}>Algoplay</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appCopyright}>Master algorithms through play</Text>
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    zIndex: 10,
  },
  title: {
    fontSize: FontSizes.title,
    fontWeight: '700',
    color: Colors.textPrimary,
    textShadowColor: Colors.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.neonCyan + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neonCyan,
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.neonYellow,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
    shadowColor: Colors.neonYellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
  },
  levelBadgeText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.background,
  },
  username: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  userStats: {
    fontSize: FontSizes.md,
    color: Colors.gray400,
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.neonBorderCyan,
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  quickStatLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
    marginTop: 2,
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: Colors.gray700,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.gray400,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  settingsCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.neonBorderCyan,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray700,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  settingSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.gray500,
    marginTop: 2,
  },
  speedControls: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  speedButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray700,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginTop: Spacing.lg,
  },
  appName: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.neonCyan,
    textShadowColor: Colors.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  appVersion: {
    fontSize: FontSizes.sm,
    color: Colors.gray500,
    marginTop: 2,
  },
  appCopyright: {
    fontSize: FontSizes.xs,
    color: Colors.gray600,
    marginTop: Spacing.sm,
  },
  // Mastery Section Styles
  masterySection: {
    marginBottom: Spacing.lg,
  },
  masteryCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.neonYellow + '30',
    shadowColor: Colors.neonYellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  masterySummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray700,
  },
  masterySummaryItem: {
    alignItems: 'center',
  },
  masteryDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  masterySummaryCount: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  masterySummaryLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
    marginTop: 2,
  },
  masteryList: {
    padding: Spacing.md,
  },
  masteryListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray700,
  },
  masteryListContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  masteryListName: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  masteryListScore: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    marginTop: 2,
  },
  masteryListStats: {
    alignItems: 'flex-end',
  },
  masteryListStatsText: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
  },
  masteryMoreText: {
    fontSize: FontSizes.sm,
    color: Colors.neonCyan,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
