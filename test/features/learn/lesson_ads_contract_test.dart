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

    test('ad widgets are premium-aware and test-safe', () {
      final inlineAd = File(
        'lib/shared/widgets/inline_banner_ad.dart',
      ).readAsStringSync();
      final adService = File(
        'lib/core/services/ad_service.dart',
      ).readAsStringSync();
      final bannerWrapper = File(
        'lib/shared/widgets/banner_ad_wrapper.dart',
      ).readAsStringSync();

      expect(inlineAd, contains('ref.watch(adFreeProvider)'));
      expect(inlineAd, contains('AdService.instance.getBannerAd()'));
      expect(adService, contains('banner skipped — MobileAds not initialized'));
      expect(bannerWrapper, contains('SafeArea('));
      expect(bannerWrapper, contains('top: false'));
    });
  });
}
