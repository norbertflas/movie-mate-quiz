
export interface QuizPreferences {
  platforms: string[];
  genres: string[];
  era: string;
  length: string;
  rating: string;
}

export interface StreamingService {
  service: string;
  type: 'subscription' | 'rent' | 'buy';
  link: string;
  logo?: string;
}

export interface MovieRecommendation {
  id: number;
  title: string;
  year: number;
  poster: string;
  overview: string;
  genres: string[];
  rating: number;
  streaming: StreamingService[];
  tmdbId: number;
  backdrop?: string;
}

export interface GenreMapping {
  [key: string]: number;
}

export const TMDB_GENRE_MAPPING: GenreMapping = {
  'Action': 28,
  'Comedy': 35,
  'Drama': 18,
  'Horror': 27,
  'Sci-Fi': 878,
  'Romance': 10749,
  'Thriller': 53,
  'Animation': 16,
  'Documentary': 99,
  'Fantasy': 14
};

export const SERVICE_LINKS = {
  'Netflix': 'https://netflix.com',
  'Amazon Prime Video': 'https://amazon.com/prime-video',
  'Disney+': 'https://disneyplus.com',
  'Hulu': 'https://hulu.com',
  'HBO Max': 'https://max.com',
  'Apple TV+': 'https://tv.apple.com',
  'Paramount+': 'https://paramountplus.com'
};
