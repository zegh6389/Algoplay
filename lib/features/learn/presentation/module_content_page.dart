import 'package:flutter/material.dart';
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
          onPressed: () {
            // Save scroll position on exit.
            if (_scrollController.hasClients) {
              final repo = ref.read(lessonProgressRepoProvider);
              repo.setScrollPosition(
                widget.lessonId,
                _scrollController.offset,
              );
            }
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
            TextButton.icon(
              onPressed: () =>
                  context.push('/visualizer/${_module.algorithmId}'),
              icon: const Icon(Icons.auto_awesome, size: 16),
              label: const Text('✨ Visualize'),
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
              itemCount: _module.contentBlocks.length + 1, // +1 for bottom padding
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
              border: Border(
                top: BorderSide(color: AppColors.sunken),
              ),
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
      CodeBlock(:final code, :final language) =>
        _CodeBlockWidget(code: code, language: language),
      DefinitionBlock(:final term, :final definition) =>
        _DefinitionBlockWidget(term: term, definition: definition),
      KeyTakeawayBlock(:final text) =>
        _KeyTakeawayBlockWidget(text: text),
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
            style: const TextStyle(
              fontFamily: 'monospace',
              fontSize: 13,
              height: 1.6,
              color: Color(0xFFE2E8F0),
            ),
          ),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Definition block — lightbulb card.
// ═══════════════════════════════════════════════════════════════════════════════
class _DefinitionBlockWidget extends StatelessWidget {
  const _DefinitionBlockWidget({
    required this.term,
    required this.definition,
  });

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
          Icon(
            Icons.lightbulb_rounded,
            color: AppColors.solarGold,
            size: 22,
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  term,
                  style: AppTypography.bodyBold,
                ),
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
          Icon(
            Icons.star_rounded,
            color: AppColors.solarGold,
            size: 22,
          ),
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
              Icon(
                Icons.quiz_rounded,
                color: AppColors.primary500,
                size: 20,
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Text(
                  block.question,
                  style: AppTypography.bodyBold,
                ),
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
