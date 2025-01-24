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
  tmdbId: number;
  title: string;
  year: string;
  platform: string;
  genre: string;
  imageUrl: string;
  description: string;
  trailerUrl: string;
  rating: number;
  score: number;
  explanations: string[];
  tags?: string[];
};

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
}

export interface QuizQuestionsProps {
  questions: SurveyStepType[];
  currentStep: number;
  onAnswer: (answer: string) => void;
  answers: QuizAnswer[];
}

export interface QuizLogicHook {
  showQuiz: boolean;
  showResults: boolean;
  answers: QuizAnswer[];
  recommendations: MovieRecommendation[];
  handleStartQuiz: () => void;
  handleQuizComplete: (answers: QuizAnswer[]) => Promise<MovieRecommendation[]>;
  processAnswers: (answers: QuizAnswer[]) => Promise<MovieRecommendation[]>;
}