// ═══════════════════════════════════════════════════════════════════════════════
/// SharedPreferences-backed repository for lesson & module progress tracking.
// ═══════════════════════════════════════════════════════════════════════════════

import 'package:shared_preferences/shared_preferences.dart';

import 'lesson_content.dart';

class LessonProgressRepository {
  // ── Key helpers ────────────────────────────────────────────────────────────

  static const _prefix = 'algoplay_lesson_';

  /// Key for a boolean flag indicating module completion.
  String _moduleKey(int lessonId, String moduleId) =>
      '${_prefix}${lessonId}_module_$moduleId';

  /// Key for the last-viewed module in a lesson.
  String _currentModuleKey(int lessonId) =>
      '${_prefix}${lessonId}_current_module';

  /// Key for saved scroll position of a lesson.
  String _scrollKey(int lessonId) => '${_prefix}${lessonId}_scroll';

  // ── Module completion ──────────────────────────────────────────────────────

  /// Returns `true` when [moduleId] within [lessonId] has been marked complete.
  Future<bool> getModuleCompletion(int lessonId, String moduleId) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_moduleKey(lessonId, moduleId)) ?? false;
  }

  /// Mark [moduleId] within [lessonId] as completed.
  Future<void> markModuleComplete(int lessonId, String moduleId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_moduleKey(lessonId, moduleId), true);
  }

  // ── Lesson-level progress ──────────────────────────────────────────────────

  /// Returns the progress fraction (0.0–1.0) for [lessonId], based on how many
  /// of its modules have been completed.
  Future<double> getLessonProgress(int lessonId) async {
    final lesson = lessons.firstWhere(
      (l) => l.id == lessonId,
      orElse: () => throw StateError('Lesson $lessonId not found'),
    );

    if (lesson.modules.isEmpty) return 0.0;

    int completed = 0;
    for (final module in lesson.modules) {
      if (await getModuleCompletion(lessonId, module.id)) {
        completed++;
      }
    }
    return completed / lesson.modules.length;
  }

  // ── Unlock logic ───────────────────────────────────────────────────────────

  /// Lesson 1 is always unlocked.
  /// Lesson N (N > 1) is unlocked only when ALL modules of Lesson N-1
  /// have been completed.
  Future<bool> isLessonUnlocked(int lessonId) async {
    if (lessonId <= 1) return true;

    // Check if all modules of the previous lesson are complete.
    final previousLesson = lessons.firstWhere(
      (l) => l.id == lessonId - 1,
      orElse: () => throw StateError('Lesson ${lessonId - 1} not found'),
    );

    if (previousLesson.modules.isEmpty) return false;

    for (final module in previousLesson.modules) {
      if (!await getModuleCompletion(previousLesson.id, module.id)) {
        return false;
      }
    }
    return true;
  }

  // ── Current module tracking ────────────────────────────────────────────────

  /// Returns the last-viewed module ID for [lessonId], or `null`.
  Future<String?> getCurrentModule(int lessonId) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_currentModuleKey(lessonId));
  }

  /// Persists the last-viewed module ID for [lessonId].
  Future<void> setCurrentModule(int lessonId, String moduleId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_currentModuleKey(lessonId), moduleId);
  }

  // ── Scroll position ────────────────────────────────────────────────────────

  /// Returns the saved scroll position (in pixels) for [lessonId].
  Future<double> getScrollPosition(int lessonId) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getDouble(_scrollKey(lessonId)) ?? 0.0;
  }

  /// Saves the scroll position (in pixels) for [lessonId].
  Future<void> setScrollPosition(int lessonId, double position) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setDouble(_scrollKey(lessonId), position);
  }
}
