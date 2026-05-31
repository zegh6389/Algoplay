import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  group('release readiness contract', () {
    test(
      'Android release manifest declares production permissions and backup policy',
      () {
        final manifest = File(
          'android/app/src/main/AndroidManifest.xml',
        ).readAsStringSync();

        expect(manifest, contains('android.permission.INTERNET'));
        expect(manifest, contains('android.permission.ACCESS_NETWORK_STATE'));
        expect(manifest, contains('com.google.android.gms.permission.AD_ID'));
        expect(manifest, contains('com.android.vending.BILLING'));
        expect(manifest, contains('android:allowBackup="false"'));
        expect(manifest, contains('android:usesCleartextTraffic="false"'));
        expect(manifest, contains('ca-app-pub-8157621642469961~5307364275'));
        expect(manifest, isNot(contains('com.example')));
      },
    );

    test('profile exposes ad privacy choices entry point', () {
      final profile = File(
        'lib/features/profile/presentation/profile_page.dart',
      ).readAsStringSync();
      final adService = File(
        'lib/core/services/ad_service.dart',
      ).readAsStringSync();

      expect(profile, contains('Ad Privacy Choices'));
      expect(profile, contains('AdService.instance.showPrivacyOptionsForm()'));
      expect(adService, contains('ConsentForm.showPrivacyOptionsForm'));
    });

    test('Android release version stays in sync with pubspec version', () {
      final pubspec = File('pubspec.yaml').readAsStringSync();
      final buildGradle = File('android/app/build.gradle.kts').readAsStringSync();

      final versionMatch = RegExp(
        r'^version:\s*([^+\s]+)\+(\d+)\s*$',
        multiLine: true,
      ).firstMatch(pubspec);

      expect(versionMatch, isNotNull);
      final versionName = versionMatch!.group(1)!;
      final versionCode = versionMatch.group(2)!;

      expect(buildGradle, contains('versionName = "$versionName"'));
      expect(buildGradle, contains('versionCode = $versionCode'));
    });

    test('AdMob SDK initializes immediately without blocking on consent', () {
      final adService = File(
        'lib/core/services/ad_service.dart',
      ).readAsStringSync();

      // SDK init is direct — no consent gate.
      expect(adService, contains('await MobileAds.instance.initialize()'));
      expect(adService, contains('MobileAds initialized'));
      // Consent runs fire-and-forget in background.
      expect(adService, contains('_requestConsentInBackground'));
      expect(adService, contains('requestConsentInfoUpdate'));
      // Must NOT gate SDK init on consent result.
      expect(adService, isNot(contains('MobileAds skipped — consent not ready')));
      // Deferred loading — ad methods await init completer instead of failing.
      expect(adService, contains('Future<void> get ready'));
      expect(adService, contains('await _initCompleter.future'));
      expect(adService, contains('_initCompleter.future.then'));
      // No silent null returns on !initialized.
      expect(
        adService,
        isNot(contains('banner skipped — MobileAds not initialized')),
      );
    });

    test('main.dart does not block app startup on AdService or IAP', () {
      final mainFile = File('lib/main.dart').readAsStringSync();

      // PremiumService is awaited first (AdService checks isPremium).
      expect(mainFile, contains('await PremiumService.instance.initialize()'));
      // AdService and IAP fire concurrently without await.
      expect(mainFile, contains('Future.wait<dynamic>('));
      expect(mainFile, contains('AdService.instance.init()'));
      expect(mainFile, contains('IAPService.instance.initialize()'));
      // No sequential await on ads/iap that blocks runApp.
      expect(mainFile, isNot(contains('await AdService.instance.init()')));
      expect(mainFile, isNot(contains('await IAPService.instance.initialize()')));
    });
  });
}
