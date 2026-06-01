-- CMBA Platform: Initial Schema
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── PROFILES ──────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'parent'
    CHECK (role IN ('admin','commissioner','coach','referee','scorekeeper','parent','player','volunteer')),
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by authenticated users" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can do anything" ON profiles USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','commissioner'))
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── SEASONS ────────────────────────────────────────────────────────────────
CREATE TABLE seasons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  year INT NOT NULL,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view seasons" ON seasons FOR SELECT USING (true);
CREATE POLICY "Admins manage seasons" ON seasons FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','commissioner'))
);

-- ── CLUBS ──────────────────────────────────────────────────────────────────
CREATE TABLE clubs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT,
  primary_color TEXT DEFAULT '#CC0000',
  secondary_color TEXT DEFAULT '#FFFFFF',
  logo_url TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  city TEXT DEFAULT 'Calgary',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view clubs" ON clubs FOR SELECT USING (true);
CREATE POLICY "Admins manage clubs" ON clubs FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','commissioner'))
);

-- ── DIVISIONS ──────────────────────────────────────────────────────────────
CREATE TABLE divisions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  short_name TEXT,
  gender TEXT CHECK (gender IN ('boys','girls','mixed','coed')),
  age_group TEXT,
  tier INT DEFAULT 1,
  is_published BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published divisions" ON divisions FOR SELECT USING (is_published = true OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','commissioner')));
CREATE POLICY "Admins manage divisions" ON divisions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','commissioner'))
);

-- ── VENUES ────────────────────────────────────────────────────────────────
CREATE TABLE venues (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  abbreviation TEXT,
  address TEXT,
  city TEXT DEFAULT 'Calgary',
  province TEXT DEFAULT 'AB',
  postal_code TEXT,
  google_maps_url TEXT,
  lat DECIMAL(10,7),
  lng DECIMAL(10,7),
  court_count INT DEFAULT 1,
  parking_notes TEXT,
  accessibility_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view venues" ON venues FOR SELECT USING (true);
CREATE POLICY "Admins manage venues" ON venues FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','commissioner'))
);

-- ── TEAMS ─────────────────────────────────────────────────────────────────
CREATE TABLE teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  division_id UUID REFERENCES divisions(id) ON DELETE CASCADE,
  club_id UUID REFERENCES clubs(id),
  name TEXT NOT NULL,
  short_name TEXT,
  color TEXT,
  head_coach_id UUID REFERENCES profiles(id),
  assistant_coach_id UUID REFERENCES profiles(id),
  contact_email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active teams" ON teams FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage teams" ON teams FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','commissioner'))
);

-- ── PLAYERS / ROSTER ──────────────────────────────────────────────────────
CREATE TABLE players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  jersey_number TEXT,
  position TEXT,
  date_of_birth DATE,
  parent_guardian_name TEXT,
  parent_guardian_email TEXT,
  parent_guardian_phone TEXT,
  emergency_contact TEXT,
  medical_notes TEXT,
  is_active BOOLEAN DEFAULT true,
  waiver_signed BOOLEAN DEFAULT false,
  waiver_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coaches can view their team players" ON players FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','commissioner'))
  OR EXISTS (SELECT 1 FROM teams WHERE id = team_id AND head_coach_id = auth.uid())
);
CREATE POLICY "Admins manage players" ON players FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','commissioner'))
);

