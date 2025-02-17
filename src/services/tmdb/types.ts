
export interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  overview: string;
  poster_path: string;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  video_id?: string;
  genres?: Array<{ id: number; name: string; }>;
  explanations?: string[];
}

export interface TMDBPerson {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  birthday?: string;
  deathday?: string;
  place_of_birth?: string;
  biography?: string;
  known_for: Array<{
    id: number;
    title?: string;
    name?: string;
    media_type: string;
    popularity?: number;
  }>;
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
