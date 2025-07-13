
// =============================================================================
// ROZSZERZONE TYPY DLA SYSTEMU QUIZ
// =============================================================================

export interface StreamingAvailability {
  service: string;
  link: string;
  available: boolean;
  type: 'subscription' | 'rent' | 'buy' | 'free';
  price?: string;
  quality?: 'sd' | 'hd' | '4k';
  region: string;
  source?: 'watchmode' | 'streaming-availability' | 'manual';
}

export interface EnhancedMovieRecommendation {
  id: number;
  tmdbId?: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path?: string;
  release_date: string;
  vote_average: number;
  vote_count?: number;
  genre: string;
  genres?: string[];
  trailer_url: string | null;
  
  // Informacje o typie treści
  type?: 'movie' | 'tv' | 'documentary';
  runtime?: number;
  
  // Dla seriali
  seasons?: number;
  episodesPerSeason?: number;
  episodeLength?: string;
  status?: 'ended' | 'ongoing' | 'cancelled';
  
  // Dostępność streamingowa
  streamingAvailability?: StreamingAvailability[];
  availableOn?: string[];
  primaryPlatform?: string;
  
  // Scoring i dopasowanie
  recommendationScore?: number;
  matchReasons?: string[];
  personalityMatch?: number; // 0-100%
  
  // Metadane
  mood?: string;
  explanations?: string[];
  alternativeRegions?: string[];
  originalLanguage?: string;
  spokenLanguages?: string[];
  
  // Dodatkowe informacje
  director?: string;
  cast?: string[];
  keywords?: string[];
  similar?: number[]; // TMDB IDs podobnych filmów
  ageRating?: string;
  
  // Analytics
  popularityTrend?: 'rising' | 'stable' | 'declining';
  userInteractions?: {
    likes?: number;
    dislikes?: number;
    watchedCount?: number;
  };
}

export interface EnhancedQuizAnswer {
  questionId: string;
  answer: string;
  confidence?: number; // 0-1, jak pewny jest użytkownik odpowiedzi
  metadata?: {
    timestamp?: string;
    responseTime?: number; // ms
    alternativeAnswers?: string[]; // odpowiedzi które rozważał
  };
}

export interface QuizSession {
  id: string;
  userId?: string;
  startTime: string;
  endTime?: string;
  region: string;
  answers: EnhancedQuizAnswer[];
  recommendations: EnhancedMovieRecommendation[];
  satisfaction?: number; // 1-5 rating
  feedback?: string;
}

export interface EnhancedQuizFilters {
  // Podstawowe filtry
  platforms: string[];
  contentType: 'movie' | 'series' | 'documentary' | 'animation' | 'notSure';
  mood: string;
  genres: string[];
  
  // Geograficzne i językowe
  region: string;
  languages: string[];
  includeSubtitles?: boolean;
  preferDubbed?: boolean;
  
  // Filtry czasowe i jakościowe
  runtime?: { min?: number; max?: number };
  releaseYear?: { min?: number; max?: number };
  minRating?: number;
  maxResults?: number;
  includeStreamingInfo?: boolean;
  
  // Preferencje oglądania
  watchingTime?: 'now' | 'tonight' | 'weekend' | 'planning';
  watchingCompany?: 'alone' | 'partner' | 'family' | 'friends' | 'kids';
  
  // Dla seriali
  seriesPreferences?: {
    preferFinished?: boolean;
    maxSeasons?: number;
    episodeLength?: 'short' | 'standard' | 'long';
  };
}

export interface StreamingService {
  id: string;
  name: string;
  displayName: string;
  logo?: string;
  color?: string;
  regions: string[];
  types: ('subscription' | 'rent' | 'buy' | 'free')[];
  baseUrl?: string;
  popularity?: number;
}

export interface RegionInfo {
  code: string;
  name: string;
  currency: string;
  languages: string[];
  popularServices: string[];
  timezone?: string;
  contentRestrictions?: string[];
}

export const STREAMING_SERVICES: Record<string, StreamingService> = {
  netflix: {
    id: 'netflix',
    name: 'Netflix',
    displayName: 'Netflix',
    logo: '/logos/netflix.png',
    color: '#E50914',
    regions: ['US', 'PL', 'GB', 'DE', 'FR', 'CA', 'AU'],
    types: ['subscription'],
    baseUrl: 'https://www.netflix.com',
    popularity: 0.95
  },
  prime: {
    id: 'prime',
    name: 'Amazon Prime Video',
    displayName: 'Prime Video',
    logo: '/logos/prime.png',
    color: '#00A8E1',
    regions: ['US', 'PL', 'GB', 'DE', 'FR', 'CA', 'AU'],
    types: ['subscription', 'rent', 'buy'],
    baseUrl: 'https://www.primevideo.com',
    popularity: 0.85
  },
  disney: {
    id: 'disney',
    name: 'Disney+',
    displayName: 'Disney+',
    logo: '/logos/disney.png',
    color: '#113CCF',
    regions: ['US', 'PL', 'GB', 'DE', 'FR', 'CA', 'AU'],
    types: ['subscription'],
    baseUrl: 'https://www.disneyplus.com',
    popularity: 0.80
  },
  hbo: {
    id: 'hbo',
    name: 'HBO Max',
    displayName: 'HBO Max',
    logo: '/logos/hbo.png',
    color: '#8B5CF6',
    regions: ['US', 'PL', 'GB'],
    types: ['subscription'],
    baseUrl: 'https://www.hbomax.com',
    popularity: 0.75
  },
  apple: {
    id: 'apple',
    name: 'Apple TV+',
    displayName: 'Apple TV+',
    logo: '/logos/apple.png',
    color: '#000000',
    regions: ['US', 'PL', 'GB', 'DE', 'FR', 'CA', 'AU'],
    types: ['subscription'],
    baseUrl: 'https://tv.apple.com',
    popularity: 0.60
  },
  player: {
    id: 'player',
    name: 'Player.pl',
    displayName: 'Player.pl',
    logo: '/logos/player.png',
    color: '#FF6B35',
    regions: ['PL'],
    types: ['subscription', 'free'],
    baseUrl: 'https://player.pl',
    popularity: 0.70
  },
  canalplus: {
    id: 'canalplus',
    name: 'Canal+',
    displayName: 'Canal+',
    logo: '/logos/canal.png',
    color: '#000000',
    regions: ['PL', 'FR'],
    types: ['subscription'],
    baseUrl: 'https://canalplus.com',
    popularity: 0.65
  },
  tvp: {
    id: 'tvp',
    name: 'TVP VOD',
    displayName: 'TVP VOD',
    logo: '/logos/tvp.png',
    color: '#0066CC',
    regions: ['PL'],
    types: ['free', 'subscription'],
    baseUrl: 'https://vod.tvp.pl',
    popularity: 0.50
  }
};

