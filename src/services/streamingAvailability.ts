import { supabase } from "@/integrations/supabase/client";
import type { StreamingPlatformData, StreamingAvailabilityCache } from "@/types/streaming";
import axios from 'axios';
import i18n from "@/i18n";
import { formatServiceLinks } from "@/utils/streamingServices";

const RETRY_DELAY = 2000;
const MAX_RETRIES = 3;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory cache for the current session
const localCache: Record<string, StreamingAvailabilityCache> = {};

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    console.error('Error in retryWithBackoff:', error);

    if (retries === 0) {
      throw error;
    }

    const errorBody = typeof error.body === 'string' ? JSON.parse(error.body) : error.body;
    
    if (error?.status === 429 || error?.message?.includes('429')) {
      const retryAfter = (errorBody?.retryAfter || 60) * 1000;
      console.log(`Rate limit hit, waiting ${retryAfter}ms before retry`);
      await sleep(retryAfter);
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }

    await sleep(delay);
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

// Implementation using the Movie of the Night Streaming Availability API
async function fetchStreamingAvailabilityAPI(
  tmdbId: number,
  country: string = 'us'
): Promise<StreamingPlatformData[]> {
  try {
    // Check local memory cache first
    const cacheKey = `${tmdbId}-${country}`;
    if (localCache[cacheKey] && (Date.now() - localCache[cacheKey].timestamp) < CACHE_DURATION) {
      console.log('Using memory cached streaming data for:', tmdbId);
      return localCache[cacheKey].data;
    }
    
    // API key for Streaming Availability
    const rapidApiKey = '670d047a2bmsh3dff18a0b6211fcp17d3cdjsn9d8d3e10bfc9';
    
    console.log(`Fetching Movie of the Night API for TMDB ID: ${tmdbId} in country: ${country}`);
    
    // First try the direct shows endpoint with TMDB ID
    try {
      const options = {
        method: 'GET',
        url: `https://streaming-availability.p.rapidapi.com/shows/movie/${tmdbId}`,
        params: {
          country: country.toLowerCase(),
          output_language: i18n.language || 'en'
        },
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
        }
      };

      const response = await axios.request(options);
      console.log('Got response from Movie of the Night direct endpoint', { status: response.status });
      
      if (response.data) {
        // This endpoint returns a single movie object, not an array
        return processMovieResponse([response.data], country);
      }
    } catch (error) {
      console.error('Error with direct ID endpoint, trying search endpoint:', error);
    }
    
    // If direct ID fails, try the shows/search/title endpoint with TMDB ID
    try {
      const options = {
        method: 'GET',
        url: 'https://streaming-availability.p.rapidapi.com/shows/search/title',
        params: {
          title: `movie/${tmdbId}`, // Try using the TMDB ID format
          country: country.toLowerCase(),
          output_language: i18n.language || 'en',
          show_type: 'movie'
        },
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-Rapid
