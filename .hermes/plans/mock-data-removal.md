# Mock Data Removal & Real Implementation Plan

## Audit Summary
All 5 game/feature pages use hardcoded mock data with no persistence:
- **Stats**: hardcoded activity hours (Mon-Sun), mocked "today = Saturday"
- **Leaderboard**: 15 hardcoded `_mockLeaderboard` entries (Alex Chen, Sarah Kim...)
- **Arena (Elite)**: hardcoded `_mockArenaPlayers` + `_mockMatchHistory`
- **Battle Arena**: hardcoded `_mockQuestions` (5 algorithm quiz questions)
- **Grid Escape**: hardcoded `_mockLevels` (10 level configs)
- **Play page**: 3 navigation TODOs (random algo, practice mode, daily challenge)
- **Arena page**: 3 navigation TODOs (tournament, daily sprint, rewards)
- **IAP service**: TODO for server-side receipt validation

No feature has a data/provider layer — all are presentation-only (`lib/features/X/presentation/`).

## Tasks

### T1: Stats — Real Activity Tracking
- Create `lib/features/stats/data/stats_repository.dart`
  - SharedPreferences-backed `StatsRepository` with `UserStats` model
  - Track: algorithmsCompleted, totalXP, streakDays, activityMap (date→minutes), categoryBreakdown
- Replace mock data in `stats_page.dart` with real repository reads
- Tests: `test/features/stats/stats_repository_test.dart`

### T2: Leaderboard — Local Scoreboard
- Create `lib/features/leaderboard/data/leaderboard_repository.dart`
  - `LeaderboardRepository` stores user scores + generates bot entries
  - Blend user's real XP/rank with generated "players" for a populated feel
- Replace `_mockLeaderboard` with repository data
- Tests: `test/features/leaderboard/leaderboard_repository_test.dart`

### T3: Arena — Real Match Tracking
- Create `lib/features/arena/data/arena_repository.dart`
  - Track: matchHistory (wins/losses/scores), arenaRank, recentOpponents
- Replace `_mockArenaPlayers` + `_mockMatchHistory`
- Wire TODO navigations (tournament, daily sprint, rewards → existing routes)
- Tests: `test/features/arena/arena_repository_test.dart`

### T4: Battle Arena — Question Bank from Algorithm Data
- Create `lib/features/battle_arena/data/question_bank.dart`
  - Generate questions dynamically from `algorithm_data.dart` (complexity, properties)
  - Mix categories: sorting, searching, graphs, DP, greedy, trees
- Replace `_mockQuestions` with `QuestionBank.generate()`
- Tests: `test/features/battle_arena/question_bank_test.dart`

### T5: Grid Escape — Procedural Level Generation
- Create `lib/features/grid_escape/data/level_generator.dart`
  - `LevelGenerator` creates levels procedurally (grid size, walls, difficulty curve)
  - Track completed levels via SharedPreferences
- Replace `_mockLevels` with generated levels
- Tests: `test/features/grid_escape/level_generator_test.dart`

### T6: Play Page — Wire Navigation TODOs
- Random algorithm → pick random from `algorithm_data.dart` → push `/visualizer/{id}`
- Practice mode → push `/game/race-mode`
- Daily challenge → push `/game/battle-arena` (reuse battle as daily)

### T7: Integration — Connect XP/Progress Across Features
- Wire stats → leaderboard (XP feeds into rank)
- Wire battle_arena / grid_escape / race-mode → stats (completions update XP)
- Ensure all SharedPreferences keys are namespaced (`algoplay_`)