-- ── GAMES ─────────────────────────────────────────────────────────────────
CREATE TABLE games (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  external_id TEXT,             -- RAMP GameNumber
  division_id UUID REFERENCES divisions(id),
  home_team_id UUID REFERENCES teams(id),
  away_team_id UUID REFERENCES teams(id),
  venue_id UUID REFERENCES venues(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  home_score INT,
  away_score INT,
  home_team_name TEXT,          -- Denormalized from RAMP import
  away_team_name TEXT,
  status TEXT DEFAULT 'scheduled'
    CHECK (status IN ('scheduled','warmup','live','halftime','final','postponed','cancelled','forfeit')),
  game_type TEXT DEFAULT 'Regular Season',
  category TEXT,                -- e.g. "Boys U13"
  notes TEXT,
  postpone_reason TEXT,
  scorekeeper_id UUID REFERENCES profiles(id),
  rescheduled_from UUID REFERENCES games(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view games" ON games FOR SELECT USING (true);
CREATE POLICY "Admins and scorekeepers manage games" ON games FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','commissioner','scorekeeper'))
);

-- ── STANDINGS ─────────────────────────────────────────────────────────────
CREATE TABLE standings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  division_id UUID REFERENCES divisions(id) ON DELETE CASCADE,
  team_name TEXT,               -- Denormalized for performance
  club_short_name TEXT,
  team_color TEXT,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  ties INT DEFAULT 0,
  points INT DEFAULT 0,
  points_for INT DEFAULT 0,
  points_against INT DEFAULT 0,
  games_played INT DEFAULT 0,
  point_diff INT GENERATED ALWAYS AS (points_for - points_against) STORED,
  form TEXT[] DEFAULT '{}',
  admin_override BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, division_id)
);
ALTER TABLE standings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view standings" ON standings FOR SELECT USING (true);
CREATE POLICY "Admins manage standings" ON standings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','commissioner'))
);

-- ── ANNOUNCEMENTS ─────────────────────────────────────────────────────────
CREATE TABLE announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT,
  category TEXT DEFAULT 'general',
  target_roles TEXT[] DEFAULT '{all}',
  target_divisions TEXT[] DEFAULT '{all}',
  is_pinned BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published announcements" ON announcements FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage announcements" ON announcements FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','commissioner'))
);

-- ── GAME REPORTS ──────────────────────────────────────────────────────────
CREATE TABLE game_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reference_num TEXT UNIQUE DEFAULT 'CMBA-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(FLOOR(RANDOM()*9999)::TEXT, 4, '0'),
  report_type TEXT NOT NULL CHECK (report_type IN ('concern','compliment')),
  game_id UUID REFERENCES games(id),
  submitter_name TEXT NOT NULL,
  submitter_email TEXT NOT NULL,
  submitter_phone TEXT,
  submitter_role TEXT,
  game_date DATE,
  division_name TEXT,
  home_team TEXT,
  away_team TEXT,
  venue_name TEXT,
  reported_parties TEXT[],
  official_category TEXT,
  description TEXT NOT NULL,
  evidence_urls TEXT[],
  acknowledged_policy BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'received'
    CHECK (status IN ('received','under_review','forwarded_scc','resolved_no_action','resolved_action_taken','dismissed','shared_executive')),
  admin_notes TEXT,
  assigned_to UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE game_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit game reports" ON game_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage game reports" ON game_reports FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','commissioner'))
);

-- ── DOCUMENTS ─────────────────────────────────────────────────────────────
CREATE TABLE documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  file_url TEXT,
  external_url TEXT,
  visible_to TEXT[] DEFAULT '{public}',
  season_id UUID REFERENCES seasons(id),
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view public documents" ON documents FOR SELECT USING ('{public}' && visible_to OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Admins manage documents" ON documents FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','commissioner'))
);

-- ── SAVED TEAMS ───────────────────────────────────────────────────────────
CREATE TABLE saved_teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  team_name TEXT,               -- Denormalized
  notify_scores BOOLEAN DEFAULT true,
  notify_schedule_changes BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, team_id)
);
ALTER TABLE saved_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own saved teams" ON saved_teams FOR ALL USING (auth.uid() = user_id);

-- ── SCHEDULE IMPORTS ──────────────────────────────────────────────────────
CREATE TABLE schedule_imports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  uploaded_by UUID REFERENCES profiles(id),
  filename TEXT,
  season_id UUID REFERENCES seasons(id),
  games_created INT DEFAULT 0,
  games_updated INT DEFAULT 0,
  games_skipped INT DEFAULT 0,
  errors JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE schedule_imports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view imports" ON schedule_imports FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','commissioner'))
);

