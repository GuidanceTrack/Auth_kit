import type { GeneratorOptions, GeneratedFile } from '../../types';

export function getSupabaseTemplates(options: GeneratorOptions): GeneratedFile[] {
  const files: GeneratedFile[] = [
    { name: 'types.ts', content: typesTemplate },
    { name: 'client.ts', content: clientTemplate },
    { name: 'useAuth.ts', content: useAuthTemplate },
  ];

  if (options.includeSessionTracking) {
    files.push({ name: 'sessionTracker.ts', content: sessionTrackerTemplate });
  }

  // AuthProvider depends on whether session tracking is enabled
  files.push({
    name: 'AuthProvider.tsx',
    content: options.includeSessionTracking
      ? authProviderWithSessionTemplate
      : authProviderTemplate,
  });

  if (options.includeLoginButton) {
    files.push({ name: 'GoogleLoginButton.tsx', content: googleLoginButtonTemplate });
  }

  if (options.includeEnvExample) {
    files.push({ name: '.env.example', content: envExampleTemplate });
  }

  if (options.includeSchema) {
    files.push({ name: 'schema.sql', content: schemaTemplate });
  }

  return files;
}

const typesTemplate = `export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface SessionInfo {
  firstLoginAt: Date;
  lastLoginAt: Date;
  loginCount: number;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  session: SessionInfo | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}
`;

const clientTemplate = `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
`;

const useAuthTemplate = `import { useContext } from 'react';
import { AuthContext } from './AuthProvider';
import type { AuthContextType } from './types';

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
`;

const sessionTrackerTemplate = `import { supabase } from './client';
import type { SessionInfo } from './types';

export async function trackSession(userId: string, email: string): Promise<SessionInfo | null> {
  try {
    // Check if user session exists
    const { data: existing, error: fetchError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching session:', fetchError);
      return null;
    }

    if (existing) {
      // Update existing session
      const { data: updated, error: updateError } = await supabase
        .from('user_sessions')
        .update({
          last_login_at: new Date().toISOString(),
          login_count: existing.login_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating session:', updateError);
        return null;
      }

      return {
        firstLoginAt: new Date(updated.first_login_at),
        lastLoginAt: new Date(updated.last_login_at),
        loginCount: updated.login_count,
      };
    } else {
      // Create new session
      const { data: created, error: createError } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          email,
          first_login_at: new Date().toISOString(),
          last_login_at: new Date().toISOString(),
          login_count: 1,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating session:', createError);
        return null;
      }

      return {
        firstLoginAt: new Date(created.first_login_at),
        lastLoginAt: new Date(created.last_login_at),
        loginCount: created.login_count,
      };
    }
  } catch (error) {
    console.error('Session tracking error:', error);
    return null;
  }
}

export async function getSessionInfo(userId: string): Promise<SessionInfo | null> {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      return null;
    }

    return {
      firstLoginAt: new Date(data.first_login_at),
      lastLoginAt: new Date(data.last_login_at),
      loginCount: data.login_count,
    };
  } catch {
    return null;
  }
}
`;

const authProviderTemplate = `import { createContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from './client';
import type { User, AuthContextType } from './types';

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          name: session.user.user_metadata?.full_name,
          avatar: session.user.user_metadata?.avatar_url,
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email ?? '',
            name: session.user.user_metadata?.full_name,
            avatar: session.user.user_metadata?.avatar_url,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) setError(error);
  };

  const signOut = async () => {
    setError(null);
    const { error } = await supabase.auth.signOut();
    if (error) setError(error);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        session: null,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
`;

const authProviderWithSessionTemplate = `import { createContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from './client';
import { trackSession, getSessionInfo } from './sessionTracker';
import type { User, SessionInfo, AuthContextType } from './types';

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session: authSession } }) => {
      if (authSession?.user) {
        setUser({
          id: authSession.user.id,
          email: authSession.user.email ?? '',
          name: authSession.user.user_metadata?.full_name,
          avatar: authSession.user.user_metadata?.avatar_url,
        });
        // Get existing session info
        const sessionInfo = await getSessionInfo(authSession.user.id);
        setSession(sessionInfo);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, authSession) => {
        if (authSession?.user) {
          setUser({
            id: authSession.user.id,
            email: authSession.user.email ?? '',
            name: authSession.user.user_metadata?.full_name,
            avatar: authSession.user.user_metadata?.avatar_url,
          });

          // Track session on sign in
          if (event === 'SIGNED_IN') {
            const sessionInfo = await trackSession(
              authSession.user.id,
              authSession.user.email ?? ''
            );
            setSession(sessionInfo);
          }
        } else {
          setUser(null);
          setSession(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) setError(error);
  };

  const signOut = async () => {
    setError(null);
    const { error } = await supabase.auth.signOut();
    if (error) setError(error);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        session,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
`;

const googleLoginButtonTemplate = `import { useAuth } from './useAuth';

export function GoogleLoginButton() {
  const { signInWithGoogle, loading } = useAuth();

  return (
    <button
      onClick={signInWithGoogle}
      disabled={loading}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: 500,
        color: '#1f2937',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        transition: 'all 0.2s',
        width: '100%',
        maxWidth: '300px',
      }}
      onMouseOver={(e) => {
        if (!loading) {
          e.currentTarget.style.backgroundColor = '#f9fafb';
          e.currentTarget.style.borderColor = '#d1d5db';
        }
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = '#ffffff';
        e.currentTarget.style.borderColor = '#e5e7eb';
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
          fill="#4285F4"
        />
        <path
          d="M9.003 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.26c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332A8.997 8.997 0 0 0 9.003 18z"
          fill="#34A853"
        />
        <path
          d="M3.964 10.712A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.96A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.96 4.042l3.004-2.33z"
          fill="#FBBC05"
        />
        <path
          d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0A8.997 8.997 0 0 0 .96 4.958l3.004 2.332c.708-2.127 2.692-3.71 5.036-3.71z"
          fill="#EA4335"
        />
      </svg>
      {loading ? 'Signing in...' : 'Sign in with Google'}
    </button>
  );
}
`;

const envExampleTemplate = `VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
`;

const schemaTemplate = `-- User sessions table for tracking login history
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  first_login_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW(),
  login_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own session data
CREATE POLICY "Users can view own session"
  ON user_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own session data
CREATE POLICY "Users can update own session"
  ON user_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Authenticated users can insert their session
CREATE POLICY "Users can insert own session"
  ON user_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
`;
