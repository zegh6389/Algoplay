import 'package:flutter/foundation.dart';

@immutable
class SubscriptionState {
  final bool isPremium;
  final bool isLoading;
  final bool isInitialized;
  final int totalAdsWatched;

  const SubscriptionState({
    this.isPremium = false,
    this.isLoading = false,
    this.isInitialized = false,
    this.totalAdsWatched = 0,
  });

  SubscriptionState copyWith({
    bool? isPremium,
    bool? isLoading,
    bool? isInitialized,
    int? totalAdsWatched,
  }) {
    return SubscriptionState(
      isPremium: isPremium ?? this.isPremium,
      isLoading: isLoading ?? this.isLoading,
      isInitialized: isInitialized ?? this.isInitialized,
      totalAdsWatched: totalAdsWatched ?? this.totalAdsWatched,
    );
  }

  factory SubscriptionState.fromJson(Map<String, dynamic> json) {
    return SubscriptionState(
      isPremium: json['isPremium'] as bool? ?? false,
      isLoading: json['isLoading'] as bool? ?? false,
      isInitialized: json['isInitialized'] as bool? ?? false,
      totalAdsWatched: json['totalAdsWatched'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'isPremium': isPremium,
        'isLoading': isLoading,
        'isInitialized': isInitialized,
        'totalAdsWatched': totalAdsWatched,
      };

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is SubscriptionState &&
          runtimeType == other.runtimeType &&
          isPremium == other.isPremium &&
          isLoading == other.isLoading &&
          isInitialized == other.isInitialized &&
          totalAdsWatched == other.totalAdsWatched;

  @override
  int get hashCode =>
      Object.hash(isPremium, isLoading, isInitialized, totalAdsWatched);
}
