-- Bible in Context — v1.2 Moderation Migration
-- Adds user blocking + content reporting, required for App Store Guideline 1.2
-- (apps with user-generated content must let users report content and block users).
--
-- Run this in the Supabase SQL Editor.

-- =====================================================
-- USER BLOCKS
-- =====================================================
CREATE TABLE IF NOT EXISTS user_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

CREATE INDEX IF NOT EXISTS user_blocks_blocker_idx ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS user_blocks_blocked_idx ON user_blocks(blocked_id);

ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

-- A user can only see, create, and remove their OWN blocks.
CREATE POLICY "Users view own blocks" ON user_blocks FOR SELECT USING (auth.uid() = blocker_id);
CREATE POLICY "Users create own blocks" ON user_blocks FOR INSERT WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "Users remove own blocks" ON user_blocks FOR DELETE USING (auth.uid() = blocker_id);

-- =====================================================
-- CONTENT REPORTS
-- =====================================================
CREATE TABLE IF NOT EXISTS content_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,          -- 'note' | 'highlight' | 'profile'
  content_id TEXT,                     -- id of the reported row (if applicable)
  content_text TEXT,                   -- snapshot of the offending text for review
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'reviewed' | 'actioned'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS content_reports_status_idx ON content_reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS content_reports_reported_user_idx ON content_reports(reported_user_id);

ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;

-- Users may file a report as themselves. Intentionally NO select policy:
-- reports are reviewed only via the Supabase dashboard (service role),
-- so one user can never read another user's reports.
CREATE POLICY "Users file own reports" ON content_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
