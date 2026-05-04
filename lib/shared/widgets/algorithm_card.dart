import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

/// ──────────────────────────────────────────────
/// Card for individual algorithms in the Learn tab.
/// Difficulty shown as a coloured chip.
/// ──────────────────────────────────────────────

enum AlgorithmDifficulty { easy, medium, hard }

class AlgorithmCard extends StatelessWidget {
  const AlgorithmCard({
    super.key,
    required this.name,
    required this.difficulty,
    required this.timeComplexity,
    required this.categoryColor,
    required this.onTap,
  });

  final String name;
  final AlgorithmDifficulty difficulty;
  final String timeComplexity;
  final Color categoryColor;
  final VoidCallback onTap;

  Color get _difficultyColor {
    switch (difficulty) {
      case AlgorithmDifficulty.easy:
        return AppColors.success600;
      case AlgorithmDifficulty.medium:
        return AppColors.warning600;
      case AlgorithmDifficulty.hard:
        return AppColors.error600;
    }
  }

  String get _difficultyLabel {
    switch (difficulty) {
      case AlgorithmDifficulty.easy:
        return 'Easy';
      case AlgorithmDifficulty.medium:
        return 'Medium';
      case AlgorithmDifficulty.hard:
        return 'Hard';
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: AppRadius.lgBorder,
          boxShadow: AppShadows.sm,
        ),
        child: Padding(
          padding: EdgeInsets.all(AppSpacing.lg),
          child: Row(
            children: [
              // ── Left: name + complexity ──
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(name, style: AppTypography.h3),
                    SizedBox(height: AppSpacing.xs),
                    Text(
                      timeComplexity,
                      style: AppTypography.caption,
                    ),
                  ],
                ),
              ),

              SizedBox(width: AppSpacing.md),

              // ── Difficulty chip ──
              Container(
                padding: EdgeInsets.symmetric(
                  horizontal: AppSpacing.sm,
                  vertical: AppSpacing.xs,
                ),
                decoration: BoxDecoration(
                  color: _difficultyColor.withValues(alpha: 0.12),
                  borderRadius: AppRadius.smBorder,
                ),
                child: Text(
                  _difficultyLabel,
                  style: TextStyle(
                    fontSize: 11.0,
                    fontWeight: FontWeight.w600,
                    color: _difficultyColor,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}