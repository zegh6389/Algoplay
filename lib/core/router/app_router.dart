import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'tab_shell.dart';
import '../../features/home/presentation/home_page.dart' show HomePage;
import '../../features/learn/presentation/learn_page.dart' show LearnPage;
import '../../features/play/presentation/play_page.dart' show PlayPage;
import '../../features/stats/presentation/stats_page.dart' show StatsPage;
import '../../features/profile/presentation/profile_page.dart' show ProfilePage;
import '../../features/visualizer/presentation/algorithm_visualizer_page.dart' show AlgorithmVisualizerPage;
import '../../features/visualizer/presentation/dp_visualizer_page.dart' show DPVisualizerPage;
import '../../features/visualizer/presentation/tree_visualizer_page.dart' show TreeVisualizerPage;
import '../../features/the-sorter/presentation/the_sorter_page.dart' show TheSorterPage;
import '../../features/race-mode/presentation/race_mode_page.dart' show RaceModePage;
import '../../features/battle_arena/presentation/battle_arena_page.dart' show BattleArenaPage;
import '../../features/grid_escape/presentation/grid_escape_page.dart' show GridEscapePage;
import '../../features/playground/presentation/playground_page.dart' show PlaygroundPage;
import '../../features/tutor/presentation/tutor_page.dart' show TutorPage;
import '../../features/leaderboard/presentation/leaderboard_page.dart' show LeaderboardPage;
import '../../features/premium/presentation/premium_page.dart' show PremiumPage;
import '../../features/arena/presentation/elite_arena_page.dart' show EliteArenaPage;
import '../../features/cheatsheet/presentation/cheatsheet_page.dart' show CheatsheetPage;
import '../../features/dashboard/presentation/dashboard_page.dart' show DashboardPage;

// ── GoRouter configuration ─────────────────────────────────────────────────

final router = GoRouter(
  initialLocation: '/home',
  routes: [
    // ── Tabbed shell (bottom nav) ──
    StatefulShellRoute.indexedStack(
      builder: (context, state, navigationShell) {
        return TabShellWidget(navigationShell: navigationShell);
      },
      branches: [
        // Tab 0 — Home
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/home',
              builder: (context, state) => const HomePage(),
            ),
          ],
        ),
        // Tab 1 — Learn
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/learn',
              builder: (context, state) => const LearnPage(),
            ),
          ],
        ),
        // Tab 2 — Play
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/play',
              builder: (context, state) => const PlayPage(),
            ),
          ],
        ),
        // Tab 3 — Stats
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/stats',
              builder: (context, state) => const StatsPage(),
            ),
          ],
        ),
        // Tab 4 — Profile
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/profile',
              builder: (context, state) => const ProfilePage(),
            ),
          ],
        ),
      ],
    ),

    // ── Visualizer routes (fullscreen, no tab bar) ──
    GoRoute(
      path: '/visualizer/dp',
      builder: (context, state) => const DPVisualizerPage(),
    ),
    GoRoute(
      path: '/visualizer/tree',
      builder: (context, state) => const TreeVisualizerPage(),
    ),
    GoRoute(
      path: '/visualizer/:algorithmId',
      builder: (context, state) {
        final algorithmId = state.pathParameters['algorithmId']!;
        return AlgorithmVisualizerPage(algorithmId: algorithmId);
      },
    ),

    // ── Game routes (fullscreen, no tab bar) ──
    GoRoute(
      path: '/game/battle-arena',
      builder: (context, state) => const BattleArenaPage(),
    ),
    GoRoute(
      path: '/game/grid-escape',
      builder: (context, state) => const GridEscapePage(),
    ),
    GoRoute(
      path: '/game/the-sorter',
      builder: (context, state) => const TheSorterPage(),
    ),
    GoRoute(
      path: '/game/race-mode',
      builder: (context, state) => const RaceModePage(),
    ),

    // ── Top-level fullscreen routes ──
    GoRoute(
      path: '/playground',
      builder: (context, state) => const PlaygroundPage(),
    ),
    GoRoute(
      path: '/tutor',
      builder: (context, state) => const TutorPage(),
    ),
    GoRoute(
      path: '/leaderboard',
      builder: (context, state) => const LeaderboardPage(),
    ),
    GoRoute(
      path: '/premium',
      builder: (context, state) => const PremiumPage(),
    ),
    GoRoute(
      path: '/elite-arena',
      builder: (context, state) => const EliteArenaPage(),
    ),
    GoRoute(
      path: '/cheatsheet',
      builder: (context, state) => const CheatsheetPage(),
    ),
    GoRoute(
      path: '/dashboard',
      builder: (context, state) => const DashboardPage(),
    ),
  ],
);
