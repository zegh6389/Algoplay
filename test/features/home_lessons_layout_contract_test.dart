import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  group('home + lesson navigation contract', () {
    test('home tab uses the unified HomePage, not lesson-only page', () {
      final router = File('lib/core/router/app_router.dart').readAsStringSync();
      expect(router, contains("show HomePage"));
      expect(router, contains('builder: (context, state) => const HomePage()'));
      expect(
        router,
        isNot(contains('builder: (context, state) => const LessonsHomePage()')),
      );
    });

    test('home page keeps main activity sections with lessons first', () {
      final home = File(
        'lib/features/home/presentation/home_page.dart',
      ).readAsStringSync();
      expect(home, contains('_buildHeader'));
      expect(home, contains('_buildStreakRow'));
      expect(home, contains('_buildLessonsSection'));
      expect(home, contains('_buildSkillCategories'));
      expect(home, contains('_buildQuickGames'));

      final lessons = home.indexOf('_buildLessonsSection(context');
      final explore = home.indexOf('_buildSkillCategories(context');
      final games = home.indexOf('_buildQuickGames(context');
      expect(lessons, greaterThanOrEqualTo(0));
      expect(explore, greaterThan(lessons));
      expect(games, greaterThan(explore));
    });

    test('module visualizer action saves reader state and pushes on stack', () {
      final module = File(
        'lib/features/learn/presentation/module_content_page.dart',
      ).readAsStringSync();
      expect(module, contains('See the Magic'));
      expect(
        module,
        contains('setCurrentModule(widget.lessonId, widget.moduleId)'),
      );
      expect(module, contains('setScrollPosition('));
      expect(module, contains("context.push('/visualizer/"));
      expect(module, isNot(contains("context.go('/visualizer/")));
    });
  });
}
