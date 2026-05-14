import 'dart:async';

import 'package:algoplay/core/services/feature_tour_service.dart';
import 'package:algoplay/core/theme/app_theme.dart';
import 'package:algoplay/shared/widgets/algoplay_feature_tour.dart';
import 'package:flutter/material.dart';
import 'package:tutorial_coach_mark/tutorial_coach_mark.dart';

import 'algoplay_tour_keys.dart';

class GuidedTourController {
  static const String guidedTourSeenKey = FeatureTourService.mainTourSeenKey;

  Future<bool> showTour(
    BuildContext context, {
    VoidCallback? onTourStarted,
    VoidCallback? onTourEnded,
  }) async {
    final seen = await FeatureTourService.instance.hasSeenMainTour();

    if (seen || !context.mounted) return false;
    if (!_allTargetKeysReady()) return false;

    onTourStarted?.call();

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
        unawaited(FeatureTourService.instance.markMainTourSeen());
        onTourEnded?.call();
      },
      onSkip: () {
        unawaited(FeatureTourService.instance.markMainTourSeen());
        onTourEnded?.call();
        return true;
      },
    );
    tutorialCoachMark.show(context: context);
    return true;
  }

  static Future<void> resetTour() async {
    await FeatureTourService.instance.resetMainTour();
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
        body:
            'Follow guided modules, track progress, and continue learning from where you left off.',
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
        title: 'Play',
        body:
            'Test your skills with Battle Arena, Grid Escape, Race Mode, and sorting challenges.',
      ),
      _target(
        id: 'stats_tab',
        key: AlgoPlayTourKeys.statsTabKey,
        step: 4,
        title: 'Stats',
        body: 'Track your XP, streaks, active days, and category progress.',
      ),
      _target(
        id: 'profile_tab',
        key: AlgoPlayTourKeys.profileTabKey,
        step: 5,
        title: 'Profile',
        body:
            'Update your profile, manage settings, view achievements, and upgrade if you want ad-free learning.',
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
            return AlgoplayFeatureTourCard(
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