-- ── TRIGGERS: auto-update standings on game score ─────────────────────────
CREATE OR REPLACE FUNCTION update_standings_after_score()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'final' AND NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL THEN
    -- Update home team standings
    INSERT INTO standings (team_id, division_id, team_name, wins, losses, ties, points, points_for, points_against, games_played, form)
    SELECT 
      NEW.home_team_id, NEW.division_id,
      (SELECT name FROM teams WHERE id = NEW.home_team_id),
      CASE WHEN NEW.home_score > NEW.away_score THEN 1 ELSE 0 END,
      CASE WHEN NEW.home_score < NEW.away_score THEN 1 ELSE 0 END,
      CASE WHEN NEW.home_score = NEW.away_score THEN 1 ELSE 0 END,
      CASE WHEN NEW.home_score > NEW.away_score THEN 2 WHEN NEW.home_score = NEW.away_score THEN 1 ELSE 0 END,
      NEW.home_score, NEW.away_score, 1,
      ARRAY[CASE WHEN NEW.home_score > NEW.away_score THEN 'W' WHEN NEW.home_score < NEW.away_score THEN 'L' ELSE 'T' END]
    ON CONFLICT (team_id, division_id) DO UPDATE SET
      wins = standings.wins + CASE WHEN NEW.home_score > NEW.away_score THEN 1 ELSE 0 END,
      losses = standings.losses + CASE WHEN NEW.home_score < NEW.away_score THEN 1 ELSE 0 END,
      ties = standings.ties + CASE WHEN NEW.home_score = NEW.away_score THEN 1 ELSE 0 END,
      points = standings.points + CASE WHEN NEW.home_score > NEW.away_score THEN 2 WHEN NEW.home_score = NEW.away_score THEN 1 ELSE 0 END,
      points_for = standings.points_for + NEW.home_score,
      points_against = standings.points_against + NEW.away_score,
      games_played = standings.games_played + 1,
      form = (ARRAY[CASE WHEN NEW.home_score > NEW.away_score THEN 'W' WHEN NEW.home_score < NEW.away_score THEN 'L' ELSE 'T' END] || standings.form)[1:5],
      updated_at = NOW()
    WHERE NOT standings.admin_override;

    -- Update away team standings  
    INSERT INTO standings (team_id, division_id, team_name, wins, losses, ties, points, points_for, points_against, games_played, form)
    SELECT 
      NEW.away_team_id, NEW.division_id,
      (SELECT name FROM teams WHERE id = NEW.away_team_id),
      CASE WHEN NEW.away_score > NEW.home_score THEN 1 ELSE 0 END,
      CASE WHEN NEW.away_score < NEW.home_score THEN 1 ELSE 0 END,
      CASE WHEN NEW.away_score = NEW.home_score THEN 1 ELSE 0 END,
      CASE WHEN NEW.away_score > NEW.home_score THEN 2 WHEN NEW.away_score = NEW.home_score THEN 1 ELSE 0 END,
      NEW.away_score, NEW.home_score, 1,
      ARRAY[CASE WHEN NEW.away_score > NEW.home_score THEN 'W' WHEN NEW.away_score < NEW.home_score THEN 'L' ELSE 'T' END]
    ON CONFLICT (team_id, division_id) DO UPDATE SET
      wins = standings.wins + CASE WHEN NEW.away_score > NEW.home_score THEN 1 ELSE 0 END,
      losses = standings.losses + CASE WHEN NEW.away_score < NEW.home_score THEN 1 ELSE 0 END,
      ties = standings.ties + CASE WHEN NEW.away_score = NEW.home_score THEN 1 ELSE 0 END,
      points = standings.points + CASE WHEN NEW.away_score > NEW.home_score THEN 2 WHEN NEW.away_score = NEW.home_score THEN 1 ELSE 0 END,
      points_for = standings.points_for + NEW.away_score,
      points_against = standings.points_against + NEW.home_score,
      games_played = standings.games_played + 1,
      form = (ARRAY[CASE WHEN NEW.away_score > NEW.home_score THEN 'W' WHEN NEW.away_score < NEW.home_score THEN 'L' ELSE 'T' END] || standings.form)[1:5],
      updated_at = NOW()
    WHERE NOT standings.admin_override;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_game_scored
  AFTER INSERT OR UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION update_standings_after_score();

-- ── SEED DATA ─────────────────────────────────────────────────────────────
INSERT INTO seasons (name, year, is_active) VALUES ('2025-26 Winter Season', 2025, true);
