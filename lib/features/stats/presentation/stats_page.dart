import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/stat_card.dart';
import '../../../shared/widgets/section_header.dart';
import '../../../shared/widgets/progress_indicator_bar.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// Stats Page — Statistics screen with overview cards, category progress,
/// weekly activity bars, and recent activity feed.
// ═══════════════════════════════════════════════════════════════════════════════
class StatsPage extends ConsumerWidget {
  const StatsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
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
            _buildOverviewGrid(),
            const SizedBox(height: AppSpacing.xxl),

            // ── Category Progress ───────────────────────────────────────────
            SectionHeader(title: 'Category Progress'),
            const SizedBox(height: AppSpacing.md),
            _buildCategoryProgress(),
            const SizedBox(height: AppSpacing.xxl),

            // ── Weekly Activity ─────────────────────────────────────────────
            SectionHeader(title: 'This Week'),
            const SizedBox(height: AppSpacing.md),
            _buildWeeklyActivity(),
            const SizedBox(height: AppSpacing.xxl),

            // ── Recent Activity ─────────────────────────────────────────────
            SectionHeader(title: 'Recent Activity'),
            const SizedBox(height: AppSpacing.md),
            _buildRecentActivity(),
            const SizedBox(height: AppSpacing.xl),
          ],
        ),
      ),
    );
  }

  // ── Overview Grid ─────────────────────────────────────────────────────────

  Widget _buildOverviewGrid() {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: AppSpacing.md,
      crossAxisSpacing: AppSpacing.md,
      childAspectRatio: 1.45,
      children: const [
        StatCard(
          title: 'Algorithms Learned',
          value: '24',
          icon: Icons.school,
          color: AppColors.primary500,
        ),
        StatCard(
          title: 'Games Played',
          value: '156',
          icon: Icons.sports_esports,
          color: AppColors.secondary500,
        ),
        StatCard(
          title: 'Current Streak',
          value: '7',
          icon: Icons.local_fire_department,
          color: AppColors.solarGold,
        ),
        StatCard(
          title: 'Accuracy',
          value: '87%',
          icon: Icons.track_changes,
          color: AppColors.success600,
        ),
      ],
    );
  }

  // ── Category Progress ─────────────────────────────────────────────────────

  Widget _buildCategoryProgress() {
    const categories = <Map<String, dynamic>>[
      {'label': 'Sorting',   'current': 8,  'total': 12, 'color': AppColors.catSorting},
      {'label': 'Searching', 'current': 6,  'total': 10, 'color': AppColors.catSearching},
      {'label': 'Graphs',    'current': 4,  'total': 10, 'color': AppColors.catGraphs},
      {'label': 'DP',        'current': 3,  'total': 8,  'color': AppColors.catDp},
      {'label': 'Greedy',    'current': 5,  'total': 8,  'color': AppColors.catGreedy},
      {'label': 'Trees',     'current': 2,  'total': 6,  'color': AppColors.catTrees},
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

  Widget _buildWeeklyActivity() {
    // Mock data: activity hours per day (Mon–Sun)
    const activityData = [2.0, 3.5, 1.0, 4.0, 2.5, 5.0, 3.0];
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const maxActivity = 5.0;
    // Assume today is Saturday (index 5) for mock purposes
    const todayIndex = 5;

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

  Widget _buildRecentActivity() {
    const activities = [
      _ActivityItem(
        icon: Icons.check_circle,
        title: 'Completed Merge Sort',
        time: '2h ago',
        xp: 50,
      ),
      _ActivityItem(
        icon: Icons.emoji_events,
        title: 'Won Battle: Quick Sort',
        time: '4h ago',
        xp: 100,
      ),
      _ActivityItem(
        icon: Icons.quiz,
        title: 'Quiz: Binary Search',
        time: '6h ago',
        xp: 30,
      ),
      _ActivityItem(
        icon: Icons.trending_up,
        title: 'Level Up! Now Level 5',
        time: '1d ago',
        xp: 200,
      ),
      _ActivityItem(
        icon: Icons.local_fire_department,
        title: '5-Day Streak Bonus',
        time: '1d ago',
        xp: 75,
      ),
    ];

    return Column(
      children: [
        for (int i = 0; i < activities.length; i++) ...[
          _ActivityTile(item: activities[i]),
          if (i < activities.length - 1)
            const Divider(height: 1),
        ],
      ],
    );
  }
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
