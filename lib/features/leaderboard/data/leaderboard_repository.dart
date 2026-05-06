import 'dart:convert';
import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// LeaderboardEntry — a single row in the global leaderboard.
// ═══════════════════════════════════════════════════════════════════════════════

@immutable
class LeaderboardEntry {
  final int rank;
  final String initials;
  final String name;
  final int xp;
  final int wins;
  final int streak;
  final bool isCurrentUser;

  const LeaderboardEntry({
    required this.rank,
    required this.initials,
    required this.name,
    required this.xp,
    required this.wins,
    required this.streak,
    this.isCurrentUser = false,
  });

  factory LeaderboardEntry.fromJson(Map<String, dynamic> json) {
    return LeaderboardEntry(
      rank: json['rank'] as int,
      initials: json['initials'] as String,
      name: json['name'] as String,
      xp: json['xp'] as int,
      wins: json['wins'] as int,
      streak: json['streak'] as int,
      isCurrentUser: json['isCurrentUser'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'rank': rank,
        'initials': initials,
        'name': name,
        'xp': xp,
        'wins': wins,
        'streak': streak,
        'isCurrentUser': isCurrentUser,
      };

  LeaderboardEntry copyWith({
    int? rank,
    String? initials,
    String? name,
    int? xp,
    int? wins,
    int? streak,
    bool? isCurrentUser,
  }) {
    return LeaderboardEntry(
      rank: rank ?? this.rank,
      initials: initials ?? this.initials,
      name: name ?? this.name,
      xp: xp ?? this.xp,
      wins: wins ?? this.wins,
      streak: streak ?? this.streak,
      isCurrentUser: isCurrentUser ?? this.isCurrentUser,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is LeaderboardEntry &&
          runtimeType == other.runtimeType &&
          rank == other.rank &&
          initials == other.initials &&
          name == other.name &&
          xp == other.xp &&
          wins == other.wins &&
          streak == other.streak &&
          isCurrentUser == other.isCurrentUser;

  @override
  int get hashCode =>
      Object.hash(rank, initials, name, xp, wins, streak, isCurrentUser);
}

// ═══════════════════════════════════════════════════════════════════════════════
/// LeaderboardRepository — generates bot entries and inserts the real user.
// ═══════════════════════════════════════════════════════════════════════════════

class LeaderboardRepository {
  static const _kStatsKey = 'algoplay_user_progress';

  // Realistic bot names
  static const _botNames = <String>[
    'Alex Chen', 'Sarah Kim', 'Mike Torres', 'Emma Johnson', 'David Lee',
    'Aisha Rahman', 'James Wilson', 'Lisa Park', 'Raj Oberoi', 'Maria Garcia',
    'Tom Nielsen', 'Kim Brown', 'Yuki Zhang', 'Ali Hassan', 'Sophia Wang',
    'John Miller', 'Elena Petrova', 'Chris Kim', 'Nadia Benali', 'Paul Liu',
  ];

  /// Returns the full leaderboard (bots + current user), sorted by XP desc.
  Future<List<LeaderboardEntry>> getLeaderboard({
    String filter = 'all',
  }) async {
    final prefs = await SharedPreferences.getInstance();

    // Read user XP from persisted progress
    int userXP = 0;
    int userStreak = 0;
    int userWins = 0;
    final raw = prefs.getString(_kStatsKey);
    if (raw != null) {
      final json = jsonDecode(raw) as Map<String, dynamic>;
      userXP = json['totalXP'] as int? ?? 0;
      userStreak = json['currentStreak'] as int? ?? 0;
      // Derive wins from completed algorithms count
      final completed = json['completedAlgorithms'] as List<dynamic>?;
      userWins = completed?.length ?? 0;
    }

    // Generate 20 bot entries with varied XP
    final rng = Random(42); // Fixed seed for deterministic results
    final List<LeaderboardEntry> bots = [];
    for (int i = 0; i < 20; i++) {
      final name = _botNames[i];
      final initials = name
          .split(' ')
          .map((s) => s.isNotEmpty ? s[0] : '')
          .join()
          .toUpperCase();
      // XP ranges from ~14000 down to ~3000
      final xp = 14000 - (i * 550) + rng.nextInt(200) - 100;
      final wins = (xp / 40).round() + rng.nextInt(20);
      final streak = rng.nextInt(15);
      bots.add(LeaderboardEntry(
        rank: 0, // placeholder, will be reassigned
        initials: initials,
        name: name,
        xp: xp.clamp(500, 99999),
        wins: wins,
        streak: streak,
      ));
    }

    // Create user entry
    final userEntry = LeaderboardEntry(
      rank: 0,
      initials: 'S',
      name: 'You',
      xp: userXP,
      wins: userWins,
      streak: userStreak,
      isCurrentUser: true,
    );

    // Combine and sort by XP descending
    final all = [...bots, userEntry];
    all.sort((a, b) => b.xp.compareTo(a.xp));

    // Assign sequential ranks
    final ranked = <LeaderboardEntry>[];
    for (int i = 0; i < all.length; i++) {
      ranked.add(all[i].copyWith(rank: i + 1));
    }

    // Apply filter: weekly shows top 15 (skip podium), monthly top 20, all shows everything
    if (filter == 'weekly') {
      return ranked;
    } else if (filter == 'monthly') {
      return ranked;
    }
    return ranked;
  }
}
