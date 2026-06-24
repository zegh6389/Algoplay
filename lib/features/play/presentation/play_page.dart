import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_theme.dart';
import '../../../shared/models/user_progress.dart';
import '../../../shared/providers/app_providers.dart';
import '../../../shared/widgets/section_header.dart';
import '../../../shared/widgets/game_card.dart';
import '../../learn/data/algorithm_data.dart';
import '../../leaderboard/data/leaderboard_repository.dart';

/// ═══════════════════════════════════════════════════════════════════════════════
/// Play Page — Games Hub
/// Daily challenge, game modes grid, leaderboard preview, quick actions.
/// ═══════════════════════════════════════════════════════════════════════════════
class PlayPage extends ConsumerWidget {
  const PlayPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: AppColors.card,
      body: SingleChildScrollView(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Safe-area top spacing ──
              SizedBox(height: MediaQuery.of(context).padding.top + AppSpacing.lg),

              // ── 1. Header ──
              Text('Play', style: AppTypography.h1),
              SizedBox(height: AppSpacing.sm),
              _LiveStatsBar(ref.watch(userProgressProvider)),

              SizedBox(height: AppSpacing.xl),

              // ── 2. Daily Challenge Card ──
              const _DailyChallengeCard(),

              SizedBox(height: AppSpacing.xl),

              // ── 3. Game Modes ──
              SectionHeader(title: 'Game Modes'),
              SizedBox(height: AppSpacing.md),

              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: AppSpacing.md,
                crossAxisSpacing: AppSpacing.md,
                childAspectRatio: 0.85,
                children: [
                  GameCard(
                    title: 'Battle Arena',
                    description: 'Head-to-head algorithm battles',
                    icon: Icons.sports_martial_arts,
                    color: AppColors.secondary500,
                    badge: 'Popular',
                    onTap: () => context.push('/game/battle-arena'),
                  ),
                  GameCard(
                    title: 'The Sorter',
                    description: 'Sorting algorithm challenge',
                    icon: Icons.sort,
                    color: AppColors.primary500,
                    onTap: () => context.push('/game/the-sorter'),
                  ),
                  GameCard(
                    title: 'Grid Escape',
                    description: 'Grid-based algorithm puzzle',
                    icon: Icons.grid_on,
                    color: AppColors.solarGold,
                    onTap: () => context.push('/game/grid-escape'),
                  ),
                  GameCard(
                    title: 'Race Mode',
                    description: 'Timed algorithm completion',
                    icon: Icons.speed,
                    color: AppColors.catSorting,
                    onTap: () => context.push('/game/race-mode'),
                  ),
                ],
              ),

              SizedBox(height: AppSpacing.xl),

              // ── 4. Leaderboard Preview ──
              SectionHeader(
                title: 'Top Players',
                actionLabel: 'View all',
                onAction: () => context.push('/leaderboard'),
              ),
              SizedBox(height: AppSpacing.md),

              const _LeaderboardPreview(),

              SizedBox(height: AppSpacing.lg),

              // ── 5. Quick Actions Row ──
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        final randomAlgo = allAlgorithms[Random().nextInt(allAlgorithms.length)];
                        context.push('/visualizer/${randomAlgo.id}');
                      },
                      icon: const Icon(Icons.shuffle, size: 18),
                      label: const Text('Random Algorithm'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.primary500,
                        side: const BorderSide(color: AppColors.primary500),
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.md,
                          vertical: AppSpacing.md,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: AppRadius.mdBorder,
                        ),
                        textStyle: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                  SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        context.push('/game/race-mode');
                      },
                      icon: const Icon(Icons.psychology, size: 18),
                      label: const Text('Practice Mode'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.primary500,
                        side: const BorderSide(color: AppColors.primary500),
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.md,
                          vertical: AppSpacing.md,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: AppRadius.mdBorder,
                        ),
                        textStyle: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              // ── Bottom safe-area + nav bar spacing ──
              SizedBox(height: AppSpacing.xl + MediaQuery.of(context).padding.bottom),
            ],
          ),
        ),
      ),
    );
  }
}

/// ─────────────────────────────────────────────────────────────────────────────
/// Live stats bar — shows the user's level, XP, and streak from live state.
/// ─────────────────────────────────────────────────────────────────────────────
class _LiveStatsBar extends StatelessWidget {
  const _LiveStatsBar(this.progress);

