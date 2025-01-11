export type SurveyStepType = {
  id: string;
  question: string;
  type: "single" | "multiple";
  options: string[];
  getDynamicOptions?: (answers: Record<string, any>) => string[];
  shouldShow?: (answers: Record<string, any>) => boolean;
};

export type MovieRecommendation = {
  title: string;
  year: string;
  platform: string;
  genre: string;
  imageUrl: string;
  description: string;
  trailerUrl: string;
  rating: number;
  tags?: string[];
};