
// =============================================================================
// TŁUMACZENIA DLA ULEPSZONEGO QUIZU
// =============================================================================

export const quizTranslations = {
  en: {
    quiz: {
      title: "Movie & TV Recommendation Quiz",
      processing: "Processing your preferences",
      previous: "Previous",
      next: "Next", 
      getRecommendations: "Get My Recommendations",
      tryAgain: "Take Quiz Again",
      saveRecommendations: "Save to Watchlist",
      selectMultiple: "Select all that apply:",
      progress: "Step {{current}} of {{total}}",

      welcome: {
        title: "Find Your Perfect Watch",
        subtitle: "Discover movies and shows tailored just for you",
        features: "What makes this special:",
        feature1: "Personalized recommendations based on your streaming services",
        feature2: "Real-time availability across all major platforms",
        feature3: "International content discovery (US, UK, Poland, Germany)",
        feature4: "Takes just 2-3 minutes to complete",
        region: "Detected region",
        start: "Start Quiz"
      },

      success: {
        title: "Recommendations Ready!",
        regionDetected: "Region detected: {{region}}"
      },

      error: {
        title: "Something went wrong",
        fallback: "Don't worry, we've prepared some great recommendations for you anyway!"
      },

      questions: {
        region: "What's your location?",
        regionSubtitle: "This helps us find content available in your area",

        platforms: "Which streaming services do you have access to?",
        platformsSubtitle: "Select all that apply - we'll prioritize content available on your services",

        contentType: "What type of content are you looking for?",
        contentTypeSubtitle: "This helps us narrow down the perfect recommendation",

        movieLength: "How long do you want your movie to be?",
        movieLengthSubtitle: "We'll match the runtime to your available time",

        seriesPreferences: "What do you prefer in TV series?",
        seriesPreferencesSubtitle: "Help us find the perfect binge-watch",

        mood: "What's your current mood?",
        moodSubtitle: "We'll match content to how you're feeling",

        preferredGenres: "Which genres do you enjoy most?",
        preferredGenresSubtitle: "Select your favorites - we'll find the best in each category",

        releaseYear: "When should your content be from?",
        releaseYearSubtitle: "From the latest releases to timeless classics",

        languagePreference: "What's your language preference?",
        languagePreferenceSubtitle: "Original audio, dubbing, or subtitles?",

        qualityPreference: "What's your quality preference?",
        qualityPreferenceSubtitle: "Highly rated hits or hidden gems?",

        watchingTime: "When are you planning to watch?",
        watchingTimeSubtitle: "We'll consider your schedule",

        watchingCompany: "Who will you be watching with?",
        watchingCompanySubtitle: "Content appropriate for your audience"
      },

      options: {
        region: {
          poland: "Poland",
          usa: "United States", 
          uk: "United Kingdom",
          germany: "Germany",
          auto: "Auto-detect"
        },

        movie: "Movies",
        series: "TV Series",
        documentary: "Documentaries",
        animation: "Animation",
        notSure: "I'm not sure",

        movieLength: {
          short: "Short (under 90 min)",
          standard: "Standard (90-150 min)",
          long: "Long (over 150 min)",
          noPreference: "No preference"
        },

        series: {
          finished: "Completed series (I can binge)",
          ongoing: "Currently airing",
          shortSeason: "Short seasons (under 10 episodes)",
          longSeason: "Long seasons (10+ episodes)",
          noPreference: "No preference"
        },

        mood: {
          laugh: "I want to laugh",
          touching: "Something touching/emotional",
          adrenaline: "Action and adrenaline",
          relax: "Something relaxing",
          think: "Something thought-provoking",
          escape: "Pure escapism",
          notSure: "Surprise me"
        },

        genres: {
          action: "Action",
          comedy: "Comedy",
          drama: "Drama",
          horror: "Horror",
          thriller: "Thriller",
          romance: "Romance",
          scifi: "Science Fiction",
          fantasy: "Fantasy",
          documentary: "Documentary",
          animation: "Animation",
          crime: "Crime",
          history: "Historical"
        },

        releaseYear: {
          latest: "Latest releases (2024-2025)",
          recent: "Recent hits (2020-2024)",
          modern: "Modern classics (2000-2020)",
          classic: "90s classics (1980-1999)",
          vintage: "Vintage (before 1980)",
          noPreference: "Any era"
        },

        language: {
          original: "Original language with subtitles",
          dubbed: "Dubbed in my language",
          subtitles: "Don't mind subtitles",
          localLanguage: "Only in my language",
          noPreference: "No preference"
        },

        quality: {
          onlyHighRated: "Only highly rated (7.5+ stars)",
          mixed: "Mix of popular and quality",
          hidden: "Hidden gems and underrated",
          noPreference: "Show me everything"
        },

        watchingTime: {
          now: "Right now",
          tonight: "Tonight",
          weekend: "This weekend",
          planning: "Planning ahead",
          noPreference: "No rush"
        },

        company: {
          alone: "By myself",
          partner: "With my partner",
          family: "With family",
          friends: "With friends",
          kids: "With children",
          noPreference: "Depends on the content"
        }
      },

      results: {
        title: "Your Personalized Recommendations",
        subtitle: "Found {{count}} perfect matches for you",
        whyRecommended: "Why we picked this",
        availableOn: "Watch on",
        availableInOtherRegions: "Available in other regions",
        noStreamingInfo: "Streaming info unavailable",
        trailer: "Trailer",
        addToWatchlist: "Add to Watchlist"
      },

      feedback: {
        title: "How did we do?",
        rating: "Rate these recommendations"
      }
    }
  },

  pl: {
    quiz: {
      title: "Quiz Rekomendacji Filmów i Seriali",
      processing: "Przetwarzanie twoich preferencji",
      previous: "Poprzedni",
      next: "Następny",
      getRecommendations: "Pokaż Rekomendacje",
      tryAgain: "Spróbuj Ponownie",
      saveRecommendations: "Zapisz do Listy",
      selectMultiple: "Wybierz wszystkie pasujące:",
      progress: "Krok {{current}} z {{total}}",

      welcome: {
        title: "Znajdź Swój Idealny Film",
        subtitle: "Odkryj filmy i seriale dopasowane specjalnie dla Ciebie",
        features: "Co czyni to wyjątkowym:",
        feature1: "Spersonalizowane rekomendacje na podstawie Twoich serwisów",
        feature2: "Dostępność w czasie rzeczywistym na wszystkich platformach",
        feature3: "Międzynarodowe treści (USA, UK, Polska, Niemcy)",
        feature4: "Zajmuje tylko 2-3 minuty",
        region: "Wykryty region",
        start: "Rozpocznij Quiz"
      },

      success: {
        title: "Rekomendacje Gotowe!",
        regionDetected: "Wykryty region: {{region}}"
      },

      error: {
        title: "Coś poszło nie tak",
        fallback: "Nie martw się, przygotowaliśmy i tak świetne rekomendacje!"
      },

      questions: {
        region: "Gdzie się znajdujesz?",
        regionSubtitle: "Pomoże nam to znaleźć treści dostępne w Twoim regionie",

        platforms: "Do jakich serwisów streamingowych masz dostęp?",
        platformsSubtitle: "Wybierz wszystkie - będziemy priorytetowo traktować treści na Twoich serwisach",

        contentType: "Jakiego typu treści szukasz?",
        contentTypeSubtitle: "Pomoże nam to zawęzić idealną rekomendację",

        movieLength: "Jak długi ma być Twój film?",
        movieLengthSubtitle: "Dopasujemy czas trwania do Twojego wolnego czasu",

        seriesPreferences: "Co preferujesz w serialach?",
        seriesPreferencesSubtitle: "Pomóż nam znaleźć idealny maraton",

        mood: "Jaki jest Twój obecny nastrój?",
        moodSubtitle: "Dopasujemy treści do tego, jak się czujesz",

        preferredGenres: "Które gatunki najbardziej lubisz?",
        preferredGenresSubtitle: "Wybierz ulubione - znajdziemy najlepsze w każdej kategorii",

        releaseYear: "Z jakiego okresu mają być Twoje treści?",
        releaseYearSubtitle: "Od najnowszych premier po ponadczasowe klasyki",

        languagePreference: "Jakie masz preferencje językowe?",
        languagePreferenceSubtitle: "Oryginalny dźwięk, dubbing czy napisy?",

        qualityPreference: "Jakie masz preferencje jakościowe?",
        qualityPreferenceSubtitle: "Wysoko oceniane hity czy ukryte perły?",

        watchingTime: "Kiedy planujesz oglądać?",
        watchingTimeSubtitle: "Weźmiemy pod uwagę Twój harmonogram",

        watchingCompany: "Z kim będziesz oglądać?",
        watchingCompanySubtitle: "Treści odpowiednie dla Twojej publiczności"
      },

      options: {
        region: {
          poland: "Polska",
          usa: "Stany Zjednoczone",
          uk: "Wielka Brytania", 
          germany: "Niemcy",
          auto: "Wykryj automatycznie"
        },

        movie: "Filmy",
        series: "Seriale",
        documentary: "Dokumenty",
        animation: "Animacje",
        notSure: "Nie jestem pewien/pewna",

        movieLength: {
          short: "Krótki (poniżej 90 min)",
          standard: "Standardowy (90-150 min)",
          long: "Długi (powyżej 150 min)",
          noPreference: "Bez preferencji"
        },

        series: {
          finished: "Zakończone seriale (mogę oglądać maraton)",
          ongoing: "Obecnie emitowane",
          shortSeason: "Krótkie sezony (poniżej 10 odcinków)",
          longSeason: "Długie sezony (10+ odcinków)",
          noPreference: "Bez preferencji"
        },

        mood: {
          laugh: "Chcę się pośmiać",
          touching: "Coś wzruszającego/emocjonalnego",
          adrenaline: "Akcja i adrenalina",
          relax: "Coś relaksującego",
          think: "Coś skłaniającego do myślenia",
          escape: "Czysta ucieczka od rzeczywistości",
          notSure: "Zaskocz mnie"
        },

        genres: {
          action: "Akcja",
          comedy: "Komedia",
          drama: "Dramat",
          horror: "Horror",
          thriller: "Thriller",
          romance: "Romans",
          scifi: "Science Fiction",
          fantasy: "Fantasy",
          documentary: "Dokumentalny",
          animation: "Animacja",
          crime: "Kryminał",
          history: "Historyczny"
        },

        releaseYear: {
          latest: "Najnowsze premiery (2024-2025)",
          recent: "Ostatnie hity (2020-2024)",
          modern: "Nowoczesne klasyki (2000-2020)",
          classic: "Klasyki z lat 90. (1980-1999)",
          vintage: "Vintage (przed 1980)",
          noPreference: "Dowolna epoka"
        },

        language: {
          original: "Język oryginalny z napisami",
          dubbed: "Dubbing w moim języku",
          subtitles: "Nie przeszkadzają mi napisy",
          localLanguage: "Tylko w moim języku",
          noPreference: "Bez preferencji"
        },

        quality: {
          onlyHighRated: "Tylko wysoko oceniane (7.5+ gwiazdek)",
          mixed: "Mix popularnych i jakościowych",
          hidden: "Ukryte perły i niedoceniane",
          noPreference: "Pokaż mi wszystko"
        },

        watchingTime: {
          now: "Teraz",
          tonight: "Dzisiaj wieczorem",
          weekend: "W ten weekend",
          planning: "Planuję z wyprzedzeniem",
          noPreference: "Bez pośpiechu"
        },

        company: {
          alone: "Sam/sama",
          partner: "Z partnerem/partnerką",
          family: "Z rodziną",
          friends: "Z przyjaciółmi",
          kids: "Z dziećmi",
          noPreference: "Zależy od treści"
        }
      },

      results: {
        title: "Twoje Spersonalizowane Rekomendacje",
        subtitle: "Znaleziono {{count}} idealnych dopasowań dla Ciebie",
        whyRecommended: "Dlaczego to wybraliśmy",
        availableOn: "Oglądaj na",
        availableInOtherRegions: "Dostępne w innych regionach",
        noStreamingInfo: "Informacje o streamingu niedostępne",
        trailer: "Zwiastun",
        addToWatchlist: "Dodaj do Listy"
      },

      feedback: {
        title: "Jak nam poszło?",
        rating: "Oceń te rekomendacje"
      }
    }
  }
};
