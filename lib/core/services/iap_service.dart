import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:in_app_purchase/in_app_purchase.dart';

import 'premium_service.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// IAPService — Handles in-app purchases via the `in_app_purchase` package.
///
/// Supports both Google Play Billing (Android) and StoreKit (iOS) through
/// the unified `InAppPurchase` plugin.
///
/// Product ID: `com.awaiszegham.algoplay.unlock_all`
// ═══════════════════════════════════════════════════════════════════════════════

class IAPService {
  IAPService._();
  static final IAPService instance = IAPService._();

  // ── Constants ────────────────────────────────────────────────────────────

  /// The non-consumable product ID for "Unlock All" premium.
  static const String unlockAllProductId = 'com.awaiszegham.algoplay.unlock_all';

  static const Set<String> _productIds = {unlockAllProductId};

  // ── Dependencies ─────────────────────────────────────────────────────────

  final InAppPurchase _inAppPurchase = InAppPurchase.instance;

  // ── State ────────────────────────────────────────────────────────────────

  StreamSubscription<List<PurchaseDetails>>? _subscription;
  List<ProductDetails> _products = [];
  bool _isInitialized = false;

  /// Available products fetched from the store.
  List<ProductDetails> get products => List.unmodifiable(_products);

  // ── Initialization ───────────────────────────────────────────────────────

  /// Initializes the IAP service:
  /// 1. Verifies store availability
  /// 2. Fetches product details
  /// 3. Listens to the purchase stream
  ///
  /// Call once during app startup.
  Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      // 1. Check store availability
      final available = await _inAppPurchase.isAvailable();
      if (!available) {
        debugPrint('[IAPService] store not available');
        _isInitialized = true;
        return;
      }

      // 2. Fetch product details
      final response = await _inAppPurchase.queryProductDetails(_productIds);
      if (response.notFoundIDs.isNotEmpty) {
        debugPrint('[IAPService] products not found: ${response.notFoundIDs}');
      }
      _products = response.productDetails.toList();
      debugPrint('[IAPService] found ${_products.length} product(s)');

      // 3. Listen to purchase stream
      _subscription = _inAppPurchase.purchaseStream.listen(
        _handlePurchaseUpdates,
        onDone: () {
          debugPrint('[IAPService] purchase stream done');
          _subscription?.cancel();
        },
        onError: (error) {
          debugPrint('[IAPService] purchase stream error: $error');
        },
      );

      _isInitialized = true;
      debugPrint('[IAPService] initialized');
    } catch (e) {
      debugPrint('[IAPService] initialize error: $e');
    }
  }

  // ── Purchase ─────────────────────────────────────────────────────────────

  /// Initiates the "Unlock All" purchase flow.
  ///
  /// The result is handled asynchronously through the purchase stream listener.
  Future<bool> buyUnlockAll() async {
    if (PremiumService.instance.isPremiumUser()) {
      debugPrint('[IAPService] already premium — skipping purchase');
      return false;
    }

    if (_products.isEmpty) {
      debugPrint('[IAPService] no products available — cannot purchase');
      return false;
    }

    final product = _products.firstWhere(
      (p) => p.id == unlockAllProductId,
      orElse: () => _products.first,
    );

    try {
      final purchaseParam = PurchaseParam(productDetails: product);

      // Non-consumable purchase
      final launched = await _inAppPurchase.buyNonConsumable(
        purchaseParam: purchaseParam,
      );
      debugPrint('[IAPService] buyNonConsumable launched: $launched');
      return launched;
    } catch (e) {
      debugPrint('[IAPService] buyUnlockAll error: $e');
      return false;
    }
  }

  // ── Restore ──────────────────────────────────────────────────────────────

  /// Restores previously completed purchases.
  ///
  /// On success, the purchase stream will emit the restored purchase(s) which
  /// triggers [_handlePurchaseUpdates] → [PremiumService.setPremium].
  Future<void> restorePurchases() async {
    try {
      await _inAppPurchase.restorePurchases();
      debugPrint('[IAPService] restorePurchases called');
    } catch (e) {
      debugPrint('[IAPService] restorePurchases error: $e');
    }
  }

  // ── Query ────────────────────────────────────────────────────────────────

  /// Returns `true` if the unlock-all product has been purchased.
  bool isPurchased() => PremiumService.instance.isPremiumUser();

  // ── Purchase stream handler ──────────────────────────────────────────────

  void _handlePurchaseUpdates(List<PurchaseDetails> detailsList) async {
    for (final details in detailsList) {
      debugPrint(
        '[IAPService] purchase update: ${details.purchaseID ?? details.productID} '
        '— status: ${details.status}',
      );

      switch (details.status) {
        case PurchaseStatus.pending:
          _handlePending(details);
          break;

        case PurchaseStatus.purchased:
        case PurchaseStatus.restored:
          final valid = await _verifyPurchase(details);
          if (valid) {
            await _deliverPurchase(details);
          }
          break;

        case PurchaseStatus.error:
          _handleError(details);
          break;

        case PurchaseStatus.canceled:
          debugPrint(
            '[IAPService] purchase cancelled: ${details.purchaseID ?? details.productID}',
          );
          break;
      }

      // Always acknowledge / complete the purchase to avoid repeated prompts
      if (details.pendingCompletePurchase) {
        await _inAppPurchase.completePurchase(details);
      }
    }
  }

  // ── Verification ─────────────────────────────────────────────────────────

  /// Verifies the purchase.  In production, send the receipt to your server
  /// for validation.  For now we trust local receipts.
  Future<bool> _verifyPurchase(PurchaseDetails details) async {
    debugPrint(
      '[IAPService] verifying purchase: ${details.purchaseID ?? details.productID}',
    );

    // TODO: Add server-side receipt validation for production.

    if (details.productID != unlockAllProductId) {
      debugPrint('[IAPService] unknown product: ${details.productID}');
      return false;
    }

    // Store the receipt locally for future server validation
    final receipt = details.verificationData.localVerificationData;
    await PremiumService.instance.setPurchaseReceipt(receipt);

    return true;
  }

  // ── Delivery ─────────────────────────────────────────────────────────────

  /// Grants premium access to the user.
  Future<void> _deliverPurchase(PurchaseDetails details) async {
    debugPrint(
      '[IAPService] delivering purchase: ${details.purchaseID ?? details.productID}',
    );
    await PremiumService.instance.setPremium(true);
  }

  // ── Error / Pending handlers ─────────────────────────────────────────────

  void _handlePending(PurchaseDetails details) {
    debugPrint(
      '[IAPService] purchase pending: ${details.purchaseID ?? details.productID}',
    );
    // On Android, this could mean a pending transaction (e.g. alternative
    // payment methods).  The UI should show a "purchase pending" message.
  }

  void _handleError(PurchaseDetails details) {
    debugPrint(
      '[IAPService] purchase error: ${details.purchaseID ?? details.productID} — '
      '${details.error?.code}: ${details.error?.message}',
    );
  }

  // ── Cleanup ──────────────────────────────────────────────────────────────

  /// Cancel subscriptions and clean up.  Call when shutting down.
  void dispose() {
    _subscription?.cancel();
    _subscription = null;
    _products.clear();
    _isInitialized = false;
    debugPrint('[IAPService] disposed');
  }
}
