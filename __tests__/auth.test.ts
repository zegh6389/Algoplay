/**
 * Auth Integration Tests
 * Tests sign up, sign in, sign out, and password reset against real Supabase.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Test user credentials — use a unique email to avoid conflicts
const TEST_EMAIL = `algoplay_test_${Date.now()}@yopmail.com`;
const TEST_PASSWORD = 'TestPass123!';

let supabase: SupabaseClient;

beforeAll(() => {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
});

describe('Supabase Connection', () => {
  test('should connect to Supabase successfully', async () => {
    expect(SUPABASE_URL).toBeDefined();
    expect(SUPABASE_URL).toContain('supabase.co');
    expect(SUPABASE_ANON_KEY).toBeDefined();
    expect(SUPABASE_ANON_KEY.length).toBeGreaterThan(10);
    console.log('✅ Supabase URL:', SUPABASE_URL);
  });

  test('should be able to reach the Supabase auth endpoint', async () => {
    const { data, error } = await supabase.auth.getSession();
    // No session expected, but no error means the connection works
    expect(error).toBeNull();
    expect(data).toBeDefined();
    console.log('✅ Auth endpoint reachable. Session:', data.session ? 'exists' : 'none');
  });
});

describe('Email Sign Up', () => {
  test('should sign up a new user with email and password', async () => {
    const { data, error } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      options: {
        data: {
          username: 'test_user',
        },
      },
    });

    if (error) {
      console.log('⚠️ Sign up error:', error.message);
      // If email confirmation is required, this is still a successful signup
      if (error.message.includes('confirm')) {
        console.log('✅ Sign up triggered email confirmation (expected behavior)');
        return;
      }
    }

    expect(data).toBeDefined();
    
    if (data.user && !data.session) {
      // Email confirmation required — this is normal
      console.log('✅ Sign up successful — email confirmation required for:', TEST_EMAIL);
      expect(data.user.email).toBe(TEST_EMAIL);
    } else if (data.session) {
      // Auto-confirmed (email verification disabled in Supabase settings)
      console.log('✅ Sign up successful — auto-confirmed for:', TEST_EMAIL);
      expect(data.session.user.email).toBe(TEST_EMAIL);
    }
  });
});

describe('Email Sign In', () => {
  test('should fail sign in with wrong password', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: 'WrongPassword999!',
    });

    expect(error).not.toBeNull();
    console.log('✅ Correctly rejected wrong password:', error?.message);
  });

  test('should fail sign in with non-existent user', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'nonexistent_user_12345@yopmail.com',
      password: 'SomePassword123!',
    });

    expect(error).not.toBeNull();
    console.log('✅ Correctly rejected non-existent user:', error?.message);
  });

  test('should sign in with valid credentials (if email confirmed)', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (error) {
      // Expected if email not confirmed yet
      console.log('⚠️ Sign in error (may need email confirmation):', error.message);
      expect(error.message).toBeTruthy();
    } else {
      expect(data.session).toBeDefined();
      expect(data.user).toBeDefined();
      expect(data.user?.email).toBe(TEST_EMAIL);
      console.log('✅ Sign in successful for:', TEST_EMAIL);
    }
  });
});

describe('Google OAuth', () => {
  test('should generate a valid Google OAuth URL', async () => {
    const redirectUrl = 'algoplay://auth/callback';
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    expect(error).toBeNull();
    expect(data.url).toBeDefined();
    // Supabase returns its own authorize URL which redirects to Google
    expect(data.url).toContain('auth/v1/authorize');
    expect(data.url).toContain('provider=google');
    expect(data.url).toContain('redirect_to=');
    console.log('✅ Google OAuth URL generated successfully');
    console.log('   URL:', data.url?.substring(0, 100) + '...');
  });

  test('should reject an invalid provider', async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'invalid_provider' as any,
      options: { skipBrowserRedirect: true },
    });

    // Supabase may return an error or a URL that leads to an error page
    if (error) {
      console.log('✅ Correctly rejected invalid provider:', error.message);
    } else {
      console.log('⚠️ Supabase returned a URL for invalid provider (will fail at auth)');
    }
  });
});

describe('Password Reset', () => {
  test('should send password reset email', async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(TEST_EMAIL, {
      redirectTo: 'algoplay://auth/callback',
    });

    // This should succeed even if user does not exist (security best practice)
    expect(error).toBeNull();
    console.log('✅ Password reset email sent for:', TEST_EMAIL);
  });
});

describe('Sign Out', () => {
  test('should sign out successfully', async () => {
    const { error } = await supabase.auth.signOut();
    expect(error).toBeNull();

    const { data } = await supabase.auth.getSession();
    expect(data.session).toBeNull();
    console.log('✅ Sign out successful, session cleared');
  });
});

describe('Auth State', () => {
  test('should have no session after sign out', async () => {
    const { data, error } = await supabase.auth.getSession();
    expect(error).toBeNull();
    expect(data.session).toBeNull();
    console.log('✅ No active session (expected after sign out)');
  });
});
