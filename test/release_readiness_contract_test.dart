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
  });
}
