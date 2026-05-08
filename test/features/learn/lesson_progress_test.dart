import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:algoplay/features/learn/data/lesson_progress_repository.dart';
import 'package:algoplay/features/learn/data/lesson_content.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late LessonProgressRepository repo;

  setUp(() {
    SharedPreferences.setMockInitialValues({});
    repo = LessonProgressRepository();
  });

  group('unlock logic', () {
    test('Lesson 1 is always unlocked', () async {
      expect(await repo.isLessonUnlocked(1), isTrue);
    });

    test('Lesson 2 is locked by default', () async {
      expect(await repo.isLessonUnlocked(2), isFalse);
    });

    test('completing all modules of lesson 1 unlocks lesson 2', () async {
      final lesson1 = lessons.firstWhere((l) => l.id == 1);
      for (final module in lesson1.modules) {
        await repo.markModuleComplete(1, module.id);
      }
      expect(await repo.isLessonUnlocked(2), isTrue);
    });

    test('partially completing lesson 1 does not unlock lesson 2', () async {
      final lesson1 = lessons.firstWhere((l) => l.id == 1);
      // Only complete first module
      await repo.markModuleComplete(1, lesson1.modules.first.id);
      expect(await repo.isLessonUnlocked(2), isFalse);
    });
  });

  group('lesson progress', () {
    test('progress is 0.0 for unstarted lesson', () async {
      expect(await repo.getLessonProgress(1), 0.0);
    });

    test('progress updates correctly as modules complete', () async {
      final lesson1 = lessons.firstWhere((l) => l.id == 1);
      final totalModules = lesson1.modules.length;

      // Complete first module
      await repo.markModuleComplete(1, lesson1.modules[0].id);
      final progress1 = await repo.getLessonProgress(1);
      expect(progress1, 1 / totalModules);

      // Complete remaining modules
      for (final module in lesson1.modules.skip(1)) {
        await repo.markModuleComplete(1, module.id);
      }
      final progress2 = await repo.getLessonProgress(1);
      expect(progress2, 1.0);
    });

    test('progress is 0.0 for stub lesson with no modules', () async {
      // Lesson 2 has no modules (stub)
      expect(await repo.getLessonProgress(2), 0.0);
    });
  });

  group('module completion', () {
    test('module is not complete by default', () async {
      expect(await repo.getModuleCompletion(1, 'lesson1_module1'), isFalse);
    });

    test('marking module complete persists', () async {
      await repo.markModuleComplete(1, 'lesson1_module1');
      expect(await repo.getModuleCompletion(1, 'lesson1_module1'), isTrue);
    });

    test('different modules are tracked independently', () async {
      await repo.markModuleComplete(1, 'lesson1_module1');
      expect(await repo.getModuleCompletion(1, 'lesson1_module1'), isTrue);
      expect(await repo.getModuleCompletion(1, 'lesson1_module2'), isFalse);
    });
  });

  group('scroll position', () {
    test('scroll position is 0.0 by default', () async {
      expect(await repo.getScrollPosition(1), 0.0);
    });

    test('scroll position saves and restores', () async {
      await repo.setScrollPosition(1, 342.5);
      expect(await repo.getScrollPosition(1), 342.5);
    });

    test('scroll positions are independent per lesson', () async {
      await repo.setScrollPosition(1, 100.0);
      await repo.setScrollPosition(2, 200.0);
      expect(await repo.getScrollPosition(1), 100.0);
      expect(await repo.getScrollPosition(2), 200.0);
    });
  });

  group('current module', () {
    test('current module is null by default', () async {
      expect(await repo.getCurrentModule(1), isNull);
    });

    test('current module saves and restores', () async {
      await repo.setCurrentModule(1, 'lesson1_module2');
      expect(await repo.getCurrentModule(1), 'lesson1_module2');
    });

    test('current modules are independent per lesson', () async {
      await repo.setCurrentModule(1, 'lesson1_module1');
      await repo.setCurrentModule(2, 'lesson2_module1');
      expect(await repo.getCurrentModule(1), 'lesson1_module1');
      expect(await repo.getCurrentModule(2), 'lesson2_module1');
    });
  });
}
