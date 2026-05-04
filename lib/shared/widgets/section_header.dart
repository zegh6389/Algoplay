import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

/// ──────────────────────────────────────────────
/// A clean section header with title, optional
/// subtitle, and optional trailing action button.
/// ──────────────────────────────────────────────
class SectionHeader extends StatelessWidget {
  const SectionHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.actionLabel,
    this.onAction,
  });

  final String title;
  final String? subtitle;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // ── Title + subtitle column ──
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(title, style: AppTypography.h3),
              if (subtitle != null) ...[
                SizedBox(height: AppSpacing.xs),
                Text(subtitle!, style: AppTypography.caption),
              ],
            ],
          ),
        ),

        // ── Trailing action ──
        if (actionLabel != null && onAction != null)
          TextButton(
            onPressed: onAction,
            style: TextButton.styleFrom(
              padding: EdgeInsets.symmetric(
                horizontal: AppSpacing.sm,
                vertical: AppSpacing.xs,
              ),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: Text(
              actionLabel!,
              style: const TextStyle(
                fontSize: 13.0,
                fontWeight: FontWeight.w600,
                color: AppColors.primary500,
              ),
            ),
          ),
      ],
    );
  }
}