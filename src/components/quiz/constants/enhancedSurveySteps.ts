
import { useTranslation } from "react-i18next";
import type { SurveyStepType, QuizAnswer } from "../QuizTypes";

// Rozszerzona lista serwisów VOD z regionalnymi opcjami
export const VOD_SERVICES_BY_REGION = {
  US: [
    'Netflix', 'Amazon Prime Video', 'Disney+', 'HBO Max', 'Hulu', 
    'Apple TV+', 'Paramount+', 'Peacock', 'Showtime', 'Starz'
  ],
  PL: [
    'Netflix', 'Amazon Prime Video', 'Disney+', 'HBO Max', 'Apple TV+',
    'Canal+', 'Player.pl', 'TVP VOD', 'Polsat Box Go', 'nc+', 'Cineman VOD'
  ],
  GB: [
    'Netflix', 'Amazon Prime Video', 'Disney+', 'Now TV', 'BBC iPlayer',
    'ITV Hub', 'All 4', 'Apple TV+', 'Paramount+', 'BritBox'
  ]
};

export const getVODServicesForRegion = (region: string): string[] => {
  return VOD_SERVICES_BY_REGION[region as keyof typeof VOD_SERVICES_BY_REGION] || VOD_SERVICES_BY_REGION.US;
};

export const useEnhancedSurveySteps = (region: string = 'US'): SurveyStepType[] => {
  const { t } = useTranslation();
  
  return [
    // Krok 1: Wybór regionu
    {
      id: "region",
      question: "quiz.questions.region",
      subtitle: "quiz.questions.regionSubtitle",
      type: "single",
      options: [
        "quiz.options.region.poland",
        "quiz.options.region.usa", 
        "quiz.options.region.uk",
        "quiz.options.region.germany",
        "quiz.options.region.auto"
      ],
    },

    // Krok 2: Platformy streamingowe (dynamiczne na podstawie regionu)
    {
      id: "platforms",
      question: "quiz.questions.platforms",
      subtitle: "quiz.questions.platformsSubtitle",
      type: "multiple",
      options: [], // Będzie wypełnione dynamicznie
      getDynamicOptions: (answers) => {
        const selectedRegion = answers.region;
        let regionCode = 'US';
        
        if (selectedRegion?.includes('Poland') || selectedRegion?.includes('polska')) {
          regionCode = 'PL';
        } else if (selectedRegion?.includes('UK') || selectedRegion?.includes('Britain')) {
          regionCode = 'GB';
        }
        
        return getVODServicesForRegion(regionCode);
      }
    },

    // Krok 3: Typ treści
    {
      id: "contentType",
      question: "quiz.questions.contentType",
      subtitle: "quiz.questions.contentTypeSubtitle",
      type: "single",
      options: [
        "quiz.options.movie",
        "quiz.options.series",
        "quiz.options.documentary",
        "quiz.options.animation",
        "quiz.options.notSure"
      ],
    },

    // Krok 4: Długość filmu (tylko dla filmów)
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

    // Krok 5: Preferencje dotyczące seriali (tylko dla seriali)
    {
      id: "seriesPreferences",
      question: "quiz.questions.seriesPreferences",
      subtitle: "quiz.questions.seriesPreferencesSubtitle",
      type: "single",
      options: [
        "quiz.options.series.finished",
        "quiz.options.series.ongoing",
        "quiz.options.series.shortSeason",
        "quiz.options.series.longSeason",
        "quiz.options.series.noPreference"
      ],
      shouldShow: (answers) => answers.contentType === t("quiz.options.series"),
    },

    // Krok 6: Nastrój
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
        "quiz.options.mood.think",
        "quiz.options.mood.escape",
        "quiz.options.mood.notSure"
      ],
    },

    // Krok 7: Gatunki (wielokrotny wybór)
    {
      id: "preferredGenres",
      question: "quiz.questions.preferredGenres",
      subtitle: "quiz.questions.preferredGenresSubtitle", 
      type: "multiple",
      options: [
        "quiz.options.genres.action",
        "quiz.options.genres.comedy",
        "quiz.options.genres.drama",
        "quiz.options.genres.horror",
        "quiz.options.genres.thriller",
        "quiz.options.genres.romance",
        "quiz.options.genres.scifi",
        "quiz.options.genres.fantasy",
        "quiz.options.genres.documentary",
        "quiz.options.genres.animation",
        "quiz.options.genres.crime",
        "quiz.options.genres.history"
      ],
    },

    // Krok 8: Okres wydania
    {
      id: "releaseYear",
      question: "quiz.questions.releaseYear",
      subtitle: "quiz.questions.releaseYearSubtitle",
      type: "single",
      options: [
        "quiz.options.releaseYear.latest",
        "quiz.options.releaseYear.recent",
        "quiz.options.releaseYear.modern",
        "quiz.options.releaseYear.classic",
        "quiz.options.releaseYear.vintage",
        "quiz.options.releaseYear.noPreference"
      ],
    },

    // Krok 9: Język i napisy
    {
      id: "languagePreference",
      question: "quiz.questions.languagePreference",
      subtitle: "quiz.questions.languagePreferenceSubtitle",
      type: "single",
      options: [
        "quiz.options.language.original",
        "quiz.options.language.dubbed",
        "quiz.options.language.subtitles",
        "quiz.options.language.localLanguage",
        "quiz.options.language.noPreference"
      ],
    },

    // Krok 10: Jakość i oceny
    {
      id: "qualityPreference",
      question: "quiz.questions.qualityPreference", 
      subtitle: "quiz.questions.qualityPreferenceSubtitle",
      type: "single",
      options: [
        "quiz.options.quality.onlyHighRated",
        "quiz.options.quality.mixed",
        "quiz.options.quality.hidden",
        "quiz.options.quality.noPreference"
      ],
    },

    // Krok 11: Czas oglądania
    {
      id: "watchingTime",
      question: "quiz.questions.watchingTime",
      subtitle: "quiz.questions.watchingTimeSubtitle",
      type: "single", 
      options: [
        "quiz.options.watchingTime.now",
        "quiz.options.watchingTime.tonight",
        "quiz.options.watchingTime.weekend",
        "quiz.options.watchingTime.planning",
        "quiz.options.watchingTime.noPreference"
      ],
    },

    // Krok 12: Towarzystwo (nowe)
    {
      id: "watchingCompany",
      question: "quiz.questions.watchingCompany",
      subtitle: "quiz.questions.watchingCompanySubtitle",
      type: "single",
      options: [
        "quiz.options.company.alone",
        "quiz.options.company.partner",
        "quiz.options.company.family",
        "quiz.options.company.friends",
        "quiz.options.company.kids",
        "quiz.options.company.noPreference"
      ],
    }
  ];
};

