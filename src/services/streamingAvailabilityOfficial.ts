
import * as streamingAvailability from "streaming-availability";
import type { StreamingPlatformData } from "@/types/streaming";

const RAPID_API_KEY = "670d047a2bmsh3dff18a0b6211fcp17d3cdjsn9d8d3e10bfc9";

interface StreamingOption {
  service: streamingAvailability.Service;
  link: string;
  type: 'subscription' | 'rent' | 'buy' | 'free';
  quality: string;
  price?: {
    amount: string;
    currency: string;
    formatted: string;
  };
  audios: streamingAvailability.Locale[];
  subtitles: streamingAvailability.Locale[];
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
            service: option.service,
            link: option.link,
            type: option.type as any,
            quality: option.quality || 'hd',
            price: option.price ? {
              amount: option.price.amount.toString(),
              currency: option.price.currency,
              formatted: option.price.formatted
            } : undefined,
            audios: option.audios || [],
            subtitles: option.subtitles || []
          });

          const serviceName = option.service.name || option.service.id;
          if (serviceName && !availableServices.includes(serviceName)) {
            availableServices.push(serviceName);
          }
        }
      }

      const movieData: MovieStreamingData = {
        tmdbId: show.tmdbId || tmdbId,
        title: show.title || title || 'Unknown',
        year: show.releaseYear || new Date().getFullYear(),
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
      price: option.price?.formatted,
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

      const serviceIds = services.map(service => 
        service.toLowerCase().replace(/\s+/g, '')
      );

      const searchResults = this.client.searchShowsByFiltersWithAutoPagination({
        country: country,
        showType: streamingAvailability.ShowType.Movie,
        genres: genres as any[],
        catalogs: serviceIds.length > 0 ? serviceIds : undefined,
        orderBy: streamingAvailability.OrderBy.PopularityAllTime,
        yearMin: 1990,
        yearMax: new Date().getFullYear(),
        ratingMin: 60
      }, Math.ceil(limit / 10));

      const results: MovieStreamingData[] = [];
      let count = 0;

      for await (const show of searchResults) {
        if (count >= limit) break;

        const streamingOptions: StreamingOption[] = [];
        const availableServices: string[] = [];

        if (show.streamingOptions && show.streamingOptions[country]) {
          const countryOptions = show.streamingOptions[country];
          
          for (const option of countryOptions) {
            streamingOptions.push({
              service: option.service,
              link: option.link,
              type: option.type as any,
              quality: option.quality || 'hd',
              price: option.price ? {
                amount: option.price.amount.toString(),
                currency: option.price.currency,
                formatted: option.price.formatted
              } : undefined,
              audios: option.audios || [],
              subtitles: option.subtitles || []
            });

            const serviceName = option.service.name || option.service.id;
            if (serviceName && !availableServices.includes(serviceName)) {
              availableServices.push(serviceName);
            }
          }
        }

        results.push({
          tmdbId: show.tmdbId!,
          title: show.title,
          year: show.releaseYear || 0,
          country,
          streamingOptions,
          availableServices,
          hasStreaming: streamingOptions.length > 0,
          posterUrl: show.imageSet?.verticalPoster?.w360,
          backdropUrl: show.imageSet?.horizontalPoster?.w1080,
          rating: show.rating
        });

        count++;
      }

      console.log(`[Official API Search Results] Found ${results.length} movies`);
      return results;

    } catch (error) {
      console.error('[Official API Search Error]:', error);
      return [];
    }
  }

  async getAvailableServices(country: string = 'pl'): Promise<streamingAvailability.Service[]> {
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
