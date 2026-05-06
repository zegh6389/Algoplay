import 'dart:math';

import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// Result returned by [showArrayInputSheet].
// ═══════════════════════════════════════════════════════════════════════════════
class ArrayInputResult {
  final List<int> array;
  final int? target;

  const ArrayInputResult({required this.array, this.target});
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Convenience function — shows the array-input bottom sheet and returns the
/// selected array (or `null` if the user dismissed the sheet).
///
/// Set [showTarget] to `true` for search algorithms that also need a target
/// value. [initialArray] pre-fills the manual input field.
// ═══════════════════════════════════════════════════════════════════════════════
Future<ArrayInputResult?> showArrayInputSheet(
  BuildContext context, {
  bool showTarget = false,
  List<int>? initialArray,
}) {
  return showModalBottomSheet<ArrayInputResult>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => _ArrayInputSheet(
      showTarget: showTarget,
      initialArray: initialArray,
    ),
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Main bottom-sheet widget.
// ═══════════════════════════════════════════════════════════════════════════════
class _ArrayInputSheet extends StatefulWidget {
  final bool showTarget;
  final List<int>? initialArray;

  const _ArrayInputSheet({
    this.showTarget = false,
    this.initialArray,
  });

  @override
  State<_ArrayInputSheet> createState() => _ArrayInputSheetState();
}

class _ArrayInputSheetState extends State<_ArrayInputSheet>
    with TickerProviderStateMixin {
  // ── Tabs ─────────────────────────────────────────────────────────────────
  late final TabController _tabController;

  // ── Manual tab state ─────────────────────────────────────────────────────
  late final TextEditingController _manualController;
  List<int> _manualValues = [];
  bool _isValid = true;
  String? _parseError;

  // ── Random tab state ─────────────────────────────────────────────────────
  double _randomSize = 15;
  List<int> _randomValues = [];

  // ── Target input ─────────────────────────────────────────────────────────
  late final TextEditingController _targetController;

  // ── Shake animation ──────────────────────────────────────────────────────
  late final AnimationController _shakeController;
  late final Animation<double> _shakeAnimation;

  @override
  void initState() {
    super.initState();

    _tabController = TabController(length: 2, vsync: this);
    _manualController = TextEditingController();
    _targetController = TextEditingController();

    // Shake animation: 0 → 1 → 0 in 400 ms
    _shakeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _shakeAnimation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _shakeController, curve: Curves.elasticIn),
    );

    // Pre-fill from initial array if provided
    if (widget.initialArray != null && widget.initialArray!.isNotEmpty) {
      _manualController.text = widget.initialArray!.join(', ');
      _manualValues = List.from(widget.initialArray!);
      _isValid = true;
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    _manualController.dispose();
    _targetController.dispose();
    _shakeController.dispose();
    super.dispose();
  }

  // ── Parsing helpers ──────────────────────────────────────────────────────

  /// Parse a comma-separated string into a list of ints.
  /// Returns `null` when the string is invalid.
  List<int>? _parseInput(String raw) {
    final trimmed = raw.trim();
    if (trimmed.isEmpty) return [];

    // Allow trailing comma while typing
    final cleaned = trimmed.endsWith(',') ? trimmed.substring(0, trimmed.length - 1) : trimmed;

    if (cleaned.isEmpty) return [];

    final parts = cleaned.split(',');
    final result = <int>[];
    for (final part in parts) {
      final t = part.trim();
      if (t.isEmpty) return null; // double comma or trailing space
      final n = int.tryParse(t);
      if (n == null) return null;
      result.add(n);
    }
    return result;
  }

  void _onManualChanged(String value) {
    final parsed = _parseInput(value);
    final wasValid = _isValid;

    setState(() {
      if (parsed != null) {
        _manualValues = parsed;
        _isValid = true;
        _parseError = null;
      } else {
        _isValid = false;
        _parseError = 'Enter valid integers separated by commas';
        // Keep old values for preview, or empty
      }
    });

    // Trigger shake on transition from valid → invalid
    if (!_isValid && wasValid) {
      _shakeController.forward(from: 0);
    }
  }

  void _generateRandom() {
    final size = _randomSize.round();
    final rng = Random();
    setState(() {
      _randomValues = List.generate(size, (_) => rng.nextInt(100) + 1);
    });
  }

  void _apply() {
    final isManual = _tabController.index == 0;
    final array = isManual ? _manualValues : _randomValues;

    if (array.isEmpty) return;

    int? target;
    if (widget.showTarget) {
      target = int.tryParse(_targetController.text.trim());
      if (target == null) return; // target required but missing
    }

    Navigator.of(context).pop(ArrayInputResult(array: array, target: target));
  }

  // ── Build ────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      decoration: const BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
      child: AnimatedBuilder(
        animation: _shakeAnimation,
        builder: (context, child) {
          // Horizontal shake offset: sin curve ±4 px
          final dx = sin(_shakeAnimation.value * pi * 4) * 4;
          return Transform.translate(
            offset: Offset(dx, 0),
            child: child,
          );
        },
        child: Padding(
          padding: EdgeInsets.only(
            left: AppSpacing.lg,
            right: AppSpacing.lg,
            top: AppSpacing.lg,
            bottom: bottomInset + AppSpacing.lg,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildHandle(),
              const SizedBox(height: AppSpacing.lg),
              _buildTabBar(),
              const SizedBox(height: AppSpacing.md),
              Flexible(
                child: SizedBox(
                  height: 190,
                  child: TabBarView(
                    controller: _tabController,
                    children: [
                      _buildManualTab(),
                      _buildRandomTab(),
                    ],
                  ),
                ),
              ),
              if (widget.showTarget) ...[
                const SizedBox(height: AppSpacing.md),
                _buildTargetField(),
              ],
              const SizedBox(height: AppSpacing.lg),
              _buildApplyButton(),
            ],
          ),
        ),
      ),
    );
  }

  // ── Sub-widgets ──────────────────────────────────────────────────────────

  Widget _buildHandle() {
    return Container(
      width: 40,
      height: 4,
      decoration: BoxDecoration(
        color: AppColors.sunken,
        borderRadius: AppRadius.fullBorder,
      ),
    );
  }

  Widget _buildTabBar() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.sunken,
        borderRadius: AppRadius.mdBorder,
      ),
      child: TabBar(
        controller: _tabController,
        indicatorSize: TabBarIndicatorSize.tab,
        indicator: BoxDecoration(
          color: AppColors.card,
          borderRadius: AppRadius.mdBorder,
          boxShadow: AppShadows.sm,
        ),
        dividerColor: Colors.transparent,
        labelColor: AppColors.primary500,
        unselectedLabelColor: AppColors.textSecondary,
        labelStyle: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w400,
        ),
        tabs: const [
          Tab(text: 'Manual'),
          Tab(text: 'Random'),
        ],
      ),
    );
  }

  // ── Manual Tab ───────────────────────────────────────────────────────────

  Widget _buildManualTab() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: _manualController,
          onChanged: _onManualChanged,
          keyboardType: const TextInputType.numberWithOptions(signed: true),
          decoration: InputDecoration(
            hintText: 'e.g. 64, 25, 12, 22, 11',
            hintStyle: const TextStyle(color: AppColors.textMuted),
            labelText: 'Array values',
            errorText: _parseError,
            enabledBorder: OutlineInputBorder(
              borderRadius: AppRadius.mdBorder,
              borderSide: BorderSide(
                color: _manualController.text.isEmpty
                    ? AppColors.sunken
                    : _isValid
                        ? AppColors.success600
                        : AppColors.error600,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: AppRadius.mdBorder,
              borderSide: BorderSide(
                color: _isValid
                    ? AppColors.primary500
                    : AppColors.error600,
                width: 1.5,
              ),
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(
          'Elements: ${_manualValues.length}',
          style: const TextStyle(
            fontSize: 13,
            color: AppColors.textSecondary,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  // ── Random Tab ───────────────────────────────────────────────────────────

  Widget _buildRandomTab() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Array size: ${_randomSize.round()}',
          softWrap: false,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        Slider(
          value: _randomSize,
          min: 5,
          max: 50,
          divisions: 45,
          activeColor: AppColors.primary500,
          inactiveColor: AppColors.primary100,
          label: _randomSize.round().toString(),
          onChanged: (v) => setState(() => _randomSize = v),
        ),
        const SizedBox(height: AppSpacing.sm),
        SizedBox(
          width: double.infinity,
          height: 44,
          child: OutlinedButton.icon(
            onPressed: _generateRandom,
            icon: const Icon(Icons.casino, size: 18),
            label: const Text('Generate Random Array'),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.primary500,
              side: const BorderSide(color: AppColors.primary500, width: 1.5),
              shape: RoundedRectangleBorder(
                borderRadius: AppRadius.mdBorder,
              ),
              textStyle: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(
          'Elements: ${_randomValues.length}',
          style: const TextStyle(
            fontSize: 13,
            color: AppColors.textSecondary,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  // ── Target Field ─────────────────────────────────────────────────────────

  Widget _buildTargetField() {
    return TextField(
      controller: _targetController,
      keyboardType: const TextInputType.numberWithOptions(signed: true),
      decoration: const InputDecoration(
        hintText: 'Target value to search for',
        hintStyle: TextStyle(color: AppColors.textMuted),
        labelText: 'Target',
        prefixIcon: Icon(Icons.track_changes, size: 20),
      ),
    );
  }

  // ── Apply Button ─────────────────────────────────────────────────────────

  Widget _buildApplyButton() {
    final isManual = _tabController.index == 0;
    final values = isManual ? _manualValues : _randomValues;
    final canApply = values.isNotEmpty && _isValid;

    // Also check target if required
    bool targetOk = true;
    if (widget.showTarget) {
      targetOk = int.tryParse(_targetController.text.trim()) != null;
    }

    return SizedBox(
      width: double.infinity,
      height: 48,
      child: ElevatedButton(
        onPressed: (canApply && targetOk) ? _apply : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary500,
          foregroundColor: AppColors.textInverse,
          disabledBackgroundColor: AppColors.primary300,
          disabledForegroundColor: AppColors.textInverse.withValues(alpha: 0.6),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: AppRadius.mdBorder,
          ),
          textStyle: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
          ),
        ),
        child: const Text('Apply'),
      ),
    );
  }
}

