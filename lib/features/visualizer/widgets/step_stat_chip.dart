import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';

/// Compact stat chip used in visualizer step-info bars
/// (e.g. "compares: 12", "cells: 8"). Shared by the array/tree/DP pages so
/// styling stays consistent.
class StepStatChip extends StatelessWidget {
  const StepStatChip({
    super.key,
    required this.label,
    required this.value,
    required this.color,
  });

  final String label;
  final int value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: 2,
      ),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: AppRadius.smBorder,
      ),
      child: Text(
        '$label: $value',
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: color,
        ),
      ),
    );
  }
}
