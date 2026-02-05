// RevenueCat Integration for AlgoVerse Premium Subscriptions
import { Platform } from 'react-native';
import Purchases, {
  PurchasesOfferings,
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';

// Product identifiers
export const PRODUCT_IDS = {
  MONTHLY: 'algoverse_premium_monthly',
  YEARLY: 'algoverse_premium_yearly',
};

// Entitlement identifiers
export const ENTITLEMENTS = {
  PREMIUM: 'premium',
};

// Package lookup keys
export const PACKAGE_KEYS = {
  MONTHLY: '$rc_monthly',
  YEARLY: '$rc_annual',
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

  const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;

  if (!apiKey) {
    console.warn('RevenueCat: API key not configured. Running in mock mode.');
    return false;
  }

  try {
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
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
 * Check if user has premium access
 */
export const checkPremiumAccess = async (): Promise<boolean> => {
  if (!isConfigured) return false;

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return Boolean(customerInfo.entitlements.active[ENTITLEMENTS.PREMIUM]);
  } catch (error) {
    console.error('RevenueCat: Failed to check premium access', error);
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

/**
 * Get subscription period text
 */
export const getSubscriptionPeriod = (pkg: PurchasesPackage): string => {
  const identifier = pkg.packageType;
  switch (identifier) {
    case 'MONTHLY':
      return 'month';
    case 'ANNUAL':
      return 'year';
    case 'WEEKLY':
      return 'week';
    default:
      return 'period';
  }
};

// Mock data for development/demo mode when RevenueCat is not configured
export interface MockPackage {
  identifier: string;
  packageType: 'MONTHLY' | 'ANNUAL';
  product: {
    identifier: string;
    title: string;
    description: string;
    priceString: string;
    price: number;
  };
}

export const getMockOfferings = (): { monthly: MockPackage; yearly: MockPackage } => {
  return {
    monthly: {
      identifier: PACKAGE_KEYS.MONTHLY,
      packageType: 'MONTHLY',
      product: {
        identifier: PRODUCT_IDS.MONTHLY,
        title: 'AlgoVerse Premium Monthly',
        description: 'Full access to all premium features',
        priceString: '$9.99',
        price: 9.99,
      },
    },
    yearly: {
      identifier: PACKAGE_KEYS.YEARLY,
      packageType: 'ANNUAL',
      product: {
        identifier: PRODUCT_IDS.YEARLY,
        title: 'AlgoVerse Premium Yearly',
        description: '2 months free - best value!',
        priceString: '$79.99',
        price: 79.99,
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
