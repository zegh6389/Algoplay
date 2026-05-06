import 'package:algoplay/algorithms/code/code_implementations.dart';
import 'package:algoplay/core/theme/app_theme.dart';
import 'package:algoplay/features/visualizer/presentation/algorithm_visualizer_page.dart';
import 'package:algoplay/features/visualizer/widgets/animated_sort_bar.dart';
import 'package:algoplay/features/visualizer/widgets/code_viewer.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

Widget _wrap(Widget child) {
  return ProviderScope(
    child: MaterialApp(
      theme: AppTheme.light,
      home: child,
    ),
  );
}

void _expectNoFlutterExceptions(WidgetTester tester) {
  final exceptions = <Object>[];
  Object? exception;
  while ((exception = tester.takeException()) != null) {
    exceptions.add(exception!);
  }
  expect(exceptions, isEmpty, reason: exceptions.join('\n'));
}

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  testWidgets('visualizer shows the terminal by default and has no code toggle',
      (tester) async {
    await tester.binding.setSurfaceSize(const Size(430, 932));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await tester.pumpWidget(
      _wrap(const AlgorithmVisualizerPage(algorithmId: 'bubble-sort')),
    );
    await tester.pumpAndSettle();

    expect(find.byType(CodeViewer), findsOneWidget);
    expect(find.byTooltip('Code'), findsNothing);
    expect(find.byIcon(Icons.code), findsNothing);
    _expectNoFlutterExceptions(tester);
  });

  testWidgets('terminal header shows both complexity chips on phone width',
      (tester) async {
    await tester.binding.setSurfaceSize(const Size(430, 280));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    const code = AlgorithmCode(
      python: 'def bubble_sort(arr):\n    return arr',
      java: 'class Solution {}',
      cpp: 'void bubbleSort() {}',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
    );

    await tester.pumpWidget(
      _wrap(const Scaffold(body: SizedBox.expand(child: CodeViewer(code: code)))),
    );
    await tester.pumpAndSettle();

    expect(find.text('Time: O(n²)'), findsOneWidget);
    expect(find.text('Space: O(1)'), findsOneWidget);
    _expectNoFlutterExceptions(tester);
  });

  test('sort bar palette uses visually distinct state colors', () {
    final colors = <String, Color>{
      'default': SortBarStatePalette.colorForState('default'),
      'comparing': SortBarStatePalette.colorForState('comparing'),
      'swapping': SortBarStatePalette.colorForState('swapping'),
      'sorted': SortBarStatePalette.colorForState('sorted'),
      'pivot': SortBarStatePalette.colorForState('pivot'),
      'found': SortBarStatePalette.colorForState('found'),
    };

    expect(colors.values.toSet(), hasLength(colors.length));
    expect(colors['default'], isNot(colors['sorted']));
    expect(colors['swapping'], isNot(colors['comparing']));
    expect(colors['swapping'], isNot(colors['default']));

    for (final entry in colors.entries) {
      final brightness = ThemeData.estimateBrightnessForColor(entry.value);
      expect(
        brightness,
        Brightness.dark,
        reason: '${entry.key} must support white value labels on bars',
      );
    }
  });
}
