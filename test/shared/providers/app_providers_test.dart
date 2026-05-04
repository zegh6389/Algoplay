import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:algoplay/shared/providers/app_providers.dart';
import 'package:algoplay/shared/models/user_progress.dart';

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
}
