// ═══════════════════════════════════════════════════════════════════════════════
/// Lesson content data models and the master lesson list for the learn feature.
// ═══════════════════════════════════════════════════════════════════════════════

import 'package:flutter/foundation.dart' show immutable;

// ── Content blocks (sealed class hierarchy) ─────────────────────────────────

/// Base type for all content blocks displayed inside a lesson module.
///
/// Subclasses represent different content types: plain text, code snippets,
/// term definitions, key takeaway callouts, and interactive quizzes.
sealed class ContentBlock {
  const ContentBlock();
}

/// A paragraph of rich text (markdown-friendly).
class TextBlock extends ContentBlock {
  final String text;
  const TextBlock(this.text);
}

/// A code listing with optional syntax-highlighting language hint.
class CodeBlock extends ContentBlock {
  final String code;
  final String language;
  const CodeBlock(this.code, {this.language = 'dart'});
}

/// A highlighted term / definition card (lightbulb style).
class DefinitionBlock extends ContentBlock {
  final String term;
  final String definition;
  const DefinitionBlock({required this.term, required this.definition});
}

/// An important callout that appears at the end of a section.
class KeyTakeawayBlock extends ContentBlock {
  final String text;
  const KeyTakeawayBlock(this.text);
}

/// A multiple-choice quiz embedded in the lesson content.
class QuizBlock extends ContentBlock {
  final String question;
  final List<String> options;
  final int correctIndex;
  final String explanation;

  const QuizBlock({
    required this.question,
    required this.options,
    required this.correctIndex,
    required this.explanation,
  });
}

// ── Module model ─────────────────────────────────────────────────────────────

/// A single sub-module within a lesson (e.g. "So… What's an Algorithm?").
@immutable
class ModuleContent {
  /// Unique identifier, e.g. `"lesson1_module1"`.
  final String id;

  /// Human-readable module title.
  final String title;

  /// Ordered content blocks for this module.
  final List<ContentBlock> contentBlocks;

  /// Optional algorithm ID that links this module to the visualizer.
  /// When non-null, the "Visualize ✨" button will launch this algorithm.
  final String? algorithmId;

  /// Sort order within the parent lesson (0-based).
  final int order;

  const ModuleContent({
    required this.id,
    required this.title,
    required this.contentBlocks,
    this.algorithmId,
    required this.order,
  });
}

// ── Lesson model ─────────────────────────────────────────────────────────────

/// Top-level lesson container (1 of 12 in the curriculum).
@immutable
class LessonContent {
  /// Lesson number (1–12).
  final int id;

  /// Human-readable lesson title.
  final String title;

  /// Sub-modules for this lesson.
  final List<ModuleContent> modules;

  /// Category accent colour as a hex string, e.g. `"#3B82F6"`.
  final String categoryColor;

  const LessonContent({
    required this.id,
    required this.title,
    required this.modules,
    required this.categoryColor,
  });
}

// ── Master lesson list ───────────────────────────────────────────────────────

