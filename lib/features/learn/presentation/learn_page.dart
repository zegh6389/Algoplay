import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_theme.dart';
import '../data/algorithm_data.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// Learn screen — browse and search algorithms.
// ═══════════════════════════════════════════════════════════════════════════════

class LearnPage extends ConsumerStatefulWidget {
  const LearnPage({super.key});

  @override
  ConsumerState<LearnPage> createState() => _LearnPageState();
}

class _LearnPageState extends ConsumerState<LearnPage> {
  String _searchQuery = '';
  AlgorithmCategory? _selectedCategory; // null means "All"

  @override
  Widget build(BuildContext context) {
    final filtered = _filteredAlgorithms;

    return Scaffold(
      backgroundColor: AppColors.card,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // ── Header ────────────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                AppSpacing.lg,
                AppSpacing.lg,
                AppSpacing.sm,
              ),
              child: Text(
                'Algorithms',
                style: AppTypography.h1.copyWith(
                  color: AppColors.textPrimary,
                ),
              ),
            ),

            // ── Search bar ────────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.lg,
                vertical: AppSpacing.sm,
              ),
              child: _SearchBar(
                onChanged: (value) => setState(() => _searchQuery = value),
              ),
            ),

            // ── Category pills ────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.lg,
                vertical: AppSpacing.sm,
              ),
              child: _CategoryPills(
                selected: _selectedCategory,
                onSelected: (cat) =>
                    setState(() => _selectedCategory = cat),
              ),
            ),

            const SizedBox(height: AppSpacing.sm),

            // ── Results count ─────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.lg,
              ),
              child: Text(
                '${filtered.length} algorithm${filtered.length == 1 ? '' : 's'}',
                style: AppTypography.caption,
              ),
            ),

            const SizedBox(height: AppSpacing.sm),

            // ── Algorithm list ────────────────────────────────────────────────
            Expanded(
              child: filtered.isEmpty
                  ? _EmptyState(query: _searchQuery)
                  : ListView.separated(
                      padding: const EdgeInsets.fromLTRB(
                        AppSpacing.lg,
                        0,
                        AppSpacing.lg,
                        AppSpacing.xxl,
                      ),
                      itemCount: filtered.length,
                      separatorBuilder: (_, __) =>
                          const SizedBox(height: AppSpacing.sm),
                      itemBuilder: (context, index) {
                        final algo = filtered[index];
                        return _AlgorithmListCard(
                          algorithm: algo,
                          onTap: () =>
                              context.go('/visualizer/${algo.id}'),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  List<AlgorithmInfo> get _filteredAlgorithms {
    var results = allAlgorithms;

    // Category filter
    if (_selectedCategory != null) {
      results =
          results.where((a) => a.category == _selectedCategory).toList();
    }

    // Search filter
    if (_searchQuery.isNotEmpty) {
      final q = _searchQuery.toLowerCase();
      results = results.where((a) {
        return a.name.toLowerCase().contains(q) ||
            a.category.label.toLowerCase().contains(q) ||
            a.description.toLowerCase().contains(q);
      }).toList();
    }

    return results;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Search bar with rounded corners and search icon.
// ═══════════════════════════════════════════════════════════════════════════════

class _SearchBar extends StatelessWidget {
  final ValueChanged<String> onChanged;
  const _SearchBar({required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.sunken,
        borderRadius: AppRadius.xlBorder,
      ),
      child: TextField(
        onChanged: onChanged,
        style: AppTypography.body,
        decoration: InputDecoration(
          hintText: 'Search algorithms...',
          hintStyle: AppTypography.body.copyWith(
            color: AppColors.textMuted,
          ),
          prefixIcon: const Icon(
            Icons.search_rounded,
            color: AppColors.textMuted,
            size: 20,
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.md,
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Horizontal scrollable category filter pills.
// ═══════════════════════════════════════════════════════════════════════════════

class _CategoryPills extends StatelessWidget {
  final AlgorithmCategory? selected;
  final ValueChanged<AlgorithmCategory?> onSelected;

  const _CategoryPills({
    required this.selected,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    final items = [
      null, // "All"
      ...AlgorithmCategory.values,
    ];

    return SizedBox(
      height: 36,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: items.length,
        separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.sm),
        itemBuilder: (context, index) {
          final cat = items[index];
          final isActive = selected == cat;
          final label = cat?.label ?? 'All';

          return _CategoryPill(
            label: label,
            isActive: isActive,
            onTap: () => onSelected(cat),
          );
        },
      ),
    );
  }
}

class _CategoryPill extends StatelessWidget {
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  const _CategoryPill({
    required this.label,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOutCubic,
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.sm,
        ),
        decoration: BoxDecoration(
          color: isActive ? AppColors.primary500 : AppColors.sunken,
          borderRadius: AppRadius.fullBorder,
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: isActive
                  ? AppColors.textInverse
                  : AppColors.textSecondary,
            ),
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Individual algorithm card in the list.
// ═══════════════════════════════════════════════════════════════════════════════

class _AlgorithmListCard extends StatelessWidget {
  final AlgorithmInfo algorithm;
  final VoidCallback onTap;

  const _AlgorithmListCard({
    required this.algorithm,
    required this.onTap,
  });

  Color get _categoryColor {
    switch (algorithm.category) {
      case AlgorithmCategory.sorting:
        return AppColors.catSorting;
      case AlgorithmCategory.searching:
        return AppColors.catSearching;
      case AlgorithmCategory.graphs:
        return AppColors.catGraphs;
      case AlgorithmCategory.dp:
        return AppColors.catDp;
      case AlgorithmCategory.greedy:
        return AppColors.catGreedy;
      case AlgorithmCategory.trees:
        return AppColors.catTrees;
    }
  }

  Color get _difficultyColor {
    switch (algorithm.difficulty) {
      case AlgorithmDifficulty.easy:
        return AppColors.success600;
      case AlgorithmDifficulty.medium:
        return AppColors.warning600;
      case AlgorithmDifficulty.hard:
        return AppColors.error600;
    }
  }

  String get _difficultyLabel {
    switch (algorithm.difficulty) {
      case AlgorithmDifficulty.easy:
        return 'Easy';
      case AlgorithmDifficulty.medium:
        return 'Medium';
      case AlgorithmDifficulty.hard:
        return 'Hard';
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: AppRadius.lgBorder,
          boxShadow: AppShadows.sm,
        ),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Row(
            children: [
              // ── Category color dot ──
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  color: _categoryColor,
                  shape: BoxShape.circle,
                ),
              ),

              const SizedBox(width: AppSpacing.md),

              // ── Name + time complexity ──
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      algorithm.name,
                      style: AppTypography.bodyBold.copyWith(
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      algorithm.timeComplexity,
                      style: AppTypography.caption.copyWith(
                        color: AppColors.textMuted,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(width: AppSpacing.md),

              // ── Difficulty chip ──
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.sm,
                  vertical: AppSpacing.xs,
                ),
                decoration: BoxDecoration(
                  color: _difficultyColor.withValues(alpha: 0.12),
                  borderRadius: AppRadius.smBorder,
                ),
                child: Text(
                  _difficultyLabel,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: _difficultyColor,
                  ),
                ),
              ),

              const SizedBox(width: AppSpacing.sm),

              // ── Chevron ──
              const Icon(
                Icons.chevron_right_rounded,
                size: 20,
                color: AppColors.textMuted,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Empty state shown when no algorithms match the filter.
// ═══════════════════════════════════════════════════════════════════════════════

class _EmptyState extends StatelessWidget {
  final String query;
  const _EmptyState({required this.query});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xxl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.search_off_rounded,
              size: 48,
              color: AppColors.textMuted,
            ),
            const SizedBox(height: AppSpacing.lg),
            Text(
              query.isEmpty ? 'No algorithms found' : 'No results for "$query"',
              style: AppTypography.bodyBold.copyWith(
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              'Try adjusting your search or category filter.',
              style: AppTypography.caption,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
