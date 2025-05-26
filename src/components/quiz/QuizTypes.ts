
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

// Backward compatibility - zachowujemy stare typy
export type SurveyStepType = {
  id: string;
  question: string;
  subtitle?: string;
  type: "single" | "multiple";
  options: string[];
  getDynamicOptions?: (answers: Record<string, any>) => string[];
  shouldShow?: (answers: Record<string, any>) => boolean;
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
