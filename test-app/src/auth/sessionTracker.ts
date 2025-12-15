import { supabase } from './client';
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
