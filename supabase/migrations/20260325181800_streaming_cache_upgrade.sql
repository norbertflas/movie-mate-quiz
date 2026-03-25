-- Add missing columns to streaming_cache for edge function compatibility
ALTER TABLE public.streaming_cache ADD COLUMN IF NOT EXISTS cached_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.streaming_cache ADD COLUMN IF NOT EXISTS hit_count INTEGER DEFAULT 0;
ALTER TABLE public.streaming_cache ADD COLUMN IF NOT EXISTS last_accessed TIMESTAMPTZ DEFAULT now();

-- Update RLS: allow service_role (edge functions) and anon to insert/update/upsert
DROP POLICY IF EXISTS "Streaming cache insertable by authenticated" ON public.streaming_cache;
DROP POLICY IF EXISTS "Streaming cache updatable by authenticated" ON public.streaming_cache;
CREATE POLICY "Streaming cache writable by all" ON public.streaming_cache FOR ALL USING (true) WITH CHECK (true);

-- System settings table (for emergency mode flag)
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "System settings readable by all" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "System settings writable by all" ON public.system_settings FOR ALL USING (true) WITH CHECK (true);

-- Update API usage stats RLS to allow edge functions (service_role) to write
DROP POLICY IF EXISTS "API stats insertable by authenticated" ON public.api_usage_stats;
DROP POLICY IF EXISTS "API stats updatable by authenticated" ON public.api_usage_stats;
CREATE POLICY "API stats writable by all" ON public.api_usage_stats FOR ALL USING (true) WITH CHECK (true);
