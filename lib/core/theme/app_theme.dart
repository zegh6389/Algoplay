import 'package:flutter/material.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// AlgoPlay Design System — Color Tokens
/// Mirrors DESIGN.md OKLCH-verified palette.
// ═══════════════════════════════════════════════════════════════════════════════
class AppColors {
  AppColors._();

  // ── Surfaces ───────────────────────────────────────────────────────────────
  static const Color canvas  = Color(0xFFFAFBFC); // surface.canvas — main bg
  static const Color card    = Color(0xFFFFFFFF); // surface.card — cards, elevated
  static const Color sunken  = Color(0xFFF1F3F5); // surface.sunken — insets, code
  static const Color overlay = Color(0xFFFFFFEE); // surface.overlay — modal backdrop

  // ── Primary — Solar Blue ───────────────────────────────────────────────────
  static const Color primary900 = Color(0xFF1A56DB); // text on light bg
  static const Color primary700 = Color(0xFF2563EB); // pressed states
  static const Color primary500 = Color(0xFF3B82F6); // buttons, links, active tabs
  static const Color primary300 = Color(0xFF93C5FD); // hovered states
  static const Color primary100 = Color(0xFFDBEAFE); // tinted backgrounds
  static const Color primary50  = Color(0xFFEFF6FF); // subtle highlights

  // ── Secondary — Solar Orange ───────────────────────────────────────────────
  static const Color secondary900 = Color(0xFFC2410C); // text on light bg
  static const Color secondary700 = Color(0xFFEA580C); // pressed states
  static const Color secondary500 = Color(0xFFF97316); // badges, XP, streaks
  static const Color secondary300 = Color(0xFFFDBA74); // soft highlights
  static const Color secondary100 = Color(0xFFFFF7ED); // warm tinted backgrounds

  // ── Solar Accents ──────────────────────────────────────────────────────────
  static const Color solarGold  = Color(0xFFF59E0B); // XP, coins, achievements
  static const Color solarAmber = Color(0xFFFBBF24); // stars, rewards glow
  static const Color solarLime  = Color(0xFF84CC16); // growth, progress
  static const Color solarCyan  = Color(0xFF06B6D4); // information, cool accent

  // ── Semantic ───────────────────────────────────────────────────────────────
  static const Color success600 = Color(0xFF16A34A); // completed, correct
  static const Color success100 = Color(0xFFDCFCE7); // success background
  static const Color error600   = Color(0xFFDC2626); // errors only
  static const Color error100   = Color(0xFFFEE2E2); // error background
  static const Color warning600 = Color(0xFFD97706); // caution
  static const Color warning100 = Color(0xFFFEF3C7); // warning background

  // ── Text ───────────────────────────────────────────────────────────────────
  static const Color textPrimary   = Color(0xFF111827); // body text
  static const Color textSecondary = Color(0xFF4B5563); // subtitles, descriptions
  static const Color textMuted     = Color(0xFF9CA3AF); // timestamps, disabled
  static const Color textInverse   = Color(0xFFFFFFFF); // on colored backgrounds

  // ── Category Colors (algorithm skill groups) ───────────────────────────────
  static const Color catSorting   = Color(0xFFF472B6); // rose — sorting
  static const Color catSearching = Color(0xFF38BDF8); // sky — searching
  static const Color catGraphs    = Color(0xFF34D399); // emerald — graphs
  static const Color catDp        = Color(0xFFA78BFA); // violet — DP
  static const Color catGreedy    = Color(0xFFFBBF24); // amber — greedy
  static const Color catTrees     = Color(0xFFFB923C); // orange — trees
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Typography Scale
/// DESIGN.md: SpaceGrotesk primary, SpaceMono for code.
// ═══════════════════════════════════════════════════════════════════════════════
class AppTypography {
  AppTypography._();

  // ── Named text styles ──────────────────────────────────────────────────────
  static const TextStyle display = TextStyle(
    fontSize: 36,
    fontWeight: FontWeight.w800,
    letterSpacing: -0.72, // -0.02em ≈ -0.02 * 36
    height: 1.1,
    color: AppColors.textPrimary,
  );

  static const TextStyle h1 = TextStyle(
    fontSize: 28,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.28, // -0.01em
    height: 1.2,
    color: AppColors.textPrimary,
  );

  static const TextStyle h2 = TextStyle(
    fontSize: 22,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.11, // -0.005em
    height: 1.3,
    color: AppColors.textPrimary,
  );

  static const TextStyle h3 = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w600,
    letterSpacing: 0,
    height: 1.4,
    color: AppColors.textPrimary,
  );

