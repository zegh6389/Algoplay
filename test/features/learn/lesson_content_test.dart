import 'package:flutter_test/flutter_test.dart';
import 'package:algoplay/features/learn/data/lesson_content.dart';

void main() {
  group('lessons list', () {
    test('all 12 lessons exist', () {
      expect(lessons.length, 12);
      for (var i = 1; i <= 12; i++) {
        expect(lessons.any((l) => l.id == i), isTrue,
            reason: 'Lesson $i should exist');
      }
    });

    test('lesson IDs are sequential 1–12', () {
      for (var i = 0; i < 12; i++) {
        expect(lessons[i].id, i + 1);
      }
    });

    test('lesson titles are non-empty', () {
      for (final lesson in lessons) {
        expect(lesson.title, isNotEmpty,
            reason: 'Lesson ${lesson.id} should have a title');
      }
    });
  });

  group('Lesson 1 content', () {
    late LessonContent lesson1;

    setUp(() {
      lesson1 = lessons.firstWhere((l) => l.id == 1);
    });

    test('has 3 modules', () {
      expect(lesson1.modules.length, 3);
    });

    test('modules have titles', () {
      for (final module in lesson1.modules) {
        expect(module.title, isNotEmpty,
            reason: 'Module ${module.id} should have a title');
      }
    });

    test('content blocks are non-empty', () {
      for (final module in lesson1.modules) {
        expect(module.contentBlocks, isNotEmpty,
            reason: 'Module ${module.id} should have content blocks');
      }
    });

    test('module IDs are unique across all lessons', () {
      final allModuleIds = <String>[];
      for (final lesson in lessons) {
        for (final module in lesson.modules) {
          allModuleIds.add(module.id);
        }
      }
      expect(allModuleIds.toSet().length, allModuleIds.length,
          reason: 'All module IDs must be unique');
    });

    test('Module 1 has id "lesson1_module1" and correct title', () {
      expect(lesson1.modules[0].id, 'lesson1_module1');
      expect(lesson1.modules[0].title, "So… What's an Algorithm?");
      expect(lesson1.modules[0].order, 0);
      expect(lesson1.modules[0].algorithmId, isNull);
    });

    test('Module 2 has id "lesson1_module2" and correct title', () {
      expect(lesson1.modules[1].id, 'lesson1_module2');
      expect(lesson1.modules[1].title, 'Formally Speaking…');
      expect(lesson1.modules[1].order, 1);
      expect(lesson1.modules[1].algorithmId, isNull);
    });

    test('Module 3 has logarithm foundations for algorithm analysis', () {
      final module = lesson1.modules[2];
      expect(module.id, 'lesson1_module3');
      expect(module.title, 'Logarithms: The Shrinking Spell');
      expect(module.order, 2);
      expect(module.algorithmId, isNull);

      final blocks = module.contentBlocks;
      expect(blocks.whereType<TextBlock>().length, greaterThanOrEqualTo(4));
      expect(blocks.whereType<DefinitionBlock>().length, greaterThanOrEqualTo(7));
      expect(blocks.any((b) => b is QuizBlock), isTrue);
      expect(blocks.last, isA<KeyTakeawayBlock>());

      final combined = blocks.map((block) {
        return switch (block) {
          TextBlock(:final text) => text,
          DefinitionBlock(:final term, :final definition) => '$term $definition',
          KeyTakeawayBlock(:final text) => text,
          QuizBlock(:final question, :final options, :final explanation) =>
            '$question ${options.join(' ')} $explanation',
          CodeBlock(:final code, :final language) => '$language $code',
        };
      }).join(' ');

      expect(combined, contains('Levitin'));
      expect(combined, contains('log_b x'));
      expect(combined, contains('strictly increasing'));
      expect(combined, contains('log_b(b^a) = a'));
      expect(combined, contains('log_b(xy) = log_b x + log_b y'));
      expect(combined, contains('log_b(x^a) = a log_b x'));
      expect(combined, contains('change of base'));
      expect(combined, contains('lg'));
      expect(combined, contains('base 2'));
    });

    test('Module 1 contains mixed content block types', () {
      final blocks = lesson1.modules[0].contentBlocks;
      expect(blocks.any((b) => b is TextBlock), isTrue);
      expect(blocks.any((b) => b is DefinitionBlock), isTrue);
      expect(blocks.any((b) => b is KeyTakeawayBlock), isTrue);
    });

    test('Module 2 contains definition blocks for five properties', () {
      final defs = lesson1.modules[1].contentBlocks
          .whereType<DefinitionBlock>()
          .toList();
      // Should have the formal definition + 5 properties = 6 definition blocks
      expect(defs.length, 6);
    });
  });

  group('ContentBlock subclasses', () {
    test('TextBlock holds text', () {
      const block = TextBlock('hello');
      expect(block.text, 'hello');
    });

    test('CodeBlock holds code and language', () {
      const block = CodeBlock('print("hi")', language: 'python');
      expect(block.code, 'print("hi")');
      expect(block.language, 'python');
    });

    test('CodeBlock defaults to dart language', () {
      const block = CodeBlock('void main() {}');
      expect(block.language, 'dart');
    });

    test('DefinitionBlock holds term and definition', () {
      const block = DefinitionBlock(term: 'Foo', definition: 'Bar');
      expect(block.term, 'Foo');
      expect(block.definition, 'Bar');
    });

    test('KeyTakeawayBlock holds text', () {
      const block = KeyTakeawayBlock('remember this');
      expect(block.text, 'remember this');
    });

    test('QuizBlock holds question, options, correctIndex, explanation', () {
      const block = QuizBlock(
        question: 'What?',
        options: ['A', 'B', 'C'],
        correctIndex: 1,
        explanation: 'Because.',
      );
      expect(block.question, 'What?');
      expect(block.options.length, 3);
      expect(block.correctIndex, 1);
      expect(block.explanation, 'Because.');
    });
  });
}
