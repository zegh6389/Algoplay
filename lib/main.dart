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

  runApp(
    const ProviderScope(
      child: AlgoplayApp(),
    ),
  );
}

/// Root widget for the Algoplay application.
class AlgoplayApp extends ConsumerWidget {
  const AlgoplayApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Sync Riverpod premium state with PremiumService on first build.
    if (ref.read(premiumProvider) != PremiumService.instance.isPremium) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
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
