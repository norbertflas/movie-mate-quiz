
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
        { value: "peacock", label: "Peacock", icon: "🦚" },
        { value: "any", label: "Nie mam preferencji", icon: "🌐" }
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
      title: "Jaki czas trwania filmu preferujesz?",
      subtitle: "To pomoże mi dobrać filmy odpowiednie na Twój dostępny czas",
      shouldShow: (answers) => {
        const contentType = answers.content_type;
        return contentType === "movies" || contentType === "both";
      },
      options: [
        { value: "short", label: "Krótkie (do 90 min)", icon: "⏱️" },
        { value: "standard", label: "Standardowe (90-150 min)", icon: "⏰" },
        { value: "long", label: "Długie (ponad 150 min)", icon: "🎞️" },
        { value: "no_preference", label: "Bez preferencji", icon: "🤷" }
      ]
    },
    {
      id: "current_mood",
      title: "W jakim jesteś nastroju?",
      subtitle: "Dobiorę filmy pasujące do Twojego aktualnego stanu",
      options: [
        { value: "happy", label: "Chcę się pośmiać", icon: "😄" },
        { value: "sad", label: "Chcę się wzruszyć", icon: "😢" },
        { value: "excited", label: "Chcę adrenaliny", icon: "⚡" },
        { value: "relaxed", label: "Chcę się zrelaksować", icon: "😌" },
        { value: "thoughtful", label: "Chcę się zamyślić", icon: "🤔" },
        { value: "nostalgic", label: "Tęsknię za starymi czasami", icon: "📼" },
        { value: "no_preference", label: "Bez preferencji", icon: "🎭" }
      ]
    },
    {
      id: "viewing_context",
      title: "W jakiej sytuacji będziesz oglądać?",
      subtitle: "To wpłynie na rodzaj polecanych treści",
      options: [
        { value: "alone", label: "Sam/sama", icon: "🎧" },
        { value: "partner", label: "Z partnerem/partnerką", icon: "💑" },
        { value: "family", label: "Z rodziną", icon: "👨‍👩‍👧‍👦" },
        { value: "friends", label: "Ze znajomymi", icon: "👥" },
        { value: "background", label: "W tle podczas innych zajęć", icon: "📱" }
      ]
    },
    {
      id: "genres",
      title: "Które gatunki Cię interesują?",
      subtitle: "Wybierz wszystkie, które lubisz (możesz wybrać kilka)",
      multiSelect: true,
      options: [
        { value: "action", label: "Akcja", icon: "💥" },
        { value: "comedy", label: "Komedia", icon: "😂" },
        { value: "drama", label: "Dramat", icon: "🎭" },
        { value: "horror", label: "Horror", icon: "👻" },
        { value: "romance", label: "Romans", icon: "💕" },
        { value: "sci-fi", label: "Science Fiction", icon: "🚀" },
        { value: "thriller", label: "Thriller", icon: "🔥" },
        { value: "documentary", label: "Dokumentalne", icon: "📚" },
        { value: "fantasy", label: "Fantasy", icon: "🧙" },
        { value: "crime", label: "Kryminalne", icon: "🕵️" },
        { value: "animation", label: "Animowane", icon: "🎨" },
        { value: "mystery", label: "Tajemnica", icon: "🔍" }
      ]
    },
    {
      id: "rating_preference",
      title: "Jaki poziom treści preferujesz?",
      subtitle: "Wybierz odpowiedni dla siebie poziom",
      options: [
        { value: "family", label: "Rodzinne (dla wszystkich)", icon: "👨‍👩‍👧‍👦" },
        { value: "teen", label: "Dla młodzieży (13+)", icon: "🧑‍🎓" },
        { value: "adult", label: "Dla dorosłych (18+)", icon: "🔞" },
        { value: "no_preference", label: "Bez preferencji", icon: "🎬" }
      ]
    },
    {
      id: "era_preference",
      title: "Z jakiego okresu preferujesz filmy?",
      subtitle: "Może masz ochotę na klasyki lub najnowsze produkcje?",
      options: [
        { value: "latest", label: "Najnowsze (2020+)", icon: "🆕" },
        { value: "recent", label: "Ostatnie lata (2010-2020)", icon: "📅" },
        { value: "modern", label: "Nowoczesne (2000-2010)", icon: "💿" },
        { value: "retro", label: "Retro (1990-2000)", icon: "📼" },
        { value: "classic", label: "Klasyczne (przed 1990)", icon: "🎞️" },
        { value: "no_preference", label: "Bez preferencji", icon: "🎭" }
      ]
    },
    {
      id: "intensity_level",
      title: "Jaki poziom intensywności preferujesz?",
      subtitle: "Chcesz czegoś spokojnego czy pełnego akcji?",
      options: [
        { value: "very_calm", label: "Bardzo spokojne", icon: "🧘" },
        { value: "calm", label: "Spokojne", icon: "😌" },
        { value: "moderate", label: "Umiarkowane", icon: "⚖️" },
        { value: "intense", label: "Intensywne", icon: "🔥" },
        { value: "very_intense", label: "Bardzo intensywne", icon: "💥" }
      ]
    },
    {
      id: "language_preference",
      title: "Jakiej wersji językowej preferujesz?",
      subtitle: "To pomoże mi dobrać odpowiednie tytuły",
      options: [
        { value: "polish", label: "Polski dubbing", icon: "🇵🇱" },
        { value: "original_subtitles", label: "Oryginał z napisami", icon: "📝" },
        { value: "english", label: "Angielski", icon: "🇺🇸" },
        { value: "no_preference", label: "Bez preferencji", icon: "🌐" }
      ]
    }
  ], [t]);
};