  static const TextStyle body = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w400,
    letterSpacing: 0,
    height: 1.5,
    color: AppColors.textPrimary,
  );

  static const TextStyle bodyBold = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w600,
    letterSpacing: 0,
    height: 1.5,
    color: AppColors.textPrimary,
  );

  static const TextStyle caption = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.13, // 0.01em
    height: 1.4,
    color: AppColors.textSecondary,
  );

  static const TextStyle overline = TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.88, // 0.08em
    height: 1.3,
    color: AppColors.textMuted,
  );

  // ── Material TextTheme mapping ─────────────────────────────────────────────
  static const TextTheme textTheme = TextTheme(
    displayLarge: display,
    headlineLarge: h1,
    headlineMedium: h2,
    headlineSmall: h3,
    bodyLarge: bodyBold,
    bodyMedium: body,
    bodySmall: caption,
    labelSmall: overline,
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Spacing Scale
// ═══════════════════════════════════════════════════════════════════════════════
class AppSpacing {
  AppSpacing._();

  static const double xs  = 4;
  static const double sm  = 8;
  static const double md  = 12;
  static const double lg  = 16;
  static const double xl  = 24;
  static const double xxl = 32;
  static const double xxxl = 48;
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Border Radius
// ═══════════════════════════════════════════════════════════════════════════════
class AppRadius {
  AppRadius._();

  static const double sm   = 6;
  static const double md   = 10;
  static const double lg   = 14;
  static const double xl   = 20;
  static const double full = 9999;

  // ── Convenience BorderRadius getters ───────────────────────────────────────
  static BorderRadius get smBorder   => BorderRadius.circular(sm);
  static BorderRadius get mdBorder   => BorderRadius.circular(md);
  static BorderRadius get lgBorder   => BorderRadius.circular(lg);
  static BorderRadius get xlBorder   => BorderRadius.circular(xl);
  static BorderRadius get fullBorder => BorderRadius.circular(full);
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Elevation Shadows (from DESIGN.md)
// ═══════════════════════════════════════════════════════════════════════════════
class AppShadows {
  AppShadows._();

  /// flat — no shadow
  static List<BoxShadow> get flat => const [];

  /// sm — 0 1px 3px rgba(0,0,0,0.06) — cards at rest
  static List<BoxShadow> get sm => [
    BoxShadow(
      color: const Color(0x0F000000), // rgba(0,0,0,0.06) ≈ 0x0F
      blurRadius: 3,
      offset: const Offset(0, 1),
    ),
  ];

  /// md — 0 2px 8px rgba(0,0,0,0.08) — hovered cards
  static List<BoxShadow> get md => [
    BoxShadow(
      color: const Color(0x14000000), // rgba(0,0,0,0.08) ≈ 0x14
      blurRadius: 8,
      offset: const Offset(0, 2),
    ),
  ];

  /// lg — 0 4px 16px rgba(0,0,0,0.1) — bottom nav, modals
  static List<BoxShadow> get lg => [
    BoxShadow(
      color: const Color(0x1A000000), // rgba(0,0,0,0.1) ≈ 0x1A
      blurRadius: 16,
      offset: const Offset(0, 4),
    ),
  ];

  /// xl — 0 8px 32px rgba(0,0,0,0.12) — floating action elements
  static List<BoxShadow> get xl => [
    BoxShadow(
      color: const Color(0x1F000000), // rgba(0,0,0,0.12) ≈ 0x1F
      blurRadius: 32,
      offset: const Offset(0, 8),
    ),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Material 3 Theme — Light only
// ═══════════════════════════════════════════════════════════════════════════════
class AppTheme {
  AppTheme._();

  /// Light theme (the only theme for now — no dark mode).
  static ThemeData get light => ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,

    // ── Color Scheme ───────────────────────────────────────────────────────
    colorScheme: const ColorScheme.light(
      primary:       AppColors.primary500,
      onPrimary:     AppColors.textInverse,
      secondary:     AppColors.secondary500,
      onSecondary:   AppColors.textInverse,
      error:         AppColors.error600,
      onError:       AppColors.textInverse,
      surface:       AppColors.card,
      onSurface:     AppColors.textPrimary,
      surfaceContainerHighest: AppColors.canvas,
    ),

    scaffoldBackgroundColor: AppColors.canvas,

    // ── Text Theme ─────────────────────────────────────────────────────────
    textTheme: AppTypography.textTheme,

    // ── AppBar ─────────────────────────────────────────────────────────────
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.card,
      foregroundColor: AppColors.textPrimary,
      elevation: 0,
      centerTitle: true,
      scrolledUnderElevation: 1,
      titleTextStyle: TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
    ),

    // ── Cards: white, lg radius, sm elevation ──────────────────────────────
    cardTheme: CardThemeData(
      color: AppColors.card,
      elevation: 1,
      shadowColor: Colors.black.withValues(alpha: 0.06),
      shape: RoundedRectangleBorder(
        borderRadius: AppRadius.lgBorder,
      ),
    ),

    // ── Bottom Navigation: white, lg shadow ────────────────────────────────
    bottomNavigationBarTheme: BottomNavigationBarThemeData(
      backgroundColor: AppColors.card,
      selectedItemColor: AppColors.primary500,
      unselectedItemColor: AppColors.textMuted,
      type: BottomNavigationBarType.fixed,
      elevation: 0,
    ),

    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: AppColors.card,
      elevation: 0,
      shadowColor: Colors.black.withValues(alpha: 0.1),
      indicatorColor: AppColors.primary50,
      labelTextStyle: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return const TextStyle(
            color: AppColors.primary500,
            fontSize: 11,
            fontWeight: FontWeight.w600,
          );
        }
        return const TextStyle(
          color: AppColors.textMuted,
          fontSize: 11,
        );
      }),
      iconTheme: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return const IconThemeData(color: AppColors.primary500);
        }
        return const IconThemeData(color: AppColors.textMuted);
      }),
    ),

    // ── Buttons ────────────────────────────────────────────────────────────

    // Primary button: primary.500 bg, white text, md radius
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary500,
        foregroundColor: AppColors.textInverse,
        disabledBackgroundColor: AppColors.primary300,
        disabledForegroundColor: AppColors.textInverse.withValues(alpha: 0.6),
        elevation: 0,
        minimumSize: const Size.fromHeight(48),
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.md,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: AppRadius.mdBorder,
        ),
        textStyle: const TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w600,
        ),
      ),
    ),

    // Secondary button: secondary.500 bg, white text
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: AppColors.secondary500,
        foregroundColor: AppColors.textInverse,
        disabledBackgroundColor: AppColors.secondary300,
        elevation: 0,
        minimumSize: const Size.fromHeight(48),
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.md,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: AppRadius.mdBorder,
        ),
        textStyle: const TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w600,
        ),
      ),
    ),

    // Ghost button: transparent bg, primary.500 text, primary.100 on pressed
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.primary500,
        side: const BorderSide(color: AppColors.primary500),
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.md,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: AppRadius.mdBorder,
        ),
        textStyle: const TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w600,
        ),
      ),
    ),

    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: AppColors.primary500,
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: AppRadius.mdBorder,
        ),
        textStyle: const TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w600,
        ),
      ),
    ),

    // ── Input / Text Field ─────────────────────────────────────────────────
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.canvas,
      contentPadding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.md,
      ),
      border: OutlineInputBorder(
        borderRadius: AppRadius.mdBorder,
        borderSide: const BorderSide(color: AppColors.sunken),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: AppRadius.mdBorder,
        borderSide: const BorderSide(color: AppColors.sunken),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: AppRadius.mdBorder,
        borderSide: const BorderSide(color: AppColors.primary500, width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: AppRadius.mdBorder,
        borderSide: const BorderSide(color: AppColors.error600),
      ),
      hintStyle: const TextStyle(color: AppColors.textMuted),
      labelStyle: const TextStyle(color: AppColors.textSecondary),
    ),

    // ── Divider ────────────────────────────────────────────────────────────
    dividerTheme: const DividerThemeData(
      color: AppColors.sunken,
      thickness: 1,
      space: 1,
    ),

    // ── Chip ───────────────────────────────────────────────────────────────
    chipTheme: ChipThemeData(
      backgroundColor: AppColors.sunken,
      selectedColor: AppColors.primary100,
      labelStyle: const TextStyle(
        fontSize: 13,
        color: AppColors.textPrimary,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: AppRadius.smBorder,
      ),
      side: BorderSide.none,
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
    ),

    // ── Floating Action Button ─────────────────────────────────────────────
    floatingActionButtonTheme: FloatingActionButtonThemeData(
      backgroundColor: AppColors.primary500,
      foregroundColor: AppColors.textInverse,
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: AppRadius.xlBorder,
      ),
    ),

    // ── Tab Bar ────────────────────────────────────────────────────────────
    tabBarTheme: TabBarThemeData(
      labelColor: AppColors.primary500,
      unselectedLabelColor: AppColors.textSecondary,
      indicatorColor: AppColors.primary500,
      indicatorSize: TabBarIndicatorSize.label,
      labelStyle: const TextStyle(
        fontSize: 15,
        fontWeight: FontWeight.w600,
      ),
      unselectedLabelStyle: const TextStyle(
        fontSize: 15,
        fontWeight: FontWeight.w400,
      ),
    ),
  );
}
