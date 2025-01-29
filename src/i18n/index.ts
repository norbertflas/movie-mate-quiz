import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en";
import { pl } from "./locales/pl";

const i18nInstance = i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    pl: { translation: pl },
  },
  lng: localStorage.getItem("language") || "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("language", lng);
});

export default i18n;