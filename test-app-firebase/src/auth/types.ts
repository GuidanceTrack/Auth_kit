export interface User {
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
