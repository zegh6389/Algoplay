import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  test('onboarding route and first-run splash branch stay wired together', () {
    final onboarding = File(
      'lib/features/onboarding/presentation/onboarding_page.dart',
    ).readAsStringSync();
    final router = File('lib/core/router/app_router.dart').readAsStringSync();
    final splash = File(
      'lib/features/splash/presentation/splash_page.dart',
    ).readAsStringSync();

    expect(
      onboarding,
      contains("static const seenKey = 'has_completed_onboarding'"),
    );
    expect(onboarding, contains('prefs.setBool(OnboardingPage.seenKey, true)'));
    expect(
      onboarding,
      contains('enum _ArtworkType { welcome, visualize, play }'),
    );
    expect(
      onboarding,
      contains('class _WelcomeArtwork extends StatelessWidget'),
    );
    expect(
      onboarding,
      contains('class _VisualizeArtwork extends StatelessWidget'),
    );
    expect(onboarding, contains('class _PlayArtwork extends StatelessWidget'));
    expect(onboarding, isNot(contains('class OnboardingStep')));
    expect(onboarding, isNot(contains('extends ConsumerStatefulWidget')));
    expect(router, contains("show OnboardingPage"));
    expect(router, contains("path: '/onboarding'"));
    expect(
      router,
      contains('builder: (context, state) => const OnboardingPage()'),
    );
    expect(
      splash,
      contains("import '../../onboarding/presentation/onboarding_page.dart'"),
    );
    expect(splash, contains('prefs.getBool(OnboardingPage.seenKey)'));
    expect(
      splash,
      contains("context.go(hasSeenOnboarding ? '/home' : '/onboarding')"),
    );
  });
}
