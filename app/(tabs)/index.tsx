import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import { getMasteryColor } from '@/utils/quizData';
import CyberBackground from '@/components/CyberBackground';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface SkillCategory {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  algorithms: string[];
  isUnlocked: boolean;
}

const skillCategories: SkillCategory[] = [
  {
    id: 'searching',
    name: 'Searching',
    icon: 'search',
    color: Colors.neonCyan,
    algorithms: ['Linear Search', 'Binary Search'],
    isUnlocked: true,
  },
  {
    id: 'sorting',
    name: 'Sorting',
    icon: 'bar-chart',
    color: Colors.neonPink,
    algorithms: ['Bubble', 'Selection', 'Insertion', 'Merge', 'Quick'],
    isUnlocked: true,
  },
  {
    id: 'graphs',
    name: 'Graphs',
    icon: 'git-branch',
    color: Colors.neonYellow,
    algorithms: ['BFS', 'DFS', 'Dijkstra', 'A*'],
    isUnlocked: true,
  },
  {
    id: 'dynamic-programming',
    name: 'Dynamic\nProgramming',
    icon: 'layers',
    color: Colors.neonPurple,
    algorithms: ['Fibonacci', 'Knapsack', 'LCS'],
    isUnlocked: true,
  },
  {
    id: 'greedy',
    name: 'Greedy',
    icon: 'trending-up',
    color: Colors.neonLime,
    algorithms: ['Activity Selection', 'Huffman'],
    isUnlocked: true,
  },
];

function SkillNode({
  category,
  index,
  onPress,
}: {
  category: SkillCategory;
  index: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const { completedAlgorithms } = useAppStore((state) => state.userProgress);

  const completedCount = category.algorithms.filter((alg) =>
    completedAlgorithms.some((completed) =>
      completed.toLowerCase().includes(alg.toLowerCase().split(' ')[0])
    )
  ).length;

  const progress = category.algorithms.length > 0 ? completedCount / category.algorithms.length : 0;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.skillNodeWrapper}
    >
      <AnimatedTouchable
        style={[
          styles.skillNode,
          animatedStyle,
          !category.isUnlocked && styles.skillNodeLocked,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        disabled={!category.isUnlocked}
      >
        <View
          style={[
            styles.skillNodeIcon,
            { backgroundColor: category.isUnlocked ? category.color + '20' : Colors.gray700 },
          ]}
        >
          <Ionicons
            name={category.icon}
            size={24}
            color={category.isUnlocked ? category.color : Colors.gray500}
          />
          {!category.isUnlocked && (
            <View style={styles.lockOverlay}>
              <Ionicons name="lock-closed" size={12} color={Colors.gray400} />
            </View>
          )}
        </View>
        {progress > 0 && progress < 1 && (
          <View style={styles.progressRing}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: category.color, height: `${progress * 100}%` },
              ]}
            />
          </View>
        )}
        {progress === 1 && (
          <View style={[styles.completedBadge, { backgroundColor: Colors.success }]}>
            <Ionicons name="checkmark" size={10} color={Colors.white} />
          </View>
        )}
      </AnimatedTouchable>
      <Text
        style={[
          styles.skillNodeLabel,
          !category.isUnlocked && styles.skillNodeLabelLocked,
        ]}
        numberOfLines={2}
      >
        {category.name}
      </Text>
    </Animated.View>
  );
}

