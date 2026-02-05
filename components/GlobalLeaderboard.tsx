// Global Leaderboard - Real-time Rankings with Supabase
// Displays top players by XP and streaks with live updates
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Dimensions, FlatList, Pressable, RefreshControl } from 'react-native';
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
  SlideInUp,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { Colors, BorderRadius, Spacing, FontSizes, Shadows } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Leaderboard entry type
interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  total_xp: number;
  current_streak: number;
  challenges_won: number;
  algorithms_mastered: number;
  rank: number;
  updated_at: string;
}

// Tab types
type LeaderboardTab = 'xp' | 'streak' | 'challenges';

interface GlobalLeaderboardProps {
  userId?: string;
  onClose?: () => void;
}

export default function GlobalLeaderboard({ userId, onClose }: GlobalLeaderboardProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('xp');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);

    try {
      // Determine sort field based on active tab
      const sortField = {
        xp: 'total_xp',
        streak: 'current_streak',
        challenges: 'challenges_won',
      }[activeTab];

      // Fetch top 50 from global_rankings
      const { data, error } = await supabase
        .from('global_rankings')
        .select('*')
        .order(sortField, { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        // Generate mock data for demonstration
        const mockData = generateMockLeaderboard();
        setLeaderboardData(mockData);
      } else if (data) {
        // Add ranks
        const rankedData = data.map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));
        setLeaderboardData(rankedData);
      }

      // Fetch current user's rank if logged in
      if (userId) {
        const { data: userData, error: userError } = await supabase
          .from('global_rankings')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!userError && userData) {
          // Calculate user's rank
          const { count } = await supabase
            .from('global_rankings')
            .select('*', { count: 'exact', head: true })
            .gt(sortField, userData[sortField as keyof typeof userData]);

          setUserRank({
            ...userData,
            rank: (count || 0) + 1,
          });
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setLeaderboardData(generateMockLeaderboard());
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, userId]);

  // Set up real-time subscription
  useEffect(() => {
    fetchLeaderboard();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'global_rankings',
        },
        (payload) => {
          console.log('Leaderboard update:', payload);
          fetchLeaderboard();
        }
      )
      .subscribe();

    setRealtimeChannel(channel);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [activeTab]);

  // Generate mock data for demonstration
  const generateMockLeaderboard = (): LeaderboardEntry[] => {
    const names = [
      'CyberNinja', 'AlgoMaster', 'CodeWizard', 'ByteHunter', 'StackOverflow',
      'RecursiveKing', 'BinaryBoss', 'HeapHero', 'GraphGuru', 'SortingSlayer',
      'TreeTraverser', 'HashHacker', 'QueueQueen', 'LinkedListLord', 'DPDynamo',
      'GreedyGamer', 'BacktrackBeast', 'DivideConquer', 'MemoMaster', 'CacheCrafter',
    ];

    return names.slice(0, 15).map((name, index) => ({
      id: `mock-${index}`,
      user_id: `user-${index}`,
      username: name,
      avatar_url: undefined,
      total_xp: Math.floor(10000 - index * 500 + Math.random() * 200),
      current_streak: Math.floor(30 - index * 2 + Math.random() * 5),
      challenges_won: Math.floor(50 - index * 3 + Math.random() * 10),
      algorithms_mastered: Math.floor(20 - index + Math.random() * 3),
      rank: index + 1,
      updated_at: new Date().toISOString(),
    }));
  };

  // Tab buttons
  const tabs: { key: LeaderboardTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'xp', label: 'XP', icon: 'star' },
    { key: 'streak', label: 'Streaks', icon: 'flame' },
    { key: 'challenges', label: 'Wins', icon: 'trophy' },
  ];

  // Get value based on tab
  const getValue = (entry: LeaderboardEntry): number => {
    switch (activeTab) {
      case 'xp':
        return entry.total_xp;
      case 'streak':
        return entry.current_streak;
      case 'challenges':
        return entry.challenges_won;
    }
  };

  const getValueLabel = (entry: LeaderboardEntry): string => {
    switch (activeTab) {
      case 'xp':
        return `${entry.total_xp.toLocaleString()} XP`;
      case 'streak':
        return `${entry.current_streak} days`;
      case 'challenges':
        return `${entry.challenges_won} wins`;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeInDown} style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={[Colors.neonCyan, Colors.neonPurple]}
            style={styles.headerIcon}
          >
            <Ionicons name="podium" size={24} color={Colors.background} />
          </LinearGradient>
          <Animated.Text style={styles.headerTitle}>Global Rankings</Animated.Text>
        </View>
        {onClose && (
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </Pressable>
        )}
      </Animated.View>

      {/* Tabs */}
      <Animated.View entering={FadeInDown.delay(100)} style={styles.tabContainer}>
        {tabs.map((tab, index) => (
          <Pressable
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => {
              setActiveTab(tab.key);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Ionicons
              name={tab.icon}
              size={18}
              color={activeTab === tab.key ? Colors.neonCyan : Colors.gray500}
            />
            <Animated.Text
              style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}
            >
              {tab.label}
            </Animated.Text>
          </Pressable>
        ))}
      </Animated.View>

      {/* Top 3 Podium */}
      {leaderboardData.length >= 3 && (
        <Animated.View entering={FadeInDown.delay(200)} style={styles.podium}>
          <PodiumPosition entry={leaderboardData[1]} position={2} getValue={getValue} />
          <PodiumPosition entry={leaderboardData[0]} position={1} getValue={getValue} />
          <PodiumPosition entry={leaderboardData[2]} position={3} getValue={getValue} />
        </Animated.View>
      )}

      {/* Leaderboard List */}
      <FlatList
        data={leaderboardData.slice(3)}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchLeaderboard();
            }}
            tintColor={Colors.neonCyan}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.emptyContainer}>
              <Animated.Text style={styles.emptyText}>Loading rankings...</Animated.Text>
            </View>
          ) : null
        }
        renderItem={({ item, index }) => (
          <LeaderboardRow
            entry={item}
            index={index}
            isCurrentUser={item.user_id === userId}
            valueLabel={getValueLabel(item)}
          />
        )}
      />

      {/* Current User's Rank (if not in top list) */}
      {userRank && userRank.rank > 50 && (
        <Animated.View entering={SlideInUp} style={styles.userRankContainer}>
          <View style={styles.userRankDivider}>
            <Animated.Text style={styles.dividerText}>Your Rank</Animated.Text>
          </View>
          <LeaderboardRow
            entry={userRank}
            index={userRank.rank - 4}
            isCurrentUser={true}
            valueLabel={getValueLabel(userRank)}
          />
        </Animated.View>
      )}

      {/* Live indicator */}
      <View style={styles.liveIndicator}>
        <View style={styles.liveDot} />
        <Animated.Text style={styles.liveText}>Live</Animated.Text>
      </View>
    </View>
  );
}

