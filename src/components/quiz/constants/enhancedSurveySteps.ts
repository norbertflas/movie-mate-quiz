
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
        t("quiz.options.movies", "Movies"),
        t("quiz.options.series", "TV Series"),
        t("quiz.options.both", "Both")
      ],
      getDynamicOptions: () => []
    },
    {
      id: "movieLength",
      question: t("quiz.questions.movieLength", "How long should the movie be?"),
      subtitle: t("quiz.questions.movieLengthSubtitle", "Choose your preferred duration"),
      type: "single",
      options: [
        t("quiz.options.short", "Short (up to 90 minutes)"),
        t("quiz.options.standard", "Standard (90-120 minutes)"),
        t("quiz.options.long", "Long (over 120 minutes)")
      ],
      getDynamicOptions: () => [],
      shouldShow: (answerMap) => answerMap.contentType === t("quiz.options.movies", "Movies") || answerMap.contentType === "Filmy"
    },
    {
      id: "mood",
      question: t("quiz.questions.mood", "What's your current mood?"),
      subtitle: t("quiz.questions.moodSubtitle", "What do you feel like watching?"),
      type: "single",
      options: [
        t("quiz.options.funny", "Something funny"),
        t("quiz.options.touching", "Something touching"), 
        t("quiz.options.adrenaline", "Something with adrenaline"),
        t("quiz.options.relaxing", "Something relaxing"),
        t("quiz.options.notSure", "I'm not sure")
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
