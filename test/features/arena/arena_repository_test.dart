import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:algoplay/features/arena/data/arena_repository.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('ArenaPlayer', () {
    test('creates with required fields', () {
      final player = ArenaPlayer(
        rank: 1, name: 'CodeMaster', initials: 'CM', wins: 45, losses: 12, rating: 2847,
      );
      expect(player.rank, 1);
      expect(player.name, 'CodeMaster');
      expect(player.initials, 'CM');
      expect(player.wins, 45);
      expect(player.losses, 12);
      expect(player.rating, 2847);
    });

    test('JSON round-trip preserves all fields', () {
      final player = ArenaPlayer(
        rank: 3, name: 'SwiftSort', initials: 'SS', wins: 30, losses: 20, rating: 2691,
      );
      final json = player.toJson();
      final restored = ArenaPlayer.fromJson(json);
      expect(restored, player);
    });
  });

  group('MatchRecord', () {
    test('creates with required fields', () {
      final record = MatchRecord(
        opponent: 'AlgoKing',
        result: 'win',
        score: '+18',
        date: '2025-01-15',
        algorithm: 'Quick Sort',
      );
      expect(record.opponent, 'AlgoKing');
      expect(record.result, 'win');
      expect(record.score, '+18');
      expect(record.date, '2025-01-15');
      expect(record.algorithm, 'Quick Sort');
    });

    test('JSON round-trip preserves all fields', () {
      final record = MatchRecord(
        opponent: 'BitWizard',
        result: 'loss',
        score: '-12',
        date: '2025-01-14',
        algorithm: 'Merge Sort',
      );
      final json = record.toJson();
      final restored = MatchRecord.fromJson(json);
      expect(restored.opponent, record.opponent);
      expect(restored.result, record.result);
      expect(restored.score, record.score);
      expect(restored.date, record.date);
      expect(restored.algorithm, record.algorithm);
    });
  });

  group('ArenaRepository', () {
    late ArenaRepository repo;

    setUp(() async {
      SharedPreferences.setMockInitialValues({});
      repo = ArenaRepository();
    });

    group('getPlayers', () {
      test('returns generated opponents', () async {
        final players = await repo.getPlayers();
        expect(players, isNotEmpty);
      });

      test('returns 10 opponent players', () async {
        final players = await repo.getPlayers();
        expect(players.length, 10);
      });

      test('players have realistic names', () async {
        final players = await repo.getPlayers();
        for (final player in players) {
          expect(player.name, isNotEmpty);
          expect(player.initials, isNotEmpty);
          expect(player.rating, greaterThan(0));
        }
      });

      test('players are sorted by rating descending', () async {
        final players = await repo.getPlayers();
        for (int i = 1; i < players.length; i++) {
          expect(players[i - 1].rating, greaterThanOrEqualTo(players[i].rating));
        }
      });

      test('players have sequential ranks', () async {
        final players = await repo.getPlayers();
        for (int i = 0; i < players.length; i++) {
          expect(players[i].rank, i + 1);
        }
      });
    });

    group('getMatchHistory', () {
      test('returns empty list when no matches stored', () async {
        final history = await repo.getMatchHistory();
        expect(history, isEmpty);
      });

      test('returns stored matches', () async {
        // Pre-populate
        final prefs = await SharedPreferences.getInstance();
        final matches = [
          MatchRecord(opponent: 'AlgoKing', result: 'win', score: '+18', date: '2025-01-15', algorithm: 'Quick Sort').toJson(),
          MatchRecord(opponent: 'SwiftSort', result: 'loss', score: '-12', date: '2025-01-14', algorithm: 'Merge Sort').toJson(),
        ];
        await prefs.setString('algoplay_arena', jsonEncode({'matchHistory': matches}));

        final history = await repo.getMatchHistory();
        expect(history.length, 2);
        expect(history[0].opponent, 'AlgoKing');
        expect(history[0].result, 'win');
        expect(history[1].opponent, 'SwiftSort');
        expect(history[1].result, 'loss');
      });
    });

    group('recordMatch', () {
      test('saves a match and loads it back', () async {
        final record = MatchRecord(
          opponent: 'TreeHero',
          result: 'win',
          score: '+22',
          date: '2025-01-13',
          algorithm: 'Dijkstra',
        );
        await repo.recordMatch(record);

        final history = await repo.getMatchHistory();
        expect(history.length, 1);
        expect(history[0].opponent, 'TreeHero');
        expect(history[0].result, 'win');
        expect(history[0].score, '+22');
        expect(history[0].algorithm, 'Dijkstra');
      });

      test('appends match to existing history', () async {
        // Pre-populate one match
        final prefs = await SharedPreferences.getInstance();
        final existing = [
          MatchRecord(opponent: 'AlgoKing', result: 'win', score: '+18', date: '2025-01-15', algorithm: 'Quick Sort').toJson(),
        ];
        await prefs.setString('algoplay_arena', jsonEncode({'matchHistory': existing}));

        // Record another
        await repo.recordMatch(MatchRecord(
          opponent: 'BitWizard', result: 'loss', score: '-12', date: '2025-01-14', algorithm: 'Merge Sort',
        ));

        final history = await repo.getMatchHistory();
        expect(history.length, 2);
        // Most recent first
        expect(history[0].opponent, 'BitWizard');
        expect(history[1].opponent, 'AlgoKing');
      });

      test('persists across repository instances', () async {
        await repo.recordMatch(MatchRecord(
          opponent: 'DataNinja', result: 'win', score: '+10', date: '2025-01-12', algorithm: 'Heap Sort',
        ));

        // New instance
        final repo2 = ArenaRepository();
        final history = await repo2.getMatchHistory();
        expect(history.length, 1);
        expect(history[0].opponent, 'DataNinja');
      });
    });
  });
}
