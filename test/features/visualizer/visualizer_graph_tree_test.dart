import 'package:algoplay/algorithms/models/tree_models.dart';
import 'package:algoplay/core/theme/app_theme.dart';
import 'package:algoplay/features/visualizer/presentation/algorithm_visualizer_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

Widget _wrap(Widget child) {
  return ProviderScope(
    child: MaterialApp(theme: AppTheme.light, home: child),
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

TreeNode _insertTestNode(TreeNode? node, int value, int depth) {
  if (node == null) {
    return TreeNode(id: '${value}_$depth', value: value, depth: depth);
  }
  if (value < node.value) {
    node.left = _insertTestNode(node.left, value, depth + 1);
  } else if (value > node.value) {
    node.right = _insertTestNode(node.right, value, depth + 1);
  }
  return node;
}

TreeNode _buildTestTree(Iterable<int> values) {
  TreeNode? root;
  for (final value in values) {
    root = _insertTestNode(root, value, 0);
  }
  return root!;
}

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  test('tree canvas layout scales large inputs inside the viewport', () {
    const viewport = Size(360, 210);
    final smallTree = _buildTestTree([50, 30, 70]);
    final largeTree = _buildTestTree(List.generate(32, (index) => index + 1));

    final smallLayout = TreeCanvasLayout.fit(smallTree, viewport);
    final largeLayout = TreeCanvasLayout.fit(largeTree, viewport);

    expect(smallLayout.fitsInside(viewport), isTrue);
    expect(largeLayout.fitsInside(viewport), isTrue);
    expect(largeLayout.nodeRadius, lessThan(smallLayout.nodeRadius));
  });

  testWidgets(
    'graph algorithms render a pathfinding grid instead of fallback text',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(430, 932));
      addTearDown(() => tester.binding.setSurfaceSize(null));

      await tester.pumpWidget(
        _wrap(const AlgorithmVisualizerPage(algorithmId: 'bfs')),
      );
      await tester.pumpAndSettle();

      expect(
        find.textContaining('Visualization not yet available'),
        findsNothing,
      );
      expect(find.text('Grid'), findsOneWidget);
      expect(find.textContaining('Visited'), findsWidgets);
      _expectNoFlutterExceptions(tester);
    },
  );

  testWidgets(
    'tree algorithms render nodes and traversal details instead of fallback text',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(430, 932));
      addTearDown(() => tester.binding.setSurfaceSize(null));

      await tester.pumpWidget(
        _wrap(const AlgorithmVisualizerPage(algorithmId: 'bst-operations')),
      );
      await tester.pumpAndSettle();

      expect(
        find.textContaining('Visualization not yet available'),
        findsNothing,
      );
      expect(find.text('Tree'), findsOneWidget);
      expect(find.textContaining('Visited'), findsWidgets);
      _expectNoFlutterExceptions(tester);
    },
  );

  testWidgets('custom input affordance matches algorithm data model', (
    tester,
  ) async {
    await tester.binding.setSurfaceSize(const Size(430, 932));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await tester.pumpWidget(
      _wrap(const AlgorithmVisualizerPage(algorithmId: 'bfs')),
    );
    await tester.pumpAndSettle();
    expect(find.byTooltip('Edit Array'), findsNothing);
    expect(find.byTooltip('Edit Grid'), findsNothing);

    await tester.pumpWidget(
      _wrap(
        AlgorithmVisualizerPage(
          key: UniqueKey(),
          algorithmId: 'bst-operations',
        ),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.byTooltip('Edit Tree Values'), findsOneWidget);
    expect(find.byTooltip('Edit Array'), findsNothing);
  });

  testWidgets(
    'dynamic programming algorithms render DP cells instead of loading forever',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(430, 932));
      addTearDown(() => tester.binding.setSurfaceSize(null));

      await tester.pumpWidget(
        _wrap(const AlgorithmVisualizerPage(algorithmId: 'fibonacci')),
      );
      await tester.pumpAndSettle();

      expect(find.textContaining('Visualization is loading'), findsNothing);
      expect(find.text('DP Table'), findsOneWidget);
      expect(find.textContaining('State'), findsWidgets);
      _expectNoFlutterExceptions(tester);
    },
  );

  testWidgets(
    'greedy algorithms render decision cards instead of loading forever',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(430, 932));
      addTearDown(() => tester.binding.setSurfaceSize(null));

      await tester.pumpWidget(
        _wrap(const AlgorithmVisualizerPage(algorithmId: 'activity-selection')),
      );
      await tester.pumpAndSettle();

      expect(find.textContaining('Visualization is loading'), findsNothing);
      expect(find.text('Greedy Choices'), findsOneWidget);
      expect(find.textContaining('Chosen'), findsWidgets);
      _expectNoFlutterExceptions(tester);
    },
  );
}
