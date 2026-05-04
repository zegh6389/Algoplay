import 'package:flutter_test/flutter_test.dart';
import 'package:algoplay/shared/models/user_progress.dart';

void main() {
  // ---------------------------------------------------------------------------
  // Sub-models
  // ---------------------------------------------------------------------------

  group('SkillNode', () {
    test('default constructor values', () {
      const node = SkillNode(id: 'a', category: 'sorting', name: 'Bubble Sort');
      expect(node.id, 'a');
      expect(node.category, 'sorting');
      expect(node.name, 'Bubble Sort');
      expect(node.isUnlocked, false);
      expect(node.isCompleted, false);
      expect(node.xpEarned, 0);
    });

    test('copyWith overrides specified fields', () {
      const node = SkillNode(id: 'a', category: 'sorting', name: 'Bubble Sort');
      final copy = node.copyWith(isUnlocked: true, xpEarned: 50);
      expect(copy.isUnlocked, true);
      expect(copy.xpEarned, 50);
      expect(copy.id, 'a'); // unchanged
    });

    test('toJson/fromJson roundtrip', () {
      const node = SkillNode(
        id: 'a',
        category: 'sorting',
        name: 'Bubble Sort',
        isUnlocked: true,
        isCompleted: false,
        xpEarned: 42,
      );
      final json = node.toJson();
      final restored = SkillNode.fromJson(json);
      expect(restored, node);
    });
  });

  group('QuizScore', () {
    test('toJson/fromJson roundtrip', () {
      const score = QuizScore(
        algorithmId: 'bubble-sort',
        score: 8,
        correctAnswers: 8,
        totalQuestions: 10,
        timestamp: '2026-01-01',
      );
      final restored = QuizScore.fromJson(score.toJson());
      expect(restored, score);
    });
  });

  group('ChallengeCompletion', () {
    test('toJson/fromJson roundtrip', () {
      const cc = ChallengeCompletion(
        challengeId: 'c1',
        algorithmUsed: 'dfs',
        nodesVisited: ['a', 'b', 'c'],
        pathLength: 3,
        passed: true,
        timestamp: '2026-01-01',
      );
      final restored = ChallengeCompletion.fromJson(cc.toJson());
      expect(restored, cc);
    });
  });

  group('AlgorithmMastery', () {
    test('toJson/fromJson roundtrip', () {
      const mastery = AlgorithmMastery(
        algorithmId: 'merge-sort',
        quizScores: [80.0, 90.0],
        masteryLevel: 51.0,
        challengesCompleted: 2,
        totalChallenges: 5,
      );
      final restored = AlgorithmMastery.fromJson(mastery.toJson());
      expect(restored, mastery);
    });
  });

  // ---------------------------------------------------------------------------
  // UserProgress
  // ---------------------------------------------------------------------------

  group('UserProgress', () {
    test('default constructor values', () {
      const progress = UserProgress();
      expect(progress.level, 1);
      expect(progress.totalXP, 0);
      expect(progress.currentStreak, 0);
      expect(progress.lastPlayedDate, isNull);
      expect(progress.completedAlgorithms, isEmpty);
      expect(progress.unlockedCategories, isEmpty);
      expect(progress.skillNodes, isEmpty);
      expect(progress.quizHistory, isEmpty);
      expect(progress.challengeHistory, isEmpty);
      expect(progress.algorithmMastery, isEmpty);
    });

    test('copyWith overrides specified fields only', () {
      const progress = UserProgress();
      final updated = progress.copyWith(
        totalXP: 250,
        currentStreak: 3,
        lastPlayedDate: '2026-05-04',
      );
      expect(updated.totalXP, 250);
      expect(updated.currentStreak, 3);
      expect(updated.lastPlayedDate, '2026-05-04');
      expect(updated.level, 1); // unchanged
      expect(updated.completedAlgorithms, isEmpty); // unchanged
    });

    test('toJson/fromJson roundtrip with all fields', () {
      final progress = UserProgress(
        level: 5,
        totalXP: 450,
        currentStreak: 7,
        lastPlayedDate: '2026-05-04',
        completedAlgorithms: ['bubble-sort', 'merge-sort'],
        unlockedCategories: ['sorting'],
        skillNodes: const [
          SkillNode(id: 'n1', category: 'sorting', name: 'Bubble Sort', isUnlocked: true, xpEarned: 100),
        ],
        quizHistory: const [
          QuizScore(
            algorithmId: 'bubble-sort',
            score: 9,
            correctAnswers: 9,
            totalQuestions: 10,
            timestamp: '2026-05-04',
          ),
        ],
        challengeHistory: const [
          ChallengeCompletion(
            challengeId: 'c1',
            algorithmUsed: 'dfs',
            nodesVisited: ['a', 'b'],
            pathLength: 2,
            passed: true,
            timestamp: '2026-05-04',
          ),
        ],
        algorithmMastery: {
          'bubble-sort': const AlgorithmMastery(
            algorithmId: 'bubble-sort',
            quizScores: [90.0],
            masteryLevel: 54.0,
            challengesCompleted: 1,
            totalChallenges: 3,
          ),
        },
      );

      final json = progress.toJson();
      final restored = UserProgress.fromJson(json);

      expect(restored.level, progress.level);
      expect(restored.totalXP, progress.totalXP);
      expect(restored.currentStreak, progress.currentStreak);
      expect(restored.lastPlayedDate, progress.lastPlayedDate);
      expect(restored.completedAlgorithms, progress.completedAlgorithms);
      expect(restored.unlockedCategories, progress.unlockedCategories);
      expect(restored.skillNodes, progress.skillNodes);
      expect(restored.quizHistory, progress.quizHistory);
      expect(restored.challengeHistory, progress.challengeHistory);
      expect(restored.algorithmMastery, progress.algorithmMastery);
    });

    test('fromJson handles missing keys with defaults', () {
      final restored = UserProgress.fromJson({});
      expect(restored.level, 1);
      expect(restored.totalXP, 0);
      expect(restored.currentStreak, 0);
      expect(restored.lastPlayedDate, isNull);
      expect(restored.completedAlgorithms, isEmpty);
      expect(restored.unlockedCategories, isEmpty);
    });

    // --- addXP / level-up calculation tests ---
    // The level formula in UserProgressNotifier is: level = (totalXP ~/ 100) + 1
    // We test that logic here on the model level for the copyWith path.

    test('addXP calculation: no level up under 100 XP', () {
      const progress = UserProgress();
      const addedXP = 50;
      final newXP = progress.totalXP + addedXP;
      final newLevel = (newXP ~/ 100) + 1;
      final updated = progress.copyWith(totalXP: newXP, level: newLevel);
      expect(updated.totalXP, 50);
      expect(updated.level, 1);
    });

    test('addXP calculation: level up at exactly 100 XP', () {
      const progress = UserProgress();
      const addedXP = 100;
      final newXP = progress.totalXP + addedXP;
      final newLevel = (newXP ~/ 100) + 1;
      final updated = progress.copyWith(totalXP: newXP, level: newLevel);
      expect(updated.totalXP, 100);
      expect(updated.level, 2);
    });

    test('addXP calculation: multiple level ups with large XP gain', () {
      const progress = UserProgress();
      const addedXP = 350;
      final newXP = progress.totalXP + addedXP;
      final newLevel = (newXP ~/ 100) + 1;
      final updated = progress.copyWith(totalXP: newXP, level: newLevel);
      expect(updated.totalXP, 350);
      expect(updated.level, 4); // 350 ~/ 100 = 3, + 1 = 4
    });

    test('addXP calculation: XP threshold at boundary 99 stays level 1', () {
      const progress = UserProgress();
      const addedXP = 99;
      final newXP = progress.totalXP + addedXP;
      final newLevel = (newXP ~/ 100) + 1;
      final updated = progress.copyWith(totalXP: newXP, level: newLevel);
      expect(updated.totalXP, 99);
      expect(updated.level, 1);
    });

    test('addXP calculation: accumulated XP across multiple additions', () {
      var progress = const UserProgress();
      // Add 80 XP → level 1
      var newXP = progress.totalXP + 80;
      var newLevel = (newXP ~/ 100) + 1;
      progress = progress.copyWith(totalXP: newXP, level: newLevel);
      expect(progress.totalXP, 80);
      expect(progress.level, 1);

      // Add another 30 XP → total 110, level 2
      newXP = progress.totalXP + 30;
      newLevel = (newXP ~/ 100) + 1;
      progress = progress.copyWith(totalXP: newXP, level: newLevel);
      expect(progress.totalXP, 110);
      expect(progress.level, 2);
    });

    test('equality works correctly', () {
      const a = UserProgress(level: 3, totalXP: 200);
      const b = UserProgress(level: 3, totalXP: 200);
      expect(a, b);
      expect(a.hashCode, b.hashCode);
    });

    test('inequality detected', () {
      const a = UserProgress(level: 3, totalXP: 200);
      const b = UserProgress(level: 3, totalXP: 201);
      expect(a, isNot(equals(b)));
    });
  });
}