// Podium Position Component
function PodiumPosition({
  entry,
  position,
  getValue,
}: {
  entry: LeaderboardEntry;
  position: 1 | 2 | 3;
  getValue: (entry: LeaderboardEntry) => number;
}) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    if (position === 1) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 800 }),
          withTiming(0.3, { duration: 800 })
        ),
        -1,
        true
      );
    }
  }, [position]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const heights = { 1: 120, 2: 90, 3: 70 };
  const colors: Record<1 | 2 | 3, [string, string]> = {
    1: [Colors.neonYellow, Colors.neonOrange],
    2: [Colors.gray400, Colors.gray500],
    3: [Colors.neonOrange, '#CD7F32'],
  };
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };

  return (
    <Animated.View style={[styles.podiumPosition, containerStyle]}>
      {/* Avatar */}
      <View style={styles.podiumAvatarContainer}>
        {position === 1 && <Animated.View style={[styles.crownGlow, glowStyle]} />}
        {position === 1 && <Animated.Text style={styles.crown}>👑</Animated.Text>}
        <LinearGradient
          colors={colors[position]}
          style={[styles.podiumAvatar, position === 1 && styles.podiumAvatarFirst]}
        >
          <Animated.Text style={styles.podiumAvatarText}>
            {entry.username.charAt(0).toUpperCase()}
          </Animated.Text>
        </LinearGradient>
        <View style={styles.medalBadge}>
          <Animated.Text style={styles.medalText}>{medals[position]}</Animated.Text>
        </View>
      </View>

      {/* Username */}
      <Animated.Text
        style={[styles.podiumUsername, position === 1 && styles.podiumUsernameFirst]}
        numberOfLines={1}
      >
        {entry.username}
      </Animated.Text>

      {/* Value */}
      <Animated.Text style={styles.podiumValue}>
        {getValue(entry).toLocaleString()}
      </Animated.Text>

      {/* Pedestal */}
      <LinearGradient
        colors={colors[position]}
        style={[styles.pedestal, { height: heights[position] }]}
      >
        <Animated.Text style={styles.pedestalRank}>{position}</Animated.Text>
      </LinearGradient>
    </Animated.View>
  );
}

