
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

export interface SurveyStep {
  id: string;
  title: string;
  subtitle?: string;
  options: Array<{
    value: string;
    label: string;
    icon?: string;
  }>;
  multiSelect?: boolean;
  shouldShow?: (answers: Record<string, string>) => boolean;
}

export const useSurveySteps = (): SurveyStep[] => {
  const { t } = useTranslation();

  return useMemo(() => [
    {
      id: "platforms",
      title: "quiz.questions.platforms",
      subtitle: "quiz.questions.platformsSubtitle",
      multiSelect: true,
      options: [
        { value: "netflix", label: "Netflix", icon: "🎬" },
        { value: "disney", label: "Disney+", icon: "🏰" },
        { value: "hbo", label: "HBO Max", icon: "🎭" },
        { value: "amazon", label: "Amazon Prime", icon: "📦" },
        { value: "apple", label: "Apple TV+", icon: "🍎" },
        { value: "hulu", label: "Hulu", icon: "📺" },
        { value: "paramount", label: "Paramount+", icon: "🗻" },
        { value: "peacock", label: "Peacock", icon: "🦚" }
      ]
    },
    {
      id: "content_type",
      title: "quiz.questions.contentType",
      subtitle: "quiz.questions.contentTypeSubtitle",
      options: [
        { value: "movies", label: "quiz.options.movies", icon: "🎬" },
        { value: "series", label: "quiz.options.series", icon: "📺" },
        { value: "both", label: "quiz.options.both", icon: "🎭" },
        { value: "not_sure", label: "quiz.options.notSure", icon: "🤷" }
      ]
    },
    {
      id: "movie_length",
      title: "quiz.questions.movieLength",
      subtitle: "quiz.questions.movieLengthSubtitle",
      shouldShow: (answers) => {
        const contentType = answers.content_type;
        return contentType === "movies" || contentType === "both";
      },
      options: [
        { value: "short", label: "quiz.options.short", icon: "⏱️" },
        { value: "standard", label: "quiz.options.standard", icon: "⏰" },
        { value: "long", label: "quiz.options.long", icon: "🎞️" }
      ]
    },
    {
      id: "mood",
      title: "quiz.questions.mood",
      subtitle: "quiz.questions.moodSubtitle",
      options: [
        { value: "funny", label: "quiz.options.funny", icon: "😄" },
        { value: "touching", label: "quiz.options.touching", icon: "❤️" },
        { value: "adrenaline", label: "quiz.options.adrenaline", icon: "⚡" },
        { value: "relaxing", label: "quiz.options.relaxing", icon: "😌" }
      ]
    },
    {
      id: "genres",
      title: "quiz.questions.genres",
      subtitle: "quiz.questions.genresSubtitle",
      multiSelect: true,
      options: [
        { value: "action", label: "movie.action", icon: "💥" },
        { value: "comedy", label: "movie.comedy", icon: "😂" },
        { value: "drama", label: "movie.drama", icon: "🎭" },
        { value: "horror", label: "movie.horror", icon: "👻" },
        { value: "romance", label: "movie.romance", icon: "💕" },
        { value: "sci-fi", label: "movie.sciFi", icon: "🚀" },
        { value: "thriller", label: "movie.thriller", icon: "🔥" },
        { value: "documentary", label: "movie.documentary", icon: "📚" }
      ]
    },
    {
      id: "challenges",
      title: "quiz.questions.challenges || 'Are you up for challenges?'",
      subtitle: "quiz.questions.challengesSubtitle || 'This will determine the complexity of your recommendations'",
      options: [
        { value: "yes", label: "quiz.options.yes || 'Yes, bring it on!'", icon: "💪" },
        { value: "no", label: "quiz.options.no || 'No, keep it simple'", icon: "😌" }
      ]
    }
  ], [t]);
};
