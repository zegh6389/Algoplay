import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

/// ──────────────────────────────────────────────
/// Minimal category card with a tiny colour dot
/// in the top-right corner.  Clean white surface.
/// ──────────────────────────────────────────────
class SkillCategoryCard extends StatelessWidget {
  const SkillCategoryCard({
    super.key,
    required this.name,
    required this.icon,
    required this.color,
    required this.algorithmCount,
    required this.onTap,
  });

  final String name;
  final IconData icon;
  final Color color;
  final int algorithmCount;
  final VoidCallback onTap;

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
        child: Stack(
          children: [
            // ── Content ──
            Padding(
              padding: EdgeInsets.all(AppSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(icon, size: 28, color: AppColors.textSecondary),
                  SizedBox(height: AppSpacing.md),
                  Text(name, style: AppTypography.h3),
                  SizedBox(height: AppSpacing.xs),
                  Text(
                    '$algorithmCount algorithms',
                    style: AppTypography.caption,
                  ),
                ],
              ),
            ),

            // ── Colour dot (top-right) ──
            Positioned(
              top: AppSpacing.md,
              right: AppSpacing.md,
              child: Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: color,
                  shape: BoxShape.circle,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}