// Leaderboard Row Component
function LeaderboardRow({
  entry,
  index,
  isCurrentUser,
  valueLabel,
}: {
  entry: LeaderboardEntry;
  index: number;
  isCurrentUser: boolean;
  valueLabel: string;
}) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(
      withSpring(0.98, { damping: 15 }),
      withSpring(1, { damping: 10 })
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInRight.delay(index * 30)}>
      <Pressable onPress={handlePress}>
        <Animated.View
          style={[
            styles.row,
            isCurrentUser && styles.rowCurrentUser,
            animatedStyle,
          ]}
        >
          {/* Rank */}
          <View style={styles.rankContainer}>
            <Animated.Text style={[styles.rankText, isCurrentUser && styles.rankTextCurrentUser]}>
              {entry.rank}
            </Animated.Text>
          </View>

          {/* Avatar */}
          <View style={[styles.rowAvatar, isCurrentUser && styles.rowAvatarCurrentUser]}>
            <Animated.Text style={styles.rowAvatarText}>
              {entry.username.charAt(0).toUpperCase()}
            </Animated.Text>
          </View>

          {/* Info */}
          <View style={styles.rowInfo}>
            <Animated.Text
              style={[styles.rowUsername, isCurrentUser && styles.rowUsernameCurrentUser]}
              numberOfLines={1}
            >
              {entry.username}
              {isCurrentUser && ' (You)'}
            </Animated.Text>
            <Animated.Text style={styles.rowSecondary}>
              Level {Math.floor(entry.total_xp / 500) + 1} • {entry.algorithms_mastered} mastered
            </Animated.Text>
          </View>

          {/* Value */}
          <View style={styles.rowValueContainer}>
            <Animated.Text style={[styles.rowValue, isCurrentUser && styles.rowValueCurrentUser]}>
              {valueLabel}
            </Animated.Text>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
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
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray700,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surfaceDark,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabActive: {
    backgroundColor: Colors.neonCyan + '20',
    borderColor: Colors.neonCyan,
  },
  tabText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.gray500,
  },
  tabTextActive: {
    color: Colors.neonCyan,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  podiumPosition: {
    flex: 1,
    alignItems: 'center',
  },
  podiumAvatarContainer: {
    position: 'relative',
    marginBottom: Spacing.xs,
  },
  crownGlow: {
    position: 'absolute',
    top: -30,
    left: '50%',
    marginLeft: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.neonYellow,
  },
  crown: {
    position: 'absolute',
    top: -28,
    left: '50%',
    marginLeft: -12,
    fontSize: 24,
    zIndex: 2,
  },
  podiumAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  podiumAvatarFirst: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
  },
  podiumAvatarText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.background,
  },
  medalBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
  },
  medalText: {
    fontSize: 18,
  },
  podiumUsername: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
    maxWidth: 80,
    textAlign: 'center',
  },
  podiumUsernameFirst: {
    fontSize: FontSizes.sm,
    color: Colors.neonYellow,
  },
  podiumValue: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  pedestal: {
    width: '90%',
    borderTopLeftRadius: BorderRadius.md,
    borderTopRightRadius: BorderRadius.md,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: Spacing.sm,
  },
  pedestalRank: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: Colors.background,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.gray700,
  },
  rowCurrentUser: {
    borderColor: Colors.neonCyan,
    backgroundColor: Colors.neonCyan + '10',
  },
  rankContainer: {
    width: 32,
    alignItems: 'center',
  },
  rankText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  rankTextCurrentUser: {
    color: Colors.neonCyan,
  },
  rowAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray600,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  rowAvatarCurrentUser: {
    backgroundColor: Colors.neonCyan + '40',
  },
  rowAvatarText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  rowInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  rowUsername: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  rowUsernameCurrentUser: {
    color: Colors.neonCyan,
  },
  rowSecondary: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rowValueContainer: {
    alignItems: 'flex-end',
  },
  rowValue: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.neonLime,
  },
  rowValueCurrentUser: {
    color: Colors.neonCyan,
  },
  userRankContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  userRankDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  dividerText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.sm,
  },
  liveIndicator: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg + 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.neonLime,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.neonLime,
  },
});