export const REGION_INFO: Record<string, RegionInfo> = {
  US: {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    languages: ['en'],
    popularServices: ['netflix', 'prime', 'disney', 'hbo', 'hulu', 'apple'],
    timezone: 'America/New_York'
  },
  PL: {
    code: 'PL', 
    name: 'Poland',
    currency: 'PLN',
    languages: ['pl', 'en'],
    popularServices: ['netflix', 'prime', 'disney', 'hbo', 'player', 'canalplus'],
    timezone: 'Europe/Warsaw'
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom', 
    currency: 'GBP',
    languages: ['en'],
    popularServices: ['netflix', 'prime', 'disney', 'now', 'bbc', 'itv'],
    timezone: 'Europe/London'
  }
};

export const getServicesForRegion = (region: string): StreamingService[] => {
  return Object.values(STREAMING_SERVICES)
    .filter(service => service.regions.includes(region))
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
};

export const getRegionInfo = (region: string): RegionInfo | undefined => {
  return REGION_INFO[region];
};

export const detectUserRegion = (): string => {
  try {
    const savedRegion = localStorage.getItem('preferred-region');
    if (savedRegion && REGION_INFO[savedRegion]) {
      return savedRegion;
    }

    const browserLang = navigator.language.toLowerCase();
    if (browserLang.includes('pl')) return 'PL';
    if (browserLang.includes('de')) return 'DE';
    if (browserLang.includes('fr')) return 'FR';
    if (browserLang.includes('gb') || browserLang.includes('uk')) return 'GB';
    
    return 'US';
  } catch {
    return 'US';
  }
};

export const calculateRecommendationScore = (
  movie: EnhancedMovieRecommendation,
  filters: EnhancedQuizFilters,
  userPlatforms: string[]
): number => {
  let score = movie.vote_average * 10;

  const availableOnUserPlatforms = movie.availableOn?.filter(platform =>
    userPlatforms.some(userPlatform =>
      platform.toLowerCase().includes(userPlatform.toLowerCase())
    )
  ) || [];
  
  score += availableOnUserPlatforms.length * 15;

  const genreMatches = movie.genres?.filter(genre =>
    filters.genres.includes(genre)
  ) || [];
  score += genreMatches.length * 10;

  if (!movie.streamingAvailability?.length && filters.includeStreamingInfo) {
    score -= 25;
  }

  return Math.max(0, Math.min(100, score));
};

// Backward compatibility - zachowujemy stare typy
export type SurveyStepType = {
  id: string;
  question: string;
  subtitle?: string;
  type: "single" | "multiple";
  options: string[];
  getDynamicOptions?: (answers: Record<string, any>) => string[];
  shouldShow?: (answers: Record<string, any>) => boolean;
  weight?: number;
  category?: 'basic' | 'preference' | 'technical' | 'social';
};

export interface MovieRecommendation extends EnhancedMovieRecommendation {}

export type QuizAnswer = {
  questionId: string;
  answer: string;
};

export interface QuizResultsProps {
  recommendations: MovieRecommendation[];
  isGroupQuiz?: boolean;
}

export interface NavigationButtonsProps {
  currentStep: number;
  canGoNext: boolean;
  onNext: () => void;
  onPrevious: () => void;
  totalSteps: number;
  isLastStep: boolean;
  isSubmitting: boolean;
}

export interface QuizQuestionsProps {
  questions: SurveyStepType[];
  currentStep: number;
  onAnswer: (answer: string) => void;
  answers: QuizAnswer[];
  answerMap: Record<string, string>;
}

export interface QuizLogicHook {
  showQuiz: boolean;
  showResults: boolean;
  answers: QuizAnswer[];
  answerMap: Record<string, string>;
  recommendations: MovieRecommendation[];
  isLoading?: boolean;
  region?: string;
  handleStartQuiz: () => void;
  handleQuizComplete: (answers: QuizAnswer[]) => Promise<MovieRecommendation[]>;
  processAnswers: (answers: QuizAnswer[]) => Promise<MovieRecommendation[]>;
  changeRegion?: (newRegion: string) => void;
}
