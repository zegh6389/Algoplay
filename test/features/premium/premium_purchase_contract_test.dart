import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  group('premium purchase contract', () {
    test(
      'purchase launch does not grant or announce premium before confirmation',
      () {
        final premiumPage = File(
          'lib/features/premium/presentation/premium_page.dart',
        ).readAsStringSync();
        final iapService = File(
          'lib/core/services/iap_service.dart',
        ).readAsStringSync();
        final premiumService = File(
          'lib/core/services/premium_service.dart',
        ).readAsStringSync();
        final appMain = File('lib/main.dart').readAsStringSync();

        final purchaseHandler = premiumPage.substring(
          premiumPage.indexOf('Future<void> _handlePurchase()'),
          premiumPage.indexOf('void _showSuccessDialog()'),
        );

        expect(purchaseHandler, contains('buyUnlockAll()'));
        expect(purchaseHandler, contains('_showInfoSnackBar'));
        expect(purchaseHandler, isNot(contains('_showSuccessDialog')));
        expect(purchaseHandler, isNot(contains('setPremium(true)')));

        expect(premiumPage, contains('ref.listen<bool>(premiumProvider'));
        expect(premiumPage, contains('_showSuccessDialog();'));
        expect(iapService, contains('case PurchaseStatus.purchased:'));
        expect(iapService, contains('case PurchaseStatus.restored:'));
        expect(iapService, contains('await _deliverPurchase(details);'));
        expect(
          iapService,
          contains('await PremiumService.instance.setPremium(true);'),
        );
        expect(
          premiumService,
          contains('ValueListenable<bool> get premiumListenable'),
        );
        expect(appMain, contains('premiumListenable.addListener'));
        expect(appMain, contains('premiumListenable.removeListener'));
      },
    );
  });
}
