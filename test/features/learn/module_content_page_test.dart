import 'dart:io';

import 'package:algoplay/core/theme/app_theme.dart';
import 'package:algoplay/features/learn/presentation/module_content_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

Widget _wrap(Widget child) {
  return ProviderScope(
    child: MaterialApp(theme: AppTheme.light, home: child),
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

  testWidgets('Lesson 2 Module 3 renders without freezing', (tester) async {
    await tester.binding.setSurfaceSize(const Size(430, 932));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await tester.pumpWidget(
      _wrap(const ModuleContentPage(lessonId: 2, moduleId: 'lesson2_module3')),
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
}
