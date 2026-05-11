// ═══════════════════════════════════════════════════════════════════════════════
/// Lesson content data models and the master lesson list for the learn feature.
// ═══════════════════════════════════════════════════════════════════════════════

import 'package:flutter/foundation.dart' show immutable;

// ── Content blocks (sealed class hierarchy) ─────────────────────────────────

/// Base type for all content blocks displayed inside a lesson module.
///
/// Subclasses represent different content types: plain text, code snippets,
/// term definitions, key takeaway callouts, and interactive quizzes.
class GraphBlock extends ContentBlock {
  /// 'bigO' | 'bigOmega' | 'bigTheta'
  final String type;
  const GraphBlock(this.type);
}

/// Inline callout that opens a matching algorithm visualization.
class VisualizerLinkBlock extends ContentBlock {
  final String algorithmId;
  final String label;
  final String? description;

  const VisualizerLinkBlock({
    required this.algorithmId,
    required this.label,
    this.description,
  });
}

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
            "directions from Google Maps is an algorithm. Even a morning "
            "routine has ordered steps, though it is not written for a computer.",
          ),
          TextBlock(
            "But here is where it gets useful. Not all chocolate cake recipes are "
            "equally good. Some are clear, fast, and reliable. Others waste time "
            "or leave too much room for mistakes.",
          ),
          TextBlock(
            "Same goes for algorithms. There's usually more than one way to "
            "solve a problem, and some solutions are just… better. Faster. "
            "More elegant. Cheaper to run.",
          ),
          KeyTakeawayBlock(
            "An algorithm is a recipe for solving a problem. In computer science, "
            "we can compare those recipes with math. That is the main habit this "
            "course will build.",
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
            "The definition sounds simple, but it carries five properties every "
            "algorithm must have:",
          ),
          DefinitionBlock(
            term: '1. Input',
            definition:
                'Zero or more inputs. A recipe needs ingredients, and an algorithm may need data.',
          ),
          DefinitionBlock(
            term: '2. Output',
            definition:
                "At least one output. A procedure should produce some result.",
          ),
          DefinitionBlock(
            term: '3. Definiteness',
            definition: 'Each step is clear enough to follow without guessing.',
          ),
          DefinitionBlock(
            term: '4. Finiteness',
            definition:
                "It actually stops. An infinite loop is a bug, not an algorithm.",
          ),
          DefinitionBlock(
            term: '5. Effectiveness',
            definition:
                'Every step is basic enough that a real machine or person can carry it out.',
          ),
          TextBlock(
            "If a procedure misses any of these properties, it is not a complete "
            "algorithm yet.",
          ),
          TextBlock(
            "The word \"algorithm\" comes from Muhammad ibn Musa al-Khwarizmi, "
            "a 9th-century Persian mathematician. His name was Latinized to "
            "\"Algoritmi.\" The history is a useful reminder that algorithms "
            "are older than computers.",
          ),
          KeyTakeawayBlock(
            'An algorithm must accept the required input, produce output, use clear '
            'steps, eventually stop, and rely on operations that can actually be done.',
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
            'Before we measure algorithms, Levitin Section 1.4 reviews the tools '
            'we will rely on: data structures, graphs, trees, sets, and dictionaries. '
            'If any of those are unfamiliar, flag them on the Discussion Board. '
            'We will use that toolbox soon.',
          ),
          TextBlock(
            'Now for logarithms, which appear constantly in computer science. A '
            'logarithm is the exponent needed to reach a value from a given base. '
            'That is the whole idea.',
          ),
          DefinitionBlock(
            term: 'Logarithm definition',
            definition:
                'The logarithm asks which exponent makes the base produce the target. '
                'In plain English: what power do we raise the base to so we get x?',
          ),
          MathBlock(
            r'\log_b x = a \iff b^a = x',
            semanticsLabel:
                'log base b of x equals a if and only if b to the a equals x',
          ),
          TextBlock(
            'Example: base 2 asks how many times the number 2 must multiply by '
            'itself to reach 8. The logarithm asks the question. The exponent '
            'gives the answer.',
          ),
          MathBlock(
            r'\log_2 8 = 3 \text{ because } 2^3 = 8',
            semanticsLabel: 'log base 2 of 8 equals 3 because 2 cubed equals 8',
          ),
          DefinitionBlock(
            term: 'Rule 1: strictly increasing',
            definition:
                'For bases greater than 1, bigger input means bigger logarithm output.',
          ),
          MathBlock(
            r'b > 1 \text{ and } x < y \implies \log_b x < \log_b y',
            semanticsLabel:
                'for b greater than 1 and x less than y, log base b of x is less than log base b of y',
          ),
          DefinitionBlock(
            term: 'Rule 2: inverse rule',
            definition:
                'A logarithm and its matching exponential undo each other.',
          ),
          MathBlock(
            r'\log_b(b^a) = a',
            semanticsLabel: 'log base b of b to the a equals a',
          ),
          DefinitionBlock(
            term: 'Rule 3: product rule',
            definition:
                'Multiplication inside a logarithm turns into addition outside.',
          ),
          MathBlock(
            r'\log_b(xy) = \log_b x + \log_b y',
            semanticsLabel:
                'log base b of x times y equals log base b of x plus log base b of y',
          ),
          DefinitionBlock(
            term: 'Rule 4: power rule',
            definition: 'Powers can be pulled down in front as a multiplier.',
          ),
          MathBlock(
            r'\log_b(x^a) = a\log_b x',
            semanticsLabel:
                'log base b of x to the a equals a times log base b of x',
          ),
          DefinitionBlock(
            term: 'Rule 5: change of base',
            definition:
                'This lets us convert between bases. In algorithm analysis, changing '
                'the base only multiplies by a constant.',
          ),
          MathBlock(
            r'\log_c x = \frac{\log_b x}{\log_b c}',
            semanticsLabel:
                'log base c of x equals log base b of x divided by log base b of c',
          ),
          TextBlock(
            'That last rule is why algorithm books often write just log n '
            'without naming the base. The base changes the scale by a constant, '
            'not the growth category.',
          ),
          MathBlock(
            r'\log_c x = \frac{1}{\log_b c}\log_b x = k\log_b x',
            semanticsLabel:
                'log base c of x equals one over log base b of c times log base b of x equals k times log base b of x',
          ),
          DefinitionBlock(
            term: 'Binary logarithm',
            definition:
                'The notation lg is shorthand for base 2 logarithm. Computer science '
                'uses base 2 often because computers store information in bits and '
                'powers of two appear everywhere.',
          ),
          MathBlock(
            r'\lg x = \log_2 x',
            semanticsLabel: 'lg x equals log base 2 of x',
          ),
          TextBlock(
            'Why do we care? Because logs appear whenever a problem keeps '
            'getting cut down by a constant factor: binary search halves the '
            'search space, balanced trees split paths, and divide-and-conquer '
            'keeps reducing a problem into smaller problems.',
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
            question:
                'Why can algorithm analysis usually write log n without specifying the base?',
            options: [
              'Because all logarithms are exactly equal.',
              'Because change of base only changes the value by a constant factor.',
              'Because computers refuse to calculate other bases.',
              'Because logarithm bases are never part of algorithm analysis.',
            ],
            correctIndex: 1,
            explanation:
                'Change of base gives a constant multiple between logarithm bases. '
                'Asymptotic analysis usually ignores constant multipliers, so '
                'the base does not change the growth class.',
          ),
          KeyTakeawayBlock(
            'Logarithms answer "what exponent?" In CS, lg means base 2. '
            'Plain log usually means the base does not matter for growth, because '
            'change of base only adds a constant multiplier. This is one reason '
            'logarithms matter so much in algorithm analysis.',
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
            'solving problems in a disciplined order.',
          ),
          DefinitionBlock(
            term: 'Step 1: Understand the Problem',
            definition:
                'Ask what we have, what we need, and which edge cases might break '
                'the plan. Solving the wrong problem beautifully is still wrong.',
          ),
          DefinitionBlock(
            term: 'Step 2: Pick the Right Techniques',
            definition:
                'Choose the tools: list, tree, graph, sorting idea, divide and '
                'conquer, or something else. The technique should match the problem.',
          ),
          DefinitionBlock(
            term: 'Step 3: Design the Algorithm',
            definition:
                'Sketch the plan in words, boxes, or arrows. No code yet. It is '
                'usually cheaper to fix an idea before it becomes source code.',
          ),
          DefinitionBlock(
            term: 'Step 4: Prove It Works',
            definition:
                'Test the idea before implementing it. Try small inputs, empty inputs, '
                'and boundary cases. If the idea fails here, fix it while the mistake is cheap.',
          ),
          DefinitionBlock(
            term: 'Step 5: Analyze the Algorithm',
            definition:
                'Ask how much work it does and how much memory it eats. If the '
                'design is too slow or uses too much memory, loop back and redesign. '
                'That loop is part of the process.',
          ),
          DefinitionBlock(
            term: 'Step 6: Code the Algorithm',
            definition:
                'Finally, write the code. Because we already understand, designed, '
                'proved, and analyzed the plan, coding becomes translation instead '
                'of guesswork.',
          ),
          TextBlock(
            'Feedback loops matter. Real problem solving is not a straight '
            'line. We may jump from analysis back to design, or from proof back to '
            'understanding. Good problem solving allows those feedback loops.',
          ),
          QuizBlock(
            question:
                'In Levitin\'s six-step problem-solving process, when should we write the code?',
            options: [
              'Immediately, before defining the problem clearly.',
              'After understanding, choosing techniques, designing, proving, and analyzing.',
              'Only after someone else writes it first.',
              'Before defining the input and output.',
            ],
            correctIndex: 1,
            explanation:
                'Code is Step 6. The first five steps make sure we are solving '
                'the right problem with a plan that works and is worth implementing.',
          ),
          KeyTakeawayBlock(
            'The keyboard is the final tool, not the starting pistol. Understand, '
            'choose techniques, design, prove, analyze, then code. Plan first. '
            'This saves time and prevents many avoidable bugs.',
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
            'Not every algorithm is equally good. Some are correct, efficient, and '
            'simple to understand. Others solve the problem but waste time, memory, '
            'or attention. Baase and Van Gelder give us five ways to judge the design.',
          ),
          DefinitionBlock(
            term: 'Correctness',
            definition:
                'The algorithm must do exactly what it promises. Preconditions '
                'say what must be true before we start. Postconditions say what '
                'must be true when we finish. One counterexample can prove a '
                'recipe is broken. Proving it always works takes real evidence.',
          ),
          DefinitionBlock(
            term: 'Efficiency',
            definition:
                'Also called the amount of work done. We do not trust wall-clock '
                'time because different machines can give different measurements. Instead '
                'we count basic operations and ask how the work grows as input '
                'gets bigger. This leads directly to Big-O notation.',
          ),
          DefinitionBlock(
            term: 'Space Usage',
            definition:
                'Algorithms need room for input, instructions, and temporary '
                'scratch work. Arrays and linked lists organize memory differently, '
                'so storage choices matter.',
          ),
          DefinitionBlock(
            term: 'Simplicity',
            definition:
                'A simple algorithm is easier to understand, code, test, and fix. '
                'If the plan is hard to explain, it is usually harder to implement correctly.',
          ),
          DefinitionBlock(
            term: 'Optimality',
            definition:
                'An optimal algorithm is not merely good. It matches the best '
                'possible performance. To prove that, we show a lower bound, meaning '
                'the minimum work any algorithm must do, and then match it.',
          ),
          TextBlock(
            'Our main focus will be efficiency because it is measurable and '
            'useful for comparing algorithms. But a fast wrong answer is still wrong. '
            'Correctness always comes first.',
          ),
          QuizBlock(
            question:
                'Which criterion asks whether an algorithm is the best possible, not just pretty good?',
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

  // ── Lesson 2: Algorithm Analysis ─────────────────────────────────────────
  LessonContent(
    id: 2,
    title: 'Algorithm Analysis',
    categoryColor: '#F43F5E',
    modules: [
      ModuleContent(
        id: 'lesson2_module1',
        title: 'Counting Steps Without a Stopwatch',
        order: 0,
        algorithmId: null,
        contentBlocks: [
          TextBlock(
            'The shape of growth is not just theory. It shows up in real data. '
            'T.A. Standish ran Selection Sort on two different computers as the '
            'input grew and recorded the running times in seconds.',
          ),
          CodeBlock(
            'n    | Home PC | Desktop PC\n'
            '-----+---------+-----------\n'
            '125  |   12.5  |     2.8\n'
            '250  |   49.3  |    11.0\n'
            '500  |  195.8  |    43.4\n'
            '1000 |  780.3  |   172.9\n'
            '2000 | 3114.9  |   690.5',
            language: 'text',
          ),
          TextBlock(
            'Different machines, different speeds, different compilers. But when '
            'you fit curves to this data you get the same shape both times: '
            'quadratic, roughly an n² term dominates. The home computer '
            'curve might be 0.00078n² and the desktop might be 0.00017n², '
            'different coefficients, same shape. This is why we study '
            'growth patterns instead of stopwatch times. The shape is the signal: '
            'the coefficients are noise.',
          ),
          TextBlock(
            'Two algorithms can solve the same problem but behave very differently '
            'as the input grows. One algorithm might take n + 2 steps. Another '
            'might take 5n + 1 steps. Surprisingly, that difference of a few extra '
            'steps per item is often irrelevant. What matters is the shape of the '
            'growth, whether the work grows linearly with the input, or faster, '
            'or slower. This lens is called the rate of growth, and it is the core '
            'idea that ties together everything in algorithm analysis.',
          ),
          TextBlock(
            'Sequential search grows linearly: double the list, double the work. '
            'Selection Sort grows quadratically: double the list, four times the '
            'work. Classifying algorithms by how they grow tells us which ones '
            'stay useful when problems get large.',
          ),
          DefinitionBlock(
            term: 'Input size',
            definition:
                'The number n that measures how big the problem is. For a list, '
                'n is usually the number of items. For a graph, it might be '
                'vertices, edges, or both.',
          ),
          MathBlock(
            r'n = \text{number of items in the input}',
            semanticsLabel: 'n equals the number of items in the input',
          ),
          DefinitionBlock(
            term: 'Running time',
            definition:
                'A function that describes how many steps an algorithm takes as '
                'the input size grows. We write it as T of n because math likes '
                'wearing a tiny lab coat.',
          ),
          MathBlock(
            r'T(n) = \text{number of basic operations for input size } n',
            semanticsLabel:
                'T of n equals the number of basic operations for input size n',
          ),
          DefinitionBlock(
            term: 'Basic operation',
            definition:
                'The operation we count because it happens the most or controls '
                'the cost. It might be a comparison, an assignment, or one loop '
                'body doing its little treadmill dance.',
          ),
          TextBlock(
            'Imagine scanning a list to find a lost cookie. The basic operation '
            'is checking one item. If the list doubles, the cookie patrol may '
            'have twice as many items to inspect. That is the kind of growth we '
            'care about.',
          ),
          CodeBlock(
            'for each item in list:\n'
            '  check whether item is the target',
            language: 'text',
          ),
          TextBlock(
            'Sometimes we can write an exact count. Maybe an algorithm does two '
            'operations per item, then three extra setup steps. That gives us a '
            'clean little formula. The formula is not the whole personality of '
            'the algorithm, but it tells us how the work grows.',
          ),
          MathBlock(
            r'T(n) = 2n + 3',
            semanticsLabel: 'T of n equals two n plus three',
          ),
          TextBlock(
            'For small inputs, the extra three steps might feel important. For '
            'huge inputs, the 2n part drives the bus while the plus 3 sits in '
            'the back eating chips.',
          ),
          QuizBlock(
            question:
                'Why do we count basic operations instead of trusting stopwatch time?',
            options: [
              'Because real machines add noise that hides the growth pattern.',
              'Because stopwatches are illegal in computer science.',
              'Because T(n) only works on cake recipes.',
              'Because input size never matters.',
            ],
            correctIndex: 0,
            explanation:
                'Stopwatch time depends on hardware and runtime noise. Counting '
                'basic operations lets us study how the algorithm grows with n.',
          ),
          KeyTakeawayBlock(
            'Algorithm analysis studies T(n), the work done as input size n '
            'grows. Pick a basic operation, count it, and the fog starts clearing.',
          ),
        ],
      ),
      ModuleContent(
        id: 'lesson2_module2',
        title: 'Intuitive Explanation of Order of Growth',
        order: 1,
        algorithmId: 'selection-sort',
        contentBlocks: [
          TextBlock(
            'Before formal Big-O, Big-Omega, and Big-Theta feel natural, it helps to look at the idea through data. Selection Sort gives a clean example because the same algorithm can run on different machines while keeping the same growth shape.',
          ),
          DefinitionBlock(
            term: 'Order of growth',
            definition:
                'The long-run trend of T(n) as input size grows. It asks whether the work behaves roughly like n, n log n, n², 2ⁿ, or another growth pattern.',
          ),
          TextBlock(
            'Exact seconds change with hardware, language, compiler, and runtime details. A faster machine may finish earlier, but the curve can still bend in the same way. That curve shape is the part algorithm analysis tries to capture.',
          ),
          CodeBlock(
            'n    | Home PC | Desktop PC\n'
            '-----+---------+-----------\n'
            '125  |   12.5  |     2.8\n'
            '250  |   49.3  |    11.0\n'
            '500  |  195.8  |    43.4\n'
            '1000 |  780.3  |   172.9\n'
            '2000 | 3114.9  |   690.5',
            language: 'text',
          ),
          TextBlock(
            'Look at what happens when n doubles from 125 to 250, then 250 to 500, then 500 to 1000. The running time becomes about four times larger on both computers. That is the fingerprint of quadratic growth.',
          ),
          MathBlock(
            r'(2n)^2 = 4n^2',
            semanticsLabel:
                'doubling n in a quadratic expression multiplies the value by four',
          ),
          TextBlock(
            'Curve fitting tells the same story. One computer may fit a formula close to 0.0007772n² + 0.00305n + 0.001. Another may fit 0.0001724n² + 0.00040n + 0.100. The coefficients differ, but both formulas are quadratic.',
          ),
          DefinitionBlock(
            term: 'Dominant term',
            definition:
                'The part of a running-time formula that controls growth for large n. In a quadratic formula, the n² term eventually dominates the linear and constant terms.',
          ),
          MathBlock(
            r'f(n) = an^2 + bn + c',
            semanticsLabel: 'f of n equals a n squared plus b n plus c',
          ),
          TextBlock(
            'This is why constants and lower-order terms matter less as inputs grow. They can affect small cases, and they explain why one machine is faster, but they do not change the main shape once n is large.',
          ),
          TextBlock(
            'Imagine two cars driving up the same mountain. Paint color, engine noise, and seat comfort are details like coefficients. The steepness of the mountain is the order of growth. In the long run, the mountain shape decides the trip.',
          ),
          VisualizerLinkBlock(
            algorithmId: 'selection-sort',
            label: 'Visualize Selection Sort',
            description:
                'Watch why repeated scans create the quadratic growth pattern.',
          ),
          QuizBlock(
            question:
                'If an algorithm behaves like n², what happens approximately when n doubles?',
            options: [
              'The running time stays the same.',
              'The running time doubles.',
              'The running time becomes about four times larger.',
              'The running time becomes about n times larger.',
            ],
            correctIndex: 2,
            explanation:
                'For quadratic growth, replacing n with 2n gives (2n)² = 4n², so the work becomes about four times larger.',
          ),
          QuizBlock(
            question:
                'Why do we care more about curve shape than exact coefficients?',
            options: [
              'The coefficients are always zero.',
              'The shape describes how the algorithm scales across machines.',
              'The exact seconds are easier to memorize.',
              'The shape only matters for tiny inputs.',
            ],
            correctIndex: 1,
            explanation:
                'Machine details change the constants. The growth shape describes the algorithm behavior as inputs become large.',
          ),
          KeyTakeawayBlock(
            'Order-of-growth analysis is not trying to predict one stopwatch time. It asks how the algorithm scales. For Selection Sort, different machines give different seconds, but the shared shape is quadratic.',
          ),
        ],
      ),
      ModuleContent(
        id: 'lesson2_module3',
        title: 'Best, Worst, and Average Case Mischief',
        order: 2,
        algorithmId: 'linear-search',
        contentBlocks: [
          TextBlock(
            'One algorithm can behave like three different creatures depending '
            'on the input. Friendly input brings snacks. Mean input hides the '
            'answer in the last drawer. Average input stands in the middle '
            'holding a clipboard.',
          ),
          DefinitionBlock(
            term: 'Best case',
            definition:
                'The least work the algorithm can do for inputs of size n. It is '
                'the lucky day version, where the target is exactly where we '
                'wanted it and everyone claps too early.',
          ),
          MathBlock(
            r'B(n) = \min T(I)',
            semanticsLabel:
                'B of n equals the minimum running time over inputs of size n',
          ),
          DefinitionBlock(
            term: 'Worst case',
            definition:
                'The most work the algorithm can do for inputs of size n. This is '
                'the villain case. It makes the algorithm check every dusty '
                'corner before it lets us go home.',
          ),
          MathBlock(
            r'W(n) = \max T(I)',
            semanticsLabel:
                'W of n equals the maximum running time over inputs of size n',
          ),
          DefinitionBlock(
            term: 'Average case',
            definition:
                'The expected amount of work over all inputs of size n, using a '
                'probability model. Translation: we need assumptions, or the '
                'average is just vibes in a fake mustache.',
          ),
          MathBlock(
            r'A(n) = \sum_I P(I)T(I)',
            semanticsLabel:
                'A of n equals the sum over inputs I of probability of I times running time of I',
          ),
          TextBlock(
            'Linear search is a clean case study here. We check items from left '
            'to right until the target appears. If it is first, we find it right '
            'away. If it is last or missing, we check every item in the list.',
          ),
          CodeBlock(
            'linear search on n items:\n'
            'best case: target at position 1\n'
            'worst case: target at position n, or missing\n'
            'average case: target position depends on probability',
            language: 'text',
          ),
          MathBlock(
            r'\text{successful average checks} = \frac{n + 1}{2}',
            semanticsLabel:
                'successful average checks equals n plus one divided by two',
          ),
          TextBlock(
            'That fraction assumes the target is equally likely to be in any '
            'position. Change the assumption and the average changes too. This '
            'is why worst case analysis is popular. It does not need a probability '
            'model, it only requires thinking about the hardest input.',
          ),
          QuizBlock(
            question: 'For linear search, what is the worst case?',
            options: [
              'The target is the first item.',
              'The target is in the middle every time.',
              'The target is last, or it is not in the list.',
              'The list politely sorts itself.',
            ],
            correctIndex: 2,
            explanation:
                'Worst case means the most checks. Linear search must inspect all '
                'n items when the target is last or missing.',
          ),
          KeyTakeawayBlock(
            'Best case is lucky. Worst case is safe. Average case is useful only '
            'when the probability model is honest. Linear search demonstrates all three '
            'without needing any special assumptions.',
          ),
        ],
      ),
      ModuleContent(
        id: 'lesson2_module4',
        title: 'The Formal Framework for Growth',
        order: 3,
        algorithmId: null,
        contentBlocks: [
          TextBlock(
            'So far we have talked about growth in an intuitive way. Some algorithms '
            'grow slowly, some grow quickly, and some explode. We used examples like '
            'Selection Sort to see that different machines give different exact running '
            'times, but the shape of the curve stays the same. Now we want a mathematical '
            'framework that lets us describe that shape precisely.',
          ),
          TextBlock(
            'The goal is to describe the rate of growth of an algorithm formally. '
            'We express this using bounds: upper, lower, and tight. If we can say an '
            'algorithm grows no faster than n², that tells us something useful '
            'even before we run it on any machine.',
          ),
          GraphBlock('bigO'),
          DefinitionBlock(
            term: 'Big-O',
            definition:
                'The set of functions that grow no faster than g(n). Formally, '
                'f(n) is in O(g(n)) if there exist a positive constant c and a '
                'nonnegative integer n₀ such that f(n) ≤ c·g(n) for all n ≥ n₀.',
          ),
          MathBlock(
            r'f(n) \le c \cdot g(n) \quad \text{for all } n \ge n_0',
            semanticsLabel:
                'f of n is less than or equal to c times g of n for all n greater than or equal to n zero',
          ),
          GraphBlock('bigOmega'),
          DefinitionBlock(
            term: 'Big-Omega',
            definition:
                'The set of functions that grow at least as fast as g(n). Formally, '
                'f(n) is in Omega(g(n)) if there exist a positive constant c and a '
                'nonnegative integer n₀ such that f(n) ≥ c·g(n) for all n ≥ n₀.',
          ),
          MathBlock(
            r'f(n) \ge c \cdot g(n) \quad \text{for all } n \ge n_0',
            semanticsLabel:
                'f of n is greater than or equal to c times g of n for all n greater than or equal to n zero',
          ),
          GraphBlock('bigTheta'),
          DefinitionBlock(
            term: 'Big-Theta',
            definition:
                'The set of functions that grow at the same rate as g(n), up to '
                'constant factors. f(n) is in Theta(g(n)) if it is in both O(g(n)) '
                'and Omega(g(n)).',
          ),
          MathBlock(
            r'c_2 \cdot g(n) \le f(n) \le c_1 \cdot g(n) \quad \text{for all } n \ge n_0',
            semanticsLabel:
                'c two times g of n is less than or equal to f of n is less than or equal to c one times g of n for all n greater than or equal to n zero',
          ),
          TextBlock(
            'The most common way of reading f is in Theta of g is: f is order g. '
            'The phrases asymptotic order and asymptotic complexity are used '
            'interchangeably. In practice, we almost always report either O or Theta efficiency.',
          ),
          TextBlock(
            'A bound is tight if it is as strong and simple as possible. For f(n) = '
            '5n², it is technically true that O(n³), O(n² log n), '
            'and O(2ⁿ) are all valid upper bounds. But O(n²) is the '
            'tightest and most informative. Always report the simplest true bound.',
          ),
          TextBlock(
            'In practice we simplify as much as possible. If g₁(n) = 15n² '
            'minus 6n plus 27, we usually just write O(n²). We drop constant '
            'factors and slower-growing terms because for large n the n² term '
            'dominates. Why can we drop the lower-order terms? Because if f(n) is '
            'bounded above by c·(n² + 3n + 5), then for n ≥ 1, '
            'f(n) is also bounded above by 9c·n². The lower-order terms '
            'get swallowed by the dominant term once n is large enough.',
          ),
          TextBlock(
            'The limit method is a shortcut for determining which bound applies: '
            'look at the limit as n approaches infinity of f(n) over g(n). '
            'If it equals 0, f grows more slowly than g and is in O(g). '
            'If it equals a positive constant, f and g grow at the same rate and f is in Theta of g. '
            'If it equals infinity, f grows faster than g and is in Omega of g.',
          ),
          MathBlock(
            r'\lim_{n \to \infty} \frac{f(n)}{g(n)} = \begin{cases} 0 & \text{f grows slower} \\ c > 0 & \text{same rate} \\ \infty & \text{f grows faster} \end{cases}',
            semanticsLabel:
                'limit as n approaches infinity of f of n over g of n equals zero when f grows slower, a positive constant when same rate, or infinity when f grows faster',
          ),
          CodeBlock(
            'Example: prove f(n) = 4n² + 8n - 3 is in O(n²)\n'
            'Choose g(n) = n², c = 15, n₀ = 1\n'
            'Need: 4n² + 8n - 3 ≤ 15n² for all n ≥ 1\n'
            '4n² + 8n - 3 ≤ 4n² + 8n² + 3n² = 15n²  QED',
            language: 'text',
          ),
          QuizBlock(
            question:
                'If f(n) = 5n², which of the following is the tightest bound?',
            options: ['O(n)', 'O(n²)', 'O(n³)', 'O(2ⁿ)'],
            correctIndex: 1,
            explanation:
                'O(n²) is the tightest bound. O(n) is too tight (false). '
                'O(n³) and O(2ⁿ) are technically true but do not tell us '
                'as much. The tightest bound is always the simplest that is still correct.',
          ),
          KeyTakeawayBlock(
            'Big-O is an upper bound. Big-Omega is a lower bound. Big-Theta is both '
            'together, meaning same rate of growth. Drop constants and lower-order '
            'terms when you write bounds. Report the tightest one.',
          ),
        ],
      ),
      ModuleContent(
        id: 'lesson2_module5',
        title: 'Worked Example of Time Analysis',
        order: 4,
        algorithmId: null,
        contentBlocks: [
          TextBlock(
            'Now we use the notation from the previous module on a real example. '
            'The goal is not to guess from the number of loops. The goal is to '
            'read the structure, count each layer of repeated work, and combine '
            'the pieces.',
          ),
          DefinitionBlock(
            term: 'Disjoint sets',
            definition:
                'Two sets are disjoint when they share no element. For example, '
                '{1, 3, 5} and {2, 4} are disjoint, while {1, 3, 5} and {3, 7} '
                'are not disjoint because both contain 3.',
          ),
          TextBlock(
            'Suppose we are given sets S₁, S₂, …, Sₙ. Each set is a subset of '
            '{1, 2, …, n}. We want to know whether at least one pair of sets has '
            'nothing in common.',
          ),
          CodeBlock(
            'for each set Sᵢ:\n'
            '  for each other set Sⱼ:\n'
            '    found overlap = false\n'
            '    for each element p in Sᵢ:\n'
            '      if p belongs to Sⱼ:\n'
            '        found overlap = true\n'
            '    if found overlap is false:\n'
            '      report Sᵢ and Sⱼ are disjoint',
            language: 'text',
          ),
          DefinitionBlock(
            term: 'Brute-force comparison',
            definition:
                'A direct approach that checks possible pairs one by one instead '
                'of using a clever shortcut. It is often the easiest correct '
                'solution to analyze first.',
          ),
          TextBlock(
            'There are O(n) choices for Sᵢ. For each one, there are O(n) choices '
            'for Sⱼ. For each pair, the algorithm may scan O(n) elements from Sᵢ. '
            'Multiplying those layers gives cubic growth.',
          ),
          MathBlock(
            r'O(n) \cdot O(n) \cdot O(n) = O(n^3)',
            semanticsLabel:
                'O of n times O of n times O of n equals O of n cubed',
          ),
          TextBlock(
            'This does not mean every three-loop algorithm is automatically O(n³). '
            'The smart move is to ask how many times each loop really runs and '
            'whether a hidden operation inside the loop adds more cost.',
          ),
          MathBlock(
            r'n 	o 2n \quad \Rightarrow \quad n^3 	o (2n)^3 = 8n^3',
            semanticsLabel:
                'when n doubles to two n, n cubed becomes eight n cubed',
          ),
          TextBlock(
            'That is why doubling n makes cubic work about 8 times larger. Cubic '
            'time can be acceptable for small data, but it gets heavy quickly as '
            'the input grows.',
          ),
          QuizBlock(
            question:
                'If an algorithm has two loops that each run n times and an inner loop that runs 5 times, what is the growth class?',
            options: ['O(n)', 'O(n²)', 'O(n³)', 'O(5ⁿ)'],
            correctIndex: 1,
            explanation:
                'The constant 5 is O(1), so the total is O(n)·O(n)·O(1) = O(n²).',
          ),
          KeyTakeawayBlock(
            'Analyze nested loops layer by layer. For the disjoint-set brute-force '
            'algorithm, the three repeated layers give O(n³). The method matters '
            'more than the memorized answer.',
          ),
        ],
      ),
      ModuleContent(
        id: 'lesson2_module6',
        title: 'Caveats: Fast Is Not Always Best',
        order: 5,
        algorithmId: null,
        contentBlocks: [
          TextBlock(
            'Efficiency is important, but real software design is not a speed '
            'worship contest. A faster growth class can help a lot, but it is not '
            'the only reason to choose an algorithm.',
          ),
          DefinitionBlock(
            term: 'One-time programs',
            definition:
                'If a script runs once or twice, ease of implementation and '
                'correctness may matter more than shaving a few seconds from runtime.',
          ),
          DefinitionBlock(
            term: 'Small inputs',
            definition:
                'Asymptotic growth matters most when n becomes large. For tiny '
                'inputs, a simple O(n²) method can beat or match a complex O(n log n) '
                'method because constants and setup costs still matter.',
          ),
          DefinitionBlock(
            term: 'Maintainability',
            definition:
                'A slightly slower algorithm that people can read, test, and modify '
                'may be more valuable than a clever implementation nobody trusts.',
          ),
          DefinitionBlock(
            term: 'Space tradeoff',
            definition:
                'Some algorithms buy speed with memory. If memory use gets too high, '
                'the system may slow down or fail, erasing the time advantage.',
          ),
          DefinitionBlock(
            term: 'Accuracy and stability',
            definition:
                'For numerical algorithms, a fast answer is not useful if rounding '
                'error grows and the result becomes unreliable.',
          ),
          TextBlock(
            'The practical question is not only which algorithm has the smallest '
            'Big-O expression. The better question is which algorithm is appropriate '
            'for this problem, this input size, this team, and this machine.',
          ),
          CodeBlock(
            'Choose with context:\n'
            '1. Is the input large enough for growth rate to dominate?\n'
            '2. Is the implementation likely to be correct?\n'
            '3. Can future developers maintain it?\n'
            '4. Does it fit comfortably in memory?\n'
            '5. Does it produce reliable answers?',
            language: 'text',
          ),
          QuizBlock(
            question:
                'Why might a simple O(n²) algorithm be the right choice for a small fixed input?',
            options: [
              'Because O(n²) is always faster than O(n log n).',
              'Because constants, implementation time, and clarity can matter more at small sizes.',
              'Because memory never matters.',
              'Because asymptotic notation only applies to sorting.',
            ],
            correctIndex: 1,
            explanation:
                'For small fixed inputs, the simpler method may be easier to build, easier to verify, and fast enough in practice.',
          ),
          KeyTakeawayBlock(
            'A good algorithm is correct, practical, understandable, and appropriate. '
            'Efficiency is powerful, but wisdom is knowing when speed should win '
            'and when another concern matters more.',
          ),
        ],
      ),
      ModuleContent(
        id: 'lesson2_conclusion',
        title: 'Lesson 2 Wrap-Up',
        order: 6,
        algorithmId: null,
        contentBlocks: [
          TextBlock(
            'Nice work. Lesson 2 moved from informal ideas about efficiency to the '
            'mathematical language used to describe algorithm growth.',
          ),
          DefinitionBlock(
            term: 'Growth language',
            definition:
                'You can now talk about how work changes as the input gets bigger, '
                'not just how many seconds one run takes on one machine.',
          ),
          DefinitionBlock(
            term: 'Efficiency classes',
            definition:
                'You practiced reading growth patterns such as O(n), O(n²), O(n³), '
                'and O(n log n), then choosing the simplest useful bound.',
          ),
          DefinitionBlock(
            term: 'Asymptotic bounds',
            definition:
                'Big-O gives an upper bound, Big-Omega gives a lower bound, and '
                'Big-Theta gives a tight bound when both sides match.',
          ),
          DefinitionBlock(
            term: 'Nonrecursive analysis',
            definition:
                'You learned how to inspect loops, choose a basic operation, and '
                'estimate running time by combining repeated work.',
          ),
          TextBlock(
            'Before this lesson, code may have looked like statements and loops. '
            'Now you should start seeing behavior: growth, bounds, and tradeoffs.',
          ),
          TextBlock(
            'Lesson 3 moves from nonrecursive algorithms to recursive algorithms. '
            'Instead of only counting loops, we will study algorithms that solve a '
            'problem by calling themselves on smaller versions of the same problem.',
          ),
          QuizBlock(
            question: 'What is the main shift from Lesson 2 to Lesson 3?',
            options: [
              'From analyzing loops to analyzing recursive self-calls.',
              'From algorithms to hardware repair.',
              'From Big-O to ignoring running time.',
              'From exact stopwatch timing to guessing randomly.',
            ],
            correctIndex: 0,
            explanation:
                'Lesson 2 focused mostly on nonrecursive algorithms. Lesson 3 introduces recursive analysis.',
          ),
          KeyTakeawayBlock(
            'You now have a framework for describing efficiency, comparing algorithms, '
            'and reasoning about growth. That framework will keep showing up through '
            'the rest of the course.',
          ),
        ],
      ),
    ],
  ),

  // ── Lesson 3 ───────────────────────────────────────────────────────────────
  LessonContent(
    id: 3,
    title: 'Recurrence Relations',
    categoryColor: '#8B5CF6',
    modules: [
      ModuleContent(
        id: 'lesson3_module1',
        title: 'Introduction to Recursive Algorithms',
        order: 0,
        contentBlocks: [
          TextBlock(
            'Lesson 3 begins the move from loop counting to recursive analysis. '
            'Recursive code can be short, but a small-looking function can create '
            'many waiting calls before the final answer returns.',
          ),
          TextBlock(
            'The core question is simple: how do we analyze recursive algorithms '
            'without tracing every single call by hand? The answer starts with '
            'recurrence relations.',
          ),
          DefinitionBlock(
            term: 'Recursion',
            definition:
                'A way to define a problem by solving smaller versions of the same problem.',
          ),
          DefinitionBlock(
            term: 'Base case',
            definition:
                'The stopping point. It is the small version of the problem that can be solved immediately.',
          ),
          DefinitionBlock(
            term: 'Recursive call',
            definition:
                'The step where the algorithm calls itself on a smaller input and waits for that answer.',
          ),
          TextBlock(
            'A recursive algorithm usually says: I cannot solve the full problem '
            'right away, but I can solve a smaller version and build from there.',
          ),
          CodeBlock(
            'recursiveSolve(problem):\n'
            '  if problem is small enough:\n'
            '    return direct answer\n'
            '  smaller = shrink(problem)\n'
            '  return combine(recursiveSolve(smaller))',
            language: 'text',
          ),
          TextBlock(
            'Recursion becomes expensive when many calls are pending at the same '
            'time. Each earlier call waits while smaller calls run. If the algorithm '
            'solves similar subproblems again and again, the cost can grow quickly.',
          ),
          TextBlock(
            'The Fibonacci sequence is the classic example. It begins 0, 1, 1, 2, '
            '3, 5, 8, 13, 21, and each new value adds the previous two values.',
          ),
          MathBlock(
            r'F(0) = 0,\quad F(1) = 1',
            semanticsLabel: 'Fibonacci base cases',
          ),
          MathBlock(
            r'F(n) = F(n - 1) + F(n - 2)',
            semanticsLabel: 'Fibonacci recurrence relation',
          ),
          DefinitionBlock(
            term: 'Recurrence relation',
            definition:
                'An equation that defines a value such as M(n) using values at smaller inputs.',
          ),
          TextBlock(
            'Base cases matter because they anchor the whole sequence. The same '
            'rule with different starting values produces different values.',
          ),
          CodeBlock(
            'Base cases        First five terms\n'
            'F(0)=6, F(1)=12   6, 12, 18, 30, 48\n'
            'F(0)=2, F(1)=2    2, 2, 4, 6, 10\n'
            'F(0)=0, F(1)=1    0, 1, 1, 2, 3',
            language: 'text',
          ),
          TextBlock(
            'A recurrence relation describes the recursive structure, but it does '
            'not always make the efficiency obvious. For large inputs such as F(100), '
            'we want a formula or a growth class instead of a giant call trace.',
          ),
          QuizBlock(
            question:
                'Why is a recurrence relation useful in recursive analysis?',
            options: [
              'It describes the work using smaller inputs.',
              'It removes the need for base cases.',
              'It always gives the exact running time instantly.',
              'It only works for loop-based algorithms.',
            ],
            correctIndex: 0,
            explanation:
                'A recurrence relation captures how the algorithm depends on smaller versions of the input.',
          ),
          KeyTakeawayBlock(
            'Recursive algorithms need recurrence relations because plain loop '
            'counting is not enough. Always identify the base cases, the recursive '
            'calls, and the pending work those calls create.',
          ),
        ],
      ),
      ModuleContent(
        id: 'lesson3_module2',
        title: 'Solving Recurrence Relations',
        order: 1,
        contentBlocks: [
          TextBlock(
            'Once we have a recurrence, the next goal is to solve it. Solving means '
            'turning a recursive definition into a clearer formula or at least a '
            'growth class.',
          ),
          TextBlock(
            'This module introduces three tools: forward substitution, backward '
            'substitution, and characteristic equations for second-order linear '
            'recurrences.',
          ),
          DefinitionBlock(
            term: 'Forward substitution',
            definition:
                'Generate early terms from the base case, spot a pattern, then verify the guessed formula.',
          ),
          MathBlock(
            r'f(0) = 1,\quad f(n) = f(n - 1) + n',
            semanticsLabel: 'forward substitution example recurrence',
          ),
          CodeBlock(
            'f(1) = 1 + 1 = 2\n'
            'f(2) = 1 + 1 + 2 = 4\n'
            'f(3) = 1 + 1 + 2 + 3 = 7\n'
            'f(4) = 1 + 1 + 2 + 3 + 4 = 11',
            language: 'text',
          ),
          TextBlock(
            'The pattern is 1 plus the sum of the first n integers. Since that sum '
            'is n(n + 1)/2, the dominant term is n²/2, so the growth is O(n²).',
          ),
          MathBlock(
            r'f(n) = 1 + \frac{n(n + 1)}{2}',
            semanticsLabel: 'closed form from forward substitution',
          ),
          DefinitionBlock(
            term: 'Backward substitution',
            definition:
                'Start from f(n), repeatedly replace smaller terms using the recurrence, then plug in the base case.',
          ),
          MathBlock(
            r'f(n) = 2f(n - 1) + 3,\quad f(1) = 1',
            semanticsLabel: 'backward substitution example recurrence',
          ),
          CodeBlock(
            'f(n) = 2f(n - 1) + 3\n'
            '     = 4f(n - 2) + 9\n'
            '     = 8f(n - 3) + 21\n'
            'pattern: 2^i f(n - i) + 3(2^i - 1)',
            language: 'text',
          ),
          MathBlock(
            r'f(n) = 2^{n + 1} - 3',
            semanticsLabel: 'closed form from backward substitution',
          ),
          TextBlock(
            'This grows like O(2ⁿ). We ignore the extra factor of 2 because Big-O '
            'notation ignores constant multipliers.',
          ),
          DefinitionBlock(
            term: 'Linear second-order recurrence',
            definition:
                'A recurrence that depends linearly on f(n), f(n − 1), and f(n − 2) with constant coefficients.',
          ),
          DefinitionBlock(
            term: 'Homogeneous recurrence',
            definition:
                'A recurrence where the nonrecursive right-hand side is 0.',
          ),
          DefinitionBlock(
            term: 'Inhomogeneous recurrence',
            definition:
                'A recurrence with an extra nonrecursive term g(n) that is not 0.',
          ),
          MathBlock(
            r'a f(n) + b f(n - 1) + c f(n - 2) = g(n)',
            semanticsLabel: 'general second-order recurrence form',
          ),
          DefinitionBlock(
            term: 'Characteristic equation',
            definition:
                'A quadratic equation built from the recurrence. Its roots determine the shape of the solution.',
          ),
          MathBlock(
            r'a r^2 + b r + c = 0',
            semanticsLabel: 'characteristic equation form',
          ),
          TextBlock(
            'For two distinct real roots r₁ and r₂, the solution has the form '
            'αr₁ⁿ + βr₂ⁿ. For a repeated root r, the solution has the form '
            'αrⁿ + βnrⁿ.',
          ),
          MathBlock(
            r'f(n) = 2f(n - 1) + 3f(n - 2)',
            semanticsLabel: 'second-order recurrence example',
          ),
          MathBlock(
            r'r^2 - 2r - 3 = 0 = (r - 3)(r + 1)',
            semanticsLabel: 'factored characteristic equation',
          ),
          MathBlock(
            r'f(n) = \alpha 3^n + \beta (-1)^n',
            semanticsLabel: 'general solution with two roots',
          ),
          TextBlock(
            'With f(0) = 1 and f(1) = 1, the constants become α = 1/2 and '
            'β = 1/2. The 3ⁿ term dominates, so the growth is O(3ⁿ).',
          ),
          MathBlock(
            r'f(n) = \frac{1}{2}\cdot 3^n + \frac{1}{2}\cdot (-1)^n',
            semanticsLabel: 'explicit second-order recurrence solution',
          ),
          TextBlock(
            'For an inhomogeneous recurrence, solve the matching homogeneous '
            'version first. Then add one particular solution for g(n), and use the '
            'base cases to finish the constants.',
          ),
          MathBlock(
            r'f(n) = f_h(n) + f_p(n)',
            semanticsLabel: 'inhomogeneous solution structure',
          ),
          CodeBlock(
            'Which tool should you try?\n'
            'small terms reveal pattern: forward substitution\n'
            'one previous term plus constants: backward substitution\n'
            'depends on f(n-1) and f(n-2): characteristic equation',
            language: 'text',
          ),
          QuizBlock(
            question:
                'Which method is designed for second-order linear recurrences with constant coefficients?',
            options: [
              'Characteristic equation method',
              'Guessing random values',
              'Only stopwatch timing',
              'Ignoring the base cases',
            ],
            correctIndex: 0,
            explanation:
                'The characteristic equation turns that recurrence type into a quadratic whose roots shape the solution.',
          ),
          KeyTakeawayBlock(
            'Forward substitution spots patterns, backward substitution unrolls the '
            'definition, and characteristic equations solve a special but important '
            'family of second-order recurrences.',
          ),
        ],
      ),
      ModuleContent(
        id: 'lesson3_module3',
        title: 'Master Theorem',
        order: 2,
        contentBlocks: [
          TextBlock(
            'The Master Theorem is a shortcut for a common recursive pattern. It usually does not give an exact formula for T(n). Instead, it gives the efficiency class directly.',
          ),
          DefinitionBlock(
            term: 'Master Theorem',
            definition:
                'A theorem for many divide-and-conquer recurrences that identifies the asymptotic growth class without fully solving the recurrence.',
          ),
          TextBlock(
            'It applies to recurrences where a problem of size n is split into smaller subproblems of size n / b, then combined with some extra nonrecursive work.',
          ),
          MathBlock(
            r'T(n) = aT(n / b) + f(n)',
            semanticsLabel: 'Master Theorem recurrence form',
          ),
          MathBlock(
            r'T(1) = c,\quad a \ge 1,\quad b \ge 2,\quad c > 0',
            semanticsLabel: 'Master Theorem assumptions',
          ),
          DefinitionBlock(
            term: 'a',
            definition:
                'The number of recursive subproblems created at each step.',
          ),
          DefinitionBlock(
            term: 'b',
            definition: 'The shrink factor. Each subproblem has size n / b.',
          ),
          DefinitionBlock(
            term: 'f(n)',
            definition:
                'The nonrecursive work done outside the recursive calls, such as splitting, merging, or loop work.',
          ),
          TextBlock(
            'The big idea is to compare recursive work with outside work. For the simple version of the theorem, write f(n) as Θ(nᵈ), then compare a with bᵈ.',
          ),
          MathBlock(
            r'f(n) \in \Theta(n^d)',
            semanticsLabel: 'outside work as theta n to the d',
          ),
          CodeBlock(
            'Master Theorem checklist:\n'
            '1. Put the recurrence in T(n) = aT(n / b) + f(n) form\n'
            '2. Identify a, b, and f(n)\n'
            '3. Rewrite f(n) as Θ(n^d)\n'
            '4. Compute b^d\n'
            '5. Compare a with b^d\n'
            '6. Pick the matching case',
            language: 'text',
          ),
          TextBlock(
            'Case 1 happens when a is smaller than bᵈ. The outside work dominates, so the result follows f(n).',
          ),
          MathBlock(
            r'a < b^d \Rightarrow T(n) \in \Theta(n^d)',
            semanticsLabel: 'Master Theorem case one',
          ),
          TextBlock(
            'Case 2 happens when a equals bᵈ. The recursive work and outside work are balanced, so a log factor appears.',
          ),
          MathBlock(
            r'a = b^d \Rightarrow T(n) \in \Theta(n^d \log n)',
            semanticsLabel: 'Master Theorem case two',
          ),
          TextBlock(
            'Case 3 happens when a is larger than bᵈ. The recursive branching dominates the total work.',
          ),
          MathBlock(
            r'a > b^d \Rightarrow T(n) \in \Theta(n^{\log_b a})',
            semanticsLabel: 'Master Theorem case three',
          ),
          MathBlock(
            r'T(n) = T(n / 2) + 5n',
            semanticsLabel: 'Master Theorem example one',
          ),
          TextBlock(
            'Here a = 1, b = 2, and f(n) = 5n, so d = 1. Since bᵈ = 2 and 1 < 2, this is Case 1 and T(n) is Θ(n).',
          ),
          MathBlock(
            r'T(n) \in \Theta(n)',
            semanticsLabel: 'example one theta n',
          ),
          MathBlock(
            r'T(n) = 2T(n / 2) + 5n',
            semanticsLabel: 'Master Theorem example two',
          ),
          TextBlock(
            'Now a = 2, b = 2, and d = 1. Since a = bᵈ, this is Case 2. This famous pattern gives Θ(n log n).',
          ),
          MathBlock(
            r'T(n) \in \Theta(n \log n)',
            semanticsLabel: 'example two theta n log n',
          ),
          MathBlock(
            r'T(n) = 2T(n / 2) + 5n^2',
            semanticsLabel: 'Master Theorem example three',
          ),
          TextBlock(
            'Here d = 2, so bᵈ = 4. Since 2 < 4, the outside n² work dominates and the result is Θ(n²).',
          ),
          MathBlock(
            r'T(n) \in \Theta(n^2)',
            semanticsLabel: 'example three theta n squared',
          ),
          TextBlock(
            'Do not force every recurrence into the Master Theorem. Recursive sequential search gives a helpful warning example because the input shrinks by one item, not by a constant factor.',
          ),
          MathBlock(
            r'T(n) = T(n - 1) + 1,\quad T(0) = 0',
            semanticsLabel: 'recursive sequential search recurrence',
          ),
          CodeBlock(
            'Unroll sequential search:\n'
            'T(n) = T(n - 1) + 1\n'
            '     = T(n - 2) + 2\n'
            '     = T(n - i) + i\n'
            'set i = n, so T(n) = T(0) + n = n',
            language: 'text',
          ),
          TextBlock(
            'That recurrence is easy to solve by forward or backward substitution, and it gives Θ(n). The real skill is choosing the right tool.',
          ),
          QuizBlock(
            question:
                'Why does T(n) = T(n − 1) + 1 not fit the Master Theorem?',
            options: [
              'The recursive call uses n − 1 instead of n / b.',
              'It has a base case.',
              'It is recursive.',
              'Its final answer is linear.',
            ],
            correctIndex: 0,
            explanation:
                'The Master Theorem needs subproblems of size n / b. Shrinking by one item is a different recurrence shape.',
          ),
          KeyTakeawayBlock(
            'Use the Master Theorem when the recurrence has divide-and-conquer shape. Compare a with bᵈ, pick the case, and remember to switch methods when the recurrence does not fit.',
          ),
        ],
      ),
      ModuleContent(
        id: 'lesson3_module4',
        title: 'Lesson 3 Conclusion',
        order: 3,
        contentBlocks: [
          TextBlock(
            'Lesson 3 moved from understanding recursion to analyzing it with structured mathematical tools.',
          ),
          TextBlock(
            'You learned how to model recursive work with a recurrence relation, solve many recurrences, and estimate the growth of recursive algorithms without tracing every call by hand.',
          ),
          DefinitionBlock(
            term: 'Method choice',
            definition:
                'The habit of matching a recurrence to the analysis method that actually fits its structure.',
          ),
          CodeBlock(
            'Lesson 3 toolbox:\n'
            'recurrence relation: model recursive cost\n'
            'forward substitution: spot a pattern from early terms\n'
            'backward substitution: unroll from T(n) to the base case\n'
            'characteristic equations: solve certain second-order recurrences\n'
            'Master Theorem: classify divide-and-conquer growth',
            language: 'text',
          ),
          TextBlock(
            'The biggest idea is choosing the right method. Some recurrences are easy to unroll. Some reveal a pattern from early terms. Some fit characteristic equations. Some fit the Master Theorem.',
          ),
          TextBlock(
            'That means algorithm analysis is not only about formulas. It is also about strategy.',
          ),
          TextBlock(
            'Lessons 2 and 3 focused mostly on analysis: how fast an algorithm grows, what class it belongs to, and how to model its running time.',
          ),
          TextBlock(
            'Lesson 4 changes the focus from measuring algorithms to designing them. The first design strategy is brute force.',
          ),
          QuizBlock(
            question: 'What is the most important strategy from Lesson 3?',
            options: [
              'Choose the method that matches the recurrence structure.',
              'Use the Master Theorem for every recurrence.',
              'Ignore base cases after finding a formula.',
              'Trace every recursive call manually forever.',
            ],
            correctIndex: 0,
            explanation:
                'Different recurrence shapes need different tools, so method choice matters as much as algebra.',
          ),
          KeyTakeawayBlock(
            'Recursive algorithms stop feeling like magic when you can model their work. Recurrences, substitution, characteristic equations, and the Master Theorem turn recursive behavior into measurable growth.',
          ),
        ],
      ),
    ],
  ),

  // ── Lesson 4 ───────────────────────────────────────────────────────────────
  LessonContent(
    id: 4,
    title: 'Brute Force Algorithms',
    categoryColor: '#0EA5E9',
    modules: [
      ModuleContent(
        id: 'lesson4_module1',
        title: 'Introduction to Brute Force',
        order: 0,
        algorithmId: 'bubble-sort',
        contentBlocks: [
          TextBlock(
            'Welcome to Lesson 4. Lessons 2 and 3 focused on analysis: how fast an algorithm grows and how recursive work can be measured. Now we shift to design. The new question is not only how fast is this algorithm. It is also how do we invent one in the first place.',
          ),
          DefinitionBlock(
            term: 'Brute force',
            definition:
                'The direct design strategy: try the obvious correct method first, then study its cost and improve it if needed.',
          ),
          TextBlock(
            'Brute force is often the first useful answer. It may not be elegant, but it gives a correct baseline. Once we have that baseline, we can compare smarter designs against something concrete.',
          ),
          DefinitionBlock(
            term: 'Baseline algorithm',
            definition:
                'A simple correct solution used as a starting point for analysis and later improvement.',
          ),
          TextBlock(
            'Selection Sort is a classic example. It repeatedly scans the remaining array, selects the smallest item, and places it in the next position. It does this even when the array is already sorted.',
          ),
          VisualizerLinkBlock(
            algorithmId: 'selection-sort',
            label: 'Visualize Selection Sort',
            description:
                'Watch the repeated scan for the smallest remaining value.',
          ),
          CodeBlock(
            'for i from 0 to n − 2:\n'
            '  minIndex = i\n'
            '  for j from i + 1 to n − 1:\n'
            '    if A[j] < A[minIndex]:\n'
            '      minIndex = j\n'
            '  swap A[i] and A[minIndex]',
            language: 'text',
          ),
          TextBlock(
            'Because the nested scans still cover the array, Selection Sort uses Θ(n²) comparisons in the usual analysis. A sorted array and a reverse-sorted array do not change that comparison count.',
          ),
          MathBlock(r'\Theta(n^2)', semanticsLabel: 'theta of n squared'),
          TextBlock(
            'Bubble Sort is another direct method. It compares adjacent items and swaps them when they are out of order. Small improvements can help practice, but the overall class stays O(n²).',
          ),
          VisualizerLinkBlock(
            algorithmId: 'bubble-sort',
            label: 'Visualize Bubble Sort',
            description:
                'Use this when the lesson talks about adjacent swaps, no-swap early stopping, and bubbling large values rightward.',
          ),
          TextBlock(
            'Two practical improvements are common. Stop early if a full pass makes no swaps. Track the last swap position, because everything after that point is already settled. Cocktail Shaker Sort goes left to right, then right to left, moving large and small values in both directions.',
          ),
          TextBlock(
            'Sequential Search is the same design habit applied to searching. Start at the beginning, check each item, and stop when the target is found or the list ends.',
          ),
          VisualizerLinkBlock(
            algorithmId: 'linear-search',
            label: 'Visualize Sequential Search',
            description: 'Step through the direct one-by-one search pattern.',
          ),
          TextBlock(
            'The string matching problem also has a brute force version. Align the pattern with the text, compare characters, shift one position, and repeat. With text length n and pattern length m, the worst case can compare m characters at each of n − m + 1 alignments.',
          ),
          MathBlock(
            r'm(n - m + 1) \in O(nm)',
            semanticsLabel: 'm times n minus m plus one is big O of n m',
          ),
          QuizBlock(
            question:
                'Why does Bubble Sort remain O(n²) after small improvements?',
            options: [
              'The worst case still needs many adjacent comparisons',
              'It stops after one pass for every input',
              'It never swaps values',
              'It becomes a divide-and-conquer algorithm',
            ],
            correctIndex: 0,
            explanation:
                'Early stopping and last-swap tracking help some inputs, but they do not remove the quadratic worst-case pattern.',
          ),
          KeyTakeawayBlock(
            'Brute force means start with a direct correct method. Then analyze it, visualize its behavior, and ask how to improve it.',
          ),
        ],
      ),
      ModuleContent(
        id: 'lesson4_module2',
        title: 'Exhaustive Search',
        order: 1,
        algorithmId: 'knapsack',
        contentBlocks: [
          TextBlock(
            'Exhaustive search is a special form of brute force. Instead of trying one direct scan, it lists all possible solutions, checks each one, and chooses the best valid answer.',
          ),
          DefinitionBlock(
            term: 'Exhaustive search',
            definition:
                'A brute force strategy that explores every candidate solution in the search space.',
          ),
          TextBlock(
            'This is simple and reliable. It also becomes expensive quickly, because the number of candidates can grow faster than the input feels like it should.',
          ),
          DefinitionBlock(
            term: 'Travelling Salesman Problem',
            definition:
                'Find the cheapest tour that visits every city exactly once and returns to the start.',
          ),
          TextBlock(
            'A brute force travelling salesman algorithm fixes a starting city, tries the possible orders for the remaining cities, computes each tour cost, and keeps the cheapest one. The search is over permutations, so the growth is factorial.',
          ),
          MathBlock(r'O(n!)', semanticsLabel: 'big O of n factorial'),
          DefinitionBlock(
            term: 'Assignment Problem',
            definition:
                'Assign n people to n jobs so that each person gets one job and the total cost is as small as possible.',
          ),
          TextBlock(
            'The brute force assignment method also tries permutations. Each complete assignment is one ordering of choices, so this direct method also grows like O(n!).',
          ),
          DefinitionBlock(
            term: 'Knapsack Problem',
            definition:
                'Choose a subset of items that satisfies a target or optimizes value under a capacity limit.',
          ),
          TextBlock(
            'Knapsack is different because the search is over subsets. Each item creates a yes or no decision: include it or skip it. With n items, that creates up to 2ⁿ possible choices, so the brute force class is O(2ⁿ).',
          ),
          MathBlock(r'O(2^n)', semanticsLabel: 'big O of two to the n'),
          VisualizerLinkBlock(
            algorithmId: 'knapsack',
            label: 'Visualize Knapsack',
            description:
                'Connect the include-or-skip search idea to the app visualizer.',
          ),
          CodeBlock(
            'search(i, target):\n'
            '  if target = 0: return true\n'
            '  if target < 0: return false\n'
            '  if i = n: return false\n'
            '  if search(i + 1, target − weight[i]): return true\n'
            '  return search(i + 1, target)',
            language: 'text',
          ),
          TextBlock(
            'This recursion is organized, but it does not magically change the worst case. If the algorithm must explore almost every subset, the cost remains exponential.',
          ),
          QuizBlock(
            question: 'Why does brute force knapsack have exponential growth?',
            options: [
              'Each item creates an include-or-skip choice',
              'Each city must be visited in every possible order',
              'The input is always sorted first',
              'The algorithm only checks adjacent pairs',
            ],
            correctIndex: 0,
            explanation:
                'With n yes-or-no choices, the subset search space can contain 2ⁿ paths.',
          ),
          KeyTakeawayBlock(
            'TSP and Assignment search permutations, giving factorial growth. Knapsack searches subsets, giving exponential growth. The shape of the search space matters.',
          ),
        ],
      ),
      ModuleContent(
        id: 'lesson4_module3',
        title: 'Interval Scheduling',
        order: 2,
        algorithmId: 'activity-selection',
        contentBlocks: [
          TextBlock(
            'Interval Scheduling asks which time requests can share one resource as non-overlapping requests. Imagine one classroom and many rental requests. If two intervals overlap, you cannot accept both.',
          ),
          DefinitionBlock(
            term: 'Compatible intervals',
            definition:
                'Intervals that do not overlap, so they can all be accepted for the same resource.',
          ),
          MathBlock(
            r's(i) \text{ is the start time, and } f(i) \text{ is the finish time}',
            semanticsLabel: 's of i is start time and f of i is finish time',
          ),
          TextBlock(
            'Pure brute force would list all subsets of requests, reject the conflicting subsets, and choose the best compatible one. That works in theory, but it is expensive.',
          ),
          DefinitionBlock(
            term: 'Greedy rule',
            definition:
                'A local choice rule that commits immediately and then continues with what remains.',
          ),
          TextBlock(
            'The smart rule for this problem is simple: always choose the request that finishes first. Finishing early leaves as much room as possible for future requests. During the scan, a request is safe when its start time is ≥ the last accepted finish time. In short, we need s(j) ≥ f before accepting request j.',
          ),
          VisualizerLinkBlock(
            algorithmId: 'activity-selection',
            label: 'Visualize Activity Selection',
            description:
                'This is the app visualizer that matches interval scheduling by earliest finish time.',
          ),
          CodeBlock(
            'sort requests by finish time\n'
            'A = empty accepted set\n'
            'lastFinish = −∞\n'
            'for each request j in sorted order:\n'
            '  if s(j) ≥ lastFinish:\n'
            '    add j to A\n'
            '    lastFinish = f(j)\n'
            'return A',
            language: 'text',
          ),
          MathBlock(
            r's(j) \ge f',
            semanticsLabel: 'start time of j is at least f',
          ),
          TextBlock(
            'Sorting the n requests by finish time costs O(n log n). After sorting, the scan is one pass. Each request needs only a constant amount of work, so the scan costs O(n).',
          ),
          MathBlock(
            r'O(n \log n) + O(n) = O(n \log n)',
            semanticsLabel: 'n log n plus n equals n log n',
          ),
          DefinitionBlock(
            term: 'Priority queue note',
            definition:
                'A priority queue can repeatedly give the earliest finish time, but it does not improve the overall O(n log n) efficiency class here.',
          ),
          TextBlock(
            'This module is a bridge. It starts from brute force thinking, then uses one clear design insight to reach a cleaner greedy method.',
          ),
          QuizBlock(
            question:
                'Why does choosing the request that finishes first make sense?',
            options: [
              'It leaves the most room for later compatible intervals',
              'It accepts every request automatically',
              'It avoids sorting entirely',
              'It changes the scan into O(2ⁿ)',
            ],
            correctIndex: 0,
            explanation:
                'An early finish gives future requests the best chance to fit without overlap.',
          ),
          KeyTakeawayBlock(
            'A small design insight can turn a messy subset search into a clean O(n log n) scheduling algorithm.',
          ),
        ],
      ),
      ModuleContent(
        id: 'lesson4_module4',
        title: 'Lesson 4 Conclusion',
        order: 3,
        algorithmId: null,
        contentBlocks: [
          TextBlock(
            'Nice work. Lesson 4 began the design half of the course with the most basic technique: brute force.',
          ),
          DefinitionBlock(
            term: 'Main lesson',
            definition:
                'A simple correct algorithm is often where good design begins, even when it is not where design ends.',
          ),
          TextBlock(
            'We saw direct algorithms such as Selection Sort, Bubble Sort, Sequential Search, and brute force string matching. We also saw exhaustive search problems such as Travelling Salesman, Assignment, and Knapsack.',
          ),
          TextBlock(
            'The common theme was search. Sometimes we search an array. Sometimes we search possible pattern positions. Sometimes we search a huge solution space for the best answer.',
          ),
          VisualizerLinkBlock(
            algorithmId: 'linear-search',
            label: 'Review Sequential Search',
            description:
                'Use the visualizer to connect brute force search with a concrete array example.',
          ),
          TextBlock(
            'Brute force is not useless just because it can be slow. It is easy to invent, usually easy to explain, and useful as a baseline for comparing better algorithms.',
          ),
          TextBlock(
            'The warning is growth: factorial algorithms such as O(n!) and exponential algorithms such as O(2ⁿ) become impractical quickly. That is why later lessons introduce more structured design methods.',
          ),
          TextBlock(
            'Lesson 5 continues the search theme with depth-first search and breadth-first search. These are still search techniques, but they organize the search more carefully for graph-like problems.',
          ),
          VisualizerLinkBlock(
            algorithmId: 'dfs',
            label: 'Preview DFS',
            description:
                'Depth-first search is one of the next structured search tools.',
          ),
          VisualizerLinkBlock(
            algorithmId: 'bfs',
            label: 'Preview BFS',
            description:
                'Breadth-first search explores by distance from the start.',
          ),
          QuizBlock(
            question: 'What is the best reason to study brute force?',
            options: [
              'It gives a correct baseline and helps reveal the problem structure',
              'It is always the fastest algorithm',
              'It avoids the need for analysis',
              'It only applies to sorting problems',
            ],
            correctIndex: 0,
            explanation:
                'Brute force is a practical starting point. It helps us understand what a better design must improve.',
          ),
          KeyTakeawayBlock(
            'First make it work. Then understand it. Then improve it. That is the design habit Lesson 4 builds.',
          ),
        ],
      ),
    ],
  ),

  // ── Lesson 5 ───────────────────────────────────────────────────────────────
  LessonContent(
    id: 5,
    title: 'DFS and BFS',
    categoryColor: '#10B981',
    modules: [
      ModuleContent(
        id: 'lesson5_module1',
        title: 'Introduction to DFS and BFS',
        order: 0,
        algorithmId: 'dfs',
        contentBlocks: [
          TextBlock(
            'In earlier lessons we looked at brute force, exhaustive search, and interval scheduling. Now we move into two very important graph-search techniques: Depth-First Search and Breadth-First Search.',
          ),
          TextBlock(
            'These two algorithms solve the same core problems in very different ways:\n\n1. Visit every vertex in a graph.\n2. Find a particular key in a graph.',
          ),
          TextBlock(
            'This is the first graph-focused lesson, so if graph vocabulary feels rusty it is worth reviewing the basics before going deeper.',
          ),
          DefinitionBlock(
            term: 'Vertex',
            definition:
                'A point in a graph where edges meet. Sometimes called a node.',
          ),
          DefinitionBlock(
            term: 'Edge',
            definition:
                'A connection between two vertices. Edges can be directed or undirected.',
          ),
          TextBlock(
            'Graphs show up everywhere: mazes, road networks, social connections, webpage links, task dependencies. Once a problem is modeled as a graph, the first question is: how do we move through it systematically without getting lost, repeating work, or missing something important? DFS and BFS are the answer.',
          ),
          DefinitionBlock(
            term: 'Depth-First Search (DFS)',
            definition:
                'Explores as far as possible down one path before backing up. Uses a stack to track the current path.',
          ),
          DefinitionBlock(
            term: 'Breadth-First Search (BFS)',
            definition:
                'Explores level by level, visiting all neighbors before moving deeper. Uses a queue to track discovered vertices.',
          ),
          TextBlock(
            'A good way to picture both is a maze. Every decision point is a vertex, every hallway between two points is an edge. Then finding a way through the maze is exactly a graph-search problem.',
          ),
          TextBlock(
            'In a maze you usually care about one of two things: visiting all reachable places, or finding a specific goal such as the exit. You also want to avoid walking in circles or repeating the same work unnecessarily. DFS and BFS both solve this, but they do it in very different styles.',
          ),
          VisualizerLinkBlock(
            algorithmId: 'dfs',
            label: 'See DFS in action',
            description: 'Watch depth-first search explore a graph',
          ),
          VisualizerLinkBlock(
            algorithmId: 'bfs',
            label: 'See BFS in action',
            description: 'Watch breadth-first search explore a graph',
          ),
          KeyTakeawayBlock(
            'DFS goes deep first using a stack. BFS spreads outward level by level using a queue. Both visit every vertex, but the order and the paths they produce are very different.',
          ),
        ],
      ),
      ModuleContent(
        id: 'lesson5_module2',
        title: 'Finding Keys with DFS, BFS, and Best-First Search',
        order: 1,
        algorithmId: 'dfs',
        contentBlocks: [
          TextBlock(
            'Module 1 introduced DFS and BFS as systematic ways to explore a graph. Now we use them for a more specific job: finding a key, also called a goal state, inside a state space.',
          ),
          TextBlock(
            'The algorithms here use an iterative open and closed list style. The names are simple. Open stores states we have discovered but not fully processed. Closed stores states we have already explored.',
          ),
          DefinitionBlock(
            term: 'Open list',
            definition:
                'The collection of discovered states waiting to be expanded. DFS, BFS, and Best-First Search differ mainly in how they choose the next state from open.',
          ),
          DefinitionBlock(
            term: 'Closed list',
            definition:
                'The collection of states that have already been expanded. It prevents the search from revisiting the same state forever.',
          ),
          TextBlock(
            'In iterative DFS, open behaves like a stack. Remove the leftmost state, test whether it is the key, generate its children, discard children already on open or closed, then place the remaining children on the left end of open.',
          ),
          CodeBlock(
            'DFS key search:\n'
            'open = [Start]\n'
            'closed = []\n\n'
            'while open is not empty:\n'
            '  X = remove leftmost state from open\n'
            '  if X is the key: return SUCCESS\n'
            '  children = generate children of X\n'
            '  discard children already on open or closed\n'
            '  add remaining children to the left end of open\n'
            '  add X to closed\n\n'
            'return FAILURE',
            language: 'text',
          ),
          TextBlock(
            'That left-end insertion is the stack-like move. It makes DFS chase the most recently discovered child first, so the search tends to go deep before it spreads out.',
          ),
          VisualizerLinkBlock(
            algorithmId: 'dfs',
            label: 'Visualize DFS key search',
            description: 'Watch the stack-like search order go deep first.',
          ),
          TextBlock(
            'BFS uses nearly the same structure, but open behaves like a queue. Remove from the left, generate children, discard repeats, then add the remaining children to the right end of open.',
          ),
          CodeBlock(
            'BFS key search:\n'
            'open = [Start]\n'
            'closed = []\n\n'
            'while open is not empty:\n'
            '  X = remove leftmost state from open\n'
            '  if X is the key: return SUCCESS\n'
            '  children = generate children of X\n'
            '  discard children already on open or closed\n'
            '  add remaining children to the right end of open\n'
            '  add X to closed\n\n'
            'return FAILURE',
            language: 'text',
          ),
          TextBlock(
            'That single left-end versus right-end change switches the behavior. DFS goes deep first. BFS explores all states at distance 1, then distance 2, and so on. If the search space is finite, the key is reachable, and repeated states are blocked, both can find the key.',
          ),
          TextBlock(
            'BFS has an extra guarantee in an unweighted state space. Because it explores by distance from the start, the first key it finds is on a shortest path by number of steps. DFS may find a key sooner in lucky cases, but it does not guarantee a shortest path.',
          ),
          VisualizerLinkBlock(
            algorithmId: 'bfs',
            label: 'Visualize BFS key search',
            description: 'Watch the queue-like search order expand by layers.',
          ),
          DefinitionBlock(
            term: 'Best-First Search',
            definition:
                'A heuristic search strategy that chooses the open state that appears most promising, usually the state with the smallest heuristic value h(X).',
          ),
          DefinitionBlock(
            term: 'Heuristic',
            definition:
                'Extra guidance that estimates which state looks closer to the goal. It can help the search, but it can also be wrong.',
          ),
          TextBlock(
            'Best-First Search keeps open and closed, but each state in open has a heuristic value h(X). Instead of treating open as only a stack or queue, it keeps open ordered by heuristic merit and removes the state that currently looks best.',
          ),
          CodeBlock(
            'Best-First key search:\n'
            'open = [Start with h(Start)]\n'
            'closed = []\n\n'
            'while open is not empty:\n'
            '  X = remove state with best h value\n'
            '  if X is the key: return path from Start to X\n'
            '  children = generate children of X\n'
            '  for each child Y:\n'
            '    if Y is new, compute h(Y) and add Y to open\n'
            '    if Y was seen before, keep the better path when needed\n'
            '  add X to closed\n'
            '  reorder open by heuristic merit\n\n'
            'return FAILURE',
            language: 'text',
          ),
          TextBlock(
            'The 8-puzzle is a classic example. Each board arrangement is a state, and each move slides one tile into the blank square. DFS or BFS can solve it, but the state space is large, so a useful heuristic can save a lot of work.',
          ),
          DefinitionBlock(
            term: '8-puzzle state',
            definition:
                'One arrangement of the eight numbered tiles and the blank square on a 3 by 3 board.',
          ),
          TextBlock(
            'Two common 8-puzzle heuristics are the number of tiles out of place and the sum of tile distances from their correct positions. The distance-sum version is usually more informative because it cares about how far each tile must move, not only whether it is wrong.',
          ),
          CodeBlock(
            '8-puzzle heuristic examples:\n'
            'h1 = number of tiles out of place\n'
            'h2 = sum of tile distances from goal positions',
            language: 'text',
          ),
          TextBlock(
            'Heuristics are powerful, but they are not magic. A misleading heuristic can send the search toward states that look close to the goal while the real solution is elsewhere.',
          ),
          DefinitionBlock(
            term: 'Topological sort',
            definition:
                'A linear ordering of vertices in a directed graph such that every directed edge U to V places U before V.',
          ),
          TextBlock(
            'DFS also supports topological sorting. This matters for dependency problems: factory assembly steps, prerequisite courses, and tasks where one job must happen before another.',
          ),
          DefinitionBlock(
            term: 'Directed acyclic graph (DAG)',
            definition:
                'A directed graph with no directed cycles. A graph has a topological sort exactly when its dependency structure has no directed cycle.',
          ),
          TextBlock(
            'The DFS method is: run DFS, record vertices when they finish, and watch for back edges. If a back edge appears, the graph has a directed cycle and no topological sort exists. Otherwise, reverse the finish-time order to get a topological ordering.',
          ),
          CodeBlock(
            'Topological sort with DFS:\n'
            'run DFS on the directed graph\n'
            'if a back edge is found: report no topological sort\n'
            'record each vertex when it finishes\n'
            'reverse the finish-time order\n'
            'return that order',
            language: 'text',
          ),
          TextBlock(
            'There is another topological sorting method that repeatedly removes vertices with no incoming edges. That version is a decrease-by-one idea, so it connects naturally to the next lesson on decrease-and-conquer.',
          ),
          QuizBlock(
            question:
                'What single open-list change switches the iterative version from DFS to BFS?',
            options: [
              'DFS adds children to the left end, while BFS adds them to the right end.',
              'DFS never uses a closed list.',
              'BFS ignores goal states.',
              'BFS sorts all states by heuristic value.',
            ],
            correctIndex: 0,
            explanation:
                'Both versions remove from the left. DFS adds new children to the left like a stack. BFS adds them to the right like a queue.',
          ),
          QuizBlock(
            question:
                'Why can Best-First Search be faster than blind DFS or BFS?',
            options: [
              'It always proves the shortest path.',
              'It uses a heuristic to expand states that look closer to the goal.',
              'It never needs open or closed lists.',
              'It only works on trees with no repeated states.',
            ],
            correctIndex: 1,
            explanation:
                'A heuristic gives extra guidance. Good guidance can focus the search on promising states before exploring less useful ones.',
          ),
          QuizBlock(
            question: 'When does a directed graph have a topological sort?',
            options: [
              'When it is a DAG with no directed cycles.',
              'When every vertex has exactly two outgoing edges.',
              'When DFS finds a back edge.',
              'When BFS visits vertices alphabetically.',
            ],
            correctIndex: 0,
            explanation:
                'A directed cycle creates circular dependency, so no valid topological order exists. A DAG avoids that problem.',
          ),
          KeyTakeawayBlock(
            'DFS, BFS, and Best-First Search all manage discovered states with open and closed lists. DFS goes deep, BFS goes broad and finds shortest paths by step count, and Best-First uses a heuristic to guess which state looks most promising. DFS also powers topological sorting for DAGs.',
          ),
        ],
      ),
      ModuleContent(
        id: 'lesson5_module3',
        title: 'Breadth-First Search',
        order: 2,
        algorithmId: 'bfs',
        contentBlocks: [
          TextBlock(
            'In BFS we do not dive deeply down one path first. Instead we explore level by level: visit the start vertex, then all of its children, then all of their children, then the next layer, and so on.',
          ),
          TextBlock(
            'In maze language, BFS is like a wave spreading outward from the starting point. Instead of chasing one path far away, BFS explores all nearby options first.',
          ),
          TextBlock(
            'A queue is the ideal data structure for BFS because BFS follows a "first discovered, first processed" pattern. Insert the starting vertex into the queue, remove vertices from the front, add newly discovered children to the back, and repeat until the queue is empty.',
          ),
          DefinitionBlock(
            term: 'BFS forest',
            definition:
                'The collection of breadth-first trees produced by BFS, especially when the graph is disconnected.',
          ),
          DefinitionBlock(
            term: 'Tree edge',
            definition:
                'An edge used to discover a new vertex in the BFS tree.',
          ),
          DefinitionBlock(
            term: 'Cross edge',
            definition:
                'An edge that connects vertices in a way that is not a tree-discovery edge, often connecting vertices in the same or nearby levels of the BFS structure.',
          ),
          VisualizerLinkBlock(
            algorithmId: 'bfs',
            label: 'Visualize BFS step by step',
            description: 'See how the queue expands layer by layer',
          ),
          TextBlock(
            'Again start at A. Think of BFS as people fanning out from A.\n\nFirst layer: visit A.\n\nSecond layer: visit B and C.\n\nThird layer: from B and C, continue outward to new reachable vertices such as D.\n\nLater layers continue outward through E, then F and G, depending on the allowed directed edges and already visited vertices. The result is a breadth-first spanning tree.',
          ),
          CodeBlock(
            'BFS(G, start):\n  visited = empty set\n  queue = [start]\n\n  while queue is not empty:\n    v = queue.pop(0)    # front of queue\n    if v not in visited:\n      visit(v)          # process vertex\n      visited.add(v)\n      for each neighbor u of v:\n        if u not in visited:\n          queue.append(u)   # add to back\n\n  return visited',
            language: 'text',
          ),
          KeyTakeawayBlock(
            'BFS uses a queue to process vertices in layers. The first time BFS reaches a vertex it has found the shortest path measured by edge count.',
          ),
        ],
      ),
      ModuleContent(
        id: 'lesson5_module4',
        title: 'Graph Representations',
        order: 3,
        contentBlocks: [
          TextBlock(
            'To analyze DFS or BFS properly we need to understand how the graph is stored in memory. Two common representations are adjacency matrix and adjacency linked list.',
          ),
          DefinitionBlock(
            term: 'Adjacency matrix',
            definition:
                'A 2D table where entry (i, j) tells us whether there is an edge from vertex i to vertex j. Often stores 1 for an edge and 0 for no edge.',
          ),
          TextBlock(
            'The matrix has one entry for every possible ordered pair of vertices. With |V| vertices, the matrix has |V|² entries. This representation is easy to check but uses space for every possible pair, even when no edge exists.',
          ),
          MathBlock(
            r'Memory\ adjacency\ matrix = \Theta(|V|^2)',
            semanticsLabel: 'adjacency matrix memory',
          ),
          DefinitionBlock(
            term: 'Adjacency linked list',
            definition:
                'For each vertex, store a list of the vertices it points to. Only the edges that actually exist are stored.',
          ),
          TextBlock(
            'With |V| vertices and |E| edges, this uses space for |V| list heads plus |E| list entries. This is often much better for sparse graphs where |E| is much smaller than |V|².',
          ),
          MathBlock(
            r'Memory\ adjacency\ list = \Theta(|V| + |E|)',
            semanticsLabel: 'adjacency list memory',
          ),
          TextBlock(
            'The right representation depends on the graph. If the graph is dense, |E| can be close to |V|² and the two representations have similar order of growth. If the graph is sparse, adjacency linked lists are usually better because |V| + |E| is much smaller than |V|².',
          ),
          KeyTakeawayBlock(
            'Adjacency matrix is simple but costs Theta(|V|²) space. Adjacency linked list costs Theta(|V| + |E|) and works well for sparse graphs.',
          ),
        ],
      ),
      ModuleContent(
        id: 'lesson5_module5',
        title: 'Efficiency and When to Use Each',
        order: 4,
        contentBlocks: [
          TextBlock(
            'DFS and BFS have the same asymptotic cost because both examine the graph structure once in a systematic way. With an adjacency matrix the running time is Theta(|V|²). With an adjacency linked list the running time is Theta(|V| + |E|).',
          ),
          MathBlock(
            r'T(n)_{matrix} = \Theta(|V|^2)',
            semanticsLabel: 'matrix-based search efficiency',
          ),
          MathBlock(
            r'T(n)_{list} = \Theta(|V| + |E|)',
            semanticsLabel: 'list-based search efficiency',
          ),
          TextBlock(
            'The big difference between DFS and BFS is not asymptotic cost. The real difference is how they explore the graph and what each is better suited for.',
          ),
          DefinitionBlock(
            term: 'When to choose DFS',
            definition:
                'DFS is good for tasks that need to explore all possible paths, detecting cycles, or finding connected components. The stack-based nature makes it natural for recursive-style exploration.',
          ),
          DefinitionBlock(
            term: 'When to choose BFS',
            definition:
                'BFS is especially useful for finding the shortest path in terms of number of edges. Because BFS explores in layers, the first time it reaches a vertex it has found the shortest path to that vertex. This is one of the biggest practical strengths of BFS.',
          ),
          TextBlock('Answer these questions to check your understanding.'),
          QuizBlock(
            question: 'Why is a stack the natural ADT for DFS?',
            options: [
              'Because DFS processes vertices in alphabetical order',
              'Because the most recently discovered vertex is the one we may need to backtrack to first',
              'Because a stack can store the full graph adjacency list',
              'Because DFS always needs to find the shortest path',
            ],
            explanation:
                'A stack follows LIFO order, which matches DFS backtracking behavior: the last vertex we visited is the first one we may need to return to when the current path ends.',
            correctIndex: 1,
          ),
          QuizBlock(
            question:
                'Why is BFS especially good for shortest-path-by-edges problems?',
            options: [
              'Because BFS uses less memory than DFS',
              'Because BFS explores vertices in the order they were discovered',
              'Because BFS explores in layers, so the first time it reaches a vertex it has used the fewest edges',
              'Because BFS can detect cycles more efficiently than DFS',
            ],
            explanation:
                'BFS visits vertices in layers by distance from the start. The first time any vertex is reached, it is via the smallest possible number of edges.',
            correctIndex: 2,
          ),
          QuizBlock(
            question:
                'A graph has many vertices but very few edges. Which representation is usually better?',
            options: [
              'Adjacency matrix, because it is easier to access',
              'Adjacency matrix, because the graph is small',
              'Adjacency linked list, because it only stores the edges that exist',
              'Both are identical for this type of graph',
            ],
            explanation:
                'When the graph is sparse, |E| is much smaller than |V|². Adjacency linked list stores only existing edges, so it uses Theta(|V| + |E|) instead of Theta(|V|²).',
            correctIndex: 2,
          ),
          QuizBlock(
            question:
                'DFS and BFS can have the same asymptotic efficiency but still behave very differently. Why?',
            options: [
              'They use different programming languages',
              'Asymptotic notation only measures worst-case input size, not the order of vertex visits',
              'They both run on the same hardware',
              'Efficiency and behavior are always the same thing',
            ],
            explanation:
                'Asymptotic efficiency measures the growth rate of cost with input size, not the actual visiting order or the paths produced. Theta(|V| + |E|) is the same for both, but DFS produces deep narrow trees while BFS produces wide shallow trees.',
            correctIndex: 1,
          ),
          KeyTakeawayBlock(
            'DFS and BFS are both Theta(|V| + |E|) on linked-list graphs, but they explore in very different orders. Use DFS for exhaustive exploration and cycle detection. Use BFS for shortest-path by edge count.',
          ),
        ],
      ),
      ModuleContent(
        id: 'lesson5_module6',
        title: 'Conclusion',
        order: 5,
        contentBlocks: [
          TextBlock(
            'In Lesson 5 we introduced problems on graphs and explored three search styles: depth-first search, breadth-first search, and heuristic search.',
          ),
          TextBlock(
            'We saw how many problems can be modeled with a graph. Once the model is a graph, DFS and BFS give us disciplined ways to visit states, find keys, avoid repeated work, and reason about paths.',
          ),
          TextBlock(
            'DFS goes deep first. BFS goes broad first and finds shortest paths by edge count in unweighted state spaces. Best-First Search adds a heuristic so the search can focus on states that appear closer to the goal.',
          ),
          TextBlock(
            'We also saw an important DFS application: topological sort. It orders tasks in a directed acyclic graph so that every prerequisite appears before the task that depends on it.',
          ),
          TextBlock(
            'Topological sort is also a bridge to Lesson 6. The version that repeatedly removes a vertex with no incoming edges is a decrease-and-conquer algorithm because the problem shrinks one vertex at a time.',
          ),
          VisualizerLinkBlock(
            algorithmId: 'dfs',
            label: 'Explore DFS visualizer',
            description: 'Interactive animation of depth-first search',
          ),
          VisualizerLinkBlock(
            algorithmId: 'bfs',
            label: 'Explore BFS visualizer',
            description: 'Interactive animation of breadth-first search',
          ),
          KeyTakeawayBlock(
            'Lesson 5 turns graph search into a toolkit: DFS for deep exploration and topological sorting, BFS for layer-by-layer shortest paths, and heuristic search for goal-directed exploration. Lesson 6 continues with decrease-and-conquer strategy.',
          ),
        ],
      ),
    ],
  ),

  // ── Lesson 6 ───────────────────────────────────────────────────────────────
  LessonContent(
    id: 6,
    title: 'Decrease and Conquer',
    categoryColor: '#0EA5E9',
    modules: [
      ModuleContent(
        id: 'lesson6_module1',
        title: 'Introduction to Decrease and Conquer',
        order: 0,
        algorithmId: null,
        contentBlocks: [
          TextBlock(
            'Welcome to Lesson 6. We now study a major algorithm design technique called decrease and conquer.',
          ),
          TextBlock(
            'The core idea is simple: make the problem smaller, solve the smaller version, then use that solution to finish the original problem.',
          ),
          DefinitionBlock(
            term: 'Decrease and conquer',
            definition:
                'An algorithm design strategy that reduces a problem to one smaller version of the same problem, solves that smaller problem, and extends the answer.',
          ),
          TextBlock(
            'This question drives the whole lesson: how can we turn the current problem into a smaller version of itself?',
          ),
          TextBlock(
            'The technique matters because many hard problems become manageable once we find the right way to shrink them. Insertion Sort and Binary Search are classic examples.',
          ),
          DefinitionBlock(
            term: 'Decrease by a constant',
            definition:
                'Each step reduces the input size by a fixed amount, such as n to n − 1 or n to n − 2.',
          ),
          DefinitionBlock(
            term: 'Decrease by a constant factor',
            definition:
                'Each step reduces the input size by a fixed fraction, such as n to n / 2 or n to n / 3.',
          ),
          DefinitionBlock(
            term: 'Variable-size decrease',
            definition:
                'Each step reduces the problem, but the amount removed can change from one step to another.',
          ),
          CodeBlock(
            'Common decrease patterns:\n'
            'constant decrease: n \u2192 n \u2212 1\n'
            'constant-factor decrease: n \u2192 n / 2\n'
            'variable-size decrease: n \u2192 n \u2212 k, where k changes',
            language: 'text',
          ),
          TextBlock(
            'A useful picture is carving a sculpture from stone. You do not reveal the whole shape in one hit. You remove one part, then another, until the final answer becomes clear.',
          ),
          TextBlock(
            'Insertion Sort uses the sorted part of size i − 1 to create a sorted part of size i. That is decrease by one, viewed from the smaller solved problem upward.',
          ),
          VisualizerLinkBlock(
            algorithmId: 'insertion-sort',
            label: 'Preview Insertion Sort',
            description: 'Watch a sorted prefix grow one element at a time.',
          ),
          TextBlock(
            'Binary Search is different. It discards about half of the remaining search space after each comparison, so the problem size changes from n to n / 2.',
          ),
          VisualizerLinkBlock(
            algorithmId: 'binary-search',
            label: 'Preview Binary Search',
            description: 'Watch the search range shrink by a constant factor.',
          ),
          TextBlock(
            'Lesson 5 also connects here. Topological sort by repeatedly removing sources is decrease by a constant because each step removes one vertex and its outgoing edges.',
          ),
          DefinitionBlock(
            term: 'Decrease versus divide',
            definition:
                'Decrease and conquer keeps one main smaller subproblem. Divide and conquer splits the input into several subproblems and combines their answers.',
          ),
          TextBlock(
            'To recognize this strategy, ask whether the algorithm creates one smaller version of the same problem, then whether the decrease is by a fixed amount, a fixed factor, or a changing amount.',
          ),
          QuizBlock(
            question: 'Which pattern best describes Binary Search?',
            options: [
              'Decrease by a constant factor',
              'Decrease by one',
              'Divide into many independent subproblems',
              'Exhaustive search over every ordering',
            ],
            correctIndex: 0,
            explanation:
                'Binary Search discards about half the remaining range each step, so the problem shrinks from n to n / 2.',
          ),
          QuizBlock(
            question:
                'What is the main difference between decrease and conquer and divide and conquer?',
            options: [
              'Decrease and conquer usually keeps one main smaller subproblem, while divide and conquer solves several.',
              'Decrease and conquer never uses recursion.',
              'Divide and conquer only applies to graphs.',
              'They are two names for exactly the same strategy.',
            ],
            correctIndex: 0,
            explanation:
                'The key distinction is one smaller subproblem versus several smaller subproblems that must be combined.',
          ),
          KeyTakeawayBlock(
            'Decrease and conquer solves a problem by shrinking it to one smaller version. The decrease can be by a constant, by a constant factor, or by a variable amount.',
          ),
        ],
      ),
      ModuleContent(
        id: 'lesson6_module2',
        title: 'Insertion Sort: Decrease by One',
        order: 1,
        algorithmId: 'insertion-sort',
        contentBlocks: [
          TextBlock(
            'Insertion Sort is a classic decrease-by-one algorithm. It keeps a sorted prefix on the left and inserts one new element into that prefix at each step.',
          ),
          TextBlock(
            'The everyday picture is a card player building a hand. Each new card is placed where it belongs among the cards already sorted in the hand.',
          ),
          DefinitionBlock(
            term: 'Sorted prefix',
            definition:
                'The left part of the array that is already in sorted order before the next element is inserted.',
          ),
          CodeBlock(
            'Insertion Sort idea:\n'
            'start with the first element sorted\n'
            'for each next element x:\n'
            '  compare x with items before it\n'
            '  shift larger items one position right\n'
            '  place x in the open position',
            language: 'text',
          ),
          TextBlock(
            'At step i, the algorithm assumes the first i − 1 elements are already sorted. It then inserts the ith element into its correct position among them.',
          ),
          TextBlock(
            'That is exactly the decrease-and-conquer pattern. A sorted problem of size i − 1 helps solve the slightly larger problem of size i.',
          ),
          VisualizerLinkBlock(
            algorithmId: 'insertion-sort',
            label: 'Visualize Insertion Sort',
            description:
                'See the sorted prefix expand as each new item is inserted.',
          ),
          TextBlock(
            'The basic operation is comparison. In the worst case, the input is reverse sorted, so every new element must move across the entire sorted prefix before it reaches the correct position.',
          ),
          CodeBlock(
            'Worst-case comparisons:\n'
            'i = 2 gives 1 comparison\n'
            'i = 3 gives 2 comparisons\n'
            'i = 4 gives 3 comparisons\n'
            '...\n'
            'i = n gives n − 1 comparisons',
            language: 'text',
          ),
          MathBlock(
            r'1 + 2 + 3 + \cdots + (n - 1) = \frac{n(n - 1)}{2}',
            semanticsLabel: 'sum of insertion sort worst case comparisons',
          ),
          MathBlock(
            r'T_{worst}(n) = \Theta(n^2)',
            semanticsLabel: 'insertion sort worst case is theta n squared',
          ),
          TextBlock(
            'The best case happens when the array is already sorted. Each new element needs only one comparison to confirm that it is already in the right place.',
          ),
          MathBlock(
            r'T_{best}(n) = \Theta(n)',
            semanticsLabel: 'insertion sort best case is theta n',
          ),
          TextBlock(
            'The average case is still quadratic. Across all input arrangements, an inserted item usually travels about halfway through the sorted prefix, and those costs still add up like n².',
          ),
          MathBlock(
            r'T_{average}(n) = \Theta(n^2)',
            semanticsLabel: 'insertion sort average case is theta n squared',
          ),
          DefinitionBlock(
            term: 'Stable sort',
            definition:
                'A sort that keeps equal items in their original relative order. Insertion Sort is stable when implemented by shifting instead of swapping past equal items.',
          ),
          TextBlock(
            'Insertion Sort is still useful because it is simple, has low overhead, works well on small arrays, and can be very fast when the data is nearly sorted.',
          ),
          TextBlock(
            'Many practical sorting systems use Insertion Sort as a finishing step for tiny or nearly sorted sections after another algorithm has done most of the work.',
          ),
          QuizBlock(
            question:
                'Why is a reverse-sorted array a worst case for Insertion Sort?',
            options: [
              'Each new element must move past every item in the sorted prefix.',
              'The array is already sorted.',
              'Binary Search must be used first.',
              'There are no comparisons in reverse order.',
            ],
            correctIndex: 0,
            explanation:
                'When the input is reversed, every inserted item belongs at the beginning of the prefix, so it must be compared across the prefix.',
          ),
          QuizBlock(
            question: 'Why can Insertion Sort be good for nearly sorted data?',
            options: [
              'Most elements are already close to their final positions.',
              'It always runs in Θ(log n).',
              'It ignores the sorted prefix.',
              'It splits the input into several independent halves.',
            ],
            correctIndex: 0,
            explanation:
                'If elements are close to the right place, the inner loop does little shifting, so the practical cost can be low.',
          ),
          KeyTakeawayBlock(
            'Insertion Sort is decrease by one: use the sorted prefix of size i − 1 to build the sorted prefix of size i. Its worst and average cases are Θ(n²), while its best case is Θ(n).',
          ),
        ],
      ),
      ModuleContent(
        id: 'lesson6_module3',
        title: 'Shell Sort',
        order: 2,
        algorithmId: null,
        contentBlocks: [
          TextBlock(
            'Shell Sort is a variation of Insertion Sort that moves elements over larger distances earlier in the algorithm, instead of only one position at a time.',
          ),
          TextBlock(
            'This makes Shell Sort a decrease-and-conquer method with fixed but changing decreases. Each pass uses a different gap, and the gaps shrink over time.',
          ),
          DefinitionBlock(
            term: 'Gap symbol',
            definition:
                'The gap between compared elements in a Shell Sort pass. It is often written with the Greek letter delta.',
          ),
          MathBlock(
            r'\delta',
            semanticsLabel: 'delta, the Shell Sort gap symbol',
          ),
          TextBlock(
            'The problem with ordinary Insertion Sort is that a small element near the far right of the array may need many shifts before it reaches the front. Shell Sort tries to fix this by moving elements across larger gaps early.',
          ),
          TextBlock(
            'Shell Sort uses a decreasing gap sequence. In standard notation:',
          ),
          MathBlock(
            r'\delta_1, \delta_2, \ldots, \delta_k \quad \text{where} \quad \delta_k = 1',
            semanticsLabel:
                'gap sequence delta one through delta k, where delta k equals one',
          ),
          CodeBlock(
            'Shell Sort idea:\n'
            'choose gaps from largest to smallest\n'
            'for each gap in the sequence:\n'
            '    perform insertion sort on elements gap positions apart\n'
            'when the gap is 1, the array is fully sorted',
            language: 'text',
          ),
          TextBlock(
            'If the gap is 5, the groups being sorted are:\n'
            'positions 0, 5, 10, 15, ...\n'
            'positions 1, 6, 11, 16, ...\n'
            'positions 2, 7, 12, 17, ...\n'
            'and so on.',
          ),
          TextBlock(
            'A common gap sequence starts near one third of the array length, then divides the gap by 3 until the final gap is 1.',
          ),
          MathBlock(
            r'\delta \approx \frac{n}{3}',
            semanticsLabel: 'delta is approximately n divided by three',
          ),
          TextBlock(
            'As the gap shrinks, the disorder left in the array gets smaller. By the time the final gap of 1 runs, the array is close to sorted and the final insertion pass does very little work.',
          ),
          TextBlock(
            'Shell Sort is not one fixed algorithm. It is a family of algorithms whose behavior depends heavily on the chosen gap sequence. That is why its analysis is notoriously difficult.',
          ),
          DefinitionBlock(
            term: 'Gap sequence',
            definition:
                'The series of delta values used in a Shell Sort run. Different sequences lead to very different performance characteristics.',
          ),
          TextBlock(
            'A common empirical estimate for Shell Sort with reasonable gap sequences is:',
          ),
          MathBlock(
            r'\Theta(n^{1.25})',
            semanticsLabel: 'theta of n to the one point two five',
          ),
          TextBlock(
            'That estimate is not a universal bound. Some gap sequences have quadratic worst-case behavior, while others have better proven bounds.',
          ),
          MathBlock(r'\Theta(n^2)', semanticsLabel: 'theta of n squared'),
          TextBlock(
            'Unlike Insertion Sort where reverse order is clearly the worst case, Shell Sort\'s worst case depends on both the input arrangement and the chosen gap sequence. To answer "what is the worst case?" you must first specify the gap sequence.',
          ),
          DefinitionBlock(
            term: 'Shell Sort worst case',
            definition:
                'There is no single universal answer. The worst case depends on the gap sequence and the input together.',
          ),
          TextBlock(
            'Shell Sort sits between simple quadratic sorts and more advanced algorithms. It moves elements farther earlier, which often makes it noticeably faster than plain Insertion Sort on random inputs, even though its exact asymptotic behavior is hard to pin down.',
          ),
          QuizBlock(
            question:
                'Why does Shell Sort run faster than Insertion Sort on many inputs?',
            options: [
              'It moves elements over larger gaps early, reducing disorder before the final gap of 1 pass.',
              'It divides the array into multiple independent subarrays and sorts them separately.',
              'It uses binary search to find correct positions.',
              'It is not actually faster than Insertion Sort.',
            ],
            correctIndex: 0,
            explanation:
                'Large-gap passes move elements across long distances quickly, so the final small-gap passes do less work.',
          ),
          QuizBlock(
            question: 'Why is there no single worst-case bound for Shell Sort?',
            options: [
              'The performance depends on the gap sequence chosen, not just the input.',
              'Shell Sort is always logarithmic.',
              'Shell Sort is non-deterministic.',
              'The worst case is always the same as Insertion Sort.',
            ],
            correctIndex: 0,
            explanation:
                'Different gap sequences produce different shapes of disorder reduction, leading to different worst-case behaviors.',
          ),
          TextBlock(
            'For many practical gap sequences, the commonly cited empirical shape is:',
          ),
          MathBlock(
            r'\Theta(n^{1.25})',
            semanticsLabel: 'theta of n to the one point two five',
          ),
          KeyTakeawayBlock(
            'Shell Sort extends Insertion Sort with a sequence of decreasing gaps. Each pass reduces disorder at a fixed interval, and the final gap of 1 pass finishes the sort. Its exact bound depends on the gap sequence chosen.',
          ),
        ],
      ),
      ModuleContent(
        id: 'lesson6_module4',
        title: 'Binary Search: Decrease by a Constant Factor',
        order: 3,
        algorithmId: 'binary-search',
        contentBlocks: [
          TextBlock(
            'Binary Search solves the same problem as Sequential Search: finding whether a key exists in an array and at what index. The critical difference is that Binary Search requires a sorted array.',
          ),
          TextBlock(
            'At each step it compares the key to the middle element and discards the half of the array that cannot contain the key. This is decrease by a constant factor:',
          ),
          MathBlock(
            r'n \to \frac{n}{2}',
            semanticsLabel: 'n becomes n divided by two',
          ),
          DefinitionBlock(
            term: 'Decrease by a constant factor',
            definition:
                'Each step reduces the problem size by a fixed fraction, such as halving the remaining elements.',
          ),
          CodeBlock(
            'Binary Search on sorted array A[low..high]:\n'
            'while true:\n'
            '    if low > high: break   // search space empty\n'
            '    mid = floor((low + high) / 2)\n'
            '    if A[mid] == key: return mid\n'
            '    if A[mid] < key:  low  = mid + 1\n'
            '    else:             high = mid - 1\n'
            'return not found',
            language: 'text',
          ),
          TextBlock(
            'If the middle element is less than the key, everything left of mid is also less than the key, so the left half is discarded. If it is greater, the right half is discarded.',
          ),
          VisualizerLinkBlock(
            algorithmId: 'binary-search',
            label: 'Visualize Binary Search',
            description: 'Watch the search range halve at every step.',
          ),
          TextBlock(
            'After k steps, the remaining search space follows this formula:',
          ),
          MathBlock(
            r'\frac{n}{2^k}',
            semanticsLabel: 'n divided by two to the k',
          ),
          TextBlock(
            'The worst case stops when the range has size 1 or when the key is found. The number of steps is determined by:',
          ),
          MathBlock(
            r'2^k \ge n \Rightarrow k \ge \lceil \log_2 n \rceil',
            semanticsLabel:
                'two to the k is at least n, so k is at least ceiling log base 2 of n',
          ),
          MathBlock(
            r'T(n) = T(n/2) + O(1) \Rightarrow T(n) = O(\log n)',
            semanticsLabel: 'binary search recurrence and time complexity',
          ),
          MathBlock(
            r'\text{Worst case comparisons} = \lceil \log_2 n \rceil + 1',
            semanticsLabel: 'binary search worst case comparisons',
          ),
          TextBlock(
            'With 1024 elements, Binary Search needs at most 10 comparisons in the worst case. Sequential Search would need up to 1024.',
          ),
          MathBlock(
            r'\log_2(1024) = 10',
            semanticsLabel:
                'log base 2 of 1024 equals 10',
          ),
          DefinitionBlock(
            term: 'Duplicate elements in Binary Search',
            definition:
                'Standard Binary Search finds whichever occurrence it lands on first. It does not guarantee finding the lowest-indexed or highest-indexed copy of a key.',
          ),
          TextBlock(
            'Sequential Search, by contrast, always finds the first occurrence (lowest index) because it scans left to right. Binary Search jumps straight to a middle element, so with duplicates it may hit any copy.',
          ),
          TextBlock(
            'If you need the first occurrence of a duplicate, you can modify Binary Search to continue searching the left half after finding a match, narrowing until the true first position is found.',
          ),
          QuizBlock(
            question: 'Why does Binary Search require a sorted array?',
            options: [
              'Because discarding half of the array is only safe when the sorted property guarantees that half contains no valid answers.',
              'Because it uses the middle element as a pivot.',
              'Because it compares adjacent elements.',
              'It does not actually require a sorted array.',
            ],
            correctIndex: 0,
            explanation:
                'The halving step is only valid when the array is sorted, since that is what guarantees the discarded half is provably impossible to contain the key.',
          ),
          QuizBlock(
            question:
                'How many steps does Binary Search need in the worst case for an array of 1024 items?',
            options: ['10', '1024', '512', '32'],
            correctIndex: 0,
            explanation:
                'Each step halves the range. After 10 halvings, a range of 1024 elements is reduced to size 1.',
          ),
          QuizBlock(
            question:
                'If a sorted array [1, 3, 5, 5, 5, 7, 9] contains three copies of 5, which one does standard Binary Search find?',
            options: [
              'Whichever copy it lands on first during the splitting process.',
              'The first (leftmost) occurrence.',
              'The last (rightmost) occurrence.',
              'None of them.',
            ],
            correctIndex: 0,
            explanation:
                'Binary Search stops as soon as it lands on any matching element. It makes no guarantee about which duplicate is found.',
          ),
          MathBlock(r'O(\log n)', semanticsLabel: 'big O of log n'),
          KeyTakeawayBlock(
            'Binary Search is the classic decrease-by-a-constant-factor algorithm. It halves the search range each step, giving logarithmic worst-case time. It requires a sorted array, and standard Binary Search makes no guarantee about which duplicate it finds.',
          ),
        ],
      ),

      // ── Module 5: Analysis of Binary Search ──────────────────────────────
      ModuleContent(
        id: 'lesson6_module5',
        title: 'Analysis of Binary Search',
        order: 4,
        algorithmId: 'binary-search',
        contentBlocks: [
          TextBlock(
            'In the previous module we described the idea of Binary Search. Now we analyze its running time more carefully.',
          ),
          DefinitionBlock(
            term: 'Basic operation',
            definition:
                'For Binary Search, the basic operation is a comparison between the key we are looking for and an array element.',
          ),
          TextBlock(
            'We are interested in how many comparisons happen in the worst case.',
          ),
          TextBlock(
            'There are two natural worst-case situations: the element is not in the array at all, or the element is in the array but the search only finds that out after examining the maximum possible number of positions.',
          ),
          TextBlock(
            'In both cases, the algorithm keeps splitting the array until the remaining part becomes size 1. The worst case always corresponds to the maximum number of splitting steps.',
          ),
          DefinitionBlock(
            term: 'Recurrence for the worst case',
            definition:
                'Let C_worst(n) be the worst-case number of comparisons needed to search an array of size n.',
          ),
          MathBlock(
            r'C_{worst}(n) = C_{worst}(\lfloor n/2 \rfloor) + 1, \quad C_{worst}(1) = 1',
            semanticsLabel: 'worst case recurrence for binary search',
          ),
          TextBlock(
            'The "+ 1" is the comparison with the middle element at each step. The base case C_worst(1) = 1 means that with only one element left, we perform exactly one comparison.',
          ),
          TextBlock(
            'To solve the recurrence, first imagine that n is an exact power of 2. That means n equals 2 raised to some integer power k.',
          ),
          MathBlock(
            r'C_{worst}(2^k) = C_{worst}(2^{k-1}) + 1',
            semanticsLabel: 'worst case recurrence for power of two',
          ),
          TextBlock('Applying this repeatedly:'),
          MathBlock(
            r'C_{worst}(2^k) = C_{worst}(2^{k-1}) + 1 = C_{worst}(2^{k-2}) + 2 = \cdots = C_{worst}(2^0) + k = 1 + k',
            semanticsLabel: 'unrolling the worst case recurrence',
          ),
          MathBlock(
            r'C_{worst}(n) = k + 1 = \log_2(n) + 1 \quad \text{for } n = 2^k',
            semanticsLabel: 'worst case for exact powers of two',
          ),
          TextBlock(
            'For general n, there exists an integer k such that 2 to the power k is less than or equal to n, which is less than the next power of two. This means floor(log base 2 of n) equals k.',
          ),
          MathBlock(
            r'C_{worst}(n) = \lfloor \log_2 n \rfloor + 1 = \lceil \log_2(n + 1) \rceil',
            semanticsLabel: 'worst case for general n',
          ),
          MathBlock(
            r'C_{worst}(n) \in \Theta(\log n)',
            semanticsLabel: 'asymptotic complexity of binary search',
          ),
          TextBlock(
            'Every time Binary Search makes a comparison, the size of the remaining search space is cut roughly in half. So the question "How many steps until we are down to a single element?" is basically "How many times can we divide n by 2?" The answer is log₂(n), which is why the running time is logarithmic.',
          ),
          TextBlock(
            'Logarithmic time scales very nicely. If you double the input size, Binary Search increases its work by just one extra comparison in the worst case.',
          ),
          TextBlock(
            'For example, if n = 1024 then log₂(1024) = 10. If n = 1,048,576 (one million), then log₂(n) is about 20. So going from one thousand to one million elements only doubles the number of worst-case comparisons.',
          ),
          TextBlock('That is the power of a logarithmic algorithm.'),
          QuizBlock(
            question:
                'If n = 16, what is C_worst(16) step by step using the recurrence?',
            options: ['4', '5', '16', '8'],
            correctIndex: 1,
            explanation:
                '16 = 2^4, so C_worst(16) = 4 + 1 = 5. Each halving adds one more comparison.',
          ),
          QuizBlock(
            question:
                'What is the asymptotic complexity of Binary Search in the worst case?',
            options: ['linear', 'logarithmic', 'n log n', 'constant'],
            correctIndex: 1,
            explanation:
                'Binary Search halves the search range each step, giving logarithmic worst-case time.',
          ),
          QuizBlock(
            question:
                'Why does doubling the input size only add one comparison to Binary Search?',
            options: [
              'Because the algorithm skips every other element.',
              'Because halving the range each step means one more split is needed.',
              'Because Binary Search caches previous results.',
              'Because the constant factor changes.',
            ],
            correctIndex: 1,
            explanation:
                'Each step cuts the range in half. Doubling n adds exactly one more halving step, so only one extra comparison is needed.',
          ),
          KeyTakeawayBlock(
            'Binary Search has worst-case logarithmic complexity. The recurrence C_worst(n) = C_worst(⌊n/2⌋) + 1 solves to ⌊log₂ n⌋ + 1, or equivalently ⌈log₂(n+1)⌉. Doubling the input adds just one comparison.',
          ),
        ],
      ),

      // ── Module 6: The Fake Coin Problem ─────────────────────────────────
      ModuleContent(
        id: 'lesson6_module6',
        title: 'The Fake Coin Problem',
        order: 5,
        algorithmId: null,
        contentBlocks: [
          TextBlock(
            'In this module we look at a classic puzzle known as the fake coin problem. It is another nice example of decrease and conquer, and it is closely related in spirit to Binary Search.',
          ),
          DefinitionBlock(
            term: 'The problem',
            definition:
                'You have 70 coins that are all supposed to be gold coins of the same weight, but one coin is fake and weighs less than the others. You have a balance scale. You can put any number of coins on each side at one time. The scale tells you if the two sides weigh the same, or which side is lighter. How do you find the fake coin, and how many weighings do you need?',
          ),
          TextBlock(
            'A brute force approach would test all possible pairs of coins and weigh them. But this would be extremely expensive. Instead, we use a smarter decrease-and-conquer strategy.',
          ),
          DefinitionBlock(
            term: 'Two-way splitting strategy',
            definition:
                'Divide the coins into two groups that are as equal in size as possible. Weigh one group against the other.',
          ),
          TextBlock(
            'If the two sides balance, then none of the coins on the scale are fake, so the fake must be among the remaining coins. If they do not balance, the lighter side contains the fake coin. This is like Binary Search, but using weights instead of sorted numbers.',
          ),
          TextBlock(
            'We assume we know in advance that the fake coin is lighter than the others. If n is odd, we leave out one coin. In each step the problem size is reduced from n to roughly ⌊n/2⌋.',
          ),
          MathBlock(
            r'W(n) = W(\lfloor n/2 \rfloor) + 1, \quad W(1) = 0',
            semanticsLabel: 'recurrence for two-way fake coin strategy',
          ),
          TextBlock(
            'Solving this recurrence gives W(n) = ⌊log₂ n⌋. For 70 coins, that means about 6 weighings with this two-way strategy.',
          ),
          TextBlock(
            'However, the problem description says that with 70 coins it is possible to find the fake coin in only 4 weighings. That means there must be a more efficient strategy.',
          ),
          DefinitionBlock(
            term: 'Three-way splitting strategy',
            definition:
                'Divide the coins into three groups that are as equal in size as possible. Weigh two of these groups against each other.',
          ),
          TextBlock(
            'If the two groups balance, the fake is in the third group. If they do not balance, the fake is in the lighter group. Each step reduces the problem from n to roughly n/3, which is faster than halving.',
          ),
          TextBlock(
            'For 70 coins, one possible breakdown across rounds is: 23, 23, 24 then 8, 8, 8 then 3, 3, 2 then 1, 1, 1. After four rounds, only one suspect coin remains. That means only 4 weighings are needed.',
          ),
          MathBlock(
            r'\text{Round 1: } 23 + 23 + 24 = 70 \quad \Rightarrow \quad 1 \text{ weighing}',
            semanticsLabel: 'round 1 coin distribution',
          ),
          MathBlock(
            r'\text{Round 2: } 8 + 8 + 8 = 24 \quad \Rightarrow \quad 1 \text{ weighing}',
            semanticsLabel: 'round 2 coin distribution',
          ),
          MathBlock(
            r'\text{Round 3: } 3 + 3 + 2 = 8 \quad \Rightarrow \quad 1 \text{ weighing}',
            semanticsLabel: 'round 3 coin distribution',
          ),
          MathBlock(
            r'\text{Round 4: } 1 + 1 + 1 = 3 \quad \Rightarrow \quad 1 \text{ weighing}',
            semanticsLabel: 'round 4 coin distribution',
          ),
          TextBlock(
            'Both strategies are examples of decrease and conquer. In the two-way version, the problem size goes from n to about n/2 each time. In the three-way version, it goes from n to about n/3. By shrinking the problem faster, we reduce the number of rounds needed.',
          ),
          TextBlock(
            'This shows how powerful it can be to think carefully about how a problem is decreased at each step.',
          ),
          QuizBlock(
            question:
                'Why does the two-way splitting strategy lead to W(n) = ⌊log₂ n⌋ weighings?',
            options: [
              'Because each weighing eliminates half the coins.',
              'Because each weighing eliminates one coin.',
              'Because each weighing doubles the number of suspects.',
              'Because the fake coin always lands on the lighter side.',
            ],
            correctIndex: 0,
            explanation:
                'Each weighing discards about half the coins, so the problem size drops from n to n/2 each step. That recurrence solves to log₂ n.',
          ),
          QuizBlock(
            question:
                'Why is the three-way splitting strategy more efficient than two-way for the fake coin problem?',
            options: [
              'It eliminates two-thirds of the coins per weighing instead of half.',
              'It uses a smarter scale.',
              'It requires fewer coins on each side.',
              'It always finds the fake coin in one weighing.',
            ],
            correctIndex: 0,
            explanation:
                'Three-way splitting reduces the problem from n to n/3 each step instead of n/2, so the same 70 coins are resolved in 4 weighings instead of 6.',
          ),
          QuizBlock(
            question:
                'What assumption do we make about the fake coin in these strategies?',
            options: [
              'It is lighter than the genuine coins.',
              'It is heavier than the genuine coins.',
              'Its weight is completely unknown.',
              'It is exactly half the weight of genuine coins.',
            ],
            correctIndex: 0,
            explanation:
                'Both strategies assume the fake coin is lighter. That is what lets us determine which group contains the fake when the scale does not balance.',
          ),
          KeyTakeawayBlock(
            'The fake coin problem shows how the choice of how to decrease a problem matters. Two-way splitting gives ⌊log₂ n⌋ weighings. Three-way splitting gives ⌈log₃ n⌉ weighings. For 70 coins, that means 6 versus 4 weighings.',
          ),
        ],
      ),

      // ── Module 7: Josephus Problem ─────────────────────────────────────────
      ModuleContent(
        id: 'lesson6_module7',
        title: 'Josephus Problem',
        order: 6,
        algorithmId: null,
        contentBlocks: [
          TextBlock(
            'In this final module for Lesson 6 we look at the Josephus Problem, a classic puzzle that naturally leads to recurrence relations.',
          ),
          DefinitionBlock(
            term: 'The problem',
            definition:
                'Let n people stand in a circle, labeled 1 through n. Starting at person 1, every second person is eliminated from the circle. After each elimination, we continue around the smaller circle, again eliminating every second remaining person until only one person remains. That last remaining person is the winner J(n).',
          ),
          TextBlock(
            'For n equals 7, the elimination order is 2, 4, 6, 1, 5, 3, leaving position 7 as the winner. For n equals 8, the winner is position 1.',
          ),
          TextBlock(
            'When n is even, all even-numbered positions are eliminated in the first pass. The survivors are the odd positions 1, 3, 5, ..., 2k minus 1 for n equals 2k. The mapping from old to new position is old equals 2j minus 1.',
          ),
          MathBlock(
            r'J(2k) = 2J(k) - 1',
            semanticsLabel: 'Josephus recurrence for even n',
          ),
          TextBlock(
            'When n is odd, the even positions and position 1 are eliminated, leaving survivors 3, 5, 7, ..., 2k plus 1 for n equals 2k plus 1. The mapping is old equals 2j plus 1.',
          ),
          MathBlock(
            r'J(2k + 1) = 2J(k) + 1',
            semanticsLabel: 'Josephus recurrence for odd n',
          ),
          TextBlock(
            'Both recurrences reduce n to roughly half at each step, making this a decrease-and-conquer algorithm.',
          ),
          QuizBlock(
            question: 'What is J(8) using the recurrence relations?',
            options: ['1', '3', '5', '7'],
            correctIndex: 0,
            explanation:
                'For n equals 8 (which is 2 times 4), J(8) equals 2 times J(4) minus 1. J(4) equals 1 (since 4 is 2 times 2 and J(2) equals 1), so J(8) equals 2 times 1 minus 1 equals 1.',
          ),
          KeyTakeawayBlock(
            'The Josephus Problem is a decrease-and-conquer algorithm whose recurrence relations involve halving the problem size while transforming the solution through linear formulas. It is a clean example of how recurrence analysis captures the structure of an algorithmic process.',
          ),
        ],
      ),

      // ── Module 8: Variable-Size-Decrease Algorithms ─────────────────────────
      ModuleContent(
        id: 'lesson6_module8',
        title: 'Variable-Size-Decrease Algorithms',
        order: 7,
        algorithmId: null,
        contentBlocks: [
          TextBlock(
            'In this module we look at the third type of decrease-and-conquer: variable-size decrease. In these problems, the amount by which the problem shrinks is not a fixed constant and not a strict constant factor. The problem still shrinks at every step, but the amount depends on the data itself.',
          ),
          DefinitionBlock(
            term: 'Euclidean Algorithm',
            definition:
                'The Euclidean Algorithm finds the greatest common divisor of two numbers m and n where m is greater than or equal to n. It repeatedly replaces the larger number with the remainder of dividing the two numbers. Since the remainder can be anything from 0 to n minus 1, the problem size shrinks by a variable amount at each step.',
          ),
          DefinitionBlock(
            term: 'Selection Problem',
            definition:
                'Find the k-th smallest element in an unsorted list of n numbers.',
          ),
          TextBlock(
            'The median problem is a special case of the selection problem where k equals ceiling of n divided by 2. The obvious solution sorts the whole list in O(n log n) time and picks the element at index k, but this does more work than necessary.',
          ),
          DefinitionBlock(
            term: 'Lomuto Partition',
            definition:
                'A partitioning method that picks a pivot element and rearranges the array so that everything smaller than the pivot is on its left and everything larger is on its right. The pivot ends up in its final sorted position. If that position equals k, we are done. Otherwise, we recurse on one side only.',
          ),
          TextBlock(
            'This algorithm (called Quickselect) is decrease-and-conquer because we only recurse on one side of the partition. The size of the discarded chunk is variable because it depends on where the pivot ends up.',
          ),
          QuizBlock(
            question:
                'Why does a bad pivot choice cause Quickselect to run in quadratic time?',
            options: [
              'It causes the algorithm to recurse on both sides.',
              'It causes the problem size to decrease by 1 each time.',
              'It forces the algorithm to compare every pair of elements.',
              'It makes the pivot value change during recursion.',
            ],
            correctIndex: 1,
            explanation:
                'If the pivot is always the largest or smallest element, one side of the partition gets all remaining elements and the other side gets none. The problem size decreases by only 1 each step, giving a sum of n minus 1 plus n minus 2 plus ... plus 1, which is quadratic.',
          ),
          KeyTakeawayBlock(
            'Variable-size decrease covers algorithms like the Euclidean Algorithm and Quickselect. The problem size shrinks at each step, but the exact amount depends on the data. This is why worst-case Quickselect is quadratic while average case is linear.',
          ),
        ],
      ),

      // ── Lesson 6 Conclusion ───────────────────────────────────────────────
      ModuleContent(
        id: 'lesson6_conclusion',
        title: 'Conclusion',
        order: 8,
        algorithmId: null,
        contentBlocks: [
          TextBlock(
            'In Lesson 6, we explored the idea of decrease and conquer. This algorithm design technique solves a problem by reducing it to a smaller version of the same problem in a systematic way. The key idea is that instead of solving the full problem all at once, we remove part of the problem from consideration and continue working on what remains.',
          ),
          TextBlock(
            'Throughout the lesson, we saw several examples of this strategy, including decrease by a constant, decrease by a constant factor, and variable-size decrease. This helped show that many familiar algorithms can be understood through the same general design philosophy.',
          ),
          TextBlock(
            'In the next lesson, we move on to divide and conquer. At first, divide and conquer may sound similar to decrease and conquer because both approaches reduce a problem to smaller problems. However, the two strategies are different.',
          ),
          DefinitionBlock(
            term: 'The key distinction',
            definition:
                'In decrease and conquer, we reduce the problem to one smaller problem by removing some part of it. In divide and conquer, we split the problem into several smaller subproblems of roughly the same size, solve all of them, and then combine their solutions.',
          ),
          TextBlock(
            'A simple way to remember the difference: decrease and conquer is like eating only part of your dessert so there is less left to deal with. Divide and conquer is like cutting your dessert into smaller pieces, eating all the pieces, and treating the full dessert as the combination of those smaller parts.',
          ),
          KeyTakeawayBlock(
            'Decrease and conquer reduces to one smaller problem. Divide and conquer splits into several subproblems of equal size and combines the results. Recognizing this distinction helps us understand why algorithms work the way they do and choose the right design strategy for a new problem.',
          ),
        ],
      ),
    ],
  ),

  // ── Lesson 7 ─────────────────────────────────────────────────────────────────
  LessonContent(
    id: 7,
    title: 'Divide and Conquer',
    categoryColor: '#F43F5E',
    modules: [
      ModuleContent(
        id: 'lesson7_module1',
        title: 'Introduction to Divide and Conquer',
        order: 0,
        algorithmId: null,
        contentBlocks: [
          TextBlock(
            'In the previous lesson on decrease and conquer, we reduced the '
            'problem to one smaller subproblem at each step. Now we take a '
            'broader view and split the problem into several subproblems '
            'simultaneously.',
          ),
          TextBlock(
            'This strategy is called divide and conquer, and it is one of the '
            'most important algorithm design techniques in computer science.',
          ),
          DefinitionBlock(
            term: 'Divide and Conquer',
            definition:
                'A strategy that splits the problem into multiple '
                'subproblems of roughly equal size, solves each recursively, '
                'then combines the results to form the solution to the original '
                'problem.',
          ),
          TextBlock('The strategy follows three clear steps:'),
          CodeBlock(
            '1. Divide: split the problem into smaller subproblems\n'
            '2. Conquer: solve each subproblem recursively\n'
            '3. Combine: merge the subproblem solutions',
            language: 'text',
          ),
          DefinitionBlock(
            term: 'Decrease and Conquer',
            definition:
                'Reduces the problem to one smaller subproblem at '
                'each step, then extends the solution. Divide and conquer '
                'reduces to multiple subproblems and combines all of them.',
          ),
          DefinitionBlock(
            term: 'Recurrence Relation for Divide and Conquer',
            definition:
                'Because each level splits into a subproblems and each '
                'subproblem handles a size reduced by factor b, the running '
                'time follows this form, where f(n) is the cost of '
                'splitting and combining.',
          ),
          MathBlock(
            r'T(n) = aT\!\left(\frac{n}{b}\right) + f(n)',
            semanticsLabel: 'divide and conquer recurrence relation',
          ),
          TextBlock(
            'A classical example is Merge Sort: at each level we split the '
            'array into two halves (a = 2, b = 2), sort each half recursively, '
            'then merge the two sorted halves. The merge step is the f(n) cost.',
          ),
          MathBlock(
            r'T(n) = 2T\!\left(\frac{n}{2}\right) + \Theta(n)',
            semanticsLabel: 'Merge sort recurrence',
          ),
          TextBlock(
            'Many divide and conquer algorithms end up with a running time of '
            '\u0398(n log n) because the work done per level (f(n)) and the '
            'number of levels (log n) both contribute meaningfully. We will '
            'see exactly why using the Master Theorem.',
          ),
          QuizBlock(
            question:
                'What is the divide and conquer step missing from '
                'this list: "Divide, Conquer, ?"',
            options: ['Divide again', 'Sort', 'Combine', 'Recurse'],
            correctIndex: 2,
            explanation:
                'The three-part pattern is divide, conquer, then '
                'combine. "Combine" merges the solved subproblems into the '
                'overall solution.',
          ),
          QuizBlock(
            question:
                'Why does divide and conquer naturally lead to '
                'recurrence relations for running time analysis?',
            options: [
              'Because it uses loops',
              'Because each recursive call solves a smaller problem of a '
                  'similar size',
              'Because it always runs in constant time',
              'Because there is no combining step',
            ],
            correctIndex: 1,
            explanation:
                'Each recursive call splits into smaller subproblems '
                'of equal size. The relationship between problem size and '
                'subproblem size directly gives a recurrence in the standard '
                'divide and conquer form.',
          ),
          KeyTakeawayBlock(
            'Divide and conquer splits the problem into multiple equal-sized '
            'subproblems, solves each recursively, then combines the results. '
            'This naturally yields recurrences in the standard form that can '
            'be analyzed with the Master Theorem.',
          ),
          TextBlock(
            'To analyze recurrences of the form aT(n/b) + f(n), we '
            'compare f(n) with n to the power of log base b of a. Roughly '
            'speaking, three cases arise.',
          ),
          MathBlock(
            r'Case 1: f(n) = O(n^{d - \epsilon}) \Rightarrow T(n) = \Theta(n^d)',
            semanticsLabel: 'Master Theorem case 1 subproblems dominate',
          ),
          MathBlock(
            r'Case 2: f(n) = \Theta(n^d \log^k n) \Rightarrow T(n) = \Theta(n^d \log^{k+1} n)',
            semanticsLabel: 'Master Theorem case 2 balanced',
          ),
          MathBlock(
            r'Case 3: f(n) = \Omega(n^{d + \epsilon}) \Rightarrow T(n) = \Theta(f(n))',
            semanticsLabel: 'Master Theorem case 3 combine dominates',
          ),
          TextBlock('Stop and Think'),
          QuizBlock(
            question:
                'For Merge Sort the recurrence is 2T(n/2) + Theta(n). '
                'Which Master Theorem case applies?',
            options: [
              'Case 1: the subproblems dominate',
              'Case 2: balanced growth',
              'Case 3: the combine step dominates',
              'None: it does not fit the Master Theorem',
            ],
            correctIndex: 1,
            explanation:
                'Here a = 2, b = 2, so d = log₂ 2 = 1. Since f(n) = Theta(n) '
                'grows on the same order as n to the power of d, this is '
                'Case 2, giving Theta(n log n).',
          ),
          QuizBlock(
            question:
                'An algorithm has recurrence 3T(n/2) + n. '
                'What is its asymptotic order of growth?',
            options: [
              'linearithmic',
              'cubic',
              'quadratic',
              'exponential',
            ],
            correctIndex: 0,
            explanation:
                'Here a = 3, b = 2, so d = log₂ 3 approximately equals 1.585. '
                'Since f(n) = n grows more slowly than n to the power of d, '
                'Case 1 applies and the running time is Theta(n to the power of d), '
                'which is linearithmic.',
          ),
          TextBlock('Mini Practice'),
          QuizBlock(
            question:
                'Why do many divide and conquer algorithms end up with '
                'quadratic running time?',
            options: [
              'The combine step grows faster than the subproblem work',
              'The number of subproblems doubles each level',
              'The subproblem work and the number of levels both grow '
                  'proportionally with n',
              'Divide and conquer always produces quadratic algorithms',
            ],
            correctIndex: 2,
            explanation:
                'When f(n) = Theta(n) and d = 1, the recurrence 2T(n/2) '
                '+ Theta(n) solves to Theta(n log n). The work per level and '
                'the number of levels both scale with n, giving a log n factor.',
          ),
          KeyTakeawayBlock(
            'The Master Theorem makes it easy to read off the solution of a '
            'recurrence once you identify a, b, and the exponent d = log base b of a. '
            'Compare f(n) to n to the power of d to pick the right case.',
          ),
        ],
      ),
// ══════════════════════════════════════════════════════════════════════════════
// Module 2: Mergesort
// Source: /tmp/algoplay_lessons/M2.txt
// ══════════════════════════════════════════════════════════════════════════════
      ModuleContent(
        id: 'lesson7_module2',
        title: 'Mergesort',
        order: 1,
        algorithmId: null,
        contentBlocks: [
          TextBlock(
            'In this module we study Mergesort, a classic example of a '
            'divide-and-conquer sorting algorithm.',
          ),
          TextBlock('High-Level Idea of Mergesort'),
          TextBlock(
            'Mergesort sorts an array by dividing it into two halves, '
            'recursively sorting each half, then merging the two sorted halves '
            'into one sorted array.',
          ),
          TextBlock(
            'This matches the divide-and-conquer pattern: divide by splitting '
            'the array, conquer by recursively sorting the subarrays, combine '
            'by merging the sorted subarrays.',
          ),
          TextBlock(
            'In its usual form, Mergesort uses an extra array when merging.',
          ),
          TextBlock('Worst-Case Analysis Overview'),
          TextBlock(
            'To analyze the worst case, assume the array size n is a power of 2. '
            'This makes the splitting clean: each split divides the current array '
            'exactly in half until we reach subarrays of size 1.',
          ),
          TextBlock(
            'We think in terms of recursion levels. Level 0 is the full array '
            'of size n. Level 1 has two arrays of size n/2. '
            'Level 2 has four arrays of size n/4. '
            'This continues until the last level, which has n arrays of size 1.',
          ),
          TextBlock(
            'Once the subarrays are size 1, they are trivially sorted. Then we '
            'start merging back up. The cost we care about is the number of basic '
            'operations done by Merge.',
          ),
          TextBlock('How Merge Works (Two Sorted Arrays)'),
          TextBlock(
            'The Merge procedure combines two sorted subarrays into one sorted '
            'array. We use one pointer in the first subarray, another pointer in '
            'the second subarray, and a third pointer into the new array.',
          ),
          TextBlock(
            'At each step, compare the elements pointed to by the two pointers. '
            'Copy the smaller one into the new array and advance both the source '
            'pointer and the destination pointer. If one subarray runs out of '
            'elements, copy the remaining elements from the other subarray directly.',
          ),
          TextBlock(
            'The basic operation in Merge is comparison.',
          ),
          TextBlock('Cost of Merge in the Worst Case'),
          TextBlock(
            'Suppose we are merging two subarrays whose total length is n. In '
            'the worst case, we perform n−1 comparisons. This happens when '
            'neither subarray runs out before the very end.',
          ),
          TextBlock('Recurrence for Mergesort'),
          TextBlock(
            'Let C(n) be the number of comparisons Mergesort does in the worst '
            'case when sorting an array of size n. Each call makes two recursive '
            'calls on size n/2, then calls Merge on n elements. '
            'The recurrence is C(n) = 2C(n/2) + C_merge(n), C(1) = 0.',
          ),
          TextBlock(
            'Using the worst-case cost of Merge, this becomes '
            'C(n) = 2C(n/2) + n − 1, C(1) = 0.',
          ),
          TextBlock('Applying the Master Theorem'),
          TextBlock(
            'We compare the recurrence with the general form aT(n/b) + f(n).',
          ),
          TextBlock(
            '. Here a = 2, b = 2, and f(n) is Θ(n).',
          ),
          TextBlock(
            'Since d = log₂ 2 = 1, we have n to the power of d = n. '
            'We see that f(n) is Θ(n to the power of d). '
            'This is the balanced case, Case 2 of the Master Theorem, where '
            'f(n) matches n to the power of d.',
          ),
          TextBlock(
            'So in the worst case, Mergesort runs in time proportional to n log n.',
          ),
          TextBlock('Average-Case Remark'),
          TextBlock(
            'For comparison-based sorting algorithms, there are more advanced '
            'arguments that show any such algorithm must use at least on the order '
            'of n log n comparisons on average. Mergesort actually meets this bound.',
          ),
          TextBlock(
            'A full average-case analysis goes beyond this module, but it is '
            'discussed in more detail in algorithms texts.',
          ),
          TextBlock('Summary of Mergesort'),
          TextBlock(
            'Key points: the strategy is divide-and-conquer, the recurrence is '
            'C(n) = 2C(n/2) + n − 1 and the solution is Θ(n log n). '
            'Mergesort typically needs an auxiliary array of size n during merge.',
          ),
          TextBlock(
            'Pros: predictable Θ(n log n) time in the worst case, and it is a '
            'stable sort that preserves the order of equal elements.',
          ),
          TextBlock(
            'Cons: needs extra memory for merging in the simple array-based version.',
          ),
          TextBlock('Stop and Think'),
          QuizBlock(
            question:
                'Why do we assume n is a power of 2 in the Mergesort analysis?',
            options: [
              'It makes the array easier to sort',
              'It makes the splitting clean with exact halves at each level',
              'It reduces the number of comparisons needed',
              'It is required for the Master Theorem to apply',
            ],
            correctIndex: 1,
            explanation:
                'Assuming n is a power of 2 means each recursive split divides '
                'the array exactly in half until we reach size 1. This simplifies '
                'the analysis without changing the asymptotic order.',
          ),
          QuizBlock(
            question:
                'In the recurrence C(n) = 2C(n/2) + n − 1, what do the three '
                'terms represent?',
            options: [
              'Two subproblems, the merge cost, and the base case',
              'Two recursive calls on half size, plus the merge cost',
              'Two passes over the array, plus a constant overhead',
              'The divide cost, the conquer cost, and the combine cost',
            ],
            correctIndex: 1,
            explanation:
                'The term 2C(n/2) represents the two recursive calls on subarrays '
                'of half the size. The term n − 1 is the worst-case cost of '
                'merging two sorted subarrays whose total length is n.',
          ),
          TextBlock('Mini Practice'),
          QuizBlock(
            question:
                'Write the recurrence for Mergesort if the merge step took 3n '
                'work instead of n work. What would the Master Theorem say?',
            options: [
              'The complexity would become n²',
              'The complexity would still be n log n',
              'The complexity would become n',
              'The Master Theorem would not apply',
            ],
            correctIndex: 1,
            explanation:
                'Even with f(n) = 3n, we still have f(n) in Θ(n) and d = 1. '
                'Case 2 of the Master Theorem still applies, giving n log n. '
                'The constant factor in f(n) does not change the asymptotic order.',
          ),
          KeyTakeawayBlock(
            'Mergesort is the textbook example of divide and conquer applied to '
            'sorting. Its recurrence',
          ),
          MathBlock(
            r'C(n) = 2C\!\left(\frac{n}{2}\right) + n - 1',
            semanticsLabel: 'mergesort recurrence',
          ),
          KeyTakeawayBlock(
            'solves to n log n by the Master Theorem Case 2. It is stable '
            'and predictable, but requires extra memory for merging.',
          ),
        ],
      ),
      ModuleContent(
        id: 'lesson7_module3',
        title: 'Counting Inversions',
        order: 2,
        contentBlocks: [
          TextBlock(
            'In this module we introduce the problem of counting inversions and '
            'show how a divide-and-conquer strategy, similar to Mergesort, can '
            'solve it efficiently.',
          ),
          TextBlock('What Is an Inversion?'),
          TextBlock(
            'Suppose we have an array of positive integers:',
          ),
          MathBlock(
            r'A = [a_1, a_2, \dots, a_n]',
            semanticsLabel: 'array of positive integers',
          ),
          TextBlock(
            'An inversion is a pair of indices (i, j) such that i is less than j, '
            'and the element at position i is greater than the element at position j.',
          ),
          TextBlock(
            'Intuitively, an inversion is a pair that is out of order with respect '
            'to sorted ascending order. The number of inversions measures how far '
            'the array is from being sorted.',
          ),
          TextBlock(
            'For the array:',
          ),
          MathBlock(
            r'[4, 2, 7, 1, 3, 5, 8, 6]',
            semanticsLabel: 'example array with inversions',
          ),
          TextBlock(
            'there are several inversions, such as (4, 2), (4, 1), (7, 1), and '
            'many more.',
          ),
          TextBlock('Brute Force Approach'),
          TextBlock(
            'A straightforward algorithm to count inversions is to look at every '
            'pair of positions (i, j) with i less than j, check whether the '
            'element at i is greater than the element at j, and increment a counter '
            'when we find an inversion.',
          ),
          TextBlock(
            'There are n choose 2 such pairs, and so this algorithm runs in '
            'quadratic time. We would like something faster.',
          ),
          TextBlock('Divide-and-Conquer Strategy'),
          TextBlock(
            'We can adapt the idea of Mergesort to count inversions more efficiently.',
          ),
          TextBlock(
            'Recall Mergesort: divide the array into two halves, recursively sort '
            'each half, merge the two sorted halves. We will do something similar, '
            'but we also keep track of how many inversions we see.',
          ),
          TextBlock(
            'High-level steps:',
          ),
          TextBlock(
            '1. Divide the array into two halves: left and right.',
          ),
          TextBlock(
            '2. Recursively count inversions in each half.',
          ),
          TextBlock(
            '3. Count the between-half inversions, where one element is in the '
            'left half and the other is in the right half.',
          ),
          TextBlock(
            '4. Add these three counts together.',
          ),
          TextBlock(
            'The tricky part is step 3.',
          ),
          TextBlock('Counting Between-Half Inversions While Merging'),
          TextBlock(
            'We use a modified Merge procedure that works like Mergesort but also '
            'counts cross inversions.',
          ),
          TextBlock(
            'During Merge, we have two sorted subarrays: left half A and right '
            'half B. We use pointers into both halves and into a temporary output '
            'array, just like in normal Merge.',
          ),
          TextBlock(
            'The key insight is that when we copy an element from the right '
            'subarray B before one or more remaining elements in the left subarray '
            'A, then each of those remaining elements in A forms an inversion with '
            'that element from B.',
          ),
          TextBlock(
            'Every time we place an element from the right half into the new array '
            'before the remaining elements in the left half, we increase the '
            'inversion count by the number of elements still left in the left half.',
          ),
          TextBlock('Algorithm Trace Example'),
          TextBlock(
            'Consider the array:',
          ),
          MathBlock(
            r'[4, 2, 7, 1, 3, 5, 8, 6]',
            semanticsLabel: 'example array for counting inversions',
          ),
          TextBlock(
            'We first divide it into smaller subarrays, similar to Mergesort. At '
            'various merge steps we count how many elements in the left half are '
            'greater than the next element in the right half and add that to the '
            'inversion total. By the end of the process, the total inversion count '
            'for the original array is obtained.',
          ),
          TextBlock('Recurrence and Complexity'),
          TextBlock(
            'Let D(n) be the time to count inversions in an array of size n using '
            'this method.',
          ),
          TextBlock(
            'The recursion has the same structure as Mergesort: two recursive calls '
            'on arrays of size n/2, and one modified Merge step that still runs in '
            'linear time. So the recurrence is:',
          ),
          MathBlock(
            r'D(n) = 2D\!\left(\frac{n}{2}\right) + O(n)',
            semanticsLabel: 'counting inversions recurrence',
          ),
          TextBlock(
            'By the same reasoning as for Mergesort, or by the Master Theorem, '
            'this solves to:',
          ),
          MathBlock(
            r'D(n) \in \Theta(n \log n)',
            semanticsLabel: 'counting inversions complexity',
          ),
          TextBlock(
            'So counting inversions can be done in Θ(n log n) time, much faster '
            'than the naive quadratic algorithm.',
          ),
          TextBlock('Why This Works Conceptually'),
          TextBlock(
            'The key idea is that once the left and right halves are individually '
            'sorted, all inversions that remain must be cross inversions: one '
            'element from the left half, one element from the right half.',
          ),
          TextBlock(
            'Because both halves are sorted, we can detect and count all such cross '
            'inversions efficiently during a single linear-time merge.',
          ),
          TextBlock(
            'This is a classic example of using divide and conquer plus sorted '
            'structure to answer a more complex question than just sorting.',
          ),
          TextBlock('Stop and Think'),
          QuizBlock(
            question:
                'Why can all cross inversions be found during the merge step?',
            options: [
              'Because both halves are sorted, any remaining inversion must span '
              'the two halves',
              'Because the merge step compares every pair of elements',
              'Because cross inversions are always fewer than in-half inversions',
              'Because the merge step sorts the array',
            ],
            correctIndex: 0,
            explanation:
                'Once each half is sorted, every element in the left half is '
                'correctly ordered relative to other elements in the same half, '
                'and similarly for the right half. The only inversions left are '
                'those that cross the boundary.',
          ),
          QuizBlock(
            question:
                'How does the modified Merge know how many inversions to add '
                'when it takes an element from the right half?',
            options: [
              'It counts all remaining elements in the left half',
              'It counts all remaining elements in the right half',
              'It compares the element with every other element',
              'It adds one for each comparison',
            ],
            correctIndex: 0,
            explanation:
                'When an element from the right half is placed before remaining '
                'elements in the left half, each of those remaining elements forms '
                'an inversion with it. The count of remaining left elements is '
                'added to the total.',
          ),
          QuizBlock(
            question:
                'For an array that is already sorted, how many inversions are '
                'there?',
            options: [
              'Zero',
              'n',
              'n log n',
              'Θ(n²)',
            ],
            correctIndex: 0,
            explanation:
                'A sorted array has no pairs (i, j) with i less than j and the '
                'element at i greater than the element at j. There are zero '
                'inversions.',
          ),
          TextBlock('Mini Practice'),
          TextBlock(
            'Manually count the inversions in the array [3, 1, 2] using the brute '
            'force method. Then sketch how the divide-and-conquer method would '
            'discover the same count.',
          ),
          TextBlock(
            'Explain in your own words why the between-half inversions dominate '
            'the interesting part of the algorithm.',
          ),
          KeyTakeawayBlock(
            'Counting inversions is a powerful example of how divide and conquer '
            'can transform a seemingly quadratic problem into a n log n one. By '
            'reusing the structure of Mergesort and adding a small twist during '
            'merge, we obtain both a sorted array and a meaningful measure of how '
            'unsorted the original array was.',
          ),
        ],
      ),
      ModuleContent(
        id: 'lesson7_module4',
        title: 'Quicksort',
        order: 3,
        contentBlocks: [
          TextBlock(
            'In this module we review Quicksort, another classic '
            'divide-and-conquer sorting algorithm, and look at both its '
            'worst-case and average-case behaviour.',
          ),
          TextBlock('High-Level Idea of Quicksort'),
          TextBlock(
            'Quicksort follows the divide, conquer, combine pattern:',
          ),
          TextBlock(
            '1. Divide: Choose a pivot element from the array and partition '
            'the remaining elements into two groups: those less than the pivot '
            'and those greater than the pivot.',
          ),
          TextBlock(
            '2. Conquer: Recursively apply Quicksort to the left and right '
            'subarrays.',
          ),
          TextBlock(
            '3. Combine: In the array implementation there is no heavy combine '
            'step. Once the subarrays are sorted and the pivot is in the correct '
            'place, the whole array is sorted.',
          ),
          TextBlock(
            'This is different from Mergesort, where combining (merging) is '
            'the main extra work. In Quicksort, the hard work is in the '
            'partitioning step.',
          ),
          TextBlock('Quicksort and Partition'),
          TextBlock(
            'Pick the first element in the array as the pivot. Temporarily '
            'remove the pivot from the array. Use a Partition procedure to '
            'rearrange the remaining elements: all elements less than the pivot '
            'go to the left side, all elements greater than the pivot go to the '
            'right side. Finally, reinsert the pivot between these two groups.',
          ),
          TextBlock(
            'After partitioning, the pivot is in its final sorted position, '
            'everything to the left is smaller, everything to the right is '
            'larger. We then recursively sort the left and right subarrays.',
          ),
          TextBlock('Worst-Case Analysis'),
          TextBlock(
            'The basic operation is comparison of two keys.',
          ),
          TextBlock(
            'The worst case for Quicksort occurs when the pivot is always the '
            'smallest element (or always the largest element) in the current '
            'subarray.',
          ),
          TextBlock(
            'In that situation, Partition essentially accomplishes nothing '
            'useful. One side of the partition is always empty. We end up doing '
            'nearly as many comparisons as a naive algorithm.',
          ),
          TextBlock(
            'If the array has size n, the worst case comparisons look like:',
          ),
          MathBlock(
            r'C_{\text{worst}}(n) = (n+1) + n + (n-1) + \dots + 3',
            semanticsLabel: 'quicksort worst case comparisons',
          ),
          TextBlock(
            'Using the summation formula, this can be rewritten as:',
          ),
          MathBlock(
            r'C_{\text{worst}}(n) = \frac{(n+1)(n+2)}{2} - 3 \in \Theta(n^2)',
            semanticsLabel: 'quicksort worst case quadratic',
          ),
          TextBlock(
            'So Quicksort has quadratic time in the worst case, the same order '
            'as simple algorithms like Insertion Sort.',
          ),
          TextBlock('Average-Case Analysis'),
          TextBlock(
            'In practice, Quicksort is usually fast because the pivot is rarely '
            'always the smallest or largest element.',
          ),
          TextBlock(
            'To analyze the average case, we assume all permutations of the '
            'keys are equally likely, all keys are distinct, and the pivot '
            'position is equally likely to be any of the positions in the array.',
          ),
          TextBlock(
            'Let A(n) be the average number of comparisons used by Quicksort on '
            'an array of size n. The recurrence is:',
          ),
          MathBlock(
            r'A(n) = n + 1 + \frac{2}{n} \sum_{i=1}^{n-1} A(i)',
            semanticsLabel: 'quicksort average case recurrence',
          ),
          TextBlock(
            'This recurrence is somewhat hard to solve directly. Instead, one '
            'common approach is to guess a simpler comparison function Q(n) '
            'that behaves like the solution, and then prove by induction that '
            'the guess works.',
          ),
          TextBlock(
            'The helpful guess is:',
          ),
          MathBlock(
            r'Q(n) \equiv n + 2Q(n/2)',
            semanticsLabel: 'quicksort guessed recurrence',
          ),
          TextBlock(
            'This recurrence fits the standard divide-and-conquer form with '
            'a = 2, b = 2, and f(n) = n. By the Master Theorem, this implies:',
          ),
          MathBlock(
            r'Q(n) \in \Theta(n \log n)',
            semanticsLabel: 'quicksort average case complexity',
          ),
          TextBlock(
            'Under reasonable assumptions, and with more careful analysis, the '
            'actual average-case behaviour of Quicksort matches this order of '
            'growth.',
          ),
          QuizBlock(
            question:
                'Why does Quicksort have no heavy combine step compared to '
                'Mergesort?',
            options: [
              'Because after partitioning, each subarray is already in its '
              'correct region of the array',
              'Because Quicksort does not use recursion',
              'Because the pivot is always the median',
              'Because Quicksort uses extra memory',
            ],
            correctIndex: 0,
            explanation:
                'After partitioning, the pivot is in its final sorted position '
                'and all elements are already in their correct halves. No '
                'merging is needed.',
          ),
          QuizBlock(
            question:
                'What pivot choices make the worst case happen for Quicksort?',
            options: [
              'Always picking the smallest or largest element',
              'Always picking the middle element',
              'Always picking a random element',
              'Always picking the median of three',
            ],
            correctIndex: 0,
            explanation:
                'When the pivot is always the smallest or largest, one side of '
                'the partition is always empty, leading to Θ(n²) time.',
          ),
          QuizBlock(
            question:
                'What is the average-case time complexity of Quicksort under '
                'standard assumptions?',
            options: [
              'Θ(n log n)',
              'Θ(n²)',
              'Θ(n)',
              'Θ(log n)',
            ],
            correctIndex: 0,
            explanation:
                'Although the worst case is Θ(n²), the average case is '
                'n log n, which is why Quicksort is fast in practice.',
          ),
          KeyTakeawayBlock(
            'Quicksort ties together many ideas in this lesson: '
            'divide-and-conquer structure, detailed recurrence analysis, and '
            'the difference between worst-case and average-case efficiency. It '
            'remains one of the most widely used sorting algorithms in real '
            'systems today.',
          ),
        ],
      ),
      ModuleContent(
        id: 'lesson7_module5',
        title: 'Multiplication of Large Integers',
        order: 4,
        contentBlocks: [
          TextBlock(
            'In this module we see how divide and conquer can speed up the '
            'multiplication of large integers. This is closely related to '
            'ideas used in cryptography, where very large numbers must be '
            'multiplied efficiently.',
          ),
          TextBlock('Motivation'),
          TextBlock(
            'Many cryptographic algorithms (including RSA) require multiplying '
            'large integers, numbers too big for simple school-style '
            'multiplication to be efficient.',
          ),
          TextBlock(
            'If we can reduce one big multiplication to a few multiplications '
            'on numbers of about half the size, and do this recursively, we '
            'get a divide-and-conquer algorithm.',
          ),
          TextBlock('A Simple Example: 45 × 28'),
          TextBlock(
            'Write each number in base 10. For 45: 4 × 10 + 5',
          ),
          TextBlock(
            'For 28: 2 × 10 + 8',
          ),
          TextBlock('Multiplying gives:'),
          MathBlock(
            r'45 \cdot 28 = (4 \cdot 10^1 + 5 \cdot 10^0)(2 \cdot 10^1 + 8 \cdot 10^0)',
            semanticsLabel: 'multiply 45 by 28 expanded',
          ),
          TextBlock(
            'If we expand this directly we see four products. But with a clever '
            'rearrangement we can express the result using only three distinct '
            'multiplications instead of four. This idea generalizes to large '
            'numbers.',
          ),
          TextBlock('General Setup'),
          TextBlock(
            'Let a and b be n-digit positive integers that we wish to multiply. '
            'Split each into a high half and a low half:',
          ),
          MathBlock(
            r'a = a_1 10^{n/2} + a_0, \quad b = b_1 10^{n/2} + b_0',
            semanticsLabel: 'split numbers into halves',
          ),
          TextBlock(
            'Now consider the product c = a × b. We can rewrite it as:',
          ),
          MathBlock(
            r'c = (a_1 b_1)10^n + (a_1 b_0 + a_0 b_1)10^{n/2} + a_0 b_0',
            semanticsLabel: 'expanded product',
          ),
          TextBlock(
            'Naively, this expression uses four multiplications. However, we can '
            'reduce this to three.',
          ),
          TextBlock('Reducing to Three Multiplications'),
          TextBlock(
            'Define three quantities:',
          ),
          MathBlock(
            r'c_2 = a_1 b_1, \quad c_0 = a_0 b_0, \quad c_1 = (a_1 + a_0)(b_1 + b_0) - c_2 - c_0',
            semanticsLabel: 'three products trick',
          ),
          TextBlock(
            'So we can compute c2, c0, and c1 using only three multiplications '
            'of about half-size numbers. Then the final product is:',
          ),
          MathBlock(
            r'c = c_2 10^n + c_1 10^{n/2} + c_0',
            semanticsLabel: 'final product formula',
          ),
          TextBlock('Recurrence for Multiplications'),
          TextBlock(
            'Let M(n) be the number of single-digit multiplications used to '
            'multiply two n-digit numbers with this method. At each level we '
            'perform three recursive multiplications on numbers of size n/2.',
          ),
          MathBlock(
            r'M(n) = 3M(n/2), \quad M(1) = 1',
            semanticsLabel: 'karatsuba recurrence',
          ),
          TextBlock(
            'Solving by repeated substitution:',
          ),
          MathBlock(
            r'M(n) = 3^{\log_2 n} = n^{\log_2 3}',
            semanticsLabel: 'karatsuba solution',
          ),
          TextBlock(
            'The exponent log₂ 3 is approximately 1.585. So the multiplication complexity is',
          ),
          TextBlock(
            'n¹·⁵⁸⁵',
          ),
          TextBlock(
            ', which is asymptotically faster than the straightforward '
            'quadratic grade-school algorithm.',
          ),
          TextBlock('Why the Exponent Identity Works'),
          TextBlock(
            'The step from',
          ),
          MathBlock(
            r'3^{\log_2 n}',
            semanticsLabel: '3 to the power of log base 2 of n',
          ),
          TextBlock(
            'to',
          ),
          MathBlock(
            r'n^{\log_2 3}',
            semanticsLabel: 'n to the power of log base 2 of 3',
          ),
          TextBlock('uses a general exponent identity:'),
          MathBlock(
            r'a^{\log_b c} = c^{\log_b a}',
            semanticsLabel: 'exponent identity',
          ),
          TextBlock(
            'This identity is handy whenever you have terms like',
          ),
          MathBlock(
            r'k^{\log n}',
            semanticsLabel: 'k to the power of log n',
          ),
          TextBlock(
            'or',
          ),
          MathBlock(
            r'n^{\log k}',
            semanticsLabel: 'n to the power of log k',
          ),
          TextBlock('and want to rewrite them.'),
          QuizBlock(
            question:
                'How many half-size multiplications does the Karatsuba trick '
                'require instead of the naive four?',
            options: [
              'Three',
              'Two',
              'Four',
              'Five',
            ],
            correctIndex: 0,
            explanation:
                'By defining c1 as (a1 plus a0)(b1 plus b0) minus c2 minus c0, '
                'we reduce the four products to just three multiplications.',
          ),
          QuizBlock(
            question:
                'What is the time complexity of Karatsuba multiplication?',
            options: [
              'Θ(n^(log₂ 3)) ≈ Θ(n²·⁵⁸⁵)',
              'Θ(n²)',
              'Θ(n log n)',
              'Θ(n)',
            ],
            correctIndex: 0,
            explanation:
                'The recurrence M(n) = 3M(n/2) solves to '
                'n^(log₂ 3), which is approximately n to the power of 1.585.',
          ),
          KeyTakeawayBlock(
            'Multiplication of large integers via divide and conquer is a '
            'beautiful example of how algebraic insight and recursion can work '
            'together to beat the obvious algorithm. It connects directly to '
            'practical problems in cryptography, where such speedups really '
            'matter. This algorithm is known as Karatsuba multiplication.',
          ),
        ],
      ),
      ModuleContent(
        id: 'lesson7_module6',
        title: 'Multiplication of Matrices (Strassen)',
        order: 5,
        contentBlocks: [
          TextBlock(
            'In this module we see how divide and conquer can speed up matrix '
            'multiplication. The focus is on Strassen\'s algorithm, which shows '
            'that multiplying large matrices can be done faster than the classical '
            'n³ approach.',
          ),
          TextBlock('From Integer Multiplication to Matrices'),
          TextBlock(
            'Earlier, we saw that divide and conquer can help with multiplication '
            'of large integers. Now we ask: can divide and conquer also help us '
            'multiply matrices more quickly?',
          ),
          TextBlock(
            'The answer is yes. Strassen\'s algorithm is a divide-and-conquer '
            'method that reduces the number of scalar multiplications needed.',
          ),
          TextBlock('Classical 2 by 2 Matrix Multiplication'),
          TextBlock(
            'Consider multiplying two 2 by 2 matrices',
          ),
          MathBlock(
            r'C = A \times B',
            semanticsLabel: 'C equals A times B',
          ),
          TextBlock('.'),
          MathBlock(
            r'A = \begin{bmatrix} a_{00} & a_{01} \\ a_{10} & a_{11} \end{bmatrix}, \quad B = \begin{bmatrix} b_{00} & b_{01} \\ b_{10} & b_{11} \end{bmatrix}',
            semanticsLabel: 'two by two matrices A and B',
          ),
          TextBlock(
            'The usual formula for C is:',
          ),
          MathBlock(
            r'C = \begin{bmatrix} a_{00}b_{00} + a_{01}b_{10} & a_{00}b_{01} + a_{01}b_{11} \\ a_{10}b_{00} + a_{11}b_{10} & a_{10}b_{01} + a_{11}b_{11} \end{bmatrix}',
            semanticsLabel: 'classical matrix multiplication result',
          ),
          TextBlock(
            'This requires eight scalar multiplications and four additions. '
            'Strassen observed that by cleverly rearranging the computations, we '
            'can get the same result using only seven multiplications instead of '
            'eight, at the cost of doing more additions and subtractions.',
          ),
          TextBlock('Strassen\'s 2 by 2 Construction'),
          TextBlock(
            'Strassen defines seven intermediate products m1 through m7 as '
            'certain combinations of entries from A and B. The product matrix C '
            'can be written in terms of these values so that all entries of C are '
            'obtained using only seven scalar multiplications.',
          ),
          TextBlock(
            'You are not required to memorize the exact formulas, but you should '
            'understand the idea: first compute seven carefully chosen products, '
            'then combine them with additions and subtractions to get each entry '
            'of C.',
          ),
          TextBlock(
            'The key takeaway: the structure of 2 by 2 matrix multiplication '
            'allows one multiplication to be saved.',
          ),
          TextBlock('Extending to Larger Matrices'),
          TextBlock(
            'To apply Strassen\'s idea to larger matrices, suppose A and B are '
            'n by n matrices where n is a power of 2. We partition each matrix '
            'into four blocks of size n/2 × n/2:'),
          MathBlock(
            r'A = \begin{bmatrix} A_{00} & A_{01} \\ A_{10} & A_{11} \end{bmatrix}, \quad B = \begin{bmatrix} B_{00} & B_{01} \\ B_{10} & B_{11} \end{bmatrix}',
            semanticsLabel: 'block matrices',
          ),
          TextBlock(
            'Then we treat these blocks like the entries of 2 by 2 matrices and '
            'apply the same Strassen formulas. The multiplications of blocks are '
            'themselves matrix multiplications of smaller size.',
          ),
          TextBlock(
            'At each level of recursion, we perform seven matrix multiplications '
            'on submatrices of size n/2, plus additional matrix additions and '
            'subtractions.',
          ),
          TextBlock('Recurrence for Multiplications'),
          TextBlock(
            'Let M(n) be the number of scalar multiplications needed to multiply '
            'two n by n matrices using Strassen\'s algorithm.',
          ),
          MathBlock(
            r'M(n) = 7 M(n/2), \quad M(1) = 1',
            semanticsLabel: 'strassen recurrence',
          ),
          TextBlock(
            'Solving by substitution:',
          ),
          MathBlock(
            r'M(n) = 7^{\log_2 n} = n^{\log_2 7}',
            semanticsLabel: 'strassen solution',
          ),
          TextBlock('The exponent log₂ 7'),
          TextBlock(
            'is approximately 2.807. Thus Strassen\'s algorithm has multiplication '
            'complexity n^(log₂ 7), which is asymptotically faster than the '
            'classical n³ algorithm.',
          ),
          TextBlock('Counting Additions'),
          TextBlock(
            'Strassen\'s method reduces multiplications but increases additions '
            'and subtractions. The recurrence for additions is:',
          ),
          MathBlock(
            r'A(n) = 7 A(n/2) + 18(n/2)^2, \quad A(1) = 0',
            semanticsLabel: 'strassen additions recurrence',
          ),
          TextBlock(
            'By the Master Theorem, this recurrence has the same order of growth '
            'as M(n). So even when we add in the cost of additions and '
            'subtractions, the total work of Strassen\'s algorithm is on the '
            'order of',
          ),
          MathBlock(
            r'n^{\log_2 7}',
            semanticsLabel: 'n to the power of log base 2 of 7',
          ),
          TextBlock('.'),
          QuizBlock(
            question:
                'How many scalar multiplications does Strassen use for the 2 by '
                '2 case instead of the classical eight?',
            options: [
              'Seven',
              'Six',
              'Five',
              'Four',
            ],
            correctIndex: 0,
            explanation:
                'Strassen saves one multiplication by using seven carefully '
                'chosen products and more additions, which pays off recursively.',
          ),
          QuizBlock(
            question:
                'What is the time complexity of Strassen\'s matrix '
                'multiplication algorithm?',
            options: [
              'Θ(n^(log₂ 7)) ≈ Θ(n²·⁸⁰⁷)',
              'Θ(n³)',
              'Θ(n²)',
              'Θ(n log n)',
            ],
            correctIndex: 0,
            explanation:
                'The recurrence M(n) = 7M(n/2) solves to '
                'n^(log₂ 7), which is approximately n²·⁸⁰⁷.',
          ),
          QuizBlock(
            question:
                'Why might Strassen not always be used for small matrices in '
                'practice?',
            options: [
              'The extra additions and constant factors can dominate for small '
              'sizes',
              'It only works for odd-sized matrices',
              'It requires more memory than available',
              'It produces incorrect results for small sizes',
            ],
            correctIndex: 0,
            explanation:
                'For small matrices, the overhead of extra additions and '
                'subtractions outweighs the benefit of saving one multiplication.',
          ),
          KeyTakeawayBlock(
            'Strassen\'s algorithm shows that even a small saving at the base 2 '
            'by 2 level can have a dramatic effect when applied recursively. It '
            'is an important example of how creative algebraic manipulation, '
            'combined with divide and conquer, can lead to asymptotically faster '
            'algorithms.',
          ),
        ],
      ),
      ModuleContent(
        id: 'lesson7_module7',
        title: 'Conclusion',
        order: 6,
        contentBlocks: [
          TextBlock(
            'In Lesson 7, we explored the concept of Divide and Conquer and saw '
            'numerous examples of how these algorithms are modeled using '
            'recurrence relations.',
          ),
          TextBlock('Why 2 Appears So Often'),
          TextBlock(
            'This lesson should give you a strong sense of why the number 2 '
            'shows up so frequently in algorithm analysis.',
          ),
          TextBlock(
            'In divide-and-conquer algorithms, the most common strategy is to '
            'repeatedly divide the problem size in half, into two roughly equal '
            'subproblems. This is why you constantly see recurrences involving',
          ),
          MathBlock(
            r'T\!\left(\frac{n}{2}\right)',
            semanticsLabel: 'T of n over 2',
          ),
          TextBlock(
            'and terms like',
          ),
          MathBlock(
            r'\log_2 n',
            semanticsLabel: 'log base 2 of n',
          ),
          TextBlock('.'),

          TextBlock('Key Takeaways'),
          TextBlock(
            'We examined several major applications of this technique:',
          ),
          TextBlock(
            'Mergesort: A clean recursive sorting algorithm that hits exactly',
          ),
          MathBlock(
            r'\Theta(n \log n)',
            semanticsLabel: 'Theta n log n',
          ),
          TextBlock('time.'),
          TextBlock(
            'Quicksort: Where we looked at worst-case and touched upon the '
            'complex details of its average-case performance.',
          ),
          TextBlock(
            'Counting Inversions: How a small modification to Mergesort allows '
            'us to count out-of-order pairs efficiently.',
          ),
          TextBlock(
            'Karatsuba Multiplication: How algebraic tricks reduce four '
            'half-size multiplications to three.',
          ),
          TextBlock(
            'Strassen\'s Matrix Multiplication: How algebraic tricks combined '
            'with dividing matrix blocks can lower the asymptotic bounds from',
          ),
          MathBlock(
            r'n^3',
            semanticsLabel: 'n cubed',
          ),
          TextBlock(
            'to approximately',
          ),
          MathBlock(
            r'n^{2.807}',
            semanticsLabel: 'n to the power of 2.807',
          ),
          TextBlock('.'),
          TextBlock('Looking Ahead: Transform and Conquer'),
          TextBlock(
            'In the next lesson, we move on to a completely new technique: '
            'Transform and Conquer.',
          ),
          TextBlock(
            'Instead of making the problem smaller directly (like in Decrease '
            'and Conquer or Divide and Conquer), this approach takes a problem '
            'out of the domain in which it was originally defined and transforms '
            'it into a new region.',
          ),
          TextBlock(
            'In that new region, different and often more powerful solution '
            'tools are available. It is a very different way of thinking about '
            'problem-solving, and it introduces some fun new tools and '
            'structures along the way!',
          ),
          KeyTakeawayBlock(
            'Divide and Conquer is one of the most fundamental algorithm design '
            'paradigms. By breaking problems into smaller subproblems, solving '
            'them recursively, and combining the results, we achieve efficient '
            'solutions to sorting, counting, multiplication, and more. The '
            'patterns you learned here will appear throughout your study of '
            'algorithms.',
          ),
        ],
      ),
    ],
  ),

  // ── Lesson 8 ─────────────────────────────────────────────────────────────────
  LessonContent(
    id: 8,
    title: 'Transform and Conquer Pt.1',
    categoryColor: '#F97316',
    modules: [
      ModuleContent(
        id: 'lesson8_module1',
        title: 'Introduction to Transform and Conquer',
        order: 0,
        algorithmId: null,
        contentBlocks: [
          TextBlock(
            'We now begin a new algorithm design technique: Transform and Conquer. '
            'The core idea is to change the problem into a different but related problem, '
            'usually in another domain or representation, where it becomes easier to solve.',
          ),
          DefinitionBlock(
            term: 'Transform and Conquer',
            definition: 'An algorithm design technique that changes a problem into a different '
                'but related problem, solves it in the new form, and optionally transforms '
                'the result back.',
          ),
          TextBlock(
            'Transform and conquer can feel more creative than decrease-and-conquer or '
            'divide-and-conquer because it often depends on seeing the right connection or encoding.',
          ),
          KeyTakeawayBlock(
            'Not every problem can be usefully transformed, but many important ones can. '
            'As you learn more about algorithms, data structures, and discrete mathematics '
            '(graphs, trees, matrices, tableaux), you get better at spotting when a transformation is possible.',
          ),
          DefinitionBlock(
            term: 'Gaussian Elimination',
            definition: 'A classic transform-and-conquer algorithm from linear algebra. '
                'It transforms a system of n linear equations in n unknowns into an upper triangular '
                'system, which can then be solved easily using backward substitution.',
          ),
          TextBlock(
            'Gaussian Elimination transforms the original system whose coefficient matrix is '
            'dense and messy into a new system whose coefficient matrix is upper triangular. '
            'In this new form, the system can be solved easily using backward substitution.',
          ),
          DefinitionBlock(
            term: 'Instance Simplification',
            definition: 'A type of transform and conquer where the given instance of a problem '
                'is changed into an easier instance of the same problem. The underlying problem '
                'type does not change, only the input becomes more regular.',
          ),
          TextBlock(
            'A common example of instance simplification: before solving a problem on an array, '
            'we might sort the array first. The original problem may be complicated on an unsorted '
            'array but becomes much simpler once the array is sorted.',
          ),
          DefinitionBlock(
            term: 'Representation Change',
            definition: 'A type of transform and conquer where the essence of the problem is kept '
                'but how the data is represented is changed. For example, mapping an array-based problem '
                'into a tree or graph structure.',
          ),
          TextBlock(
            'Once the problem is expressed in a new representation, we can apply specialist tools '
            'for that structure (tree algorithms, graph algorithms, matrix methods) and sometimes '
            'see hidden patterns that were not visible in the original form.',
          ),
          DefinitionBlock(
            term: 'Problem Reduction',
            definition: 'A type of transform and conquer where the given problem is transformed into '
                'an instance of a well-studied problem that already has known algorithms. The strategy '
                'is to transform, apply the existing algorithm, and optionally transform the result back.',
          ),
          TextBlock(
            'The challenge in problem reduction is mostly in spotting the right reduction. '
            'Once the mapping is found, the algorithm itself is usually straightforward because it '
            'is already known.',
          ),
          QuizBlock(
            question: 'Which type of transform and conquer sorts the input to make '
                'a later step easier?',
            options: [
              'Instance simplification',
              'Representation change',
              'Problem reduction',
              'Divide and conquer',
            ],
            correctIndex: 0,
            explanation: 'Instance simplification changes the given instance into an easier '
                'instance of the same problem, such as sorting an array before processing it.',
          ),
          QuizBlock(
            question: 'What is the key difference between instance simplification and '
                'representation change?',
            options: [
              'Instance simplification keeps the same problem type, representation change changes the data structure',
              'Instance simplification is faster, representation change is slower',
              'They are the same technique with different names',
              'Instance simplification uses graphs, representation change uses arrays',
            ],
            correctIndex: 0,
            explanation: 'Instance simplification produces an easier instance of the same problem, '
                'while representation change keeps the problem essence but changes how the data is '
                'represented (e.g., array to tree).',
          ),
          QuizBlock(
            question: 'In Gaussian Elimination, what does the transformation produce?',
            options: [
              'An upper triangular system',
              'A sorted array',
              'A balanced binary tree',
              'A directed graph',
            ],
            correctIndex: 0,
            explanation: 'Gaussian Elimination transforms the coefficient matrix into upper '
                'triangular form, which can then be solved by backward substitution.',
          ),
          QuizBlock(
            question: 'Why does learning about graphs and trees help with transform and conquer?',
            options: [
              'They provide new representations where specialist algorithms already exist',
              'They are always faster than array-based solutions',
              'They replace all other algorithm design techniques',
              'They are required for instance simplification',
            ],
            correctIndex: 0,
            explanation: 'Many transform-and-conquer algorithms work by re-expressing a problem '
                'as a graph or tree, where powerful algorithms and patterns are already available.',
          ),
          TextBlock(
            'Compared to the earlier techniques: decrease and conquer shrinks the problem size '
            'directly, divide and conquer splits the problem into pieces of the same type, and '
            'transform and conquer changes how we view the problem or which problem we are trying '
            'to solve.',
          ),
          KeyTakeawayBlock(
            'Transform and conquer is about seeing the right viewpoint. By learning to map '
            'problems into new domains with richer tools, you expand your ability to design '
            'efficient algorithms and to recognize deep connections between different topics.',
          ),
        ],
      ),
      ModuleContent(
        id: 'lesson8_module2',
        title: 'Presorting',
        order: 1,
        algorithmId: null,
        contentBlocks: [
          TextBlock(
            'In this module we look at presorting, a classic example of '
            'instance simplification in Transform and Conquer.',
          ),
          DefinitionBlock(
            term: 'Presorting',
            definition: 'An instance simplification technique where the input is sorted first, '
                'then the original problem is solved on the sorted data. The idea is that an '
                'ordered instance of the same problem is often easier to solve.',
          ),
          TextBlock(
            'Sometimes presorting is a great idea and sometimes it is too expensive. '
            'The key is to compare the cost of sorting with the cost of solving the problem directly.',
          ),
          TextBlock(
            'Example: searching for a target value in an array of size n. '
            'Presorting sorts the array in linearithmic time, then uses binary search in '
            'logarithmic time. But simple sequential search scans the unsorted array once '
            'in linear time. For a single search, presorting is not a good idea because '
            'sorting dominates the cost.',
          ),
          KeyTakeawayBlock(
            'Presorting pays off when you perform many searches on the same array, '
            'because the one-time cost of sorting is amortized over many fast lookups.',
          ),
          DefinitionBlock(
            term: 'Presorting vs Sorting While Solving',
            definition: 'In presorting, sorting by itself does not give the final answer. '
                'It only prepares the input. If you do not yet have the answer immediately '
                'after sorting, then you are using presorting. By contrast, some algorithms '
                '(like counting inversions via merge sort) produce the answer as a side effect '
                'of the sort itself.',
          ),
          TextBlock(
            'Element Uniqueness Problem: determine whether all elements in an array are unique.',
          ),
          TextBlock(
            'The naive brute-force approach compares each element with all later elements. '
            'In the worst case this does about n minus 1 plus n minus 2 and so on down to 1 '
            'comparisons, which is quadratic.',
          ),
          TextBlock(
            'The presorting approach sorts the array first, then scans through it once '
            'comparing each element with its neighbour. If any adjacent pair is equal, the '
            'elements are not unique. Sorting costs linearithmic time and the single pass '
            'costs linear time, so the total is linearithmic.',
          ),
          QuizBlock(
            question: 'What is the total worst-case time for element uniqueness via presorting?',
            options: [
              'linearithmic',
              'quadratic',
              'linear',
              'logarithmic',
            ],
            correctIndex: 0,
            explanation: 'Sorting costs linearithmic time and the single scan comparing '
                'neighbours costs linear time, so the total is linearithmic.',
          ),
          TextBlock(
            'The mode of a set of numbers is the value that appears most often.',
          ),
          DefinitionBlock(
            term: 'Mode',
            definition: 'The value that appears most frequently in a collection of numbers. '
                'For example, in the list 3, 4, 8, 16, 8, 4, 8, 24, 6, 8 the mode is 8.',
          ),
          TextBlock(
            'Brute-force approach for finding the mode: for each element, count how many '
            'times it appears in the whole array, store these counts, then find the largest '
            'count. In the worst case (all elements different), the total comparisons are '
            'n minus 1 plus n minus 2 down to 1, which is quadratic. There is also an '
            'extra space cost for storing the counts array.',
          ),
          TextBlock(
            'Presorting approach for the mode: sort the array first, then scan it once '
            'from left to right keeping track of the current value, its consecutive count, '
            'and the best count seen so far. Because equal values are grouped together after '
            'sorting, we only need to look at consecutive elements.',
          ),
          QuizBlock(
            question: 'Why does sorting reduce the mode problem from quadratic to linearithmic?',
            options: [
              'Equal values become consecutive, so a single linear pass can count runs',
              'Sorting removes duplicate elements entirely',
              'Binary search can find the mode directly in a sorted array',
              'Sorting is always faster than any other approach',
            ],
            correctIndex: 0,
            explanation: 'After sorting, identical values are grouped together. A single '
                'left-to-right pass can count consecutive runs, making the post-sort step '
                'linear instead of quadratic.',
          ),
          QuizBlock(
            question: 'When is presorting NOT a good idea?',
            options: [
              'When the best direct algorithm is already linear',
              'When the input has fewer than 10 elements',
              'When the array contains only integers',
              'When you need to do many searches on the same data',
            ],
            correctIndex: 0,
            explanation: 'Presorting always costs at least linearithmic time for '
                'comparison-based sorting. If a direct algorithm already solves the problem '
                'in linear time, presorting would only slow things down.',
          ),
          QuizBlock(
            question: 'For element uniqueness, why is it enough to compare only '
                'neighbouring elements after sorting?',
            options: [
              'Equal elements always end up adjacent in a sorted array',
              'Neighbouring elements are always different in a sorted array',
              'Sorting removes all duplicates automatically',
              'Binary search is faster than comparing neighbours',
            ],
            correctIndex: 0,
            explanation: 'In a sorted array, all equal values are placed next to each other. '
                'So if any two elements are equal, they will be neighbours, and a single pass '
                'will detect them.',
          ),
          CodeBlock(
            'Element Uniqueness (Presorting)\n'
            '1. Sort array A[0..n-1]\n'
            '2. For i = 0 to n-2:\n'
            '3.   If A[i] == A[i+1]: return FALSE\n'
            '4. Return TRUE',
            language: 'text',
          ),
          CodeBlock(
            'Mode via Presorting\n'
            '1. Sort array A[0..n-1]\n'
            '2. modeValue = A[0], modeCount = 1\n'
            '3. current = A[0], count = 1\n'
            '4. For i = 1 to n-1:\n'
            '5.   If A[i] == current:\n'
            '6.     count = count + 1\n'
            '7.   Else:\n'
            '8.     If count > modeCount:\n'
            '9.       modeCount = count, modeValue = current\n'
            '10.    current = A[i], count = 1\n'
            '11. If count > modeCount:\n'
            '12.   modeCount = count, modeValue = current\n'
            '13. Return modeValue',
            language: 'text',
          ),
          TextBlock(
            'Presorting always costs at least linearithmic time for comparison-based '
            'sorting algorithms. Before choosing presorting, ask: does the rest of the '
            'algorithm take at least linearithmic time anyway? Are we gaining a big '
            'improvement over the best direct algorithm? Will we reuse the sorted data '
            'many times?',
          ),
          KeyTakeawayBlock(
            'Presorting is a simple but powerful instance simplification technique. '
            'By paying a one-time cost of sorting, you can often turn a messy problem '
            'into a clean linear scan, as long as the linearithmic cost of sorting makes '
            'sense for your situation.',
          ),
        ],
      ),
    ],
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
