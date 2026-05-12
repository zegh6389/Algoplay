import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:algoplay/features/stats/data/stats_repository.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('Stats activity tracking integration', () {
    late StatsRepository repo;

    setUp(() {
      SharedPreferences.setMockInitialValues({});
      repo = StatsRepository();
    });

    // ── RED: These tests verify that activity IS tracked when actions happen ──

    test('completing a module records activity and increments completed count',
        () async {
      // Simulate: user completes a lesson module
      await repo.recordActivity(5, 'lessons');
      await repo.incrementCompleted();

      final stats = await repo.loadStats();
      final today = DateTime.now();
      final todayKey =
          '${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}';

      // Activity map should have today's date
      expect(stats.activityMap[todayKey], 5.0);
      // Category breakdown should show lessons
      expect(stats.categoryBreakdown['lessons'], 1);
      // Algorithms completed should be incremented
      expect(stats.algorithmsCompleted, 1);
    });

    test('tutor quiz correct answer records activity and XP', () async {
      // Simulate: user answers a tutor quiz correctly
      await repo.recordActivity(2, 'tutor');
      await repo.addXP(10);

      final stats = await repo.loadStats();
      expect(stats.totalXP, 10);
      expect(stats.categoryBreakdown['tutor'], 1);
    });

    test('race mode game end records activity and XP from score', () async {
      // Simulate: user finishes a race mode game with score 85
      await repo.recordActivity(3, 'race-mode');
      await repo.addXP(85 ~/ 10); // 8 XP

      final stats = await repo.loadStats();
      expect(stats.totalXP, 8);
      expect(stats.categoryBreakdown['race-mode'], 1);
    });

    test('sorter game win records activity and XP', () async {
      // Simulate: user wins a sorter game
      await repo.recordActivity(2, 'sorter');
      await repo.addXP(5);

      final stats = await repo.loadStats();
      expect(stats.totalXP, 5);
      expect(stats.categoryBreakdown['sorter'], 1);
    });

    test('multiple activities accumulate correctly for stats page', () async {
      // Simulate: a full session with multiple activities
      await repo.recordActivity(5, 'lessons');
      await repo.incrementCompleted();
      await repo.recordActivity(3, 'tutor');
      await repo.addXP(10);
      await repo.recordActivity(4, 'race-mode');
      await repo.addXP(8);
      await repo.recordActivity(2, 'sorter');
      await repo.addXP(5);

      final stats = await repo.loadStats();
      final today = DateTime.now();
      final todayKey =
          '${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}';

      // Total minutes for today: 5 + 3 + 4 + 2 = 14
      expect(stats.activityMap[todayKey], 14.0);
      // Total XP: 10 + 8 + 5 = 23
      expect(stats.totalXP, 23);
      // Algorithms completed: 1
      expect(stats.algorithmsCompleted, 1);
      // Category breakdown
      expect(stats.categoryBreakdown['lessons'], 1);
      expect(stats.categoryBreakdown['tutor'], 1);
      expect(stats.categoryBreakdown['race-mode'], 1);
      expect(stats.categoryBreakdown['sorter'], 1);
      // Streak should be 1 (today only)
      expect(repo.getStreak(stats), 1);
    });

    test('getWeeklyActivity returns data for current week', () async {
      // Add activity for today
      await repo.recordActivity(15, 'lessons');
      await repo.recordActivity(10, 'tutor');

      final stats = await repo.loadStats();
      final weekly = repo.getWeeklyActivity(stats);

      expect(weekly.length, 7);
      // Today's slot should have 25 minutes
      final todayIdx = repo.todayWeekdayIndex;
      expect(weekly[todayIdx], 25.0);
      // Other days should be 0
      for (int i = 0; i < 7; i++) {
        if (i != todayIdx) {
          expect(weekly[i], 0.0);
        }
      }
    });

    test('activity from multiple days builds a streak', () async {
      // Create 3 consecutive days of activity
      final now = DateTime.now();
      final activityMap = <String, double>{};
      for (int i = 0; i < 3; i++) {
        final d = now.subtract(Duration(days: i));
        activityMap[
                '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}'] =
            (i + 1) * 10.0;
      }

      final stats = UserStats(
        totalXP: 50,
        algorithmsCompleted: 5,
        activityMap: activityMap,
        categoryBreakdown: {'lessons': 3},
      );

      expect(repo.getStreak(stats), 3);
    });

    test('stats page data consistency: active days matches activity map size',
        () async {
      // Create activity on 3 different days
      final now = DateTime.now();
      final activityMap = <String, double>{};
      for (int i = 0; i < 3; i++) {
        final d = now.subtract(Duration(days: i * 2)); // every other day
        activityMap[
                '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}'] =
            15.0;
      }

      final stats = UserStats(activityMap: activityMap);
      // "Active Days" card reads activityMap.length
      expect(stats.activityMap.length, 3);
    });
  });
}
