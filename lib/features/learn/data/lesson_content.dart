// ═══════════════════════════════════════════════════════════════════════════════
/// Lesson content data models and the master lesson list for the learn feature.
// ═══════════════════════════════════════════════════════════════════════════════

import 'package:flutter/foundation.dart' show immutable;

// ── Content blocks (sealed class hierarchy) ─────────────────────────────────

/// Base type for all content blocks displayed inside a lesson module.
///
/// Subclasses represent different content types: plain text, code snippets,
/// term definitions, key takeaway callouts, and interactive quizzes.
/// An animated asymptotic bound graph (O, Ω, Θ) rendered with CustomPaint.
class GraphBlock extends ContentBlock {
  /// 'bigO' | 'bigOmega' | 'bigTheta'
  final String type;
  const GraphBlock(this.type);
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
            definition: 'Zero or more inputs. A recipe needs ingredients, and an algorithm may need data.',
          ),
          DefinitionBlock(
            term: '2. Output',
            definition:
                "At least one output. A procedure should produce some result.",
          ),
          DefinitionBlock(
            term: '3. Definiteness',
            definition:
                'Each step is clear enough to follow without guessing.',
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
            semanticsLabel: 'log base b of x equals a if and only if b to the a equals x',
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
            semanticsLabel: 'for b greater than 1 and x less than y, log base b of x is less than log base b of y',
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
            semanticsLabel: 'log base b of x times y equals log base b of x plus log base b of y',
          ),
          DefinitionBlock(
            term: 'Rule 4: power rule',
            definition:
                'Powers can be pulled down in front as a multiplier.',
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
            'not the growth category.',
          ),
          MathBlock(
            r'\log_c x = \frac{1}{\log_b c}\log_b x = k\log_b x',
            semanticsLabel: 'log base c of x equals one over log base b of c times log base b of x equals k times log base b of x',
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
            question: 'Why can algorithm analysis usually write log n without specifying the base?',
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
            question: 'In Levitin\'s six-step problem-solving process, when should we write the code?',
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
            'Array size n  |  Home Computer  |  Desktop Computer\n'
            '--------------------------------------------------\n'
            '     125       |      12.5        |       2.8\n'
            '     250       |      49.3        |      11.0\n'
            '     500       |     195.8        |      43.4\n'
            '    1000       |     780.3        |     172.9\n'
            '    2000       |    3114.9        |     690.5',
            language: 'text',
          ),
          TextBlock(
            'Different machines, different speeds, different compilers. But when '
            'you fit curves to this data you get the same shape both times: '
            'quadratic, roughly an n squared term dominates. The home computer '
            'curve might be 0.00078 n squared and the desktop might be 0.00017 '
            'n squared — different coefficients, same shape. This is why we study '
            'growth patterns instead of stopwatch times. The shape is the signal; '
            'the coefficients are noise.',
          ),
          TextBlock(
            'Two algorithms can solve the same problem but behave very differently '
            'as the input grows. One algorithm might take n + 2 steps. Another '
            'might take 5n + 1 steps. Surprisingly, that difference of a few extra '
            'steps per item is often irrelevant. What matters is the shape of the '
            'growth — whether the work grows linearly with the input, or faster, '
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
            question: 'Why do we count basic operations instead of trusting stopwatch time?',
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
        title: 'Best, Worst, and Average Case Mischief',
        order: 1,
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
            'model — it only requires thinking about the hardest input.',
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
        id: 'lesson2_module3',
        title: 'The Formal Framework for Growth',
        order: 2,
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
            'algorithm grows no faster than n squared, that tells us something useful '
            'even before we run it on any machine.',
          ),
          GraphBlock('bigO'),
          DefinitionBlock(
            term: 'Big-O',
            definition:
                'The set of functions that grow no faster than g(n). Formally, '
                'f(n) is in O(g(n)) if there exist a positive constant c and a '
                'nonnegative integer n0 such that f(n) <= c * g(n) for all n >= n0.',
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
                'nonnegative integer n0 such that f(n) >= c * g(n) for all n >= n0.',
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
            '5n squared, it is technically true that O(n cubed), O(n squared log n), '
            'and O(2 to the n) are all valid upper bounds. But O(n squared) is the '
            'tightest and most informative. Always report the simplest true bound.',
          ),
          TextBlock(
            'In practice we simplify as much as possible. If g1(n) = 15n squared '
            'minus 6n plus 27, we usually just write O(n squared). We drop constant '
            'factors and slower-growing terms because for large n the n squared term '
            'dominates. Why can we drop the lower-order terms? Because if f(n) is '
            'bounded above by c times (n squared plus 3n plus 5), then for n >= 1, '
            'f(n) is also bounded above by 9c times n squared. The lower-order terms '
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
            '// Example: prove f(n) = 4n^2 + 8n - 3 is in O(n^2)\n'
            '// Choose g(n) = n^2, c = 15, n0 = 1\n'
            '// Need: 4n^2 + 8n - 3 <= 15n^2 for all n >= 1\n'
            '// 4n^2 + 8n - 3 <= 4n^2 + 8n^2 + 3n^2 = 15n^2  QED',
            language: 'text',
          ),
          QuizBlock(
            question:
                'If f(n) = 5n^2, which of the following is the tightest bound?',
            options: [
              'O(n)',
              'O(n^2)',
              'O(n^3)',
              'O(2^n)',
            ],
            correctIndex: 1,
            explanation:
                'O(n^2) is the tightest bound. O(n) is too tight (false). '
                'O(n^3) and O(2^n) are technically true but do not tell us '
                'as much. The tightest bound is always the simplest that is still correct.',
          ),
          KeyTakeawayBlock(
            'Big-O is an upper bound. Big-Omega is a lower bound. Big-Theta is both '
            'together, meaning same rate of growth. Drop constants and lower-order '
            'terms when you write bounds. Report the tightest one.',
          ),
        ],
      ),
    ],
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
