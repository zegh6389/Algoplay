import 'package:flutter_test/flutter_test.dart';
import 'package:algoplay/features/learn/data/lesson_content.dart';

void main() {
  group('lessons list', () {
    test('all 12 lessons exist', () {
      expect(lessons.length, 12);
      for (var i = 1; i <= 12; i++) {
        expect(
          lessons.any((l) => l.id == i),
          isTrue,
          reason: 'Lesson $i should exist',
        );
      }
    });

    test('lesson IDs are sequential 1–12', () {
      for (var i = 0; i < 12; i++) {
        expect(lessons[i].id, i + 1);
      }
    });

    test('lesson titles are non-empty', () {
      for (final lesson in lessons) {
        expect(
          lesson.title,
          isNotEmpty,
          reason: 'Lesson ${lesson.id} should have a title',
        );
      }
    });
  });

  group('Lesson 1 content', () {
    late LessonContent lesson1;

    setUp(() {
      lesson1 = lessons.firstWhere((l) => l.id == 1);
    });

    test('has 5 modules', () {
      expect(lesson1.modules.length, 5);
    });

    test('modules have titles', () {
      for (final module in lesson1.modules) {
        expect(
          module.title,
          isNotEmpty,
          reason: 'Module ${module.id} should have a title',
        );
      }
    });

    test('content blocks are non-empty', () {
      for (final module in lesson1.modules) {
        expect(
          module.contentBlocks,
          isNotEmpty,
          reason: 'Module ${module.id} should have content blocks',
        );
      }
    });

    test('module IDs are unique across all lessons', () {
      final allModuleIds = <String>[];
      for (final lesson in lessons) {
        for (final module in lesson.modules) {
          allModuleIds.add(module.id);
        }
      }
      expect(
        allModuleIds.toSet().length,
        allModuleIds.length,
        reason: 'All module IDs must be unique',
      );
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
      expect(
        blocks.whereType<DefinitionBlock>().length,
        greaterThanOrEqualTo(7),
      );
      expect(blocks.whereType<MathBlock>().length, greaterThanOrEqualTo(7));
      expect(blocks.any((b) => b is QuizBlock), isTrue);
      expect(blocks.last, isA<KeyTakeawayBlock>());

      final combined = blocks
          .map((block) {
            return switch (block) {
              TextBlock(:final text) => text,
              DefinitionBlock(:final term, :final definition) =>
                '$term $definition',
              KeyTakeawayBlock(:final text) => text,
              QuizBlock(:final question, :final options, :final explanation) =>
                '$question ${options.join(' ')} $explanation',
              CodeBlock(:final code, :final language) => '$language $code',
              MathBlock(:final tex, :final semanticsLabel) =>
                '$semanticsLabel $tex',
              GraphBlock(:final type) => type,
            };
          })
          .join(' ');

      expect(combined, contains('Levitin'));
      expect(combined, contains(r'\log_b x'));
      expect(combined, contains('strictly increasing'));
      expect(combined, contains(r'\log_b(b^a) = a'));
      expect(combined, contains(r'\log_b(xy) = \log_b x + \log_b y'));
      expect(combined, contains(r'\log_b(x^a) = a\log_b x'));
      expect(combined, contains(r'\log_c x = \frac{\log_b x}{\log_b c}'));
      expect(combined, isNot(contains(r'\log_b 2')));
      expect(combined, contains('change of base'));
      expect(combined, contains('lg'));
      expect(combined, contains('base 2'));
    });

    test('Module 4 has the six-step problem-solving recipe', () {
      final module = lesson1.modules[3];
      expect(module.id, 'lesson1_module4');
      expect(module.title, 'The 6-Step Recipe to Solve Any Problem');
      expect(module.order, 3);
      expect(module.algorithmId, isNull);

      final blocks = module.contentBlocks;
      expect(blocks.whereType<DefinitionBlock>().length, 6);
      expect(blocks.any((b) => b is QuizBlock), isTrue);
      expect(blocks.last, isA<KeyTakeawayBlock>());

      final combined = blocks
          .map((block) {
            return switch (block) {
              TextBlock(:final text) => text,
              DefinitionBlock(:final term, :final definition) =>
                '$term $definition',
              KeyTakeawayBlock(:final text) => text,
              QuizBlock(:final question, :final options, :final explanation) =>
                '$question ${options.join(' ')} $explanation',
              CodeBlock(:final code, :final language) => '$language $code',
              MathBlock(:final tex, :final semanticsLabel) =>
                '$semanticsLabel $tex',
              GraphBlock(:final type) => type,
            };
          })
          .join(' ');

      expect(combined, contains('Understand the Problem'));
      expect(combined, contains('Pick the Right Techniques'));
      expect(combined, contains('Design the Algorithm'));
      expect(combined, contains('Prove It Works'));
      expect(combined, contains('Analyze the Algorithm'));
      expect(combined, contains('Code the Algorithm'));
      expect(combined, contains('Feedback loops'));
      expect(combined, contains('keyboard'));
    });

    test('Module 5 has the five criteria for judging algorithms', () {
      final module = lesson1.modules[4];
      expect(module.id, 'lesson1_module5');
      expect(module.title, 'What Makes a Good Algorithm?');
      expect(module.order, 4);
      expect(module.algorithmId, isNull);

      final blocks = module.contentBlocks;
      expect(
        blocks.whereType<DefinitionBlock>().length,
        greaterThanOrEqualTo(5),
      );
      expect(blocks.any((b) => b is QuizBlock), isTrue);
      expect(blocks.last, isA<KeyTakeawayBlock>());

      final combined = blocks
          .map((block) {
            return switch (block) {
              TextBlock(:final text) => text,
              DefinitionBlock(:final term, :final definition) =>
                '$term $definition',
              KeyTakeawayBlock(:final text) => text,
              QuizBlock(:final question, :final options, :final explanation) =>
                '$question ${options.join(' ')} $explanation',
              CodeBlock(:final code, :final language) => '$language $code',
              MathBlock(:final tex, :final semanticsLabel) =>
                '$semanticsLabel $tex',
              GraphBlock(:final type) => type,
            };
          })
          .join(' ');

      expect(combined, contains('Correctness'));
      expect(combined, contains('Preconditions'));
      expect(combined, contains('Postconditions'));
      expect(combined, contains('Efficiency'));
      expect(combined, contains('Space Usage'));
      expect(combined, contains('Simplicity'));
      expect(combined, contains('Optimality'));
      expect(combined, contains('lower bound'));
      expect(combined, contains('Big-O'));
      expect(combined, contains('Correctness always comes first'));
    });

    test('Module 1 contains mixed content block types', () {
      final blocks = lesson1.modules[0].contentBlocks;
      expect(blocks.whereType<TextBlock>(), isNotEmpty);
      expect(blocks.whereType<DefinitionBlock>(), isNotEmpty);
      expect(blocks.whereType<KeyTakeawayBlock>(), isNotEmpty);
    });

    List<String> lesson1Prose() {
      final prose = <String>[];
      for (final module in lesson1.modules) {
        for (final block in module.contentBlocks) {
          switch (block) {
            case TextBlock(:final text):
              prose.add(text);
            case DefinitionBlock(:final term, :final definition):
              prose.add(term);
              prose.add(definition);
            case KeyTakeawayBlock(:final text):
              prose.add(text);
            case QuizBlock(:final question, :final options, :final explanation):
              prose.add(question);
              prose.addAll(options);
              prose.add(explanation);
            case CodeBlock():
            case MathBlock():
            case GraphBlock():
              break;
          }
        }
      }
      return prose;
    }

    test('Lesson 1 prose avoids AI punctuation tells', () {
      final combined = lesson1Prose().join('\n');
      expect(combined, isNot(contains('—')));
      expect(combined, isNot(contains(';')));
      expect(combined, isNot(contains(' - ')));
    });

    test('Lesson 1 keeps a learning-first tone with limited humor', () {
      final combined = lesson1Prose().join(' ').toLowerCase();
      const overusedJokeWords = [
        'goblin',
        'monster',
        'wizard',
        'mustache',
        'cannon',
        'rocket launcher',
        'printer toner',
        'screensaver',
        'thunder',
        'confetti',
        'ceremonial hat',
      ];

      for (final word in overusedJokeWords) {
        expect(
          combined,
          isNot(contains(word)),
          reason: 'Lesson 1 should not joke after nearly every point.',
        );
      }
      expect(combined, contains('algorithm'));
      expect(combined, contains('correctness'));
      expect(combined, contains('efficiency'));
    });

    test('Module 2 contains definition blocks for five properties', () {
      final defs = lesson1.modules[1].contentBlocks
          .whereType<DefinitionBlock>()
          .toList();
      // Should have the formal definition + 5 properties = 6 definition blocks
      expect(defs.length, 6);
    });
  });

  group('Lesson 2 content', () {
    late LessonContent lesson2;

    setUp(() {
      lesson2 = lessons.firstWhere((l) => l.id == 2);
    });

    test('has 6 modules', () {
      expect(lesson2.modules.length, 6);
    });

    test('Module 1 introduces input size and basic operation counting', () {
      final module = lesson2.modules[0];
      expect(module.id, 'lesson2_module1');
      expect(module.title, 'Counting Steps Without a Stopwatch');
      expect(module.order, 0);
      expect(module.algorithmId, isNull);

      final blocks = module.contentBlocks;
      expect(
        blocks.whereType<DefinitionBlock>().length,
        greaterThanOrEqualTo(3),
      );
      expect(blocks.whereType<MathBlock>().length, greaterThanOrEqualTo(2));
      expect(blocks.any((b) => b is QuizBlock), isTrue);
      expect(blocks.last, isA<KeyTakeawayBlock>());

      final combined = blocks
          .map((block) {
            return switch (block) {
              TextBlock(:final text) => text,
              DefinitionBlock(:final term, :final definition) =>
                '$term $definition',
              KeyTakeawayBlock(:final text) => text,
              QuizBlock(:final question, :final options, :final explanation) =>
                '$question ${options.join(' ')} $explanation',
              CodeBlock(:final code, :final language) => '$language $code',
              MathBlock(:final tex, :final semanticsLabel) =>
                '$semanticsLabel $tex',
              GraphBlock(:final type) => type,
            };
          })
          .join(' ');

      expect(combined, contains('input size'));
      expect(combined, contains('basic operation'));
      expect(combined, contains('Running time'));
      expect(combined, contains(r'T(n)'));
      expect(combined, contains(r'2n + 3'));
    });

    test('Module 2 covers best worst and average cases', () {
      final module = lesson2.modules[1];
      expect(module.id, 'lesson2_module2');
      expect(module.title, 'Best, Worst, and Average Case Mischief');
      expect(module.order, 1);
      expect(module.algorithmId, 'linear-search');

      final blocks = module.contentBlocks;
      expect(
        blocks.whereType<DefinitionBlock>().length,
        greaterThanOrEqualTo(3),
      );
      expect(blocks.whereType<MathBlock>().length, greaterThanOrEqualTo(2));
      expect(blocks.any((b) => b is CodeBlock), isTrue);
      expect(blocks.any((b) => b is QuizBlock), isTrue);
      expect(blocks.last, isA<KeyTakeawayBlock>());

      final combined = blocks
          .map((block) {
            return switch (block) {
              TextBlock(:final text) => text,
              DefinitionBlock(:final term, :final definition) =>
                '$term $definition',
              KeyTakeawayBlock(:final text) => text,
              QuizBlock(:final question, :final options, :final explanation) =>
                '$question ${options.join(' ')} $explanation',
              CodeBlock(:final code, :final language) => '$language $code',
              MathBlock(:final tex, :final semanticsLabel) =>
                '$semanticsLabel $tex',
              GraphBlock(:final type) => type,
            };
          })
          .join(' ');

      expect(combined, contains('Best case'));
      expect(combined, contains('Worst case'));
      expect(combined, contains('Average case'));
      expect(combined, contains('linear search'));
      expect(combined, contains(r'\frac{n + 1}{2}'));
    });

    test('Module 3 covers asymptotic bounds', () {
      final module = lesson2.modules[2];
      expect(module.id, 'lesson2_module3');
      expect(module.title, 'The Formal Framework for Growth');
      expect(module.order, 2);
      expect(module.contentBlocks.whereType<GraphBlock>().length, 3);
      expect(module.contentBlocks.any((b) => b is QuizBlock), isTrue);
      expect(module.contentBlocks.last, isA<KeyTakeawayBlock>());
    });

    test('Module 4 works through cubic disjoint set analysis', () {
      final module = lesson2.modules[3];
      expect(module.id, 'lesson2_module4');
      expect(module.title, 'Worked Example of Time Analysis');
      expect(module.order, 3);
      expect(module.algorithmId, isNull);

      final blocks = module.contentBlocks;
      expect(
        blocks.whereType<DefinitionBlock>().length,
        greaterThanOrEqualTo(2),
      );
      expect(blocks.whereType<MathBlock>().length, greaterThanOrEqualTo(2));
      expect(blocks.any((b) => b is CodeBlock), isTrue);
      expect(blocks.any((b) => b is QuizBlock), isTrue);
      expect(blocks.last, isA<KeyTakeawayBlock>());

      final combined = blocks
          .map((block) {
            return switch (block) {
              TextBlock(:final text) => text,
              DefinitionBlock(:final term, :final definition) =>
                '$term $definition',
              KeyTakeawayBlock(:final text) => text,
              QuizBlock(:final question, :final options, :final explanation) =>
                '$question ${options.join(' ')} $explanation',
              CodeBlock(:final code, :final language) => '$language $code',
              MathBlock(:final tex, :final semanticsLabel) =>
                '$semanticsLabel $tex',
              GraphBlock(:final type) => type,
            };
          })
          .join(' ');

      expect(combined, contains('disjoint'));
      expect(combined, contains('Sᵢ'));
      expect(combined, contains('Sⱼ'));
      expect(combined, contains('O(n³)'));
      expect(combined, contains(r'O(n) \cdot O(n) \cdot O(n) = O(n^3)'));
      expect(
        combined,
        contains('doubling n makes cubic work about 8 times larger'),
      );
    });

    test('Module 5 explains practical caveats beyond speed', () {
      final module = lesson2.modules[4];
      expect(module.id, 'lesson2_module5');
      expect(module.title, 'Caveats: Fast Is Not Always Best');
      expect(module.order, 4);
      expect(module.algorithmId, isNull);

      final blocks = module.contentBlocks;
      expect(
        blocks.whereType<DefinitionBlock>().length,
        greaterThanOrEqualTo(5),
      );
      expect(blocks.any((b) => b is QuizBlock), isTrue);
      expect(blocks.last, isA<KeyTakeawayBlock>());

      final combined = blocks
          .map((block) {
            return switch (block) {
              TextBlock(:final text) => text,
              DefinitionBlock(:final term, :final definition) =>
                '$term $definition',
              KeyTakeawayBlock(:final text) => text,
              QuizBlock(:final question, :final options, :final explanation) =>
                '$question ${options.join(' ')} $explanation',
              CodeBlock(:final code, :final language) => '$language $code',
              MathBlock(:final tex, :final semanticsLabel) =>
                '$semanticsLabel $tex',
              GraphBlock(:final type) => type,
            };
          })
          .join(' ');

      expect(combined, contains('Small inputs'));
      expect(combined, contains('Maintainability'));
      expect(combined, contains('memory'));
      expect(combined, contains('Accuracy'));
      expect(combined, contains('stability'));
      expect(combined, contains('O(n log n)'));
    });

    test('Module 6 concludes Lesson 2 and points to recurrence analysis', () {
      final module = lesson2.modules[5];
      expect(module.id, 'lesson2_conclusion');
      expect(module.title, 'Lesson 2 Wrap-Up');
      expect(module.order, 5);
      expect(module.algorithmId, isNull);

      final blocks = module.contentBlocks;
      expect(
        blocks.whereType<DefinitionBlock>().length,
        greaterThanOrEqualTo(4),
      );
      expect(blocks.last, isA<KeyTakeawayBlock>());

      final combined = blocks
          .map((block) {
            return switch (block) {
              TextBlock(:final text) => text,
              DefinitionBlock(:final term, :final definition) =>
                '$term $definition',
              KeyTakeawayBlock(:final text) => text,
              QuizBlock(:final question, :final options, :final explanation) =>
                '$question ${options.join(' ')} $explanation',
              CodeBlock(:final code, :final language) => '$language $code',
              MathBlock(:final tex, :final semanticsLabel) =>
                '$semanticsLabel $tex',
              GraphBlock(:final type) => type,
            };
          })
          .join(' ');

      expect(combined, contains('Big-O'));
      expect(combined, contains('Big-Omega'));
      expect(combined, contains('Big-Theta'));
      expect(combined, contains('nonrecursive'));
      expect(combined, contains('recursive'));
      expect(combined, contains('Lesson 3'));
    });

    List<String> lesson2Prose() {
      final prose = <String>[];
      for (final module in lesson2.modules) {
        for (final block in module.contentBlocks) {
          switch (block) {
            case TextBlock(:final text):
              prose.add(text);
            case DefinitionBlock(:final term, :final definition):
              prose.add(term);
              prose.add(definition);
            case KeyTakeawayBlock(:final text):
              prose.add(text);
            case QuizBlock(:final question, :final options, :final explanation):
              prose.add(question);
              prose.addAll(options);
              prose.add(explanation);
            case CodeBlock():
            case MathBlock():
            case GraphBlock():
              break;
          }
        }
      }
      return prose;
    }

    test('Lesson 2 prose avoids AI punctuation tells', () {
      final combined = lesson2Prose().join('\n');
      expect(combined, isNot(contains('—')));
      expect(combined, isNot(contains(';')));
      expect(combined, isNot(contains(' - ')));
    });

    test('Lesson 2 prose uses readable math notation', () {
      final combined = lesson2Prose().join('\n');
      expect(combined, isNot(contains('n squared')));
      expect(combined, isNot(contains('n cubed')));
      expect(combined, isNot(contains('2 to the n')));
      expect(combined, isNot(contains('n0')));
      expect(combined, isNot(contains('<=')));
      expect(combined, isNot(contains('>=')));
      expect(combined, isNot(contains('c * g')));

      expect(combined, contains('n²'));
      expect(combined, contains('≤'));
      expect(combined, contains('≥'));
      expect(combined, contains('n₀'));
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

    test('MathBlock holds TeX and accessibility label', () {
      const block = MathBlock(
        r'\log_c x = \frac{\log_b x}{\log_b c}',
        semanticsLabel: 'change of base formula',
      );
      expect(block.tex, r'\log_c x = \frac{\log_b x}{\log_b c}');
      expect(block.semanticsLabel, 'change of base formula');
    });
  });
}
