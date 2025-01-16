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
      options: VOD_SERVICES.map(service => ({
        id: service.toLowerCase(),
        label: t(`streaming.${service.toLowerCase()}`),
        value: service
      })),
    },
    {
      id: "type",
      question: t("quiz.questions.contentType"),
      type: "single",
      options: [
        { id: "movie", label: t("quiz.options.movie"), value: "movie" },
        { id: "series", label: t("quiz.options.series"), value: "series" }
      ],
    },
    {
      id: "genre",
      question: t("quiz.questions.genre"),
      type: "single",
      options: [
        { id: "action", label: t("movie.action"), value: "action" },
        { id: "comedy", label: t("movie.comedy"), value: "comedy" },
        { id: "drama", label: t("movie.drama"), value: "drama" },
        { id: "sciFi", label: t("movie.sciFi"), value: "sciFi" },
        { id: "horror", label: t("movie.horror"), value: "horror" },
        { id: "romance", label: t("movie.romance"), value: "romance" },
        { id: "thriller", label: t("movie.thriller"), value: "thriller" },
        { id: "documentary", label: t("movie.documentary"), value: "documentary" },
      ],
    },
    {
      id: "mood",
      question: t("quiz.questions.mood"),
      type: "single",
      options: [
        { id: "light", label: t("quiz.options.mood.light"), value: "light" },
        { id: "serious", label: t("quiz.options.mood.serious"), value: "serious" },
        { id: "suspense", label: t("quiz.options.mood.suspense"), value: "suspense" },
        { id: "inspiring", label: t("quiz.options.mood.inspiring"), value: "inspiring" },
      ],
    },
  ];
};