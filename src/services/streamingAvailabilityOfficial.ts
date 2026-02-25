
import * as streamingAvailability from "streaming-availability";
import type { StreamingPlatformData } from "@/types/streaming";

const RAPID_API_KEY = import.meta.env.VITE_RAPIDAPI_KEY || "";

interface StreamingOption {
  service: {
    id: string;
    name: string;
  };
  link: string;
  type: 'subscription' | 'rent' | 'buy' | 'free';
  quality: string;
  price?: {
    amount: string;
    currency: string;
    formatted: string;
  };
  audios: { language: string }[];
  subtitles: { language: string }[];
}

interface MovieStreamingData {
  tmdbId: number;
  title: string;
  year: number;
  country: string;
  streamingOptions: StreamingOption[];
  availableServices: string[];
  hasStreaming: boolean;
  posterUrl?: string;
  backdropUrl?: string;
  rating?: number;
}

class OfficialStreamingService {
  private client: streamingAvailability.ShowsApi;
  private countriesApi: streamingAvailability.CountriesApi;
  private cache: Map<string, { data: MovieStreamingData; timestamp: number }> = new Map();
  private readonly cacheDuration = 24 * 60 * 60 * 1000; // 24h

  constructor() {
    this.client = new streamingAvailability.ShowsApi(
      new streamingAvailability.Configuration({
        apiKey: RAPID_API_KEY
      })
    );
    
    this.countriesApi = new streamingAvailability.CountriesApi(
      new streamingAvailability.Configuration({
        apiKey: RAPID_API_KEY
      })
    );
  }

  async getMovieStreaming(
    tmdbId: number, 
    country: string = 'pl',
    title?: string
  ): Promise<StreamingPlatformData[]> {
    const cacheKey = `${tmdbId}-${country}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      const age = Date.now() - cached.timestamp;
      if (age < this.cacheDuration) {
        console.log(`[Official API Cache Hit] TMDB: ${tmdbId}, Country: ${country}`);
        return this.convertToStreamingPlatformData(cached.data);
      }
    }

    try {
      console.log(`[Official API Call] Fetching TMDB: ${tmdbId}, Country: ${country}`);
      
      const show = await this.client.getShow({
        id: tmdbId.toString(),
        country: country
      });

      const streamingOptions: StreamingOption[] = [];
      const availableServices: string[] = [];

      if (show.streamingOptions && show.streamingOptions[country]) {
        const countryOptions = show.streamingOptions[country];
        
        for (const option of countryOptions) {
          streamingOptions.push({
            service: {
              id: option.service.id,
              name: option.service.name || option.service.id
            },
            link: option.link,
            type: option.type as any,
            quality: option.quality || 'hd',
            price: option.price ? {
              amount: option.price.amount.toString(),
              currency: option.price.currency,
              formatted: option.price.formatted
            } : undefined,
            audios: (option.audios || []).map(audio => ({ 
              language: (audio as any).locale || (audio as any).language || 'unknown' 
            })),
            subtitles: (option.subtitles || []).map(subtitle => ({ 
              language: (subtitle as any).locale || (subtitle as any).language || 'unknown' 
            }))
          });

          const serviceName = option.service.name || option.service.id;
          if (serviceName && !availableServices.includes(serviceName)) {
            availableServices.push(serviceName);
          }
        }
      }

      // Convert year to number, handling both string and number types
      let releaseYear = new Date().getFullYear();
      if (show.releaseYear) {
        if (typeof show.releaseYear === 'number') {
          releaseYear = show.releaseYear;
        } else if (typeof show.releaseYear === 'string') {
          const parsedYear = parseInt(show.releaseYear, 10);
          if (!isNaN(parsedYear)) {
            releaseYear = parsedYear;
          }
        }
      }

      // Convert tmdbId to number, handling both string and number types
      let movieTmdbId = tmdbId;
      if (show.tmdbId) {
        if (typeof show.tmdbId === 'number') {
          movieTmdbId = show.tmdbId;
        } else if (typeof show.tmdbId === 'string') {
          const parsedId = parseInt(show.tmdbId, 10);
          if (!isNaN(parsedId)) {
            movieTmdbId = parsedId;
          }
        }
      }

      const movieData: MovieStreamingData = {
        tmdbId: movieTmdbId,
        title: show.title || title || 'Unknown',
        year: releaseYear,
        country: country,
        streamingOptions,
        availableServices,
        hasStreaming: streamingOptions.length > 0,
        posterUrl: show.imageSet?.verticalPoster?.w360,
        backdropUrl: show.imageSet?.horizontalPoster?.w1080,
        rating: show.rating || undefined
      };

      // Cache result
      this.cache.set(cacheKey, { data: movieData, timestamp: Date.now() });
      
      console.log(`[Official API Success] Found ${streamingOptions.length} streaming options for ${show.title}`);
      
      return this.convertToStreamingPlatformData(movieData);

    } catch (error) {
      console.error(`[Official API Error] Failed to fetch streaming data for TMDB ${tmdbId}:`, error);
      return [];
    }
  }

  private convertToStreamingPlatformData(movieData: MovieStreamingData): StreamingPlatformData[] {
    return movieData.streamingOptions.map(option => ({
      service: option.service.name || option.service.id,
      link: option.link,
      available: true,
      type: option.type,
      source: 'streaming-availability-official',
      quality: option.quality,
      price: option.price ? parseFloat(option.price.amount) || 0 : 0,
      logo: `/streaming-icons/${(option.service.name || option.service.id)?.toLowerCase().replace(/\s+/g, '') || 'unknown'}.svg`,
      tmdbId: movieData.tmdbId
    }));
  }

  async searchMoviesByGenreAndStreaming(
    country: string = 'pl',
    genres: string[] = [],
    services: string[] = [],
    limit: number = 20
  ): Promise<MovieStreamingData[]> {
    try {
      console.log(`[Official API Search] Genre: ${genres.join(',')}, Services: ${services.join(',')}, Country: ${country}`);

      // Use basic search for now
      const results: MovieStreamingData[] = [];
      
      // This is a simplified implementation - in real usage you'd use the proper search API
      console.log(`[Official API Search Results] Found ${results.length} movies`);
      return results;

    } catch (error) {
      console.error('[Official API Search Error]:', error);
      return [];
    }
  }

  async getAvailableServices(country: string = 'pl'): Promise<any[]> {
    try {
      const countryData = await this.countriesApi.getCountry({
        countryCode: country
      });

      return countryData.services || [];
    } catch (error) {
      console.error(`[Official API Error] Failed to fetch services for ${country}:`, error);
      return [];
    }
  }
}

// Create singleton instance
const officialStreamingService = new OfficialStreamingService();

// Export function that matches existing interface
export async function getStreamingAvailabilityOfficial(
  tmdbId: number,
  title?: string,
  year?: string,
  region: string = 'us'
): Promise<StreamingPlatformData[]> {
  return await officialStreamingService.getMovieStreaming(tmdbId, region.toLowerCase(), title);
}

export { officialStreamingService };
