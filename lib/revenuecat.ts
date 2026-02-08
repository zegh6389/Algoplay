// RevenueCat Integration for Algoplay Premium (Lifetime Purchase)
import { Platform } from 'react-native';
import Purchases, {
  PurchasesOfferings,
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

// RevenueCat API keys (use test key for iOS, production key for Android Play Store)
// Values confirmed from user dashboard
const REVENUECAT_IOS_API_KEY = 'test_CZqTmmrsHDGZiayzVeXtqLKGmij';
const REVENUECAT_ANDROID_API_KEY = 'goog_qnvnWdTnYRxBKkbRTNbXHfsoDsi';

// Product identifiers
export const PRODUCT_IDS = {
  LIFETIME: 'lifetime',
};

// Entitlement identifiers
export const ENTITLEMENTS = {
  PREMIUM: 'Algoplay Pro',
};

// Premium features unlocked by subscription
export const PREMIUM_FEATURES = [
  'All Algorithm Visualizations',
  'AI Code Tutor',
  'Advanced Analytics',
  'Elite Arena Access',
  'Offline Mode',
  'Interview Prep Pack',
  'Multi-Language Code',
  'Priority Support',
  'Certification Path',
];

let isConfigured = false;

/**
 * Initialize RevenueCat SDK
 * Should be called once at app startup
 */
export const initRevenueCat = async (): Promise<boolean> => {
  if (isConfigured) return true;

  try {
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.VERBOSE : LOG_LEVEL.ERROR);

    let apiKey: string;
    if (Platform.OS === 'ios') {
      apiKey = REVENUECAT_IOS_API_KEY;
    } else if (Platform.OS === 'android') {
      apiKey = REVENUECAT_ANDROID_API_KEY;
    } else {
      console.warn('RevenueCat: Unsupported platform. Running in mock mode.');
      return false;
    }

    await Purchases.configure({ apiKey });
    isConfigured = true;
    console.log('RevenueCat: SDK initialized successfully');
    return true;
  } catch (error) {
    console.error('RevenueCat: Configuration failed', error);
    return false;
  }
};

/**
 * Identify user for RevenueCat
 * Call after user logs in
 */
export const identifyUser = async (userId: string): Promise<void> => {
  if (!isConfigured) return;

  try {
    await Purchases.logIn(userId);
    console.log('RevenueCat: User identified', userId);
  } catch (error) {
    console.error('RevenueCat: Failed to identify user', error);
  }
};

/**
 * Log out user from RevenueCat
 * Call when user signs out
 */
export const logoutUser = async (): Promise<void> => {
  if (!isConfigured) return;

  try {
    await Purchases.logOut();
    console.log('RevenueCat: User logged out');
  } catch (error) {
    console.error('RevenueCat: Failed to log out user', error);
  }
};

/**
 * Get available offerings (subscription packages)
 */
export const getOfferings = async (): Promise<PurchasesOfferings | null> => {
  if (!isConfigured) {
    console.warn('RevenueCat: Not configured, returning null offerings');
    return null;
  }

  try {
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.error('RevenueCat: Failed to get offerings', error);
    return null;
  }
};

/**
 * Get current customer info including active subscriptions
 */
export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
  if (!isConfigured) return null;

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('RevenueCat: Failed to get customer info', error);
    return null;
  }
};

/**
 * Check if user has premium access via 'Algoplay Pro' entitlement
 */
export const checkPremiumAccess = async (): Promise<boolean> => {
  if (!isConfigured) return false;

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return typeof customerInfo.entitlements.active[ENTITLEMENTS.PREMIUM] !== 'undefined';
  } catch (error) {
    console.error('RevenueCat: Failed to check premium access', error);
    return false;
  }
};

/**
 * Present the RevenueCat native paywall UI
 * Make sure to configure a Paywall in the RevenueCat Dashboard first.
 * Returns true if a purchase or restore was made.
 */
export const presentPaywall = async (): Promise<boolean> => {
  try {
    const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();

    switch (paywallResult) {
      case PAYWALL_RESULT.PURCHASED:
      case PAYWALL_RESULT.RESTORED:
        return true;
      case PAYWALL_RESULT.NOT_PRESENTED:
      case PAYWALL_RESULT.ERROR:
      case PAYWALL_RESULT.CANCELLED:
      default:
        return false;
    }
  } catch (error) {
    console.error('RevenueCat: Failed to present paywall', error);
    return false;
  }
};

/**
 * Purchase a subscription package
 */
export const purchasePackage = async (
  pkg: PurchasesPackage
): Promise<{ success: boolean; isPremium: boolean; error?: string }> => {
  if (!isConfigured) {
    return {
      success: false,
      isPremium: false,
      error: 'RevenueCat not configured. Please contact support.',
    };
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isPremium = Boolean(customerInfo.entitlements.active[ENTITLEMENTS.PREMIUM]);

    return {
      success: true,
      isPremium,
    };
  } catch (error: any) {
    // User cancelled the purchase
    if (error.userCancelled) {
      return {
        success: false,
        isPremium: false,
        error: 'Purchase cancelled',
      };
    }

    console.error('RevenueCat: Purchase failed', error);
    return {
      success: false,
      isPremium: false,
      error: error.message || 'Purchase failed. Please try again.',
    };
  }
};

/**
 * Restore previous purchases
 */
export const restorePurchases = async (): Promise<{
  success: boolean;
  isPremium: boolean;
  error?: string;
}> => {
  if (!isConfigured) {
    return {
      success: false,
      isPremium: false,
      error: 'RevenueCat not configured. Please contact support.',
    };
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPremium = Boolean(customerInfo.entitlements.active[ENTITLEMENTS.PREMIUM]);

    return {
      success: true,
      isPremium,
    };
  } catch (error: any) {
    console.error('RevenueCat: Restore failed', error);
    return {
      success: false,
      isPremium: false,
      error: error.message || 'Restore failed. Please try again.',
    };
  }
};

/**
 * Format price for display
 */
export const formatPrice = (pkg: PurchasesPackage): string => {
  return pkg.product.priceString;
};

// Mock data for development/demo mode when RevenueCat is not configured
export interface MockPackage {
  identifier: string;
  packageType: 'LIFETIME';
  product: {
    identifier: string;
    title: string;
    description: string;
    priceString: string;
    price: number;
  };
}

export const getMockOfferings = (): { lifetime: MockPackage } => {
  return {
    lifetime: {
      identifier: '$rc_lifetime',
      packageType: 'LIFETIME',
      product: {
        identifier: PRODUCT_IDS.LIFETIME,
        title: 'Algoplay Pro — Lifetime',
        description: 'One-time purchase. Unlimited access forever.',
        priceString: '$9.99',
        price: 9.99,
      },
    },
  };
};

/**
 * Check if RevenueCat is configured
 */
export const isRevenueCatConfigured = (): boolean => {
  return isConfigured;
};
