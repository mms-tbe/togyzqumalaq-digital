-- Enums
CREATE TYPE user_role AS ENUM ('player', 'arbiter', 'admin');
CREATE TYPE game_result AS ENUM ('white', 'black', 'draw', 'ongoing');
CREATE TYPE game_source AS ENUM ('ocr', 'manual');
CREATE TYPE move_side AS ENUM ('white', 'black');
CREATE TYPE ocr_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  club TEXT,
  rating INTEGER DEFAULT 1200,
  role user_role DEFAULT 'player',
  locale TEXT DEFAULT 'ru' CHECK (locale IN ('kk', 'ru', 'en')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email), NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Tournaments
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  start_date DATE,
  end_date DATE,
  organizer_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tournaments_select" ON tournaments FOR SELECT TO authenticated USING (true);
CREATE POLICY "tournaments_insert" ON tournaments FOR INSERT TO authenticated WITH CHECK (true);

-- Games
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id),
  white_player_id UUID REFERENCES profiles(id),
  black_player_id UUID REFERENCES profiles(id),
  result game_result DEFAULT 'ongoing',
  round INTEGER,
  date_played DATE,
  source_type game_source NOT NULL DEFAULT 'manual',
  source_file_url TEXT,
  ocr_model_used TEXT,
  ocr_confidence REAL,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "games_select" ON games FOR SELECT TO authenticated USING (true);
CREATE POLICY "games_insert" ON games FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "games_update" ON games FOR UPDATE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "games_delete" ON games FOR DELETE TO authenticated USING (created_by = auth.uid());

CREATE INDEX idx_games_created_by ON games(created_by);
CREATE INDEX idx_games_created_at ON games(created_at DESC);

-- Moves
CREATE TABLE moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  move_number INTEGER NOT NULL,
  side move_side NOT NULL,
  from_pit INTEGER NOT NULL CHECK (from_pit BETWEEN 1 AND 9),
  fen_after TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(game_id, move_number, side)
);

ALTER TABLE moves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "moves_select" ON moves FOR SELECT TO authenticated USING (true);
CREATE POLICY "moves_insert" ON moves FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM games WHERE games.id = game_id AND games.created_by = auth.uid()));
CREATE POLICY "moves_delete" ON moves FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM games WHERE games.id = game_id AND games.created_by = auth.uid()));

CREATE INDEX idx_moves_game ON moves(game_id, move_number, side);

-- OCR Jobs
CREATE TABLE ocr_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  game_id UUID REFERENCES games(id),
  file_path TEXT NOT NULL,
  model TEXT DEFAULT 'deepseek-ocr',
  status ocr_status DEFAULT 'pending',
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  raw_result JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE ocr_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ocr_jobs_all" ON ocr_jobs FOR ALL TO authenticated USING (user_id = auth.uid());

CREATE INDEX idx_ocr_jobs_user ON ocr_jobs(user_id);
CREATE INDEX idx_ocr_jobs_status ON ocr_jobs(status);

-- Storage buckets (run via Supabase dashboard or API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('sheets', 'sheets', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
