import 'dart:convert';

import 'package:flutter/foundation.dart' show immutable;
import 'package:shared_preferences/shared_preferences.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// Persistent statistics model for the stats page.
// ═══════════════════════════════════════════════════════════════════════════════

@immutable
class UserStats {
  final int totalXP;
  final int algorithmsCompleted;
  final int streakDays;
  /// ISO-8601 date string → minutes of activity for that day.
  final Map<String, double> activityMap;
  /// Category label → number of activities completed in that category.
  final Map<String, int> categoryBreakdown;

  const UserStats({
    this.totalXP = 0,
    this.algorithmsCompleted = 0,
    this.streakDays = 0,
    this.activityMap = const {},
    this.categoryBreakdown = const {},
  });

  UserStats copyWith({
    int? totalXP,
    int? algorithmsCompleted,
    int? streakDays,
    Map<String, double>? activityMap,
    Map<String, int>? categoryBreakdown,
  }) {
    return UserStats(
      totalXP: totalXP ?? this.totalXP,
      algorithmsCompleted: algorithmsCompleted ?? this.algorithmsCompleted,
      streakDays: streakDays ?? this.streakDays,
      activityMap: activityMap ?? this.activityMap,
      categoryBreakdown: categoryBreakdown ?? this.categoryBreakdown,
    );
  }

  Map<String, dynamic> toJson() => {
        'totalXP': totalXP,
        'algorithmsCompleted': algorithmsCompleted,
        'streakDays': streakDays,
        'activityMap': activityMap,
        'categoryBreakdown': categoryBreakdown,
      };

  factory UserStats.fromJson(Map<String, dynamic> json) {
    return UserStats(
      totalXP: json['totalXP'] as int? ?? 0,
      algorithmsCompleted: json['algorithmsCompleted'] as int? ?? 0,
      streakDays: json['streakDays'] as int? ?? 0,
      activityMap: (json['activityMap'] as Map<String, dynamic>?)
              ?.map((k, v) => MapEntry(k, (v as num).toDouble())) ??
          {},
      categoryBreakdown: (json['categoryBreakdown'] as Map<String, dynamic>?)
              ?.map((k, v) => MapEntry(k, v as int)) ??
          {},
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is UserStats &&
          runtimeType == other.runtimeType &&
          totalXP == other.totalXP &&
          algorithmsCompleted == other.algorithmsCompleted &&
          streakDays == other.streakDays &&
          _mapEquals(activityMap, other.activityMap) &&
          _mapEquals(categoryBreakdown, other.categoryBreakdown);

  @override
  int get hashCode => Object.hash(
        totalXP,
        algorithmsCompleted,
        streakDays,
        Object.hashAll(activityMap.entries),
        Object.hashAll(categoryBreakdown.entries),
      );

  static bool _mapEquals<K, V>(Map<K, V> a, Map<K, V> b) {
    if (a.length != b.length) return false;
    for (final key in a.keys) {
      if (a[key] != b[key]) return false;
    }
    return true;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Repository for loading / persisting [UserStats] via SharedPreferences.
// ═══════════════════════════════════════════════════════════════════════════════

class StatsRepository {
  static const _prefsKey = 'algoplay_stats';

  /// Load stats from SharedPreferences. Returns defaults if nothing stored.
  Future<UserStats> loadStats() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_prefsKey);
    if (raw == null) return const UserStats();
    return UserStats.fromJson(
      jsonDecode(raw) as Map<String, dynamic>,
    );
  }

  /// Persist stats to SharedPreferences.
  Future<void> saveStats(UserStats stats) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_prefsKey, jsonEncode(stats.toJson()));
  }

  /// Record [minutes] of activity for today in the given [category].
  Future<void> recordActivity(int minutes, String category) async {
    final stats = await loadStats();
    final todayKey = _todayKey();
    final newMap = Map<String, double>.from(stats.activityMap);
    newMap[todayKey] = (newMap[todayKey] ?? 0.0) + minutes.toDouble();

    final newBreakdown = Map<String, int>.from(stats.categoryBreakdown);
    newBreakdown[category] = (newBreakdown[category] ?? 0) + 1;

    await saveStats(stats.copyWith(
      activityMap: newMap,
      categoryBreakdown: newBreakdown,
    ));
  }

  /// Increment total XP by [amount].
  Future<void> addXP(int amount) async {
    final stats = await loadStats();
    await saveStats(stats.copyWith(totalXP: stats.totalXP + amount));
  }

  /// Increment algorithms completed count.
  Future<void> incrementCompleted() async {
    final stats = await loadStats();
    await saveStats(
        stats.copyWith(algorithmsCompleted: stats.algorithmsCompleted + 1));
  }

  /// Calculate the current streak: consecutive days with activity,
  /// counting backwards from today.
  int getStreak(UserStats stats) {
    if (stats.activityMap.isEmpty) return 0;

    int streak = 0;
    final today = DateTime.now();
    for (int i = 0; i < 365; i++) {
      final d = today.subtract(Duration(days: i));
      final key =
          '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
      if (stats.activityMap.containsKey(key)) {
        streak++;
      } else {
        // If no activity today yet (i == 0), don't break — the streak
        // could still count from yesterday onwards.
        if (i == 0) continue;
        break;
      }
    }
    return streak;
  }

  /// Get activity data for the current week (Mon–Sun) in minutes per day.
  /// Returns a list of 7 doubles (Monday = index 0).
  List<double> getWeeklyActivity(UserStats stats) {
    final today = DateTime.now();
    // Monday = 1, Sunday = 7 in DateTime
    final weekday = today.weekday; // 1=Mon .. 7=Sun
    final monday = today.subtract(Duration(days: weekday - 1));

    final result = <double>[];
    for (int i = 0; i < 7; i++) {
      final d = monday.add(Duration(days: i));
      final key =
          '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
      result.add(stats.activityMap[key] ?? 0.0);
    }
    return result;
  }

  /// Get today's weekday index (0=Mon, 6=Sun).
  int get todayWeekdayIndex => DateTime.now().weekday - 1;

  String _todayKey() {
    final now = DateTime.now();
    return '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
  }
}
