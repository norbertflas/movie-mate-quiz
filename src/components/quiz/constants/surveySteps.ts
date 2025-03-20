
import { useTranslation } from "react-i18next";
import type { SurveyStepType } from "../QuizTypes";
import { VOD_SERVICES } from "./streamingServices";

export const useSurveySteps = (): SurveyStepType[] => {
  const { t } = useTranslation();

  return [
    {
      id: "platforms",
      question: "quiz.questions.platforms",
      subtitle: "quiz.questions.platformsSubtitle",
      type: "multiple",
      options: VOD_SERVICES,
    },
    {
      id: "contentType",
      question: "quiz.questions.contentType",
      subtitle: "quiz.questions.contentTypeSubtitle",
      type: "single",
      options: [
        "quiz.options.movie",
        "quiz.options.series",
        "quiz.options.notSure"
      ],
    },
    {
      id: "movieLength",
      question: "quiz.questions.movieLength",
      subtitle: "quiz.questions.movieLengthSubtitle",
      type: "single",
      options: [
        "quiz.options.movieLength.short",
        "quiz.options.movieLength.standard",
        "quiz.options.movieLength.long",
        "quiz.options.movieLength.noPreference"
      ],
      shouldShow: (answers) => answers.contentType === t("quiz.options.movie"),
    },
    {
      id: "seasonCount",
      question: "quiz.questions.seasonCount",
      subtitle: "quiz.questions.seasonCountSubtitle",
      type: "single",
      options: [
        "quiz.options.seasonCount.short",
        "quiz.options.seasonCount.medium",
        "quiz.options.seasonCount.long",
        "quiz.options.seasonCount.noPreference"
      ],
      shouldShow: (answers) => answers.contentType === t("quiz.options.series"),
    },
    {
      id: "episodesPerSeason",
      question: "quiz.questions.episodesPerSeason",
      subtitle: "quiz.questions.episodesPerSeasonSubtitle",
      type: "single",
      options: [
        "quiz.options.episodesPerSeason.few",
        "quiz.options.episodesPerSeason.medium",
        "quiz.options.episodesPerSeason.many",
        "quiz.options.episodesPerSeason.noPreference"
      ],
      shouldShow: (answers) => answers.contentType === t("quiz.options.series"),
    },
    {
      id: "episodeLength",
      question: "quiz.questions.episodeLength",
      subtitle: "quiz.questions.episodeLengthSubtitle",
      type: "single",
      options: [
        "quiz.options.episodeLength.short",
        "quiz.options.episodeLength.standard",
        "quiz.options.episodeLength.long",
        "quiz.options.episodeLength.noPreference"
      ],
      shouldShow: (answers) => answers.contentType === t("quiz.options.series"),
    },
    {
      id: "mood",
      question: "quiz.questions.mood",
      subtitle: "quiz.questions.moodSubtitle",
      type: "single",
      options: [
        "quiz.options.mood.laugh",
        "quiz.options.mood.touching",
        "quiz.options.mood.adrenaline",
        "quiz.options.mood.relax",
        "quiz.options.mood.notSure"
      ],
    },
  ];
};
