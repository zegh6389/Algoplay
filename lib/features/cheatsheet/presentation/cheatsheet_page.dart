import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_theme.dart';
import '../../../features/learn/data/algorithm_data.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// Cheatsheet Page — Quick reference for all algorithms.
/// Displays time/space complexity, key characteristics, and one-liner
/// descriptions in a scannable, categorized format.
// ═══════════════════════════════════════════════════════════════════════════════

/// Provider for the selected category filter
final _selectedCategoryProvider = StateProvider<AlgorithmCategory?>((_) => null);

/// Provider for the search query
final _searchQueryProvider = StateProvider<String>((_) => '');

/// Provider for filtered algorithm list
final _filteredAlgorithmsProvider = Provider<List<AlgorithmInfo>>((ref) {
  final category = ref.watch(_selectedCategoryProvider);
  final query = ref.watch(_searchQueryProvider).toLowerCase();

  return allAlgorithms.where((algo) {
    final matchesCategory = category == null || algo.category == category;
    final matchesQuery = query.isEmpty ||
        algo.name.toLowerCase().contains(query) ||
        algo.description.toLowerCase().contains(query) ||
        algo.timeComplexity.toLowerCase().contains(query);
    return matchesCategory && matchesQuery;
  }).toList();
});

// ═══════════════════════════════════════════════════════════════════════════════
/// CheatsheetPage
// ═══════════════════════════════════════════════════════════════════════════════
class CheatsheetPage extends ConsumerStatefulWidget {
  const CheatsheetPage({super.key});

  @override
  ConsumerState<CheatsheetPage> createState() => _CheatsheetPageState();
}

