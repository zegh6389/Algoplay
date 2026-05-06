import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/stat_card.dart';
import '../../../shared/widgets/section_header.dart';
import '../../../shared/widgets/progress_indicator_bar.dart';
import '../data/stats_repository.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// Provider for [StatsRepository].
// ═══════════════════════════════════════════════════════════════════════════════
final statsRepositoryProvider = Provider<StatsRepository>((ref) {
  return StatsRepository();
});

/// Provider that loads stats asynchronously.
final statsProvider = FutureProvider<UserStats>((ref) async {
  final repo = ref.watch(statsRepositoryProvider);
  return repo.loadStats();
});

// ═══════════════════════════════════════════════════════════════════════════════
/// Stats Page — Statistics screen with overview cards, category progress,
/// weekly activity bars, and recent activity feed.
// ═══════════════════════════════════════════════════════════════════════════════
class StatsPage extends ConsumerWidget {
  const StatsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(statsProvider);

    return Scaffold(
      backgroundColor: AppColors.card,
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.xl,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header ──────────────────────────────────────────────────────
            Text('Statistics', style: AppTypography.h1),
            const SizedBox(height: AppSpacing.xl),

            // ── Overview 2×2 Grid ───────────────────────────────────────────
            _buildOverviewGrid(statsAsync),
            const SizedBox(height: AppSpacing.xxl),

            // ── Category Progress ───────────────────────────────────────────
            SectionHeader(title: 'Category Progress'),
            const SizedBox(height: AppSpacing.md),
            _buildCategoryProgress(statsAsync),
            const SizedBox(height: AppSpacing.xxl),

            // ── Weekly Activity ─────────────────────────────────────────────
            SectionHeader(title: 'This Week'),
            const SizedBox(height: AppSpacing.md),
            _buildWeeklyActivity(statsAsync),
            const SizedBox(height: AppSpacing.xxl),

            // ── Recent Activity ─────────────────────────────────────────────
            SectionHeader(title: 'Recent Activity'),
            const SizedBox(height: AppSpacing.md),
            _buildRecentActivity(statsAsync),
            const SizedBox(height: AppSpacing.xl),
          ],
        ),
      ),
    );
  }

  // ── Overview Grid ─────────────────────────────────────────────────────────

  Widget _buildOverviewGrid(AsyncValue<UserStats> statsAsync) {
    final stats = statsAsync.valueOrNull;
    final repo = StatsRepository();

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: AppSpacing.md,
      crossAxisSpacing: AppSpacing.md,
      childAspectRatio: 1.45,
      children: [
        StatCard(
          title: 'Algorithms Learned',
          value: '${stats?.algorithmsCompleted ?? 0}',
          icon: Icons.school,
          color: AppColors.primary500,
        ),
        StatCard(
          title: 'Total XP',
          value: '${stats?.totalXP ?? 0}',
          icon: Icons.sports_esports,
          color: AppColors.secondary500,
        ),
        StatCard(
          title: 'Current Streak',
          value: '${stats != null ? repo.getStreak(stats) : 0}',
          icon: Icons.local_fire_department,
          color: AppColors.solarGold,
        ),
        StatCard(
          title: 'Active Days',
          value: '${stats?.activityMap.length ?? 0}',
          icon: Icons.track_changes,
          color: AppColors.success600,
        ),
      ],
    );
  }

  // ── Category Progress ─────────────────────────────────────────────────────

  Widget _buildCategoryProgress(AsyncValue<UserStats> statsAsync) {
    final stats = statsAsync.valueOrNull;
    final breakdown = stats?.categoryBreakdown ?? {};

    // Category metadata: label, color, and total available
    const categoryMeta = <String, _CategoryMeta>{
      'Sorting':   _CategoryMeta(total: 12, color: AppColors.catSorting),
      'Searching': _CategoryMeta(total: 10, color: AppColors.catSearching),
      'Graphs':    _CategoryMeta(total: 10, color: AppColors.catGraphs),
      'DP':        _CategoryMeta(total: 8,  color: AppColors.catDp),
      'Greedy':    _CategoryMeta(total: 8,  color: AppColors.catGreedy),
      'Trees':     _CategoryMeta(total: 6,  color: AppColors.catTrees),
    };

    final categories = <Map<String, dynamic>>[
      for (final entry in categoryMeta.entries)
        {
          'label': entry.key,
          'current': breakdown[entry.key.toLowerCase()] ?? 0,
          'total': entry.value.total,
          'color': entry.value.color,
        },
    ];

    return Column(
      children: [
        for (int i = 0; i < categories.length; i++) ...[
          ProgressIndicatorBar(
            label: categories[i]['label'] as String,
            current: categories[i]['current'] as int,
            total: categories[i]['total'] as int,
            color: categories[i]['color'] as Color,
          ),
          if (i < categories.length - 1)
            const SizedBox(height: AppSpacing.md),
        ],
      ],
    );
  }

  // ── Weekly Activity Bar Chart ─────────────────────────────────────────────

  Widget _buildWeeklyActivity(AsyncValue<UserStats> statsAsync) {
    final stats = statsAsync.valueOrNull;
    final repo = StatsRepository();

    // Real activity data from repository
    final activityData = stats != null
        ? repo.getWeeklyActivity(stats)
        : List<double>.filled(7, 0.0);

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    final maxActivity =
        activityData.reduce((a, b) => a > b ? a : b).clamp(1.0, double.infinity);
    final todayIndex = repo.todayWeekdayIndex;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: AppRadius.lgBorder,
        boxShadow: AppShadows.sm,
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final barMaxHeight = 120.0;
          return Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              for (int i = 0; i < 7; i++)
                _ActivityBar(
                  label: dayLabels[i],
                  height: (activityData[i] / maxActivity) * barMaxHeight,
                  isToday: i == todayIndex,
                ),
            ],
          );
        },
      ),
    );
  }

  // ── Recent Activity ───────────────────────────────────────────────────────

  Widget _buildRecentActivity(AsyncValue<UserStats> statsAsync) {
    final stats = statsAsync.valueOrNull;
    if (stats == null) {
      return const SizedBox(
        height: 80,
        child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
      );
    }

    final activityMap = stats.activityMap;
    if (activityMap.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.xl),
        child: Center(
          child: Text(
            'No activity yet. Start playing to see your history!',
            style: AppTypography.caption,
            textAlign: TextAlign.center,
          ),
        ),
      );
    }

    // Show last 5 activity sessions, most recent first
    final sortedDays = activityMap.keys.toList()
      ..sort((a, b) => b.compareTo(a)); // descending

    final recentDays = sortedDays.take(5).toList();

    return Column(
      children: [
        for (int i = 0; i < recentDays.length; i++) ...[
          _ActivityTile(
            item: _ActivityItem(
              icon: Icons.access_time,
              title: _formatDate(recentDays[i]),
              time: '${activityMap[recentDays[i]]!.round()} min',
              xp: (activityMap[recentDays[i]]! * 5).round(), // estimate XP from minutes
            ),
          ),
          if (i < recentDays.length - 1)
            const Divider(height: 1),
        ],
      ],
    );
  }

  String _formatDate(String isoDate) {
    try {
      final parts = isoDate.split('-');
      final date = DateTime(
        int.parse(parts[0]),
        int.parse(parts[1]),
        int.parse(parts[2]),
      );
      final now = DateTime.now();
      final diff = now.difference(date).inDays;
      if (diff == 0) return 'Today';
      if (diff == 1) return 'Yesterday';
      if (diff < 7) return '$diff days ago';
      return '${date.month}/${date.day}/${date.year}';
    } catch (_) {
      return isoDate;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Metadata for a category (total items available + color)
// ═══════════════════════════════════════════════════════════════════════════════
class _CategoryMeta {
  final int total;
  final Color color;
  const _CategoryMeta({required this.total, required this.color});
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Single vertical activity bar widget
// ═══════════════════════════════════════════════════════════════════════════════
class _ActivityBar extends StatelessWidget {
  const _ActivityBar({
    required this.label,
    required this.height,
    required this.isToday,
  });

  final String label;
  final double height;
  final bool isToday;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 28,
          height: height.clamp(4.0, 120.0),
          decoration: BoxDecoration(
            color: isToday ? AppColors.primary500 : AppColors.primary100,
            borderRadius: BorderRadius.circular(6),
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(
          label,
          style: AppTypography.overline.copyWith(
            color: isToday ? AppColors.primary500 : AppColors.textMuted,
            fontWeight: isToday ? FontWeight.w700 : FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Data model for a recent activity item
// ═══════════════════════════════════════════════════════════════════════════════
class _ActivityItem {
  final IconData icon;
  final String title;
  final String time;
  final int xp;

  const _ActivityItem({
    required this.icon,
    required this.title,
    required this.time,
    required this.xp,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Tile row for a recent activity item
// ═══════════════════════════════════════════════════════════════════════════════
class _ActivityTile extends StatelessWidget {
  const _ActivityTile({required this.item});

  final _ActivityItem item;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(
        vertical: AppSpacing.md,
      ),
      child: Row(
        children: [
          // Icon
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.primary100,
              borderRadius: AppRadius.mdBorder,
            ),
            alignment: Alignment.center,
            child: Icon(item.icon, size: 18, color: AppColors.primary500),
          ),

          const SizedBox(width: AppSpacing.md),

          // Title + timestamp
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.title, style: AppTypography.body),
                const SizedBox(height: 2),
                Text(item.time, style: AppTypography.caption),
              ],
            ),
          ),

          // XP chip
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.sm,
              vertical: AppSpacing.xs,
            ),
            decoration: BoxDecoration(
              color: AppColors.secondary100,
              borderRadius: AppRadius.smBorder,
            ),
            child: Text(
              '+${item.xp} XP',
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: AppColors.secondary700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
