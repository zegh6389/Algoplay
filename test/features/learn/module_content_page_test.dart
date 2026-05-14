import 'dart:io';

import 'package:algoplay/core/theme/app_theme.dart';
import 'package:algoplay/features/learn/data/lesson_content.dart';
import 'package:algoplay/features/learn/data/lesson_progress_repository.dart';
import 'package:algoplay/features/learn/presentation/lesson_detail_page.dart';
import 'package:algoplay/features/learn/presentation/module_content_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

Widget _wrap(Widget child) {
  return ProviderScope(
    child: MaterialApp(theme: AppTheme.light, home: child),
  );
}

Widget _wrapRouter(GoRouter router) {
  return ProviderScope(
    child: MaterialApp.router(theme: AppTheme.light, routerConfig: router),
  );
}

GoRouter _lessonRouter({required int lessonId}) {
  return GoRouter(
    initialLocation: '/lesson/$lessonId',
    routes: [
      GoRoute(
        path: '/lesson/:lessonId',
        builder: (context, state) => LessonDetailPage(
          lessonId: int.parse(state.pathParameters['lessonId']!),
        ),
      ),
      GoRoute(
        path: '/lesson/:lessonId/module/:moduleId',
        builder: (context, state) => ModuleContentPage(
          lessonId: int.parse(state.pathParameters['lessonId']!),
          moduleId: state.pathParameters['moduleId']!,
        ),
      ),
    ],
  );
}

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  test('dashed graph painter advances through dash and gap segments', () {
    final source = File(
      'lib/features/learn/presentation/module_content_page.dart',
    ).readAsStringSync();

    expect(source, isNot(contains('dashLen - (drawn %')));
    expect(source, contains('patternLen = dashLen + gapLen'));
    expect(
      source,
      contains('distanceInPattern = (distanceInPattern + step) % patternLen'),
    );
  });

  test(
    'graph formula strip uses real symbols instead of escaped TeX/unicode',
    () {
      final source = File(
        'lib/features/learn/presentation/module_content_page.dart',
      ).readAsStringSync();

      expect(source, contains('f(n) ≤ c·g(n)  for all n ≥ n₀'));
      expect(source, contains('c₂·g(n) ≤ f(n) ≤ c₁·g(n)  for all n ≥ n₀'));
      expect(source, isNot(contains(r'\\le c\\u00b7g')));
      expect(source, isNot(contains(r'n\\u2080')));
    },
  );

  test('code blocks fit long tables by adapting font size', () {
    final source = File(
      'lib/features/learn/presentation/module_content_page.dart',
    ).readAsStringSync();

    expect(source, contains('longestLine'));
    expect(source, contains('fittedFontSize'));
    expect(source, contains('softWrap: false'));
  });

  testWidgets('Lesson 2 Module 4 renders without freezing', (tester) async {
    await tester.binding.setSurfaceSize(const Size(430, 932));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await tester.pumpWidget(
      _wrap(const ModuleContentPage(lessonId: 2, moduleId: 'lesson2_module4')),
    );
    await tester.pump(const Duration(milliseconds: 100));

    expect(find.text('The Formal Framework for Growth'), findsOneWidget);
    expect(find.text('O(g) — Upper Bound'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('Lesson 2 Module 1 table renders on phone width', (tester) async {
    await tester.binding.setSurfaceSize(const Size(360, 800));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await tester.pumpWidget(
      _wrap(const ModuleContentPage(lessonId: 2, moduleId: 'lesson2_module1')),
    );
    await tester.pump(const Duration(milliseconds: 100));

    expect(find.text('Counting Steps Without a Stopwatch'), findsOneWidget);
    expect(find.textContaining('n    | Home PC | Desktop PC'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets(
    'completing the final module updates lesson completion without restart',
    (tester) async {
      final lesson = lessons.firstWhere((l) => l.id == 1);
      final repo = LessonProgressRepository();
      for (final module in lesson.modules.take(lesson.modules.length - 1)) {
        await repo.markModuleComplete(lesson.id, module.id);
      }

      await tester.pumpWidget(_wrapRouter(_lessonRouter(lessonId: lesson.id)));
      await tester.pumpAndSettle();

      expect(
        find.byIcon(Icons.check_rounded),
        findsNWidgets(lesson.modules.length - 1),
      );

      await tester.tap(find.text(lesson.modules.last.title));
      await tester.pumpAndSettle();
      expect(find.text(lesson.modules.last.title), findsOneWidget);

      await tester.tap(find.text('Mark Complete & Continue'));
      await tester.pumpAndSettle();

      // Lesson Complete dialog appears with Skip and Watch Ad options.
      // No old rewarded XP dialog or "No Thanks" button.
      expect(find.text('Lesson Complete!'), findsOneWidget);
      expect(find.text('Skip'), findsOneWidget);
      expect(find.text('Watch Ad'), findsOneWidget);
      expect(find.textContaining('bonus XP'), findsNothing);
      expect(find.text('No Thanks'), findsNothing);

      // Tap Skip — returns to lesson detail page
      await tester.tap(find.text('Skip'));
      await tester.pumpAndSettle();

      expect(find.byType(LessonDetailPage), findsOneWidget);
      expect(
        find.byIcon(Icons.check_rounded),
        findsNWidgets(lesson.modules.length),
      );
    },
  );
}