function DailyChallengeCard() {
  const router = useRouter();
  const pulse = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withSpring(1.02, { damping: 2 }),
        withSpring(1, { damping: 2 })
      ),
      -1,
      true
    );
    glowOpacity.value = withRepeat(
      withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/game/the-sorter');
  };

  return (
    <Animated.View entering={FadeInRight.delay(200).springify()}>
      <AnimatedTouchable
        style={[styles.dailyChallenge, animatedStyle, glowStyle]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[Colors.neonYellow + '20', Colors.neonOrange + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.dailyChallengeGradient}
        >
          <View style={styles.dailyChallengeIcon}>
            <Ionicons name="trophy" size={28} color={Colors.neonYellow} />
          </View>
          <View style={styles.dailyChallengeContent}>
            <Text style={styles.dailyChallengeTitle}>Daily Challenge</Text>
            <Text style={styles.dailyChallengeSubtitle}>
              The Sorter: Beat the Bubble Sort!
            </Text>
            <TouchableOpacity
              style={styles.playNowButton}
              onPress={handlePress}
            >
              <LinearGradient
                colors={[Colors.neonCyan, Colors.accentDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.playNowGradient}
              >
                <Text style={styles.playNowText}>Play Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </AnimatedTouchable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = React.useState('');
  const { userProgress } = useAppStore();

  const handleCategoryPress = (categoryId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/learn?category=${categoryId}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Animated Cyber Background */}
      <CyberBackground showGrid showParticles={false} showMatrix={false} intensity="low" />

      {/* Header */}
      <Animated.View entering={FadeInDown.delay(0)} style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Algoplay</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            router.push('/tutor');
          }}
        >
          <Ionicons name="chatbubbles" size={24} color={Colors.neonCyan} />
        </TouchableOpacity>
      </Animated.View>

      {/* Search Bar */}
      <Animated.View entering={FadeInDown.delay(100)} style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.neonCyan} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search algorithms..."
          placeholderTextColor={Colors.gray500}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Daily Challenge */}
        <DailyChallengeCard />

        {/* Skill Tree */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.skillTreeSection}>
          <Text style={styles.sectionTitle}>Skill Tree</Text>
          <View style={styles.skillTreeContainer}>
            {/* Row 1: Searching, Sorting */}
            <View style={styles.skillTreeRow}>
              <SkillNode
                category={skillCategories[0]}
                index={0}
                onPress={() => handleCategoryPress('searching')}
              />
              <View style={styles.horizontalConnector}>
                <View style={styles.connectorDot} />
                <View style={styles.connectorHorizontalLine} />
                <View style={styles.connectorDot} />
              </View>
              <SkillNode
                category={skillCategories[1]}
                index={1}
                onPress={() => handleCategoryPress('sorting')}
              />
            </View>

            {/* Vertical Connectors */}
            <View style={styles.verticalConnectorRow}>
              <View style={styles.verticalConnector}>
                <View style={styles.connectorVerticalLine} />
              </View>
              <View style={styles.verticalConnector}>
                <View style={styles.connectorVerticalLine} />
              </View>
            </View>

            {/* Row 2: Dynamic Programming, Greedy */}
            <View style={styles.skillTreeRow}>
              <SkillNode
                category={skillCategories[3]}
                index={2}
                onPress={() => handleCategoryPress('dynamic-programming')}
              />
              <View style={styles.horizontalConnector}>
                <View style={styles.connectorDot} />
                <View style={styles.connectorHorizontalLine} />
                <View style={styles.connectorDot} />
              </View>
              <SkillNode
                category={skillCategories[4]}
                index={3}
                onPress={() => handleCategoryPress('greedy')}
              />
            </View>

            {/* Center Vertical Connector */}
            <View style={styles.centerConnector}>
              <View style={styles.connectorVerticalLine} />
            </View>

            {/* Row 3: Graphs (center) */}
            <View style={[styles.skillTreeRow, styles.skillTreeRowCenter]}>
              <SkillNode
                category={skillCategories[2]}
                index={4}
                onPress={() => handleCategoryPress('graphs')}
              />
            </View>
          </View>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.quickStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userProgress.level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userProgress.totalXP}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userProgress.currentStreak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userProgress.completedAlgorithms.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </Animated.View>

        {/* Mastery Achievements */}
        {Object.keys(userProgress.algorithmMastery).length > 0 && (
          <Animated.View entering={FadeInDown.delay(500)} style={styles.masteryAchievements}>
            <View style={styles.masteryHeader}>
              <Ionicons name="ribbon" size={18} color={Colors.logicGold} />
              <Text style={styles.masteryTitle}>Mastery Achievements</Text>
            </View>
            <View style={styles.masteryBadges}>
              <View style={styles.masteryBadgeItem}>
                <View style={[styles.masteryBadgeIcon, { backgroundColor: getMasteryColor('gold') + '30' }]}>
                  <Ionicons name="trophy" size={16} color={getMasteryColor('gold')} />
                </View>
                <Text style={[styles.masteryBadgeCount, { color: getMasteryColor('gold') }]}>
                  {Object.values(userProgress.algorithmMastery).filter(m => m.masteryLevel === 'gold').length}
                </Text>
              </View>
              <View style={styles.masteryBadgeItem}>
                <View style={[styles.masteryBadgeIcon, { backgroundColor: getMasteryColor('silver') + '30' }]}>
                  <Ionicons name="medal" size={16} color={getMasteryColor('silver')} />
                </View>
                <Text style={[styles.masteryBadgeCount, { color: getMasteryColor('silver') }]}>
                  {Object.values(userProgress.algorithmMastery).filter(m => m.masteryLevel === 'silver').length}
                </Text>
              </View>
              <View style={styles.masteryBadgeItem}>
                <View style={[styles.masteryBadgeIcon, { backgroundColor: getMasteryColor('bronze') + '30' }]}>
                  <Ionicons name="ribbon" size={16} color={getMasteryColor('bronze')} />
                </View>
                <Text style={[styles.masteryBadgeCount, { color: getMasteryColor('bronze') }]}>
                  {Object.values(userProgress.algorithmMastery).filter(m => m.masteryLevel === 'bronze').length}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.title,
    fontWeight: '800',
    color: Colors.textPrimary,
    textShadowColor: Colors.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 1,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neonBorderCyan,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.neonBorderCyan,
    zIndex: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  dailyChallenge: {
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.neonYellow + '40',
    overflow: 'hidden',
    shadowColor: Colors.neonYellow,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 6,
  },
  dailyChallengeGradient: {
    flexDirection: 'row',
    padding: Spacing.lg,
  },
  dailyChallengeIcon: {
    width: 54,
    height: 54,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.neonYellow + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neonYellow + '30',
  },
  dailyChallengeContent: {
    flex: 1,
  },
  dailyChallengeTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.neonYellow,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dailyChallengeSubtitle: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  playNowButton: {
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
    overflow: 'hidden',
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  playNowGradient: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  playNowText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.background,
  },
  skillTreeSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    textShadowColor: Colors.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    letterSpacing: 0.5,
  },
  skillTreeContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  skillTreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillTreeRowCenter: {
    marginTop: -Spacing.md,
  },
  skillNodeWrapper: {
    alignItems: 'center',
    width: 80,
  },
  skillNode: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neonBorderCyan,
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  skillNodeLocked: {
    opacity: 0.5,
    borderColor: Colors.gray800,
  },
  skillNodeIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.gray700,
    borderRadius: BorderRadius.full,
    padding: 2,
  },
  progressRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.gray700,
  },
  progressFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: BorderRadius.full,
  },
  completedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skillNodeLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
    color: Colors.gray300,
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: 14,
  },
  skillNodeLabelLocked: {
    color: Colors.gray600,
  },
  horizontalConnector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.sm,
    width: 60,
  },
  connectorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.neonCyan,
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  connectorHorizontalLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.neonCyan + '50',
  },
  verticalConnectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 40,
    marginVertical: -Spacing.xs,
  },
  verticalConnector: {
    alignItems: 'center',
    height: 40,
  },
  connectorVerticalLine: {
    width: 2,
    height: '100%',
    backgroundColor: Colors.neonCyan + '50',
  },
  centerConnector: {
    alignItems: 'center',
    height: 30,
    marginTop: -Spacing.md,
  },
  connector: {
    position: 'absolute',
    left: '50%',
    height: 30,
    width: 2,
    backgroundColor: Colors.gray600,
  },
  connectorLine: {
    width: 2,
    height: '100%',
    backgroundColor: Colors.gray600,
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.neonBorderCyan,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.neonCyan,
    textShadowColor: Colors.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.glassBorder,
    marginVertical: Spacing.xs,
  },
  // Mastery Achievements
  masteryAchievements: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.neonYellow + '30',
    shadowColor: Colors.neonYellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  masteryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  masteryTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.logicGold,
  },
  masteryBadges: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  masteryBadgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  masteryBadgeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  masteryBadgeCount: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
});
