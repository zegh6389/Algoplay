import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_theme.dart';
import '../data/leaderboard_repository.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// Leaderboard Page — Global player rankings.
/// Displays top-100 players with filters for weekly / monthly / all-time.
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
/// LeaderboardPage
// ═══════════════════════════════════════════════════════════════════════════════
class LeaderboardPage extends ConsumerStatefulWidget {
  const LeaderboardPage({super.key});

  @override
  ConsumerState<LeaderboardPage> createState() => _LeaderboardPageState();
}

class _LeaderboardPageState extends ConsumerState<LeaderboardPage> {
  int _selectedTab = 0; // 0=Weekly, 1=Monthly, 2=All-Time

  List<LeaderboardEntry> _allEntries = [];
  LeaderboardEntry? _currentUserEntry;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadLeaderboard();
  }

  Future<void> _loadLeaderboard() async {
    final repo = LeaderboardRepository();
    final filter = ['weekly', 'monthly', 'all'][_selectedTab];
    final entries = await repo.getLeaderboard(filter: filter);
    if (!mounted) return;
    setState(() {
      _allEntries = entries;
      _currentUserEntry = entries.where((e) => e.isCurrentUser).firstOrNull;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: SafeArea(
        child: Column(
          children: [
            // ── Header ──
            Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text('Leaderboard', style: AppTypography.h1),
                      const Spacer(),
                      _buildTabSelector(),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Text(
                    'Compete with players worldwide',
                    style: AppTypography.caption,
                  ),
                ],
              ),
            ),

            // ── Content ──
            if (_isLoading)
              const Expanded(
                child: Center(child: CircularProgressIndicator()),
              )
            else ...[
              // ── Top 3 Podium (all-time only) ──
              if (_selectedTab == 2) ...[
                _buildPodium(),
                const SizedBox(height: AppSpacing.lg),
              ],

              // ── Rest of list ──
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  itemCount: _restOfList.length + (_currentUserEntry != null ? 1 : 0),
                  itemBuilder: (context, index) {
                    if (index == _restOfList.length) {
                      return _buildCurrentUserEntry();
                    }
                    return _LeaderboardTile(entry: _restOfList[index]);
                  },
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildTabSelector() {
    final tabs = ['Weekly', 'Monthly', 'All-Time'];
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.sunken,
        borderRadius: AppRadius.mdBorder,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (int i = 0; i < tabs.length; i++)
            _TabChip(
              label: tabs[i],
              isSelected: _selectedTab == i,
              onTap: () {
                setState(() => _selectedTab = i);
                _loadLeaderboard();
              },
            ),
        ],
      ),
    );
  }

  List<LeaderboardEntry> get _restOfList {
    // For weekly/monthly show subset, all-time shows full
    if (_selectedTab < 2) {
      return _allEntries.skip(3).take(15).toList();
    }
    return _allEntries;
  }

  Widget _buildPodium() {
    final top3 = _allEntries.take(3).toList();
    if (top3.length < 3) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // 2nd place
          Expanded(
            child: _PodiumEntry(entry: top3[1], height: 100),
          ),
          const SizedBox(width: AppSpacing.sm),
          // 1st place
          Expanded(
            child: _PodiumEntry(entry: top3[0], height: 130),
          ),
          const SizedBox(width: AppSpacing.sm),
          // 3rd place
          Expanded(
            child: _PodiumEntry(entry: top3[2], height: 80),
          ),
        ],
      ),
    );
  }

  Widget _buildCurrentUserEntry() {
    if (_currentUserEntry == null) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.md, bottom: AppSpacing.xl),
      child: Column(
        children: [
          const Divider(height: 1),
          const SizedBox(height: AppSpacing.md),
          _LeaderboardTile(entry: _currentUserEntry!),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Tab chip
// ═══════════════════════════════════════════════════════════════════════════════
class _TabChip extends StatelessWidget {
  const _TabChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm,
        ),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.card : Colors.transparent,
          borderRadius: AppRadius.smBorder,
          boxShadow: isSelected ? AppShadows.sm : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: isSelected ? AppColors.primary500 : AppColors.textMuted,
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Podium entry for top 3
// ═══════════════════════════════════════════════════════════════════════════════
class _PodiumEntry extends StatelessWidget {
  const _PodiumEntry({required this.entry, required this.height});

  final LeaderboardEntry entry;
  final double height;

  @override
  Widget build(BuildContext context) {
    final isGold = entry.rank == 1;
    final isSilver = entry.rank == 2;

    Color podiumColor;
    if (isGold) {
      podiumColor = AppColors.solarGold;
    } else if (isSilver) {
      podiumColor = const Color(0xFFB0B0B0);
    } else {
      podiumColor = const Color(0xFFCD7F32);
    }

    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        // Avatar
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: AppColors.primary100,
            shape: BoxShape.circle,
            border: Border.all(color: podiumColor, width: 2),
          ),
          alignment: Alignment.center,
          child: Text(
            entry.initials,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppColors.primary700,
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(
          entry.name,
          style: AppTypography.caption.copyWith(fontWeight: FontWeight.w600),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        Text(
          '${entry.xp} XP',
          style: AppTypography.overline.copyWith(
            color: AppColors.solarGold,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        // Podium block
        Container(
          height: height,
          decoration: BoxDecoration(
            color: podiumColor,
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(8),
              topRight: Radius.circular(8),
            ),
          ),
          alignment: Alignment.center,
          child: Text(
            '#${entry.rank}',
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w900,
              color: Colors.white,
            ),
          ),
        ),
      ],
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Leaderboard row tile
// ═══════════════════════════════════════════════════════════════════════════════
class _LeaderboardTile extends StatelessWidget {
  const _LeaderboardTile({required this.entry});

  final LeaderboardEntry entry;

  @override
  Widget build(BuildContext context) {
    final isTop10 = entry.rank <= 10;

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.md,
      ),
      decoration: BoxDecoration(
        color: entry.isCurrentUser ? AppColors.primary50 : AppColors.card,
        borderRadius: AppRadius.mdBorder,
        boxShadow: AppShadows.flat,
        border: entry.isCurrentUser
            ? Border.all(color: AppColors.primary300, width: 1.5)
            : null,
      ),
      child: Row(
        children: [
          // Rank
          SizedBox(
            width: 32,
            child: Text(
              '#${entry.rank}',
              style: TextStyle(
                fontSize: 13,
                fontWeight: isTop10 ? FontWeight.w700 : FontWeight.w600,
                color: isTop10 ? AppColors.solarGold : AppColors.textMuted,
              ),
            ),
          ),

          const SizedBox(width: AppSpacing.sm),

          // Avatar
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: entry.isCurrentUser ? AppColors.primary100 : AppColors.sunken,
              borderRadius: AppRadius.mdBorder,
            ),
            alignment: Alignment.center,
            child: Text(
              entry.initials,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: entry.isCurrentUser ? AppColors.primary700 : AppColors.textSecondary,
              ),
            ),
          ),

          const SizedBox(width: AppSpacing.md),

          // Name + wins
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  entry.name,
                  style: AppTypography.body.copyWith(
                    fontWeight: entry.isCurrentUser ? FontWeight.w700 : FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '${entry.wins} wins  •  ${entry.streak}🔥 streak',
                  style: AppTypography.overline,
                ),
              ],
            ),
          ),

          // XP
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.sm,
              vertical: AppSpacing.xs,
            ),
            decoration: BoxDecoration(
              color: AppColors.solarGold.withValues(alpha: 0.12),
              borderRadius: AppRadius.smBorder,
            ),
            child: Text(
              '${entry.xp} XP',
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: AppColors.solarGold,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
