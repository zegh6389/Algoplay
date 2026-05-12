import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

/// Data model for a single bar in the sorting visualizer.
class SortBarData {
  final int value;
  final String state;

  const SortBarData({required this.value, this.state = 'default'});

  SortBarData copyWith({int? value, String? state}) {
    return SortBarData(
      value: value ?? this.value,
      state: state ?? this.state,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is SortBarData && value == other.value && state == other.state;

  @override
  int get hashCode => Object.hash(value, state);
}

/// Public state palette for sorting bars.
class SortBarStatePalette {
  SortBarStatePalette._();

  static const Color defaultColor = Color(0xFF2563EB); // vivid blue
  static const Color comparingColor = Color(0xFFD97706); // amber/orange
  static const Color swappingColor = Color(0xFFE11D48); // rose/magenta
  static const Color sortedColor = Color(0xFF059669); // emerald green
  static const Color pivotColor = Color(0xFF7C3AED); // violet
  static const Color foundColor = Color(0xFF047857); // deep green
  static const Color eliminatedColor = Color(0x59999999); // gray 35%

  static bool shouldShowValueLabel(double barWidth, double barHeight) {
    return barWidth >= 14;
  }

  static double valueLabelFontSize(double barWidth) {
    if (barWidth >= 26) return 14;
    if (barWidth >= 20) return 12;
    return 10;
  }

  static SortBarLabelPlacement labelPlacementForHeight(double barHeight) {
    return barHeight >= 34 ? SortBarLabelPlacement.inside : SortBarLabelPlacement.above;
  }

  static Color colorForState(String state) {
    switch (state) {
      case 'comparing':
        return comparingColor;
      case 'swapping':
        return swappingColor;
      case 'sorted':
        return sortedColor;
      case 'pivot':
        return pivotColor;
      case 'found':
        return foundColor;
      case 'eliminated':
        return eliminatedColor;
      default:
        return defaultColor;
    }
  }

  static double blurForState(String state) {
    switch (state) {
      case 'comparing':
      case 'swapping':
        return 12.0;
      case 'sorted':
      case 'pivot':
        return 10.0;
      case 'found':
        return 11.0;
      default:
        return 8.0;
    }
  }
}

/// Animated sorting bar chart that physically slides bars during swaps.
///
/// Instead of a CustomPaint that just redraws, this uses [AnimatedPositioned]
/// via [Stack] so bars glide horizontally when their index changes (swap),
/// and [AnimatedContainer] for smooth height transitions.
class AnimatedSortBar extends StatelessWidget {
  final List<SortBarData> bars;
  final double maxValue;

  const AnimatedSortBar({
    super.key,
    required this.bars,
    required this.maxValue,
    this.highlightIndex, // kept for API compat, not used in new visual
  });

  final int? highlightIndex;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;
        final height = constraints.maxHeight;

        if (bars.isEmpty || maxValue <= 0 || width <= 0 || height <= 0) {
          return const SizedBox.shrink();
        }

        final count = bars.length;
        final gap = count > 32 ? 1.5 : 3.0;
        const outerPadding = 8.0;
        final availableWidth = width - outerPadding * 2 - (count - 1) * gap;
        final naturalBarWidth = availableWidth / count;
        final maxBarWidth = count > 24 ? 18.0 : 34.0;
        final barWidth = naturalBarWidth.clamp(3.0, maxBarWidth);
        final usedWidth = count * barWidth + (count - 1) * gap;
        final leftPadding = ((width - usedWidth) / 2).clamp(outerPadding, double.infinity);

        final chartHeight = (height * 0.72).clamp(120.0, 340.0);
        final chartTop = ((height - chartHeight) / 2).clamp(0.0, double.infinity);
        final baseline = chartTop + chartHeight;

        return Stack(
          clipBehavior: Clip.none,
          children: [
            for (int i = 0; i < count; i++)
              _AnimatedBar(
                key: ValueKey('bar_${bars[i].value}_$i'),
                index: i,
                barWidth: barWidth,
                gap: gap,
                leftPadding: leftPadding,
                barData: bars[i],
                fraction: maxValue > 0 ? (bars[i].value.toDouble() / maxValue) : 0.0,
                maxBarHeight: chartHeight,
                baseline: baseline,
                chartTop: chartTop,
              ),
          ],
        );
      },
    );
  }
}

