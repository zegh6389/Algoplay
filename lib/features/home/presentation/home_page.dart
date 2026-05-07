import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:algoplay/core/theme/app_theme.dart';
import 'package:algoplay/shared/providers/app_providers.dart';
import 'package:algoplay/shared/providers/premium_provider.dart';
import 'package:algoplay/shared/widgets/section_header.dart';
import 'package:algoplay/shared/widgets/skill_category_card.dart';
import 'package:algoplay/shared/widgets/game_card.dart';

// Import lesson providers for the curriculum
import '../../learn/data/lesson_content.dart';
import '../../learn/providers/lesson_providers.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userProgress = ref.watch(userProgressProvider);
    final allLessons = ref.watch(lessonsProvider);

    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              backgroundColor: AppColors.canvas,
              elevation: 0,
              pinned: true,
              floating: true,
              centerTitle: false,
              title: Row(
                children: [
                  const Text('AlgoPlay', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 24, color: AppColors.textPrimary)),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.primary100,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.star, color: AppColors.solarGold, size: 16),
                        const SizedBox(width: 4),
                        Text('${userProgress.totalXP} XP', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary700, fontSize: 14)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  // ── 1. Lessons Curriculum ──────────────────────────────────────
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Lessons', style: AppTypography.h2),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                  ...allLessons.map((lesson) => _LessonCard(lesson: lesson)),
                  const SizedBox(height: AppSpacing.xl),

                  // ── 2. Explore Algorithms ───────────────────────────────────
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Explore Algorithms', style: AppTypography.h2),
                      TextButton(
                        onPressed: () => context.go('/explore'),
                        child: const Text('View All'),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                  _buildCategoryGrid(context),
                  const SizedBox(height: AppSpacing.xl),

                  // ── 3. Games ────────────────────────────────────────────────
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Games', style: AppTypography.h2),
                      TextButton(
                        onPressed: () => context.go('/games'),
                        child: const Text('View All'),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                  _buildGamesRow(context),
                  const SizedBox(height: AppSpacing.xxl),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryGrid(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: AppSpacing.md,
      crossAxisSpacing: AppSpacing.md,
      childAspectRatio: 1.1,
      children: [
        SkillCategoryCard(
          name: 'Sorting',
          algorithmCount: 6,
          icon: Icons.sort,
          color: AppColors.catSorting,
          onTap: () => context.push('/explore?category=sorting'),
        ),
        SkillCategoryCard(
          name: 'Searching',
          algorithmCount: 4,
          icon: Icons.search,
          color: AppColors.catSearching,
          onTap: () => context.push('/explore?category=searching'),
        ),
        SkillCategoryCard(
          name: 'Graphs',
          algorithmCount: 5,
          icon: Icons.account_tree,
          color: AppColors.catGraphs,
          onTap: () => context.push('/explore?category=graphs'),
        ),
        SkillCategoryCard(
          name: 'Dynamic Prog.',
          algorithmCount: 3,
          icon: Icons.grid_on,
          color: AppColors.catDp,
          onTap: () => context.push('/explore?category=dp'),
        ),
      ],
    );
  }

  Widget _buildGamesRow(BuildContext context) {
    return SizedBox(
      height: 180,
      child: ListView(
        scrollDirection: Axis.horizontal,
        clipBehavior: Clip.none,
        children: [
          GameCard(
            title: 'Grid Escape',
            description: 'Find path to exit',
            icon: Icons.grid_on,
            color: AppColors.primary500,
            onTap: () => context.push('/games/grid-escape'),
          ),
          const SizedBox(width: AppSpacing.md),
          GameCard(
            title: 'Battle Arena',
            description: 'Algo vs Algo',
            icon: Icons.sports_mma,
            color: AppColors.error600,
            onTap: () => context.push('/games/battle-arena'),
          ),
          const SizedBox(width: AppSpacing.md),
          GameCard(
            title: 'The Sorter',
            description: 'Sort blocks fast',
            icon: Icons.sort,
            color: AppColors.solarGold,
            onTap: () => context.push('/games/the-sorter'),
          ),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Single lesson card in the curriculum list.
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
          onTap: isUnlocked
              ? () => context.push('/lesson/${lesson.id}')
              : null,
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
                      color: isUnlocked ? AppColors.primary100 : AppColors.sunken,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      '${lesson.id}',
                      style: AppTypography.h3.copyWith(
                        color: isUnlocked ? AppColors.primary500 : AppColors.textMuted,
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(lesson.title, style: AppTypography.h3, maxLines: 1, overflow: TextOverflow.ellipsis),
                        const SizedBox(height: AppSpacing.xs),
                        Text('${lesson.modules.length} module${lesson.modules.length == 1 ? '' : 's'}', style: AppTypography.caption),
                      ],
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  if (isUnlocked)
                    _MiniProgress(progress: progress)
                  else
                    const Icon(Icons.lock_outline, color: AppColors.textMuted, size: 20),
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
    if (progress >= 1.0) return const Icon(Icons.check_circle_rounded, color: AppColors.success600, size: 24);
    if (progress <= 0) return const Icon(Icons.radio_button_unchecked, color: AppColors.textMuted, size: 24);
    return SizedBox(
      width: 24, height: 24,
      child: CircularProgressIndicator(
        value: progress, strokeWidth: 3, backgroundColor: AppColors.sunken,
        valueColor: const AlwaysStoppedAnimation(AppColors.primary500),
      ),
    );
  }
}
