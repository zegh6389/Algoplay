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

/// A TeX math formula rendered with flutter_math_fork.
class MathBlock extends ContentBlock {
  final String tex;
  final String semanticsLabel;
  const MathBlock(this.tex, {required this.semanticsLabel});
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
            term: 'Logarithm definition',
            definition:
                'The logarithm asks which exponent makes the base produce the target. '
                'In plain English: what power do we raise the base to so we get x?',
          ),
          MathBlock(
            r'\log_b x = a \iff b^a = x',
            semanticsLabel: 'log base b of x equals a if and only if b to the a equals x',
          ),
          TextBlock(
            'Example: base 2 asks how many times the number 2 must multiply by '
            'itself to reach 8. The log asks the question; the exponent answers '
            'while looking smug.',
          ),
          MathBlock(
            r'\log_2 8 = 3 \text{ because } 2^3 = 8',
            semanticsLabel: 'log base 2 of 8 equals 3 because 2 cubed equals 8',
          ),
          DefinitionBlock(
            term: 'Rule 1: strictly increasing',
            definition:
                'For bases greater than 1, bigger input means bigger logarithm output. '
                'No plot twist, just math behaving.',
          ),
          MathBlock(
            r'b > 1 \text{ and } x < y \implies \log_b x < \log_b y',
            semanticsLabel: 'for b greater than 1 and x less than y, log base b of x is less than log base b of y',
          ),
          DefinitionBlock(
            term: 'Rule 2: inverse rule',
            definition:
                'A logarithm and its matching exponential undo each other, like two '
                'rival wizards agreeing to stop yelling.',
          ),
          MathBlock(
            r'\log_b(b^a) = a',
            semanticsLabel: 'log base b of b to the a equals a',
          ),
          DefinitionBlock(
            term: 'Rule 3: product rule',
            definition:
                'Multiplication inside a logarithm turns into addition outside. '
                'The log is basically a math translator with a clipboard.',
          ),
          MathBlock(
            r'\log_b(xy) = \log_b x + \log_b y',
            semanticsLabel: 'log base b of x times y equals log base b of x plus log base b of y',
          ),
          DefinitionBlock(
            term: 'Rule 4: power rule',
            definition:
                'Powers can be pulled down in front, like a bouncer escorting the '
                'exponent out of the club.',
          ),
          MathBlock(
            r'\log_b(x^a) = a\log_b x',
            semanticsLabel: 'log base b of x to the a equals a times log base b of x',
          ),
          DefinitionBlock(
            term: 'Rule 5: change of base',
            definition:
                'This lets us convert between bases. In algorithm analysis, changing '
                'the base only multiplies by a constant.',
          ),
          MathBlock(
            r'\log_c x = \frac{\log_b x}{\log_b c}',
            semanticsLabel: 'log base c of x equals log base b of x divided by log base b of c',
          ),
          TextBlock(
            'That last rule is why algorithm books often write just log n '
            'without naming the base. The base changes the scale by a constant, '
            'not the growth-family drama.',
          ),
          MathBlock(
            r'\log_c x = \frac{1}{\log_b c}\log_b x = k\log_b x',
            semanticsLabel: 'log base c of x equals one over log base b of c times log base b of x equals k times log base b of x',
          ),
          DefinitionBlock(
            term: 'Binary logarithm',
            definition:
                'The notation lg is shorthand for base 2 logarithm. Computer science '
                'loves base 2 because computers speak in bits, powers of two, and '
                'the occasional screaming fan noise.',
          ),
          MathBlock(
            r'\lg x = \log_2 x',
            semanticsLabel: 'lg x equals log base 2 of x',
          ),
          TextBlock(
            'Why do we care? Because logs appear whenever a problem keeps '
            'getting cut down by a constant factor: binary search halves the '
            'search space, balanced trees split paths, and divide-and-conquer '
            'keeps chopping the monster into smaller monsters.',
          ),
          CodeBlock(
            'binary search on 16 items: 16 -> 8 -> 4 -> 2 -> 1\n'
            'that is 4 cuts',
            language: 'text',
          ),
          MathBlock(
            r'\log_2 16 = 4',
            semanticsLabel: 'log base 2 of 16 equals 4',
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
                'Change of base gives a constant multiple between logarithm bases. '
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

      // Module 4: "The 6-Step Recipe to Solve Any Problem"
      ModuleContent(
        id: 'lesson1_module4',
        title: 'The 6-Step Recipe to Solve Any Problem',
        order: 3,
        algorithmId: null,
        contentBlocks: [
          TextBlock(
            'Before anyone touches the keyboard, we need the algorithmic '
            'equivalent of reading the recipe. Levitin gives us six steps for '
            'solving problems without accidentally building a spaghetti cannon.',
          ),
          DefinitionBlock(
            term: 'Step 1: Understand the Problem',
            definition:
                'Ask what we have, what we need, and what weird edge cases are '
                'lurking in the bushes. Solving the wrong problem beautifully is '
                'still wrong — like delivering a peanut-butter sandwich to someone '
                'with a peanut allergy.',
          ),
          DefinitionBlock(
            term: 'Step 2: Pick the Right Techniques',
            definition:
                'Choose the tools: list, tree, graph, sorting idea, divide and '
                'conquer, or something else. We do not bring a rocket launcher to '
                'swat a mosquito, even if the rocket launcher has nice branding.',
          ),
          DefinitionBlock(
            term: 'Step 3: Design the Algorithm',
            definition:
                'Sketch the plan in words, boxes, arrows, or tiny battle maps. '
                'No code yet. Paper is cheap; debugging 200 lines at 2 AM is not.',
          ),
          DefinitionBlock(
            term: 'Step 4: Prove It Works',
            definition:
                'Run the plan through your brain before letting the computer '
                'suffer. Try small inputs, empty inputs, and suspicious goblin '
                'cases. If the idea fails here, fix it while the mistake is cheap.',
          ),
          DefinitionBlock(
            term: 'Step 5: Analyze the Algorithm',
            definition:
                'Ask how much work it does and how much memory it eats. If the '
                'design is too slow or too hungry, loop back and redesign. That '
                'backward arrow is not failure; it is professional wizardry.',
          ),
          DefinitionBlock(
            term: 'Step 6: Code the Algorithm',
            definition:
                'Finally, the keyboard gets invited to the party. Because we '
                'already understand, designed, proved, and analyzed the plan, '
                'coding becomes translation instead of panic typing.',
          ),
          TextBlock(
            'Feedback Loops matter. Real problem solving is not a straight '
            'slide; it is GPS yelling "recalculating" after every bad turn. '
            'We may jump from analysis back to design, or from proof back to '
            'understanding. Smart builders loop. Chaos builders just commit bugs.',
          ),
          QuizBlock(
            question: 'In Levitin\'s six-step problem-solving process, when should we write the code?',
            options: [
              'Immediately, before thinking, for maximum keyboard thunder.',
              'After understanding, choosing techniques, designing, proving, and analyzing.',
              'Only after the algorithm has been posted on social media.',
              'Before defining the input and output.',
            ],
            correctIndex: 1,
            explanation:
                'Code is Step 6. The first five steps make sure we are solving '
                'the right problem with a plan that works and is worth implementing.',
          ),
          KeyTakeawayBlock(
            'The keyboard is the final tool, not the starting pistol. Understand, '
            'choose techniques, design, prove, analyze, then code. Plan first; '
            'your future self gets fewer 2 AM emergencies.',
          ),
        ],
      ),

      // Module 5: "What Makes a Good Algorithm?"
      ModuleContent(
        id: 'lesson1_module5',
        title: 'What Makes a Good Algorithm?',
        order: 4,
        algorithmId: null,
        contentBlocks: [
          TextBlock(
            'Not every algorithm deserves a trophy. Some are chocolate cake: '
            'fast, clean, correct, and suspiciously delicious. Others are burnt '
            'cake that took five hours and still tastes like printer toner. '
            'Baase and Van Gelder give us five ways to judge the recipe.',
          ),
          DefinitionBlock(
            term: 'Correctness',
            definition:
                'The algorithm must do exactly what it promises. Preconditions '
                'say what must be true before we start; Postconditions say what '
                'must be true when we finish. One counterexample can prove a '
                'recipe is broken. Proving it always works takes real evidence.',
          ),
          DefinitionBlock(
            term: 'Efficiency',
            definition:
                'Also called the amount of work done. We do not trust wall-clock '
                'time because different machines are different kitchens. Instead '
                'we count basic operations and ask how the work grows as input '
                'gets bigger. Yes, Big-O is waiting in the hallway.',
          ),
          DefinitionBlock(
            term: 'Space Usage',
            definition:
                'Algorithms need room for input, instructions, and temporary '
                'scratch work. An array is like neat containers in a row; a linked '
                'list is a scavenger hunt of pointers. Storage choices matter.',
          ),
          DefinitionBlock(
            term: 'Simplicity',
            definition:
                'A simple algorithm is easier to understand, code, test, and fix. '
                'If the plan needs 47 timers and a ceremonial hat, bugs will find '
                'rent-free apartments inside it.',
          ),
          DefinitionBlock(
            term: 'Optimality',
            definition:
                'An optimal algorithm is not merely good; it matches the best '
                'possible performance. To prove that, we show a lower bound — the '
                'minimum work any algorithm must do — and then match it.',
          ),
          TextBlock(
            'Our main focus will be efficiency because it is measurable and '
            'useful for comparing algorithms. But here is the giant neon warning: '
            'a fast wrong answer is still wrong. Correctness always comes first.',
          ),
          QuizBlock(
            question: 'Which criterion asks whether an algorithm is the best possible, not just pretty good?',
            options: [
              'Simplicity',
              'Space Usage',
              'Optimality',
              'Postconditions',
            ],
            correctIndex: 2,
            explanation:
                'Optimality means the algorithm matches a proven lower bound, so '
                'no algorithm can asymptotically beat it for that problem model.',
          ),
          KeyTakeawayBlock(
            'Judge algorithms by correctness, efficiency, space usage, simplicity, '
            'and optimality. We will obsess over efficiency soon, but never crown '
            'a fast algorithm if it answers the wrong question.',
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
