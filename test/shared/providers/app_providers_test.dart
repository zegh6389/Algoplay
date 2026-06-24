import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:algoplay/shared/models/game_state.dart';
import 'package:algoplay/shared/providers/app_providers.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('UserProgressNotifier', () {
    late UserProgressNotifier notifier;

    setUp(() async {
      SharedPreferences.setMockInitialValues({});
      notifier = UserProgressNotifier();
    });

    test('initial state has defaults', () {
      final state = notifier.state;
      expect(state.level, 1);
      expect(state.totalXP, 0);
      expect(state.currentStreak, 0);
      expect(state.lastPlayedDate, isNull);
      expect(state.completedAlgorithms, isEmpty);
      expect(state.unlockedCategories, isEmpty);
      expect(state.skillNodes, isEmpty);
      expect(state.quizHistory, isEmpty);
      expect(state.challengeHistory, isEmpty);
      expect(state.algorithmMastery, isEmpty);
    });

    group('addXP', () {
      test('updates totalXP', () {
        notifier.addXP(50);
        expect(notifier.state.totalXP, 50);
      });

      test('accumulates XP across multiple calls', () {
        notifier.addXP(30);
        notifier.addXP(25);
        expect(notifier.state.totalXP, 55);
      });

      test('calculates correct level after adding XP', () {
        notifier.addXP(150);
        expect(notifier.state.totalXP, 150);
        expect(notifier.state.level, 2);
      });

      test('level up at exactly 100 XP', () {
        notifier.addXP(100);
        expect(notifier.state.level, 2);
        expect(notifier.state.totalXP, 100);
      });

      test('multiple level ups', () {
        notifier.addXP(500);
        expect(notifier.state.totalXP, 500);
        expect(notifier.state.level, 6);
      });
    });

    group('completeAlgorithm', () {
      test('adds algorithm to completed list', () {
        notifier.completeAlgorithm('bubble-sort');
        expect(notifier.state.completedAlgorithms, ['bubble-sort']);
      });

      test('adds multiple different algorithms', () {
        notifier.completeAlgorithm('bubble-sort');
        notifier.completeAlgorithm('merge-sort');
        expect(
          notifier.state.completedAlgorithms,
          ['bubble-sort', 'merge-sort'],
        );
      });

      test('is idempotent — same algorithm twice does not duplicate', () {
        notifier.completeAlgorithm('bubble-sort');
        notifier.completeAlgorithm('bubble-sort');
        expect(notifier.state.completedAlgorithms, ['bubble-sort']);
        expect(notifier.state.completedAlgorithms.length, 1);
      });

      test('idempotency does not block different algorithms after duplicate', () {
        notifier.completeAlgorithm('bubble-sort');
        notifier.completeAlgorithm('bubble-sort');
        notifier.completeAlgorithm('merge-sort');
        expect(
          notifier.state.completedAlgorithms,
          ['bubble-sort', 'merge-sort'],
        );
      });
    });

    group('updateStreak', () {
      test('sets streak to 1 when no previous date', () {
        notifier.updateStreak('2026-05-04');
        expect(notifier.state.currentStreak, 1);
        expect(notifier.state.lastPlayedDate, '2026-05-04');
      });

      test('does not change streak on same day', () {
        notifier.updateStreak('2026-05-04');
        notifier.updateStreak('2026-05-04');
        expect(notifier.state.currentStreak, 1);
      });

      test('increments streak when consecutive day', () {
        notifier.updateStreak('2026-05-03');
        notifier.updateStreak('2026-05-04');
        expect(notifier.state.currentStreak, 2);
      });

      test('resets streak when gap > 1 day', () {
        notifier.updateStreak('2026-05-01');
        notifier.updateStreak('2026-05-04');
        expect(notifier.state.currentStreak, 1);
      });
    });

    group('unlockCategory', () {
      test('adds category to unlocked list', () {
        notifier.unlockCategory('sorting');
        expect(notifier.state.unlockedCategories, ['sorting']);
      });

      test('is idempotent — same category twice', () {
        notifier.unlockCategory('sorting');
        notifier.unlockCategory('sorting');
        expect(notifier.state.unlockedCategories, ['sorting']);
      });
    });

    group('reset', () {
      test('restores default state', () {
        notifier.addXP(200);
        notifier.completeAlgorithm('bubble-sort');
        notifier.reset();
        expect(notifier.state.level, 1);
        expect(notifier.state.totalXP, 0);
        expect(notifier.state.completedAlgorithms, isEmpty);
      });
    });
  });

  group('HighScores', () {
    test('new fields default to 0', () {
      const hs = HighScores();
      expect(hs.sorterBest, 0);
      expect(hs.gridEscapeWins, 0);
      expect(hs.gridEscapeBestScore, 0);
      expect(hs.battleArenaWins, 0);
      expect(hs.battleArenaBestScore, 0);
      expect(hs.raceModeBest, 0);
    });

    test('toJson/fromJson round-trips all fields losslessly', () {
      const hs = HighScores(
        sorterBest: 120,
        gridEscapeWins: 3,
        gridEscapeBestScore: 880,
        battleArenaWins: 5,
        battleArenaBestScore: 64,
        raceModeBest: 200,
      );
      final restored = HighScores.fromJson(hs.toJson());
      expect(restored, hs);
    });

    test('fromJson tolerates legacy JSON missing the new keys', () {
      // Simulates data written before the redesign added the new fields.
      final legacy = {
        'sorterBest': 99,
        'gridEscapeWins': 2,
      };
      final hs = HighScores.fromJson(legacy);
      expect(hs.sorterBest, 99);
      expect(hs.gridEscapeWins, 2);
      expect(hs.gridEscapeBestScore, 0);
      expect(hs.battleArenaWins, 0);
      expect(hs.battleArenaBestScore, 0);
      expect(hs.raceModeBest, 0);
    });

    test('equality considers all fields', () {
      const a = HighScores(battleArenaWins: 1, battleArenaBestScore: 10);
      final b = a.copyWith();
      expect(a, b);
      expect(a == a.copyWith(battleArenaWins: 2), isFalse);
    });
  });

  group('GameStateNotifier', () {
    late GameStateNotifier notifier;

    setUp(() async {
      SharedPreferences.setMockInitialValues({});
      notifier = GameStateNotifier();
    });

    test('initial high scores are all zero', () {
      final hs = notifier.state.highScores;
      expect(hs.sorterBest, 0);
      expect(hs.gridEscapeWins, 0);
      expect(hs.gridEscapeBestScore, 0);
      expect(hs.battleArenaWins, 0);
      expect(hs.battleArenaBestScore, 0);
      expect(hs.raceModeBest, 0);
    });

    test('updateGridEscapeBest only increases (max-wins)', () {
      notifier.updateGridEscapeBest(500);
      expect(notifier.state.highScores.gridEscapeBestScore, 500);
      notifier.updateGridEscapeBest(300); // lower — ignored
      expect(notifier.state.highScores.gridEscapeBestScore, 500);
      notifier.updateGridEscapeBest(750); // higher — applied
      expect(notifier.state.highScores.gridEscapeBestScore, 750);
    });

    test('incrementBattleArenaWins accumulates and persists to storage', () async {
      notifier.incrementBattleArenaWins();
      notifier.incrementBattleArenaWins();
      expect(notifier.state.highScores.battleArenaWins, 2);

      // Verify it was persisted and reloads from storage.
      final reloaded = GameStateNotifier();
      await reloaded.loadFromStorage();
      expect(reloaded.state.highScores.battleArenaWins, 2);
    });

    test('updateBattleArenaBest and updateRaceModeBest max-win', () {
      notifier.updateBattleArenaBest(40);
      expect(notifier.state.highScores.battleArenaBestScore, 40);
      notifier.updateBattleArenaBest(40); // equal — not strictly greater
      expect(notifier.state.highScores.battleArenaBestScore, 40);
      notifier.updateRaceModeBest(150);
      expect(notifier.state.highScores.raceModeBest, 150);
    });
  });
}
