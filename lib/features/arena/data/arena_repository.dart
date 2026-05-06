import 'dart:convert';
import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// ArenaPlayer — an opponent in the Elite Arena.
// ═══════════════════════════════════════════════════════════════════════════════

@immutable
class ArenaPlayer {
  final int rank;
  final String name;
  final String initials;
  final int wins;
  final int losses;
  final int rating;

  const ArenaPlayer({
    required this.rank,
    required this.name,
    required this.initials,
    required this.wins,
    required this.losses,
    required this.rating,
  });

  factory ArenaPlayer.fromJson(Map<String, dynamic> json) {
    return ArenaPlayer(
      rank: json['rank'] as int,
      name: json['name'] as String,
      initials: json['initials'] as String,
      wins: json['wins'] as int,
      losses: json['losses'] as int,
      rating: json['rating'] as int,
    );
  }

  Map<String, dynamic> toJson() => {
        'rank': rank,
        'name': name,
        'initials': initials,
        'wins': wins,
        'losses': losses,
        'rating': rating,
      };

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ArenaPlayer &&
          runtimeType == other.runtimeType &&
          rank == other.rank &&
          name == other.name &&
          initials == other.initials &&
          wins == other.wins &&
          losses == other.losses &&
          rating == other.rating;

  @override
  int get hashCode => Object.hash(rank, name, initials, wins, losses, rating);
}

// ═══════════════════════════════════════════════════════════════════════════════
/// MatchRecord — a single completed arena match.
// ═══════════════════════════════════════════════════════════════════════════════

@immutable
class MatchRecord {
  final String opponent;
  final String result; // 'win' or 'loss'
  final String score;
  final String date;
  final String algorithm;

  const MatchRecord({
    required this.opponent,
    required this.result,
    required this.score,
    required this.date,
    required this.algorithm,
  });

  factory MatchRecord.fromJson(Map<String, dynamic> json) {
    return MatchRecord(
      opponent: json['opponent'] as String,
      result: json['result'] as String,
      score: json['score'] as String,
      date: json['date'] as String,
      algorithm: json['algorithm'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'opponent': opponent,
        'result': result,
        'score': score,
        'date': date,
        'algorithm': algorithm,
      };

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is MatchRecord &&
          runtimeType == other.runtimeType &&
          opponent == other.opponent &&
          result == other.result &&
          score == other.score &&
          date == other.date &&
          algorithm == other.algorithm;

  @override
  int get hashCode => Object.hash(opponent, result, score, date, algorithm);
}

// ═══════════════════════════════════════════════════════════════════════════════
/// ArenaRepository — manages arena opponents and match history.
// ═══════════════════════════════════════════════════════════════════════════════

class ArenaRepository {
  static const _kArenaKey = 'algoplay_arena';

  static const _opponentNames = <String>[
    'CodeMaster', 'AlgoKing', 'SwiftSort', 'BitWizard', 'TreeHero',
    'DataNinja', 'GraphGuru', 'HashHunter', 'QueueQueen', 'StackStar',
  ];



  /// Returns 10 generated opponent players, sorted by rating descending.
  Future<List<ArenaPlayer>> getPlayers() async {
    final rng = Random(42); // Fixed seed for deterministic results
    final List<ArenaPlayer> players = [];

    for (int i = 0; i < 10; i++) {
      final name = _opponentNames[i];
      final initials = name.substring(0, min(2, name.length)).toUpperCase();
      final rating = 2900 - (i * 80) + rng.nextInt(30) - 15;
      final wins = 20 + rng.nextInt(40);
      final losses = 5 + rng.nextInt(25);
      players.add(ArenaPlayer(
        rank: 0,
        name: name,
        initials: initials,
        wins: wins,
        losses: losses,
        rating: rating.clamp(1000, 9999),
      ));
    }

    // Sort by rating descending
    players.sort((a, b) => b.rating.compareTo(a.rating));

    // Assign sequential ranks
    return [
      for (int i = 0; i < players.length; i++)
        ArenaPlayer(
          rank: i + 1,
          name: players[i].name,
          initials: players[i].initials,
          wins: players[i].wins,
          losses: players[i].losses,
          rating: players[i].rating,
        ),
    ];
  }

  /// Returns the stored match history (most recent first).
  Future<List<MatchRecord>> getMatchHistory() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_kArenaKey);
    if (raw == null) return [];

    final json = jsonDecode(raw) as Map<String, dynamic>;
    final list = json['matchHistory'] as List<dynamic>?;
    if (list == null) return [];

    return list
        .map((e) => MatchRecord.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// Saves a match record, prepending it to existing history.
  Future<void> recordMatch(MatchRecord record) async {
    final prefs = await SharedPreferences.getInstance();
    final existing = await getMatchHistory();
    final updated = [record, ...existing];
    await prefs.setString(
      _kArenaKey,
      jsonEncode({
        'matchHistory': updated.map((e) => e.toJson()).toList(),
      }),
    );
  }
}
