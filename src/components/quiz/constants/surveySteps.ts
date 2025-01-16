import { useTranslation } from "react-i18next";
import type { SurveyStepType } from "../QuizTypes";
import { VOD_SERVICES } from "./streamingServices";

export const useSurveySteps = (): SurveyStepType[] => {
  const { t } = useTranslation();

  return [
    {
      id: "vod",
      question: t("quiz.questions.platforms"),
      type: "multiple",
      options: VOD_SERVICES,
    },
    {
      id: "type",
      question: t("quiz.questions.contentType"),
      type: "single",
      options: [
        t("quiz.options.movie"),
        t("quiz.options.series")
      ],
    },
    {
      id: "genre",
      question: t("quiz.questions.genre"),
      type: "single",
      options: [
        t("movie.action"),
        t("movie.comedy"),
        t("movie.drama"),
        t("movie.sciFi"),
        t("movie.horror"),
        t("movie.romance"),
        t("movie.thriller"),
        t("movie.documentary")
      ],
    },
    {
      id: "mood",
      question: t("quiz.questions.mood"),
      type: "single",
      options: [
        t("quiz.options.mood.light"),
        t("quiz.options.mood.serious"),
        t("quiz.options.mood.suspense"),
        t("quiz.options.mood.inspiring")
      ],
    },
  ];
};