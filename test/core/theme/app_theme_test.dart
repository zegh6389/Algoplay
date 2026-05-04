import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:algoplay/core/theme/app_theme.dart';

void main() {
  group('AppColors', () {
    test('primary tokens are Color instances', () {
      expect(AppColors.primary900, isA<Color>());
      expect(AppColors.primary700, isA<Color>());
      expect(AppColors.primary500, isA<Color>());
      expect(AppColors.primary300, isA<Color>());
      expect(AppColors.primary100, isA<Color>());
      expect(AppColors.primary50, isA<Color>());
    });

    test('secondary tokens are Color instances', () {
      expect(AppColors.secondary900, isA<Color>());
      expect(AppColors.secondary700, isA<Color>());
      expect(AppColors.secondary500, isA<Color>());
      expect(AppColors.secondary300, isA<Color>());
      expect(AppColors.secondary100, isA<Color>());
    });

    test('semantic tokens are Color instances', () {
      expect(AppColors.success600, isA<Color>());
      expect(AppColors.success100, isA<Color>());
      expect(AppColors.error600, isA<Color>());
      expect(AppColors.error100, isA<Color>());
      expect(AppColors.warning600, isA<Color>());
      expect(AppColors.warning100, isA<Color>());
    });

    test('surface tokens are Color instances', () {
      expect(AppColors.canvas, isA<Color>());
      expect(AppColors.card, isA<Color>());
      expect(AppColors.sunken, isA<Color>());
      expect(AppColors.overlay, isA<Color>());
    });

    test('text tokens are Color instances', () {
      expect(AppColors.textPrimary, isA<Color>());
      expect(AppColors.textSecondary, isA<Color>());
      expect(AppColors.textMuted, isA<Color>());
      expect(AppColors.textInverse, isA<Color>());
    });

    test('category color tokens are Color instances', () {
      expect(AppColors.catSorting, isA<Color>());
      expect(AppColors.catSearching, isA<Color>());
      expect(AppColors.catGraphs, isA<Color>());
      expect(AppColors.catDp, isA<Color>());
      expect(AppColors.catGreedy, isA<Color>());
      expect(AppColors.catTrees, isA<Color>());
    });
  });

  group('AppTypography', () {
    test('display has correct font size (36)', () {
      expect(AppTypography.display.fontSize, 36);
    });

    test('h1 has correct font size (28)', () {
      expect(AppTypography.h1.fontSize, 28);
    });

    test('h2 has correct font size (22)', () {
      expect(AppTypography.h2.fontSize, 22);
    });

    test('h3 has correct font size (18)', () {
      expect(AppTypography.h3.fontSize, 18);
    });

    test('body has correct font size (15)', () {
      expect(AppTypography.body.fontSize, 15);
    });

    test('bodyBold has correct font size (15)', () {
      expect(AppTypography.bodyBold.fontSize, 15);
    });

    test('caption has correct font size (13)', () {
      expect(AppTypography.caption.fontSize, 13);
    });

    test('overline has correct font size (11)', () {
      expect(AppTypography.overline.fontSize, 11);
    });

    test('textTheme maps styles correctly', () {
      expect(AppTypography.textTheme.displayLarge, AppTypography.display);
      expect(AppTypography.textTheme.headlineLarge, AppTypography.h1);
      expect(AppTypography.textTheme.headlineMedium, AppTypography.h2);
      expect(AppTypography.textTheme.headlineSmall, AppTypography.h3);
      expect(AppTypography.textTheme.bodyLarge, AppTypography.bodyBold);
      expect(AppTypography.textTheme.bodyMedium, AppTypography.body);
      expect(AppTypography.textTheme.bodySmall, AppTypography.caption);
      expect(AppTypography.textTheme.labelSmall, AppTypography.overline);
    });
  });

  group('AppSpacing', () {
    test('values match spec', () {
      expect(AppSpacing.xs, 4);
      expect(AppSpacing.sm, 8);
      expect(AppSpacing.md, 12);
      expect(AppSpacing.lg, 16);
      expect(AppSpacing.xl, 24);
      expect(AppSpacing.xxl, 32);
      expect(AppSpacing.xxxl, 48);
    });
  });

  group('AppRadius', () {
    test('values match spec', () {
      expect(AppRadius.sm, 6);
      expect(AppRadius.md, 10);
      expect(AppRadius.lg, 14);
      expect(AppRadius.xl, 20);
      expect(AppRadius.full, 9999);
    });

    test('BorderRadius convenience getters produce correct values', () {
      expect(AppRadius.smBorder, BorderRadius.circular(6));
      expect(AppRadius.mdBorder, BorderRadius.circular(10));
      expect(AppRadius.lgBorder, BorderRadius.circular(14));
      expect(AppRadius.xlBorder, BorderRadius.circular(20));
      expect(AppRadius.fullBorder, BorderRadius.circular(9999));
    });
  });

  group('AppShadows', () {
    test('flat returns empty list', () {
      expect(AppShadows.flat, isEmpty);
    });

    test('sm returns one shadow', () {
      expect(AppShadows.sm.length, 1);
    });

    test('md returns one shadow', () {
      expect(AppShadows.md.length, 1);
    });

    test('lg returns one shadow', () {
      expect(AppShadows.lg.length, 1);
    });

    test('xl returns one shadow', () {
      expect(AppShadows.xl.length, 1);
    });
  });

  group('AppTheme', () {
    test('light is a valid ThemeData', () {
      final theme = AppTheme.light;
      expect(theme, isA<ThemeData>());
    });

    test('light uses Material 3', () {
      expect(AppTheme.light.useMaterial3, true);
    });

    test('light has brightness light', () {
      expect(AppTheme.light.brightness, Brightness.light);
    });

    test('light color scheme primary matches AppColors.primary500', () {
      expect(AppTheme.light.colorScheme.primary, AppColors.primary500);
    });

    test('light scaffoldBackgroundColor matches AppColors.canvas', () {
      expect(AppTheme.light.scaffoldBackgroundColor, AppColors.canvas);
    });

    test('light text theme is set', () {
      expect(AppTheme.light.textTheme, isNotNull);
    });
  });
}
