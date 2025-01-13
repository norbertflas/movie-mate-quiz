import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      theme: {
        light: "Light",
        dark: "Dark",
        system: "System",
      },
      navigation: {
        home: "Home",
        search: "Search",
        favorites: "Favorites",
        ratings: "Ratings",
        logout: "Logout",
      },
      search: {
        placeholder: "Search for movies...",
        button: "Search",
        searching: "Searching...",
        resultsFound: "Found titles",
        resultsDescription: "Found {{count}} titles matching \"{{query}}\"",
        noResults: "No results",
        noResultsDescription: "No titles found matching \"{{query}}\"",
        error: "Search error",
        errorDescription: "An error occurred while searching. Please try again later.",
      },
      common: {
        movie: "Movie",
        loading: "Loading...",
        error: "Error",
        success: "Success",
      },
      quiz: {
        start: "Start Quiz",
        next: "Next",
        previous: "Previous",
        submit: "Submit",
        recommendations: "Your Recommendations",
        loading: "Loading recommendations...",
        error: "Error loading recommendations",
      },
      services: {
        preferences: "Streaming Services",
        added: "Service added",
        removed: "Service removed",
        preferencesUpdated: "Your streaming preferences have been updated",
      },
      errors: {
        loadingServices: "Error loading services",
        loadingPreferences: "Error loading preferences",
        addingService: "Error adding service",
        removingService: "Error removing service",
      },
      availableOn: "Available on",
    },
  },
  pl: {
    translation: {
      theme: {
        light: "Jasny",
        dark: "Ciemny",
        system: "Systemowy",
      },
      navigation: {
        home: "Strona główna",
        search: "Wyszukaj",
        favorites: "Ulubione",
        ratings: "Oceny",
        logout: "Wyloguj",
      },
      search: {
        placeholder: "Szukaj filmów...",
        button: "Szukaj",
        searching: "Szukam...",
        resultsFound: "Znalezione tytuły",
        resultsDescription: "Znaleziono {{count}} tytułów pasujących do \"{{query}}\"",
        noResults: "Brak wyników",
        noResultsDescription: "Nie znaleziono tytułów pasujących do \"{{query}}\"",
        error: "Błąd wyszukiwania",
        errorDescription: "Wystąpił problem podczas wyszukiwania. Spróbuj ponownie później.",
      },
      common: {
        movie: "Film",
        loading: "Ładowanie...",
        error: "Błąd",
        success: "Sukces",
      },
      quiz: {
        start: "Rozpocznij Quiz",
        next: "Dalej",
        previous: "Wstecz",
        submit: "Zatwierdź",
        recommendations: "Twoje Rekomendacje",
        loading: "Ładowanie rekomendacji...",
        error: "Błąd ładowania rekomendacji",
      },
      services: {
        preferences: "Serwisy streamingowe",
        added: "Dodano serwis",
        removed: "Usunięto serwis",
        preferencesUpdated: "Twoje preferencje zostały zaktualizowane",
      },
      errors: {
        loadingServices: "Błąd ładowania serwisów",
        loadingPreferences: "Błąd ładowania preferencji",
        addingService: "Błąd dodawania serwisu",
        removingService: "Błąd usuwania serwisu",
      },
      availableOn: "Dostępne na",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: navigator.language.split('-')[0] || "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;