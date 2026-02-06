import React, { useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import * as Linking from 'expo-linking';

function parseParams(paramString: string): Record<string, string> {
  const params: Record<string, string> = {};
  if (!paramString) return params;

  paramString.split('&').forEach((part) => {
    const [key, value] = part.split('=');
    if (!key || value === undefined) return;
    params[key] = decodeURIComponent(value);
  });

  return params;
}

function extractAuthData(url: string): {
  accessToken?: string;
  refreshToken?: string;
  code?: string;
  error?: string;
  errorDescription?: string;
} {
  const hashIndex = url.indexOf('#');
  const queryIndex = url.indexOf('?');

  const hashParams = hashIndex !== -1 ? parseParams(url.substring(hashIndex + 1)) : {};
  const queryParams =
    queryIndex !== -1
      ? parseParams(url.substring(queryIndex + 1, hashIndex !== -1 ? hashIndex : undefined))
      : {};

  return {
    accessToken: hashParams['access_token'],
    refreshToken: hashParams['refresh_token'],
    code: queryParams['code'] || hashParams['code'],
    error: hashParams['error'] || queryParams['error'],
    errorDescription: hashParams['error_description'] || queryParams['error_description'],
  };
}

export default function Callback() {
  const router = useRouter();
  const currentUrl = Linking.useURL();
  const handledRef = useRef(false);

  useEffect(() => {
    const handleUrl = async (url: string) => {
      if (handledRef.current) return;

      const { accessToken, refreshToken, code, error, errorDescription } = extractAuthData(url);

      if (error) {
        console.error('Auth callback error from URL:', error, errorDescription);
        handledRef.current = true;
        router.replace('/(auth)/login');
        return;
      }

      // Implicit flow: tokens in the hash
      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) throw sessionError;

        handledRef.current = true;
        router.replace('/(tabs)');
        return;
      }

      // PKCE flow: authorization code in the query
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) throw exchangeError;

        handledRef.current = true;
        router.replace('/(tabs)');
        return;
      }
    };

    const handleAuth = async () => {
      try {
        // Try current URL first (works when app is already running), then initial URL (cold start).
        if (currentUrl) {
          await handleUrl(currentUrl);
          if (handledRef.current) return;
        }

        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          await handleUrl(initialUrl);
          if (handledRef.current) return;
        }
        
        // Check session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          handledRef.current = true;
          router.replace('/(tabs)');
        } else {
          handledRef.current = true;
             setTimeout(() => {
                 router.replace('/(auth)/login');
             }, 3000);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        handledRef.current = true;
        router.replace('/(auth)/login');
      }
    };

    handleAuth();
  }, [router, currentUrl]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
      <ActivityIndicator size="large" color="#10b981" />
      <Text style={{ color: '#fff', marginTop: 20 }}>Authenticating...</Text>
    </View>
  );
}
