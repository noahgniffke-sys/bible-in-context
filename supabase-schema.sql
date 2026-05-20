-- Bible in Context — Supabase Schema
-- Run this in the Supabase SQL Editor to create all tables

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  preferred_translation TEXT DEFAULT 'WEB',
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  profile_setup_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);

-- =====================================================
-- FOLLOWS
-- =====================================================
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS follows_follower_id_idx ON follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_following_id_idx ON follows(following_id);

-- =====================================================
-- HIGHLIGHTS
-- =====================================================
CREATE TABLE IF NOT EXISTS highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  verse_ref TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'var(--highlight-yellow)',
  is_public BOOLEAN DEFAULT FALSE,
  translation TEXT DEFAULT 'WEB',
  verse_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, verse_ref, translation)
);

CREATE INDEX IF NOT EXISTS highlights_user_id_idx ON highlights(user_id);
CREATE INDEX IF NOT EXISTS highlights_verse_ref_idx ON highlights(verse_ref);
CREATE INDEX IF NOT EXISTS highlights_created_at_idx ON highlights(created_at DESC);

-- =====================================================
-- NOTES
-- =====================================================
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  verse_ref TEXT NOT NULL,
  content TEXT NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  translation TEXT DEFAULT 'WEB',
  verse_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes(user_id);
CREATE INDEX IF NOT EXISTS notes_verse_ref_idx ON notes(verse_ref);
CREATE INDEX IF NOT EXISTS notes_created_at_idx ON notes(created_at DESC);

-- =====================================================
-- BOOKMARKS
-- =====================================================
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  verse_ref TEXT NOT NULL,
  label TEXT,
  translation TEXT DEFAULT 'WEB',
  verse_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, verse_ref, translation)
);

CREATE INDEX IF NOT EXISTS bookmarks_user_id_idx ON bookmarks(user_id);

-- =====================================================
-- PRAYERS
-- =====================================================
CREATE TABLE IF NOT EXISTS prayers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  verse_ref TEXT,
  is_answered BOOLEAN DEFAULT FALSE,
  answered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS prayers_user_id_idx ON prayers(user_id);
CREATE INDEX IF NOT EXISTS prayers_created_at_idx ON prayers(created_at DESC);

-- =====================================================
-- PLANS
-- =====================================================
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  cover_emoji TEXT DEFAULT '📖',
  total_days INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  subscriber_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS plans_category_idx ON plans(category);
CREATE INDEX IF NOT EXISTS plans_creator_id_idx ON plans(creator_id);
CREATE INDEX IF NOT EXISTS plans_subscriber_count_idx ON plans(subscriber_count DESC);

-- =====================================================
-- PLAN DAYS
-- =====================================================
CREATE TABLE IF NOT EXISTS plan_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  title TEXT,
  verse_refs TEXT[] NOT NULL,
  reflection_prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plan_id, day_number)
);

CREATE INDEX IF NOT EXISTS plan_days_plan_id_idx ON plan_days(plan_id);

-- =====================================================
-- PLAN SUBSCRIPTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS plan_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  current_day INTEGER DEFAULT 1,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plan_id)
);

CREATE INDEX IF NOT EXISTS plan_subs_user_id_idx ON plan_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS plan_subs_plan_id_idx ON plan_subscriptions(plan_id);

-- =====================================================
-- PLAN PROGRESS
-- =====================================================
CREATE TABLE IF NOT EXISTS plan_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES plan_subscriptions(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subscription_id, day_number)
);

CREATE INDEX IF NOT EXISTS plan_progress_sub_id_idx ON plan_progress(subscription_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_progress ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Public profiles viewable" ON profiles FOR SELECT USING (is_public = true OR auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Follows
CREATE POLICY "Follows viewable" ON follows FOR SELECT USING (true);
CREATE POLICY "Auth users can follow" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- Highlights
CREATE POLICY "Own or public highlights viewable" ON highlights FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users create own highlights" ON highlights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own highlights" ON highlights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own highlights" ON highlights FOR DELETE USING (auth.uid() = user_id);

-- Notes
CREATE POLICY "Own or public notes viewable" ON notes FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users create own notes" ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own notes" ON notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own notes" ON notes FOR DELETE USING (auth.uid() = user_id);

-- Bookmarks
CREATE POLICY "Users view own bookmarks" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own bookmarks" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own bookmarks" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Prayers
CREATE POLICY "Users view own prayers" ON prayers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own prayers" ON prayers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own prayers" ON prayers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own prayers" ON prayers FOR DELETE USING (auth.uid() = user_id);

-- Plans
CREATE POLICY "Published plans viewable" ON plans FOR SELECT USING (is_published = true OR auth.uid() = creator_id);
CREATE POLICY "Auth users create plans" ON plans FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators update own plans" ON plans FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creators delete own plans" ON plans FOR DELETE USING (auth.uid() = creator_id);

-- Plan days
CREATE POLICY "Plan days viewable" ON plan_days FOR SELECT USING (
  EXISTS (SELECT 1 FROM plans WHERE id = plan_days.plan_id AND (is_published = true OR creator_id = auth.uid()))
);
CREATE POLICY "Creators manage plan days" ON plan_days FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM plans WHERE id = plan_days.plan_id AND creator_id = auth.uid())
);
CREATE POLICY "Creators update plan days" ON plan_days FOR UPDATE USING (
  EXISTS (SELECT 1 FROM plans WHERE id = plan_days.plan_id AND creator_id = auth.uid())
);
CREATE POLICY "Creators delete plan days" ON plan_days FOR DELETE USING (
  EXISTS (SELECT 1 FROM plans WHERE id = plan_days.plan_id AND creator_id = auth.uid())
);

-- Plan subscriptions
CREATE POLICY "Users view own subscriptions" ON plan_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users subscribe to plans" ON plan_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own subscriptions" ON plan_subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own subscriptions" ON plan_subscriptions FOR DELETE USING (auth.uid() = user_id);

-- Plan progress
CREATE POLICY "Users view own progress" ON plan_progress FOR SELECT USING (
  EXISTS (SELECT 1 FROM plan_subscriptions WHERE id = plan_progress.subscription_id AND user_id = auth.uid())
);
CREATE POLICY "Users mark progress" ON plan_progress FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM plan_subscriptions WHERE id = plan_progress.subscription_id AND user_id = auth.uid())
);

-- =====================================================
-- TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prayers_updated_at BEFORE UPDATE ON prayers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Follow count triggers
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = OLD.following_id;
    UPDATE profiles SET following_count = GREATEST(following_count - 1, 0) WHERE id = OLD.follower_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_follow_counts_trigger AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- Plan subscriber count trigger
CREATE OR REPLACE FUNCTION update_plan_subscriber_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE plans SET subscriber_count = subscriber_count + 1 WHERE id = NEW.plan_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE plans SET subscriber_count = GREATEST(subscriber_count - 1, 0) WHERE id = OLD.plan_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_plan_sub_count_trigger AFTER INSERT OR DELETE ON plan_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_plan_subscriber_count();
