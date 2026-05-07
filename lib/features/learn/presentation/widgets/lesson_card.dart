// ═══════════════════════════════════════════════════════════════════════════════
/// Reusable lesson card widget for the lessons home page.
// ═══════════════════════════════════════════════════════════════════════════════

import 'package:flutter/material.dart';

import '../../../../core/theme/app_theme.dart';

class LessonCard extends StatelessWidget {
  final int lessonNumber;
  final String title;
  final Color categoryColor;
  final double progressFraction;
  final bool isLocked;
  final bool isCompleted;
  final VoidCallback? onTap;

  const LessonCard({
    super.key,
    required this.lessonNumber,
    required this.title,
    required this.categoryColor,
    required this.progressFraction,
    this.isLocked = false,
    this.isCompleted = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveOnTap = isLocked ? null : onTap;

    return GestureDetector(
      onTap: effectiveOnTap,
      child: AnimatedOpacity(
        duration: const Duration(milliseconds: 200),
        opacity: isLocked ? 0.55 : 1.0,
        child: Container(
          padding: const EdgeInsets.all(AppSpacing.lg),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: AppRadius.lgBorder,
            boxShadow: AppShadows.sm,
          ),
          child: Row(
            children: [
              // ── Lesson number badge ──
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: isLocked
                      ? AppColors.sunken
                      : categoryColor.withValues(alpha: 0.12),
                  borderRadius: AppRadius.mdBorder,
                ),
                child: Center(
                  child: isLocked
                      ? const Icon(
                          Icons.lock_outline_rounded,
                          size: 20,
                          color: AppColors.textMuted,
                        )
                      : isCompleted
                          ? const Icon(
                              Icons.check_circle_rounded,
                              size: 24,
                              color: AppColors.success600,
                            )
                          : Text(
                              '$lessonNumber',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                                color: categoryColor,
                              ),
                            ),
                ),
              ),

              const SizedBox(width: AppSpacing.md),

              // ── Title + progress bar ──
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      children: [
                        // Category color dot
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: isLocked
                                ? AppColors.textMuted
                                : categoryColor,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: Text(
                            title,
                            style: AppTypography.bodyBold.copyWith(
                              color: isLocked
                                  ? AppColors.textMuted
                                  : AppColors.textPrimary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.sm),

                    // Progress bar
                    ClipRRect(
                      borderRadius: AppRadius.fullBorder,
                      child: LinearProgressIndicator(
                        value: progressFraction,
                        backgroundColor: AppColors.sunken,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          isCompleted
                              ? AppColors.success600
                              : AppColors.primary500,
                        ),
                        minHeight: 6,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(width: AppSpacing.sm),

              // ── Chevron or lock icon ──
              if (!isLocked)
                const Icon(
                  Icons.chevron_right_rounded,
                  size: 20,
                  color: AppColors.textMuted,
                ),
            ],
          ),
        ),
      ),
    );
  }
}
