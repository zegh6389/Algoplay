import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/inline_banner_ad.dart';
import '../data/lesson_content.dart';
import '../providers/lesson_providers.dart';

/// Shows all modules for a single lesson with completion status.
class LessonDetailPage extends ConsumerWidget {
  const LessonDetailPage({super.key, required this.lessonId});

  final int lessonId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final allLessons = ref.watch(lessonsProvider);
    final lessonIndex = allLessons.indexWhere((l) => l.id == lessonId);
    if (lessonIndex == -1) {
      return const Scaffold(body: Center(child: Text('Lesson not found')));
    }
    final lesson = allLessons[lessonIndex];

    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: Text(lesson.title),
      ),
      body: SafeArea(
        top: false,
        child: lesson.modules.isEmpty
            ? Center(
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.xxl),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.construction_rounded,
                        size: 48,
                        color: AppColors.textMuted,
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      Text('Coming soon!', style: AppTypography.h2),
                      const SizedBox(height: AppSpacing.sm),
                      Text(
                        'This lesson\'s content is being crafted.',
                        style: AppTypography.body.copyWith(
                          color: AppColors.textSecondary,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              )
            : Column(
                children: [
                  // ── Segmented progress bar ────────────────────────────────
                  _SegmentedProgress(lesson: lesson),

                  // ── Monetization: inline banner away from navigation rows ──
                  const InlineBannerAd(
                    margin: EdgeInsets.fromLTRB(
                      AppSpacing.lg,
                      0,
                      AppSpacing.lg,
                      AppSpacing.md,
                    ),
                  ),

                  // ── Module list ───────────────────────────────────────────
                  Expanded(
                    child: ListView.separated(
                      padding: const EdgeInsets.all(AppSpacing.lg),
                      itemCount: lesson.modules.length,
                      separatorBuilder: (_, __) =>
                          const SizedBox(height: AppSpacing.sm),
                      itemBuilder: (context, index) {
                        final module = lesson.modules[index];
                        return _ModuleRow(
                          lessonId: lessonId,
                          module: module,
                          moduleIndex: index,
                        );
                      },
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Row of small circles representing module completion.
// ═══════════════════════════════════════════════════════════════════════════════
class _SegmentedProgress extends ConsumerWidget {
  const _SegmentedProgress({required this.lesson});

  final LessonContent lesson;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.xl,
        vertical: AppSpacing.lg,
      ),
      child: Row(
        children: [
          for (int i = 0; i < lesson.modules.length; i++) ...[
            Expanded(
              child: Consumer(
                builder: (context, ref, _) {
                  final completeAsync = ref.watch(
                    moduleCompleteProvider((
                      lessonId: lesson.id,
                      moduleId: lesson.modules[i].id,
                    )),
                  );
                  final done = completeAsync.valueOrNull ?? false;
                  return Container(
                    height: 6,
                    decoration: BoxDecoration(
                      color: done ? AppColors.primary500 : AppColors.sunken,
                      borderRadius: BorderRadius.circular(3),
                    ),
                  );
                },
              ),
            ),
            if (i < lesson.modules.length - 1)
              const SizedBox(width: AppSpacing.xs),
          ],
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Single module row with number, title, and completion checkmark.
// ═══════════════════════════════════════════════════════════════════════════════
class _ModuleRow extends ConsumerWidget {
  const _ModuleRow({
    required this.lessonId,
    required this.module,
    required this.moduleIndex,
  });

  final int lessonId;
  final ModuleContent module;
  final int moduleIndex;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final completeAsync = ref.watch(
      moduleCompleteProvider((lessonId: lessonId, moduleId: module.id)),
    );
    final isComplete = completeAsync.valueOrNull ?? false;

    return Material(
      color: AppColors.card,
      borderRadius: AppRadius.mdBorder,
      elevation: 0.5,
      child: InkWell(
        borderRadius: AppRadius.mdBorder,
        onTap: () => context.push('/lesson/$lessonId/module/${module.id}'),
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.md,
          ),
          child: Row(
            children: [
              // Module number circle
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: isComplete
                      ? AppColors.success600
                      : AppColors.primary100,
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: isComplete
                    ? const Icon(
                        Icons.check_rounded,
                        color: Colors.white,
                        size: 20,
                      )
                    : Text(
                        '${moduleIndex + 1}',
                        style: AppTypography.caption.copyWith(
                          color: AppColors.primary500,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
              ),
              const SizedBox(width: AppSpacing.md),

              // Title
              Expanded(
                child: Text(
                  module.title,
                  style: AppTypography.body.copyWith(
                    color: isComplete
                        ? AppColors.textSecondary
                        : AppColors.textPrimary,
                    decoration: isComplete ? TextDecoration.lineThrough : null,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),

              // Chevron
              Icon(
                Icons.chevron_right_rounded,
                color: AppColors.textMuted,
                size: 20,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
