
export type SurveyStepType = {
  id: string;
  question: string;
  subtitle?: string;
  type: "single" | "multiple";
  options: string[];
  getDynamicOptions?: (answers: Record<string, any>) => string[];
  shouldShow?: (answers: Record<string, any>) => boolean;
};

export interface MovieRecommendation {
  id: number;
  tmdbId?: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genre: string;
  trailer_url: string | null;
  platform?: string;
  type?: string;
  length?: string;
  seasons?: number;
  episodesPerSeason?: number;
  episodeLength?: string;
  mood?: string;
  explanations?: string[];
}

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
  handleStartQuiz: () => void;
  handleQuizComplete: (answers: QuizAnswer[]) => Promise<MovieRecommendation[]>;
  processAnswers: (answers: QuizAnswer[]) => Promise<MovieRecommendation[]>;
}
