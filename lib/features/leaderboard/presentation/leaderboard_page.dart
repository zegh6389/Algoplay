import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/section_header.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// Leaderboard Page — Global player rankings.
/// Displays top-100 players with filters for weekly / monthly / all-time.
// ═══════════════════════════════════════════════════════════════════════════════

/// Mock leaderboard data
class _LeaderboardEntry {
  final int rank;
  final String initials;
  final String name;
  final int xp;
  final int wins;
  final int streak;
  final bool isCurrentUser;

  const _LeaderboardEntry({
    required this.rank,
    required this.initials,
    required this.name,
    required this.xp,
    required this.wins,
    required this.streak,
    this.isCurrentUser = false,
  });
}

const _mockLeaderboard = <_LeaderboardEntry>[
  _LeaderboardEntry(rank: 1,   initials: 'AC', name: 'Alex Chen',       xp: 12450, wins: 312, streak: 28),
  _LeaderboardEntry(rank: 2,   initials: 'SK', name: 'Sarah Kim',        xp: 11200, wins: 287, streak: 21),
  _LeaderboardEntry(rank: 3,   initials: 'MT', name: 'Mike Torres',       xp: 10890, wins: 265, streak: 14),
  _LeaderboardEntry(rank: 4,   initials: 'EJ', name: 'Emma Johnson',     xp: 9870,  wins: 248, streak: 7),
  _LeaderboardEntry(rank: 5,   initials: 'DL', name: 'David Lee',       xp: 9210,  wins: 231, streak: 19),
  _LeaderboardEntry(rank: 6,   initials: 'AR', name: 'Aisha Rahman',    xp: 8740,  wins: 218, streak: 3),
  _LeaderboardEntry(rank: 7,   initials: 'JW', name: 'James Wilson',     xp: 8100,  wins: 202, streak: 11),
  _LeaderboardEntry(rank: 8,   initials: 'LP', name: 'Lisa Park',        xp: 7890,  wins: 197, streak: 5),
  _LeaderboardEntry(rank: 9,   initials: 'RO', name: 'Raj Oberoi',       xp: 7430,  wins: 186, streak: 8),
  _LeaderboardEntry(rank: 10,  initials: 'MG', name: 'Maria Garcia',    xp: 7100,  wins: 178, streak: 4),
  _LeaderboardEntry(rank: 11,  initials: 'TN', name: 'Tom Nielsen',     xp: 6890,  wins: 172, streak: 2),
  _LeaderboardEntry(rank: 12,  initials: 'KB', name: 'Kim Brown',        xp: 6540,  wins: 164, streak: 0),
  _LeaderboardEntry(rank: 13,  initials: 'YZ', name: 'Yuki Zhang',      xp: 6210,  wins: 155, streak: 6),
  _LeaderboardEntry(rank: 14,  initials: 'AH', name: 'Ali Hassan',      xp: 5980,  wins: 149, streak: 9),
  _LeaderboardEntry(rank: 15,  initials: 'SW', name: 'Sophia Wang',     xp: 5720,  wins: 143, streak: 1),
  _LeaderboardEntry(rank: 16,  initials: 'JM', name: 'John Miller',     xp: 5490,  wins: 137, streak: 0),
  _LeaderboardEntry(rank: 17,  initials: 'EP', name: 'Elena Petrova',    xp: 5210,  wins: 130, streak: 12),
  _LeaderboardEntry(rank: 18,  initials: 'CK', name: 'Chris Kim',        xp: 4980,  wins: 124, streak: 3),
  _LeaderboardEntry(rank: 19,  initials: 'NB', name: 'Nadia Benali',    xp: 4740,  wins: 118, streak: 7),
  _LeaderboardEntry(rank: 20,  initials: 'PL', name: 'Paul Liu',         xp: 4510,  wins: 113, streak: 0),
  _LeaderboardEntry(rank: 21,  initials: 'AM', name: 'Anna Martin',      xp: 4320,  wins: 108, streak: 4),
  _LeaderboardEntry(rank: 22,  initials: 'JS', name: 'Jack Smith',       xp: 4180,  wins: 104, streak: 2),
  _LeaderboardEntry(rank: 23,  initials: 'FT', name: 'Fatima Taha',      xp: 3960,  wins: 99,  streak: 0),
  _LeaderboardEntry(rank: 24,  initials: 'DK', name: 'Denis Kowalski',   xp: 3740,  wins: 93,  streak: 5),
  _LeaderboardEntry(rank: 25,  initials: 'RN', name: 'Rina Nakamura',    xp: 3520,  wins: 88,  streak: 1),
];

final _currentUserEntry = _LeaderboardEntry(
  rank: 47,
  initials: 'S',
  name: 'Student',
  xp: 1420,
  wins: 35,
  streak: 3,
  isCurrentUser: true,
);

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

            // ── Top 3 Podium ──
            if (_selectedTab == 2) ...[
              _buildPodium(),
              const SizedBox(height: AppSpacing.lg),
            ],

            // ── Rest of list ──
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                itemCount: _restOfList.length + 1, // +1 for current user
                itemBuilder: (context, index) {
                  if (index == _restOfList.length) {
                    return _buildCurrentUserEntry();
                  }
                  return _LeaderboardTile(entry: _restOfList[index]);
                },
              ),
            ),
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
              onTap: () => setState(() => _selectedTab = i),
            ),
        ],
      ),
    );
  }

  List<_LeaderboardEntry> get _restOfList {
    // For weekly/monthly show subset, all-time shows full
    if (_selectedTab < 2) {
      return _mockLeaderboard.skip(3).take(15).toList();
    }
    return _mockLeaderboard;
  }

  Widget _buildPodium() {
    final top3 = _mockLeaderboard.take(3).toList();
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
    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.md, bottom: AppSpacing.xl),
      child: Column(
        children: [
          const Divider(height: 1),
          const SizedBox(height: AppSpacing.md),
          _LeaderboardTile(entry: _currentUserEntry),
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

  final _LeaderboardEntry entry;
  final double height;

  @override
  Widget build(BuildContext context) {
    final isGold = entry.rank == 1;
    final isSilver = entry.rank == 2;
    final isBronze = entry.rank == 3;

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

  final _LeaderboardEntry entry;

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
