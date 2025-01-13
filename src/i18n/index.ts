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
    },
  },
  // Add more languages here
};

i18n.use(initReactI18next).init({
  resources,
  lng: "pl",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;