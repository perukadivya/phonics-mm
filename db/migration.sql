-- Run this SQL in the Vercel Postgres console (Storage → your DB → Query)
-- or in the Neon console linked from your Vercel project.

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  letters INT DEFAULT 0,
  three_letter_words INT DEFAULT 0,
  four_letter_words INT DEFAULT 0,
  five_letter_words INT DEFAULT 0,
  sentences INT DEFAULT 0,
  total_stickers INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  completed_items JSONB DEFAULT '{}',
  last_active DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
