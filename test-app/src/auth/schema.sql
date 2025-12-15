-- User sessions table for tracking login history
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
