import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  group('lesson ad integration contract', () {
    test('lesson detail and module reader use inline lesson ads', () {
      final lessonDetail = File(
        'lib/features/learn/presentation/lesson_detail_page.dart',
      ).readAsStringSync();
      final moduleContent = File(
        'lib/features/learn/presentation/module_content_page.dart',
      ).readAsStringSync();

      expect(lessonDetail, contains("shared/widgets/inline_banner_ad.dart"));
      expect(lessonDetail, contains('const InlineBannerAd('));

      expect(moduleContent, contains("shared/widgets/inline_banner_ad.dart"));
      expect(
        moduleContent,
        contains('static const int _inlineAdAfterBlockIndex = 2'),
      );
      expect(moduleContent, contains('_hasInlineLessonAd'));
      expect(moduleContent, contains('return const InlineBannerAd();'));
    });

    test(
      'inline ad insertion preserves content block indices for quiz state',
      () {
        final moduleContent = File(
          'lib/features/learn/presentation/module_content_page.dart',
        ).readAsStringSync();

        expect(
          moduleContent,
          contains('int _contentIndexForListIndex(int listIndex)'),
        );
        expect(
          moduleContent,
          contains('final contentIndex = _contentIndexForListIndex(index);'),
        );
        expect(moduleContent, contains('_module.contentBlocks[contentIndex]'));
        expect(moduleContent, contains('contentIndex,'));
        expect(
          moduleContent,
          isNot(contains('_buildBlock(_module.contentBlocks[index], index)')),
        );
      },
    );

    test('lesson ads avoid bottom CTA accidental-click placement', () {
      final moduleContent = File(
        'lib/features/learn/presentation/module_content_page.dart',
      ).readAsStringSync();
      final router = File('lib/core/router/app_router.dart').readAsStringSync();

      expect(moduleContent, contains('SafeArea'));
      expect(moduleContent, contains('Mark Complete & Continue'));
      expect(moduleContent, isNot(contains('BannerAdWrapper(')));
      expect(
        router,
        isNot(contains('BannerAdWrapper(child: ModuleContentPage')),
      );
    });

    test('lesson completion uses interstitial transition for every module', () {
      final moduleContent = File(
        'lib/features/learn/presentation/module_content_page.dart',
      ).readAsStringSync();
      final adStrategy = File(
        'lib/core/services/ad_strategy_service.dart',
      ).readAsStringSync();

      // Every module calls showModuleInterstitialIfAllowed
      expect(moduleContent, contains('AdStrategyService.instance'));
      expect(moduleContent, contains('preloadLearningAds'));
      expect(moduleContent, contains('showModuleInterstitialIfAllowed'));
      expect(
        moduleContent,
        contains('after every module completion, including final modules'),
      );

      // No rewarded XP popup on lesson completion
      expect(moduleContent, isNot(contains('_offerLessonRewardIfNeeded')));
      expect(moduleContent, isNot(contains('Lesson Complete!')));
      expect(moduleContent, isNot(contains('bonus XP')));
      expect(moduleContent, isNot(contains('lessonRewardBonusXp')));

      // AdStrategyService: frequency = every module, no cooldown for modules
      expect(adStrategy, contains('moduleInterstitialFrequency = 1'));
      expect(adStrategy, contains('moduleInterstitialCooldown'));
      expect(adStrategy, contains('PremiumService.instance.isPremium'));
    });

    test('locked lesson tap offers rewarded ad unlock path', () {
      final lessonsHome = File(
        'lib/features/learn/presentation/lessons_home_page.dart',
      ).readAsStringSync();
      final homePage = File(
        'lib/features/home/presentation/home_page.dart',
      ).readAsStringSync();
      final repo = File(
        'lib/features/learn/data/lesson_progress_repository.dart',
      ).readAsStringSync();
      final providers = File(
        'lib/features/learn/providers/lesson_providers.dart',
      ).readAsStringSync();

      for (final source in [lessonsHome, homePage]) {
        expect(source, contains('Unlock Lesson'));
        expect(source, contains('Maybe Later'));
        expect(source, contains('Unlock with Ad'));
        expect(source, contains('showLessonRewardAd'));
        expect(source, contains('markLessonAdUnlocked'));
        expect(source, contains('ref.invalidate(lessonUnlockedProvider'));
        expect(source, contains("context.push('/lesson/\${lesson.id}')"));
      }
      expect(repo, contains('isLessonAdUnlocked'));
      expect(repo, contains('markLessonAdUnlocked'));
      expect(repo, contains('PremiumService.instance.isPremium'));
      expect(providers, contains('ref.watch(premiumProvider)'));
    });

    test('ad widgets are premium-aware and test-safe', () {
      final inlineAd = File(
        'lib/shared/widgets/inline_banner_ad.dart',
      ).readAsStringSync();
      final adService = File(
        'lib/core/services/ad_service.dart',
      ).readAsStringSync();
      final adStrategy = File(
        'lib/core/services/ad_strategy_service.dart',
      ).readAsStringSync();
      final bannerWrapper = File(
        'lib/shared/widgets/banner_ad_wrapper.dart',
      ).readAsStringSync();

      expect(inlineAd, contains('ref.watch(adFreeProvider)'));
      expect(inlineAd, contains('AdService.instance.getBannerAd()'));
      expect(adService, contains('banner skipped — MobileAds not initialized'));
      expect(
        adService,
        contains('rewarded load skipped — MobileAds not initialized'),
      );
      expect(
        adService,
        contains('ConsentInformation.instance.requestConsentInfoUpdate'),
      );
      expect(
        adService,
        contains('ConsentForm.loadAndShowConsentFormIfRequired'),
      );
      expect(adService, contains('canRequestAds()'));
      expect(adService, contains('MobileAds skipped — consent not ready'));
      expect(adService, contains('bool get hasCachedInterstitialAd'));
      expect(adService, contains('ca-app-pub-3940256099942544/6300978111'));
      expect(adService, contains('ca-app-pub-3940256099942544/1033173712'));
      expect(adService, contains('ca-app-pub-3940256099942544/5224354917'));
      expect(
        adService,
        contains(
          'bool showInterstitialAd({VoidCallback? onShown, VoidCallback? onDismissed})',
        ),
      );
      expect(adService, contains('onAdShowedFullScreenContent'));
      expect(adStrategy, contains('moduleInterstitialFrequency = 1'));
      expect(
        adStrategy,
        contains('moduleInterstitialCooldown = Duration(minutes: 3)'),
      );
      expect(adStrategy, contains('showInterstitialAd()'));
      expect(bannerWrapper, contains('SafeArea('));
      expect(bannerWrapper, contains('top: false'));
    });
  });
}
