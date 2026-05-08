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
        id: 'lesson2_module4',
        title: 'Worked Example of Time Analysis',
        order: 3,
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
        id: 'lesson2_module5',
        title: 'Caveats: Fast Is Not Always Best',
        order: 4,
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
        order: 5,
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
    ],
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
