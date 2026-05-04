import 'package:flutter/foundation.dart';

@immutable
class HighScores {
  final int sorterBest;
  final int gridEscapeWins;

  const HighScores({
    this.sorterBest = 0,
    this.gridEscapeWins = 0,
  });

  HighScores copyWith({
    int? sorterBest,
    int? gridEscapeWins,
  }) {
    return HighScores(
      sorterBest: sorterBest ?? this.sorterBest,
      gridEscapeWins: gridEscapeWins ?? this.gridEscapeWins,
    );
  }

  factory HighScores.fromJson(Map<String, dynamic> json) {
    return HighScores(
      sorterBest: json['sorterBest'] as int? ?? 0,
      gridEscapeWins: json['gridEscapeWins'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'sorterBest': sorterBest,
        'gridEscapeWins': gridEscapeWins,
      };

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is HighScores &&
          runtimeType == other.runtimeType &&
          sorterBest == other.sorterBest &&
          gridEscapeWins == other.gridEscapeWins;

  @override
  int get hashCode => Object.hash(sorterBest, gridEscapeWins);
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
