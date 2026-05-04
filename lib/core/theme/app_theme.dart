import 'package:flutter/material.dart';

/// ──────────────────────────────────────────────
/// AlgoPlay Color System — mirrors React theme.ts
/// ──────────────────────────────────────────────
class AppColors {
  AppColors._();

  // ── Core palette ────────────────────────────
  static const Color background   = Color(0xFFF8FAFC);
  static const Color surface      = Color(0xFFFFFFFF);

  static const Color accent       = Color(0xFF3B82F6); // blue-500
  static const Color secondary    = Color(0xFFF97316); // orange-500
  static const Color success      = Color(0xFF22C55E); // green-500
  static const Color error        = Color(0xFFEF4444); // red-500
  static const Color warning      = Color(0xFFF59E0B); // amber-500

  // ── Text ────────────────────────────────────
  static const Color textPrimary   = Color(0xFF1E293B); // slate-800
  static const Color textSecondary = Color(0xFF64748B); // slate-500

  // ── Neon accent colors ─────────────────────
  static const Color neonYellow = Color(0xFFFFFF00);
  static const Color neonCyan   = Color(0xFF00FFFF);
  static const Color neonPink   = Color(0xFFFF00FF);
  static const Color neonPurple = Color(0xFFBF00FF);
  static const Color neonLime   = Color(0xFFB5FF1A);

  // ── Skill category colors ──────────────────
  static const Color skillSearch = Color(0xFF3B82F6); // blue
  static const Color skillSort   = Color(0xFF8B5CF6); // violet
  static const Color skillGraph  = Color(0xFF10B981); // emerald
  static const Color skillDP     = Color(0xFFF97316); // orange
  static const Color skillGreedy = Color(0xFFEF4444); // red

  // ── Syntax highlighting ────────────────────
  static const Color syntaxKeyword    = Color(0xFFC678DD); // purple
  static const Color syntaxString     = Color(0xFF98C379); // green
  static const Color syntaxNumber     = Color(0xFFD19A66); // orange
  static const Color syntaxComment    = Color(0xFF7F848E); // gray
  static const Color syntaxFunction   = Color(0xFF61AFEF); // blue
  static const Color syntaxVariable   = Color(0xFFE5C07B); // yellow
  static const Color syntaxOperator   = Color(0xFF56B6C2); // cyan
  static const Color syntaxType       = Color(0xFFE06C75); // red
  static const Color syntaxBackground = Color(0xFF282C34); // dark bg
  static const Color syntaxText       = Color(0xFFABB2BF); // light gray text

  // ── Algorithm complexity colours ───────────
  static const Color complexityO1      = Color(0xFF22C55E); // green  – O(1)
  static const Color complexityOLogN   = Color(0xFF10B981); // emerald – O(log n)
  static const Color complexityON       = Color(0xFF3B82F6); // blue   – O(n)
  static const Color complexityONLogN   = Color(0xFFF59E0B); // amber  – O(n log n)
  static const Color complexityON2      = Color(0xFFF97316); // orange – O(n²)
  static const Color complexityO2N      = Color(0xFFEF4444); // red    – O(2ⁿ)
  static const Color complexityONF      = Color(0xFFDC2626); // red-600 – O(n!)
  static const Color complexityBad      = Color(0xFF991B1B); // dark red

  // ── Semantic / Material helpers ─────────────
  static const Color divider       = Color(0xFFE2E8F0); // slate-200
  static const Color disabled      = Color(0xFFCBD5E1); // slate-300
  static const Color hint          = Color(0xFF94A3B8); // slate-400
  static const Color cardShadow    = Color(0x1A000000); // 10 % black
}

/// ──────────────────────────────────────────────
/// Spacing constants
/// ──────────────────────────────────────────────
class AppSpacing {
  AppSpacing._();

  static const double xs  = 4;
  static const double sm  = 8;
  static const double md  = 12;
  static const double lg  = 16;
  static const double xl  = 24;
  static const double xxl = 32;
}

/// ──────────────────────────────────────────────
/// Font size constants
/// ──────────────────────────────────────────────
class AppFontSizes {
  AppFontSizes._();

  static const double xs      = 10;
  static const double sm      = 12;
  static const double md      = 14;
  static const double lg      = 16;
  static const double xl      = 20;
  static const double xxl     = 24;
  static const double display = 32;
}

/// ──────────────────────────────────────────────
/// Border radius constants
/// ──────────────────────────────────────────────
class AppBorderRadius {
  AppBorderRadius._();

  static const double sm   = 8;
  static const double md   = 12;
  static const double lg   = 16;
  static const double xl   = 24;
  static const double full = 9999;

