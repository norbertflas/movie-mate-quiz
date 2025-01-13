export interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  video_id?: string;
  genres: Array<{ id: number; name: string; }>;
}

export interface TMDBDiscoverParams {
  genres?: string[];
  minVoteCount?: number;
  minVoteAverage?: number;
  releaseDateGte?: string;
  releaseDateLte?: string;
  sortBy?: string;
  page?: number;
  language?: string;
  region?: string;
  includeAdult?: boolean;
  withKeywords?: string;
}

export interface TMDBRecommendationParams {
  page?: number;
  language?: string;
  region?: string;
}
