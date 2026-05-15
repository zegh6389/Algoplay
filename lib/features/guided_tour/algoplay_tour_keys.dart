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

  /// Maps bottom-nav tab index to StatefulNavigationShell branch index.
  /// Bottom nav order: 0=Lessons(branch 0), 1=Explore(branch 1), 2=Play(branch 2), 3=Stats(branch 3), 4=Profile(branch 4).
  static int branchIndexForTab(int tabIndex) {
    switch (tabIndex) {
      case 0:
        return 0; // Lessons tab → Learn branch
      case 1:
        return 1; // Explore tab → Home branch
      case 2:
        return 2; // Play tab → Play branch
      case 3:
        return 3; // Stats tab → Stats branch
      case 4:
        return 4; // Profile tab → Profile branch
      default:
        return 0;
    }
  }
}
