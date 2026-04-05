-- Minimal schema for direct Postgres (DATABASE_URL / node-pg) when public.profiles
-- and related tables are missing. Does not reference auth.users (unlike 00001_initial_schema.sql).
-- Idempotent: safe to re-run. No RLS — connection user must have INSERT privileges.
--
-- If you use full Supabase with auth.users already present, prefer running
-- supabase/migrations/00001_initial_schema.sql from the Supabase SQL editor instead.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('player', 'arbiter', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE game_result AS ENUM ('white', 'black', 'draw', 'ongoing');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE game_source AS ENUM ('ocr', 'manual');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE move_side AS ENUM ('white', 'black');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE ocr_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  club TEXT,
  rating INTEGER DEFAULT 1200,
  role user_role DEFAULT 'player',
  locale TEXT DEFAULT 'ru' CHECK (locale IN ('kk', 'ru', 'en')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  start_date DATE,
  end_date DATE,
  organizer_id UUID REFERENCES public.profiles (id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments (id),
  white_player_id UUID REFERENCES public.profiles (id),
  black_player_id UUID REFERENCES public.profiles (id),
  result game_result DEFAULT 'ongoing',
  round INTEGER,
  date_played DATE,
  source_type game_source NOT NULL DEFAULT 'manual',
  source_file_url TEXT,
  ocr_model_used TEXT,
  ocr_confidence REAL,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles (id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_games_created_by ON public.games (created_by);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON public.games (created_at DESC);

CREATE TABLE IF NOT EXISTS public.moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.games (id) ON DELETE CASCADE,
  move_number INTEGER NOT NULL,
  side move_side NOT NULL,
  from_pit INTEGER NOT NULL CHECK (from_pit BETWEEN 1 AND 9),
  fen_after TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (game_id, move_number, side)
);

CREATE INDEX IF NOT EXISTS idx_moves_game ON public.moves (game_id, move_number, side);

CREATE TABLE IF NOT EXISTS public.ocr_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id),
  game_id UUID REFERENCES public.games (id),
  file_path TEXT NOT NULL,
  model TEXT DEFAULT 'deepseek-ocr',
  status ocr_status DEFAULT 'pending',
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  raw_result JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ocr_jobs_user ON public.ocr_jobs (user_id);
CREATE INDEX IF NOT EXISTS idx_ocr_jobs_status ON public.ocr_jobs (status);
