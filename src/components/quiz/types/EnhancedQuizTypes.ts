
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

// Rozszerzone interfejsy dla analityki i trackingu
export interface QuizAnalytics {
  sessionId: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  completionRate: number; // 0-1
  averageResponseTime: number; // ms
  mostSkippedQuestions: string[];
  preferredAnswerTypes: string[];
  deviceInfo?: {
    userAgent: string;
    screenSize: string;
    isMobile: boolean;
  };
}

export interface RecommendationFeedback {
  sessionId: string;
  movieId: number;
  rating: number; // 1-5
  watched: boolean;
  savedForLater: boolean;
  shared: boolean;
  feedback?: string;
  relevanceScore?: number; // 0-1, jak trafna była rekomendacja
}

export interface QuizPerformanceMetrics {
  totalSessions: number;
  completionRate: number;
  averageSessionTime: number;
  popularAnswers: Record<string, number>;
  recommendationSuccessRate: number;
  userSatisfactionScore: number;
}

// Interfejsy dla zaawansowanego systemu rekomendacji
export interface UserPreferenceProfile {
  userId: string;
  genres: Record<string, number>; // gatunek -> preferencja (0-1)
  moods: Record<string, number>;
  platforms: string[];
  preferredRuntime: { min: number; max: number };
  preferredReleaseYears: { min: number; max: number };
  preferredLanguages: string[];
  watchingHabits: {
    preferredTime: string[];
    preferredCompany: string[];
    bingingBehavior: 'single' | 'series' | 'mixed';
  };
  lastUpdated: Date;
}

export interface ContextualRecommendation {
  movieRecommendation: EnhancedMovieRecommendation;
  contextScore: number; // 0-1, jak dobrze pasuje do kontekstu
  reasoning: string[];
  confidence: number; // 0-1
  alternatives: number[]; // TMDB IDs alternatywnych filmów
  timeRelevance: number; // 0-1, czy pasuje do pory dnia/roku
  socialRelevance: number; // 0-1, czy pasuje do wybranego towarzystwa
}
