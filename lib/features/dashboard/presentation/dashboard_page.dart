import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../features/learn/data/algorithm_data.dart';
import '../../../../shared/providers/app_providers.dart';
import '../../../../shared/widgets/stat_card.dart';
import '../../../../shared/widgets/progress_indicator_bar.dart';
import '../../../../shared/widgets/skill_category_card.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// Dashboard Page — comprehensive user progress overview.
///
/// Shows:
///   - Level & XP progress
///   - Per-category completion progress
///   - Algorithm mastery heatmap
///   - Recent activity / quiz scores
///   - Achievement badges
///   - Quick stats (total XP, streak, games played)
/// ═══════════════════════════════════════════════════════════════════════════════

class DashboardPage extends ConsumerWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final progress = ref.watch(userProgressProvider);

    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // ── App bar ──────────────────────────────────────────────────
            SliverAppBar(
              backgroundColor: AppColors.card,
              elevation: 0,
              pinned: true,
              expandedHeight: 80,
              leading: IconButton(
                icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
                onPressed: () => Navigator.of(context).pop(),
              ),
              flexibleSpace: FlexibleSpaceBar(
                title: const Text(
                  'Dashboard',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                centerTitle: true,
                titlePadding: const EdgeInsets.only(bottom: 16),
              ),
            ),

            // ── Content ───────────────────────────────────────────────────
            SliverPadding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  // ── 1. Level & XP card ──────────────────────────────
                  _LevelXPCard(progress: progress),
                  const SizedBox(height: AppSpacing.xl),

                  // ── 2. Quick stats row ───────────────────────────────
                  _QuickStatsRow(progress: progress),
                  const SizedBox(height: AppSpacing.xl),

                  // ── 3. Category progress ────────────────────────────
                  _CategoryProgressSection(progress: progress),
                  const SizedBox(height: AppSpacing.xl),

                  // ── 4. Algorithm mastery ─────────────────────────────
                  _AlgorithmMasterySection(progress: progress),
                  const SizedBox(height: AppSpacing.xl),

                  // ── 5. Recent activity ───────────────────────────────
                  _RecentActivitySection(progress: progress),
                  const SizedBox(height: AppSpacing.xl),

                  // ── 6. Achievements ──────────────────────────────────
                  _AchievementsSection(progress: progress),
                  const SizedBox(height: AppSpacing.xxl),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Level & XP Card
// ─────────────────────────────────────────────────────────────────────────────

class _LevelXPCard extends StatelessWidget {
  const _LevelXPCard({required this.progress});

  final dynamic progress;

  @override
  Widget build(BuildContext context) {
    final xpInLevel = (progress.totalXP as int) % 100;
    final nextLevelXP = 100;
    final level = progress.level as int;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.primary500, AppColors.primary700],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: AppRadius.xlBorder,
        boxShadow: [
          BoxShadow(
            color: AppColors.primary500.withValues(alpha: 0.3),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Level badge
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: AppRadius.lgBorder,
                ),
                alignment: Alignment.center,
                child: Text(
                  '$level',
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.md),

              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Level $level',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${progress.totalXP} Total XP',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.white.withValues(alpha: 0.85),
                      ),
                    ),
                  ],
                ),
              ),

              // XP to next level
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '$xpInLevel / $nextLevelXP',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  SizedBox(
                    width: 80,
                    child: ClipRRect(
                      borderRadius: AppRadius.fullBorder,
                      child: LinearProgressIndicator(
                        value: xpInLevel / nextLevelXP,
                        backgroundColor: Colors.white.withValues(alpha: 0.3),
                        valueColor: const AlwaysStoppedAnimation(Colors.white),
                        minHeight: 6,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Quick Stats Row
// ─────────────────────────────────────────────────────────────────────────────

class _QuickStatsRow extends StatelessWidget {
  const _QuickStatsRow({required this.progress});

  final dynamic progress;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _QuickStatCard(
            icon: Icons.local_fire_department,
            label: 'Streak',
            value: '${progress.currentStreak}',
            subtitle: 'days',
            color: AppColors.secondary500,
          ),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: _QuickStatCard(
            icon: Icons.check_circle,
            label: 'Completed',
            value: '${(progress.completedAlgorithms as List).length}',
            subtitle: 'algorithms',
            color: AppColors.success600,
          ),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: _QuickStatCard(
            icon: Icons.sports_esports,
            label: 'Challenges',
            value: '${(progress.challengeHistory as List).length}',
            subtitle: 'done',
            color: AppColors.catSorting,
          ),
        ),
      ],
    );
  }
}

