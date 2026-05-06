import 'package:flutter_test/flutter_test.dart';
import 'package:algoplay/features/battle_arena/data/question_bank.dart';

void main() {
  group('QuestionBank', () {
    test('generate() returns correct count', () {
      final questions = QuestionBank.generate(count: 5, seed: 42);
      expect(questions.length, 5);

      final questions10 = QuestionBank.generate(count: 10, seed: 42);
      expect(questions10.length, 10);

      // Clamped to pool size (36)
      final questions50 = QuestionBank.generate(count: 50, seed: 42);
      expect(questions50.length, 36);
    });

    test('each question has all required fields', () {
      final questions = QuestionBank.generate(count: 10, seed: 1);
      for (final q in questions) {
        expect(q.question, isNotEmpty);
        expect(q.correctAnswer, isNotEmpty);
        expect(q.options, isNotEmpty);
        expect(q.hint, isNotEmpty);
        expect(q.timeLimitSeconds, greaterThan(0));
        expect(q.category, isNotEmpty);
      }
    });

    test('correctAnswer is always in the options list', () {
      final questions = QuestionBank.generate(count: 36, seed: 99);
      for (final q in questions) {
        expect(
          q.options,
          contains(q.correctAnswer),
          reason: 'correctAnswer "${q.correctAnswer}" not in options for: "${q.question}"',
        );
      }
    });

    test('questions cover multiple categories', () {
      final questions = QuestionBank.generate(count: 36, seed: 42);
      final categories = questions.map((q) => q.category).toSet();
      expect(categories.length, greaterThanOrEqualTo(3),
          reason: 'Expected questions from at least 3 different categories');
    });

    test('no duplicate questions', () {
      final questions = QuestionBank.generate(count: 20, seed: 7);
      final questionTexts = questions.map((q) => q.question).toList();
      expect(questionTexts.toSet().length, questionTexts.length,
          reason: 'Duplicate questions found');
    });

    test('seed produces deterministic results', () {
      final run1 = QuestionBank.generate(count: 10, seed: 123);
      final run2 = QuestionBank.generate(count: 10, seed: 123);
      for (int i = 0; i < run1.length; i++) {
        expect(run1[i].question, run2[i].question);
        expect(run1[i].options, run2[i].options);
      }
    });

    test('different seeds produce different orderings', () {
      final run1 = QuestionBank.generate(count: 10, seed: 1);
      final run2 = QuestionBank.generate(count: 10, seed: 999);
      // At least one question should differ in position
      bool anyDifferent = false;
      for (int i = 0; i < run1.length; i++) {
        if (run1[i].question != run2[i].question) {
          anyDifferent = true;
          break;
        }
      }
      expect(anyDifferent, isTrue, reason: 'Different seeds produced identical ordering');
    });

    test('options have at least 2 choices per question', () {
      final questions = QuestionBank.generate(count: 10, seed: 42);
      for (final q in questions) {
        expect(q.options.length, greaterThanOrEqualTo(2),
            reason: 'Question has fewer than 2 options: "${q.question}"');
      }
    });
  });
}
