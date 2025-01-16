import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en";
import { pl } from "./locales/pl";
import { es } from "./locales/es";
import { de } from "./locales/de";
import { fr } from "./locales/fr";
import { it } from "./locales/it";

const i18nInstance = i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    pl: { translation: pl },
    es: { translation: es },
    de: { translation: de },
    fr: { translation: fr },
    it: { translation: it },
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