const List<LessonContent> lessons = [
  // ── Lesson 1 (fully populated) ────────────────────────────────────────────
  LessonContent(
    id: 1,
    title: 'Introduction',
    categoryColor: '#3B82F6',
    modules: [
      // Module 1: "So… What's an Algorithm?"
      ModuleContent(
        id: 'lesson1_module1',
        title: "So… What's an Algorithm?",
        order: 0,
        algorithmId: null,
        contentBlocks: [
          TextBlock(
            "Let's talk about chocolate cake. You want one. You need one. "
            "But you can't just yell \"CAKE!\" into the void and expect results. "
            "You need ingredients and a plan: crack eggs, melt chocolate, mix, "
            "pour, bake at 180°C for 25 minutes.",
          ),
          TextBlock("That plan? That's an algorithm."),
          DefinitionBlock(
            term: 'Algorithm',
            definition:
                'A finite sequence of well-defined instructions to accomplish '
                'a specific task.',
          ),
          TextBlock(
            "Think of it this way: every recipe is an algorithm. Every set of "
            "directions from Google Maps is an algorithm. Even your morning "
            "routine (wake up → groan → coffee → function) is technically an "
            "algorithm.",
          ),
          TextBlock(
            "But here's where it gets interesting. Not all chocolate cakes are "
            "created equal. Some taste like heaven. Some taste like cardboard "
            "with frosting. Some take 20 minutes, some take 4 hours and three "
            "sinks full of dishes.",
          ),
          TextBlock(
            "Same goes for algorithms. There's usually more than one way to "
            "solve a problem, and some solutions are just… better. Faster. "
            "More elegant. Cheaper to run.",
          ),
          KeyTakeawayBlock(
            "An algorithm is just a recipe for a computer. But unlike cooking, "
            "we can precisely measure which recipe is better using math. That's "
            "what this whole course is about.",
          ),
        ],
      ),

      // Module 2: "Formally Speaking…"
      ModuleContent(
        id: 'lesson1_module2',
        title: 'Formally Speaking…',
        order: 1,
        algorithmId: null,
        contentBlocks: [
          TextBlock(
            'We threw the word "algorithm" around casually, but computer '
            'scientists have a strict definition:',
          ),
          DefinitionBlock(
            term: 'Algorithm (formal)',
            definition:
                'A series of instructions designed to accomplish a specific task.',
          ),
          TextBlock(
            "Sounds simple, right? But buried in that definition are five "
            "crucial properties every algorithm must have:",
          ),
          DefinitionBlock(
            term: '1. Input',
            definition: 'Zero or more inputs. (A recipe needs ingredients.)',
          ),
          DefinitionBlock(
            term: '2. Output',
            definition:
                "At least one output. (No point baking if there's no cake.)",
          ),
          DefinitionBlock(
            term: '3. Definiteness',
            definition:
                'Each step is crystal clear. No "add some salt" vagueness.',
          ),
          DefinitionBlock(
            term: '4. Finiteness',
            definition:
                "It actually stops. An infinite loop is a bug, not an algorithm.",
          ),
          DefinitionBlock(
            term: '5. Effectiveness',
            definition:
                "Every step is doable. \"Teleport the cake into the oven\" "
                "doesn't count.",
          ),
          TextBlock(
            "Violate any of these, and you don't have an algorithm. You have "
            "a wish.",
          ),
          TextBlock(
            "Fun fact: The word \"algorithm\" comes from Muhammad ibn Musa "
            "al-Khwarizmi, a 9th-century Persian mathematician. His name was "
            "Latinized to \"Algoritmi.\" So every time you sort an array, "
            "you're honoring a mathematician from Baghdad. Respect.",
          ),
          KeyTakeawayBlock(
            "An algorithm must be definite, finite, effective, and produce "
            "output from input. If your \"algorithm\" runs forever, it's not "
            "an algorithm — it's a screensaver.",
          ),
        ],
      ),

      // Module 3: "Logarithms: The Shrinking Spell"
      ModuleContent(
        id: 'lesson1_module3',
        title: 'Logarithms: The Shrinking Spell',
        order: 2,
        algorithmId: null,
        contentBlocks: [
          TextBlock(
            'Quick side quest before we start measuring algorithms like tiny '
            'speed demons: Levitin Section 1.4 reviews the background gear — '
            'data structures, graphs, trees, sets, and dictionaries. If any '
            'of those sound like mysterious forest creatures, flag it on the '
            'Discussion Board. We need that toolbox soon.',
          ),
          TextBlock(
            'Now for the math goblin that keeps showing up in computer '
            'science: logarithms. Do not panic. A logarithm is just an exponent '
            'wearing a fake mustache.',
          ),
          DefinitionBlock(
            term: 'log_b x',
            definition:
                'The real number a such that b^a = x. In plain English: '
                '"what power do we raise b to so we get x?"',
          ),
          TextBlock(
            'Example: log_2 8 = 3 because 2^3 = 8. The log asks the question; '
            'the exponent answers while looking smug.',
          ),
          DefinitionBlock(
            term: 'Rule 1: strictly increasing',
            definition:
                'For b > 1, log_b is a strictly increasing function. Bigger '
                'input means bigger log output. No plot twist, just math behaving.',
          ),
          DefinitionBlock(
            term: 'Rule 2: inverse rule',
            definition:
                'log_b(b^a) = a. The log and exponent cancel like two rival '
                'wizards agreeing to stop yelling.',
          ),
          DefinitionBlock(
            term: 'Rule 3: product rule',
            definition:
                'log_b(xy) = log_b x + log_b y. Multiplication inside the log '
                'turns into addition outside.',
          ),
          DefinitionBlock(
            term: 'Rule 4: power rule',
            definition:
                'log_b(x^a) = a log_b x. Powers can be pulled down in front, '
                'like a bouncer escorting the exponent out of the club.',
          ),
          DefinitionBlock(
            term: 'Rule 5: change of base',
            definition:
                'log_c x = log_b x / log_b c. This lets us convert between '
                'bases. In algorithm analysis, changing the base only multiplies '
                'by a constant.',
          ),
          TextBlock(
            'That last rule is why algorithm books often write just log n '
            'without naming the base. If log_c x = (1 / log_b c) log_b x, then '
            'log_c x = k log_b x for some constant k. The base changes the '
            'scale, not the growth-family drama.',
          ),
          DefinitionBlock(
            term: 'lg x',
            definition:
                'Shorthand for log_2 x. Computer science loves base 2 because '
                'computers speak in bits, powers of two, and the occasional '
                'screaming fan noise.',
          ),
          TextBlock(
            'Why do we care? Because logs appear whenever a problem keeps '
            'getting cut down by a constant factor: binary search halves the '
            'search space, balanced trees split paths, and divide-and-conquer '
            'keeps chopping the monster into smaller monsters.',
          ),
          CodeBlock(
            'binary search on 16 items: 16 -> 8 -> 4 -> 2 -> 1\n'
            'that is 4 cuts, and log_2 16 = 4',
            language: 'text',
          ),
          QuizBlock(
            question: 'Why can algorithm analysis usually write log n without specifying the base?',
            options: [
              'Because all logarithms are exactly equal.',
              'Because change of base only changes the value by a constant factor.',
              'Because computers refuse to calculate other bases.',
              'Because logarithms are optional decorative math confetti.',
            ],
            correctIndex: 1,
            explanation:
                'Change of base gives log_c n = k log_b n for a constant k. '
                'Asymptotic analysis usually ignores constant multipliers, so '
                'the base does not change the growth class.',
          ),
          KeyTakeawayBlock(
            'Logarithms answer "what exponent?" In CS, lg means base 2, and '
            'plain log usually means "base does not matter for growth" because '
            'change of base only adds a constant multiplier. Tiny formula, huge '
            'algorithm-analysis energy.',
          ),
        ],
      ),
    ],
  ),

  // ── Lesson 2 (stub) ───────────────────────────────────────────────────────
  LessonContent(
    id: 2,
    title: 'Algorithm Analysis',
    categoryColor: '#F43F5E',
    modules: [],
  ),

  // ── Lesson 3 (stub) ───────────────────────────────────────────────────────
  LessonContent(
    id: 3,
    title: 'Recurrence Relations',
    categoryColor: '#8B5CF6',
    modules: [],
  ),

  // ── Lesson 4 (stub) ───────────────────────────────────────────────────────
  LessonContent(
    id: 4,
    title: 'Brute Force Algorithms',
    categoryColor: '#0EA5E9',
    modules: [],
  ),

  // ── Lesson 5 (stub) ───────────────────────────────────────────────────────
  LessonContent(
    id: 5,
    title: 'DFS and BFS',
    categoryColor: '#10B981',
    modules: [],
  ),

  // ── Lesson 6 (stub) ───────────────────────────────────────────────────────
  LessonContent(
    id: 6,
    title: 'Decrease and Conquer',
    categoryColor: '#0EA5E9',
    modules: [],
  ),

  // ── Lesson 7 (stub) ───────────────────────────────────────────────────────
  LessonContent(
    id: 7,
    title: 'Divide and Conquer',
    categoryColor: '#F43F5E',
    modules: [],
  ),

  // ── Lesson 8 (stub) ───────────────────────────────────────────────────────
  LessonContent(
    id: 8,
    title: 'Transform and Conquer Pt.1',
    categoryColor: '#F97316',
    modules: [],
  ),

  // ── Lesson 9 (stub) ───────────────────────────────────────────────────────
  LessonContent(
    id: 9,
    title: 'Transform and Conquer Pt.2',
    categoryColor: '#F97316',
    modules: [],
  ),

  // ── Lesson 10 (stub) ──────────────────────────────────────────────────────
  LessonContent(
    id: 10,
    title: 'Dynamic Programming',
    categoryColor: '#8B5CF6',
    modules: [],
  ),

  // ── Lesson 11 (stub) ──────────────────────────────────────────────────────
  LessonContent(
    id: 11,
    title: 'Greedy Algorithms',
    categoryColor: '#F59E0B',
    modules: [],
  ),

  // ── Lesson 12 (stub) ──────────────────────────────────────────────────────
  LessonContent(
    id: 12,
    title: 'Advanced Topics',
    categoryColor: '#10B981',
    modules: [],
  ),
];
