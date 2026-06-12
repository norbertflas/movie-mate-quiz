-- Purge the streaming availability cache.
--
-- Previous implementations poisoned this table with:
--  * fabricated "fallback" platform lists (sources: emergency_fallback,
--    rate_limited_fallback, api_error_fallback, error_fallback) cached
--    for up to 30 days,
--  * always-empty results from a parser that read the v3 API response
--    shape from v4 responses (source: movieofthenight_api).
-- It is a cache, so a full purge is safe — entries will be rebuilt with
-- correct data by the streaming-availability-pro edge function.
DELETE FROM public.streaming_cache;

-- Deactivate the emergency mode flag that forced fallback data
DELETE FROM public.system_settings WHERE key = 'emergency_mode';