  final UserProgress progress;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _stat('${progress.level}', 'Level', AppColors.primary500),
        const SizedBox(width: AppSpacing.md),
        _stat('${progress.totalXP}', 'XP', AppColors.solarGold),
        const SizedBox(width: AppSpacing.md),
        _stat('${progress.currentStreak}', 'Day Streak', AppColors.secondary500),
      ],
    );
  }

  Widget _stat(String value, String label, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm,
        ),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: AppRadius.mdBorder,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              value,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: color,
              ),
            ),
            Text(
              label,
              style: AppTypography.overline.copyWith(color: AppColors.textMuted),
            ),
          ],
        ),
      ),
    );
  }
}

/// ─────────────────────────────────────────────────────────────────────────────
/// Daily Challenge Card — prominent card with gold accent top bar.
/// ─────────────────────────────────────────────────────────────────────────────
class _DailyChallengeCard extends StatelessWidget {
  const _DailyChallengeCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: AppRadius.lgBorder,
        boxShadow: AppShadows.sm,
        border: Border(
          top: BorderSide(
            color: AppColors.solarAmber,
            width: 3,
          ),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Row(
          children: [
            // ── Left: text content + button ──
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Daily Challenge', style: AppTypography.h3),
                  SizedBox(height: AppSpacing.xs),
                  Text(
                    "Complete today's algorithm puzzle",
                    style: AppTypography.caption,
                  ),
                  SizedBox(height: AppSpacing.md),
                  SizedBox(
                    height: 40,
                    child: ElevatedButton(
                      onPressed: () {
                        context.push('/game/battle-arena');
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary500,
                        foregroundColor: AppColors.textInverse,
                        elevation: 0,
                        minimumSize: const Size(80, 40),
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.xl,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: AppRadius.mdBorder,
                        ),
                        textStyle: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      child: const Text('Start'),
                    ),
                  ),
                ],
              ),
            ),

            SizedBox(width: AppSpacing.md),

            // ── Right: XP reward chip ──
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.sm,
              ),
              decoration: BoxDecoration(
                color: AppColors.solarGold.withValues(alpha: 0.12),
                borderRadius: AppRadius.mdBorder,
              ),
              child: Text(
                '+50 XP',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.solarGold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// ─────────────────────────────────────────────────────────────────────────────
/// Leaderboard Preview — top entries loaded from LeaderboardRepository.
/// ─────────────────────────────────────────────────────────────────────────────
class _LeaderboardPreview extends ConsumerStatefulWidget {
  const _LeaderboardPreview();

  @override
  ConsumerState<_LeaderboardPreview> createState() =>
      _LeaderboardPreviewState();
}

class _LeaderboardPreviewState extends ConsumerState<_LeaderboardPreview> {
  List<LeaderboardEntry> _topPlayers = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadTopPlayers();
  }

  Future<void> _loadTopPlayers() async {
    final repo = LeaderboardRepository();
    final entries = await repo.getLeaderboard();
    if (mounted) {
      setState(() {
        _topPlayers = entries.take(3).toList();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const SizedBox(
        height: 120,
        child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
      );
    }

    if (_topPlayers.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      children: [
        ..._topPlayers.map((player) => _LeaderboardEntry(
              rank: player.rank,
              initials: player.initials,
              name: player.name,
              xp: '${player.xp}',
            )),
        SizedBox(height: AppSpacing.sm),
        TextButton(
          onPressed: () => context.push('/leaderboard'),
          style: TextButton.styleFrom(
            foregroundColor: AppColors.primary500,
            padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
            minimumSize: Size.zero,
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
          child: const Text(
            'View full leaderboard',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}

class _LeaderboardEntry extends StatelessWidget {
  const _LeaderboardEntry({
    required this.rank,
    required this.initials,
    required this.name,
    required this.xp,
  });

  final int rank;
  final String initials;
  final String name;
  final String xp;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
      child: Row(
        children: [
          // ── Rank number ──
          SizedBox(
            width: 20,
            child: Text(
              '#$rank',
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.textMuted,
              ),
            ),
          ),
          SizedBox(width: AppSpacing.sm),

          // ── Avatar circle ──
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.primary100,
              borderRadius: AppRadius.fullBorder,
            ),
            alignment: Alignment.center,
            child: Text(
              initials,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.primary500,
              ),
            ),
          ),
          SizedBox(width: AppSpacing.md),

          // ── Username ──
          Expanded(
            child: Text(
              name,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: AppColors.textPrimary,
              ),
            ),
          ),

          // ── XP value ──
          Text(
            '$xp XP',
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppColors.solarGold,
            ),
          ),
        ],
      ),
    );
  }
}
