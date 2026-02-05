import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
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
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@fastshot/auth';
import { supabase, LeaderboardEntry } from '@/lib/supabase';

// Mock leaderboard data for demo (replace with real Supabase data)
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', user_id: '1', username: 'AlgoMaster', avatar_url: null, total_xp: 12500, level: 25 },
  { id: '2', user_id: '2', username: 'CodeNinja', avatar_url: null, total_xp: 10800, level: 22 },
  { id: '3', user_id: '3', username: 'SortKing', avatar_url: null, total_xp: 9200, level: 19 },
  { id: '4', user_id: '4', username: 'GraphWiz', avatar_url: null, total_xp: 8500, level: 17 },
  { id: '5', user_id: '5', username: 'DPChamp', avatar_url: null, total_xp: 7800, level: 16 },
  { id: '6', user_id: '6', username: 'BinaryBeast', avatar_url: null, total_xp: 7200, level: 15 },
  { id: '7', user_id: '7', username: 'HeapHero', avatar_url: null, total_xp: 6500, level: 13 },
  { id: '8', user_id: '8', username: 'TreeTraverser', avatar_url: null, total_xp: 5800, level: 12 },
  { id: '9', user_id: '9', username: 'StackStar', avatar_url: null, total_xp: 5200, level: 11 },
  { id: '10', user_id: '10', username: 'QueueQueen', avatar_url: null, total_xp: 4800, level: 10 },
];

// Top 3 Podium
function TopThreePodium({ entries }: { entries: LeaderboardEntry[] }) {
  const [first, second, third] = entries;

  const scale1 = useSharedValue(1);
  const scale2 = useSharedValue(1);
  const scale3 = useSharedValue(1);

  useEffect(() => {
    scale1.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: scale1.value }],
  }));

  const PodiumItem = ({
    entry,
    rank,
    style,
    height,
    color,
  }: {
    entry: LeaderboardEntry | undefined;
    rank: number;
    style?: any;
    height: number;
    color: string;
  }) => {
    if (!entry) return <View style={{ flex: 1 }} />;

    return (
      <Animated.View style={[styles.podiumItem, style]}>
        <View style={[styles.podiumAvatar, { borderColor: color }]}>
          <Text style={styles.podiumAvatarText}>{entry.username[0].toUpperCase()}</Text>
          <View style={[styles.podiumRankBadge, { backgroundColor: color }]}>
            <Text style={styles.podiumRankText}>{rank}</Text>
          </View>
        </View>
        <Text style={styles.podiumUsername} numberOfLines={1}>
          {entry.username}
        </Text>
        <Text style={[styles.podiumXP, { color }]}>{entry.total_xp.toLocaleString()} XP</Text>
        <LinearGradient
          colors={[color, color + '50']}
          style={[styles.podiumBar, { height }]}
        >
          <Ionicons
            name={rank === 1 ? 'trophy' : 'medal'}
            size={24}
            color={Colors.textPrimary}
          />
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.podiumContainer}>
      <PodiumItem entry={second} rank={2} height={80} color={Colors.gray400} />
      <Animated.View style={animatedStyle1}>
        <PodiumItem entry={first} rank={1} height={100} color={Colors.logicGold} />
      </Animated.View>
      <PodiumItem entry={third} rank={3} height={60} color="#CD7F32" />
    </Animated.View>
  );
}

