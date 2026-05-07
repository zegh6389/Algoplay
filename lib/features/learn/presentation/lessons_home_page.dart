import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_theme.dart';
import '../data/lesson_content.dart';
import '../providers/lesson_providers.dart';

/// Home tab — lesson curriculum overview with hero section and lesson cards.
class LessonsHomePage extends ConsumerWidget {
  const LessonsHomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final allLessons = ref.watch(lessonsProvider);

    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.xl,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Hero section ─────────────────────────────────────────────
              _HeroSection(lessons: allLessons),
              const SizedBox(height: AppSpacing.xxl),

              // ── Lesson list header ───────────────────────────────────────
              Text('Curriculum', style: AppTypography.h2),
              const SizedBox(height: AppSpacing.md),
              Text(
                '${allLessons.length} lessons from basics to advanced',
                style: AppTypography.caption,
              ),
              const SizedBox(height: AppSpacing.lg),

              // ── Lesson cards ─────────────────────────────────────────────
              ...allLessons.map(
                (lesson) => _LessonCard(lesson: lesson),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Hero section with greeting, progress ring, XP and streak badges.
// ═══════════════════════════════════════════════════════════════════════════════
class _HeroSection extends ConsumerWidget {
  const _HeroSection({required this.lessons});

  final List<LessonContent> lessons;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Compute overall progress across all lessons with modules.
    final progressAsync = ref.watch(lessonProgressValueProvider(1));

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.xl),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.primary500, AppColors.primary700],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: AppRadius.lgBorder,
      ),
      child: Column(
        children: [
          Text(
            'Ready to learn? 🚀',
            style: AppTypography.h1.copyWith(color: AppColors.textInverse),
          ),
          const SizedBox(height: AppSpacing.xl),

          // Progress ring
          progressAsync.when(
            data: (progress) => _ProgressRing(progress: progress),
            loading: () => const _ProgressRing(progress: 0),
            error: (_, __) => const _ProgressRing(progress: 0),
          ),

          const SizedBox(height: AppSpacing.lg),

          // XP & Streak row
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _Badge(
                icon: Icons.star_rounded,
                label: '0 XP',
                color: AppColors.solarGold,
              ),
              const SizedBox(width: AppSpacing.xl),
              _Badge(
                icon: Icons.local_fire_department_rounded,
                label: '0 streak',
                color: AppColors.secondary500,
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.xl),

          // Continue learning button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: AppColors.primary700,
              ),
              onPressed: () => context.push('/lesson/1'),
              child: const Text('Continue Learning'),
            ),
          ),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Circular progress indicator ring.
// ═══════════════════════════════════════════════════════════════════════════════
class _ProgressRing extends StatelessWidget {
  const _ProgressRing({required this.progress});

  final double progress;

  @override
  Widget build(BuildContext context) {
    final percent = (progress * 100).round();

    return CustomPaint(
      size: const Size(100, 100),
      painter: _RingPainter(
        progress: progress,
        trackColor: Colors.white.withValues(alpha: 0.3),
        fillColor: Colors.white,
        strokeWidth: 8,
      ),
      child: Center(
        child: Text(
          '$percent%',
          style: const TextStyle(
            color: Colors.white,
            fontSize: 22,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}

class _RingPainter extends CustomPainter {
  _RingPainter({
    required this.progress,
    required this.trackColor,
    required this.fillColor,
    required this.strokeWidth,
  });

  final double progress;
  final Color trackColor;
  final Color fillColor;
  final double strokeWidth;

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.shortestSide - strokeWidth) / 2;

    // Track
    canvas.drawCircle(
      center,
      radius,
      Paint()
        ..color = trackColor
        ..style = PaintingStyle.stroke
        ..strokeWidth = strokeWidth,
    );

    // Fill arc
    if (progress > 0) {
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        -math.pi / 2,
        2 * math.pi * progress,
        false,
        Paint()
          ..color = fillColor
          ..style = PaintingStyle.stroke
          ..strokeWidth = strokeWidth
          ..strokeCap = StrokeCap.round,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _RingPainter old) =>
      old.progress != progress;
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Small badge widget (XP / streak).
// ═══════════════════════════════════════════════════════════════════════════════
class _Badge extends StatelessWidget {
  const _Badge({
    required this.icon,
    required this.label,
    required this.color,
  });

  final IconData icon;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: color, size: 20),
        const SizedBox(width: AppSpacing.xs),
        Text(
          label,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w600,
            fontSize: 14,
          ),
        ),
      ],
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Single lesson card in the curriculum list.
// ═══════════════════════════════════════════════════════════════════════════════
class _LessonCard extends ConsumerWidget {
  const _LessonCard({required this.lesson});

  final LessonContent lesson;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final progressAsync = ref.watch(lessonProgressValueProvider(lesson.id));
    final unlockedAsync = ref.watch(lessonUnlockedProvider(lesson.id));

    final progress = progressAsync.valueOrNull ?? 0.0;
    final isUnlocked = unlockedAsync.valueOrNull ?? (lesson.id == 1);

    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: Material(
        color: AppColors.card,
        borderRadius: AppRadius.lgBorder,
        elevation: 1,
        child: InkWell(
          borderRadius: AppRadius.lgBorder,
          onTap: isUnlocked
              ? () => context.push('/lesson/${lesson.id}')
              : null,
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Opacity(
              opacity: isUnlocked ? 1.0 : 0.5,
              child: Row(
                children: [
                  // Lesson number badge
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: isUnlocked
                          ? AppColors.primary100
                          : AppColors.sunken,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      '${lesson.id}',
                      style: AppTypography.h3.copyWith(
                        color: isUnlocked
                            ? AppColors.primary500
                            : AppColors.textMuted,
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),

                  // Title + module count
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          lesson.title,
                          style: AppTypography.h3,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: AppSpacing.xs),
                        Text(
                          '${lesson.modules.length} module${lesson.modules.length == 1 ? '' : 's'}',
                          style: AppTypography.caption,
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(width: AppSpacing.sm),

                  // Progress indicator or lock
                  if (isUnlocked)
                    _MiniProgress(progress: progress)
                  else
                    const Icon(
                      Icons.lock_outline,
                      color: AppColors.textMuted,
                      size: 20,
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Small circular progress indicator for lesson cards.
class _MiniProgress extends StatelessWidget {
  const _MiniProgress({required this.progress});

  final double progress;

  @override
  Widget build(BuildContext context) {
    if (progress >= 1.0) {
      return const Icon(
        Icons.check_circle_rounded,
        color: AppColors.success600,
        size: 24,
      );
    }
    if (progress <= 0) {
      return const Icon(
        Icons.radio_button_unchecked,
        color: AppColors.textMuted,
        size: 24,
      );
    }
    return SizedBox(
      width: 24,
      height: 24,
      child: CircularProgressIndicator(
        value: progress,
        strokeWidth: 3,
        backgroundColor: AppColors.sunken,
        valueColor: const AlwaysStoppedAnimation(AppColors.primary500),
      ),
    );
  }
}
