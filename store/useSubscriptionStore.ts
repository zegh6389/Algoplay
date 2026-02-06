// Subscription Store for Premium Features
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initRevenueCat,
  checkPremiumAccess,
  getOfferings,
  restorePurchases,
  identifyUser,
  logoutUser,
  isRevenueCatConfigured,
  getMockOfferings,
  presentPaywall,
  PREMIUM_FEATURES,
  type MockPackage,
} from '@/lib/revenuecat';
import { PurchasesOfferings, PurchasesPackage } from 'react-native-purchases';

interface SubscriptionState {
  // State
  isPremium: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  offerings: PurchasesOfferings | null;
  mockOfferings: { lifetime: MockPackage } | null;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  checkPremiumStatus: () => Promise<boolean>;
  refreshOfferings: () => Promise<void>;
  restorePurchases: () => Promise<{ success: boolean; message: string }>;
  showPaywall: () => Promise<boolean>;
  setUserIdentity: (userId: string) => Promise<void>;
  clearUserIdentity: () => Promise<void>;
  clearError: () => void;

  // Internal — only called by PremiumGate after server verification
  _syncPremium: (isPremium: boolean) => void;

  // Feature checks
  canAccessFeature: (feature: string) => boolean;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      isPremium: false,
      isLoading: false,
      isInitialized: false,
      offerings: null,
      mockOfferings: null,
      error: null,

      initialize: async () => {
        if (get().isInitialized) return;

        set({ isLoading: true, error: null });

        try {
          const configured = await initRevenueCat();

          if (configured) {
            // RevenueCat is configured, get real data
            const [isPremium, offerings] = await Promise.all([
              checkPremiumAccess(),
              getOfferings(),
            ]);

            set({
              isPremium,
              offerings,
              mockOfferings: null,
              isInitialized: true,
              isLoading: false,
            });
          } else {
            // Running in mock/demo mode
            set({
              isPremium: false,
              offerings: null,
              mockOfferings: getMockOfferings(),
              isInitialized: true,
              isLoading: false,
            });
          }
        } catch (error: any) {
          console.error('Subscription initialization failed:', error);
          set({
            error: error.message || 'Failed to initialize subscriptions',
            isLoading: false,
            isInitialized: true,
            mockOfferings: getMockOfferings(),
          });
        }
      },

      checkPremiumStatus: async () => {
        if (!isRevenueCatConfigured()) {
          return get().isPremium;
        }

        try {
          const isPremium = await checkPremiumAccess();
          set({ isPremium });
          return isPremium;
        } catch (error) {
          console.error('Failed to check premium status:', error);
          return get().isPremium;
        }
      },

      refreshOfferings: async () => {
        if (!isRevenueCatConfigured()) {
          set({ mockOfferings: getMockOfferings() });
          return;
        }

        set({ isLoading: true });

        try {
          const offerings = await getOfferings();
          set({ offerings, isLoading: false });
        } catch (error: any) {
          set({
            error: error.message || 'Failed to load offerings',
            isLoading: false,
          });
        }
      },

      restorePurchases: async () => {
        if (!isRevenueCatConfigured()) {
          return {
            success: false,
            message: 'Subscriptions not configured. Running in demo mode.',
          };
        }

        set({ isLoading: true, error: null });

        try {
          const result = await restorePurchases();
          set({
            isPremium: result.isPremium,
            isLoading: false,
          });

          return {
            success: result.success,
            message: result.isPremium
              ? 'Premium access restored successfully!'
              : 'No previous purchases found.',
          };
        } catch (error: any) {
          set({
            error: error.message || 'Restore failed',
            isLoading: false,
          });
          return {
            success: false,
            message: error.message || 'Failed to restore purchases.',
          };
        }
      },

      setUserIdentity: async (userId: string) => {
        await identifyUser(userId);
        // Refresh premium status after identifying user
        await get().checkPremiumStatus();
      },

      showPaywall: async () => {
        if (!isRevenueCatConfigured()) {
          return false;
        }
        try {
          const purchased = await presentPaywall();
          if (purchased) {
            set({ isPremium: true });
          }
          return purchased;
        } catch (error) {
          console.error('Failed to present paywall:', error);
          return false;
        }
      },

      clearUserIdentity: async () => {
        await logoutUser();
        set({ isPremium: false });
      },

      _syncPremium: (isPremium: boolean) => {
        set({ isPremium });
      },

      clearError: () => {
        set({ error: null });
      },

      canAccessFeature: (feature: string) => {
        const { isPremium } = get();

        // All features require premium
        if (PREMIUM_FEATURES.includes(feature)) {
          return isPremium;
        }

        // Default to accessible if not a premium feature
        return true;
      },
    }),
    {
      name: 'algoverse-subscription',
      storage: createJSONStorage(() => AsyncStorage),
      // Never persist isPremium — always verify from RevenueCat server
      partialize: () => ({}),
    }
  )
);

// Hook to check specific premium features
export const usePremiumFeature = (feature: string): boolean => {
  return useSubscriptionStore((state) => state.canAccessFeature(feature));
};