class _CheatsheetPageState extends ConsumerState<CheatsheetPage> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final filtered = ref.watch(_filteredAlgorithmsProvider);
    final selectedCategory = ref.watch(_selectedCategoryProvider);

    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: SafeArea(
        child: Column(
          children: [
            // ── Header ──
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                AppSpacing.lg,
                AppSpacing.lg,
                0,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Cheatsheet', style: AppTypography.h1),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    'Quick reference for all algorithms',
                    style: AppTypography.caption,
                  ),
                  const SizedBox(height: AppSpacing.lg),

                  // ── Search Bar ──
                  TextField(
                    controller: _searchController,
                    onChanged: (value) {
                      ref.read(_searchQueryProvider.notifier).state = value;
                    },
                    decoration: InputDecoration(
                      hintText: 'Search algorithms...',
                      prefixIcon: const Icon(Icons.search,
                          color: AppColors.textMuted, size: 20),
                      suffixIcon: _searchController.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear,
                                  color: AppColors.textMuted, size: 18),
                              onPressed: () {
                                _searchController.clear();
                                ref.read(_searchQueryProvider.notifier).state = '';
                              },
                            )
                          : null,
                      filled: true,
                      fillColor: AppColors.card,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.lg,
                        vertical: AppSpacing.md,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: AppRadius.mdBorder,
                        borderSide: BorderSide.none,
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: AppRadius.mdBorder,
                        borderSide: const BorderSide(color: AppColors.sunken),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: AppRadius.mdBorder,
                        borderSide:
                            const BorderSide(color: AppColors.primary500, width: 1.5),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.lg),

            // ── Category Filters ──
            SizedBox(
              height: 36,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                children: [
                  _CategoryChip(
                    label: 'All',
                    isSelected: selectedCategory == null,
                    onTap: () {
                      ref.read(_selectedCategoryProvider.notifier).state = null;
                    },
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  ...AlgorithmCategory.values.map((cat) => Padding(
                        padding: const EdgeInsets.only(right: AppSpacing.sm),
                        child: _CategoryChip(
                          label: cat.label,
                          isSelected: selectedCategory == cat,
                          color: _categoryColor(cat),
                          onTap: () {
                            ref.read(_selectedCategoryProvider.notifier).state = cat;
                          },
                        ),
                      )),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.md),

            // ── Results count ──
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
              child: Row(
                children: [
                  Text(
                    '${filtered.length} algorithm${filtered.length != 1 ? 's' : ''}',
                    style: AppTypography.overline,
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.md),

            // ── Algorithm List ──
            Expanded(
              child: filtered.isEmpty
                  ? _buildEmptyState()
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                      itemCount: filtered.length,
                      itemBuilder: (context, index) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: AppSpacing.md),
                          child: _AlgorithmCard(algorithm: filtered[index]),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: AppColors.sunken,
              borderRadius: AppRadius.lgBorder,
            ),
            alignment: Alignment.center,
            child: const Icon(
              Icons.search_off,
              size: 32,
              color: AppColors.textMuted,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          Text('No algorithms found', style: AppTypography.h3),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Try adjusting your search or filters',
            style: AppTypography.caption,
          ),
        ],
      ),
    );
  }

  Color _categoryColor(AlgorithmCategory category) {
    switch (category) {
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
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Category filter chip
// ═══════════════════════════════════════════════════════════════════════════════
class _CategoryChip extends StatelessWidget {
  const _CategoryChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
    this.color,
  });

  final String label;
  final bool isSelected;
  final VoidCallback onTap;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final chipColor = color ?? AppColors.primary500;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm,
        ),
        decoration: BoxDecoration(
          color: isSelected ? chipColor.withValues(alpha: 0.15) : AppColors.card,
          borderRadius: AppRadius.smBorder,
          border: Border.all(
            color: isSelected ? chipColor : AppColors.sunken,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color: isSelected ? chipColor : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Algorithm reference card
// ═══════════════════════════════════════════════════════════════════════════════
class _AlgorithmCard extends StatelessWidget {
  const _AlgorithmCard({required this.algorithm});

  final AlgorithmInfo algorithm;

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

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: AppRadius.lgBorder,
        boxShadow: AppShadows.sm,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Category accent bar ──
          Container(
            height: 4,
            decoration: BoxDecoration(
              color: _categoryColor,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(14),
                topRight: Radius.circular(14),
              ),
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Header row ──
                Row(
                  children: [
                    // Category chip
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.sm,
                        vertical: AppSpacing.xs,
                      ),
                      decoration: BoxDecoration(
                        color: _categoryColor.withValues(alpha: 0.12),
                        borderRadius: AppRadius.smBorder,
                      ),
                      child: Text(
                        algorithm.category.label,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: _categoryColor,
                        ),
                      ),
                    ),
                    const Spacer(),
                    // Difficulty badge
                    _DifficultyBadge(difficulty: algorithm.difficulty),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),

                // ── Name ──
                Text(algorithm.name, style: AppTypography.h3),
                const SizedBox(height: AppSpacing.sm),

                // ── Description ──
                Text(
                  algorithm.description,
                  style: AppTypography.caption.copyWith(height: 1.5),
                ),
                const SizedBox(height: AppSpacing.lg),

                // ── Complexity info ──
                Container(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: AppColors.sunken,
                    borderRadius: AppRadius.mdBorder,
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: _ComplexityItem(
                          label: 'Time',
                          value: algorithm.timeComplexity,
                          color: _complexityColor(algorithm.timeComplexity),
                        ),
                      ),
                      Container(
                        width: 1,
                        height: 32,
                        color: AppColors.textMuted.withValues(alpha: 0.2),
                      ),
                      Expanded(
                        child: _ComplexityItem(
                          label: 'Space',
                          value: algorithm.spaceComplexity,
                          color: _complexityColor(algorithm.spaceComplexity),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Color _complexityColor(String complexity) {
    if (complexity.contains('O(1)')) return AppColors.success600;
    if (complexity.contains('log') || complexity.contains('n log')) {
      return AppColors.solarLime;
    }
    if (complexity.contains('n²') || complexity.contains('n^2')) {
      return AppColors.error600;
    }
    return AppColors.textPrimary;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Difficulty badge
// ═══════════════════════════════════════════════════════════════════════════════
class _DifficultyBadge extends StatelessWidget {
  const _DifficultyBadge({required this.difficulty});

  final AlgorithmDifficulty difficulty;

  @override
  Widget build(BuildContext context) {
    Color color;
    String label;

    switch (difficulty) {
      case AlgorithmDifficulty.easy:
        color = AppColors.success600;
        label = 'Easy';
        break;
      case AlgorithmDifficulty.medium:
        color = AppColors.solarGold;
        label = 'Medium';
        break;
      case AlgorithmDifficulty.hard:
        color = AppColors.error600;
        label = 'Hard';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: AppRadius.smBorder,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            difficulty == AlgorithmDifficulty.easy
                ? Icons.sentiment_satisfied
                : difficulty == AlgorithmDifficulty.medium
                    ? Icons.sentiment_neutral
                    : Icons.sentiment_dissatisfied,
            size: 12,
            color: color,
          ),
          const SizedBox(width: 3),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Complexity item row (label + big value)
// ═══════════════════════════════════════════════════════════════════════════════
class _ComplexityItem extends StatelessWidget {
  const _ComplexityItem({
    required this.label,
    required this.value,
    required this.color,
  });

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(label, style: AppTypography.overline),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w800,
            color: color,
            fontFamily: 'monospace',
          ),
        ),
      ],
    );
  }
}
