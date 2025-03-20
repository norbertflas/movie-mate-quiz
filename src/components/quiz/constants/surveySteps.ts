
import { useTranslation } from "react-i18next";
import type { SurveyStepType } from "../QuizTypes";
import { VOD_SERVICES } from "./streamingServices";

export const useSurveySteps = (): SurveyStepType[] => {
  const { t } = useTranslation();

  return [
    {
      id: "vod",
      question: "quiz.questions.platforms",
      type: "multiple",
      options: VOD_SERVICES,
    },
    {
      id: "type",
      question: "quiz.questions.contentType",
      type: "single",
      options: [
        "quiz.options.movie",
        "quiz.options.series"
      ],
    },
    {
      id: "genre",
      question: "quiz.questions.genre",
      type: "single",
      options: [
        "movie.action",
        "movie.comedy",
        "movie.drama",
        "movie.sciFi",
        "movie.horror",
        "movie.romance",
        "movie.thriller",
        "movie.documentary"
      ],
    },
    {
      id: "mood",
      question: "quiz.questions.mood",
      type: "single",
      options: [
        "quiz.options.mood.light",
        "quiz.options.mood.serious",
        "quiz.options.mood.suspense",
        "quiz.options.mood.inspiring"
      ],
    },
  ];
};
