import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/router/app_router.dart';
import 'core/services/ad_service.dart';
import 'core/services/iap_service.dart';
import 'core/services/premium_service.dart';
import 'core/theme/app_theme.dart';
import 'shared/providers/premium_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // ── Monetisation initialisation ─────────────────────────────────────────
  await PremiumService.instance.initialize();
  await AdService.instance.init();
  await IAPService.instance.initialize();

  runApp(const ProviderScope(child: AlgoplayApp()));
}

/// Root widget for the Algoplay application.
class AlgoplayApp extends ConsumerStatefulWidget {
  const AlgoplayApp({super.key});

  @override
  ConsumerState<AlgoplayApp> createState() => _AlgoplayAppState();
}

class _AlgoplayAppState extends ConsumerState<AlgoplayApp> {
  late final VoidCallback _premiumListener;

  @override
  void initState() {
    super.initState();
    _premiumListener = () {
      if (!mounted) return;
      ref.read(premiumProvider.notifier).state =
          PremiumService.instance.isPremium;
    };
    PremiumService.instance.premiumListenable.addListener(_premiumListener);
  }

  @override
  void dispose() {
    PremiumService.instance.premiumListenable.removeListener(_premiumListener);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Keep Riverpod premium state in sync with purchase/restore callbacks.
    if (ref.read(premiumProvider) != PremiumService.instance.isPremium) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        ref.read(premiumProvider.notifier).state =
            PremiumService.instance.isPremium;
      });
    }

    return MaterialApp.router(
      title: 'Algoplay',
      debugShowCheckedModeBanner: false,

      // ── Theming (light only — no dark mode for now) ────────────────────────
      theme: AppTheme.light,

      // ── Routing ──────────────────────────────────────────────────────────
      routerConfig: router,
    );
  }
}
