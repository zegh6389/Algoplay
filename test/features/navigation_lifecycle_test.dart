import 'package:algoplay/core/theme/app_theme.dart';
import 'package:algoplay/features/learn/presentation/learn_page.dart';
import 'package:algoplay/features/visualizer/presentation/algorithm_visualizer_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

Widget _wrapWithRouter(GoRouter router) {
  return ProviderScope(
    child: MaterialApp.router(
      theme: AppTheme.light,
      routerConfig: router,
    ),
  );
}

GoRouter _testRouter() {
  return GoRouter(
    initialLocation: '/learn',
    routes: [
      GoRoute(
        path: '/learn',
        builder: (context, state) => const LearnPage(),
      ),
      GoRoute(
        path: '/visualizer/:algorithmId',
        builder: (context, state) => AlgorithmVisualizerPage(
          algorithmId: state.pathParameters['algorithmId']!,
        ),
      ),
    ],
  );
}

bool _isIgnorableOverflow(Object exception) {
  final text = exception.toString();
  return text.contains('RenderFlex overflowed') ||
      text.contains('Multiple exceptions') ||
      text.contains('Looking up a deactivated widget');
}

void _expectNoFatalFlutterExceptions(WidgetTester tester) {
  Object? exception;
  while ((exception = tester.takeException()) != null) {
    if (!_isIgnorableOverflow(exception!)) {
      fail('Unexpected Flutter exception: $exception');
    }
  }
}

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  testWidgets('visualizer pauses playback when app goes to background', (tester) async {
    await tester.binding.setSurfaceSize(const Size(430, 932));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await tester.pumpWidget(
      ProviderScope(
        child: MaterialApp(
          theme: AppTheme.light,
          home: const AlgorithmVisualizerPage(algorithmId: 'bubble-sort'),
        ),
      ),
    );
    await tester.pumpAndSettle();
    _expectNoFatalFlutterExceptions(tester);

    expect(find.byIcon(Icons.play_arrow), findsOneWidget);

    await tester.tap(find.byIcon(Icons.play_arrow));
    await tester.pump();
    expect(find.byIcon(Icons.pause), findsOneWidget);

    tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.paused);
    await tester.pump();

    expect(find.byIcon(Icons.play_arrow), findsOneWidget);
    _expectNoFatalFlutterExceptions(tester);
  });

  testWidgets('algorithm drill-down preserves Learn state after back', (tester) async {
    await tester.binding.setSurfaceSize(const Size(430, 932));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    final router = _testRouter();
    await tester.pumpWidget(_wrapWithRouter(router));
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextField), 'bubble');
    await tester.pumpAndSettle();

    expect(find.text('1 algorithm'), findsOneWidget);
    expect(find.text('Bubble Sort'), findsOneWidget);

    await tester.tap(find.text('Bubble Sort'));
    await tester.pumpAndSettle();

    expect(find.byType(AlgorithmVisualizerPage), findsOneWidget);
    _expectNoFatalFlutterExceptions(tester);

    await tester.tap(find.byIcon(Icons.arrow_back));
    await tester.pumpAndSettle();
    _expectNoFatalFlutterExceptions(tester);

    expect(find.byType(LearnPage), findsOneWidget);
    expect(find.text('1 algorithm'), findsOneWidget);
    expect(find.text('Bubble Sort'), findsOneWidget);
  });
}
