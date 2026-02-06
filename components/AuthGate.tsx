import React, { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/components/AuthProvider';
import { useAppStore } from '@/store/useAppStore';

/**
 * Centralized auth routing:
 * - Unauthenticated users can only access `(auth)` routes and `auth/callback`.
 * - Authenticated (or guest) users are redirected away from `(auth)` to `(tabs)`.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { session, isReady } = useAuth();
  const isGuest = useAppStore((s) => s.guestState.isGuest);

  useEffect(() => {
    // Wait until the initial session check completes so we don't bounce users.
    if (!isReady) return;

    const isAuthed = Boolean(session) || isGuest;
    const inAuthGroup = segments[0] === '(auth)';
    const isAuthCallbackRoute = segments[0] === 'auth' && segments[1] === 'callback';

    if (!isAuthed) {
      if (!inAuthGroup && !isAuthCallbackRoute) {
        router.replace('/(auth)/login');
      }
      return;
    }

    // If the user is authed (or in guest mode), keep them out of auth screens.
    if (inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isReady, session, isGuest, segments, router]);

  return <>{children}</>;
}
