import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

/// ──────────────────────────────────────────────
/// Game mode card with a subtle colour top border
/// and optional badge chip in the top-right.
/// ──────────────────────────────────────────────
class GameCard extends StatelessWidget {
  const GameCard({
    super.key,
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
    this.badge,
    required this.onTap,
  });

  final String title;
  final String description;
  final IconData icon;
  final Color color;
  final String? badge;
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
          // 3 px coloured top border
          border: Border(
            top: BorderSide(color: color, width: 3),
          ),
        ),
        child: Padding(
          padding: EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // ── Top row: icon + badge ──
              Row(
                children: [
                  Icon(icon, size: 24, color: color),
                  const Spacer(),
                  if (badge != null)
                    Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: AppSpacing.sm,
                        vertical: AppSpacing.xs,
                      ),
                      decoration: BoxDecoration(
                        color: color.withValues(alpha: 0.12),
                        borderRadius: AppRadius.smBorder,
                      ),
                      child: Text(
                        badge!,
                        style: TextStyle(
                          fontSize: 11.0,
                          fontWeight: FontWeight.w600,
                          color: color,
                        ),
                      ),
                    ),
                ],
              ),

              SizedBox(height: AppSpacing.md),

              // ── Title ──
              Text(title, style: AppTypography.h3),

              SizedBox(height: AppSpacing.xs),

              // ── Description ──
              Text(description, style: AppTypography.caption),
            ],
          ),
        ),
      ),
    );
  }
}