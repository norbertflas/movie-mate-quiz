
import type { StreamingPlatformData } from "@/types/streaming";
import { detectUserRegion } from "@/utils/regionDetection";
import {
  getStreamingAvailabilitySingle,
  type MovieStreamingData
} from "@/services/streamingAvailabilityPro";

/**
 * Get streaming availability for a movie.
 *
 * Thin compatibility wrapper around the unified "pro" pipeline
 * (localStorage cache → streaming-availability-pro edge function
 * with server-side cache → TMDB watch providers → RapidAPI).
 * Returns real data only — no fabricated fallbacks. An empty array
 * means the title is genuinely unavailable in the user's region.
 */
export async function getStreamingAvailability(
  tmdbId: number,
  _title?: string,
  _year?: string,
  region?: string
): Promise<StreamingPlatformData[]> {
  try {
    if (!tmdbId || tmdbId <= 0) return [];

    const userRegion = (region || detectUserRegion()).toLowerCase();
    const data: MovieStreamingData | null = await getStreamingAvailabilitySingle(tmdbId, userRegion);

    if (!data) return [];

    return data.streamingOptions.map(option => ({
      service: option.service,
      available: true,
      link: option.link,
      type: option.type,
      source: 'streaming-availability-pro',
      quality: option.quality,
      price: option.price?.amount,
      logo: option.serviceLogo,
      tmdbId,
      title: data.title || _title
    }));
  } catch (error) {
    console.error('[getStreamingAvailability] Error:', error);
    return [];
  }
}
