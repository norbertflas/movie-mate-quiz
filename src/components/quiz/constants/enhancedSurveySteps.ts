
import { useTranslation } from "react-i18next";
import type { SurveyStepType } from "../QuizTypes";
import { getServicesForRegion } from "../QuizTypes";

// VOD Services mapped by region
const VOD_SERVICES_BY_REGION = {
  'US': [
    'Netflix', 'Amazon Prime Video', 'Disney+', 'HBO Max', 'Hulu', 
    'Apple TV+', 'Paramount+', 'Peacock', 'Showtime', 'Starz'
  ],
  'PL': [
    'Netflix', 'Amazon Prime Video', 'Disney+', 'HBO Max', 'Apple TV+',
    'Player.pl', 'Canal+', 'TVP VOD', 'Polsat Box Go', 'nc+'
  ],
  'GB': [
    'Netflix', 'Amazon Prime Video', 'Disney+', 'NOW TV', 'BBC iPlayer',
    'ITV Hub', 'All 4', 'Apple TV+', 'BritBox'
  ]
};

export const useEnhancedSurveySteps = (region: string = 'US'): SurveyStepType[] => {
  const { t } = useTranslation();
  const regionCode = region.toUpperCase();

  return [
    {
      id: "region",
      question: t("quiz.questions.region", "What's your location?"),
      subtitle: t("quiz.questions.regionSubtitle", "This helps us find content available in your area"),
      type: "single",
      options: [
        "quiz.options.region.poland",
        "quiz.options.region.usa", 
        "quiz.options.region.uk",
        "quiz.options.region.germany",
        "quiz.options.region.auto"
      ],
      getDynamicOptions: () => [],
      weight: 1.0,
      category: 'basic'
    },
    {
      id: "platforms",
      question: t("quiz.questions.platforms", "Which streaming services do you have access to?"),
      subtitle: t("quiz.questions.platformsSubtitle", "Select all that apply - we'll prioritize content available on your services"),
      type: "multiple",
      options: [],
      getDynamicOptions: (answers) => {
        const userRegion = answers.region?.includes('Poland') ? 'PL' :
                          answers.region?.includes('USA') ? 'US' :
                          answers.region?.includes('UK') ? 'GB' : regionCode;
        return VOD_SERVICES_BY_REGION[userRegion] || VOD_SERVICES_BY_REGION['US'];
      },
      weight: 1.2,
      category: 'basic'
    },
    {
      id: "contentType",
      question: t("quiz.questions.contentType", "What type of content are you looking for?"),
      subtitle: t("quiz.questions.contentTypeSubtitle", "This helps us narrow down the perfect recommendation"),
      type: "single",
      options: [
        "quiz.options.movie",
        "quiz.options.series",
        "quiz.options.documentary",
        "quiz.options.animation",
        "quiz.options.notSure"
      ],
      getDynamicOptions: () => [],
      weight: 0.9,
      category: 'basic'
    },
    {
      id: "movieLength",
      question: t("quiz.questions.movieLength", "How long do you want your movie to be?"),
      subtitle: t("quiz.questions.movieLengthSubtitle", "We'll match the runtime to your available time"),
      type: "single",
      options: [
        "quiz.options.movieLength.short",
        "quiz.options.movieLength.standard",
        "quiz.options.movieLength.long",
        "quiz.options.movieLength.noPreference"
      ],
      getDynamicOptions: () => [],
      shouldShow: (answerMap) => {
        const contentType = answerMap.contentType;
        return contentType === "quiz.options.movie" || contentType === "Movies" || !contentType || contentType === "quiz.options.notSure";
      },
      weight: 0.7,
      category: 'preference'
    },
    {
      id: "seriesPreferences",
      question: t("quiz.questions.seriesPreferences", "What do you prefer in TV series?"),
      subtitle: t("quiz.questions.seriesPreferencesSubtitle", "Help us find the perfect binge-watch"),
      type: "single",
      options: [
        "quiz.options.series.finished",
        "quiz.options.series.ongoing",
        "quiz.options.series.shortSeason",
        "quiz.options.series.longSeason",
        "quiz.options.series.noPreference"
      ],
      getDynamicOptions: () => [],
      shouldShow: (answerMap) => {
        const contentType = answerMap.contentType;
        return contentType === "quiz.options.series" || contentType === "TV Series" || contentType === "quiz.options.notSure";
      },
      weight: 0.7,
      category: 'preference'
    },
    {
      id: "mood",
      question: t("quiz.questions.mood", "What's your current mood?"),
      subtitle: t("quiz.questions.moodSubtitle", "We'll match content to how you're feeling"),
      type: "single",
      options: [
        "quiz.options.mood.laugh",
        "quiz.options.mood.touching",
        "quiz.options.mood.adrenaline",
        "quiz.options.mood.relax",
        "quiz.options.mood.think",
        "quiz.options.mood.escape",
        "quiz.options.mood.notSure"
      ],
      getDynamicOptions: () => [],
      weight: 1.1,
      category: 'preference'
    },
    {
      id: "preferredGenres",
      question: t("quiz.questions.preferredGenres", "Which genres do you enjoy most?"),
      subtitle: t("quiz.questions.preferredGenresSubtitle", "Select your favorites - we'll find the best in each category"),
      type: "multiple",
      options: [
        "Action", "Comedy", "Drama", "Horror", "Thriller", "Romance",
        "Science Fiction", "Fantasy", "Documentary", "Animation", "Crime", "Historical"
      ],
      getDynamicOptions: () => [],
      weight: 1.3,
      category: 'preference'
    },
    {
      id: "releaseYear",
      question: t("quiz.questions.releaseYear", "When should your content be from?"),
      subtitle: t("quiz.questions.releaseYearSubtitle", "From the latest releases to timeless classics"),
      type: "single",
      options: [
        "quiz.options.releaseYear.latest",
        "quiz.options.releaseYear.recent",
        "quiz.options.releaseYear.modern",
        "quiz.options.releaseYear.classic",
        "quiz.options.releaseYear.vintage",
        "quiz.options.releaseYear.noPreference"
      ],
      getDynamicOptions: () => [],
      weight: 0.8,
      category: 'preference'
    },
    {
      id: "languagePreference",
      question: t("quiz.questions.languagePreference", "What's your language preference?"),
      subtitle: t("quiz.questions.languagePreferenceSubtitle", "Original audio, dubbing, or subtitles?"),
      type: "single",
      options: [
        "quiz.options.language.original",
        "quiz.options.language.dubbed",
        "quiz.options.language.subtitles",
        "quiz.options.language.localLanguage",
        "quiz.options.language.noPreference"
      ],
      getDynamicOptions: () => [],
      weight: 0.6,
      category: 'technical'
    },
    {
      id: "qualityPreference",
      question: t("quiz.questions.qualityPreference", "What's your quality preference?"),
      subtitle: t("quiz.questions.qualityPreferenceSubtitle", "Highly rated hits or hidden gems?"),
      type: "single",
      options: [
        "quiz.options.quality.onlyHighRated",
        "quiz.options.quality.mixed",
        "quiz.options.quality.hidden",
        "quiz.options.quality.noPreference"
      ],
      getDynamicOptions: () => [],
      weight: 0.9,
      category: 'preference'
    },
    {
      id: "watchingTime",
      question: t("quiz.questions.watchingTime", "When are you planning to watch?"),
      subtitle: t("quiz.questions.watchingTimeSubtitle", "We'll consider your schedule"),
      type: "single",
      options: [
        "quiz.options.watchingTime.now",
        "quiz.options.watchingTime.tonight",
        "quiz.options.watchingTime.weekend",
        "quiz.options.watchingTime.planning",
        "quiz.options.watchingTime.noPreference"
      ],
      getDynamicOptions: () => [],
      weight: 0.5,
      category: 'social'
    },
    {
      id: "watchingCompany",
      question: t("quiz.questions.watchingCompany", "Who will you be watching with?"),
      subtitle: t("quiz.questions.watchingCompanySubtitle", "Content appropriate for your audience"),
      type: "single",
      options: [
        "quiz.options.company.alone",
        "quiz.options.company.partner",
        "quiz.options.company.family",
        "quiz.options.company.friends",
        "quiz.options.company.kids",
        "quiz.options.company.noPreference"
      ],
      getDynamicOptions: () => [],
      weight: 0.8,
      category: 'social'
    }
  ];
};
