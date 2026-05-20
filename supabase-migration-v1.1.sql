-- Bible in Context — v1.1 migration
-- Run this in the Supabase SQL Editor if you ran supabase-schema.sql before 2026-05-08.
-- Safe to run multiple times.

-- 1. Add `label` column to bookmarks (UI requires a label)
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS label TEXT;

-- 2. Switch default translation from ESV (copyrighted, never bundled) to WEB (public domain, default in app)
ALTER TABLE profiles    ALTER COLUMN preferred_translation SET DEFAULT 'WEB';
ALTER TABLE highlights  ALTER COLUMN translation           SET DEFAULT 'WEB';
ALTER TABLE notes       ALTER COLUMN translation           SET DEFAULT 'WEB';
ALTER TABLE bookmarks   ALTER COLUMN translation           SET DEFAULT 'WEB';
