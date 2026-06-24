import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/stats/data/stats_repository.dart';
import '../providers/app_providers.dart';

/// Which mini-game a recorded result belongs to.
enum GameId {
  sorter,
  gridEscape,
  battleArena,
  raceMode,
  tutor,
}

/// Aggregate outcome of one finished mini-game session.
///
/// [score] is the game-specific score (points), [xpReward] is the XP to award,
/// [activityMinutes] is the (rough) play-time to log for the activity/streak
/// graph, and [category] is the [StatsRepository] category label.
class GameResult {
  final GameId game;
  final bool won;
  final int score;
  final int xpReward;
  final int activityMinutes;
  final String category;

  const GameResult({
    required this.game,
    required this.won,
    this.score = 0,
    this.xpReward = 0,
    this.activityMinutes = 0,
    required this.category,
  });
}

/// Single canonical funnel for persisting a finished game's outcome.
///
/// Every mini-game should call [record] exactly once when a session ends. This
/// fans the result out to all three persistence stores so they stay consistent:
///
///  * **Live XP / level / streak** → [UserProgressNotifier.addXP]
///    (persisted under `algoplay_user_progress`).
///  * **Activity log + Stats-page "Total XP"** → [StatsRepository]
///    (persisted under `algoplay_stats`). Writing XP here too keeps the Stats
///    screen's "Total XP" card in sync with the live XP total.
///  * **Per-game high scores / win counts** → [GameStateNotifier]
///    (persisted under `algoplay_game_state`).
///
/// This mirrors the reference pattern originally hand-coded in The Sorter's
/// `_recordGameResult`, but centralizes it so no game can forget a store.
class GameResultRecorder {
  GameResultRecorder._();

  static final StatsRepository _stats = StatsRepository();

  static Future<void> record(WidgetRef ref, GameResult result) async {
    // 1. Live XP / level.
    if (result.xpReward > 0) {
      ref.read(userProgressProvider.notifier).addXP(result.xpReward);
    }

    // 2. Activity log (streak graph) + Stats-page XP sync.
    if (result.activityMinutes > 0) {
      await _stats.recordActivity(result.activityMinutes, result.category);
    }
    if (result.xpReward > 0) {
      await _stats.addXP(result.xpReward);
    }

    // 3. Per-game high scores / win counts.
    final gameState = ref.read(gameStateProvider.notifier);
    switch (result.game) {
      case GameId.sorter:
        gameState.updateSorterBest(result.score);
        break;
      case GameId.gridEscape:
        gameState.updateGridEscapeBest(result.score);
        if (result.won) gameState.incrementGridEscapeWins();
        break;
      case GameId.battleArena:
        gameState.updateBattleArenaBest(result.score);
        if (result.won) gameState.incrementBattleArenaWins();
        break;
      case GameId.raceMode:
        gameState.updateRaceModeBest(result.score);
        break;
      case GameId.tutor:
        // No high-score slot for tutor sessions; XP/activity only.
        break;
    }
  }
}
