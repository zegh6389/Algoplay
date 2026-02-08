// AdService — Google AdMob Rewarded Ads for Algoplay
// Free users can watch video ads to unlock premium features temporarily.
// Premium subscribers never see ads.

import { Platform } from 'react-native';
import {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

// ─── Ad Unit IDs ────────────────────────────────────────────────
// Use test ads in dev/preview builds. Real ads in production.
// New AdMob accounts can take 24-48h before real ads start serving.
const USE_TEST_ADS = __DEV__ || !process.env.EXPO_PUBLIC_USE_REAL_ADS;

const REWARDED_AD_UNIT_ID = USE_TEST_ADS
  ? TestIds.REWARDED
  : Platform.select({
      android: 'ca-app-pub-8157621642469961/5232947971',
      ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // TODO: replace with iOS ad unit
      default: TestIds.REWARDED,
    })!;

// ─── State ──────────────────────────────────────────────────────
let currentAd: RewardedAd | null = null;
let isAdLoading = false;

// ─── Helpers ────────────────────────────────────────────────────

/** Check if ads are supported on this platform */
export const canShowAd = (): boolean => {
  if (Platform.OS === 'web') return false;
  return true;
};

/** Preload a rewarded ad so it's ready when the user taps "Watch Ad" */
export const preloadRewardedAd = (): void => {
  if (Platform.OS === 'web' || isAdLoading || currentAd) return;

  try {
    isAdLoading = true;
    const ad = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID, {
      keywords: ['education', 'programming', 'algorithms', 'computer science'],
    });

    const unsubLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      currentAd = ad;
      isAdLoading = false;
      unsubLoaded();
    });

    const unsubError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
      console.warn('[AdService] Failed to load rewarded ad:', error);
      currentAd = null;
      isAdLoading = false;
      unsubError();
    });

    ad.load();
  } catch (err) {
    console.warn('[AdService] Ad preload error:', err);
    isAdLoading = false;
  }
};

/**
 * Show a rewarded video ad.
 *
 * Returns a promise that resolves with:
 * - `{ rewarded: true }` if user watched the full ad
 * - `{ rewarded: false, reason: string }` otherwise
 */
export const showRewardedAd = (): Promise<{
  rewarded: boolean;
  reason?: string;
}> => {
  return new Promise((resolve) => {
    if (Platform.OS === 'web') {
      resolve({ rewarded: false, reason: 'Ads are not available on web.' });
      return;
    }

    if (!canShowAd()) {
      resolve({
        rewarded: false,
        reason: `Please wait a few minutes before watching another ad.`,
      });
      return;
    }

    // If no ad preloaded, load one on the fly
    const ad = currentAd ?? RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID, {
      keywords: ['education', 'programming', 'algorithms'],
    });

    let hasResolved = false;
    const finish = (result: { rewarded: boolean; reason?: string }) => {
      if (hasResolved) return;
      hasResolved = true;
      currentAd = null;
      // Preload next ad for future use
      setTimeout(preloadRewardedAd, 2000);
      resolve(result);
    };

    // Listen for reward earned
    const unsubEarned = ad.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        unsubEarned();
        finish({ rewarded: true });
      }
    );

    // Listen for close without reward
    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      unsubClosed();
      // Small delay to let EARNED_REWARD fire first if applicable
      setTimeout(() => {
        finish({ rewarded: false, reason: 'Ad was closed before completion.' });
      }, 300);
    });

    // Listen for errors
    const unsubError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
      unsubError();
      finish({
        rewarded: false,
        reason: 'Unable to load the ad. Please try again later.',
      });
    });

    if (currentAd) {
      // Already loaded — show immediately
      currentAd.show();
    } else {
      // Need to load first
      const unsubLoaded = ad.addAdEventListener(
        RewardedAdEventType.LOADED,
        () => {
          unsubLoaded();
          ad.show();
        }
      );
      ad.load();
    }
  });
};

/** Whether an ad is currently preloaded and ready */
export const isAdReady = (): boolean => currentAd !== null;

/** Whether an ad is in the process of loading */
export const isAdLoading_ = (): boolean => isAdLoading;
