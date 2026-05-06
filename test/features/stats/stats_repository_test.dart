import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:algoplay/features/stats/data/stats_repository.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('UserStats', () {
    test('default constructor has zero values', () {
      const stats = UserStats();
      expect(stats.totalXP, 0);
      expect(stats.algorithmsCompleted, 0);
      expect(stats.streakDays, 0);
      expect(stats.activityMap, isEmpty);
      expect(stats.categoryBreakdown, isEmpty);
    });

    test('toJson produces valid JSON-encodable map', () {
      const stats = UserStats(
        totalXP: 150,
        algorithmsCompleted: 10,
        streakDays: 3,
        activityMap: {'2026-05-04': 45.0, '2026-05-05': 30.0},
        categoryBreakdown: {'sorting': 5, 'searching': 3},
      );
      final json = stats.toJson();
      // Should not throw
      final encoded = jsonEncode(json);
      expect(encoded, isA<String>());
      expect(json['totalXP'], 150);
      expect(json['algorithmsCompleted'], 10);
      expect(json['streakDays'], 3);
    });

    test('fromJson restores all fields correctly', () {
      const original = UserStats(
        totalXP: 200,
        algorithmsCompleted: 15,
        streakDays: 5,
        activityMap: {'2026-05-01': 60.0, '2026-05-02': 90.0},
        categoryBreakdown: {'graphs': 8},
      );
      final json = original.toJson();
      final restored = UserStats.fromJson(json);
      expect(restored.totalXP, original.totalXP);
      expect(restored.algorithmsCompleted, original.algorithmsCompleted);
      expect(restored.streakDays, original.streakDays);
      expect(restored.activityMap, original.activityMap);
      expect(restored.categoryBreakdown, original.categoryBreakdown);
    });

    test('toJson/fromJson roundtrip is lossless', () {
      const stats = UserStats(
        totalXP: 999,
        algorithmsCompleted: 42,
        streakDays: 7,
        activityMap: {'2026-05-06': 15.5},
        categoryBreakdown: {'dp': 12, 'greedy': 7},
      );
      final roundtrip = UserStats.fromJson(stats.toJson());
      expect(roundtrip, stats);
    });

    test('fromJson handles empty map with defaults', () {
      final stats = UserStats.fromJson({});
      expect(stats.totalXP, 0);
      expect(stats.algorithmsCompleted, 0);
      expect(stats.streakDays, 0);
      expect(stats.activityMap, isEmpty);
      expect(stats.categoryBreakdown, isEmpty);
    });

    test('copyWith overrides specified fields', () {
      const stats = UserStats(totalXP: 100, algorithmsCompleted: 5);
      final copy = stats.copyWith(totalXP: 200, streakDays: 3);
      expect(copy.totalXP, 200);
      expect(copy.streakDays, 3);
      expect(copy.algorithmsCompleted, 5); // unchanged
    });
  });

  group('StatsRepository', () {
    late StatsRepository repo;

    setUp(() {
      SharedPreferences.setMockInitialValues({});
      repo = StatsRepository();
    });

    test('loadStats returns default when no data stored', () async {
      final stats = await repo.loadStats();
      expect(stats.totalXP, 0);
      expect(stats.algorithmsCompleted, 0);
      expect(stats.streakDays, 0);
      expect(stats.activityMap, isEmpty);
      expect(stats.categoryBreakdown, isEmpty);
    });

    test('saveStats persists and loadStats retrieves correctly', () async {
      const stats = UserStats(
        totalXP: 350,
        algorithmsCompleted: 20,
        streakDays: 4,
        activityMap: {'2026-05-04': 45.0},
        categoryBreakdown: {'sorting': 10},
      );
      await repo.saveStats(stats);
      final loaded = await repo.loadStats();
      expect(loaded, stats);
    });

    test('recordActivity adds minutes to today and increments category', () async {
      await repo.recordActivity(30, 'sorting');
      final stats = await repo.loadStats();
      final today = DateTime.now();
      final todayKey =
          '${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}';
      expect(stats.activityMap[todayKey], 30.0);
      expect(stats.categoryBreakdown['sorting'], 1);
    });

    test('recordActivity accumulates minutes on same day', () async {
      await repo.recordActivity(15, 'sorting');
      await repo.recordActivity(25, 'sorting');
      final stats = await repo.loadStats();
      final today = DateTime.now();
      final todayKey =
          '${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}';
      expect(stats.activityMap[todayKey], 40.0);
      // category count incremented twice (each activity = 1 completion)
      expect(stats.categoryBreakdown['sorting'], 2);
    });

    test('addXP increments totalXP', () async {
      await repo.addXP(50);
      var stats = await repo.loadStats();
      expect(stats.totalXP, 50);

      await repo.addXP(75);
      stats = await repo.loadStats();
      expect(stats.totalXP, 125);
    });

    test('incrementCompleted increments algorithmsCompleted', () async {
      await repo.incrementCompleted();
      var stats = await repo.loadStats();
      expect(stats.algorithmsCompleted, 1);

      await repo.incrementCompleted();
      await repo.incrementCompleted();
      stats = await repo.loadStats();
      expect(stats.algorithmsCompleted, 3);
    });

    test('getStreak returns 0 when no activity', () async {
      final streak = repo.getStreak(const UserStats());
      expect(streak, 0);
    });

    test('getStreak returns 1 for activity only today', () async {
      final today = DateTime.now();
      final todayKey =
          '${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}';
      final stats = UserStats(activityMap: {todayKey: 30.0});
      expect(repo.getStreak(stats), 1);
    });

    test('getStreak counts consecutive days backwards', () async {
      final today = DateTime.now();
      final activityMap = <String, double>{};
      for (int i = 0; i < 5; i++) {
        final d = today.subtract(Duration(days: i));
        activityMap[
            '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}'] =
            (i + 1) * 10.0;
      }
      final stats = UserStats(activityMap: activityMap);
      expect(repo.getStreak(stats), 5);
    });

    test('getStreak stops at gap in consecutive days', () async {
      final today = DateTime.now();
      final d1 = today.subtract(const Duration(days: 2));
      // Only today and 2 days ago — gap at yesterday
      final activityMap = <String, double>{
        '${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}': 20.0,
        '${d1.year}-${d1.month.toString().padLeft(2, '0')}-${d1.day.toString().padLeft(2, '0')}': 10.0,
      };
      final stats = UserStats(activityMap: activityMap);
      expect(repo.getStreak(stats), 1);
    });
  });
}
