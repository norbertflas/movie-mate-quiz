
import { useTranslation } from "react-i18next";
import type { SurveyStepType } from "../QuizTypes";

export const useEnhancedSurveySteps = (): SurveyStepType[] => {
  const { t } = useTranslation();

  return [
    {
      id: "platforms",
      question: t("quiz.questions.platforms", "Which streaming platforms do you have access to?"),
      subtitle: t("quiz.questions.platformsSubtitle", "Select all that apply"),
      type: "multiple",
      options: [
        "Netflix",
        "Amazon Prime Video", 
        "Disney+",
        "HBO Max",
        "Hulu",
        "Apple TV+",
        "Paramount+",
        "Peacock"
      ],
      getDynamicOptions: () => []
    },
    {
      id: "contentType",
      question: t("quiz.questions.contentType", "What type of content are you looking for?"),
      subtitle: t("quiz.questions.contentTypeSubtitle", "Choose your preferred content type"),
      type: "single",
      options: [
        "movies",
        "series",
        "both"
      ],
      getDynamicOptions: () => []
    },
    {
      id: "movieLength",
      question: t("quiz.questions.movieLength", "How long should the movie be?"),
      subtitle: t("quiz.questions.movieLengthSubtitle", "Choose your preferred duration"),
      type: "single",
      options: [
        "short",
        "standard",
        "long"
      ],
      getDynamicOptions: () => [],
      shouldShow: (answerMap) => {
        const contentType = answerMap.contentType;
        return contentType === "movies" || contentType === "both" || 
               contentType === t("quiz.options.movies") || contentType === t("quiz.options.both");
      }
    },
    {
      id: "mood",
      question: t("quiz.questions.mood", "What's your current mood?"),
      subtitle: t("quiz.questions.moodSubtitle", "What do you feel like watching?"),
      type: "single",
      options: [
        "funny",
        "touching",
        "adrenaline",
        "relaxing",
        "notSure"
      ],
      getDynamicOptions: () => []
    },
    {
      id: "genres",
      question: t("quiz.questions.genres", "What genres do you enjoy?"),
      subtitle: t("quiz.questions.genresSubtitle", "Select your favorite genres"),
      type: "multiple",
      options: [
        "Action",
        "Comedy", 
        "Drama",
        "Horror",
        "Romance",
        "Thriller",
        "Sci-Fi",
        "Fantasy",
        "Animation",
        "Documentary"
      ],
      getDynamicOptions: () => []
    }
  ];
};