class _QuickStatCard extends StatelessWidget {
  const _QuickStatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.subtitle,
    required this.color,
  });

  final IconData icon;
  final String label;
  final String value;
  final String subtitle;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: AppRadius.lgBorder,
        boxShadow: AppShadows.sm,
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: AppSpacing.sm),
          Text(
            value,
            style: AppTypography.h2.copyWith(color: color),
          ),
          Text(label, style: AppTypography.caption),
          Text(
            subtitle,
            style: AppTypography.overline,
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Category Progress
// ─────────────────────────────────────────────────────────────────────────────

class _CategoryProgressSection extends StatelessWidget {
  const _CategoryProgressSection({required this.progress});

  final dynamic progress;

  @override
  Widget build(BuildContext context) {
    final completedIds = progress.completedAlgorithms as List<String>;

    // Count completed per category
    final categoryCounts = <AlgorithmCategory, _CategoryCount>{};
    for (final cat in AlgorithmCategory.values) {
      final allInCat = allAlgorithms.where((a) => a.category == cat).toList();
      final completedInCat = allInCat.where((a) => completedIds.contains(a.id)).length;
      categoryCounts[cat] = _CategoryCount(
        total: allInCat.length,
        completed: completedInCat,
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Category Progress', style: AppTypography.h2),
        const SizedBox(height: AppSpacing.lg),

        ...AlgorithmCategory.values.map((cat) {
          final count = categoryCounts[cat]!;
          final color = _categoryColor(cat);
          final pct = count.total > 0 ? count.completed / count.total : 0.0;

          return Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.md),
            child: Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.card,
                borderRadius: AppRadius.mdBorder,
                boxShadow: AppShadows.sm,
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: color.withValues(alpha: 0.15),
                          borderRadius: AppRadius.smBorder,
                        ),
                        child: Icon(
                          _categoryIcon(cat),
                          color: color,
                          size: 18,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Text(cat.label, style: AppTypography.bodyBold),
                      ),
                      Text(
                        '${count.completed}/${count.total}',
                        style: AppTypography.caption,
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  ClipRRect(
                    borderRadius: AppRadius.fullBorder,
                    child: LinearProgressIndicator(
                      value: pct,
                      backgroundColor: AppColors.sunken,
                      valueColor: AlwaysStoppedAnimation(color),
                      minHeight: 6,
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  Color _categoryColor(AlgorithmCategory cat) {
    switch (cat) {
      case AlgorithmCategory.sorting:
        return AppColors.catSorting;
      case AlgorithmCategory.searching:
        return AppColors.catSearching;
      case AlgorithmCategory.graphs:
        return AppColors.catGraphs;
      case AlgorithmCategory.dp:
        return AppColors.catDp;
      case AlgorithmCategory.greedy:
        return AppColors.catGreedy;
      case AlgorithmCategory.trees:
        return AppColors.catTrees;
    }
  }

  IconData _categoryIcon(AlgorithmCategory cat) {
    switch (cat) {
      case AlgorithmCategory.sorting:
        return Icons.sort;
      case AlgorithmCategory.searching:
        return Icons.search;
      case AlgorithmCategory.graphs:
        return Icons.account_tree;
      case AlgorithmCategory.dp:
        return Icons.grid_on;
      case AlgorithmCategory.greedy:
        return Icons.bolt;
      case AlgorithmCategory.trees:
        return Icons.park;
    }
  }
}

class _CategoryCount {
  final int total;
  final int completed;
  const _CategoryCount({required this.total, required this.completed});
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Algorithm Mastery
// ─────────────────────────────────────────────────────────────────────────────

class _AlgorithmMasterySection extends StatelessWidget {
  const _AlgorithmMasterySection({required this.progress});

  final dynamic progress;

  @override
  Widget build(BuildContext context) {
    final mastery = progress.algorithmMastery as Map<String, dynamic>;

    if (mastery.isEmpty) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Algorithm Mastery', style: AppTypography.h2),
          const SizedBox(height: AppSpacing.lg),
          Container(
            padding: const EdgeInsets.all(AppSpacing.xl),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: AppRadius.lgBorder,
              boxShadow: AppShadows.sm,
            ),
            child: const Center(
              child: Column(
                children: [
                  Icon(Icons.psychology, size: 48, color: AppColors.textMuted),
                  SizedBox(height: AppSpacing.md),
                  Text('Complete quizzes to see mastery', style: AppTypography.caption),
                ],
              ),
            ),
          ),
        ],
      );
    }

    // Get top 5 most-practiced algorithms
    final sorted = mastery.entries.toList()
      ..sort((a, b) {
        final aScore = (a.value as dynamic).masteryLevel as double;
        final bScore = (b.value as dynamic).masteryLevel as double;
        return bScore.compareTo(aScore);
      });

    final top = sorted.take(5).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Top Mastery', style: AppTypography.h2),
        const SizedBox(height: AppSpacing.lg),

        ...top.map((entry) {
          final algoId = entry.key as String;
          final data = entry.value as dynamic;
          final algoInfo = allAlgorithms.firstWhere(
            (a) => a.id == algoId,
            orElse: () => allAlgorithms.first,
          );
          final level = (data.masteryLevel as double);
          final color = _categoryColor(algoInfo.category);

          return Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.md),
            child: Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.card,
                borderRadius: AppRadius.mdBorder,
                boxShadow: AppShadows.sm,
              ),
              child: Row(
                children: [
                  // Category color dot
                  Container(
                    width: 8,
                    height: 40,
                    decoration: BoxDecoration(
                      color: color,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),

                  // Name + category
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(algoInfo.name, style: AppTypography.bodyBold),
                        Text(
                          algoInfo.category.label,
                          style: AppTypography.overline,
                        ),
                      ],
                    ),
                  ),

                  // Mastery level
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '${level.round()}%',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: _masteryColor(level),
                        ),
                      ),
                      const SizedBox(height: 4),
                      SizedBox(
                        width: 60,
                        child: ClipRRect(
                          borderRadius: AppRadius.fullBorder,
                          child: LinearProgressIndicator(
                            value: level / 100,
                            backgroundColor: AppColors.sunken,
                            valueColor: AlwaysStoppedAnimation(_masteryColor(level)),
                            minHeight: 4,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  Color _categoryColor(AlgorithmCategory cat) {
    switch (cat) {
      case AlgorithmCategory.sorting:
        return AppColors.catSorting;
      case AlgorithmCategory.searching:
        return AppColors.catSearching;
      case AlgorithmCategory.graphs:
        return AppColors.catGraphs;
      case AlgorithmCategory.dp:
        return AppColors.catDp;
      case AlgorithmCategory.greedy:
        return AppColors.catGreedy;
      case AlgorithmCategory.trees:
        return AppColors.catTrees;
    }
  }

  Color _masteryColor(double level) {
    if (level >= 80) return AppColors.success600;
    if (level >= 50) return AppColors.solarGold;
    if (level >= 25) return AppColors.warning600;
    return AppColors.error600;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Recent Activity
// ─────────────────────────────────────────────────────────────────────────────

class _RecentActivitySection extends StatelessWidget {
  const _RecentActivitySection({required this.progress});

  final dynamic progress;

  @override
  Widget build(BuildContext context) {
    final quizHistory = progress.quizHistory as List;
    final challengeHistory = progress.challengeHistory as List;

    final allActivity = <_ActivityItem>[];

    for (final q in quizHistory) {
      allActivity.add(_ActivityItem(
        type: _ActivityType.quiz,
        title: 'Quiz: ${_algoName(q.algorithmId)}',
        subtitle: '${q.correctAnswers}/${q.totalQuestions} correct',
        timestamp: q.timestamp,
        xp: (q.score * 0.1).round(),
      ));
    }

    for (final c in challengeHistory) {
      allActivity.add(_ActivityItem(
        type: _ActivityType.challenge,
        title: 'Challenge: ${c.challengeId}',
        subtitle: c.passed ? 'Passed' : 'Failed',
        timestamp: c.timestamp,
        xp: c.passed ? 20 : 0,
      ));
    }

    // Sort by timestamp descending (most recent first)
    allActivity.sort((a, b) => b.timestamp.compareTo(a.timestamp));
    final recent = allActivity.take(5).toList();

    if (recent.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Recent Activity', style: AppTypography.h2),
        const SizedBox(height: AppSpacing.lg),

        Container(
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: AppRadius.lgBorder,
            boxShadow: AppShadows.sm,
          ),
          child: Column(
            children: recent.asMap().entries.map((entry) {
              final index = entry.key;
              final item = entry.value;
              final isLast = index == recent.length - 1;

              return Column(
                children: [
                  ListTile(
                    leading: Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: item.type == _ActivityType.quiz
                            ? AppColors.primary100
                            : AppColors.success100,
                        borderRadius: AppRadius.smBorder,
                      ),
                      child: Icon(
                        item.type == _ActivityType.quiz
                            ? Icons.quiz
                            : Icons.emoji_events,
                        color: item.type == _ActivityType.quiz
                            ? AppColors.primary500
                            : AppColors.success600,
                        size: 18,
                      ),
                    ),
                    title: Text(item.title, style: AppTypography.bodyBold),
                    subtitle: Text(item.subtitle, style: AppTypography.caption),
                    trailing: Text(
                      item.xp > 0 ? '+${item.xp} XP' : '',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.solarGold,
                      ),
                    ),
                  ),
                  if (!isLast) const Divider(height: 1),
                ],
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  String _algoName(String id) {
    return allAlgorithms
        .where((a) => a.id == id)
        .map((a) => a.name)
        .firstOrNull ?? id;
  }
}

enum _ActivityType { quiz, challenge }

class _ActivityItem {
  final _ActivityType type;
  final String title;
  final String subtitle;
  final String timestamp;
  final int xp;

  const _ActivityItem({
    required this.type,
    required this.title,
    required this.subtitle,
    required this.timestamp,
    required this.xp,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Achievements
// ─────────────────────────────────────────────────────────────────────────────

class _AchievementsSection extends StatelessWidget {
  const _AchievementsSection({required this.progress});

  final dynamic progress;

  @override
  Widget build(BuildContext context) {
    final achievements = _buildAchievements(progress);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Achievements', style: AppTypography.h2),
        const SizedBox(height: AppSpacing.lg),

        GridView.count(
          crossAxisCount: 3,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: AppSpacing.md,
          crossAxisSpacing: AppSpacing.md,
          childAspectRatio: 0.85,
          children: achievements.map((a) => _AchievementBadge(
            achievement: a,
            isUnlocked: a.isUnlockedFn(progress),
          )).toList(),
        ),
      ],
    );
  }

  List<_AchievementDef> _buildAchievements(dynamic progress) {
    final completed = progress.completedAlgorithms as List<String>;
    final streak = progress.currentStreak as int;
    final totalXP = progress.totalXP as int;
    final quizzes = progress.quizHistory as List;
    final challenges = progress.challengeHistory as List;

    return [
      _AchievementDef(
        id: 'first-sort',
        title: 'First Sort',
        icon: Icons.sort,
        color: AppColors.catSorting,
        description: 'Complete your first sorting algorithm',
        isUnlockedFn: (_) => completed.any((id) =>
            ['bubble-sort', 'selection-sort', 'insertion-sort'].contains(id)),
      ),
      _AchievementDef(
        id: 'streak-3',
        title: 'On Fire',
        icon: Icons.local_fire_department,
        color: AppColors.secondary500,
        description: '3-day learning streak',
        isUnlockedFn: (p) => (p.currentStreak as int) >= 3,
      ),
      _AchievementDef(
        id: 'streak-7',
        title: 'Week Warrior',
        icon: Icons.whatshot,
        color: AppColors.secondary900,
        description: '7-day learning streak',
        isUnlockedFn: (p) => (p.currentStreak as int) >= 7,
      ),
      _AchievementDef(
        id: 'xp-500',
        title: 'Rising Star',
        icon: Icons.star,
        color: AppColors.solarGold,
        description: 'Earn 500 total XP',
        isUnlockedFn: (p) => (p.totalXP as int) >= 500,
      ),
      _AchievementDef(
        id: 'xp-1000',
        title: 'XP Master',
        icon: Icons.stars,
        color: AppColors.solarAmber,
        description: 'Earn 1,000 total XP',
        isUnlockedFn: (p) => (p.totalXP as int) >= 1000,
      ),
      _AchievementDef(
        id: 'quiz-5',
        title: 'Quiz Taker',
        icon: Icons.quiz,
        color: AppColors.primary500,
        description: 'Complete 5 quizzes',
        isUnlockedFn: (p) => (p.quizHistory as List).length >= 5,
      ),
      _AchievementDef(
        id: 'all-sorting',
        title: 'Sort Master',
        icon: Icons.sort,
        color: AppColors.catSorting,
        description: 'Complete all sorting algorithms',
        isUnlockedFn: (p) {
          final ids = (p.completedAlgorithms as List<String>);
          return ['bubble-sort', 'selection-sort', 'insertion-sort',
                  'merge-sort', 'quick-sort', 'heap-sort']
              .every((id) => ids.contains(id));
        },
      ),
      _AchievementDef(
        id: 'all-searching',
        title: 'Search Expert',
        icon: Icons.search,
        color: AppColors.catSearching,
        description: 'Complete all searching algorithms',
        isUnlockedFn: (p) {
          final ids = (p.completedAlgorithms as List<String>);
          return ['linear-search', 'binary-search'].every((id) => ids.contains(id));
        },
      ),
      _AchievementDef(
        id: 'challenge-10',
        title: 'Challenger',
        icon: Icons.emoji_events,
        color: AppColors.success600,
        description: 'Complete 10 challenges',
        isUnlockedFn: (p) => (p.challengeHistory as List).length >= 10,
      ),
    ];
  }
}

class _AchievementDef {
  final String id;
  final String title;
  final IconData icon;
  final Color color;
  final String description;
  final bool Function(dynamic) isUnlockedFn;

  const _AchievementDef({
    required this.id,
    required this.title,
    required this.icon,
    required this.color,
    required this.description,
    required this.isUnlockedFn,
  });
}

class _AchievementBadge extends StatelessWidget {
  const _AchievementBadge({required this.achievement, required this.isUnlocked});

  final _AchievementDef achievement;
  final bool isUnlocked;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => _showAchievementDetail(context),
      child: Container(
        decoration: BoxDecoration(
          color: isUnlocked
              ? achievement.color.withValues(alpha: 0.12)
              : AppColors.sunken,
          borderRadius: AppRadius.lgBorder,
          border: Border.all(
            color: isUnlocked ? achievement.color.withValues(alpha: 0.3) : Colors.transparent,
            width: 1,
          ),
        ),
        padding: const EdgeInsets.all(AppSpacing.sm),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: isUnlocked
                    ? achievement.color.withValues(alpha: 0.2)
                    : AppColors.sunken,
                borderRadius: AppRadius.mdBorder,
              ),
              child: Icon(
                achievement.icon,
                color: isUnlocked
                    ? achievement.color
                    : AppColors.textMuted,
                size: 22,
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              achievement.title,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: isUnlocked ? AppColors.textPrimary : AppColors.textMuted,
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            if (isUnlocked) ...[
              const SizedBox(height: 2),
              const Icon(
                Icons.check_circle,
                color: AppColors.success600,
                size: 14,
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _showAchievementDetail(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.card,
        shape: RoundedRectangleBorder(borderRadius: AppRadius.xlBorder),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: isUnlocked
                    ? achievement.color.withValues(alpha: 0.15)
                    : AppColors.sunken,
                borderRadius: AppRadius.lgBorder,
              ),
              child: Icon(
                achievement.icon,
                color: isUnlocked ? achievement.color : AppColors.textMuted,
                size: 32,
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              achievement.title,
              style: AppTypography.h3,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              achievement.description,
              style: AppTypography.caption,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.md),
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.xs,
              ),
              decoration: BoxDecoration(
                color: isUnlocked
                    ? AppColors.success100
                    : AppColors.sunken,
                borderRadius: AppRadius.smBorder,
              ),
              child: Text(
                isUnlocked ? 'Unlocked!' : 'Locked',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: isUnlocked ? AppColors.success600 : AppColors.textMuted,
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }
}
