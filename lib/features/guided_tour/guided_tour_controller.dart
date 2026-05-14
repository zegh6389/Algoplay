import 'dart:async';

import 'package:algoplay/core/theme/app_theme.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:tutorial_coach_mark/tutorial_coach_mark.dart';

import 'algoplay_tour_keys.dart';

class GuidedTourController {
  static const String guidedTourSeenKey = 'algoplay_guided_tour_seen_v1';

  Future<void> showTour(BuildContext context) async {
    final prefs = await SharedPreferences.getInstance();
    final seen = prefs.getBool(guidedTourSeenKey) ?? false;

    if (seen || !context.mounted) return;
    if (!_allTargetKeysReady()) return;

    final tutorialCoachMark = TutorialCoachMark(
      targets: _createTargets(),
      colorShadow: const Color(0xFF0F172A),
      opacityShadow: 0.72,
      paddingFocus: 8,
      textSkip: 'Skip Tour',
      textStyleSkip: AppTypography.caption.copyWith(
        color: AppColors.canvas,
        fontWeight: FontWeight.w700,
      ),
      showSkipInLastTarget: false,
      focusAnimationDuration: const Duration(milliseconds: 360),
      unFocusAnimationDuration: const Duration(milliseconds: 240),
      pulseAnimationDuration: const Duration(milliseconds: 900),
      backgroundSemanticLabel: 'AlgoPlay guided tour overlay',
      onFinish: () {
        unawaited(prefs.setBool(guidedTourSeenKey, true));
      },
      onSkip: () {
        unawaited(prefs.setBool(guidedTourSeenKey, true));
        return true;
      },
    );
    tutorialCoachMark.show(context: context);
  }

  static Future<void> resetTour() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(guidedTourSeenKey);
  }

  bool _allTargetKeysReady() {
    return [
      AlgoPlayTourKeys.lessonsTabKey,
      AlgoPlayTourKeys.exploreTabKey,
      AlgoPlayTourKeys.playTabKey,
      AlgoPlayTourKeys.statsTabKey,
      AlgoPlayTourKeys.profileTabKey,
    ].every((key) => key.currentContext != null);
  }

  List<TargetFocus> _createTargets() {
    return [
      _target(
        id: 'lessons_tab',
        key: AlgoPlayTourKeys.lessonsTabKey,
        step: 1,
        title: 'Lessons',
        body: 'Start with guided modules and continue from where you left off.',
      ),
      _target(
        id: 'explore_tab',
        key: AlgoPlayTourKeys.exploreTabKey,
        step: 2,
        title: 'Explore Algorithms',
        body:
            'Browse topics, open visualizers, and learn how each algorithm works.',
      ),
      _target(
        id: 'play_tab',
        key: AlgoPlayTourKeys.playTabKey,
        step: 3,
        title: 'Practice Through Play',
        body: 'Use games and challenges to turn practice into quick wins.',
      ),
      _target(
        id: 'stats_tab',
        key: AlgoPlayTourKeys.statsTabKey,
        step: 4,
        title: 'Track Growth',
        body:
            'Check XP, streaks, completed topics, and your learning momentum.',
      ),
      _target(
        id: 'profile_tab',
        key: AlgoPlayTourKeys.profileTabKey,
        step: 5,
        title: 'Your Profile',
        body: 'Review achievements, account details, and premium access.',
        isLast: true,
      ),
    ];
  }

  TargetFocus _target({
    required String id,
    required GlobalKey key,
    required int step,
    required String title,
    required String body,
    bool isLast = false,
  }) {
    return TargetFocus(
      identify: id,
      keyTarget: key,
      shape: ShapeLightFocus.RRect,
      radius: 16,
      paddingFocus: 6,
      borderSide: const BorderSide(color: AppColors.solarGold, width: 2),
      contents: [
        TargetContent(
          align: ContentAlign.top,
          builder: (context, controller) {
            return _TourInfoCard(
              step: step,
              totalSteps: 5,
              title: title,
              body: body,
              isLast: isLast,
              onNext: controller.next,
              onSkip: controller.skip,
            );
          },
        ),
      ],
    );
  }
}

class _TourInfoCard extends StatelessWidget {
  const _TourInfoCard({
    required this.step,
    required this.totalSteps,
    required this.title,
    required this.body,
    required this.isLast,
    required this.onNext,
    required this.onSkip,
  });

  final int step;
  final int totalSteps;
  final String title;
  final String body;
  final bool isLast;
  final VoidCallback onNext;
  final VoidCallback onSkip;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      child: Material(
        color: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.all(AppSpacing.lg),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: AppRadius.xlBorder,
            border: Border.all(color: AppColors.primary100),
            boxShadow: AppShadows.lg,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.sm,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.primary100,
                      borderRadius: AppRadius.smBorder,
                    ),
                    child: Text(
                      'Step $step of $totalSteps',
                      style: AppTypography.caption.copyWith(
                        color: AppColors.primary700,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  const Spacer(),
                  TextButton(onPressed: onSkip, child: const Text('Skip')),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              Text(title, style: AppTypography.h2),
              const SizedBox(height: AppSpacing.sm),
              Text(
                body,
                style: AppTypography.body.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              Row(
                children: [
                  ...List.generate(
                    totalSteps,
                    (index) => Container(
                      width: index + 1 == step ? 22 : 8,
                      height: 8,
                      margin: const EdgeInsets.only(right: 6),
                      decoration: BoxDecoration(
                        color: index + 1 == step
                            ? AppColors.primary500
                            : AppColors.sunken,
                        borderRadius: BorderRadius.circular(999),
                      ),
                    ),
                  ),
                  const Spacer(),
                  ElevatedButton(
                    onPressed: onNext,
                    child: Text(isLast ? 'Finish' : 'Next'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
