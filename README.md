# 🧠 Algoplay — Gamified Algorithm Learning App

> Learn algorithms the fun way. Play games, visualize data structures, compete on leaderboards, and get tutored by AI — all from your phone.

---

## ✨ Features

### 📱 5-Tab Navigation

| Tab        | Description                                              |
|------------|----------------------------------------------------------|
| **Home**   | Personalized dashboard, daily challenges, progress feed   |
| **Learn**  | Structured algorithm courses with interactive lessons     |
| **Play**   | Algorithm-themed mini-games with XP & rewards             |
| **Stats**  | Skill radar, streak tracking, detailed analytics          |
| **Profile**| Settings, achievements, premium status, social links      |

### 🎮 4 Mini-Games

| Game             | Algorithm Domain    | Route                    |
|------------------|---------------------|--------------------------|
| **Battle Arena** | Mixed algorithms    | `/game/battle-arena`     |
| **Grid Escape**  | Pathfinding / BFS   | `/game/grid-escape`      |
| **The Sorter**   | Sorting algorithms  | `/game/the-sorter`       |
| **Race Mode**    | Speed coding        | `/game/race-mode`        |

### 🔍 3 Visualizers

| Visualizer | Domain               | Route                        |
|------------|----------------------|------------------------------|
| **DP**     | Dynamic Programming  | `/visualizer/dp`             |
| **Tree**   | Tree traversals      | `/visualizer/tree`           |
| **General**| Any algorithm        | `/visualizer/:algorithmId`   |

### 🤖 AI Tutor
- Step-by-step algorithm explanations
- Pseudocode → code translation
- Adaptive difficulty based on user progress
- Route: `/tutor`

### 💎 Premium & Monetization
- **Premium subscription** via RevenueCat (ad-free, exclusive content, Elite Arena)
- **Rewarded ads** via Google AdMob for bonus XP
- Route: `/premium`

### 🏆 Leaderboards
- Global & weekly rankings
- Friends-only challenges
- Route: `/leaderboard`

---

## 🛠 Tech Stack

| Layer              | Technology                         | Version     |
|--------------------|------------------------------------|-------------|
| Framework          | Flutter                            | 3.41+       |
| Language           | Dart                               | 3.11+       |
| State Management   | Riverpod (`flutter_riverpod`)      | ^2.6.1      |
| Routing            | GoRouter (`go_router`)             | ^14.8.1     |
| Backend / Auth     | Supabase (`supabase_flutter`)      | ^2.8.4      |
| In-App Purchases   | RevenueCat (`purchases_flutter`)   | ^8.7.3      |
| Ads                | Google AdMob (`google_mobile_ads`) | ^5.3.1      |
| Animations         | `flutter_animate`                  | ^4.5.2      |
| Fonts / Icons      | `google_fonts`, `flutter_svg`      | latest      |
| Secure Storage     | `flutter_secure_storage`           | ^9.2.4      |
| Testing            | `flutter_test`, `mockito`          | SDK + ^5.4  |

---

## 🏗 Architecture

Algoplay follows a **feature-first clean architecture** pattern:

```
┌──────────────────────────────────────────────────────┐
│                    Presentation                       │
│         (Screens, Widgets, Providers)                │
├──────────────────────────────────────────────────────┤
│                      Domain                          │
│          (Models, Use Cases, Repositories)            │
├──────────────────────────────────────────────────────┤
│                      Data                            │
│     (Data Sources, Repository Impls, APIs)            │
├──────────────────────────────────────────────────────┤
│                    Core / Shared                      │
│  (Router, Theme, Services, Shared Widgets, Util)      │
└──────────────────────────────────────────────────────┘
```

**Key principles:**
- Each feature is self-contained under `lib/features/<name>/`
- Shared code lives in `lib/shared/` and `lib/core/`
- State is managed via Riverpod providers (co-located with features)
- Navigation is declarative via GoRouter with `StatefulShellRoute` for tabs

---

## 📂 Directory Structure

```
lib/
├── main.dart                          # App entry point (ProviderScope + MaterialApp.router)
├── core/
│   ├── router/
│   │   ├── app_router.dart            # GoRouter config (routes, shell, pages)
│   │   └── tab_shell.dart             # Animated bottom navigation bar
│   ├── theme/
│   │   └── app_theme.dart             # Material 3 theme, colors, spacing, shadows
│   └── services/                      # Global services (Supabase, Analytics, etc.)
├── features/
│   ├── auth/                          # Authentication (data + presentation)
│   ├── home/                          # Home tab (data + presentation + widgets)
│   ├── learn/                         # Learn tab (data + presentation + widgets)
│   ├── play/                          # Play tab (game selection hub)
│   ├── stats/                         # Stats tab (presentation + widgets)
│   ├── profile/                       # Profile tab (data + presentation + widgets)
│   ├── games/
│   │   ├── battle_arena/              # Battle Arena game
│   │   ├── grid_escape/               # Grid Escape game
│   │   ├── the_sorter/                # The Sorter game
│   │   └── race_mode/                 # Race Mode game
│   ├── playground/                    # Code playground (presentation + widgets)
│   ├── tutor/                         # AI Tutor (presentation + widgets)
│   ├── leaderboard/                   # Leaderboard (presentation)
│   ├── premium/                       # Premium paywall (presentation)
│   ├── elite_arena/                   # Elite Arena (premium game)
│   ├── cheatsheet/                    # Algorithm cheatsheet
│   └── dashboard/                     # Full-screen analytics dashboard
├── algorithms/
│   ├── models/                        # Shared algorithm data models
│   │   ├── algorithm_models.dart
│   │   ├── tree_models.dart
│   │   ├── dp_step.dart
│   │   ├── pathfinding_models.dart
│   │   ├── search_step.dart
│   │   └── sort_step.dart
│   ├── sorting/                       # Sorting algorithm implementations
│   ├── searching/                     # Searching algorithm implementations
│   ├── dynamic_programming/           # DP algorithm implementations
│   ├── trees/                         # Tree algorithm implementations
│   ├── pathfinding/                   # Pathfinding algorithm implementations
│   └── code_implementations/          # Reference code snippets per language
├── shared/
│   ├── providers/                     # Shared Riverpod providers
│   ├── models/                        # Shared domain models
│   └── widgets/                       # Shared UI components
└── assets/                            # (Asset declarations are in pubspec.yaml)
```

