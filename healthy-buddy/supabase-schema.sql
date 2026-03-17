-- =====================================================
-- HEALTHY BUDDY — Supabase Database Schema
-- Run this in the Supabase SQL editor
-- =====================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ─── USERS ───────────────────────────────────────────
CREATE TABLE public.users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id      TEXT UNIQUE NOT NULL,
  email         TEXT NOT NULL,
  username      TEXT UNIQUE,
  avatar_url    TEXT,
  display_name  TEXT,
  bio           TEXT,
  timezone      TEXT DEFAULT 'UTC',
  -- Gamification
  xp            INTEGER NOT NULL DEFAULT 0,
  level         INTEGER NOT NULL DEFAULT 1,
  total_habits_completed  INTEGER DEFAULT 0,
  longest_streak          INTEGER DEFAULT 0,
  current_streak          INTEGER DEFAULT 0,
  -- Plan
  plan          TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro','enterprise')),
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT,
  -- Timestamps
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── HABITS ──────────────────────────────────────────
CREATE TABLE public.habits (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  icon          TEXT DEFAULT '⭐',
  color         TEXT DEFAULT '#4ade80',
  difficulty    TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  xp_reward     INTEGER NOT NULL DEFAULT 10,  -- easy=10, medium=20, hard=30
  frequency     TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily','weekly','custom')),
  frequency_days INTEGER[] DEFAULT '{1,2,3,4,5,6,7}', -- days of week
  target_count  INTEGER DEFAULT 1,            -- e.g. drink 8 glasses
  unit          TEXT,                          -- e.g. "glasses", "minutes", "km"
  category      TEXT DEFAULT 'health',
  is_active     BOOLEAN DEFAULT TRUE,
  sort_order    INTEGER DEFAULT 0,
  -- Streak tracking
  current_streak  INTEGER DEFAULT 0,
  longest_streak  INTEGER DEFAULT 0,
  last_completed  DATE,
  -- Timestamps
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── HABIT LOGS ──────────────────────────────────────
CREATE TABLE public.habit_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id      UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  completed_at  TIMESTAMPTZ DEFAULT NOW(),
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  count         INTEGER DEFAULT 1,            -- for countable habits
  xp_earned     INTEGER NOT NULL DEFAULT 0,
  note          TEXT,
  mood          INTEGER CHECK (mood BETWEEN 1 AND 5),
  UNIQUE(habit_id, date)                      -- one log per habit per day
);

