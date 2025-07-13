export interface QuizAnswer {
  questionId: string;
  answer: string | string[];
}

export interface MovieRecommendation {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genre: string;
  trailer_url: string | null;
}

export interface RequestData {
  answers?: QuizAnswer[];
  userId?: string;
  includeExplanations?: boolean;
  prompt?: string;
  selectedMovies?: Array<{
    id: number;
    title: string;
    genres?: number[];
  }>;
}