---

## 🚀 Getting Started

### Prerequisites

- **Flutter SDK** 3.41+ (Dart 3.11+)
- An IDE with Flutter support (VS Code / Android Studio)
- iOS: Xcode 16+, CocoaPods
- Android: Android SDK 34+, Gradle 8+

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/algoplay_flutter.git
cd algoplay_flutter

# 2. Install dependencies
flutter pub get

# 3. Generate Riverpod code (if using @riverpod annotations)
dart run build_runner build --delete-conflicting-outputs

# 4. Run the app
flutter run
```

### Environment Variables

Pass Supabase credentials at build time via `--dart-define`:

```bash
flutter run \
  --dart-define=SUPABASE_URL=https://your-project.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=your-anon-key \
  --dart-define=REVENUECAT_API_KEY=your-revenuecat-key \
  --dart-define=ADMOB_APP_ID=your-admob-app-id
```

Or create a `.env` file and use `--dart-define-from-file=.env`.

| Variable               | Description                        | Required |
|------------------------|------------------------------------|----------|
| `SUPABASE_URL`         | Supabase project URL               | ✅       |
| `SUPABASE_ANON_KEY`    | Supabase anonymous key             | ✅       |
| `REVENUECAT_API_KEY`   | RevenueCat SDK key                 | 💎       |
| `ADMOB_APP_ID`         | Google AdMob application ID        | 📺       |

---

## 🧪 Testing

```bash
# Run all tests
flutter test

# Run with coverage
flutter test --coverage
genhtml coverage/lcov.info -o coverage/html

# Run static analysis
flutter analyze

# Format check
dart format --set-exit-if-changed .
```

### Test Structure

```
test/
├── features/
│   ├── home/
│   ├── learn/
│   ├── games/
│   └── ...
├── algorithms/
│   ├── sorting_test.dart
│   ├── searching_test.dart
│   └── ...
└── core/
    └── router_test.dart
```

---

## ⚙️ CI/CD Pipeline

The project uses **GitHub Actions** for continuous integration and delivery:

```
┌─────────────┐    ┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Push / PR  │───▶│   Analyze    │───▶│    Test      │───▶│   Build     │
│              │    │ (flutter     │    │ (flutter     │    │ (APK / IPA  │
│              │    │  analyze)    │    │  test)       │    │  -rc channel)│
└─────────────┘    └─────────────┘    └──────────────┘    └─────────────┘
                                                                    │
                                                            ┌───────▼────────┐
                                                            │  Deploy / Store │
                                                            │ (Fastlane →     │
                                                            │  Play/Internal) │
                                                            └────────────────┘
```

### Pipeline Stages

| Stage        | Trigger           | Actions                                           |
|--------------|-------------------|---------------------------------------------------|
| **Analyze**  | Every PR / push   | `flutter analyze`, `dart format --check`           |
| **Test**     | Every PR / push   | `flutter test --coverage`, coverage gate ≥ 80%     |
| **Build**    | `main` branch     | Build APK (Android) & IPA (iOS) with prod config  |
| **Deploy**   | Tag `v*`          | Fastlane → Google Play Internal / TestFlight       |

---

## 🔄 Migration Notes (React Native → Flutter)

This project was migrated from a React Native / Expo codebase. Key mapping:

| React Native           | Flutter Equivalent                     |
|------------------------|----------------------------------------|
| React Navigation       | GoRouter (`go_router`)                 |
| Redux / Zustand        | Riverpod (`flutter_riverpod`)          |
| `StyleSheet.create()`  | `ThemeData` + `AppColors` / `AppSpacing` |
| `expo-linear-gradient` | `LinearGradient` (built-in)            |
| `react-native-svg`     | `flutter_svg`                          |
| `AsyncStorage`         | `shared_preferences` + `flutter_secure_storage` |
| `supabase-js`          | `supabase_flutter`                     |
| `react-native-reanimated` | `flutter_animate`                   |
| `expo-font`            | `google_fonts` + bundled `SpaceMono`   |
| Expo EAS Build         | GitHub Actions + Fastlane              |

### What changed
- **State**: All Redux stores → Riverpod `Provider`s (co-located per feature)
- **Navigation**: Stack navigators → GoRouter with `StatefulShellRoute` for tab persistence
- **Theming**: JavaScript theme tokens → Dart `AppColors`, `AppSpacing`, `AppTheme` static classes
- **Platform code**: No more native bridges — pure Dart with `MethodChannel` only if needed
- **Performance**: No JS bridge overhead; tree shaking removes unused algorithm code

---

## 📄 License

Private / Proprietary — All rights reserved.

---

> Built with ❤️ using Flutter + Riverpod + GoRouter
