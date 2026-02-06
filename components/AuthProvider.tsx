
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Alert, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

// Ensure WebBrowser works correctly for OAuth
WebBrowser.maybeCompleteAuthSession();

type AuthContextType = {
  session: Session | null;
  user: User | null;
  // True once we've completed the initial `getSession()` check.
  isReady: boolean;
  // True while an auth action is in flight (sign-in/up/out/reset).
  isLoading: boolean;
  error: string | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<{ email: string; emailConfirmationRequired: boolean }>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  pendingEmailVerification: boolean;
  resetPassword: (email: string) => Promise<void>;
  pendingPasswordReset: boolean;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingEmailVerification, setPendingEmailVerification] = useState(false);
  const [pendingPasswordReset, setPendingPasswordReset] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        setIsReady(false);
        // Check active session
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        setSession(session);
        setUser(session?.user ?? null);
      } catch (err) {
        console.warn('Auth init failed:', err);
      } finally {
        if (isMounted) setIsReady(true);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setPendingEmailVerification(false);
        setPendingPasswordReset(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      Alert.alert('Login Error', err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username: email.split('@')[0], // Default username
            }
        }
      });
      
      if (error) throw error;
      
      // If session is null but no error, email verification is required
      if (data.user && !data.session) {
        setPendingEmailVerification(true);
        return { email, emailConfirmationRequired: true };
      }
      
      return { email, emailConfirmationRequired: false };
    } catch (err: any) {
      setError(err.message);
      Alert.alert('Sign Up Error', err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
        // Linking.createURL gives the correct URL for the current environment:
        // - Expo Go: exp://192.168.x.x:8081/--/auth/callback
        // - Standalone build: algoplay://auth/callback
        const redirectUrl = Linking.createURL('auth/callback');
        
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl,
                skipBrowserRedirect: true,
            },
        });
        
        if (error) throw error;
        if (data.url) {
             const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
             if (result.type === 'success' && result.url) {
                 // Extract tokens from the redirect URL
                 const url = result.url;

                 const hashIndex = url.indexOf('#');
                 const queryIndex = url.indexOf('?');

                 const hash = hashIndex !== -1 ? url.substring(hashIndex + 1) : '';
                 const query =
                   queryIndex !== -1
                     ? url.substring(queryIndex + 1, hashIndex !== -1 ? hashIndex : undefined)
                     : '';

                 const params: Record<string, string> = {};
                 hash.split('&').forEach(part => {
                   const [key, value] = part.split('=');
                   if (key && value) params[key] = decodeURIComponent(value);
                 });

                 const queryParams: Record<string, string> = {};
                 query.split('&').forEach(part => {
                   const [key, value] = part.split('=');
                   if (key && value) queryParams[key] = decodeURIComponent(value);
                 });

                 const accessToken = params['access_token'];
                 const refreshToken = params['refresh_token'];
                 const code = queryParams['code'] || params['code'];
                 
                 if (accessToken && refreshToken) {
                   const { error: sessionError } = await supabase.auth.setSession({
                     access_token: accessToken,
                     refresh_token: refreshToken,
                   });
                   if (sessionError) throw sessionError;
                 } else if (code) {
                   const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
                   if (exchangeError) throw exchangeError;
                 }
             }
        }
    } catch (err: any) {
        setError(err.message);
        Alert.alert('Google Sign In Error', err.message);
    } finally {
        setIsLoading(false);
    }
  };

  const signInWithApple = async () => {
    // Placeholder: Apple Sign In usually requires a dedicated native library on Expo
    // using Supabase Auth directly.
    Alert.alert('Not Implemented', 'Apple Sign In requires specific native setup.');
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // Avoid leading slash, otherwise you can end up with `algoplay:///auth/callback`
        // which won't match Supabase's allowlisted redirect URL.
        redirectTo: Linking.createURL('auth/callback'),
      });
      if (error) throw error;
      setPendingPasswordReset(true);
      Alert.alert('Check your email', 'Password reset instructions have been sent.');
    } catch (err: any) {
      setError(err.message);
      Alert.alert('Reset Password Error', err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isReady,
        isLoading,
        error,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithApple,
        signOut,
        pendingEmailVerification,
        resetPassword,
        pendingPasswordReset,
        isAuthenticated: !!session,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
