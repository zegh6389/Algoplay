import 'package:algoplay/features/visualizer/widgets/animated_sort_bar.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('SortBarLayout', () {
    test('keeps chart height readable instead of stretching to full viewport', () {
      final layout = SortBarLayout.calculate(
        width: 360,
        height: 720,
        count: 10,
      );

      expect(layout.chartHeight, lessThanOrEqualTo(360));
      expect(layout.chartTop, greaterThan(0));
      expect(layout.barWidth, greaterThanOrEqualTo(12));
    });

    test('uses available width for normal arrays without collapsing to center', () {
      final layout = SortBarLayout.calculate(
        width: 360,
        height: 320,
        count: 10,
      );

      expect(layout.contentWidth, greaterThan(300));
      expect(layout.leftForIndex(0), lessThan(20));
      expect(layout.leftForIndex(9), greaterThan(300));
    });

    test('caps bar width for dense arrays and keeps cluster centered', () {
      final layout = SortBarLayout.calculate(
        width: 360,
        height: 320,
        count: 50,
      );

      expect(layout.barWidth, lessThanOrEqualTo(18));
      expect(layout.leftPadding, greaterThanOrEqualTo(8));
      expect(layout.leftForIndex(49), lessThanOrEqualTo(352));
    });
  });
}
