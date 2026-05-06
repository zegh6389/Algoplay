import 'dart:math';
import 'package:flutter_test/flutter_test.dart';
import 'package:algoplay/features/battle_arena/data/question_bank.dart';

void main() {
  group('BattleQuestion', () {
    test('creates with all required fields', () {
      final q = BattleQuestion(
        question: 'What is O(n)?',
        correctAnswer: 'Linear',
        options: ['Linear', 'Logarithmic', 'Quadratic', 'Constant'],
        hint: 'Grows proportionally with input.',
        timeLimitSeconds: 15,
        category: 'complexity',
      );
      expect(q.question, 'What is O(n)?');
      expect(q.correctAnswer, 'Linear');
      expect(q.options.length, 4);
      expect(q.hint, isNotEmpty);
      expect(q.timeLimitSeconds, 15);
      expect(q.category, 'complexity');
    });
  });

  group('QuestionBank', () {
    test('generate() returns correct number of questions', () {
      final questions = QuestionBank.generate(count: 5, seed: 42);
      expect(questions.length, 5);
    });

    test('generate() returns 10 questions by default', () {
      final questions = QuestionBank.generate(seed: 42);
      expect(questions.length, 10);
    });

    test('each question has non-empty text, correct answer, 4 options, hint', () {
      final questions = QuestionBank.generate(count: 10, seed: 42);
      for (final q in questions) {
        expect(q.question, isNotEmpty);
        expect(q.correctAnswer, isNotEmpty);
        expect(q.options.length, 4);
        expect(q.hint, isNotEmpty);
        expect(q.timeLimitSeconds, greaterThan(0));
      }
    });

    test('correct answer is always in options', () {
      final questions = QuestionBank.generate(count: 15, seed: 42);
      for (final q in questions) {
        expect(q.options, contains(q.correctAnswer));
      }
    });

    test('questions cover multiple categories', () {
      final questions = QuestionBank.generate(count: 20, seed: 42);
      final categories = questions.map((q) => q.category).toSet();
      expect(categories.length, greaterThanOrEqualTo(3));
    });

    test('no duplicate questions in a set', () {
      final questions = QuestionBank.generate(count: 15, seed: 42);
      final texts = questions.map((q) => q.question).toList();
      expect(texts.toSet().length, texts.length);
    });

    test('options are shuffled (correct answer not always first)', () {
      // Generate many sets and check that correct answer is not always at index 0
      int firstPositionCount = 0;
      for (int seed = 0; seed < 20; seed++) {
        final questions = QuestionBank.generate(count: 10, seed: seed);
        for (final q in questions) {
          if (q.options.first == q.correctAnswer) {
            firstPositionCount++;
          }
        }
      }
      // With 200 total questions, if correct is always first, firstPositionCount == 200.
      // With random shuffling, it should be ~50 (25% chance).
      // We allow up to 150 to avoid flaky test but prove shuffling.
      expect(firstPositionCount, lessThan(150));
    });

    test('seed produces deterministic results', () {
      final set1 = QuestionBank.generate(count: 5, seed: 123);
      final set2 = QuestionBank.generate(count: 5, seed: 123);
      for (int i = 0; i < 5; i++) {
        expect(set1[i].question, set2[i].question);
        expect(set1[i].correctAnswer, set2[i].correctAnswer);
        expect(set1[i].options, set2[i].options);
      }
    });

    test('different seeds produce different orderings', () {
      final set1 = QuestionBank.generate(count: 5, seed: 1);
      final set2 = QuestionBank.generate(count: 5, seed: 999);
      // At least one question should differ (or order should differ)
      bool anyDifference = false;
      for (int i = 0; i < 5; i++) {
        if (set1[i].question != set2[i].question ||
            set1[i].options.join(',') != set2[i].options.join(',')) {
          anyDifference = true;
          break;
        }
      }
      expect(anyDifference, isTrue);
    });
  });
}
