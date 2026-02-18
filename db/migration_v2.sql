-- Migration V2: Payment & Subscription Support
-- Run this SQL in the Neon console after deployment.

-- Add plan fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;

-- Usage tracking (daily worksheet & quiz counts, per user + IP)
CREATE TABLE IF NOT EXISTS usage_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL DEFAULT '',
  log_date DATE DEFAULT CURRENT_DATE,
  worksheet_count INT DEFAULT 0,
  quiz_count INT DEFAULT 0,
  UNIQUE(user_id, log_date)
);

-- IP-only usage tracking for free tier anti-abuse
CREATE TABLE IF NOT EXISTS ip_usage_logs (
  id SERIAL PRIMARY KEY,
  ip_address TEXT NOT NULL,
  worksheet_count INT DEFAULT 0,
  quiz_count INT DEFAULT 0,
  UNIQUE(ip_address)
);

-- Payment records
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  razorpay_order_id TEXT NOT NULL,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  plan TEXT NOT NULL,
  amount INT NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'created',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_date ON usage_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_ip_usage_ip ON ip_usage_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(razorpay_order_id);
