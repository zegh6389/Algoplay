import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // ── Supabase initialization (placeholder) ──────────────────────────────────
  // TODO: Replace with real Supabase credentials from environment config.
  await Supabase.initialize(
    url: const String.fromEnvironment('SUPABASE_URL', defaultValue: ''),
    anonKey: const String.fromEnvironment('SUPABASE_ANON_KEY', defaultValue: ''),
  );

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
