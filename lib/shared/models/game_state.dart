import 'package:flutter/foundation.dart';

@immutable
class HighScores {
  final int sorterBest;
  final int gridEscapeWins;
  final int gridEscapeBestScore;
  final int battleArenaWins;
  final int battleArenaBestScore;
  final int raceModeBest;

  const HighScores({
    this.sorterBest = 0,
    this.gridEscapeWins = 0,
    this.gridEscapeBestScore = 0,
    this.battleArenaWins = 0,
    this.battleArenaBestScore = 0,
    this.raceModeBest = 0,
  });

  HighScores copyWith({
    int? sorterBest,
    int? gridEscapeWins,
    int? gridEscapeBestScore,
    int? battleArenaWins,
    int? battleArenaBestScore,
    int? raceModeBest,
  }) {
    return HighScores(
      sorterBest: sorterBest ?? this.sorterBest,
      gridEscapeWins: gridEscapeWins ?? this.gridEscapeWins,
      gridEscapeBestScore: gridEscapeBestScore ?? this.gridEscapeBestScore,
      battleArenaWins: battleArenaWins ?? this.battleArenaWins,
      battleArenaBestScore: battleArenaBestScore ?? this.battleArenaBestScore,
      raceModeBest: raceModeBest ?? this.raceModeBest,
    );
  }

  factory HighScores.fromJson(Map<String, dynamic> json) {
    return HighScores(
      sorterBest: json['sorterBest'] as int? ?? 0,
      gridEscapeWins: json['gridEscapeWins'] as int? ?? 0,
      gridEscapeBestScore: json['gridEscapeBestScore'] as int? ?? 0,
      battleArenaWins: json['battleArenaWins'] as int? ?? 0,
      battleArenaBestScore: json['battleArenaBestScore'] as int? ?? 0,
      raceModeBest: json['raceModeBest'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'sorterBest': sorterBest,
        'gridEscapeWins': gridEscapeWins,
        'gridEscapeBestScore': gridEscapeBestScore,
        'battleArenaWins': battleArenaWins,
        'battleArenaBestScore': battleArenaBestScore,
        'raceModeBest': raceModeBest,
      };

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is HighScores &&
          runtimeType == other.runtimeType &&
          sorterBest == other.sorterBest &&
          gridEscapeWins == other.gridEscapeWins &&
          gridEscapeBestScore == other.gridEscapeBestScore &&
          battleArenaWins == other.battleArenaWins &&
          battleArenaBestScore == other.battleArenaBestScore &&
          raceModeBest == other.raceModeBest;

  @override
  int get hashCode => Object.hash(
        sorterBest,
        gridEscapeWins,
        gridEscapeBestScore,
        battleArenaWins,
        battleArenaBestScore,
        raceModeBest,
      );
}

@immutable
class GameState {
  final HighScores highScores;
  final bool dailyChallengeCompleted;
  final String? dailyChallengeDate;

  const GameState({
    this.highScores = const HighScores(),
    this.dailyChallengeCompleted = false,
    this.dailyChallengeDate,
  });

  GameState copyWith({
    HighScores? highScores,
    bool? dailyChallengeCompleted,
    String? dailyChallengeDate,
  }) {
    return GameState(
      highScores: highScores ?? this.highScores,
      dailyChallengeCompleted:
          dailyChallengeCompleted ?? this.dailyChallengeCompleted,
      dailyChallengeDate: dailyChallengeDate ?? this.dailyChallengeDate,
    );
  }

  factory GameState.fromJson(Map<String, dynamic> json) {
    return GameState(
      highScores: json['highScores'] != null
          ? HighScores.fromJson(json['highScores'] as Map<String, dynamic>)
          : const HighScores(),
      dailyChallengeCompleted:
          json['dailyChallengeCompleted'] as bool? ?? false,
      dailyChallengeDate: json['dailyChallengeDate'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'highScores': highScores.toJson(),
        'dailyChallengeCompleted': dailyChallengeCompleted,
        'dailyChallengeDate': dailyChallengeDate,
      };

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is GameState &&
          runtimeType == other.runtimeType &&
          highScores == other.highScores &&
          dailyChallengeCompleted == other.dailyChallengeCompleted &&
          dailyChallengeDate == other.dailyChallengeDate;

  @override
  int get hashCode =>
      Object.hash(highScores, dailyChallengeCompleted, dailyChallengeDate);
}
