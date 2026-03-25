
import { supabase } from "@/integrations/supabase/client";
import type { StreamingPlatformData } from "@/types/streaming";
import { getUserRegion } from "@/utils/regionDetection";

const CACHE_VERSION = 'v4';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
const ERROR_CACHE_TTL = 60 * 60 * 1000; // 1 hour for errors/empty results

interface LocalCacheEntry {
  data: StreamingPlatformData[];
  timestamp: number;
  hasData: boolean;
}

function getCacheKey(tmdbId: number, region: string): string {
  return `streaming_${CACHE_VERSION}_${tmdbId}_${region.toLowerCase()}`;
}

function getFromLocalCache(tmdbId: number, region: string): StreamingPlatformData[] | null {
  try {
    const key = getCacheKey(tmdbId, region);
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const entry: LocalCacheEntry = JSON.parse(raw);
    const age = Date.now() - entry.timestamp;
    const maxAge = entry.hasData ? CACHE_TTL : ERROR_CACHE_TTL;

    if (age > maxAge) {
      localStorage.removeItem(key);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

function setToLocalCache(tmdbId: number, region: string, data: StreamingPlatformData[]): void {
  try {
    const key = getCacheKey(tmdbId, region);
    const entry: LocalCacheEntry = {
      data,
      timestamp: Date.now(),
      hasData: data.length > 0
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.warn('[streamingAvailability] Failed to write localStorage:', error);
  }
}

/**
 * Get streaming availability for a movie.
 * Uses localStorage cache (7 days) → Supabase edge function (MovieOfTheNight API with server-side cache).
 */
export async function getStreamingAvailability(
  tmdbId: number,
  title?: string,
  year?: string,
  region?: string
): Promise<StreamingPlatformData[]> {
  try {
    const userRegion = region || await getUserRegion();
    const normalizedRegion = userRegion.toUpperCase();
    
    console.log(`[getStreamingAvailability] TMDB ID: ${tmdbId}, region: ${normalizedRegion}`);

    // Step 1: Check localStorage cache
    const cached = getFromLocalCache(tmdbId, normalizedRegion);
    if (cached !== null) {
      console.log(`[getStreamingAvailability] localStorage cache HIT (${cached.length} services)`);
      return cached;
    }

    // Step 2: Call Supabase edge function (has its own server-side cache + MovieOfTheNight API)
    console.log('[getStreamingAvailability] Calling edge function streaming-availability');

    const { data, error } = await supabase.functions.invoke('streaming-availability', {
      body: {
        tmdbId,
        country: normalizedRegion,
        title: title?.trim(),
        year: year ? parseInt(year, 10) : undefined
      }
    });

    if (error) {
      console.error('[getStreamingAvailability] Edge function error:', error);
      setToLocalCache(tmdbId, normalizedRegion, []);
      return [];
    }

    if (!data || data.error) {
      console.warn('[getStreamingAvailability] No data or API error:', data?.error);
      setToLocalCache(tmdbId, normalizedRegion, []);
      return [];
    }

    const services: StreamingPlatformData[] = (data.result || [])
      .filter((s: any) => s && s.service && s.service !== 'Unknown' && s.service.trim() !== '')
      .map((s: any) => ({
        service: s.service,
        available: s.available ?? true,
        link: s.link || '#',
        type: s.type || 'subscription',
        source: data.source || 'streaming-availability-api',
        quality: s.quality,
        price: s.price ? (typeof s.price === 'object' ? s.price.amount : s.price) : undefined,
        logo: `/streaming-icons/${(s.service || 'unknown').toLowerCase().replace(/\s+/g, '')}.svg`
      }));

    console.log(`[getStreamingAvailability] Got ${services.length} services from ${data.source || 'api'} for ${normalizedRegion}`);

    // Step 3: Save to localStorage cache
    setToLocalCache(tmdbId, normalizedRegion, services);

    return services;
  } catch (error) {
    console.error('[getStreamingAvailability] Error:', error);
    return [];
  }
}
