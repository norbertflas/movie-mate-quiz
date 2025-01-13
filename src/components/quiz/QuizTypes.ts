export type SurveyStepType = {
  id: string;
  question: string;
  type: "single" | "multiple";
  options: string[];
  getDynamicOptions?: (answers: Record<string, any>) => string[];
  shouldShow?: (answers: Record<string, any>) => boolean;
};

export type MovieRecommendation = {
  id: number;
  tmdbId?: number;
  title: string;
  year: string;
  platform: string;
  genre: string;
  imageUrl: string;
  description: string;
  trailerUrl: string;
  rating: number;
  tags?: string[];
  score?: number;
  explanations?: string[];
};

export type QuizAnswer = {
  questionId: string;
  answer: string;
};

export interface QuizResultsProps {
  recommendations: MovieRecommendation[];
  isGroupQuiz?: boolean;
}