// Elite Arena - Global Leaderboards Screen
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import CyberBackground from '@/components/CyberBackground';

interface LeaderboardEntry {
  rank: number;
  username: string;
  xp: number;
  streak: number;
  avatar?: string;
  isCurrentUser?: boolean;
}

// Mock data - in production, this would come from Supabase
const generateMockLeaderboard = (currentUser: { username: string; xp: number; streak: number }): LeaderboardEntry[] => {
  const names = [
    'ByteMaster3000', 'AlgoNinja', 'CodeWarrior', 'DataDragon', 'RecursiveRebel',
    'StackOverflowKing', 'HeapHero', 'TreeTitan', 'GraphGuru', 'DPDynamo',
    'SortingSage', 'SearchSorcerer', 'ComplexityCrusher', 'OptimizationOracle',
    'MemoryMaestro', 'RuntimeRuler', 'BigOBoss', 'AlgorithmAce',
  ];

  const entries: LeaderboardEntry[] = names.slice(0, 15).map((name, index) => ({
    rank: index + 1,
    username: name,
    xp: 50000 - index * 2500 - Math.floor(Math.random() * 1000),
    streak: Math.floor(Math.random() * 100) + 10,
    isCurrentUser: false,
  }));

  // Find or insert current user
  const currentUserIndex = entries.findIndex(e => e.xp < currentUser.xp);
  if (currentUserIndex !== -1) {
    entries.splice(currentUserIndex, 0, {
      rank: currentUserIndex + 1,
      username: currentUser.username,
      xp: currentUser.xp,
      streak: currentUser.streak,
      isCurrentUser: true,
    });
    // Rerank
    entries.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });
  } else {
    entries.push({
      rank: entries.length + 1,
      username: currentUser.username,
      xp: currentUser.xp,
      streak: currentUser.streak,
      isCurrentUser: true,
    });
  }

  return entries.slice(0, 20);
};

function LeaderboardRow({ entry, index }: { entry: LeaderboardEntry; index: number }) {
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

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return 'trophy';
    return 'star-outline';
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      style={[
        styles.leaderboardRow,
        entry.isCurrentUser && styles.currentUserRow,
      ]}
    >
      {entry.isCurrentUser && (
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
          size={entry.rank <= 3 ? 24 : 20}
          color={getMedalColor(entry.rank)}
        />
        <Text style={[styles.rankText, { color: getMedalColor(entry.rank) }]}>
          #{entry.rank}
        </Text>
      </View>

      <View style={styles.userInfo}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {entry.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.username} numberOfLines={1}>
            {entry.username}
            {entry.isCurrentUser && <Text style={styles.youLabel}> (You)</Text>}
          </Text>
          <View style={styles.streakContainer}>
            <Ionicons name="flame" size={14} color={Colors.neonOrange} />
            <Text style={styles.streakText}>{entry.streak} day streak</Text>
          </View>
        </View>
      </View>

      <View style={styles.xpContainer}>
        <Text style={styles.xpValue}>{entry.xp.toLocaleString()}</Text>
        <Text style={styles.xpLabel}>XP</Text>
      </View>
    </Animated.View>
  );
}

export default function EliteArenaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userProgress } = useAppStore();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFrame, setTimeFrame] = useState<'weekly' | 'monthly' | 'all-time'>('all-time');

  useEffect(() => {
    loadLeaderboard();
  }, [timeFrame]);

  const loadLeaderboard = () => {
    const currentUser = {
      username: 'You',
      xp: userProgress.totalXP,
      streak: userProgress.currentStreak,
    };
    setLeaderboard(generateMockLeaderboard(currentUser));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // Simulate API call
    setTimeout(() => {
      loadLeaderboard();
      setRefreshing(false);
    }, 1000);
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
      <Text style={[styles.timeFrameText, timeFrame === value && styles.timeFrameTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

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
          <Ionicons name="trophy" size={28} color={Colors.neonYellow} />
          <Text style={styles.title}>Elite Arena</Text>
        </View>
        <View style={{ width: 40 }} />
      </Animated.View>

      {/* Subtitle */}
      <Animated.View entering={FadeInUp.delay(100)} style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>
          Top Algorithm Masters Worldwide
        </Text>
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
          <Ionicons name="people" size={20} color={Colors.neonCyan} />
          <Text style={styles.statValue}>{leaderboard.length.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Competitors</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trending-up" size={20} color={Colors.neonLime} />
          <Text style={styles.statValue}>#{leaderboard.find(e => e.isCurrentUser)?.rank || 'N/A'}</Text>
          <Text style={styles.statLabel}>Your Rank</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="flash" size={20} color={Colors.neonPurple} />
          <Text style={styles.statValue}>{userProgress.totalXP.toLocaleString()}</Text>
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
        {leaderboard.map((entry, index) => (
          <LeaderboardRow key={`${entry.username}-${entry.rank}`} entry={entry} index={index} />
        ))}
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
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitleContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
    textAlign: 'center',
    fontStyle: 'italic',
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
  },
  timeFrameButtonActive: {
    backgroundColor: Colors.neonCyan + '20',
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
    ...Shadows.small,
  },
  statValue: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
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
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.small,
    overflow: 'hidden',
  },
  currentUserRow: {
    borderWidth: 2,
    borderColor: Colors.neonCyan,
  },
  rankContainer: {
    width: 60,
    alignItems: 'center',
    gap: 2,
  },
  rankText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neonPurple + '30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neonPurple,
  },
  avatarText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.neonPurple,
  },
  userDetails: {
    flex: 1,
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
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
  },
  xpContainer: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  xpValue: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.neonLime,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  xpLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
  },
});
