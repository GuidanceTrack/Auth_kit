import type { GeneratorOptions, GeneratedFile } from '../../types';

export function getFirebaseTemplates(options: GeneratorOptions): GeneratedFile[] {
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
    files.push({ name: 'firestore-rules.txt', content: firestoreRulesTemplate });
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

const clientTemplate = `import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  throw new Error('Missing Firebase environment variables');
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
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

const sessionTrackerTemplate = `import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from './client';
import type { SessionInfo } from './types';

export async function trackSession(userId: string, email: string): Promise<SessionInfo | null> {
  try {
    const sessionRef = doc(db, 'user_sessions', userId);
    const sessionDoc = await getDoc(sessionRef);

    if (sessionDoc.exists()) {
      // Update existing session
      const data = sessionDoc.data();
      const now = new Date();

      await updateDoc(sessionRef, {
        last_login_at: now.toISOString(),
        login_count: increment(1),
        updated_at: now.toISOString(),
      });

      return {
        firstLoginAt: new Date(data.first_login_at),
        lastLoginAt: now,
        loginCount: data.login_count + 1,
      };
    } else {
      // Create new session
      const now = new Date();
      const sessionData = {
        user_id: userId,
        email,
        first_login_at: now.toISOString(),
        last_login_at: now.toISOString(),
        login_count: 1,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };

      await setDoc(sessionRef, sessionData);

      return {
        firstLoginAt: now,
        lastLoginAt: now,
        loginCount: 1,
      };
    }
  } catch (error) {
    console.error('Session tracking error:', error);
    return null;
  }
}

export async function getSessionInfo(userId: string): Promise<SessionInfo | null> {
  try {
    const sessionRef = doc(db, 'user_sessions', userId);
    const sessionDoc = await getDoc(sessionRef);

    if (!sessionDoc.exists()) {
      return null;
    }

    const data = sessionDoc.data();
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
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from './client';
import type { User, AuthContextType } from './types';

export const AuthContext = createContext<AuthContextType | null>(null);

const googleProvider = new GoogleAuthProvider();

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          name: firebaseUser.displayName ?? undefined,
          avatar: firebaseUser.photoURL ?? undefined,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
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

const envExampleTemplate = `VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
`;

const firestoreRulesTemplate = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User sessions collection
    // Document ID must match the authenticated user's UID
    match /user_sessions/{userId} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }
  }
}
`;
