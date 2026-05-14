import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/lesson_content.dart';
import '../data/lesson_progress_repository.dart';
import '../../../shared/providers/premium_provider.dart';

// ── Repository (no-arg constructor, internally calls SharedPreferences) ────────

final lessonProgressRepoProvider = Provider<LessonProgressRepository>((ref) {
  return LessonProgressRepository();
});

// ── Lesson list ──────────────────────────────────────────────────────────────

final lessonsProvider = Provider<List<LessonContent>>((ref) {
  return lessons;
});

// ── Per-lesson progress (0.0 – 1.0) ─────────────────────────────────────────

final lessonProgressValueProvider = FutureProvider.family<double, int>((
  ref,
  lessonId,
) async {
  final repo = ref.watch(lessonProgressRepoProvider);
  return repo.getLessonProgress(lessonId);
});

// ── Per-lesson unlock status ─────────────────────────────────────────────────

final lessonUnlockedProvider = FutureProvider.family<bool, int>((
  ref,
  lessonId,
) async {
  ref.watch(premiumProvider);
  final repo = ref.watch(lessonProgressRepoProvider);
  return repo.isLessonUnlocked(lessonId);
});

// ── Current (last-viewed) module for a lesson ────────────────────────────────

final currentModuleProvider = FutureProvider.family<String?, int>((
  ref,
  lessonId,
) async {
  final repo = ref.watch(lessonProgressRepoProvider);
  return repo.getCurrentModule(lessonId);
});

// ── Module completion status ─────────────────────────────────────────────────

final moduleCompleteProvider =
    FutureProvider.family<bool, ({int lessonId, String moduleId})>((
      ref,
      args,
    ) async {
      final repo = ref.watch(lessonProgressRepoProvider);
      return repo.getModuleCompletion(args.lessonId, args.moduleId);
    });