class _AnimatedBar extends StatelessWidget {
  final int index;
  final double barWidth;
  final double gap;
  final double leftPadding;
  final SortBarData barData;
  final double fraction;
  final double maxBarHeight;
  final double baseline;
  final double chartTop;

  const _AnimatedBar({
    super.key,
    required this.index,
    required this.barWidth,
    required this.gap,
    required this.leftPadding,
    required this.barData,
    required this.fraction,
    required this.maxBarHeight,
    required this.baseline,
    required this.chartTop,
  });

  @override
  Widget build(BuildContext context) {
    final barHeight = fraction.clamp(0.0, 1.0) * maxBarHeight;
    final left = leftPadding + index * (barWidth + gap);
    final top = baseline - barHeight;
    final color = SortBarStatePalette.colorForState(barData.state);
    final blur = SortBarStatePalette.blurForState(barData.state);

    // Determine animation duration: swap steps get a longer slide
    final isSwapping = barData.state == 'swapping';
    final duration = isSwapping
        ? const Duration(milliseconds: 300)
        : const Duration(milliseconds: 150);

    return AnimatedPositioned(
      duration: duration,
      curve: Curves.easeInOut,
      left: left,
      top: top,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        width: barWidth,
        height: barHeight,
        decoration: BoxDecoration(
          color: color,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(4),
            topRight: Radius.circular(4),
          ),
          boxShadow: [
            BoxShadow(
              color: color.withValues(alpha: 0.45),
              blurRadius: blur,
              spreadRadius: 0,
            ),
          ],
        ),
        child: SortBarStatePalette.shouldShowValueLabel(barWidth, barHeight)
            ? _buildLabel(barHeight, color)
            : null,
      ),
    );
  }

  Widget _buildLabel(double barHeight, Color barColor) {
    final inside = barHeight >= 34;
    final labelColor = inside ? Colors.white : AppColors.textPrimary;
    final fontSize = SortBarStatePalette.valueLabelFontSize(barWidth);

    return Center(
      child: Padding(
        padding: EdgeInsets.only(
          top: inside ? 4 : 0,
          bottom: inside ? 0 : 2,
        ),
        child: Text(
          '${barData.value}',
          style: TextStyle(
            color: labelColor,
            fontSize: fontSize,
            fontWeight: FontWeight.w800,
            height: 1,
          ),
          textAlign: TextAlign.center,
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Backward compat: SortBarLayout still exposed for tests
// ---------------------------------------------------------------------------

class SortBarLayout {
  final double width;
  final double height;
  final int count;
  final double leftPadding;
  final double chartTop;
  final double chartHeight;
  final double barWidth;
  final double barGap;

  const SortBarLayout({
    required this.width,
    required this.height,
    required this.count,
    required this.leftPadding,
    required this.chartTop,
    required this.chartHeight,
    required this.barWidth,
    required this.barGap,
  });

  double get contentWidth => width - (leftPadding * 2);
  double get baseline => chartTop + chartHeight;

  double leftForIndex(int index) => leftPadding + index * (barWidth + barGap);

  static SortBarLayout calculate({
    required double width,
    required double height,
    required int count,
  }) {
    if (count <= 0 || width <= 0 || height <= 0) {
      return const SortBarLayout(
        width: 0, height: 0, count: 0,
        leftPadding: 0, chartTop: 0, chartHeight: 0,
        barWidth: 0, barGap: 0,
      );
    }
    final chartHeight = (height * 0.72).clamp(120.0, 340.0);
    final chartTop = ((height - chartHeight) / 2).clamp(0.0, double.infinity);
    final gap = count > 32 ? 1.5 : 3.0;
    const outerPadding = 8.0;
    final availableWidth = width - outerPadding * 2 - (count - 1) * gap;
    final naturalBarWidth = availableWidth / count;
    final maxBarWidth = count > 24 ? 18.0 : 34.0;
    final barWidth = naturalBarWidth.clamp(3.0, maxBarWidth);
    final usedWidth = count * barWidth + (count - 1) * gap;
    final leftPadding = ((width - usedWidth) / 2).clamp(outerPadding, double.infinity);

    return SortBarLayout(
      width: width, height: height, count: count,
      leftPadding: leftPadding, chartTop: chartTop,
      chartHeight: chartHeight, barWidth: barWidth, barGap: gap,
    );
  }
}

enum SortBarLabelPlacement { inside, above }
