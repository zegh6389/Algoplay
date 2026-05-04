import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/services/premium_service.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// Riverpod providers for premium / monetisation state.
// ═══════════════════════════════════════════════════════════════════════════════

/// Reflects the current premium subscription status.
///
/// Initialised from [PremiumService] so that the value is already correct
/// before the first frame is painted.
final premiumProvider = StateProvider<bool>(
  (ref) => PremiumService.instance.isPremium,
);

/// Derived provider — `true` when the user is premium (i.e. ads should be
/// hidden).  Right now this is a simple alias for [premiumProvider], but it
/// exists as a separate provider so that additional gating logic (e.g. a
/// promotional ad-free period) can be added in one place later.
final adFreeProvider = Provider<bool>((ref) {
  return ref.watch(premiumProvider);
});
