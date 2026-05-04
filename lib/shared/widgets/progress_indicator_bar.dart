import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

/// ──────────────────────────────────────────────
/// Generic progress indicator bar with label,
/// fraction counter, and coloured fill.
/// ──────────────────────────────────────────────
class ProgressIndicatorBar extends StatelessWidget {
  const ProgressIndicatorBar({
    super.key,
    required this.label,
    required this.current,
    required this.total,
    required this.color,
  });

  final String label;
  final int current;
  final int total;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final progress = total == 0 ? 0.0 : (current / total).clamp(0.0, 1.0);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        // ── Label + counter ──
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: AppTypography.caption),
            Text(
              '$current/$total',
              style: AppTypography.caption,
            ),
          ],
        ),

        SizedBox(height: AppSpacing.sm),

        // ── Bar ──
        ClipRRect(
          borderRadius: AppRadius.fullBorder,
          child: LinearProgressIndicator(
            value: progress,
            backgroundColor: AppColors.sunken,
            valueColor: AlwaysStoppedAnimation<Color>(color),
            minHeight: 6,
          ),
        ),
      ],
    );
  }
}