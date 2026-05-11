import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

/// ──────────────────────────────────────────────
/// Compact XP progress bar with level badge on
/// the left and XP text on the right.  ~48 px tall.
/// ──────────────────────────────────────────────
class XpProgressBar extends StatelessWidget {
  const XpProgressBar({
    super.key,
    required this.currentXP,
    required this.nextLevelXP,
    required this.level,
  });

  final int currentXP;
  final int nextLevelXP;
  final int level;

  @override
  Widget build(BuildContext context) {
    final progress = (currentXP / nextLevelXP).clamp(0.0, 1.0);

    return SizedBox(
      height: 48,
      child: Row(
        children: [
          // ── Level badge ──
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.solarGold,
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: Text(
              '$level',
              style: const TextStyle(
                fontSize: 15.0,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ),

          SizedBox(width: AppSpacing.md),

          // ── Bar + XP text ──
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                // Progress track
                ClipRRect(
                  borderRadius: AppRadius.fullBorder,
                  child: LinearProgressIndicator(
                    value: progress,
                    backgroundColor: AppColors.sunken,
                    valueColor: const AlwaysStoppedAnimation<Color>(
                      AppColors.solarGold,
                    ),
                    minHeight: 8,
                  ),
                ),

                SizedBox(height: AppSpacing.xs),

                // XP text
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Flexible(
                      child: FittedBox(
                        fit: BoxFit.scaleDown,
                        child: Text(
                          '$currentXP / $nextLevelXP XP',
                          style: AppTypography.overline,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}