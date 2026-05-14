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

    test('lesson completion uses frequency-capped interstitial transition', () {
      final moduleContent = File(
        'lib/features/learn/presentation/module_content_page.dart',
      ).readAsStringSync();
      final adStrategy = File(
        'lib/core/services/ad_strategy_service.dart',
      ).readAsStringSync();

      // New strategy service replaces the old gate
      expect(adStrategy, contains('showModuleInterstitialIfAllowed'));
      expect(adStrategy, contains('moduleInterstitialCooldown'));
      expect(adStrategy, contains('shouldShowModuleInterstitial'));

      // ModuleContentPage uses strategy service
      expect(moduleContent, contains('AdStrategyService.instance'));
      expect(moduleContent, contains('preloadLearningAds'));

      // Interstitial still gated per-module
      expect(moduleContent, contains('showModuleInterstitialIfAllowed'));

      // Last module offers rewarded XP bonus
      expect(moduleContent, contains('_offerLessonRewardIfNeeded'));
      expect(moduleContent, contains('showLessonRewardAd'));
      expect(moduleContent, contains('lessonRewardBonusXp'));

      // Premium bypass on strategy
      expect(adStrategy, contains('PremiumService.instance.isPremium'));
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
      expect(adStrategy, contains('onShown: ()'));
      expect(bannerWrapper, contains('SafeArea('));
      expect(bannerWrapper, contains('top: false'));
    });
  });
}
