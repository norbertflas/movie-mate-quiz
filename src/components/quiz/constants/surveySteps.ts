
import { useTranslation } from "react-i18next";
import type { SurveyStepType } from "../QuizTypes";
import { useEnhancedSurveySteps } from "./enhancedSurveySteps";

// Zachowujemy backward compatibility - eksportujemy podstawowe serwisy
export const VOD_SERVICES = [
  'Netflix', 'Amazon Prime Video', 'Disney+', 'HBO Max', 'Hulu', 
  'Apple TV+', 'Paramount+', 'Peacock', 'Showtime', 'Starz'
];

// Główna funkcja teraz korzysta z rozszerzonych kroków
export const useSurveySteps = (): SurveyStepType[] => {
  const enhancedSteps = useEnhancedSurveySteps();
  return enhancedSteps;
};
