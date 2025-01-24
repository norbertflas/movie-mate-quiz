export interface MovieRecommendation {
  id: number;
  title: string;
  overview: string;
  posterPath: string;
  releaseDate: string;
  voteAverage: number;
  genre: string;
  trailerUrl: string | null;
  explanations?: string[];
}

export interface QuizResultsProps {
  recommendations: MovieRecommendation[];
  isGroupQuiz?: boolean;
}
