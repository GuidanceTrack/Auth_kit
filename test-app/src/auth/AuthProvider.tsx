import { createContext, useEffect, useState, type ReactNode } from 'react';
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
