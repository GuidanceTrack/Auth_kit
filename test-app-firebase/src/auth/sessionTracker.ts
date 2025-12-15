import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
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
