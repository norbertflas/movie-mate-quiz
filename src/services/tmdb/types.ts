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

export interface TMDBPerson {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  known_for: Array<{
    id: number;
    title?: string;
    name?: string;
    media_type: string;
  }>;
}
