import 'package:flutter/material.dart';

class AlgoPlayTourKeys {
  static final GlobalKey progressKey = GlobalKey();
  static final GlobalKey dailyChallengeKey = GlobalKey();
  static final GlobalKey learningModulesKey = GlobalKey();
  static final GlobalKey practiceProblemsKey = GlobalKey();
  static final GlobalKey profileStreakKey = GlobalKey();

  static final GlobalKey lessonsTabKey = GlobalKey();
  static final GlobalKey exploreTabKey = GlobalKey();
  static final GlobalKey playTabKey = GlobalKey();
  static final GlobalKey statsTabKey = GlobalKey();
  static final GlobalKey profileTabKey = GlobalKey();

  static GlobalKey tabKeyForIndex(int index) {
    switch (index) {
      case 0:
        return lessonsTabKey;
      case 1:
        return exploreTabKey;
      case 2:
        return playTabKey;
      case 3:
        return statsTabKey;
      case 4:
        return profileTabKey;
      default:
        return lessonsTabKey;
    }
  }
}
