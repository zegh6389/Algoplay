import 'package:flutter/material.dart';

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

/// Stateless widget that renders an animated sorting bar chart.
///
/// Uses a [CustomPainter] to draw bars whose heights are proportional to
/// their [SortBarData.value] relative to [maxValue]. Each bar is coloured
/// according to its [SortBarData.state] and receives a matching glow shadow.
class AnimatedSortBar extends StatelessWidget {
  /// The list of bar data to visualise.
  final List<SortBarData> bars;

  /// The maximum value used to scale bar heights.
  final double maxValue;

  /// Optional index of a bar to highlight (draws a brighter emphasis).
  final int? highlightIndex;

  const AnimatedSortBar({
    super.key,
    required this.bars,
    required this.maxValue,
    this.highlightIndex,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox.expand(
      child: CustomPaint(
        painter: _SortBarPainter(
          bars: bars,
          maxValue: maxValue,
          highlightIndex: highlightIndex,
        ),
      ),
    );
  }
}

/// Deterministic geometry for the sort bar chart.
///
/// Exposed for tests so layout regressions are caught without brittle golden
/// screenshots.
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
      return SortBarLayout(
        width: width,
        height: height,
        count: count,
        leftPadding: 0,
        chartTop: 0,
        chartHeight: 0,
        barWidth: 0,
        barGap: 0,
      );
    }

    final chartHeight = (height * 0.72).clamp(120.0, 340.0).toDouble();
    final chartTop = ((height - chartHeight) / 2)
        .clamp(0.0, double.infinity)
        .toDouble();
    final gap = count > 32 ? 1.5 : 3.0;
    const outerPadding = 8.0;
    final availableWidth = width - outerPadding * 2 - (count - 1) * gap;
    final naturalBarWidth = availableWidth / count;
    final maxBarWidth = count > 24 ? 18.0 : 34.0;
    final barWidth = naturalBarWidth.clamp(3.0, maxBarWidth).toDouble();
    final usedWidth = count * barWidth + (count - 1) * gap;
    final leftPadding = ((width - usedWidth) / 2)
        .clamp(outerPadding, double.infinity)
        .toDouble();

    return SortBarLayout(
      width: width,
      height: height,
      count: count,
      leftPadding: leftPadding,
      chartTop: chartTop,
      chartHeight: chartHeight,
      barWidth: barWidth,
      barGap: gap,
    );
  }
}

/// Public state palette for sorting bars.
///
/// Kept outside the painter so tests can guard against visually similar colors
/// regressing back into the chart.
class SortBarStatePalette {
  SortBarStatePalette._();

  static const Color defaultColor = Color(0xFF2563EB); // vivid blue
  static const Color comparingColor = Color(0xFFD97706); // amber/orange
  static const Color swappingColor = Color(0xFFE11D48); // rose/magenta
  static const Color sortedColor = Color(0xFF059669); // emerald green
  static const Color pivotColor = Color(0xFF7C3AED); // violet
  static const Color foundColor = Color(0xFF047857); // deep green
  static const Color eliminatedColor = Color(0x59999999); // gray 35%

  /// Labels must remain visible for random arrays (default size 15), where bars
  /// are narrower than the manual 10-item example.
  static bool shouldShowValueLabel(double barWidth, double barHeight) {
    return barWidth >= 14 && barHeight >= 28;
  }

  static double valueLabelFontSize(double barWidth) {
    if (barWidth >= 26) return 14;
    if (barWidth >= 20) return 12;
    return 10;
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
}

// ---------------------------------------------------------------------------
// Private painter
// ---------------------------------------------------------------------------

class _SortBarPainter extends CustomPainter {
  final List<SortBarData> bars;
  final double maxValue;
  final int? highlightIndex;

  _SortBarPainter({
    required this.bars,
    required this.maxValue,
    this.highlightIndex,
  });

  // -- Colour palette -------------------------------------------------------

  static const Color _trackColor = Color(0x0F2563EB); // blue 6%
  static const Color _labelColor = Color(0xFFFFFFFF); // white

  static const double _topRadius = 4.0;

  Color _colorForState(String state) => SortBarStatePalette.colorForState(state);

  double _blurForState(String state) {
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

  // -- Painting -------------------------------------------------------------

  @override
  void paint(Canvas canvas, Size size) {
    if (bars.isEmpty || maxValue <= 0) return;

    final int count = bars.length;
    final layout = SortBarLayout.calculate(
      width: size.width,
      height: size.height,
      count: count,
    );

    final double maxBarHeight = layout.chartHeight;

    for (int i = 0; i < count; i++) {
      final SortBarData bar = bars[i];
      final Color color = _colorForState(bar.state);
      final double blurRadius = _blurForState(bar.state);

      final double fraction =
          maxValue > 0 ? (bar.value.toDouble() / maxValue) : 0.0;
      final double barHeight = fraction.clamp(0.0, 1.0) * maxBarHeight;

      final double left = layout.leftForIndex(i);
      final double top = layout.baseline - barHeight;

      final Rect barRect = Rect.fromLTWH(
        left,
        top,
        layout.barWidth,
        barHeight,
      );

      // Background track ---------------------------------------------------
      final RRect trackRect = RRect.fromRectAndCorners(
        Rect.fromLTWH(left, layout.chartTop, layout.barWidth, maxBarHeight),
        topLeft: const Radius.circular(_topRadius),
        topRight: const Radius.circular(_topRadius),
      );
      canvas.drawRRect(
        trackRect,
        Paint()..color = _trackColor,
      );

      // Glow shadow --------------------------------------------------------
      final RRect barRRect = RRect.fromRectAndCorners(
        barRect,
        topLeft: const Radius.circular(_topRadius),
        topRight: const Radius.circular(_topRadius),
      );

      // Shadow layer
      canvas.drawRRect(
        barRRect,
        Paint()
          ..color = color.withValues(alpha: 0.45)
          ..maskFilter = MaskFilter.blur(BlurStyle.normal, blurRadius)
          ..style = PaintingStyle.fill,
      );

      // Filled bar
      canvas.drawRRect(
        barRRect,
        Paint()..color = color,
      );

      // Highlight emphasis --------------------------------------------------
      if (highlightIndex != null && i == highlightIndex) {
        canvas.drawRRect(
          barRRect.inflate(1.5),
          Paint()
            ..color = Colors.white.withValues(alpha: 0.25)
            ..style = PaintingStyle.stroke
            ..strokeWidth = 2.0,
        );
      }

      // Value label ---------------------------------------------------------
      if (SortBarStatePalette.shouldShowValueLabel(layout.barWidth, barHeight)) {
        final TextSpan span = TextSpan(
          text: '${bar.value}',
          style: TextStyle(
            color: _labelColor,
            fontSize: SortBarStatePalette.valueLabelFontSize(layout.barWidth),
            fontWeight: FontWeight.w700,
          ),
        );
        final TextPainter tp = TextPainter(
          text: span,
          textDirection: TextDirection.ltr,
        )..layout(maxWidth: layout.barWidth);

        final double labelX = left + (layout.barWidth - tp.width) / 2;
        final double labelY = top + 6; // near the top of the bar

        tp.paint(canvas, Offset(labelX, labelY));
      }
    }
  }

  @override
  bool shouldRepaint(covariant _SortBarPainter oldDelegate) {
    return oldDelegate.bars != bars ||
        oldDelegate.maxValue != maxValue ||
        oldDelegate.highlightIndex != highlightIndex;
  }
}
