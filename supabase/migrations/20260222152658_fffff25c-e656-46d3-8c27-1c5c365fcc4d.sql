
-- Streaming services table
CREATE TABLE public.streaming_services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.streaming_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Streaming services are viewable by everyone" ON public.streaming_services FOR SELECT USING (true);

-- User streaming preferences
CREATE TABLE public.user_streaming_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  service_id TEXT NOT NULL REFERENCES public.streaming_services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, service_id)
);
ALTER TABLE public.user_streaming_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own preferences" ON public.user_streaming_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON public.user_streaming_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own preferences" ON public.user_streaming_preferences FOR DELETE USING (auth.uid() = user_id);

-- Favorite creators
CREATE TABLE public.favorite_creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  tmdb_person_id INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.favorite_creators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own creators" ON public.favorite_creators FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own creators" ON public.favorite_creators FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own creators" ON public.favorite_creators FOR DELETE USING (auth.uid() = user_id);

-- Watched movies
CREATE TABLE public.watched_movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tmdb_id INTEGER NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  rating NUMERIC,
  watched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.watched_movies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own watched" ON public.watched_movies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own watched" ON public.watched_movies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own watched" ON public.watched_movies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own watched" ON public.watched_movies FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anon can select watched for collaborative filtering" ON public.watched_movies FOR SELECT TO anon USING (true);

-- Saved movies (favorites)
CREATE TABLE public.saved_movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tmdb_id INTEGER NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  poster_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, tmdb_id)
);
ALTER TABLE public.saved_movies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own saved" ON public.saved_movies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved" ON public.saved_movies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved" ON public.saved_movies FOR DELETE USING (auth.uid() = user_id);

-- Quiz history
CREATE TABLE public.quiz_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.quiz_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own quiz history" ON public.quiz_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz history" ON public.quiz_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Quiz groups
CREATE TABLE public.quiz_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.quiz_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own groups" ON public.quiz_groups FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can insert own groups" ON public.quiz_groups FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Streaming cache
CREATE TABLE public.streaming_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER NOT NULL,
  country TEXT NOT NULL DEFAULT 'us',
  streaming_data JSONB,
  source TEXT DEFAULT 'api',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tmdb_id, country)
);
ALTER TABLE public.streaming_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Streaming cache readable by all" ON public.streaming_cache FOR SELECT USING (true);
CREATE POLICY "Streaming cache insertable by authenticated" ON public.streaming_cache FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Streaming cache updatable by authenticated" ON public.streaming_cache FOR UPDATE TO authenticated USING (true);

-- API usage stats
CREATE TABLE public.api_usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  daily_calls INTEGER NOT NULL DEFAULT 0,
  hourly_calls INTEGER NOT NULL DEFAULT 0,
  minute_calls INTEGER NOT NULL DEFAULT 0,
  last_call_hour INTEGER DEFAULT 0,
  last_call_minute INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(service, date)
);
ALTER TABLE public.api_usage_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "API stats readable by all" ON public.api_usage_stats FOR SELECT USING (true);
CREATE POLICY "API stats insertable by authenticated" ON public.api_usage_stats FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "API stats updatable by authenticated" ON public.api_usage_stats FOR UPDATE TO authenticated USING (true);

-- Recreate the increment function
CREATE OR REPLACE FUNCTION public.increment_api_usage(p_service text, p_date date, p_hour integer, p_minute integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO api_usage_stats (service, date, daily_calls, hourly_calls, minute_calls, last_call_hour, last_call_minute)
  VALUES (p_service, p_date, 1, 1, 1, p_hour, p_minute)
  ON CONFLICT (service, date) 
  DO UPDATE SET
    daily_calls = api_usage_stats.daily_calls + 1,
    hourly_calls = CASE 
      WHEN api_usage_stats.last_call_hour = p_hour THEN api_usage_stats.hourly_calls + 1
      ELSE 1
    END,
    minute_calls = CASE 
      WHEN api_usage_stats.last_call_minute = p_minute THEN api_usage_stats.minute_calls + 1
      ELSE 1
    END,
    last_call_hour = p_hour,
    last_call_minute = p_minute,
    updated_at = NOW();
END;
$$;

-- Seed streaming services
INSERT INTO public.streaming_services (id, name, logo_url) VALUES
  ('netflix', 'Netflix', '/streaming-icons/netflix.svg'),
  ('disney', 'Disney+', '/streaming-icons/disneyplus.svg'),
  ('hbomax', 'Max', '/streaming-icons/max.svg'),
  ('prime', 'Amazon Prime Video', '/streaming-icons/prime.svg'),
  ('hulu', 'Hulu', '/streaming-icons/hulu.svg'),
  ('appletv', 'Apple TV+', '/streaming-icons/appletv.svg'),
  ('paramount', 'Paramount+', '/streaming-icons/paramount.svg')
ON CONFLICT (id) DO NOTHING;
