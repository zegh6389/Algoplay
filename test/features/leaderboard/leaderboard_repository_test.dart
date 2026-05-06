import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:algoplay/features/leaderboard/data/leaderboard_repository.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('LeaderboardEntry', () {
    test('creates with required fields', () {
      final entry = LeaderboardEntry(
        rank: 1,
        initials: 'AC',
        name: 'Alex Chen',
        xp: 12450,
        wins: 312,
        streak: 28,
        isCurrentUser: false,
      );
      expect(entry.rank, 1);
      expect(entry.initials, 'AC');
      expect(entry.name, 'Alex Chen');
      expect(entry.xp, 12450);
      expect(entry.wins, 312);
      expect(entry.streak, 28);
      expect(entry.isCurrentUser, isFalse);
    });

    test('defaults isCurrentUser to false', () {
      final entry = LeaderboardEntry(
        rank: 5, initials: 'DL', name: 'David Lee', xp: 9210, wins: 231, streak: 19,
      );
      expect(entry.isCurrentUser, isFalse);
    });

    test('JSON round-trip preserves all fields', () {
      final entry = LeaderboardEntry(
        rank: 3, initials: 'MT', name: 'Mike Torres', xp: 10890, wins: 265, streak: 14, isCurrentUser: true,
      );
      final json = entry.toJson();
      final restored = LeaderboardEntry.fromJson(json);
      expect(restored.rank, entry.rank);
      expect(restored.initials, entry.initials);
      expect(restored.name, entry.name);
      expect(restored.xp, entry.xp);
      expect(restored.wins, entry.wins);
      expect(restored.streak, entry.streak);
      expect(restored.isCurrentUser, entry.isCurrentUser);
    });

    test('JSON round-trip for list of entries', () {
      final entries = [
        LeaderboardEntry(rank: 1, initials: 'AC', name: 'Alex', xp: 1000, wins: 10, streak: 5),
        LeaderboardEntry(rank: 2, initials: 'BK', name: 'Bob', xp: 800, wins: 8, streak: 3),
      ];
      final jsonList = entries.map((e) => e.toJson()).toList();
      final restored = jsonList.map((j) => LeaderboardEntry.fromJson(j)).toList();
      expect(restored.length, 2);
      expect(restored[0].name, 'Alex');
      expect(restored[1].xp, 800);
    });
  });

  group('LeaderboardRepository', () {
    late LeaderboardRepository repo;

    setUp(() async {
      SharedPreferences.setMockInitialValues({});
      repo = LeaderboardRepository();
    });

    test('getLeaderboard returns entries', () async {
      final entries = await repo.getLeaderboard();
      expect(entries, isNotEmpty);
    });

    test('getLeaderboard returns 20 bot entries plus user', () async {
      final entries = await repo.getLeaderboard();
      // 20 bots + 1 user = 21 total
      expect(entries.length, 21);
    });

    test('getLeaderboard includes exactly one current user entry', () async {
      final entries = await repo.getLeaderboard();
      final userEntries = entries.where((e) => e.isCurrentUser).toList();
      expect(userEntries.length, 1);
      expect(userEntries.first.name, 'You');
    });

    test('leaderboard is sorted by XP descending', () async {
      final entries = await repo.getLeaderboard();
      for (int i = 1; i < entries.length; i++) {
        expect(entries[i - 1].xp, greaterThanOrEqualTo(entries[i].xp));
      }
    });

    test('ranks are sequential starting from 1', () async {
      final entries = await repo.getLeaderboard();
      for (int i = 0; i < entries.length; i++) {
        expect(entries[i].rank, i + 1);
      }
    });

    test('user rank is correctly inserted among bots based on XP', () async {
      // Set up user with specific XP via algoplay_user_progress
      final prefs = await SharedPreferences.getInstance();
      final userProgress = {'totalXP': 8000, 'level': 10, 'currentStreak': 5};
      await prefs.setString('algoplay_user_progress', jsonEncode(userProgress));

      final entries = await repo.getLeaderboard();
      final userEntry = entries.firstWhere((e) => e.isCurrentUser);
      expect(userEntry.xp, 8000);

      // Verify user is at correct position
      final userIndex = entries.indexOf(userEntry);
      if (userIndex > 0) {
        expect(entries[userIndex - 1].xp, greaterThanOrEqualTo(8000));
      }
      if (userIndex < entries.length - 1) {
        expect(entries[userIndex + 1].xp, lessThanOrEqualTo(8000));
      }
    });

    test('bot entries have realistic names and varied XP', () async {
      final entries = await repo.getLeaderboard();
      final bots = entries.where((e) => !e.isCurrentUser).toList();
      // All bots should have different names
      final names = bots.map((e) => e.name).toSet();
      expect(names.length, bots.length);
      // XP should be > 0
      for (final bot in bots) {
        expect(bot.xp, greaterThan(0));
      }
    });

    test('getLeaderboard with filter parameter works', () async {
      final entries = await repo.getLeaderboard(filter: 'weekly');
      expect(entries, isNotEmpty);
      final allEntries = await repo.getLeaderboard(filter: 'all');
      expect(allEntries.length, greaterThanOrEqualTo(entries.length));
    });

    test('user entry has correct streak from user progress', () async {
      final prefs = await SharedPreferences.getInstance();
      final userProgress = {'totalXP': 5000, 'level': 5, 'currentStreak': 7};
      await prefs.setString('algoplay_user_progress', jsonEncode(userProgress));

      final entries = await repo.getLeaderboard();
      final userEntry = entries.firstWhere((e) => e.isCurrentUser);
      expect(userEntry.streak, 7);
    });
  });
}