  /// Convenience getters that return BorderRadius objects.
  static BorderRadius get smBorder   => BorderRadius.circular(sm);
  static BorderRadius get mdBorder   => BorderRadius.circular(md);
  static BorderRadius get lgBorder   => BorderRadius.circular(lg);
  static BorderRadius get xlBorder   => BorderRadius.circular(xl);
  static BorderRadius get fullBorder => BorderRadius.circular(full);
}

/// ──────────────────────────────────────────────
/// Shadow presets
/// ──────────────────────────────────────────────
class AppShadows {
  AppShadows._();

  static List<BoxShadow> get sm => [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.05),
      blurRadius: 4,
      offset: const Offset(0, 2),
    ),
  ];

  static List<BoxShadow> get md => [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.08),
      blurRadius: 8,
      offset: const Offset(0, 4),
    ),
  ];

  static List<BoxShadow> get lg => [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.10),
      blurRadius: 16,
      offset: const Offset(0, 8),
    ),
  ];

  static List<BoxShadow> get xl => [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.12),
      blurRadius: 24,
      offset: const Offset(0, 12),
    ),
  ];

  static List<BoxShadow> get card => [
    BoxShadow(
      color: AppColors.cardShadow,
      blurRadius: 12,
      offset: const Offset(0, 4),
    ),
  ];

  /// Neon glow effect for the given color.
  static List<BoxShadow> neonGlow(Color color, {double blur = 20, double spread = 2}) => [
    BoxShadow(
      color: color.withValues(alpha: 0.6),
      blurRadius: blur,
      spreadRadius: spread,
    ),
    BoxShadow(
      color: color.withValues(alpha: 0.3),
      blurRadius: blur * 2,
      spreadRadius: spread * 2,
    ),
  ];
}

/// ──────────────────────────────────────────────
/// Material 3 Theme Data
/// ──────────────────────────────────────────────
class AppTheme {
  AppTheme._();

  // ── Seed colour used by M3 ──────────────────
  static const Color _seed = AppColors.accent;

  /// Light theme (default).
  static ThemeData get light => ThemeData(
    useMaterial3: true,
    colorSchemeSeed: _seed,
    brightness: Brightness.light,

    // Override specific scheme slots to match React palette exactly.
    colorScheme: const ColorScheme.light(
      primary:       AppColors.accent,
      secondary:     AppColors.secondary,
      error:         AppColors.error,
      surface:       AppColors.surface,
      onSurface:     AppColors.textPrimary,
      onPrimary:     Colors.white,
      onSecondary:   Colors.white,
      onError:       Colors.white,
    ),

    scaffoldBackgroundColor: AppColors.background,

    // ── AppBar ──────────────────────────────
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.surface,
      foregroundColor: AppColors.textPrimary,
      elevation: 0,
      centerTitle: true,
      scrolledUnderElevation: 1,
    ),

