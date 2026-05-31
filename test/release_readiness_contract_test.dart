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

    test('AdMob SDK still initializes when consent is delayed or unavailable', () {
      final adService = File(
        'lib/core/services/ad_service.dart',
      ).readAsStringSync();

      expect(adService, contains('Future.wait<dynamic>'));
      expect(adService, contains('MobileAds.instance.initialize()'));
      expect(adService, contains('MobileAds initialized — canRequestAds'));
      expect(adService, contains('consent request timed out — defaulting to true'));
      expect(adService, isNot(contains('MobileAds skipped — consent not ready')));
    });
  });
}
