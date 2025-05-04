
export interface StreamingService {
  id: string;
  name: string;
  logo_url: string | null;
}

/**
 * Interface for streaming platform data
 */
export interface StreamingPlatformData {
  /**
   * Name of the streaming service
   */
  service: string;
  
  /**
   * Whether the movie is available on this service
   */
  available: boolean;
  
  /**
   * Link to watch the movie on this service
   */
  link?: string;
  
  /**
   * Path to the logo icon for this service
   */
  logo?: string;
  
  /**
   * Date when the movie became available on this service
   */
  startDate?: string;
  
  /**
   * Date when the movie will leave this service (if applicable)
   */
  endDate?: string;
  
  /**
   * The TMDB ID of the movie (for building watch URLs)
   */
  tmdbId?: number;
  
  /**
   * Title of the movie (for building watch URLs)
   */
  title?: string;
  
  /**
   * Price of the movie on this service
   */
  price?: number;
  
  /**
   * Type of availability (subscription, rent, etc.)
   */
  type?: 'subscription' | 'rent' | 'buy' | 'addon' | 'free';
  
  /**
   * Source of the streaming data (API name)
   */
  source?: string;
}

/**
 * Interface for user's streaming service preferences
 */
export interface UserStreamingPreferences {
  /**
   * List of streaming services the user has access to
   */
  services: string[];
  
  /**
   * When these preferences were last updated
   */
  lastUpdated?: string;
  
  /**
   * The region/country for streaming availability
   */
  region?: string;
}

export interface StreamingAvailabilityCache {
  data: StreamingPlatformData[];
  timestamp: number;
}

export interface StreamingAvailabilityData {
  services: StreamingPlatformData[];
  timestamp: string;
  isStale: boolean;
}
