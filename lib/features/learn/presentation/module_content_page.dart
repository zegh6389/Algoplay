import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_math_fork/flutter_math.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_theme.dart';
import '../data/lesson_content.dart';
import '../providers/lesson_providers.dart';

/// Immersive content reader for a single module.
class ModuleContentPage extends ConsumerStatefulWidget {
  const ModuleContentPage({
    super.key,
    required this.lessonId,
    required this.moduleId,
  });

  final int lessonId;
  final String moduleId;

  @override
  ConsumerState<ModuleContentPage> createState() => _ModuleContentPageState();
}

class _ModuleContentPageState extends ConsumerState<ModuleContentPage> {
  late ModuleContent _module;
  late List<LessonContent> _allLessons;

  // Quiz state per QuizBlock index → selected option index.
  final Map<int, int> _selectedQuizAnswers = {};
  // Quiz state per QuizBlock index → whether answer has been checked.
  final Map<int, bool> _quizChecked = {};

  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _loadModule();
    _restoreScrollPosition();
  }

  void _loadModule() {
    _allLessons = ref.read(lessonsProvider);
    for (final lesson in _allLessons) {
      if (lesson.id == widget.lessonId) {
        final idx = lesson.modules.indexWhere((m) => m.id == widget.moduleId);
        if (idx != -1) {
          _module = lesson.modules[idx];
          return;
        }
      }
    }
    // Fallback: shouldn't happen with valid data.
    _module = ModuleContent(
      id: widget.moduleId,
      title: 'Unknown Module',
      contentBlocks: const [TextBlock('Module content not found.')],
      order: 0,
    );
  }

  Future<void> _restoreScrollPosition() async {
    final repo = ref.read(lessonProgressRepoProvider);
    final offset = await repo.getScrollPosition(widget.lessonId);
    if (!mounted || offset <= 0) return;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || !_scrollController.hasClients) return;
      _scrollController.jumpTo(
        offset.clamp(0.0, _scrollController.position.maxScrollExtent),
      );
    });
  }

  Future<void> _saveReaderState() async {
    final repo = ref.read(lessonProgressRepoProvider);
    await repo.setCurrentModule(widget.lessonId, widget.moduleId);
    if (_scrollController.hasClients) {
      await repo.setScrollPosition(widget.lessonId, _scrollController.offset);
    }
  }

  Future<void> _openVisualizer() async {
    final algorithmId = _module.algorithmId;
    if (algorithmId == null) return;
    await _saveReaderState();
    if (!mounted) return;
    context.push('/visualizer/$algorithmId');
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _markCompleteAndContinue() async {
    final repo = ref.read(lessonProgressRepoProvider);
    await repo.markModuleComplete(widget.lessonId, widget.moduleId);
    await repo.setCurrentModule(widget.lessonId, widget.moduleId);

    if (!mounted) return;

    // Try to navigate to next module.
    final lesson = _allLessons.firstWhere(
      (l) => l.id == widget.lessonId,
      orElse: () => _allLessons.first,
    );
    final currentIndex = lesson.modules.indexWhere(
      (m) => m.id == widget.moduleId,
    );

    if (currentIndex >= 0 && currentIndex < lesson.modules.length - 1) {
      final nextModule = lesson.modules[currentIndex + 1];
      // Replace current route with next module.
      context.pushReplacement(
        '/lesson/${widget.lessonId}/module/${nextModule.id}',
      );
    } else {
      // Last module — go back to lesson detail.
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () async {
            await _saveReaderState();
            if (!context.mounted) return;
            context.pop();
          },
        ),
        title: Text(
          _module.title,
          style: AppTypography.h3,
          overflow: TextOverflow.ellipsis,
        ),
        actions: [
          if (_module.algorithmId != null)
            FilledButton.tonalIcon(
              onPressed: _openVisualizer,
              icon: const Icon(Icons.auto_awesome, size: 18),
              label: const Text('See the Magic'),
            ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.lg,
                vertical: AppSpacing.xl,
              ),
              itemCount:
                  _module.contentBlocks.length + 1, // +1 for bottom padding
              itemBuilder: (context, index) {
                if (index == _module.contentBlocks.length) {
                  // Bottom spacer so last item isn't hidden behind button.
                  return const SizedBox(height: 80);
                }
                return Padding(
                  padding: const EdgeInsets.only(bottom: AppSpacing.lg),
                  child: _buildBlock(_module.contentBlocks[index], index),
                );
              },
            ),
          ),

          // ── Bottom action bar ────────────────────────────────────────────
          Container(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg,
              AppSpacing.md,
              AppSpacing.lg,
              AppSpacing.lg,
            ),
            decoration: const BoxDecoration(
              color: AppColors.card,
              border: Border(top: BorderSide(color: AppColors.sunken)),
            ),
            child: SafeArea(
              top: false,
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _markCompleteAndContinue,
                  child: const Text('Mark Complete & Continue'),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Block builders ─────────────────────────────────────────────────────────

  Widget _buildBlock(ContentBlock block, int index) {
    return switch (block) {
      TextBlock(:final text) => _TextBlockWidget(text: text),
      CodeBlock(:final code, :final language) => _CodeBlockWidget(
        code: code,
        language: language,
      ),
      MathBlock(:final tex, :final semanticsLabel) => _MathBlockWidget(
        tex: tex,
        semanticsLabel: semanticsLabel,
      ),
      DefinitionBlock(:final term, :final definition) => _DefinitionBlockWidget(
        term: term,
        definition: definition,
      ),
      KeyTakeawayBlock(:final text) => _KeyTakeawayBlockWidget(text: text),
      QuizBlock() => _QuizBlockWidget(
        block: block,
        index: index,
        selectedIndex: _selectedQuizAnswers[index],
        checked: _quizChecked[index] ?? false,
        onSelect: (optionIndex) {
          setState(() {
            _selectedQuizAnswers[index] = optionIndex;
          });
        },
        onCheck: () {
          setState(() {
            _quizChecked[index] = true;
          });
        },
      ),
      GraphBlock(:final type) => _GraphBlockWidget(type: type),
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Text block — plain paragraph.
// ═══════════════════════════════════════════════════════════════════════════════
class _TextBlockWidget extends StatelessWidget {
  const _TextBlockWidget({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(text, style: AppTypography.body);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Code block — dark background, monospace font.
// ═══════════════════════════════════════════════════════════════════════════════
class _CodeBlockWidget extends StatelessWidget {
  const _CodeBlockWidget({required this.code, required this.language});

  final String code;
  final String language;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        const horizontalPadding = AppSpacing.lg * 2;
        final longestLine = code
            .split('\n')
            .fold<int>(0, (longest, line) => math.max(longest, line.length));
        final availableWidth = math.max(
          1.0,
          constraints.maxWidth - horizontalPadding,
        );
        final fittedFontSize = longestLine == 0
            ? 13.0
            : (availableWidth / (longestLine * 0.62)).clamp(9.0, 13.0);

        return Container(
          width: double.infinity,
          padding: const EdgeInsets.all(AppSpacing.lg),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B), // dark blue-gray
            borderRadius: AppRadius.mdBorder,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Language label
              Text(
                language.toUpperCase(),
                style: const TextStyle(
                  color: Color(0xFF94A3B8),
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.8,
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                code,
                softWrap: false,
                overflow: TextOverflow.visible,
                style: TextStyle(
                  fontFamily: 'monospace',
                  fontSize: fittedFontSize,
                  height: 1.6,
                  color: const Color(0xFFE2E8F0),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Math block — TeX formula rendered in a readable scientific notation card.
// ═══════════════════════════════════════════════════════════════════════════════
class _MathBlockWidget extends StatelessWidget {
  const _MathBlockWidget({required this.tex, required this.semanticsLabel});

  final String tex;
  final String semanticsLabel;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: semanticsLabel,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: AppColors.primary50,
          borderRadius: AppRadius.mdBorder,
          border: Border.all(color: AppColors.primary300),
        ),
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Math.tex(
            tex,
            textStyle: AppTypography.h3.copyWith(color: AppColors.textPrimary),
            mathStyle: MathStyle.display,
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Definition block — lightbulb card.
// ═══════════════════════════════════════════════════════════════════════════════
class _DefinitionBlockWidget extends StatelessWidget {
  const _DefinitionBlockWidget({required this.term, required this.definition});

  final String term;
  final String definition;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.warning100,
        borderRadius: AppRadius.mdBorder,
        border: Border.all(color: AppColors.solarGold.withValues(alpha: 0.3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.lightbulb_rounded, color: AppColors.solarGold, size: 22),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(term, style: AppTypography.bodyBold),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  definition,
                  style: AppTypography.body.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Key takeaway block — gold border, star icon.
// ═══════════════════════════════════════════════════════════════════════════════
class _KeyTakeawayBlockWidget extends StatelessWidget {
  const _KeyTakeawayBlockWidget({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.primary50,
        borderRadius: AppRadius.mdBorder,
        border: Border.all(color: AppColors.solarGold, width: 1.5),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.star_rounded, color: AppColors.solarGold, size: 22),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Text(
              text,
              style: AppTypography.body.copyWith(
                fontWeight: FontWeight.w500,
                color: AppColors.textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Interactive quiz block with selectable chips and answer checking.
// ═══════════════════════════════════════════════════════════════════════════════
class _QuizBlockWidget extends StatelessWidget {
  const _QuizBlockWidget({
    required this.block,
    required this.index,
    required this.selectedIndex,
    required this.checked,
    required this.onSelect,
    required this.onCheck,
  });

  final QuizBlock block;
  final int index;
  final int? selectedIndex;
  final bool checked;
  final ValueChanged<int> onSelect;
  final VoidCallback onCheck;

  bool get _isCorrect => selectedIndex == block.correctIndex;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: AppRadius.mdBorder,
        border: Border.all(color: AppColors.sunken),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Question icon + text
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.quiz_rounded, color: AppColors.primary500, size: 20),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Text(block.question, style: AppTypography.bodyBold),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // Option chips
          Wrap(
            spacing: AppSpacing.sm,
            runSpacing: AppSpacing.sm,
            children: [
              for (int i = 0; i < block.options.length; i++)
                _buildOptionChip(i),
            ],
          ),

          // Check answer button
          if (!checked && selectedIndex != null) ...[
            const SizedBox(height: AppSpacing.md),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: onCheck,
                child: const Text('Check Answer'),
              ),
            ),
          ],

          // Feedback
          if (checked) ...[
            const SizedBox(height: AppSpacing.md),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: _isCorrect ? AppColors.success100 : AppColors.error100,
                borderRadius: AppRadius.smBorder,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        _isCorrect
                            ? Icons.check_circle_rounded
                            : Icons.cancel_rounded,
                        color: _isCorrect
                            ? AppColors.success600
                            : AppColors.error600,
                        size: 18,
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Text(
                        _isCorrect ? 'Correct!' : 'Not quite!',
                        style: AppTypography.caption.copyWith(
                          color: _isCorrect
                              ? AppColors.success600
                              : AppColors.error600,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    block.explanation,
                    style: AppTypography.caption.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildOptionChip(int i) {
    final isSelected = selectedIndex == i;
    final showCorrect = checked && i == block.correctIndex;
    final showWrong = checked && isSelected && i != block.correctIndex;

    Color bgColor = AppColors.sunken;
    Color textColor = AppColors.textPrimary;
    BoxBorder? border;

    if (showCorrect) {
      bgColor = AppColors.success100;
      textColor = AppColors.success600;
      border = Border.all(color: AppColors.success600);
    } else if (showWrong) {
      bgColor = AppColors.error100;
      textColor = AppColors.error600;
      border = Border.all(color: AppColors.error600);
    } else if (isSelected && !checked) {
      bgColor = AppColors.primary100;
      textColor = AppColors.primary500;
      border = Border.all(color: AppColors.primary500);
    }

    return GestureDetector(
      onTap: checked ? null : () => onSelect(i),
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm,
        ),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: AppRadius.smBorder,
          border: border,
        ),
        child: Text(
          block.options[i],
          style: AppTypography.caption.copyWith(
            color: textColor,
            fontWeight: isSelected ? FontWeight.w600 : null,
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Animated asymptotic bound graph — O, Ω, or Θ drawn with CustomPainter.
// ═══════════════════════════════════════════════════════════════════════════════
class _GraphBlockWidget extends StatefulWidget {
  const _GraphBlockWidget({required this.type});

  final String type; // 'bigO' | 'bigOmega' | 'bigTheta'

  @override
  State<_GraphBlockWidget> createState() => _GraphBlockWidgetState();
}

class _GraphBlockWidgetState extends State<_GraphBlockWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  // Graph config keyed by type
  static const _configs = {
    'bigO': _GraphConfig(
      fLabel: 'f(n) = n + 0.6 sin(n)',
      gLabel: 'g(n) = n',
      boundLabel: 'c\u00b7g(n) = 1.8n',
      boundType: _BoundType.upper,
      fFn: _fO,
      gFn: _gLinear,
      cFn: _cLinearO,
      c2Fn: null,
      n0: 3.5,
      n0Display: 'n\u2080 = 3.5',
    ),
    'bigOmega': _GraphConfig(
      fLabel: 'f(n) = 1.4n + 0.5 sin(n)',
      gLabel: 'g(n) = n',
      boundLabel: 'c\u2082\u00b7g(n) = 1.0n',
      boundType: _BoundType.lower,
      fFn: _fOmega,
      gFn: _gLinear,
      cFn: _cLinearOmega,
      c2Fn: null,
      n0: 3.5,
      n0Display: 'n\u2080 = 3.5',
    ),
    'bigTheta': _GraphConfig(
      fLabel: 'f(n) = n + 0.25n\u00b7sin(n)',
      gLabel: 'g(n) = n',
      boundLabel: 'c\u2081\u00b7g(n) = 1.5n',
      boundLowerLabel: 'c\u2082\u00b7g(n) = 0.5n',
      boundType: _BoundType.tight,
      fFn: _fTheta,
      gFn: _gLinear,
      cFn: _cLinearTheta,
      c2Fn: _c2LinearTheta,
      n0: 3.0,
      n0Display: 'n\u2080 = 3.0',
    ),
  };

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    );
    _animation = CurvedAnimation(parent: _controller, curve: Curves.easeInOut);
    _controller.repeat(reverse: false);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final config = _configs[widget.type] ?? _configs['bigO']!;
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: AppRadius.mdBorder,
        border: Border.all(color: AppColors.sunken),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header bar
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg,
              vertical: AppSpacing.sm,
            ),
            decoration: BoxDecoration(color: _headerColor(widget.type)),
            child: Text(
              _headerLabel(widget.type),
              style: AppTypography.caption.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.05,
              ),
            ),
          ),
          // Canvas
          SizedBox(
            height: 240,
            child: AnimatedBuilder(
              animation: _animation,
              builder: (context, child) {
                return CustomPaint(
                  painter: _AsymptoticGraphPainter(
                    config: config,
                    progress: _animation.value,
                  ),
                  size: Size.infinite,
                );
              },
            ),
          ),
          // Legend
          Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Wrap(
              spacing: AppSpacing.lg,
              runSpacing: AppSpacing.xs,
              children: [
                _legendItem(const Color(0xFF3B82F6), config.fLabel),
                _legendItem(const Color(0xFFF97316), config.gLabel),
                if (config.boundType != _BoundType.tight)
                  _legendItem(const Color(0xFF22C55E), config.boundLabel),
                if (config.boundType == _BoundType.tight) ...[
                  _legendItem(const Color(0xFF22C55E), config.boundLabel),
                  _legendItem(
                    const Color(0xFFA855F7),
                    config.boundLowerLabel ?? '',
                  ),
                ],
              ],
            ),
          ),
          // Formula strip
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: AppColors.primary50.withValues(alpha: 0.4),
              border: Border(top: BorderSide(color: AppColors.sunken)),
            ),
            child: Text(
              _formulaText(widget.type),
              style: AppTypography.caption.copyWith(
                fontFamily: 'monospace',
                color: AppColors.textSecondary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _headerColor(String type) {
    return switch (type) {
      'bigO' => const Color(0xFF3B82F6),
      'bigOmega' => const Color(0xFFF97316),
      'bigTheta' => const Color(0xFF22C55E),
      _ => AppColors.primary500,
    };
  }

  String _headerLabel(String type) {
    return switch (type) {
      'bigO' => 'O(g) — Upper Bound',
      'bigOmega' => '\u03A9(g) — Lower Bound',
      'bigTheta' => '\u0398(g) — Tight Bound',
      _ => 'Growth',
    };
  }

  String _formulaText(String type) {
    return switch (type) {
      'bigO' => 'f(n) ≤ c·g(n)  for all n ≥ n₀',
      'bigOmega' => 'f(n) ≥ c·g(n)  for all n ≥ n₀',
      'bigTheta' => 'c₂·g(n) ≤ f(n) ≤ c₁·g(n)  for all n ≥ n₀',
      _ => '',
    };
  }

  Widget _legendItem(Color color, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 5),
        Text(label, style: AppTypography.caption),
      ],
    );
  }
}

// ── Graph math ────────────────────────────────────────────────────────────────

double _fO(double n) => n + 0.6 * math.sin(n);
double _fOmega(double n) => 1.4 * n + 0.5 * math.sin(n);
double _fTheta(double n) => n + 0.25 * n * math.sin(n);
double _gLinear(double n) => n;
double _cLinearO(double n) => 1.8 * n;
double _cLinearOmega(double n) => 1.0 * n;
double _cLinearTheta(double n) => 1.5 * n;
double _c2LinearTheta(double n) => 0.5 * n;

// ── Config ────────────────────────────────────────────────────────────────────

enum _BoundType { upper, lower, tight }

class _GraphConfig {
  final String fLabel;
  final String gLabel;
  final String boundLabel;
  final String? boundLowerLabel;
  final _BoundType boundType;
  final double Function(double) fFn;
  final double Function(double) gFn;
  final double Function(double) cFn;
  final double Function(double)? c2Fn;
  final double n0;
  final String n0Display;

  const _GraphConfig({
    required this.fLabel,
    required this.gLabel,
    required this.boundLabel,
    this.boundLowerLabel,
    required this.boundType,
    required this.fFn,
    required this.gFn,
    required this.cFn,
    this.c2Fn,
    required this.n0,
    required this.n0Display,
  });
}

// ── Painter ───────────────────────────────────────────────────────────────────

class _AsymptoticGraphPainter extends CustomPainter {
  _AsymptoticGraphPainter({required this.config, required this.progress});

  final _GraphConfig config;
  final double progress;

  static const _maxN = 10.0;
  static const _maxT = 18.0;
  static const _padX = 44.0;
  static const _padY = 28.0;

  double _mapX(double n, double w) => _padX + (n / _maxN) * (w - 2 * _padX);
  double _mapY(double t, double h) => h - _padY - (t / _maxT) * (h - 2 * _padY);

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width, h = size.height;
    final n0X = _mapX(config.n0, w);

    _drawGrid(canvas, w, h, n0X);
    _drawAxes(canvas, w, h);

    if (config.boundType == _BoundType.tight) {
      _drawTightBound(canvas, w, h, n0X);
    } else {
      _drawSingleBound(canvas, w, h, n0X);
    }
  }

  void _drawGrid(Canvas canvas, double w, double h, double n0X) {
    final gridPaint = Paint()
      ..color = const Color(0xFFE2E8F0)
      ..strokeWidth = 0.75;
    for (int i = 0; i <= 10; i++) {
      final x = _padX + (i / 10) * (w - 2 * _padX);
      canvas.drawLine(Offset(x, 0), Offset(x, h - _padY), gridPaint);
    }
    for (int i = 0; i <= 6; i++) {
      final y = _padY + (i / 6) * (h - 2 * _padY);
      canvas.drawLine(Offset(_padX, y), Offset(w, y), gridPaint);
    }

    if (n0X > _padX && n0X < w - 4) {
      _drawDashedV(canvas, n0X, h - _padY);
      _drawText(
        canvas,
        config.n0Display,
        Offset(n0X + 4, 4),
        const Color(0xFF64748B),
        10,
      );
    }
  }

  void _drawAxes(Canvas canvas, double w, double h) {
    final p = Paint()
      ..color = const Color(0xFF94A3B8)
      ..strokeWidth = 1.0;
    canvas.drawLine(Offset(_padX, 0), Offset(_padX, h - _padY), p);
    canvas.drawLine(Offset(_padX, h - _padY), Offset(w, h - _padY), p);
    _drawText(
      canvas,
      'n',
      Offset(w - 12, h - _padY - 14),
      const Color(0xFF94A3B8),
      10,
    );
    _drawText(
      canvas,
      'T(n)',
      Offset(_padX + 2, 2),
      const Color(0xFF94A3B8),
      10,
    );
  }

  void _drawSingleBound(Canvas canvas, double w, double h, double n0X) {
    final gVis = _c((progress - 0.15) / 0.3);
    final cVis = _c((progress - 0.35) / 0.3);
    final fVis = _c(progress / 0.6);

    if (gVis > 0)
      _curve(canvas, w, h, _gLinear, const Color(0xFFF97316), 1.5, [
        5,
        4,
      ], opacity: gVis);
    if (cVis > 0) {
      _curve(
        canvas,
        w,
        h,
        config.cFn,
        const Color(0xFF22C55E),
        2.0,
        null,
        opacity: cVis,
      );
      canvas.drawCircle(
        Offset(n0X, _mapY(config.cFn(config.n0), h)),
        3,
        Paint()..color = const Color(0xFF22C55E),
      );
    }
    if (fVis > 0)
      _curve(
        canvas,
        w,
        h,
        config.fFn,
        const Color(0xFF3B82F6),
        2.5,
        null,
        opacity: fVis,
        shadow: true,
        fraction: fVis,
      );
  }

  void _drawTightBound(Canvas canvas, double w, double h, double n0X) {
    final gVis = _c((progress - 0.15) / 0.3);
    final c1Vis = _c((progress - 0.35) / 0.3);
    final c2Vis = _c((progress - 0.42) / 0.28);
    final bandVis = _c((progress - 0.32) / 0.35);
    final fVis = _c(progress / 0.65);

    // Shaded band between c1·g and c2·g
    if (bandVis > 0 && config.c2Fn != null) {
      final pts1 = _pts(w, h, config.cFn, 100);
      final pts2 = _pts(w, h, config.c2Fn!, 100);
      if (pts1.isNotEmpty && pts2.isNotEmpty) {
        final band = Path()..moveTo(pts1.first.dx, pts1.first.dy);
        for (final p in pts1) band.lineTo(p.dx, p.dy);
        for (final p in pts2.reversed) band.lineTo(p.dx, p.dy);
        band.close();
        canvas.drawPath(
          band,
          Paint()
            ..color = const Color(0xFFA855F7).withValues(alpha: bandVis * 0.10),
        );
      }
    }

    if (gVis > 0)
      _curve(canvas, w, h, _gLinear, const Color(0xFFF97316), 1.5, [
        5,
        4,
      ], opacity: gVis);
    if (c1Vis > 0)
      _curve(canvas, w, h, config.cFn, const Color(0xFF22C55E), 1.5, [
        6,
        4,
      ], opacity: c1Vis);
    if (c2Vis > 0 && config.c2Fn != null)
      _curve(canvas, w, h, config.c2Fn!, const Color(0xFFA855F7), 1.5, [
        6,
        4,
      ], opacity: c2Vis);
    if (fVis > 0)
      _curve(
        canvas,
        w,
        h,
        config.fFn,
        const Color(0xFF3B82F6),
        2.5,
        null,
        opacity: fVis,
        shadow: true,
        fraction: fVis,
      );
  }

  void _curve(
    Canvas canvas,
    double w,
    double h,
    double Function(double) fn,
    Color color,
    double strokeWidth,
    List<double>? dash, {
    double opacity = 1.0,
    bool shadow = false,
    double fraction = 1.0,
  }) {
    final pts = _pts(w, h, fn, 200);
    final count = (pts.length * fraction).round().clamp(0, pts.length);
    if (count == 0) return;

    final path = Path()..moveTo(pts[0].dx, pts[0].dy);
    for (int i = 1; i < count; i++) path.lineTo(pts[i].dx, pts[i].dy);

    final paint = Paint()
      ..color = color.withValues(alpha: opacity)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    if (dash != null) {
      // Manual dash: draw segments directly with drawLine, shadow drawn solid
      if (shadow) {
        final sp = Paint()
          ..color = color.withValues(alpha: opacity * 0.25)
          ..style = PaintingStyle.stroke
          ..strokeWidth = strokeWidth + 3
          ..strokeCap = StrokeCap.round
          ..strokeJoin = StrokeJoin.round
          ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 4);
        _drawDashedLine(canvas, pts, count, [
          strokeWidth + 3,
          strokeWidth + 3,
        ], sp);
      }
      _drawDashedLine(canvas, pts, count, dash, paint);
    } else {
      if (shadow) {
        canvas.drawPath(
          path,
          Paint()
            ..color = color.withValues(alpha: opacity * 0.25)
            ..style = PaintingStyle.stroke
            ..strokeWidth = strokeWidth + 3
            ..strokeCap = StrokeCap.round
            ..strokeJoin = StrokeJoin.round
            ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 4),
        );
      }
      canvas.drawPath(path, paint);
    }
  }

  void _drawDashedLine(
    Canvas canvas,
    List<Offset> pts,
    int count,
    List<double> dash,
    Paint paint,
  ) {
    final dashLen = dash[0];
    final gapLen = dash.length > 1 ? dash[1] : dash[0];
    final patternLen = dashLen + gapLen;
    var distanceInPattern = 0.0;

    for (int i = 0; i < count - 1; i++) {
      final start = pts[i];
      final end = pts[i + 1];
      final segment = end - start;
      final segLen = segment.distance;
      if (segLen == 0) continue;

      var pos = 0.0;
      while (pos < segLen) {
        final isDash = distanceInPattern < dashLen;
        final remainingInPart = isDash
            ? dashLen - distanceInPattern
            : patternLen - distanceInPattern;
        final step = math.min(remainingInPart, segLen - pos);
        if (step <= 0) break;

        if (isDash) {
          final from = start + segment * (pos / segLen);
          final to = start + segment * ((pos + step) / segLen);
          canvas.drawLine(from, to, paint);
        }

        pos += step;
        distanceInPattern = (distanceInPattern + step) % patternLen;
      }
    }
  }

  List<Offset> _pts(double w, double h, double Function(double) fn, int n) {
    final r = <Offset>[];
    for (int i = 0; i <= n; i++) {
      final v = (i / n) * _maxN;
      final t = fn(v);
      if (t.isNaN || t.isInfinite) continue;
      r.add(Offset(_mapX(v, w), _mapY(t.clamp(0, _maxT * 1.5), h)));
    }
    return r;
  }

  void _drawDashedV(Canvas canvas, double x, double y2) {
    final paint = Paint()
      ..color = const Color(0xFF94A3B8)
      ..strokeWidth = 1.0
      ..style = PaintingStyle.stroke;
    const dl = 4.0, gl = 4.0;
    var d = 0.0, draw = true;
    while (d < y2) {
      final n = draw ? dl : gl;
      final e = (d + n).clamp(0.0, y2);
      if (draw) canvas.drawLine(Offset(x, d), Offset(x, e), paint);
      d = e;
      draw = !draw;
    }
  }

  void _drawText(
    Canvas canvas,
    String text,
    Offset pos,
    Color color,
    double size,
  ) {
    TextPainter(
        text: TextSpan(
          text: text,
          style: TextStyle(color: color, fontSize: size),
        ),
        textDirection: TextDirection.ltr,
      )
      ..layout()
      ..paint(canvas, pos);
  }

  double _c(double x) => x.clamp(0.0, 1.0);

  @override
  bool shouldRepaint(covariant _AsymptoticGraphPainter old) =>
      old.progress != progress || old.config != config;
}
