
import { useTranslation } from "react-i18next";
import type { SurveyStepType } from "../QuizTypes";

export const useEnhancedSurveySteps = (): SurveyStepType[] => {
  const { t } = useTranslation();

  return [
    {
      id: "platforms",
      question: t("quiz.questions.platforms"),
      subtitle: t("quiz.questions.platformsSubtitle"),
      type: "multiple",
      options: [
        'Netflix', 
        'Amazon Prime Video', 
        'Disney+', 
        'HBO Max', 
        'Hulu',
        'Apple TV+', 
        'Paramount+', 
        'Peacock', 
        'Showtime', 
        'Starz',
        t("quiz.options.noSubscriptions")
      ]
    },
    {
      id: "contentType",
      question: t("quiz.questions.contentType"),
      subtitle: t("quiz.questions.contentTypeSubtitle"),
      type: "single",
      options: [
        t("quiz.options.movie"),
        t("quiz.options.series"),
        t("quiz.options.notSure")
      ]
    },
    {
      id: "movieLength",
      question: t("quiz.questions.movieLength"),
      subtitle: t("quiz.questions.movieLengthSubtitle"),
      type: "single",
      options: [
        t("quiz.options.movieLength.short"),
        t("quiz.options.movieLength.standard"),
        t("quiz.options.movieLength.long"),
        t("quiz.options.movieLength.noPreference")
      ],
      shouldShow: (answers) => {
        const contentType = answers.contentType;
        return contentType === t("quiz.options.movie") || contentType === "Movies";
      }
    },
    {
      id: "seasonCount",
      question: t("quiz.questions.seasonCount"),
      subtitle: t("quiz.questions.seasonCountSubtitle"),
      type: "single",
      options: [
        t("quiz.options.seasonCount.short"),
        t("quiz.options.seasonCount.medium"),
        t("quiz.options.seasonCount.long"),
        t("quiz.options.seasonCount.noPreference")
      ],
      shouldShow: (answers) => {
        const contentType = answers.contentType;
        return contentType === t("quiz.options.series") || contentType === "TV Series";
      }
    },
    {
      id: "episodesPerSeason",
      question: t("quiz.questions.episodesPerSeason"),
      subtitle: t("quiz.questions.episodesPerSeasonSubtitle"),
      type: "single",
      options: [
        t("quiz.options.episodesPerSeason.few"),
        t("quiz.options.episodesPerSeason.medium"),
        t("quiz.options.episodesPerSeason.many"),
        t("quiz.options.episodesPerSeason.noPreference")
      ],
      shouldShow: (answers) => {
        const contentType = answers.contentType;
        return contentType === t("quiz.options.series") || contentType === "TV Series";
      }
    },
    {
      id: "episodeLength",
      question: t("quiz.questions.episodeLength"),
      subtitle: t("quiz.questions.episodeLengthSubtitle"),
      type: "single",
      options: [
        t("quiz.options.episodeLength.short"),
        t("quiz.options.episodeLength.standard"),
        t("quiz.options.episodeLength.long"),
        t("quiz.options.episodeLength.noPreference")
      ],
      shouldShow: (answers) => {
        const contentType = answers.contentType;
        return contentType === t("quiz.options.series") || contentType === "TV Series";
      }
    },
    {
      id: "mood",
      question: t("quiz.questions.mood"),
      subtitle: t("quiz.questions.moodSubtitle"),
      type: "single",
      options: [
        t("quiz.options.mood.laugh"),
        t("quiz.options.mood.touching"),
        t("quiz.options.mood.adrenaline"),
        t("quiz.options.mood.relax"),
        t("quiz.options.mood.notSure")
      ]
    },
    {
      id: "genres",
      question: "What genres do you enjoy?",
      subtitle: "Select your favorite movie or TV genres",
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
      ]
    }
  ];
};
