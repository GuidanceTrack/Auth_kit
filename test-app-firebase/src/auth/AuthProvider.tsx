import { createContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from './client';
import { trackSession, getSessionInfo } from './sessionTracker';
import type { User, SessionInfo, AuthContextType } from './types';

export const AuthContext = createContext<AuthContextType | null>(null);

const googleProvider = new GoogleAuthProvider();

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isNewSignIn, setIsNewSignIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          name: firebaseUser.displayName ?? undefined,
          avatar: firebaseUser.photoURL ?? undefined,
        });

        // Track or get session based on whether this is a new sign in
        if (isNewSignIn) {
          const sessionInfo = await trackSession(firebaseUser.uid, firebaseUser.email ?? '');
          setSession(sessionInfo);
          setIsNewSignIn(false);
        } else {
          const sessionInfo = await getSessionInfo(firebaseUser.uid);
          setSession(sessionInfo);
        }
      } else {
        setUser(null);
        setSession(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isNewSignIn]);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      setIsNewSignIn(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setIsNewSignIn(false);
      setError(err instanceof Error ? err : new Error('Sign in failed'));
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Sign out failed'));
    }
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
