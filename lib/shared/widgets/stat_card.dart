import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

/// ──────────────────────────────────────────────
/// Small stat display card with a colour dot and
/// large value text.
/// ──────────────────────────────────────────────
class StatCard extends StatelessWidget {
  const StatCard({
    super.key,
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

  final String title;
  final String value;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: AppRadius.lgBorder,
        boxShadow: AppShadows.sm,
      ),
      child: Padding(
        padding: EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // ── Title row with dot + icon ──
            Row(
              children: [
                // 6 px colour dot
                Container(
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: color,
                    shape: BoxShape.circle,
                  ),
                ),
                SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(title, style: AppTypography.caption),
                ),
                Icon(icon, size: 18, color: AppColors.textMuted),
              ],
            ),

            SizedBox(height: AppSpacing.sm),

            // ── Large value ──
            Text(value, style: AppTypography.h2),
          ],
        ),
      ),
    );
  }
}