    // ── Cards ───────────────────────────────
    cardTheme: CardThemeData(
      color: AppColors.surface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: AppBorderRadius.mdBorder,
      ),
      shadowColor: AppColors.cardShadow,
    ),

    // ── Elevated Button ─────────────────────
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.accent,
        foregroundColor: Colors.white,
        elevation: 0,
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.md,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: AppBorderRadius.mdBorder,
        ),
        textStyle: const TextStyle(
          fontSize: AppFontSizes.md,
          fontWeight: FontWeight.w600,
        ),
      ),
    ),

    // ── Outlined Button ─────────────────────
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.accent,
        side: const BorderSide(color: AppColors.accent),
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.md,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: AppBorderRadius.mdBorder,
        ),
        textStyle: const TextStyle(
          fontSize: AppFontSizes.md,
          fontWeight: FontWeight.w600,
        ),
      ),
    ),

    // ── Text Button ─────────────────────────
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: AppColors.accent,
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm,
        ),
        textStyle: const TextStyle(
          fontSize: AppFontSizes.md,
          fontWeight: FontWeight.w600,
        ),
      ),
    ),

    // ── Input / Text Field ──────────────────
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.background,
      contentPadding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.md,
      ),
      border: OutlineInputBorder(
        borderRadius: AppBorderRadius.mdBorder,
        borderSide: const BorderSide(color: AppColors.divider),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: AppBorderRadius.mdBorder,
        borderSide: const BorderSide(color: AppColors.divider),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: AppBorderRadius.mdBorder,
        borderSide: const BorderSide(color: AppColors.accent, width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: AppBorderRadius.mdBorder,
        borderSide: const BorderSide(color: AppColors.error),
      ),
      hintStyle: const TextStyle(color: AppColors.hint),
      labelStyle: const TextStyle(color: AppColors.textSecondary),
    ),

    // ── Bottom Navigation ───────────────────
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: AppColors.surface,
      selectedItemColor: AppColors.accent,
      unselectedItemColor: AppColors.textSecondary,
      type: BottomNavigationBarType.fixed,
      elevation: 8,
    ),

    // ── Navigation Bar (M3) ─────────────────
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: AppColors.surface,
      indicatorColor: AppColors.accent.withValues(alpha: 0.12),
      labelTextStyle: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return const TextStyle(
            color: AppColors.accent,
            fontSize: AppFontSizes.xs,
            fontWeight: FontWeight.w600,
          );
        }
        return const TextStyle(
          color: AppColors.textSecondary,
          fontSize: AppFontSizes.xs,
        );
      }),
    ),

    // ── Divider ─────────────────────────────
    dividerTheme: const DividerThemeData(
      color: AppColors.divider,
      thickness: 1,
      space: 1,
    ),

    // ── Chip ────────────────────────────────
    chipTheme: ChipThemeData(
      backgroundColor: AppColors.background,
      selectedColor: AppColors.accent.withValues(alpha: 0.15),
      labelStyle: const TextStyle(
        fontSize: AppFontSizes.sm,
        color: AppColors.textPrimary,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: AppBorderRadius.smBorder,
      ),
      side: const BorderSide(color: AppColors.divider),
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
    ),

    // ── Floating Action Button ──────────────
    floatingActionButtonTheme: FloatingActionButtonThemeData(
      backgroundColor: AppColors.accent,
      foregroundColor: Colors.white,
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: AppBorderRadius.lgBorder,
      ),
    ),

    // ── Tab Bar ─────────────────────────────
    tabBarTheme: TabBarThemeData(
      labelColor: AppColors.accent,
      unselectedLabelColor: AppColors.textSecondary,
      indicatorColor: AppColors.accent,
      indicatorSize: TabBarIndicatorSize.label,
      labelStyle: const TextStyle(
        fontSize: AppFontSizes.md,
        fontWeight: FontWeight.w600,
      ),
      unselectedLabelStyle: const TextStyle(
        fontSize: AppFontSizes.md,
        fontWeight: FontWeight.w400,
      ),
    ),

    // ── Text Theme ──────────────────────────
    textTheme: const TextTheme(
      displayLarge: TextStyle(
        fontSize: AppFontSizes.display,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
      ),
      headlineLarge: TextStyle(
        fontSize: AppFontSizes.xxl,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
      ),
      headlineMedium: TextStyle(
        fontSize: AppFontSizes.xl,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
      headlineSmall: TextStyle(
        fontSize: AppFontSizes.lg,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
      titleLarge: TextStyle(
        fontSize: AppFontSizes.lg,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
      titleMedium: TextStyle(
        fontSize: AppFontSizes.md,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
      titleSmall: TextStyle(
        fontSize: AppFontSizes.sm,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
      bodyLarge: TextStyle(
        fontSize: AppFontSizes.lg,
        fontWeight: FontWeight.w400,
        color: AppColors.textPrimary,
      ),
      bodyMedium: TextStyle(
        fontSize: AppFontSizes.md,
        fontWeight: FontWeight.w400,
        color: AppColors.textPrimary,
      ),
      bodySmall: TextStyle(
        fontSize: AppFontSizes.sm,
        fontWeight: FontWeight.w400,
        color: AppColors.textSecondary,
      ),
      labelLarge: TextStyle(
        fontSize: AppFontSizes.md,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
      labelMedium: TextStyle(
        fontSize: AppFontSizes.sm,
        fontWeight: FontWeight.w500,
        color: AppColors.textSecondary,
      ),
      labelSmall: TextStyle(
        fontSize: AppFontSizes.xs,
        fontWeight: FontWeight.w500,
        color: AppColors.textSecondary,
      ),
    ),
  );

  /// Dark theme.
  static ThemeData get dark {
    const darkSurface = Color(0xFF1E293B);
    const darkBackground = Color(0xFF0F172A);
    const darkOnSurface = Color(0xFFE2E8F0);

    return ThemeData(
      useMaterial3: true,
      colorSchemeSeed: _seed,
      brightness: Brightness.dark,

      colorScheme: const ColorScheme.dark(
        primary:     AppColors.accent,
        secondary:   AppColors.secondary,
        error:       AppColors.error,
        surface:     darkSurface,
        onSurface:   darkOnSurface,
        onPrimary:   Colors.white,
        onSecondary: Colors.white,
        onError:     Colors.white,
      ),

      scaffoldBackgroundColor: darkBackground,

      appBarTheme: const AppBarTheme(
        backgroundColor: darkSurface,
        foregroundColor: darkOnSurface,
        elevation: 0,
        centerTitle: true,
      ),

      cardTheme: CardThemeData(
        color: darkSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: AppBorderRadius.mdBorder,
        ),
      ),

      dividerTheme: const DividerThemeData(
        color: Color(0xFF334155),
        thickness: 1,
        space: 1,
      ),
    );
  }
}
