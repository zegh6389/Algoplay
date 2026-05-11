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
              VisualizerLinkBlock(
                :final algorithmId,
                :final label,
                :final description,
              ) =>
                '$algorithmId $label ${description ?? ''}',
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
              VisualizerLinkBlock(
                :final algorithmId,
                :final label,
                :final description,
              ) =>
                '$algorithmId $label ${description ?? ''}',
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
              VisualizerLinkBlock(
                :final algorithmId,
                :final label,
                :final description,
              ) =>
                '$algorithmId $label ${description ?? ''}',
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
            case VisualizerLinkBlock():
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

    test('has 7 modules', () {
      expect(lesson2.modules.length, 7);
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
              VisualizerLinkBlock(
                :final algorithmId,
                :final label,
                :final description,
              ) =>
                '$algorithmId $label ${description ?? ''}',
            };
          })
          .join(' ');

      expect(combined, contains('input size'));
      expect(combined, contains('basic operation'));
      expect(combined, contains('Running time'));
      expect(combined, contains(r'T(n)'));
      expect(combined, contains(r'2n + 3'));
    });

    test('Module 2 explains order of growth with Selection Sort timings', () {
      final module = lesson2.modules[1];
      expect(module.id, 'lesson2_module2');
      expect(module.title, 'Intuitive Explanation of Order of Growth');
      expect(module.order, 1);
      expect(module.algorithmId, 'selection-sort');

      final blocks = module.contentBlocks;
      expect(
        blocks.whereType<DefinitionBlock>().length,
        greaterThanOrEqualTo(2),
      );
      expect(blocks.whereType<MathBlock>().length, greaterThanOrEqualTo(2));
      expect(blocks.any((b) => b is CodeBlock), isTrue);
      expect(blocks.whereType<QuizBlock>().length, greaterThanOrEqualTo(2));
      expect(
        blocks.whereType<VisualizerLinkBlock>().any(
          (b) => b.algorithmId == 'selection-sort',
        ),
        isTrue,
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
              VisualizerLinkBlock(
                :final algorithmId,
                :final label,
                :final description,
              ) =>
                '$algorithmId $label ${description ?? ''}',
            };
          })
          .join(' ');

      expect(combined, contains('Order of growth'));
      expect(combined, contains('Selection Sort'));
      expect(combined, contains('quadratic'));
      expect(combined, contains('(2n)^2 = 4n^{2}'));
      expect(combined, contains('four times larger'));
      expect(combined, contains('Dominant term'));
    });

    test('Module 3 covers best worst and average cases', () {
      final module = lesson2.modules[2];
      expect(module.id, 'lesson2_module3');
      expect(module.title, 'Best, Worst, and Average Case Mischief');
      expect(module.order, 2);
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
              VisualizerLinkBlock(
                :final algorithmId,
                :final label,
                :final description,
              ) =>
                '$algorithmId $label ${description ?? ''}',
            };
          })
          .join(' ');

      expect(combined, contains('Best case'));
      expect(combined, contains('Worst case'));
      expect(combined, contains('Average case'));
      expect(combined, contains('linear search'));
      expect(combined, contains(r'\frac{n + 1}{2}'));
    });

    test('Module 4 covers asymptotic bounds', () {
      final module = lesson2.modules[3];
      expect(module.id, 'lesson2_module4');
      expect(module.title, 'The Formal Framework for Growth');
      expect(module.order, 3);
      expect(module.contentBlocks.whereType<GraphBlock>().length, 3);
      expect(module.contentBlocks.any((b) => b is QuizBlock), isTrue);
      expect(module.contentBlocks.last, isA<KeyTakeawayBlock>());
    });

    test('Module 5 works through cubic disjoint set analysis', () {
      final module = lesson2.modules[4];
      expect(module.id, 'lesson2_module5');
      expect(module.title, 'Worked Example of Time Analysis');
      expect(module.order, 4);
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
              VisualizerLinkBlock(
                :final algorithmId,
                :final label,
                :final description,
              ) =>
                '$algorithmId $label ${description ?? ''}',
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

    test('Module 6 explains practical caveats beyond speed', () {
      final module = lesson2.modules[5];
      expect(module.id, 'lesson2_module6');
      expect(module.title, 'Caveats: Fast Is Not Always Best');
      expect(module.order, 5);
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
              VisualizerLinkBlock(
                :final algorithmId,
                :final label,
                :final description,
              ) =>
                '$algorithmId $label ${description ?? ''}',
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

    test('Module 7 concludes Lesson 2 and points to recurrence analysis', () {
      final module = lesson2.modules[6];
      expect(module.id, 'lesson2_conclusion');
      expect(module.title, 'Lesson 2 Wrap-Up');
      expect(module.order, 6);
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
              VisualizerLinkBlock(
                :final algorithmId,
                :final label,
                :final description,
              ) =>
                '$algorithmId $label ${description ?? ''}',
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
            case VisualizerLinkBlock():
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

  group('Lesson 3 content', () {
    late LessonContent lesson3;

    setUp(() {
      lesson3 = lessons.firstWhere((l) => l.id == 3);
    });

    String combinedText(Iterable<ContentBlock> blocks) {
      return blocks
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
              VisualizerLinkBlock(
                :final algorithmId,
                :final label,
                :final description,
              ) =>
                '$algorithmId $label ${description ?? ''}',
            };
          })
          .join(' ');
    }

    List<String> lesson3Prose() {
      final prose = <String>[];
      for (final module in lesson3.modules) {
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
            case VisualizerLinkBlock():
              break;
          }
        }
      }
      return prose;
    }

    test('has 4 modules', () {
      expect(lesson3.modules.length, 4);
    });

    test(
      'Module 1 introduces recursive algorithms and recurrence relations',
      () {
        final module = lesson3.modules[0];
        expect(module.id, 'lesson3_module1');
        expect(module.title, 'Introduction to Recursive Algorithms');
        expect(module.order, 0);
        expect(module.algorithmId, isNull);

        final blocks = module.contentBlocks;
        expect(
          blocks.whereType<DefinitionBlock>().length,
          greaterThanOrEqualTo(3),
        );
        expect(blocks.whereType<MathBlock>().length, greaterThanOrEqualTo(2));
        expect(blocks.any((b) => b is CodeBlock), isTrue);
        expect(blocks.any((b) => b is QuizBlock), isTrue);
        expect(blocks.last, isA<KeyTakeawayBlock>());

        final combined = combinedText(blocks);
        expect(combined, contains('Base case'));
        expect(combined, contains('Recursive call'));
        expect(combined, contains('recurrence relation'));
        expect(combined, contains(r'F(n) = F(n - 1) + F(n - 2)'));
        expect(combined, contains('pending work'));
      },
    );

    test('Module 2 covers three recurrence solving methods', () {
      final module = lesson3.modules[1];
      expect(module.id, 'lesson3_module2');
      expect(module.title, 'Solving Recurrence Relations');
      expect(module.order, 1);
      expect(module.algorithmId, isNull);

      final blocks = module.contentBlocks;
      expect(
        blocks.whereType<DefinitionBlock>().length,
        greaterThanOrEqualTo(5),
      );
      expect(blocks.whereType<MathBlock>().length, greaterThanOrEqualTo(8));
      expect(blocks.any((b) => b is CodeBlock), isTrue);
      expect(blocks.any((b) => b is QuizBlock), isTrue);
      expect(blocks.last, isA<KeyTakeawayBlock>());

      final combined = combinedText(blocks);
      expect(combined, contains('Forward substitution'));
      expect(combined, contains('Backward substitution'));
      expect(combined, contains('Characteristic equation'));
      expect(combined, contains(r'f(n) = 1 + \frac{n(n + 1)}{2}'));
      expect(combined, contains(r'f(n) = 2^{n + 1} - 3'));
      expect(combined, contains(r'f(n) = \alpha 3^n + \beta (-1)^n'));
      expect(combined, contains('inhomogeneous'));
    });

    test('Module 3 teaches the Master Theorem cases and limits', () {
      final module = lesson3.modules[2];
      expect(module.id, 'lesson3_module3');
      expect(module.title, 'Master Theorem');
      expect(module.order, 2);
      expect(module.algorithmId, isNull);

      final blocks = module.contentBlocks;
      expect(
        blocks.whereType<DefinitionBlock>().length,
        greaterThanOrEqualTo(3),
      );
      expect(blocks.whereType<MathBlock>().length, greaterThanOrEqualTo(8));
      expect(blocks.any((b) => b is CodeBlock), isTrue);
      expect(blocks.any((b) => b is QuizBlock), isTrue);
      expect(blocks.last, isA<KeyTakeawayBlock>());

      final combined = combinedText(blocks);
      expect(combined, contains('Master Theorem'));
      expect(combined, contains(r'T(n) = aT(n / b) + f(n)'));
      expect(combined, contains(r'f(n) \in \Theta(n^d)'));
      expect(combined, contains('Case 1'));
      expect(combined, contains('Case 2'));
      expect(combined, contains('Case 3'));
      expect(combined, contains('divide-and-conquer'));
      expect(combined, contains('recursive sequential search'));
      expect(combined, contains(r'T(n) = T(n - 1) + 1'));
      expect(combined, contains('Θ(n log n)'));
    });

    test('Module 4 concludes Lesson 3 and points to brute force', () {
      final module = lesson3.modules[3];
      expect(module.id, 'lesson3_module4');
      expect(module.title, 'Lesson 3 Conclusion');
      expect(module.order, 3);
      expect(module.algorithmId, isNull);

      final blocks = module.contentBlocks;
      expect(
        blocks.whereType<DefinitionBlock>().length,
        greaterThanOrEqualTo(1),
      );
      expect(blocks.any((b) => b is QuizBlock), isTrue);
      expect(blocks.last, isA<KeyTakeawayBlock>());

      final combined = combinedText(blocks);
      expect(combined, contains('recurrence relation'));
      expect(combined, contains('forward substitution'));
      expect(combined, contains('backward substitution'));
      expect(combined, contains('characteristic equations'));
      expect(combined, contains('Master Theorem'));
      expect(combined, contains('choosing the right method'));
      expect(combined, contains('brute force'));
    });

    test('Lesson 3 prose avoids AI punctuation tells', () {
      final combined = lesson3Prose().join('\n');
      expect(combined, isNot(contains('—')));
      expect(combined, isNot(contains(';')));
      expect(combined, isNot(contains(' - ')));
    });

    test('Lesson 3 prose uses readable math notation', () {
      final combined = lesson3Prose().join('\n');
      expect(combined, isNot(contains('n squared')));
      expect(combined, isNot(contains('2 to the n')));
      expect(combined, isNot(contains('n0')));
      expect(combined, isNot(contains('<=')));
      expect(combined, isNot(contains('>=')));

      expect(combined, contains('n²'));
      expect(combined, contains('2ⁿ'));
    });
  });

  group('Lesson 4 content', () {
    late LessonContent lesson4;

    setUp(() {
      lesson4 = lessons.firstWhere((l) => l.id == 4);
    });

    String combinedText(Iterable<ContentBlock> blocks) {
      return blocks
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
              VisualizerLinkBlock(
                :final algorithmId,
                :final label,
                :final description,
              ) =>
                '$algorithmId $label ${description ?? ''}',
            };
          })
          .join(' ');
    }

    List<String> lesson4Prose() {
      final prose = <String>[];
      for (final module in lesson4.modules) {
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
            case VisualizerLinkBlock(:final label, :final description):
              prose.add(label);
              if (description != null) prose.add(description);
            case CodeBlock():
            case MathBlock():
            case GraphBlock():
              break;
          }
        }
      }
      return prose;
    }

    test('has 4 modules', () {
      expect(lesson4.modules.length, 4);
    });

    test(
      'Module 1 introduces brute force with sorting and search visualizers',
      () {
        final module = lesson4.modules[0];
        expect(module.id, 'lesson4_module1');
        expect(module.title, 'Introduction to Brute Force');
        expect(module.order, 0);
        expect(module.algorithmId, 'bubble-sort');

        final blocks = module.contentBlocks;
        expect(
          blocks.whereType<DefinitionBlock>().length,
          greaterThanOrEqualTo(2),
        );
        expect(blocks.whereType<MathBlock>().length, greaterThanOrEqualTo(1));
        expect(blocks.any((b) => b is CodeBlock), isTrue);
        expect(blocks.any((b) => b is QuizBlock), isTrue);
        expect(blocks.last, isA<KeyTakeawayBlock>());

        final visualizers = blocks.whereType<VisualizerLinkBlock>().toList();
        expect(
          visualizers.map((v) => v.algorithmId),
          containsAll(['selection-sort', 'bubble-sort', 'linear-search']),
        );

        final combined = combinedText(blocks);
        expect(combined, contains('brute force'));
        expect(combined, contains('Selection Sort'));
        expect(combined, contains('Bubble Sort'));
        expect(combined, contains('Cocktail Shaker Sort'));
        expect(combined, contains('Sequential Search'));
        expect(combined, contains('string matching'));
        expect(combined, contains('O(n²)'));
        expect(combined, contains('O(nm)'));
      },
    );

    test('Module 2 explains exhaustive search and knapsack visualization', () {
      final module = lesson4.modules[1];
      expect(module.id, 'lesson4_module2');
      expect(module.title, 'Exhaustive Search');
      expect(module.order, 1);
      expect(module.algorithmId, 'knapsack');

      final blocks = module.contentBlocks;
      expect(
        blocks.whereType<DefinitionBlock>().length,
        greaterThanOrEqualTo(4),
      );
      expect(blocks.whereType<MathBlock>().length, greaterThanOrEqualTo(2));
      expect(blocks.any((b) => b is CodeBlock), isTrue);
      expect(blocks.any((b) => b is QuizBlock), isTrue);
      expect(
        blocks.whereType<VisualizerLinkBlock>().single.algorithmId,
        'knapsack',
      );
      expect(blocks.last, isA<KeyTakeawayBlock>());

      final combined = combinedText(blocks);
      expect(combined, contains('Travelling Salesman'));
      expect(combined, contains('Assignment Problem'));
      expect(combined, contains('Knapsack'));
      expect(combined, contains('O(n!)'));
      expect(combined, contains('O(2ⁿ)'));
      expect(combined, contains('include it'));
      expect(combined, contains('skip it'));
    });

    test('Module 3 bridges to greedy interval scheduling visualization', () {
      final module = lesson4.modules[2];
      expect(module.id, 'lesson4_module3');
      expect(module.title, 'Interval Scheduling');
      expect(module.order, 2);
      expect(module.algorithmId, 'activity-selection');

      final blocks = module.contentBlocks;
      expect(
        blocks.whereType<DefinitionBlock>().length,
        greaterThanOrEqualTo(3),
      );
      expect(blocks.whereType<MathBlock>().length, greaterThanOrEqualTo(2));
      expect(blocks.any((b) => b is CodeBlock), isTrue);
      expect(blocks.any((b) => b is QuizBlock), isTrue);
      expect(
        blocks.whereType<VisualizerLinkBlock>().single.algorithmId,
        'activity-selection',
      );
      expect(blocks.last, isA<KeyTakeawayBlock>());

      final combined = combinedText(blocks);
      expect(combined, contains('non-overlapping'));
      expect(combined, contains('finishes first'));
      expect(combined, contains('s(j) ≥ f'));
      expect(combined, contains('O(n log n)'));
      expect(combined, contains('priority queue'));
    });

    test('Module 4 concludes brute force and points to graph search', () {
      final module = lesson4.modules[3];
      expect(module.id, 'lesson4_module4');
      expect(module.title, 'Lesson 4 Conclusion');
      expect(module.order, 3);
      expect(module.algorithmId, isNull);

      final blocks = module.contentBlocks;
      expect(
        blocks.whereType<DefinitionBlock>().length,
        greaterThanOrEqualTo(1),
      );
      expect(blocks.any((b) => b is QuizBlock), isTrue);
      expect(blocks.last, isA<KeyTakeawayBlock>());

      final visualizers = blocks.whereType<VisualizerLinkBlock>().toList();
      expect(
        visualizers.map((v) => v.algorithmId),
        containsAll(['linear-search', 'bfs', 'dfs']),
      );

      final combined = combinedText(blocks);
      expect(combined, contains('baseline'));
      expect(combined, contains('factorial'));
      expect(combined, contains('exponential'));
      expect(combined, contains('depth-first search'));
      expect(combined, contains('breadth-first search'));
    });

    test('Lesson 4 prose avoids AI punctuation tells', () {
      final combined = lesson4Prose().join('\n');
      expect(combined, isNot(contains('—')));
      expect(combined, isNot(contains(';')));
      expect(combined, isNot(contains(' - ')));
    });

    test('Lesson 4 prose uses readable math notation', () {
      final combined = lesson4Prose().join('\n');
      expect(combined, isNot(contains('n squared')));
      expect(combined, isNot(contains('2 to the n')));
      expect(combined, isNot(contains('n0')));
      expect(combined, isNot(contains('<=')));
      expect(combined, isNot(contains('>=')));

      expect(combined, contains('n²'));
      expect(combined, contains('2ⁿ'));
      expect(combined, contains('≥'));
    });
  });

  group('Lesson 5 content', () {
    late LessonContent lesson5;

    setUp(() {
      lesson5 = lessons.firstWhere((l) => l.id == 5);
    });

    String combinedText(Iterable<ContentBlock> blocks) {
      return blocks
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
              VisualizerLinkBlock(
                :final algorithmId,
                :final label,
                :final description,
              ) =>
                '$algorithmId $label ${description ?? ''}',
            };
          })
          .join(' ');
    }

    List<String> lesson5Prose() {
      final prose = <String>[];
      for (final module in lesson5.modules) {
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
            case VisualizerLinkBlock(:final label, :final description):
              prose.add(label);
              if (description != null) prose.add(description);
            case CodeBlock():
            case MathBlock():
            case GraphBlock():
              break;
          }
        }
      }
      return prose;
    }

    test('has 6 modules', () {
      expect(lesson5.modules.length, 6);
    });

    test('Module 1 introduces DFS and BFS with visualizer links', () {
      final module = lesson5.modules[0];
      expect(module.id, 'lesson5_module1');
      expect(module.title, 'Introduction to DFS and BFS');
      expect(module.order, 0);
      expect(module.algorithmId, 'dfs');

      final blocks = module.contentBlocks;
      expect(
        blocks.whereType<DefinitionBlock>().length,
        greaterThanOrEqualTo(4),
      );
      expect(blocks.any((b) => b is QuizBlock), isFalse);
      expect(blocks.last, isA<KeyTakeawayBlock>());

      final visualizers = blocks.whereType<VisualizerLinkBlock>().toList();
      expect(
        visualizers.map((v) => v.algorithmId),
        containsAll(['dfs', 'bfs']),
      );

      final combined = combinedText(blocks);
      expect(combined, contains('Depth-First Search'));
      expect(combined, contains('Breadth-First Search'));
      expect(combined, contains('stack'));
      expect(combined, contains('queue'));
      expect(combined, contains('maze'));
      expect(combined, contains('Vertex'));
      expect(combined, contains('Edge'));
    });

    test(
      'Module 2 covers key search, heuristics, 8-puzzle, and topological sort',
      () {
        final module = lesson5.modules[1];
        expect(module.id, 'lesson5_module2');
        expect(
          module.title,
          'Finding Keys with DFS, BFS, and Best-First Search',
        );
        expect(module.order, 1);
        expect(module.algorithmId, 'dfs');

        final blocks = module.contentBlocks;
        expect(
          blocks.whereType<DefinitionBlock>().length,
          greaterThanOrEqualTo(6),
        );
        expect(blocks.whereType<CodeBlock>().length, greaterThanOrEqualTo(4));
        expect(blocks.whereType<QuizBlock>().length, greaterThanOrEqualTo(3));
        expect(blocks.last, isA<KeyTakeawayBlock>());

        final visualizers = blocks.whereType<VisualizerLinkBlock>().toList();
        expect(
          visualizers.map((v) => v.algorithmId),
          containsAll(['dfs', 'bfs']),
        );

        final combined = combinedText(blocks);
        expect(combined, contains('open'));
        expect(combined, contains('closed'));
        expect(combined, contains('left end'));
        expect(combined, contains('right end'));
        expect(combined, contains('shortest path'));
        expect(combined, contains('Best-First Search'));
        expect(combined, contains('heuristic'));
        expect(combined, contains('8-puzzle'));
        expect(combined, contains('tiles out of place'));
        expect(combined, contains('Topological sort'));
        expect(combined, contains('DAG'));
        expect(combined, contains('reverse the finish-time order'));
      },
    );

    test(
      'Module 3 covers BFS level-by-level, queue, tree edges, cross edges',
      () {
        final module = lesson5.modules[2];
        expect(module.id, 'lesson5_module3');
        expect(module.title, 'Breadth-First Search');
        expect(module.order, 2);
        expect(module.algorithmId, 'bfs');

        final blocks = module.contentBlocks;
        expect(
          blocks.whereType<DefinitionBlock>().length,
          greaterThanOrEqualTo(3),
        );
        expect(blocks.any((b) => b is CodeBlock), isTrue);
        expect(blocks.any((b) => b is QuizBlock), isFalse);
        expect(blocks.last, isA<KeyTakeawayBlock>());
        expect(
          blocks.whereType<VisualizerLinkBlock>().single.algorithmId,
          'bfs',
        );

        final combined = combinedText(blocks);
        expect(combined, contains('level by level'));
        expect(combined, contains('queue'));
        expect(combined, contains('wave'));
        expect(combined, contains('BFS forest'));
        expect(combined, contains('Cross edge'));
        expect(combined, contains('layer'));
      },
    );

    test('Module 4 covers adjacency matrix and adjacency linked list', () {
      final module = lesson5.modules[3];
      expect(module.id, 'lesson5_module4');
      expect(module.title, 'Graph Representations');
      expect(module.order, 3);
      expect(module.algorithmId, isNull);

      final blocks = module.contentBlocks;
      expect(
        blocks.whereType<DefinitionBlock>().length,
        greaterThanOrEqualTo(2),
      );
      expect(blocks.whereType<MathBlock>().length, greaterThanOrEqualTo(2));
      expect(blocks.any((b) => b is QuizBlock), isFalse);
      expect(blocks.last, isA<KeyTakeawayBlock>());

      final combined = combinedText(blocks);
      expect(combined, contains('adjacency matrix'));
      expect(combined, contains('adjacency linked list'));
      expect(combined, contains('Theta'));
      expect(combined, contains('|V|'));
      expect(combined, contains('|E|'));
      expect(combined, contains('sparse'));
    });

    test(
      'Module 5 covers efficiency and when to use each with quiz questions',
      () {
        final module = lesson5.modules[4];
        expect(module.id, 'lesson5_module5');
        expect(module.title, 'Efficiency and When to Use Each');
        expect(module.order, 4);
        expect(module.algorithmId, isNull);

        final blocks = module.contentBlocks;
        expect(blocks.whereType<MathBlock>().length, greaterThanOrEqualTo(2));
        expect(blocks.whereType<QuizBlock>().length, greaterThanOrEqualTo(4));
        expect(blocks.last, isA<KeyTakeawayBlock>());

        final combined = combinedText(blocks);
        expect(combined, contains('Theta(|V|'));
        expect(combined, contains('shortest path'));
        expect(combined, contains('edge count'));
        expect(combined, contains('cycle detection'));
        expect(combined, contains('sparse'));
      },
    );

    test(
      'Module 6 concludes with DFS, BFS, heuristic search, and Lesson 6 bridge',
      () {
        final module = lesson5.modules[5];
        expect(module.id, 'lesson5_module6');
        expect(module.title, 'Conclusion');
        expect(module.order, 5);
        expect(module.algorithmId, isNull);

        final blocks = module.contentBlocks;
        expect(blocks.any((b) => b is QuizBlock), isFalse);
        expect(blocks.last, isA<KeyTakeawayBlock>());

        final visualizers = blocks.whereType<VisualizerLinkBlock>().toList();
        expect(
          visualizers.map((v) => v.algorithmId),
          containsAll(['dfs', 'bfs']),
        );

        final combined = combinedText(blocks);
        expect(combined, contains('depth-first search'));
        expect(combined, contains('breadth-first search'));
        expect(combined, contains('heuristic search'));
        expect(combined, contains('topological sort'));
        expect(combined, contains('decrease-and-conquer'));
        expect(combined, contains('Lesson 6'));
      },
    );

    test('Lesson 5 prose avoids AI punctuation tells', () {
      final combined = lesson5Prose().join('\n');
      expect(combined, isNot(contains('—')));
      expect(combined, isNot(contains(';')));
      expect(combined, isNot(contains(' - ')));
    });

    test('Lesson 5 prose uses readable math notation', () {
      final combined = lesson5Prose().join('\n');
      expect(combined, isNot(contains('n squared')));
      expect(combined, isNot(contains('<=')));
      expect(combined, isNot(contains('>=')));
      expect(combined, isNot(contains('c * g(n)')));
      expect(combined, isNot(contains('\\u')));
    });

    test('Lesson 5 contains DFS and BFS visualizers in module 1', () {
      final m1Blocks = lesson5.modules[0].contentBlocks;
      final visualizers = m1Blocks.whereType<VisualizerLinkBlock>().toList();
      expect(visualizers.length, 2);
      expect(visualizers[0].algorithmId, 'dfs');
      expect(visualizers[1].algorithmId, 'bfs');
    });

    test('Lesson 5 quiz blocks have single correct answer per question', () {
      final module5 = lesson5.modules[4];
      final quizzes = module5.contentBlocks.whereType<QuizBlock>().toList();
      expect(quizzes.length, greaterThanOrEqualTo(4));
      for (final q in quizzes) {
        expect(q.correctIndex, inInclusiveRange(0, q.options.length - 1));
      }
    });
  });

  group('Lesson 6 content', () {
    late LessonContent lesson6;

    setUp(() {
      lesson6 = lessons.firstWhere((l) => l.id == 6);
    });

    String combinedText(Iterable<ContentBlock> blocks) {
      return blocks
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
              VisualizerLinkBlock(
                :final algorithmId,
                :final label,
                :final description,
              ) =>
                '$algorithmId $label ${description ?? ''}',
            };
          })
          .join(' ');
    }

    List<String> lesson6Prose() {
      final prose = <String>[];
      for (final module in lesson6.modules) {
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
            case VisualizerLinkBlock(:final label, :final description):
              prose.add(label);
              if (description != null) prose.add(description);
            case CodeBlock():
            case MathBlock():
            case GraphBlock():
              break;
          }
        }
      }
      return prose;
    }

    test('has 9 modules', () {
      expect(lesson6.modules.length, 9);
    });

    test('Module 1 introduces decrease-and-conquer categories', () {
      final module = lesson6.modules[0];
      expect(module.id, 'lesson6_module1');
      expect(module.title, 'Introduction to Decrease and Conquer');
      expect(module.order, 0);
      expect(module.algorithmId, isNull);

      final blocks = module.contentBlocks;
      expect(
        blocks.whereType<DefinitionBlock>().length,
        greaterThanOrEqualTo(4),
      );
      expect(blocks.whereType<QuizBlock>().length, greaterThanOrEqualTo(2));
      expect(blocks.last, isA<KeyTakeawayBlock>());

      final visualizers = blocks.whereType<VisualizerLinkBlock>().toList();
      expect(
        visualizers.map((v) => v.algorithmId),
        containsAll(['insertion-sort', 'binary-search']),
      );

      final combined = combinedText(blocks);
      expect(combined, contains('Decrease and conquer'));
      expect(combined, contains('Decrease by a constant'));
      expect(combined, contains('Decrease by a constant factor'));
      expect(combined, contains('Variable-size decrease'));
      expect(combined, contains('n − 1'));
      expect(combined, contains('n / 2'));
      expect(combined, contains('Topological sort'));
      expect(combined, contains('Divide and conquer'));
    });

    test('Module 2 covers insertion sort as decrease by one', () {
      final module = lesson6.modules[1];
      expect(module.id, 'lesson6_module2');
      expect(module.title, 'Insertion Sort: Decrease by One');
      expect(module.order, 1);
      expect(module.algorithmId, 'insertion-sort');

      final blocks = module.contentBlocks;
      expect(blocks.whereType<MathBlock>().length, greaterThanOrEqualTo(4));
      expect(blocks.whereType<QuizBlock>().length, greaterThanOrEqualTo(2));
      expect(blocks.last, isA<KeyTakeawayBlock>());
      expect(
        blocks.whereType<VisualizerLinkBlock>().single.algorithmId,
        'insertion-sort',
      );

      final combined = combinedText(blocks);
      expect(combined, contains('sorted prefix'));
      expect(combined, contains('i − 1'));
      expect(combined, contains('reverse sorted'));
      expect(combined, contains('T_{worst}(n)'));
      expect(combined, contains('T_{best}(n)'));
      expect(combined, contains('T_{average}(n)'));
      expect(combined, contains('Stable sort'));
      expect(combined, contains('nearly sorted'));
    });

    test('Module 3 covers Shell Sort', () {
      final module = lesson6.modules[2];
      expect(module.id, 'lesson6_module3');
      expect(module.title, 'Shell Sort');
      expect(module.order, 2);
      expect(module.algorithmId, isNull);

      final blocks = module.contentBlocks;
      expect(
        blocks.whereType<DefinitionBlock>().length,
        greaterThanOrEqualTo(3),
      );
      expect(blocks.whereType<QuizBlock>().length, greaterThanOrEqualTo(2));
      expect(blocks.last, isA<KeyTakeawayBlock>());

      expect(blocks.whereType<MathBlock>().length, greaterThanOrEqualTo(5));

      final combined = combinedText(blocks);
      expect(combined, contains('delta'));
      expect(combined, contains('gap sequence'));
      expect(combined, contains(r'\delta_1'));
      expect(combined, contains(r'\Theta(n^{1.25})'));
      expect(combined, contains('decrease'));
      expect(combined, isNot(contains('n^1.25')));
    });

    test('Module 4 covers Binary Search as decrease by a constant factor', () {
      final module = lesson6.modules[3];
      expect(module.id, 'lesson6_module4');
      expect(module.title, 'Binary Search: Decrease by a Constant Factor');
      expect(module.order, 3);
      expect(module.algorithmId, 'binary-search');

      final blocks = module.contentBlocks;
      expect(blocks.whereType<MathBlock>().length, greaterThanOrEqualTo(6));
      expect(blocks.whereType<QuizBlock>().length, greaterThanOrEqualTo(3));
      expect(blocks.last, isA<KeyTakeawayBlock>());
      expect(
        blocks.whereType<VisualizerLinkBlock>().single.algorithmId,
        'binary-search',
      );

      final combined = combinedText(blocks);
      expect(combined, contains(r'O(\log n)'));
      expect(combined, contains(r'\log_2'));
      expect(combined, contains(r'\frac{n}{2^k}'));
      expect(combined, contains(r'2^k \ge n'));
      expect(combined, contains('duplicate'));
    });

    test('Module 5 covers Analysis of Binary Search', () {
      final module = lesson6.modules[4];
      expect(module.id, 'lesson6_module5');
      expect(module.title, 'Analysis of Binary Search');
      expect(module.order, 4);
      expect(module.algorithmId, 'binary-search');
      final blocks = module.contentBlocks;
      expect(blocks.whereType<MathBlock>().length, greaterThanOrEqualTo(6));
      expect(blocks.whereType<QuizBlock>().length, greaterThanOrEqualTo(3));
      expect(blocks.last, isA<KeyTakeawayBlock>());
      expect(blocks.whereType<VisualizerLinkBlock>().isEmpty, isTrue);
      final combined = combinedText(blocks);
      expect(combined, contains(r'C_{worst}'));
      expect(combined, contains(r'\Theta(\log n)'));
      expect(combined, contains(r'\lfloor'));
      expect(combined, contains(r'\lceil'));
      expect(combined, contains(r'\log_2'));
      expect(combined, contains(r'2^{k-1}'));
    });

    test('Module 6 covers The Fake Coin Problem', () {
      final module = lesson6.modules[5];
      expect(module.id, 'lesson6_module6');
      expect(module.title, 'The Fake Coin Problem');
      expect(module.order, 5);
      expect(module.algorithmId, isNull);
      final blocks = module.contentBlocks;
      expect(
        blocks.whereType<DefinitionBlock>().length,
        greaterThanOrEqualTo(2),
      );
      expect(blocks.whereType<MathBlock>().length, greaterThanOrEqualTo(4));
      expect(blocks.whereType<QuizBlock>().length, 3);
      expect(blocks.last, isA<KeyTakeawayBlock>());
      final combined = combinedText(blocks);
      expect(combined, contains('decrease and conquer'));
      expect(combined, contains('⌊log₂ n⌋'));
      expect(combined, contains('⌈log₃ n⌉'));
    });

    test('Lesson 6 modules 3 through 9 keep formulas out of visible prose', () {
      final visibleProse = lesson6.modules
          .skip(2)
          .take(7)
          .expand((module) => module.contentBlocks)
          .where((block) => block is! MathBlock && block is! CodeBlock)
          .map((block) {
            return switch (block) {
              TextBlock(:final text) => text,
              DefinitionBlock(:final term, :final definition) =>
                '$term $definition',
              KeyTakeawayBlock(:final text) => text,
              QuizBlock(:final question, :final options, :final explanation) =>
                '$question ${options.join(' ')} $explanation',
              VisualizerLinkBlock(:final label, :final description) =>
                '$label ${description ?? ''}',
              CodeBlock() || MathBlock() || GraphBlock() => '',
            };
          })
          .join('\n');

      expect(visibleProse, isNot(contains('n^1.25')));
      expect(visibleProse, isNot(contains('2^k')));
      expect(visibleProse, isNot(contains('log_2')));
      expect(visibleProse, isNot(contains('ceil(')));
      expect(visibleProse, isNot(contains('Θ(')));
      expect(visibleProse, isNot(contains('δ')));
      expect(visibleProse, isNot(contains(r'\lfloor')));
      expect(visibleProse, isNot(contains(r'\lceil')));
    });

    test('Lesson 6 prose avoids AI punctuation tells', () {
      final combined = lesson6Prose().join('\n');
      expect(combined, isNot(contains('—')));
      expect(combined, isNot(contains(';')));
      expect(combined, isNot(contains(' - ')));
    });

    test('Lesson 6 prose uses readable math notation', () {
      final combined = lesson6Prose().join('\n');
      expect(combined, isNot(contains('n squared')));
      expect(combined, isNot(contains('n0')));
      expect(combined, isNot(contains('<=')));
      expect(combined, isNot(contains('>=')));
      expect(combined, contains('n²'));
      expect(combined, contains('Θ(n²)'));
      expect(combined, contains('Θ(n)'));
      expect(combined, contains('i − 1'));
    });
  });

  group('lesson7', () {
    final lesson7 = lessons.firstWhere((l) => l.id == 7);

    String combinedText(Iterable<ContentBlock> blocks) {
      return blocks
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
              VisualizerLinkBlock(
                :final algorithmId,
                :final label,
                :final description,
              ) =>
                '$algorithmId $label ${description ?? ''}',
            };
          })
          .join(' ');
    }

    List<String> lesson7Prose() {
      final prose = <String>[];
      for (final module in lesson7.modules) {
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
            case VisualizerLinkBlock(:final label, :final description):
              prose.add(label);
              if (description != null) prose.add(description);
            case CodeBlock():
            case MathBlock():
            case GraphBlock():
              break;
          }
        }
      }
      return prose;
    }

    test('has 7 modules', () {
      expect(lesson7.modules.length, 7);
    });

    test('Module 1 covers divide and conquer introduction', () {
      final module = lesson7.modules[0];
      expect(module.id, 'lesson7_module1');
      expect(module.title, 'Introduction to Divide and Conquer');
      expect(module.order, 0);
      expect(module.algorithmId, isNull);

      final blocks = module.contentBlocks;
      expect(
        blocks.whereType<DefinitionBlock>().length,
        greaterThanOrEqualTo(3),
      );
      expect(blocks.whereType<QuizBlock>().length, greaterThanOrEqualTo(4));
      expect(blocks.last, isA<KeyTakeawayBlock>());
      expect(blocks.whereType<MathBlock>().length, greaterThanOrEqualTo(4));

      final combined = combinedText(blocks);
      expect(combined, contains('Divide and Conquer'));
      expect(combined, contains('subproblems'));
      expect(combined, contains('recursively'));
      expect(combined, contains('Merge Sort'));
      expect(combined, contains('T(n)'));
      expect(combined, contains('Master Theorem'));
      expect(combined, contains('Case 1'));
      expect(combined, contains('Case 2'));
      expect(combined, contains('Case 3'));
    });

    test('Module 2 covers Mergesort', () {
      final module = lesson7.modules[1];
      expect(module.id, 'lesson7_module2');
      expect(module.title, 'Mergesort');
      expect(module.order, 1);
      expect(module.algorithmId, isNull);
      final blocks = module.contentBlocks;
      expect(blocks.whereType<MathBlock>().length, greaterThanOrEqualTo(1));
      expect(blocks.whereType<QuizBlock>().length, greaterThanOrEqualTo(2));
      expect(blocks.last, isA<KeyTakeawayBlock>());
      final combined = combinedText(blocks);
      expect(combined, contains('merge'));
      expect(combined, contains('divide'));
      expect(combined, contains('Master Theorem'));
    });

    test('Module 3 covers Counting Inversions', () {
      final module = lesson7.modules[2];
      expect(module.id, 'lesson7_module3');
      expect(module.title, 'Counting Inversions');
      expect(module.order, 2);
      expect(module.algorithmId, isNull);
      final blocks = module.contentBlocks;
      expect(blocks.whereType<MathBlock>().length, greaterThanOrEqualTo(3));
      expect(blocks.whereType<QuizBlock>().length, greaterThanOrEqualTo(2));
      expect(blocks.last, isA<KeyTakeawayBlock>());
      final combined = combinedText(blocks);
      expect(combined, contains('inversion'));
      expect(combined, contains('merge'));
      expect(combined, contains('divide'));
    });

    test('Module 4 covers Quicksort', () {
      final module = lesson7.modules[3];
      expect(module.id, 'lesson7_module4');
      expect(module.title, 'Quicksort');
      expect(module.order, 3);
      expect(module.algorithmId, isNull);
      final blocks = module.contentBlocks;
      expect(blocks.whereType<MathBlock>().length, greaterThanOrEqualTo(3));
      expect(blocks.whereType<QuizBlock>().length, greaterThanOrEqualTo(2));
      expect(blocks.last, isA<KeyTakeawayBlock>());
      final combined = combinedText(blocks);
      expect(combined, contains('pivot'));
      expect(combined, contains('partition'));
      expect(combined, contains('quicksort'));
    });

    test('Module 5 covers Large Integer Multiplication', () {
      final module = lesson7.modules[4];
      expect(module.id, 'lesson7_module5');
      expect(module.title, 'Multiplication of Large Integers');
      expect(module.order, 4);
      expect(module.algorithmId, isNull);
      final blocks = module.contentBlocks;
      expect(blocks.whereType<MathBlock>().length, greaterThanOrEqualTo(3));
      expect(blocks.whereType<QuizBlock>().length, greaterThanOrEqualTo(2));
      expect(blocks.last, isA<KeyTakeawayBlock>());
      final combined = combinedText(blocks);
      expect(combined, contains('Karatsuba'));
      expect(combined, contains('cryptography'));
    });

    test('Module 6 covers Strassen Matrix Multiplication', () {
      final module = lesson7.modules[5];
      expect(module.id, 'lesson7_module6');
      expect(module.title, 'Multiplication of Matrices (Strassen)');
      expect(module.order, 5);
      expect(module.algorithmId, isNull);
      final blocks = module.contentBlocks;
      expect(blocks.whereType<MathBlock>().length, greaterThanOrEqualTo(3));
      expect(blocks.whereType<QuizBlock>().length, greaterThanOrEqualTo(2));
      expect(blocks.last, isA<KeyTakeawayBlock>());
      final combined = combinedText(blocks);
      expect(combined, contains('Strassen'));
      expect(combined, contains('matrix'));
    });

    test('Module 7 covers Conclusion', () {
      final module = lesson7.modules[6];
      expect(module.id, 'lesson7_module7');
      expect(module.title, 'Conclusion');
      expect(module.order, 6);
      expect(module.algorithmId, isNull);
      final blocks = module.contentBlocks;
      expect(blocks.last, isA<KeyTakeawayBlock>());
      final combined = combinedText(blocks);
      expect(combined, contains('Divide and Conquer'));
      expect(combined, contains('Transform'));
    });

    test('Lesson 7 visible prose keeps formulas out of prose blocks', () {
      final visibleProse = lesson7.modules
          .expand((module) => module.contentBlocks)
          .where((block) => block is! MathBlock && block is! CodeBlock)
          .map((block) {
            switch (block) {
              case TextBlock(:final text):
                return text;
              case DefinitionBlock(:final term, :final definition):
                return '$term $definition';
              case KeyTakeawayBlock(:final text):
                return text;
              case QuizBlock(
                :final question,
                :final options,
                :final explanation,
              ):
                return '$question ${options.join(' ')} $explanation';
              case VisualizerLinkBlock(:final label, :final description):
                return '$label ${description ?? ''}';
              default:
                return '';
            }
          })
          .join('\n');

      expect(visibleProse, isNot(contains('T(n) =')));
      expect(visibleProse, isNot(contains(r'\frac')));
      expect(visibleProse, isNot(contains(r'\Theta')));
    });

    test('Lesson 7 prose uses readable math notation', () {
      final combined = lesson7Prose().join('\n');
      expect(combined, contains('Θ'));
      expect(combined, isNot(contains('n^2')));
      expect(combined, isNot(contains('n^1')));
    });

    test('Lesson 7 prose avoids AI punctuation tells', () {
      final combined = lesson7Prose().join('\n');
      expect(combined, isNot(contains('\u2014')));
      expect(combined, isNot(contains(';')));
      expect(combined, isNot(contains(' - ')));
    });
  });

  group('lesson8', () {
    final lesson8 = lessons.firstWhere((l) => l.id == 8);

    String combinedText(Iterable<ContentBlock> blocks) {
      return blocks
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
              VisualizerLinkBlock(
                :final algorithmId,
                :final label,
                :final description,
              ) =>
                '$algorithmId $label ${description ?? ''}',
            };
          })
          .join(' ');
    }

    List<String> lesson8Prose() {
      final prose = <String>[];
      for (final module in lesson8.modules) {
        for (final block in module.contentBlocks) {
          switch (block) {
            case TextBlock(:final text):
              prose.add(text);
            case DefinitionBlock(:final term, :final definition):
              prose.add('$term $definition');
            case KeyTakeawayBlock(:final text):
              prose.add(text);
            case QuizBlock(
              :final question,
              :final options,
              :final explanation,
            ):
              prose.add(question);
              prose.addAll(options);
              prose.add(explanation);
            case CodeBlock(:final code, :final language):
              prose.add('$language $code');
            case MathBlock(:final tex, :final semanticsLabel):
              prose.add('$semanticsLabel $tex');
            case GraphBlock(:final type):
              prose.add(type);
            case VisualizerLinkBlock(
              :final algorithmId,
              :final label,
              :final description,
            ):
              prose.add('$algorithmId $label ${description ?? ''}');
          }
        }
      }
      return prose;
    }

    test('has 5 modules', () {
      expect(lesson8.modules.length, 5);
    });

    test('Module 1 covers transform and conquer introduction', () {
      final module = lesson8.modules[0];
      expect(module.id, 'lesson8_module1');
      expect(module.title, 'Introduction to Transform and Conquer');
      expect(module.order, 0);
      expect(module.algorithmId, isNull);

      final blocks = module.contentBlocks;
      expect(
        blocks.whereType<DefinitionBlock>().length,
        greaterThanOrEqualTo(4),
      );
      expect(blocks.whereType<QuizBlock>().length, greaterThanOrEqualTo(3));
      expect(blocks.last, isA<KeyTakeawayBlock>());

      final combined = combinedText(blocks);
      expect(combined, contains('Transform and Conquer'));
      expect(combined, contains('Gaussian'));
      expect(combined, contains('Instance Simplification'));
      expect(combined, contains('Representation Change'));
      expect(combined, contains('Problem Reduction'));
      expect(combined, contains('upper triangular'));
      expect(combined, contains('backward substitution'));
    });

    test('Module 2 covers Presorting', () {
      final module = lesson8.modules[1];
      expect(module.id, 'lesson8_module2');
      expect(module.title, 'Presorting');
      expect(module.order, 1);
      expect(module.algorithmId, isNull);

      final blocks = module.contentBlocks;
      expect(
        blocks.whereType<DefinitionBlock>().length,
        greaterThanOrEqualTo(2),
      );
      expect(blocks.whereType<QuizBlock>().length, greaterThanOrEqualTo(3));
      expect(blocks.whereType<CodeBlock>().length, greaterThanOrEqualTo(2));
      expect(blocks.last, isA<KeyTakeawayBlock>());

      final combined = combinedText(blocks);
      expect(combined, contains('presorting'));
      expect(combined, contains('Element Uniqueness'));
      expect(combined, contains('mode'));
      expect(combined, contains('linear scan'));
    });

    test('Module 3 covers Heaps and Heapsort', () {
      final module = lesson8.modules[2];
      expect(module.id, 'lesson8_module3');
      expect(module.title, 'Heaps and Heapsort');
      expect(module.order, 2);
      expect(module.algorithmId, isNull);

      final blocks = module.contentBlocks;
      expect(
        blocks.whereType<DefinitionBlock>().length,
        greaterThanOrEqualTo(4),
      );
      expect(blocks.whereType<QuizBlock>().length, greaterThanOrEqualTo(4));
      expect(blocks.whereType<MathBlock>().length, greaterThanOrEqualTo(5));
      expect(blocks.whereType<CodeBlock>().length, greaterThanOrEqualTo(2));
      expect(blocks.last, isA<KeyTakeawayBlock>());

      final combined = combinedText(blocks);
      expect(combined, contains('priority queue'));
      expect(combined, contains('partial order'));
      expect(combined, contains('fixHeap'));
      expect(combined, contains('Heapsort'));
      expect(combined, contains('representation change'));
    });

    test("Module 4 covers Horner's Rule", () {
      final module = lesson8.modules[3];
      expect(module.id, 'lesson8_module4');
      expect(module.title, "Horner's Rule for Polynomial Evaluation");
      expect(module.order, 3);
      expect(module.algorithmId, isNull);

      final blocks = module.contentBlocks;
      expect(blocks.whereType<DefinitionBlock>().length, greaterThanOrEqualTo(2));
      expect(blocks.whereType<QuizBlock>().length, greaterThanOrEqualTo(3));
      expect(blocks.whereType<MathBlock>().length, greaterThanOrEqualTo(2));
      expect(blocks.whereType<CodeBlock>().length, greaterThanOrEqualTo(1));
      expect(blocks.last, isA<KeyTakeawayBlock>());

      final combined = combinedText(blocks);
      expect(combined, contains('polynomial'));
      expect(combined, contains('Horner'));
      expect(combined, contains('nested'));
      expect(combined, contains('representation change'));
    });

    test('Module 5 is the Lesson 8 conclusion', () {
      final module = lesson8.modules[4];
      expect(module.id, 'lesson8_module5');
      expect(module.title, 'Conclusion: Transform and Conquer');
      expect(module.order, 4);
      expect(module.algorithmId, isNull);

      final blocks = module.contentBlocks;
      expect(blocks.whereType<DefinitionBlock>().length, greaterThanOrEqualTo(2));
      expect(blocks.whereType<QuizBlock>().length, greaterThanOrEqualTo(3));
      expect(blocks.last, isA<KeyTakeawayBlock>());

      final combined = combinedText(blocks);
      expect(combined.toLowerCase(), contains('presorting'));
      expect(combined.toLowerCase(), contains('heap'));
      expect(combined, contains('Horner'));
      expect(combined, contains('Lesson 9'));
    });

    test('Lesson 8 visible prose keeps formulas out of prose blocks', () {
      final visibleProse = lesson8.modules
          .expand((module) => module.contentBlocks)
          .where((block) => block is! MathBlock && block is! CodeBlock)
          .map((block) {
            return switch (block) {
              TextBlock(:final text) => text,
              DefinitionBlock(:final term, :final definition) =>
                '$term $definition',
              KeyTakeawayBlock(:final text) => text,
              QuizBlock(:final question, :final options, :final explanation) =>
                '$question ${options.join(' ')} $explanation',
              CodeBlock() => '',
              MathBlock() => '',
              GraphBlock(:final type) => type,
              VisualizerLinkBlock(
                :final algorithmId,
                :final label,
                :final description,
              ) =>
                '$algorithmId $label ${description ?? ''}',
            };
          })
          .join('\n');

      expect(visibleProse, isNot(contains('Θ(')));
      expect(visibleProse, isNot(contains('T(n) =')));
      expect(visibleProse, isNot(contains(r'\Theta')));
    });

    test('Lesson 8 prose uses readable math notation', () {
      final combined = lesson8Prose().join('\n');
      expect(combined, isNot(contains('n^2')));
    });

    test('Lesson 8 prose avoids AI punctuation tells', () {
      final combined = lesson8Prose().join('\n');
      expect(combined, isNot(contains('\u2014')));
      expect(combined, isNot(contains(';')));
      expect(combined, isNot(contains(' - ')));
    });
  });

  group('lesson9', () {
    final lesson9 = lessons.firstWhere((l) => l.id == 9);

    List<String> combinedText(List<ContentBlock> blocks) {
      final prose = <String>[];
      for (final block in blocks) {
        switch (block) {
          case TextBlock(:final text):
            prose.add(text);
          case DefinitionBlock(:final term, :final definition):
            prose.add('$term $definition');
          case KeyTakeawayBlock(:final text):
            prose.add(text);
          case QuizBlock(
            :final question,
            :final options,
            :final explanation,
          ):
            prose.add(question);
            prose.addAll(options);
            prose.add(explanation);
          case CodeBlock(:final code, :final language):
            prose.add('$language $code');
          case MathBlock(:final tex, :final semanticsLabel):
            prose.add('$semanticsLabel $tex');
          case GraphBlock(:final type):
            prose.add(type);
          case VisualizerLinkBlock(
            :final algorithmId,
            :final label,
            :final description,
          ):
            prose.add('$algorithmId $label ${description ?? ''}');
        }
      }
      return prose;
    }

    test('has 2 modules', () {
      expect(lesson9.modules.length, 4);
    });

    test('Module 1 introduces Transform and Conquer Part 2', () {
      final module = lesson9.modules[0];
      expect(module.id, 'lesson9_module1');
      expect(module.title, 'Transform and Conquer Part 2: Overview');
      expect(module.order, 0);
      expect(module.algorithmId, isNull);

      final blocks = module.contentBlocks;
      expect(blocks.whereType<DefinitionBlock>().length, greaterThanOrEqualTo(5));
      expect(blocks.whereType<QuizBlock>().length, greaterThanOrEqualTo(3));
      expect(blocks.last, isA<KeyTakeawayBlock>());

      final combined = combinedText(blocks).join(' ');
      expect(combined, contains('representation change'));
      expect(combined, contains('binary exponentiation'));
      expect(combined, contains('longest increasing subsequence'));
      expect(combined, contains('problem reduction'));
      expect(combined, contains('linear programming'));
      expect(combined, contains('simplex'));
    });

    test('Module 2 covers Binary Exponentiation', () {
      final module = lesson9.modules[1];
      expect(module.id, 'lesson9_module2');
      expect(module.title, 'Binary Exponentiation');
      expect(module.order, 1);
      expect(module.algorithmId, isNull);

      final blocks = module.contentBlocks;
      expect(blocks.whereType<DefinitionBlock>().length, greaterThanOrEqualTo(4));
      expect(blocks.whereType<QuizBlock>().length, greaterThanOrEqualTo(5));
      expect(blocks.last, isA<KeyTakeawayBlock>());

      final combined = combinedText(blocks).join(' ');
      expect(combined, contains('binary'));
      expect(combined, contains('exponent'));
      expect(combined, contains('square'));
      expect(combined, contains('Horner'));
      expect(combined, contains('log'));
      expect(combined, contains('left-to-right'));
      expect(combined, contains('right-to-left'));
    });

    test('Lesson 9 visible prose keeps formulas out of prose blocks', () {
      final visibleProse = lesson9.modules
          .expand((module) => module.contentBlocks)
          .whereType<TextBlock>()
          .map((b) => b.text)
          .join(' ');
      // No raw math notation in prose text
      expect(visibleProse, isNot(contains('O(n')));
      expect(visibleProse, isNot(contains(r'$')));
    });

    test('Lesson 9 prose uses readable math notation', () {
      final combined = combinedText(lesson9.modules.expand((m) => m.contentBlocks).toList()).join(' ');
      expect(combined, isNot(contains('n^2')));
    });

    test('Lesson 9 prose avoids AI punctuation tells', () {
      final combined = combinedText(lesson9.modules.expand((m) => m.contentBlocks).toList()).join(' ');
      expect(combined, isNot(contains('\u2014')));
      expect(combined, isNot(contains(';')));
      expect(combined, isNot(contains(' - ')));
    });
  });


  group('Lesson 10 content', () {
    late LessonContent lesson10;

    setUp(() {
      lesson10 = lessons.firstWhere((l) => l.id == 10);
    });

    String combinedText(Iterable<ContentBlock> blocks) {
      return blocks
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
              VisualizerLinkBlock(
                :final algorithmId,
                :final label,
                :final description,
              ) =>
                '$algorithmId $label ${description ?? ''}',
            };
          })
          .join(' ');
    }

    List<String> lesson10Prose() {
      final prose = <String>[];
      for (final module in lesson10.modules) {
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
            case VisualizerLinkBlock():
              break;
          }
        }
      }
      return prose;
    }

    test('has 4 modules', () {
      expect(lesson10.modules.length, 4);
    });

    test('Module 1 introduces dynamic programming and the Fibonacci example', () {
      final module = lesson10.modules[0];
      expect(module.id, 'lesson10_module1');
      expect(module.title, 'Introduction to Dynamic Programming');
      expect(module.order, 0);
      expect(module.algorithmId, isNull);

      final blocks = module.contentBlocks;
      expect(blocks.whereType<DefinitionBlock>().length, greaterThanOrEqualTo(1));
      expect(blocks.whereType<MathBlock>().length, greaterThanOrEqualTo(1));
      expect(blocks.whereType<QuizBlock>().length, greaterThanOrEqualTo(3));
      expect(blocks.last, isA<KeyTakeawayBlock>());

      final combined = combinedText(blocks);
      expect(combined.toLowerCase(), contains('dynamic programming'));
      expect(combined.toLowerCase(), contains('fibonacci'));
      expect(combined, contains(r'F(n) = F(n-1) + F(n-2)'));
      expect(combined.toLowerCase(), contains('subproblem'));
      expect(combined.toLowerCase(), contains('decision tree'));
    });

    test('Module 2 covers Binomial Coefficients', () {
      final module = lesson10.modules[1];
      expect(module.id, 'lesson10_module2');
      expect(module.title, 'Binomial Coefficients');
      expect(module.order, 1);
      expect(module.algorithmId, isNull);

      final blocks = module.contentBlocks;
      expect(blocks.whereType<DefinitionBlock>().length, greaterThanOrEqualTo(1));
      expect(blocks.whereType<MathBlock>().length, greaterThanOrEqualTo(3));
      expect(blocks.whereType<CodeBlock>().length, greaterThanOrEqualTo(1));
      expect(blocks.whereType<QuizBlock>().length, greaterThanOrEqualTo(3));
      expect(blocks.last, isA<KeyTakeawayBlock>());

      final combined = combinedText(blocks);
      expect(combined.toLowerCase(), contains('binomial'));
      expect(combined.toLowerCase(), contains('pascal'));
      expect(combined.toLowerCase(), contains('overlap'));
      expect(combined, contains(r'\binom{n}{k}'));
    });

    test('Module 3 covers the Knapsack Problem with DP', () {
      final module = lesson10.modules[2];
      expect(module.id, 'lesson10_module3');
      expect(module.title, 'The Knapsack Problem');
      expect(module.order, 2);
      expect(module.algorithmId, 'knapsack');

      final blocks = module.contentBlocks;
      expect(blocks.whereType<DefinitionBlock>().length, greaterThanOrEqualTo(1));
      expect(blocks.whereType<MathBlock>().length, greaterThanOrEqualTo(3));
      expect(blocks.whereType<CodeBlock>().length, greaterThanOrEqualTo(1));
      expect(blocks.whereType<QuizBlock>().length, greaterThanOrEqualTo(3));
      expect(blocks.whereType<VisualizerLinkBlock>().length, 1);
      expect(blocks.last, isA<KeyTakeawayBlock>());

      final combined = combinedText(blocks);
      expect(combined.toLowerCase(), contains('knapsack'));
      expect(combined.toLowerCase(), contains('pseudo-polynomial'));
      expect(combined.toLowerCase(), contains('subproblem'));
    });

    test('Module 4 covers Longest Common Subsequence', () {
      final module = lesson10.modules[3];
      expect(module.id, 'lesson10_module4');
      expect(module.title, 'Longest Common Subsequence');
      expect(module.order, 3);
      expect(module.algorithmId, 'lcs');

      final blocks = module.contentBlocks;
      expect(blocks.whereType<DefinitionBlock>().length, greaterThanOrEqualTo(1));
      expect(blocks.whereType<MathBlock>().length, greaterThanOrEqualTo(1));
      expect(blocks.whereType<CodeBlock>().length, 1);
      expect(blocks.whereType<QuizBlock>().length, greaterThanOrEqualTo(2));
      expect(blocks.whereType<VisualizerLinkBlock>().length, 1);
      expect(blocks.last, isA<KeyTakeawayBlock>());

      final combined = combinedText(blocks).join(' ');
      expect(combined.toLowerCase(), contains('subsequence'));
      expect(combined.toLowerCase(), contains('quadratic'));
      expect(combined.toLowerCase(), contains('backtrace'));
    });

    test('Lesson 10 visible prose keeps formulas out of prose blocks', () {
      final visibleProse = lesson10.modules
          .expand((module) => module.contentBlocks)
          .whereType<TextBlock>()
          .map((b) => b.text)
          .join(' ');
      expect(visibleProse, isNot(contains('O(n')));
      expect(visibleProse, isNot(contains(r'$')));
    });

    test('Lesson 10 prose uses readable math notation', () {
      final combined = lesson10Prose().join('\n');
      expect(combined, isNot(contains('n^2')));
    });

    test('Lesson 10 prose avoids AI punctuation tells', () {
      final combined = lesson10Prose().join('\n');
      expect(combined, isNot(contains('\u2014')));
      expect(combined, isNot(contains(';')));
      expect(combined, isNot(contains(' - ')));
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
        r'\\log_c x = \\frac{\\log_b x}{\\log_b c}',
        semanticsLabel: 'change of base formula',
      );
      expect(block.tex, r'\\log_c x = \\frac{\\log_b x}{\\log_b c}');
      expect(block.semanticsLabel, 'change of base formula');
    });

    test('VisualizerLinkBlock holds visualizer link metadata', () {
      const block = VisualizerLinkBlock(
        algorithmId: 'bubble-sort',
        label: 'Visualize Bubble Sort',
        description: 'Watch adjacent swaps.',
      );
      expect(block.algorithmId, 'bubble-sort');
      expect(block.label, 'Visualize Bubble Sort');
      expect(block.description, 'Watch adjacent swaps.');
    });
  });
}
