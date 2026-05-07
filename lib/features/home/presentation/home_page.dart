import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:algoplay/core/theme/app_theme.dart';
import 'package:algoplay/shared/providers/app_providers.dart';
import 'package:algoplay/shared/providers/premium_provider.dart';
import 'package:algoplay/shared/widgets/section_header.dart';
import 'package:algoplay/shared/widgets/skill_category_card.dart';
import 'package:algoplay/shared/widgets/xp_progress_bar.dart';
import 'package:algoplay/shared/widgets/game_card.dart';
import 'package:algoplay/shared/widgets/algorithm_card.dart';
import 'package:algoplay/shared/widgets/empty_state.dart';

import '../../learn/data/lesson_content.dart';
import '../../learn/providers/lesson_providers.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// Home Page — main landing tab for AlgoPlay.
///
/// Layout sections:
///   1. Header (greeting + XP progress)
///   2. Daily streak row
///   3. Skill Categories grid
///   4. Quick Games row
///   5. Continue Learning / Empty State
// ═══════════════════════════════════════════════════════════════════════════════

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  // ── Time-based greeting ─────────────────────────────────────────────────

  String _greeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  // ── Day-of-week helpers ─────────────────────────────────────────────────

  static const _dayAbbrevs = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  int _currentWeekdayIndex() {
    // DateTime.monday == 1 … DateTime.sunday == 7
    return DateTime.now().weekday - 1;
  }

  // ── Build ───────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final progress = ref.watch(userProgressProvider);
    final isPremium = ref.watch(premiumProvider);
    final allLessons = ref.watch(lessonsProvider);

    // XP within current level (100 XP per level formula from notifier)
    final xpInLevel = progress.totalXP % 100;
    final nextLevelXP = 100;

    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── 1. Header ──────────────────────────────────────────────
              _buildHeader(progress.level, xpInLevel, nextLevelXP),
              const SizedBox(height: AppSpacing.lg),

              // ── 2. Daily streak row ────────────────────────────────────
              _buildStreakRow(progress.currentStreak),
              const SizedBox(height: AppSpacing.xl),

              // ── Upgrade card (free users only) ─────────────────────────
              if (!isPremium) ...[
                _buildUpgradeCard(context),
                const SizedBox(height: AppSpacing.xl),
              ],

              // ── 3. Lessons Curriculum ─────────────────────────────────
              _buildLessonsSection(context, allLessons),
              const SizedBox(height: AppSpacing.xl),

              // ── 4. Explore Algorithms ──────────────────────────────────
              _buildSkillCategories(context),
              const SizedBox(height: AppSpacing.xl),

              // ── 5. Quick Games ─────────────────────────────────────────
              _buildQuickGames(context),
              const SizedBox(height: AppSpacing.xl),

              // ── 6. Continue Learning ───────────────────────────────────
              _buildContinueLearning(context, progress),
              const SizedBox(height: AppSpacing.xxl),
            ],
          ),
        ),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 1. Header area
  // ═══════════════════════════════════════════════════════════════════════

  Widget _buildHeader(int level, int xpInLevel, int nextLevelXP) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Greeting column
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _greeting(),
                style: AppTypography.caption.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: AppSpacing.xs),
              const Text('Ready to learn?', style: AppTypography.h1),
            ],
          ),
        ),

        const SizedBox(width: AppSpacing.md),

        // XP progress (compact)
        SizedBox(
          width: 140,
          child: XpProgressBar(
            level: level,
            currentXP: xpInLevel,
            nextLevelXP: nextLevelXP,
          ),
        ),
      ],
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 2. Daily streak row
  // ═══════════════════════════════════════════════════════════════════════

  Widget _buildStreakRow(int currentStreak) {
    final todayIndex = _currentWeekdayIndex();

    return SizedBox(
      height: 60,
      child: Row(
        children: [
          // ── Streak counter ──
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.sm,
            ),
            decoration: BoxDecoration(
              color: AppColors.secondary100,
              borderRadius: AppRadius.mdBorder,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.local_fire_department,
                  size: 20,
                  color: AppColors.secondary500,
                ),
                const SizedBox(width: AppSpacing.xs),
                Text(
                  '$currentStreak',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.secondary500,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(width: AppSpacing.md),

          // ── 7-day tiles ──
          Expanded(
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: 7,
              separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.xs),
              itemBuilder: (context, index) {
                final isToday = index == todayIndex;
                return Container(
                  width: 44,
                  decoration: BoxDecoration(
                    color: isToday
                        ? AppColors.solarGold.withValues(alpha: 0.15)
                        : AppColors.sunken,
                    borderRadius: AppRadius.smBorder,
                    border: isToday
                        ? Border.all(color: AppColors.solarGold, width: 1.5)
                        : null,
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        _dayAbbrevs[index],
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: isToday
                              ? FontWeight.w700
                              : FontWeight.w500,
                          color: isToday
                              ? AppColors.solarGold
                              : AppColors.textMuted,
                        ),
                      ),
                      if (isToday) ...[
                        const SizedBox(height: 2),
                        Container(
                          width: 4,
                          height: 4,
                          decoration: const BoxDecoration(
                            color: AppColors.solarGold,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ],
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 3. Lessons Curriculum
  // ═══════════════════════════════════════════════════════════════════════

  Widget _buildLessonsSection(
    BuildContext context,
    List<LessonContent> lessons,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionHeader(
          title: 'Lessons',
          actionLabel: 'View all',
          onAction: () => context.push('/lesson/1'),
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(
          '${lessons.length} lessons from basics to advanced',
          style: AppTypography.caption,
        ),
        const SizedBox(height: AppSpacing.lg),
        ...lessons.take(12).map((lesson) => _LessonCard(lesson: lesson)),
      ],
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 3. Skill Categories
  // ═══════════════════════════════════════════════════════════════════════

  Widget _buildSkillCategories(BuildContext context) {
    final categories = <_CategoryDef>[
      _CategoryDef(
        name: 'Sorting',
        icon: Icons.sort,
        color: AppColors.catSorting,
        count: 8,
      ),
      _CategoryDef(
        name: 'Searching',
        icon: Icons.search,
        color: AppColors.catSearching,
        count: 6,
      ),
      _CategoryDef(
        name: 'Graphs',
        icon: Icons.account_tree,
        color: AppColors.catGraphs,
        count: 10,
      ),
      _CategoryDef(
        name: 'Dynamic Programming',
        icon: Icons.grid_on,
        color: AppColors.catDp,
        count: 12,
      ),
      _CategoryDef(
        name: 'Greedy',
        icon: Icons.bolt,
        color: AppColors.catGreedy,
        count: 7,
      ),
      _CategoryDef(
        name: 'Trees',
        icon: Icons.park,
        color: AppColors.catTrees,
        count: 9,
      ),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionHeader(
          title: 'Explore Algorithms',
          actionLabel: 'See all',
          onAction: () => context.go('/learn'),
        ),
        const SizedBox(height: AppSpacing.lg),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: AppSpacing.md,
            crossAxisSpacing: AppSpacing.md,
            childAspectRatio: 1.1,
          ),
          itemCount: categories.length,
          itemBuilder: (context, index) {
            final cat = categories[index];
            return SkillCategoryCard(
              name: cat.name,
              icon: cat.icon,
              color: cat.color,
              algorithmCount: cat.count,
              onTap: () => context.go('/learn'),
            );
          },
        ),
      ],
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 4. Quick Games
  // ═══════════════════════════════════════════════════════════════════════

  Widget _buildQuickGames(BuildContext context) {
    final games = <_GameDef>[
      _GameDef(
        title: 'Battle Arena',
        description: 'Compete in real-time',
        icon: Icons.sports_esports,
        color: AppColors.secondary500,
        route: '/game/battle-arena',
      ),
      _GameDef(
        title: 'The Sorter',
        description: 'Sort it out fast!',
        icon: Icons.swap_vert,
        color: AppColors.solarGold,
        route: '/game/the-sorter',
      ),
      _GameDef(
        title: 'Grid Escape',
        description: 'Find your way out',
        icon: Icons.close,
        color: AppColors.primary500,
        route: '/game/grid-escape',
      ),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionHeader(title: 'Quick Games'),
        const SizedBox(height: AppSpacing.lg),
        SizedBox(
          height: 160,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: games.length,
            separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.md),
            itemBuilder: (context, index) {
              final game = games[index];
              return SizedBox(
                width: 180,
                child: GameCard(
                  title: game.title,
                  description: game.description,
                  icon: game.icon,
                  color: game.color,
                  onTap: () => context.push(game.route),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 5. Continue Learning
  // ═══════════════════════════════════════════════════════════════════════

  Widget _buildContinueLearning(BuildContext context, dynamic progress) {
    final completed = progress.completedAlgorithms as List<String>;

    if (completed.isEmpty) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(title: 'Keep Going'),
          const SizedBox(height: AppSpacing.lg),
          const EmptyState(
            icon: Icons.arrow_forward_rounded,
            title: 'Start your first algorithm',
            subtitle: 'Explore categories above to begin',
          ),
        ],
      );
    }

    // Show last 2 completed algorithms as compact cards
    final recent = completed.reversed.take(2).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionHeader(title: 'Keep Going'),
        const SizedBox(height: AppSpacing.lg),
        ...recent.map(
          (algoId) => Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.md),
            child: AlgorithmCard(
              name: _formatAlgorithmName(algoId),
              difficulty: AlgorithmDifficulty.medium,
              timeComplexity: _getTimeComplexity(algoId),
              categoryColor: _getCategoryColor(algoId),
              onTap: () => context.push('/visualizer/$algoId'),
            ),
          ),
        ),
      ],
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Upgrade card (free users only — routes to /premium)
  // ═══════════════════════════════════════════════════════════════════════════

  Widget _buildUpgradeCard(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/premium'),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [AppColors.primary500, AppColors.secondary500],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary500.withValues(alpha: 0.3),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    '⚡ Unlock Everything',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Remove ads • All games • Unlimited hints',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.85),
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Text(
                'Upgrade',
                style: TextStyle(
                  color: AppColors.primary500,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Helper: prettify algorithm IDs ─────────────────────────────────────

  String _formatAlgorithmName(String id) {
    return id
        .split('-')
        .map((w) => w[0].toUpperCase() + w.substring(1))
        .join(' ');
  }

  String _getTimeComplexity(String id) {
    // Simple heuristic; in production this would come from a data layer
    if (id.contains('sort')) return 'O(n log n)';
    if (id.contains('search') || id.contains('binary')) return 'O(log n)';
    if (id.contains('bfs') || id.contains('dfs')) return 'O(V + E)';
    if (id.contains('dp') || id.contains('dynamic')) return 'O(n²)';
    return 'O(n)';
  }

  Color _getCategoryColor(String id) {
    if (id.contains('sort')) return AppColors.catSorting;
    if (id.contains('search')) return AppColors.catSearching;
    if (id.contains('graph') || id.contains('bfs') || id.contains('dfs')) {
      return AppColors.catGraphs;
    }
    if (id.contains('dp') || id.contains('dynamic')) return AppColors.catDp;
    if (id.contains('greedy')) return AppColors.catGreedy;
    if (id.contains('tree')) return AppColors.catTrees;
    return AppColors.primary500;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Lesson card for the main Home tab curriculum section.
// ═══════════════════════════════════════════════════════════════════════════════
class _LessonCard extends ConsumerWidget {
  const _LessonCard({required this.lesson});

  final LessonContent lesson;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final progressAsync = ref.watch(lessonProgressValueProvider(lesson.id));
    final unlockedAsync = ref.watch(lessonUnlockedProvider(lesson.id));

    final progress = progressAsync.valueOrNull ?? 0.0;
    final isUnlocked = unlockedAsync.valueOrNull ?? (lesson.id == 1);

    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: Material(
        color: AppColors.card,
        borderRadius: AppRadius.lgBorder,
        elevation: 1,
        child: InkWell(
          borderRadius: AppRadius.lgBorder,
          onTap: isUnlocked ? () => context.push('/lesson/${lesson.id}') : null,
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Opacity(
              opacity: isUnlocked ? 1.0 : 0.5,
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: isUnlocked
                          ? AppColors.primary100
                          : AppColors.sunken,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      '${lesson.id}',
                      style: AppTypography.h3.copyWith(
                        color: isUnlocked
                            ? AppColors.primary500
                            : AppColors.textMuted,
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          lesson.title,
                          style: AppTypography.h3,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: AppSpacing.xs),
                        Text(
                          '${lesson.modules.length} module${lesson.modules.length == 1 ? '' : 's'}',
                          style: AppTypography.caption,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  if (isUnlocked)
                    _MiniProgress(progress: progress)
                  else
                    const Icon(
                      Icons.lock_outline,
                      color: AppColors.textMuted,
                      size: 20,
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _MiniProgress extends StatelessWidget {
  const _MiniProgress({required this.progress});

  final double progress;

  @override
  Widget build(BuildContext context) {
    if (progress >= 1.0) {
      return const Icon(
        Icons.check_circle_rounded,
        color: AppColors.success600,
        size: 24,
      );
    }
    if (progress <= 0) {
      return const Icon(
        Icons.radio_button_unchecked,
        color: AppColors.textMuted,
        size: 24,
      );
    }
    return SizedBox(
      width: 24,
      height: 24,
      child: CircularProgressIndicator(
        value: progress,
        strokeWidth: 3,
        backgroundColor: AppColors.sunken,
        valueColor: const AlwaysStoppedAnimation(AppColors.primary500),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Private data holders
// ═══════════════════════════════════════════════════════════════════════════════

class _CategoryDef {
  final String name;
  final IconData icon;
  final Color color;
  final int count;
  const _CategoryDef({
    required this.name,
    required this.icon,
    required this.color,
    required this.count,
  });
}

class _GameDef {
  final String title;
  final String description;
  final IconData icon;
  final Color color;
  final String route;
  const _GameDef({
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
    required this.route,
  });
}
