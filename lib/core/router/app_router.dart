import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'tab_shell.dart';
import '../../features/learn/presentation/learn_page.dart' show LearnPage;

// ── Placeholder pages ──────────────────────────────────────────────────────

class _PlaceholderPage extends StatelessWidget {
  final String title;
  final Color? color;

  const _PlaceholderPage({required this.title, this.color});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: color,
      appBar: AppBar(title: Text(title)),
      body: Center(
        child: Text(
          title,
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                color: color != null ? Colors.white : null,
              ),
        ),
      ),
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});
  @override
  Widget build(BuildContext context) =>
      const _PlaceholderPage(title: 'Home', color: null);
}

class PlayPage extends StatelessWidget {
  const PlayPage({super.key});
  @override
  Widget build(BuildContext context) =>
      const _PlaceholderPage(title: 'Play', color: null);
}

class StatsPage extends StatelessWidget {
  const StatsPage({super.key});
  @override
  Widget build(BuildContext context) =>
      const _PlaceholderPage(title: 'Stats', color: null);
}

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});
  @override
  Widget build(BuildContext context) =>
      const _PlaceholderPage(title: 'Profile', color: null);
}

class AlgorithmVisualizerPage extends StatelessWidget {
  final String algorithmId;
  const AlgorithmVisualizerPage({super.key, required this.algorithmId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Visualizer: $algorithmId')),
      body: Center(
        child: Text(
          'Algorithm Visualizer\n$algorithmId',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.headlineMedium,
        ),
      ),
    );
  }
}

class DPVisualizerPage extends StatelessWidget {
  const DPVisualizerPage({super.key});
  @override
  Widget build(BuildContext context) =>
      const _PlaceholderPage(title: 'DP Visualizer', color: Colors.indigo);
}

class TreeVisualizerPage extends StatelessWidget {
  const TreeVisualizerPage({super.key});
  @override
  Widget build(BuildContext context) =>
      const _PlaceholderPage(title: 'Tree Visualizer', color: Colors.teal);
}

class BattleArenaPage extends StatelessWidget {
  const BattleArenaPage({super.key});
  @override
  Widget build(BuildContext context) => const _PlaceholderPage(
      title: 'Battle Arena', color: Colors.deepPurple);
}

class GridEscapePage extends StatelessWidget {
  const GridEscapePage({super.key});
  @override
  Widget build(BuildContext context) =>
      const _PlaceholderPage(title: 'Grid Escape', color: Colors.green);
}

class TheSorterPage extends StatelessWidget {
  const TheSorterPage({super.key});
  @override
  Widget build(BuildContext context) =>
      const _PlaceholderPage(title: 'The Sorter', color: Colors.orange);
}

class RaceModePage extends StatelessWidget {
  const RaceModePage({super.key});
  @override
  Widget build(BuildContext context) =>
      const _PlaceholderPage(title: 'Race Mode', color: Colors.red);
}

class PlaygroundPage extends StatelessWidget {
  const PlaygroundPage({super.key});
  @override
  Widget build(BuildContext context) =>
      const _PlaceholderPage(title: 'Playground', color: Colors.blueGrey);
}

class TutorPage extends StatelessWidget {
  const TutorPage({super.key});
  @override
  Widget build(BuildContext context) =>
      const _PlaceholderPage(title: 'Tutor', color: Colors.purple);
}

class LeaderboardPage extends StatelessWidget {
  const LeaderboardPage({super.key});
  @override
  Widget build(BuildContext context) =>
      const _PlaceholderPage(title: 'Leaderboard', color: Colors.amber);
}

class PremiumPage extends StatelessWidget {
  const PremiumPage({super.key});
  @override
  Widget build(BuildContext context) =>
      const _PlaceholderPage(title: 'Premium', color: Colors.deepOrange);
}

class EliteArenaPage extends StatelessWidget {
  const EliteArenaPage({super.key});
  @override
  Widget build(BuildContext context) =>
      const _PlaceholderPage(title: 'Elite Arena', color: Colors.brown);
}

class CheatsheetPage extends StatelessWidget {
  const CheatsheetPage({super.key});
  @override
  Widget build(BuildContext context) =>
      const _PlaceholderPage(title: 'Cheatsheet', color: Colors.cyan);
}

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});
  @override
  Widget build(BuildContext context) =>
      const _PlaceholderPage(title: 'Dashboard', color: Colors.blue);
}

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
