import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/section_header.dart';
import '../data/arena_repository.dart';

/// ═══════════════════════════════════════════════════════════════════════════════
/// Elite Arena Page — Competitive Algorithm Arena
///
/// High-stakes competitive gaming hub where top players compete in head-to-head
/// algorithm battles, climb ranked ladders, and earn exclusive rewards.
/// ═══════════════════════════════════════════════════════════════════════════════

class EliteArenaPage extends ConsumerStatefulWidget {
  const EliteArenaPage({super.key});

  @override
  ConsumerState<EliteArenaPage> createState() => _EliteArenaPageState();
}

class _EliteArenaPageState extends ConsumerState<EliteArenaPage> {
  // Track selected rank tier
  int _selectedTierIndex = 0;

  List<ArenaPlayer> _arenaPlayers = [];
  List<MatchRecord> _matchHistory = [];
  bool _isLoading = true;

  static const _rankTiers = [
    (label: 'Bronze', icon: Icons.workspace_premium, color: Color(0xFFCD7F32)),
    (label: 'Silver', icon: Icons.workspace_premium, color: Color(0xFFC0C0C0)),
    (label: 'Gold', icon: Icons.workspace_premium, color: Color(0xFFFFD700)),
    (label: 'Platinum', icon: Icons.workspace_premium, color: Color(0xFF00CED1)),
    (label: 'Diamond', icon: Icons.diamond, color: Color(0xFFB9F2FF)),
    (label: 'Master', icon: Icons.emoji_events, color: Color(0xFFFF6B6B)),
  ];

  @override
  void initState() {
    super.initState();
    _loadArenaData();
  }

  Future<void> _loadArenaData() async {
    final repo = ArenaRepository();
    final players = await repo.getPlayers();
    final history = await repo.getMatchHistory();
    if (!mounted) return;
    setState(() {
      _arenaPlayers = players;
      _matchHistory = history;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: CustomScrollView(
        slivers: [
          // ── App Bar ──
          SliverAppBar(
            backgroundColor: AppColors.canvas,
            elevation: 0,
            pinned: true,
            expandedHeight: 120,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
              onPressed: () => Navigator.of(context).pop(),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFF1A1A2E), Color(0xFF16213E)],
                  ),
                ),
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(
                      AppSpacing.lg,
                      AppSpacing.xl,
                      AppSpacing.lg,
                      AppSpacing.md,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(AppSpacing.sm),
                              decoration: BoxDecoration(
                                color: AppColors.solarGold.withValues(alpha: 0.2),
                                borderRadius: AppRadius.mdBorder,
                              ),
                              child: const Icon(
                                Icons.emoji_events,
                                color: AppColors.solarGold,
                                size: 28,
                              ),
                            ),
                            const SizedBox(width: AppSpacing.md),
                            const Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Elite Arena',
                                    style: TextStyle(
                                      fontSize: 22,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.textInverse,
                                      letterSpacing: -0.3,
                                    ),
                                  ),
                                  Text(
                                    'Compete. Climb. Conquer.',
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w400,
                                      color: Color(0xFFB0B0B0),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            // Current player rank badge
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppSpacing.md,
                                vertical: AppSpacing.sm,
                              ),
                              decoration: BoxDecoration(
                                color: _rankTiers[2].color.withValues(alpha: 0.2),
                                borderRadius: AppRadius.mdBorder,
                                border: Border.all(
                                  color: _rankTiers[2].color.withValues(alpha: 0.5),
                                  width: 1,
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    _rankTiers[2].icon,
                                    color: _rankTiers[2].color,
                                    size: 18,
                                  ),
                                  const SizedBox(width: AppSpacing.xs),
                                  Text(
                                    'Gold III',
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: _rankTiers[2].color,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),

          // ── Content ──
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── Player Stats Card ──
                  _buildPlayerStatsCard(),

                  const SizedBox(height: AppSpacing.xl),

                  // ── Rank Tier Selector ──
                  SectionHeader(title: 'Ranked Ladder'),
                  const SizedBox(height: AppSpacing.md),
                  _buildRankTierSelector(),

                  const SizedBox(height: AppSpacing.xl),

                  // ── Arena Modes ──
                  SectionHeader(title: 'Arena Modes'),
                  const SizedBox(height: AppSpacing.md),
                  _buildArenaModes(),

                  const SizedBox(height: AppSpacing.xl),

                  // ── Top Players ──
                  SectionHeader(
                    title: 'Top Players',
                    actionLabel: 'Full Rankings',
                    onAction: () => context.push('/leaderboard'),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  _buildTopPlayers(),

                  const SizedBox(height: AppSpacing.xl),

                  // ── Recent Matches ──
                  SectionHeader(title: 'Your Recent Matches'),
                  const SizedBox(height: AppSpacing.md),
                  _buildMatchHistory(),

                  const SizedBox(height: AppSpacing.xl),

                  // ── Rewards Preview ──
                  _buildRewardsPreview(),

                  const SizedBox(height: AppSpacing.xxl),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlayerStatsCard() {
    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF1A1A2E), Color(0xFF16213E)],
        ),
        borderRadius: AppRadius.lgBorder,
        boxShadow: AppShadows.md,
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Row(
          children: [
            // Avatar
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: AppColors.primary500.withValues(alpha: 0.2),
                borderRadius: AppRadius.lgBorder,
                border: Border.all(
                  color: AppColors.primary500.withValues(alpha: 0.4),
                  width: 2,
                ),
              ),
              alignment: Alignment.center,
              child: const Text(
                'PY',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary500,
                ),
              ),
            ),
            const SizedBox(width: AppSpacing.md),

