import 'package:algoplay/core/theme/app_theme.dart';
import 'package:flutter/material.dart';

class AlgoplayFeatureTourCard extends StatelessWidget {
  const AlgoplayFeatureTourCard({
    super.key,
    required this.step,
    required this.totalSteps,
    required this.title,
    required this.body,
    required this.isLast,
    required this.onNext,
    required this.onSkip,
  });

  final int step;
  final int totalSteps;
  final String title;
  final String body;
  final bool isLast;
  final VoidCallback onNext;
  final VoidCallback onSkip;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      child: Material(
        color: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.all(AppSpacing.lg),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: AppRadius.xlBorder,
            border: Border.all(color: AppColors.primary100),
            boxShadow: AppShadows.lg,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.sm,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.primary100,
                      borderRadius: AppRadius.smBorder,
                    ),
                    child: Text(
                      'Step $step of $totalSteps',
                      style: AppTypography.caption.copyWith(
                        color: AppColors.primary700,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  const Spacer(),
                  TextButton(onPressed: onSkip, child: const Text('Skip')),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              Text(title, style: AppTypography.h2),
              const SizedBox(height: AppSpacing.sm),
              Text(
                body,
                style: AppTypography.body.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              Row(
                children: [
                  ...List.generate(
                    totalSteps,
                    (index) => Container(
                      width: index + 1 == step ? 22 : 8,
                      height: 8,
                      margin: const EdgeInsets.only(right: 6),
                      decoration: BoxDecoration(
                        color: index + 1 == step
                            ? AppColors.primary500
                            : AppColors.sunken,
                        borderRadius: BorderRadius.circular(999),
                      ),
                    ),
                  ),
                  const Spacer(),
                  ElevatedButton(
                    onPressed: onNext,
                    child: Text(isLast ? 'Finish' : 'Next'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
