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
    return CustomPaint(
      painter: _SortBarPainter(
        bars: bars,
        maxValue: maxValue,
        highlightIndex: highlightIndex,
      ),
    );
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

  static const Color _defaultColor = Color(0xFF00C4B1); // teal
  static const Color _comparingColor = Color(0xFFE5C07B); // yellow
  static const Color _swappingColor = Color(0xFF56B6C2); // cyan
  static const Color _sortedColor = Color(0xFF98C379); // green
  static const Color _pivotColor = Color(0xFF9B5CFF); // purple
  static const Color _foundColor = Color(0xFFA6E3A1); // lime
  static const Color _eliminatedColor = Color(0x59999999); // gray 35%

  static const Color _trackColor = Color(0x0FFFFFFF); // white 6 %
  static const Color _labelColor = Color(0xFFFFFFFF); // white

  static const double _topRadius = 4.0;
  static const double _barGap = 2.0;
  static const double _sidePadding = 8.0;

  Color _colorForState(String state) {
    switch (state) {
      case 'comparing':
        return _comparingColor;
      case 'swapping':
        return _swappingColor;
      case 'sorted':
        return _sortedColor;
      case 'pivot':
        return _pivotColor;
      case 'found':
        return _foundColor;
      case 'eliminated':
        return _eliminatedColor;
      default:
        return _defaultColor;
    }
  }

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
    final double totalGapWidth = (count - 1) * _barGap;
    final double availableWidth =
        size.width - 2 * _sidePadding - totalGapWidth;
    final double barWidth = availableWidth / count;

    final double maxBarHeight = size.height;

    for (int i = 0; i < count; i++) {
      final SortBarData bar = bars[i];
      final Color color = _colorForState(bar.state);
      final double blurRadius = _blurForState(bar.state);

      final double fraction =
          maxValue > 0 ? (bar.value.toDouble() / maxValue) : 0.0;
      final double barHeight = fraction.clamp(0.0, 1.0) * maxBarHeight;

      final double left = _sidePadding + i * (barWidth + _barGap);
      final double top = maxBarHeight - barHeight;

      final Rect barRect = Rect.fromLTWH(left, top, barWidth, barHeight);

      // Background track ---------------------------------------------------
      final RRect trackRect = RRect.fromRectAndCorners(
        Rect.fromLTWH(left, 0, barWidth, maxBarHeight),
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
          ..maskFilter =
              MaskFilter.blur(BlurStyle.normal, blurRadius * _devicePixelRatio)
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
      if (barWidth > 22 && barHeight > 18) {
        final TextSpan span = TextSpan(
          text: '${bar.value}',
          style: const TextStyle(
            color: _labelColor,
            fontSize: 11,
            fontWeight: FontWeight.w600,
          ),
        );
        final TextPainter tp = TextPainter(
          text: span,
          textDirection: TextDirection.ltr,
        )..layout(maxWidth: barWidth);

        final double labelX = left + (barWidth - tp.width) / 2;
        final double labelY = top + 6; // near the top of the bar

        tp.paint(canvas, Offset(labelX, labelY));
      }
    }
  }

  // Cache a reasonable device-pixel-ratio for the blur calculation.
  static double get _devicePixelRatio {
    // WidgetsBinding may not be available during tests; fall back to 2.5.
    try {
      return WidgetsBinding.instance.platformDispatcher.views.first
              .devicePixelRatio /
          1.0;
    } catch (_) {
      return 2.5;
    }
  }

  @override
  bool shouldRepaint(covariant _SortBarPainter oldDelegate) {
    return oldDelegate.bars != bars ||
        oldDelegate.maxValue != maxValue ||
        oldDelegate.highlightIndex != highlightIndex;
  }
}