-- ─── XP TRANSACTIONS ─────────────────────────────────
CREATE TABLE public.xp_transactions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount        INTEGER NOT NULL,
  reason        TEXT NOT NULL,               -- 'habit_complete','streak_bonus','level_up'
  habit_id      UUID REFERENCES public.habits(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── BADGES ──────────────────────────────────────────
CREATE TABLE public.badges (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  icon          TEXT NOT NULL,
  rarity        TEXT DEFAULT 'common' CHECK (rarity IN ('common','rare','epic','legendary')),
  xp_bonus      INTEGER DEFAULT 0,
  condition_type TEXT NOT NULL,              -- 'streak','habits_count','level','total_xp'
  condition_value INTEGER NOT NULL
);

CREATE TABLE public.user_badges (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id      UUID NOT NULL REFERENCES public.badges(id),
  earned_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- ─── POMODORO SESSIONS ───────────────────────────────
CREATE TABLE public.pomodoro_sessions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  habit_id      UUID REFERENCES public.habits(id),
  duration      INTEGER NOT NULL DEFAULT 1500,  -- seconds
  completed     BOOLEAN DEFAULT FALSE,
  started_at    TIMESTAMPTZ DEFAULT NOW(),
  completed_at  TIMESTAMPTZ
);

-- ─── AI COACH MESSAGES ───────────────────────────────
CREATE TABLE public.ai_coach_messages (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content       TEXT NOT NULL,
  context_data  JSONB,                       -- snapshot of user stats at time of message
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SOCIAL: FRIENDS ─────────────────────────────────
CREATE TABLE public.friendships (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  addressee_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','blocked')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id)
);

-- ─── CHALLENGES ──────────────────────────────────────
CREATE TABLE public.challenges (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  habit_name    TEXT NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 7,
  starts_at     TIMESTAMPTZ NOT NULL,
  ends_at       TIMESTAMPTZ NOT NULL,
  is_public     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.challenge_participants (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id  UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  streak        INTEGER DEFAULT 0,
  completed_days INTEGER DEFAULT 0,
  joined_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- ─── INDEXES ──────────────────────────────────────────
CREATE INDEX idx_habits_user_id ON public.habits(user_id);
CREATE INDEX idx_habit_logs_user_date ON public.habit_logs(user_id, date DESC);
CREATE INDEX idx_habit_logs_habit_id ON public.habit_logs(habit_id);
CREATE INDEX idx_xp_transactions_user ON public.xp_transactions(user_id, created_at DESC);
CREATE INDEX idx_ai_messages_user ON public.ai_coach_messages(user_id, created_at DESC);

-- ─── ROW LEVEL SECURITY ───────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_coach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "users_own_data" ON public.users FOR ALL USING (clerk_id = current_setting('app.clerk_id', TRUE));
CREATE POLICY "habits_own" ON public.habits FOR ALL USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.clerk_id', TRUE)));
CREATE POLICY "logs_own" ON public.habit_logs FOR ALL USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.clerk_id', TRUE)));
CREATE POLICY "xp_own" ON public.xp_transactions FOR ALL USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.clerk_id', TRUE)));
CREATE POLICY "badges_own" ON public.user_badges FOR ALL USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.clerk_id', TRUE)));
CREATE POLICY "ai_own" ON public.ai_coach_messages FOR ALL USING (user_id = (SELECT id FROM public.users WHERE clerk_id = current_setting('app.clerk_id', TRUE)));

-- ─── SEED BADGES ─────────────────────────────────────
INSERT INTO public.badges (slug, name, description, icon, rarity, xp_bonus, condition_type, condition_value) VALUES
  ('first_habit', 'First Step', 'Completed your very first habit', '🌱', 'common', 50, 'habits_count', 1),
  ('week_warrior', 'Week Warrior', '7-day streak on any habit', '🔥', 'common', 100, 'streak', 7),
  ('month_master', 'Month Master', '30-day streak on any habit', '👑', 'rare', 500, 'streak', 30),
  ('century_club', 'Century Club', 'Earned 1000 total XP', '💯', 'rare', 200, 'total_xp', 1000),
  ('habit_hoarder', 'Habit Architect', 'Managing 10 active habits', '🏗️', 'epic', 300, 'habits_count', 10),
  ('level_five', 'Rising Star', 'Reached Level 5', '⭐', 'common', 150, 'level', 5),
  ('level_ten', 'Elite Performer', 'Reached Level 10', '🚀', 'rare', 400, 'level', 10),
  ('level_twenty', 'Legendary', 'Reached Level 20', '🏆', 'legendary', 1000, 'level', 20),
  ('iron_will', 'Iron Will', '100-day streak', '⚡', 'legendary', 2000, 'streak', 100);

-- ─── FUNCTIONS ───────────────────────────────────────

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER habits_updated_at BEFORE UPDATE ON public.habits FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Level calculation function
CREATE OR REPLACE FUNCTION calculate_level(xp INTEGER) RETURNS INTEGER AS $$
BEGIN
  -- Level formula: level = floor(1 + sqrt(xp / 100))
  RETURN GREATEST(1, FLOOR(1 + SQRT(xp::FLOAT / 100)));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- XP needed for next level
CREATE OR REPLACE FUNCTION xp_for_level(lvl INTEGER) RETURNS INTEGER AS $$
BEGIN
  RETURN ((lvl - 1) * (lvl - 1)) * 100;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
