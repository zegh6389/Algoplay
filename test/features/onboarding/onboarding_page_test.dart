import 'package:algoplay/core/theme/app_theme.dart';
import 'package:algoplay/features/onboarding/presentation/onboarding_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

GoRouter _testRouter() {
  return GoRouter(
    initialLocation: '/onboarding',
    routes: [
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingPage(),
      ),
      GoRoute(
        path: '/home',
        builder: (context, state) => const Scaffold(body: Text('Home')),
      ),
    ],
  );
}

Future<void> _pumpOnboarding(
  WidgetTester tester, {
  Size size = const Size(390, 844),
}) async {
  SharedPreferences.setMockInitialValues({});
  await tester.binding.setSurfaceSize(size);
  addTearDown(() => tester.binding.setSurfaceSize(null));

  await tester.pumpWidget(
    MaterialApp.router(theme: AppTheme.light, routerConfig: _testRouter()),
  );
  await tester.pump();
}

void main() {
  testWidgets(
    'renders rich solar onboarding artwork instead of the old icon-only design',
    (tester) async {
      await _pumpOnboarding(tester);

      expect(find.text('Welcome to AlgoPlay!'), findsOneWidget);
      expect(find.textContaining('interactive'), findsOneWidget);
      expect(find.text('Skip'), findsOneWidget);
      expect(find.byIcon(Icons.play_arrow_rounded), findsOneWidget);
      expect(find.byType(CustomPaint), findsWidgets);
      expect(find.byType(FittedBox), findsWidgets);
      expect(tester.takeException(), isNull);
    },
  );

  testWidgets(
    'moves through three slides and saves completion on get started',
    (tester) async {
      await _pumpOnboarding(tester);

      await tester.tap(find.byIcon(Icons.arrow_forward_rounded));
      await tester.pumpAndSettle();
      expect(find.text('See Algorithms in Action'), findsOneWidget);

      await tester.tap(find.byIcon(Icons.arrow_forward_rounded));
      await tester.pumpAndSettle();
      expect(find.text('Play to Learn'), findsOneWidget);
      expect(find.text('Get Started'), findsOneWidget);

      await tester.tap(find.text('Get Started'));
      await tester.pumpAndSettle();

      final prefs = await SharedPreferences.getInstance();
      expect(prefs.getBool(OnboardingPage.seenKey), isTrue);
      expect(find.text('Home'), findsOneWidget);
    },
  );

  testWidgets('does not overflow on a compact phone viewport', (tester) async {
    await _pumpOnboarding(tester, size: const Size(320, 640));

    expect(find.text('Welcome to AlgoPlay!'), findsOneWidget);
    expect(find.byType(FittedBox), findsWidgets);
    expect(tester.takeException(), isNull);
  });
}
