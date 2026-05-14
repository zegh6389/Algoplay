import 'package:shared_preferences/shared_preferences.dart';

class FeatureTourService {
  FeatureTourService._();

  static final FeatureTourService instance = FeatureTourService._();

  static const String mainTourSeenKey = 'algoplay_guided_tour_seen_v1';

  Future<bool> hasSeenMainTour() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(mainTourSeenKey) ?? false;
  }

  Future<void> markMainTourSeen() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(mainTourSeenKey, true);
  }

  Future<void> resetMainTour() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(mainTourSeenKey);
  }
}
