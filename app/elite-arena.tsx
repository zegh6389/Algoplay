// Elite Arena - Global Leaderboards Screen with Supabase Integration
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, withSpring, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import PremiumGate from '@/components/PremiumGate';
import { useAppStore } from '@/store/useAppStore';
import { useSubscriptionStore } from '@/store/useSubscriptionStore';
import CyberBackground from '@/components/CyberBackground';
import { supabase } from '@/lib/supabase';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  xp: number;
  level: number;
  streak: number;
  avatar_color?: string;
  is_current_user?: boolean;
  is_premium?: boolean;
}

// Fallback mock data when Supabase is unavailable
const generateMockLeaderboard = (currentUser: { username: string; xp: number; streak: number; level: number }): LeaderboardEntry[] => {
  const names = [
    'ByteMaster3000', 'AlgoNinja', 'CodeWarrior', 'DataDragon', 'RecursiveRebel',
    'StackOverflowKing', 'HeapHero', 'TreeTitan', 'GraphGuru', 'DPDynamo',
    'SortingSage', 'SearchSorcerer', 'ComplexityCrusher', 'OptimizationOracle',
    'MemoryMaestro', 'RuntimeRuler', 'BigOBoss', 'AlgorithmAce',
  ];

  const entries: LeaderboardEntry[] = names.slice(0, 15).map((name, index) => ({
    rank: index + 1,
    user_id: `mock_${index}`,
    username: name,
    xp: 50000 - index * 2500 - Math.floor(Math.random() * 1000),
    level: Math.floor((50000 - index * 2500) / 500) + 1,
    streak: Math.floor(Math.random() * 100) + 10,
    avatar_color: [Colors.neonCyan, Colors.neonPurple, Colors.neonLime, Colors.neonPink, Colors.neonYellow][index % 5],
    is_current_user: false,
    is_premium: Math.random() > 0.6,
  }));

  // Find or insert current user
  const currentUserIndex = entries.findIndex(e => e.xp < currentUser.xp);
  if (currentUserIndex !== -1) {
    entries.splice(currentUserIndex, 0, {
      rank: currentUserIndex + 1,
      user_id: 'current',
      username: currentUser.username,
      xp: currentUser.xp,
      level: currentUser.level,
      streak: currentUser.streak,
      avatar_color: Colors.neonCyan,
      is_current_user: true,
      is_premium: false,
    });
    // Rerank
    entries.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });
  } else {
    entries.push({
      rank: entries.length + 1,
      user_id: 'current',
      username: currentUser.username,
      xp: currentUser.xp,
      level: currentUser.level,
      streak: currentUser.streak,
      avatar_color: Colors.neonCyan,
      is_current_user: true,
      is_premium: false,
    });
  }

  return entries.slice(0, 20);
};