// Leaderboard Row
function LeaderboardRow({
  entry,
  rank,
  isCurrentUser,
  index,
}: {
  entry: LeaderboardEntry;
  rank: number;
  isCurrentUser: boolean;
  index: number;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInUp.delay(300 + index * 50)}
      style={animatedStyle}
    >
      <TouchableOpacity
        style={[styles.leaderboardRow, isCurrentUser && styles.currentUserRow]}
        onPressIn={() => (scale.value = withSpring(0.98))}
        onPressOut={() => (scale.value = withSpring(1))}
        activeOpacity={0.8}
      >
        <View style={styles.rankContainer}>
          <Text style={[styles.rankText, isCurrentUser && styles.currentUserText]}>
            {rank}
          </Text>
        </View>

        <View style={[styles.rowAvatar, isCurrentUser && styles.currentUserAvatar]}>
          <Text style={styles.rowAvatarText}>{entry.username[0].toUpperCase()}</Text>
        </View>

        <View style={styles.rowInfo}>
          <Text style={[styles.rowUsername, isCurrentUser && styles.currentUserText]}>
            {entry.username} {isCurrentUser && '(You)'}
          </Text>
          <Text style={styles.rowLevel}>Level {entry.level}</Text>
        </View>

        <View style={styles.rowXPContainer}>
          <Text style={[styles.rowXP, isCurrentUser && styles.currentUserXP]}>
            {entry.total_xp.toLocaleString()}
          </Text>
          <Text style={styles.rowXPLabel}>XP</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Filter Tabs
function FilterTabs({
  activeFilter,
  onFilterChange,
}: {
  activeFilter: 'all' | 'weekly' | 'friends';
  onFilterChange: (filter: 'all' | 'weekly' | 'friends') => void;
}) {
  const filters = [
    { id: 'all' as const, label: 'All Time' },
    { id: 'weekly' as const, label: 'This Week' },
    { id: 'friends' as const, label: 'Friends' },
  ];

  return (
    <Animated.View entering={FadeInDown.delay(100)} style={styles.filterContainer}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          style={[styles.filterTab, activeFilter === filter.id && styles.filterTabActive]}
          onPress={() => onFilterChange(filter.id)}
        >
          <Text
            style={[
              styles.filterTabText,
              activeFilter === filter.id && styles.filterTabTextActive,
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
}

export default function LeaderboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userProgress } = useAppStore();
  const { user, isAuthenticated } = useAuth();

  const [activeFilter, setActiveFilter] = useState<'all' | 'weekly' | 'friends'>('all');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      // For now, use mock data and include current user
      const mockData = [...MOCK_LEADERBOARD];

      // Add current user to leaderboard if authenticated
      if (isAuthenticated && user) {
        const currentUserEntry: LeaderboardEntry = {
          id: user.id,
          user_id: user.id,
          username: user.email?.split('@')[0] || 'You',
          avatar_url: null,
          total_xp: userProgress.totalXP,
          level: userProgress.level,
        };

        // Find where to insert current user based on XP
        const insertIndex = mockData.findIndex((e) => e.total_xp < userProgress.totalXP);
        if (insertIndex === -1) {
          mockData.push(currentUserEntry);
          setUserRank(mockData.length);
        } else {
          mockData.splice(insertIndex, 0, currentUserEntry);
          setUserRank(insertIndex + 1);
        }
      }

      setLeaderboard(mockData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [activeFilter, userProgress.totalXP]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  const topThree = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[Colors.background, Colors.backgroundDark]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <Animated.View entering={FadeInDown} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="trophy" size={24} color={Colors.logicGold} />
          <Text style={styles.headerTitle}>Leaderboard</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={22} color={Colors.gray400} />
        </TouchableOpacity>
      </Animated.View>

      {/* Filter Tabs */}
      <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.accent}
            />
          }
        >
          {/* Top 3 Podium */}
          <TopThreePodium entries={topThree} />

          {/* Your Rank Banner */}
          {isAuthenticated && userRank && userRank > 3 && (
            <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.yourRankBanner}>
              <BlurView intensity={20} tint="dark" style={styles.yourRankBlur}>
                <View style={styles.yourRankContent}>
                  <View style={styles.yourRankLeft}>
                    <Text style={styles.yourRankLabel}>Your Rank</Text>
                    <Text style={styles.yourRankValue}>#{userRank}</Text>
                  </View>
                  <View style={styles.yourRankRight}>
                    <Text style={styles.yourRankXP}>{userProgress.totalXP.toLocaleString()} XP</Text>
                    <Text style={styles.yourRankLevel}>Level {userProgress.level}</Text>
                  </View>
                </View>
              </BlurView>
            </Animated.View>
          )}

          {/* Rest of Leaderboard */}
          <View style={styles.leaderboardList}>
            {restOfLeaderboard.map((entry, index) => (
              <LeaderboardRow
                key={entry.id}
                entry={entry}
                rank={index + 4}
                isCurrentUser={isAuthenticated && entry.user_id === user?.id}
                index={index}
              />
            ))}
          </View>

          {/* Not Signed In Message */}
          {!isAuthenticated && (
            <Animated.View entering={FadeInUp.delay(600)} style={styles.signInPrompt}>
              <BlurView intensity={15} tint="dark" style={styles.signInBlur}>
                <Ionicons name="person-add" size={32} color={Colors.accent} />
                <Text style={styles.signInTitle}>Join the Competition!</Text>
                <Text style={styles.signInSubtitle}>
                  Sign in to see your rank and compete with others
                </Text>
                <TouchableOpacity
                  style={styles.signInButton}
                  onPress={() => router.push('/(auth)/login')}
                >
                  <Text style={styles.signInButtonText}>Sign In</Text>
                </TouchableOpacity>
              </BlurView>
            </Animated.View>
          )}
        </ScrollView>
      )}
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Filter Tabs
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xs,
  },
  filterTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  filterTabActive: {
    backgroundColor: Colors.accent,
  },
  filterTabText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.gray400,
  },
  filterTabTextActive: {
    color: Colors.background,
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: FontSizes.md,
    color: Colors.gray400,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  // Podium
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    height: 220,
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
  },
  podiumAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    marginBottom: Spacing.sm,
    position: 'relative',
  },
  podiumAvatarText: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  podiumRankBadge: {
    position: 'absolute',
    bottom: -8,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  podiumRankText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  podiumUsername: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
    maxWidth: 80,
  },
  podiumXP: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  podiumBar: {
    width: '100%',
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Your Rank Banner
  yourRankBanner: {
    marginBottom: Spacing.lg,
  },
  yourRankBlur: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.accent + '30',
  },
  yourRankContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  yourRankLeft: {},
  yourRankLabel: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
    marginBottom: 2,
  },
  yourRankValue: {
    fontSize: FontSizes.xxxl,
    fontWeight: '800',
    color: Colors.accent,
  },
  yourRankRight: {
    alignItems: 'flex-end',
  },
  yourRankXP: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  yourRankLevel: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
    marginTop: 2,
  },
  // Leaderboard List
  leaderboardList: {
    gap: Spacing.sm,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray700,
  },
  currentUserRow: {
    borderColor: Colors.accent + '50',
    backgroundColor: Colors.accent + '10',
  },
  rankContainer: {
    width: 32,
    alignItems: 'center',
  },
  rankText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.gray400,
  },
  currentUserText: {
    color: Colors.accent,
  },
  rowAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray700,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Spacing.sm,
  },
  currentUserAvatar: {
    backgroundColor: Colors.accent + '30',
  },
  rowAvatarText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  rowInfo: {
    flex: 1,
  },
  rowUsername: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  rowLevel: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    marginTop: 2,
  },
  rowXPContainer: {
    alignItems: 'flex-end',
  },
  rowXP: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  currentUserXP: {
    color: Colors.accent,
  },
  rowXPLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
  },
  // Sign In Prompt
  signInPrompt: {
    marginTop: Spacing.xl,
  },
  signInBlur: {
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  signInTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  signInSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  signInButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.lg,
  },
  signInButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.background,
  },
});
