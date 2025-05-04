
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import { en } from "./locales/en";
import { pl } from "./locales/pl";
import { fr } from "./locales/fr";
import { es } from "./locales/es";
import { it } from "./locales/it";
import { de } from "./locales/de";

// Fix: Override console.warn for i18next to avoid console spam
const originalWarn = console.warn;
console.warn = (...args) => {
  // Filter out "was not found" warnings from i18next
  if (
    typeof args[0] === 'string' && 
    (args[0].includes('i18next::translator') || args[0].includes('was not found'))
  ) {
    return; // Silently ignore i18next missing key warnings
  }
  originalWarn(...args);
};

// Define fallbacks for missing translations
const fallbackResources = {
  // English fallbacks for common UI elements
  'site.findYourMovie': 'Find Your Perfect Movie',
  'site.exploreCollections': 'Explore Collections',
  'search.movies': 'Search Movies',
  'search.placeholder': 'Search for a movie...',
  'creator.searchByCreator': 'Find movies by directors and actors',
  'creator.creatorDescription': 'Discover films from your favorite creators',
  'quiz.start': 'Start Quiz',
  'quiz.questions.platforms': 'Streaming Platforms',
  'quiz.questions.platformsSubtitle': 'Select your streaming services',
  'streaming.availableOn': 'Available on',
  'streaming.checking': 'Checking Availability',
  'streaming.checkAvailability': 'Check Streaming Availability',
  'streaming.checkingDescription': 'Searching for {{title}} on streaming services',
  'streaming.searching': 'Searching streaming platforms...',
  'streaming.lastChecked': 'Last checked',
  'streaming.retrying': 'Retrying',
  'streaming.retryingDescription': 'Checking streaming services again',
  'streaming.dataStale': 'This streaming information may be outdated',
  'streaming.errorChecking': 'Error checking streaming availability',
  'streaming.notAvailable': 'This movie is not available for streaming in your region',
  'streaming.watchOn': 'Watch on {{service}}',
  'streaming.clickToWatch': 'Click to watch',
  'streaming.availableSince': 'Available since',
  'streaming.leavingSoon': 'Leaving soon',
  'streaming.linkError': 'Streaming Link Error',
  'streaming.noLinkAvailable': 'No link available for {{service}}',
  'streaming.alreadyChecking': 'Already checking',
  'streaming.pleaseWait': 'Please wait while we check streaming availability',
  'streaming.checkError': 'Failed to check streaming availability',
  'movie.details': 'Details',
  'movie.releaseDate': 'Release Date',
  'movie.rating': 'Rating',
  'movie.votes': 'Votes',
  'movie.popularity': 'Popularity',
  'common.refresh': 'Refresh',
  'common.tryAgain': 'Try Again',
  'errors.generalError': 'Error',
  'errors.trailerError': 'Error loading trailer',
  'errors.trailerNotFound': 'Trailer not found',
  'errors.tryAgain': 'Please try again later',
  'errors.loadingServices': 'Error loading services',
  'hideTrailer': 'Hide Trailer',
  'watchTrailer': 'Watch Trailer',
  'ratings.saved': 'Rating saved',
  'ratings.savedDescription': 'Your rating for {{title}} has been saved',
  'streaming.types.subscription': 'Subscription',
  'streaming.types.free': 'Free',
  'streaming.types.ads': 'Free with ads',
  'streaming.types.rent': 'Rent',
  'streaming.types.buy': 'Buy',
  'streaming.types.tvod': 'Rent/Buy',
  'streaming.types.addon': 'Add-on package'
};

// Add fallback translations to English and Polish resources
const enhancedEn = {
  ...en,
  translation: {
    ...en.translation,
    ...fallbackResources
  }
};

const enhancedPl = {
  ...pl,
  translation: {
    ...pl.translation,
    // Add Polish translations for the fallbacks
    'site.findYourMovie': 'Znajdź idealny film',
    'site.exploreCollections': 'Przeglądaj kolekcje',
    'search.movies': 'Szukaj filmów',
    'search.placeholder': 'Szukaj filmu...',
    'creator.searchByCreator': 'Znajdź filmy reżyserów i aktorów',
    'creator.creatorDescription': 'Odkryj filmy swoich ulubionych twórców',
    'quiz.start': 'Rozpocznij quiz',
    'quiz.questions.platforms': 'Platformy streamingowe',
    'quiz.questions.platformsSubtitle': 'Wybierz swoje serwisy streamingowe',
    'streaming.availableOn': 'Dostępne na',
    'streaming.checking': 'Sprawdzanie dostępności',
    'streaming.checkAvailability': 'Sprawdź dostępność streamingu',
    'streaming.checkingDescription': 'Szukanie {{title}} na platformach streamingowych',
    'streaming.searching': 'Szukanie platform streamingowych...',
    'streaming.lastChecked': 'Ostatnio sprawdzane',
    'streaming.retrying': 'Ponowna próba',
    'streaming.retryingDescription': 'Sprawdzanie serwisów streamingowych ponownie',
    'streaming.dataStale': 'Te informacje o streamingu mogą być nieaktualne',
    'streaming.errorChecking': 'Błąd podczas sprawdzania dostępności streamingu',
    'streaming.notAvailable': 'Ten film nie jest dostępny w streamingu w Twoim regionie',
    'streaming.watchOn': 'Oglądaj na {{service}}',
    'streaming.clickToWatch': 'Kliknij, aby obejrzeć',
    'streaming.availableSince': 'Dostępny od',
    'streaming.leavingSoon': 'Wkrótce zniknie',
    'streaming.linkError': 'Błąd linku do streamingu',
    'streaming.noLinkAvailable': 'Brak dostępnego linku dla {{service}}',
    'streaming.alreadyChecking': 'Już sprawdzam',
    'streaming.pleaseWait': 'Proszę czekać, sprawdzamy dostępność streamingu',
    'streaming.checkError': 'Nie udało się sprawdzić dostępności streamingu',
    'movie.details': 'Szczegóły',
    'movie.releaseDate': 'Data premiery',
    'movie.rating': 'Ocena',
    'movie.votes': 'Głosy',
    'movie.popularity': 'Popularność',
    'common.refresh': 'Odśwież',
    'common.tryAgain': 'Spróbuj ponownie',
    'errors.generalError': 'Błąd',
    'errors.trailerError': 'Błąd ładowania zwiastunu',
    'errors.trailerNotFound': 'Nie znaleziono zwiastunu',
    'errors.tryAgain': 'Spróbuj ponownie później',
    'errors.loadingServices': 'Błąd ładowania serwisów',
    'hideTrailer': 'Ukryj zwiastun',
    'watchTrailer': 'Oglądaj zwiastun',
    'ratings.saved': 'Ocena zapisana',
    'ratings.savedDescription': 'Twoja ocena dla {{title}} została zapisana',
    'streaming.types.subscription': 'Subskrypcja',
    'streaming.types.free': 'Za darmo',
    'streaming.types.ads': 'Za darmo z reklamami',
    'streaming.types.rent': 'Wypożyczenie',
    'streaming.types.buy': 'Zakup',
    'streaming.types.tvod': 'Wypożyczenie/Zakup',
    'streaming.types.addon': 'Dodatek'
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: enhancedEn,
      pl: enhancedPl,
      fr,
      es,
      it,
      de
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
    debug: false
  });

export default i18n;