            // Player info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Player_Y',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textInverse,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Row(
                    children: [
                      _statChip('Rating', '1,847', AppColors.solarGold),
                      const SizedBox(width: AppSpacing.sm),
                      _statChip('Win Rate', '67%', AppColors.success600),
                      const SizedBox(width: AppSpacing.sm),
                      _statChip('Streak', '5 🔥', AppColors.secondary500),
                    ],
                  ),
                ],
              ),
            ),

            // Rank icon
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: _rankTiers[_selectedTierIndex].color.withValues(alpha: 0.15),
                borderRadius: AppRadius.mdBorder,
              ),
              child: Icon(
                _rankTiers[_selectedTierIndex].icon,
                color: _rankTiers[_selectedTierIndex].color,
                size: 28,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _statChip(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: AppRadius.smBorder,
      ),
      child: Column(
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.w500,
              color: color.withValues(alpha: 0.8),
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRankTierSelector() {
    return SizedBox(
      height: 80,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: _rankTiers.length,
        separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.sm),
        itemBuilder: (context, index) {
          final tier = _rankTiers[index];
          final isSelected = index == _selectedTierIndex;
          return GestureDetector(
            onTap: () => setState(() => _selectedTierIndex = index),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 70,
              decoration: BoxDecoration(
                color: isSelected
                    ? tier.color.withValues(alpha: 0.15)
                    : AppColors.card,
                borderRadius: AppRadius.mdBorder,
                border: Border.all(
                  color: isSelected
                      ? tier.color
                      : AppColors.sunken,
                  width: isSelected ? 2 : 1,
                ),
                boxShadow: isSelected ? AppShadows.sm : null,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    tier.icon,
                    color: isSelected ? tier.color : AppColors.textMuted,
                    size: 24,
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    tier.label,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                      color: isSelected ? tier.color : AppColors.textMuted,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildArenaModes() {
    return Column(
      children: [
        _ArenaModeCard(
          title: 'Ranked Battle',
          description: '1v1 algorithm duels with rating at stake',
          icon: Icons.sports_martial_arts,
          color: AppColors.primary500,
          tier: 'All Ranks',
          reward: '+25 XP',
          onTap: () => context.push('/game/battle-arena'),
        ),
        const SizedBox(height: AppSpacing.md),
        _ArenaModeCard(
          title: 'Tournament',
          description: '8-player brackets, winner takes all',
          icon: Icons.emoji_events,
          color: AppColors.solarGold,
          tier: 'Gold+',
          reward: '1000 Coins',
          onTap: () => context.push('/game/battle-arena'),
        ),
        const SizedBox(height: AppSpacing.md),
        _ArenaModeCard(
          title: 'Daily Sprint',
          description: 'Race to solve 5 algorithms fastest',
          icon: Icons.timer,
          color: AppColors.secondary500,
          tier: 'All Ranks',
          reward: '+50 XP',
          onTap: () => context.push('/game/race-mode'),
        ),
      ],
    );
  }

  Widget _buildTopPlayers() {
    if (_isLoading) {
      return const Center(child: Padding(
        padding: EdgeInsets.all(AppSpacing.xl),
        child: CircularProgressIndicator(),
      ));
    }
    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: AppRadius.lgBorder,
        boxShadow: AppShadows.sm,
      ),
      child: Column(
        children: [
          ...List.generate(_arenaPlayers.length, (i) {
            final player = _arenaPlayers[i];
            final isLast = i == _arenaPlayers.length - 1;
            return Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.lg,
                vertical: AppSpacing.md,
              ),
              decoration: BoxDecoration(
                border: isLast
                    ? null
                    : const Border(
                        bottom: BorderSide(color: AppColors.sunken, width: 1),
                      ),
              ),
              child: Row(
                children: [
                  // Rank
                  SizedBox(
                    width: 28,
                    child: Text(
                      '#${player.rank}',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: player.rank <= 3
                            ? AppColors.solarGold
                            : AppColors.textMuted,
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),

                  // Avatar
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: AppColors.primary100,
                      borderRadius: AppRadius.fullBorder,
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      player.initials,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primary500,
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),

                  // Name
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          player.name,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        Row(
                          children: [
                            Icon(
                              player.wins > player.losses
                                  ? Icons.trending_up
                                  : Icons.trending_down,
                              size: 12,
                              color: player.wins > player.losses
                                  ? AppColors.success600
                                  : AppColors.error600,
                            ),
                            const SizedBox(width: 2),
                            Text(
                              '${player.wins}W ${player.losses}L',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w500,
                                color: player.wins > player.losses
                                    ? AppColors.success600
                                    : AppColors.error600,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Rating
                  Text(
                    '${player.rating}',
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildMatchHistory() {
    if (_isLoading) {
      return const Center(child: Padding(
        padding: EdgeInsets.all(AppSpacing.xl),
        child: CircularProgressIndicator(),
      ));
    }
    if (_matchHistory.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(AppSpacing.xl),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: AppRadius.mdBorder,
        ),
        child: const Center(
          child: Text(
            'No matches yet. Start a battle!',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.textMuted,
            ),
          ),
        ),
      );
    }
    return Column(
      children: [
        ...List.generate(_matchHistory.length, (i) {
          final match = _matchHistory[i];
          final isWin = match.result == 'win';
          return Container(
            margin: const EdgeInsets.only(bottom: AppSpacing.sm),
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: AppRadius.mdBorder,
              border: Border(
                left: BorderSide(
                  color: isWin ? AppColors.success600 : AppColors.error600,
                  width: 3,
                ),
              ),
              boxShadow: AppShadows.flat,
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: AppSpacing.xs,
                  ),
                  decoration: BoxDecoration(
                    color: isWin
                        ? AppColors.success100
                        : AppColors.error100,
                    borderRadius: AppRadius.smBorder,
                  ),
                  child: Text(
                    match.result.toUpperCase(),
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: isWin
                          ? AppColors.success600
                          : AppColors.error600,
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'vs ${match.opponent}',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      Text(
                        match.algorithm,
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                ),
                Text(
                  match.score,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: isWin ? AppColors.success600 : AppColors.error600,
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildRewardsPreview() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.solarGold.withValues(alpha: 0.15),
            AppColors.solarAmber.withValues(alpha: 0.08),
          ],
        ),
        borderRadius: AppRadius.lgBorder,
        border: Border.all(
          color: AppColors.solarGold.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(
                  Icons.card_giftcard,
                  color: AppColors.solarGold,
                  size: 22,
                ),
                const SizedBox(width: AppSpacing.sm),
                const Expanded(
                  child: Text(
                    'Season Rewards',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
                TextButton(
                  onPressed: () => context.push('/premium'),
                  child: const Text(
                    'View All',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary500,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            Row(
              children: [
                _rewardItem('Current Rank', 'Gold III', AppColors.solarGold),
                const SizedBox(width: AppSpacing.lg),
                _rewardItem('Next Rank', 'Gold II', AppColors.textMuted),
                const SizedBox(width: AppSpacing.lg),
                _rewardItem('Progress', '65%', AppColors.primary500),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _rewardItem(String label, String value, Color color) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: AppColors.textMuted,
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            value,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

/// ─────────────────────────────────────────────────────────────────────────────
/// Arena Mode Card — selectable game mode with icon, color, tier badge.
/// ─────────────────────────────────────────────────────────────────────────────
class _ArenaModeCard extends StatelessWidget {
  const _ArenaModeCard({
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
    required this.tier,
    required this.reward,
    required this.onTap,
  });

  final String title;
  final String description;
  final IconData icon;
  final Color color;
  final String tier;
  final String reward;
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
          border: Border(
            top: BorderSide(color: color, width: 3),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Row(
            children: [
              // Icon
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  borderRadius: AppRadius.mdBorder,
                ),
                alignment: Alignment.center,
                child: Icon(icon, color: color, size: 26),
              ),
              const SizedBox(width: AppSpacing.md),

              // Content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: AppTypography.h3),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      description,
                      style: AppTypography.caption,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),

              const SizedBox(width: AppSpacing.md),

              // Tier + Reward
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.sm,
                      vertical: AppSpacing.xs,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.sunken,
                      borderRadius: AppRadius.smBorder,
                    ),
                    child: Text(
                      tier,
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    reward,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppColors.solarGold,
                    ),
                  ),
                ],
              ),

              const SizedBox(width: AppSpacing.sm),
              Icon(
                Icons.chevron_right,
                color: AppColors.textMuted,
                size: 20,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
