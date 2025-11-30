-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create user roles enum and table for admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Security definer function for role checking (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create sheet_candidates table (synced from Google Sheets)
CREATE TABLE public.sheet_candidates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  age INTEGER,
  bio TEXT,
  instagram TEXT,
  image_url TEXT,
  official_photo_url TEXT,
  portrait_url TEXT,
  ranking TEXT DEFAULT 'inconnu',
  is_semi_finalist BOOLEAN DEFAULT FALSE,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sheet_candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view candidates"
  ON public.sheet_candidates FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert candidates"
  ON public.sheet_candidates FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update candidates"
  ON public.sheet_candidates FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete candidates"
  ON public.sheet_candidates FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create predictions table for user predictions
CREATE TABLE public.predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  predictions TEXT[] NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own predictions"
  ON public.predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own predictions"
  ON public.predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own predictions"
  ON public.predictions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own predictions"
  ON public.predictions FOR DELETE
  USING (auth.uid() = user_id);

-- Create scores table for leaderboard
CREATE TABLE public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  score INTEGER DEFAULT 0,
  perfect_match BOOLEAN DEFAULT FALSE,
  scored_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view scores"
  ON public.scores FOR SELECT
  USING (true);

-- Create official_results table for admin to set results
CREATE TABLE public.official_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  semi_finalists TEXT[],
  final_ranking TEXT[],
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.official_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view official results"
  ON public.official_results FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert official results"
  ON public.official_results FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update official results"
  ON public.official_results FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for scores table (for live leaderboard updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.scores;

-- Create trigger function for automatic profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username');
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();