function LeaderboardRow({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return Colors.neonYellow;
      case 2:
        return Colors.gray300;
      case 3:
        return '#CD7F32';
      default:
        return Colors.gray600;
    }
  };

  const getRankIcon = (rank: number): keyof typeof Ionicons.glyphMap => {
    if (rank <= 3) return 'trophy';
    if (rank <= 10) return 'star';
    return 'star-outline';
  };

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    scale.value = withSpring(0.97, {}, () => {
      scale.value = withSpring(1);
    });
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      style={animatedStyle}
    >
      <TouchableOpacity
        style={[
          styles.leaderboardRow,
          entry.is_current_user && styles.currentUserRow,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {entry.is_current_user && (
          <LinearGradient
            colors={[Colors.neonCyan + '20', Colors.neonPurple + '20']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        )}

        <View style={styles.rankContainer}>
          <Ionicons
            name={getRankIcon(entry.rank)}
            size={entry.rank <= 3 ? 28 : 22}
            color={getMedalColor(entry.rank)}
          />
          <Text style={[styles.rankText, { color: getMedalColor(entry.rank) }]}>
            #{entry.rank}
          </Text>
        </View>

        <View style={styles.userInfo}>
          <View style={[styles.avatarPlaceholder, { borderColor: entry.avatar_color || Colors.neonPurple }]}>
            <LinearGradient
              colors={[entry.avatar_color + '40' || Colors.neonPurple + '40', 'transparent']}
              style={StyleSheet.absoluteFill}
            />
            <Text style={[styles.avatarText, { color: entry.avatar_color || Colors.neonPurple }]}>
              {entry.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <View style={styles.usernameRow}>
              <Text style={styles.username} numberOfLines={1}>
                {entry.username}
                {entry.is_current_user && <Text style={styles.youLabel}> (You)</Text>}
              </Text>
              {entry.is_premium && (
                <View style={styles.premiumBadge}>
                  <Ionicons name="diamond" size={12} color={Colors.neonCyan} />
                </View>
              )}
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statChip}>
                <Ionicons name="flash" size={12} color={Colors.neonYellow} />
                <Text style={styles.statChipText}>Lvl {entry.level}</Text>
              </View>
              <View style={styles.statChip}>
                <Ionicons name="flame" size={12} color={Colors.neonOrange} />
                <Text style={styles.statChipText}>{entry.streak}d</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.xpContainer}>
          <Text style={styles.xpValue}>{entry.xp.toLocaleString()}</Text>
          <Text style={styles.xpLabel}>XP</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function EliteArenaScreen() {
  return (
    <PremiumGate featureName="Elite Arena">
      <EliteArenaScreenInner />
    </PremiumGate>
  );
}

function EliteArenaScreenInner() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userProgress } = useAppStore();
  const { isPremium } = useSubscriptionStore();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<'weekly' | 'monthly' | 'all-time'>('all-time');
  const [useSupabase, setUseSupabase] = useState(true);

  const loadLeaderboard = useCallback(async () => {
    try {
      if (useSupabase) {
        // Try to fetch from Supabase
        const { data, error } = await supabase
          .from('leaderboard')
          .select('*')
          .order('xp', { ascending: false })
          .limit(50);

        if (error) throw error;

        if (data && data.length > 0) {
          const entries: LeaderboardEntry[] = data.map((item, index) => ({
            rank: index + 1,
            user_id: item.user_id,
            username: item.username || `User${index}`,
            xp: item.xp || 0,
            level: item.level || 1,
            streak: item.streak || 0,
            avatar_color: item.avatar_color || Colors.neonPurple,
            is_current_user: false,
            is_premium: item.is_premium || false,
          }));

          // Add current user if not in list
          const currentUserInList = entries.find(e => e.is_current_user);
          if (!currentUserInList) {
            const currentUserRank = entries.findIndex(e => e.xp < userProgress.totalXP);
            if (currentUserRank !== -1) {
              entries.splice(currentUserRank, 0, {
                rank: currentUserRank + 1,
                user_id: 'current',
                username: 'You',
                xp: userProgress.totalXP,
                level: userProgress.level,
                streak: userProgress.currentStreak,
                avatar_color: Colors.neonCyan,
                is_current_user: true,
                is_premium: isPremium,
              });
            }
          }

          setLeaderboard(entries.slice(0, 20));
          return;
        }
      }
    } catch (error) {
      console.log('Supabase leaderboard not available, using mock data');
      setUseSupabase(false);
    }

    // Fallback to mock data
    const currentUser = {
      username: 'You',
      xp: userProgress.totalXP,
      streak: userProgress.currentStreak,
      level: userProgress.level,
    };
    setLeaderboard(generateMockLeaderboard(currentUser));
  }, [userProgress, timeFrame, useSupabase, isPremium]);

  useEffect(() => {
    loadLeaderboard().finally(() => setLoading(false));
  }, [loadLeaderboard]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await loadLeaderboard();
    setRefreshing(false);
  };

  const TimeFrameButton = ({ value, label }: { value: typeof timeFrame; label: string }) => (
    <TouchableOpacity
      style={[styles.timeFrameButton, timeFrame === value && styles.timeFrameButtonActive]}
      onPress={() => {
        setTimeFrame(value);
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }}
    >
      {timeFrame === value && (
        <LinearGradient
          colors={[Colors.neonCyan + '20', Colors.neonPurple + '20']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <Text style={[styles.timeFrameText, timeFrame === value && styles.timeFrameTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const currentUserEntry = leaderboard.find(e => e.is_current_user);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <CyberBackground />

      {/* Header */}
      <Animated.View entering={FadeInDown} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <LinearGradient
            colors={[Colors.neonYellow, Colors.neonOrange]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.trophyGradient}
          >
            <Ionicons name="trophy" size={22} color={Colors.background} />
          </LinearGradient>
          <Text style={styles.title}>Elite Arena</Text>
        </View>
        <TouchableOpacity
          style={styles.premiumButton}
          onPress={() => router.push('/premium')}
        >
          <Ionicons name="diamond" size={20} color={isPremium ? Colors.neonCyan : Colors.gray400} />
        </TouchableOpacity>
      </Animated.View>

      {/* Subtitle */}
      <Animated.View entering={FadeInUp.delay(100)} style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>
          Top Algorithm Masters Worldwide
        </Text>
        {!useSupabase && (
          <View style={styles.offlineBadge}>
            <Ionicons name="cloud-offline" size={12} color={Colors.neonOrange} />
            <Text style={styles.offlineText}>Demo Mode</Text>
          </View>
        )}
      </Animated.View>

      {/* Time Frame Selector */}
      <Animated.View entering={FadeInUp.delay(150)} style={styles.timeFrameContainer}>
        <TimeFrameButton value="weekly" label="Week" />
        <TimeFrameButton value="monthly" label="Month" />
        <TimeFrameButton value="all-time" label="All Time" />
      </Animated.View>

      {/* Stats Header */}
      <Animated.View entering={FadeInUp.delay(200)} style={styles.statsHeader}>
        <View style={styles.statCard}>
          <LinearGradient
            colors={[Colors.neonCyan + '20', 'transparent']}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons name="people" size={22} color={Colors.neonCyan} />
          <Text style={styles.statValue}>{leaderboard.length.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Competitors</Text>
        </View>
        <View style={[styles.statCard, styles.statCardCenter]}>
          <LinearGradient
            colors={[Colors.neonYellow + '20', 'transparent']}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons name="medal" size={22} color={Colors.neonYellow} />
          <Text style={[styles.statValue, { color: Colors.neonYellow }]}>
            #{currentUserEntry?.rank || 'N/A'}
          </Text>
          <Text style={styles.statLabel}>Your Rank</Text>
        </View>
        <View style={styles.statCard}>
          <LinearGradient
            colors={[Colors.neonPurple + '20', 'transparent']}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons name="flash" size={22} color={Colors.neonPurple} />
          <Text style={[styles.statValue, { color: Colors.neonPurple }]}>
            {userProgress.totalXP.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Your XP</Text>
        </View>
      </Animated.View>

      {/* Leaderboard */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.neonCyan}
            colors={[Colors.neonCyan]}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading leaderboard...</Text>
          </View>
        ) : (
          leaderboard.map((entry, index) => (
            <LeaderboardRow key={`${entry.user_id}-${entry.rank}`} entry={entry} index={index} />
          ))
        )}
      </ScrollView>

      {/* Challenge Button */}
      <Animated.View
        entering={FadeInUp.delay(300)}
        style={[styles.challengeContainer, { paddingBottom: insets.bottom || Spacing.md }]}
      >
        <TouchableOpacity
          style={styles.challengeButton}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            router.push('/game/battle-arena' as any);
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[Colors.neonCyan, Colors.neonPurple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons name="game-controller" size={24} color={Colors.white} />
          <Text style={styles.challengeButtonText}>Enter Battle Arena</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.white} />
        </TouchableOpacity>
      </Animated.View>
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
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray700,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  trophyGradient: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  premiumButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray700,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.neonOrange + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  offlineText: {
    fontSize: FontSizes.xs,
    color: Colors.neonOrange,
    fontWeight: '600',
  },
  timeFrameContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  timeFrameButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray700,
    overflow: 'hidden',
  },
  timeFrameButtonActive: {
    borderColor: Colors.neonCyan,
  },
  timeFrameText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.gray400,
  },
  timeFrameTextActive: {
    color: Colors.neonCyan,
  },
  statsHeader: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray700,
    overflow: 'hidden',
  },
  statCardCenter: {
    borderColor: Colors.neonYellow + '50',
  },
  statValue: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  loadingText: {
    fontSize: FontSizes.md,
    color: Colors.gray400,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.gray700,
  },
  currentUserRow: {
    borderColor: Colors.neonCyan,
    borderWidth: 2,
  },
  rankContainer: {
    width: 60,
    alignItems: 'center',
    gap: 2,
  },
  rankText: {
    fontSize: FontSizes.xs,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatarText: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
  },
  userDetails: {
    flex: 1,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  username: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  youLabel: {
    color: Colors.neonCyan,
    fontSize: FontSizes.sm,
  },
  premiumBadge: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neonCyan + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.gray800,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  statChipText: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
    fontWeight: '600',
  },
  xpContainer: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  xpValue: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: Colors.neonLime,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  xpLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
  },
  challengeContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.gray800,
  },
  challengeButton: {
    height: 52,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    overflow: 'hidden',
    ...Shadows.glow,
  },
  challengeButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.white,
  },
});
