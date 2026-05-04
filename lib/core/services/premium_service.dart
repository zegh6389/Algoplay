import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// PremiumService — Manages the user's premium / IAP state.
///
/// Persists the `isPremium` flag and the purchase receipt to
/// [SharedPreferences] so it survives app restarts.
///
/// Usage:
///   await PremiumService.instance.initialize();
///   if (PremiumService.instance.isPremiumUser()) { … }
// ═══════════════════════════════════════════════════════════════════════════════

class PremiumService {
  PremiumService._();
  static final PremiumService instance = PremiumService._();

  // ── SharedPreferences keys ────────────────────────────────────────────────
  static const _kPremiumKey = 'algoplay_is_premium';
  static const _kReceiptKey = 'algoplay_iap_receipt';

  // ── In-memory cache ──────────────────────────────────────────────────────
  bool _isPremium = false;
  String? _purchaseReceipt;
  bool _initialized = false;

  // ── Public getters ───────────────────────────────────────────────────────

  /// Whether the current user has unlocked premium (shorthand getter).
  bool get isPremium => _isPremium;

  /// Whether [initialize] has completed.
  bool get isInitialized => _initialized;

  /// The stored IAP purchase receipt (platform-specific data), or null.
  String? get purchaseReceipt => _purchaseReceipt;

  // ── Initialization ───────────────────────────────────────────────────────

  /// Reads persisted state from [SharedPreferences].
  ///
  /// Call once during app startup, after `WidgetsFlutterBinding.ensureInitialized()`.
  Future<void> initialize() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _isPremium = prefs.getBool(_kPremiumKey) ?? false;
      _purchaseReceipt = prefs.getString(_kReceiptKey);
      _initialized = true;
      debugPrint('[PremiumService] initialized — isPremium: $_isPremium');
    } catch (e) {
      debugPrint('[PremiumService] initialize error: $e');
      _isPremium = false;
      _initialized = true;
    }
  }

  // ── Query ────────────────────────────────────────────────────────────────

  /// Whether the current user has unlocked premium (method style).
  bool isPremiumUser() => _isPremium;

  // ── Mutations ────────────────────────────────────────────────────────────

  /// Sets the premium flag and persists it immediately.
  Future<void> setPremium(bool value) async {
    _isPremium = value;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_kPremiumKey, value);
      debugPrint('[PremiumService] setPremium($value)');
    } catch (e) {
      debugPrint('[PremiumService] setPremium error: $e');
    }
  }

  /// Stores the raw purchase receipt for future server-side verification.
  Future<void> setPurchaseReceipt(String receipt) async {
    _purchaseReceipt = receipt;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_kReceiptKey, receipt);
      debugPrint('[PremiumService] receipt saved');
    } catch (e) {
      debugPrint('[PremiumService] setPurchaseReceipt error: $e');
    }
  }

  /// Clears all premium state (useful for logout / debug).
  Future<void> clear() async {
    _isPremium = false;
    _purchaseReceipt = null;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_kPremiumKey);
      await prefs.remove(_kReceiptKey);
      debugPrint('[PremiumService] cleared');
    } catch (e) {
      debugPrint('[PremiumService] clear error: $e');
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  /// Quick platform check used by [AdService] to pick the right ad unit.
  static bool get isAndroid => Platform.isAndroid;
  static bool get isIOS => Platform.isIOS;
}