// Dodatkowe typy dla rozszerzonych odpowiedzi
export interface EnhancedQuizAnswer extends QuizAnswer {
  metadata?: {
    region?: string;
    timestamp?: string;
    sessionId?: string;
  };
}

// Funkcja pomocnicza do mapowania odpowiedzi na filtry
export const mapAnswersToAdvancedFilters = (answers: QuizAnswer[], t: any) => {
  const answerMap = answers.reduce((acc, answer) => {
    acc[answer.questionId] = answer.answer;
    return acc;
  }, {} as Record<string, string>);

  const filters: any = {
    platforms: answerMap.platforms?.split(',') || [],
    contentType: answerMap.contentType || 'notSure',
    mood: answerMap.mood || 'notSure',
    genres: answerMap.preferredGenres?.split(',') || [],
    region: 'us', // domyślnie
    languages: ['en'],
    minRating: 0,
    maxResults: 15
  };

  // Mapowanie regionu
  if (answerMap.region?.includes('Poland') || answerMap.region?.includes('polska')) {
    filters.region = 'pl';
    filters.languages = ['pl', 'en'];
  }

  // Mapowanie roku wydania na filtry czasowe
  const releaseYearMapping = {
    [t("quiz.options.releaseYear.latest")]: { min: new Date().getFullYear() - 1 },
    [t("quiz.options.releaseYear.recent")]: { min: new Date().getFullYear() - 5 },
    [t("quiz.options.releaseYear.modern")]: { min: 2000, max: 2020 },
    [t("quiz.options.releaseYear.classic")]: { min: 1980, max: 1999 },
    [t("quiz.options.releaseYear.vintage")]: { max: 1979 }
  };

  if (answerMap.releaseYear && releaseYearMapping[answerMap.releaseYear]) {
    filters.releaseYear = releaseYearMapping[answerMap.releaseYear];
  }

  // Mapowanie preferencji jakości na minimalne oceny
  const qualityMapping = {
    [t("quiz.options.quality.onlyHighRated")]: 7.5,
    [t("quiz.options.quality.mixed")]: 6.0,
    [t("quiz.options.quality.hidden")]: 0,
  };

  if (answerMap.qualityPreference && qualityMapping[answerMap.qualityPreference]) {
    filters.minRating = qualityMapping[answerMap.qualityPreference];
  }

  return filters;
};
