
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en";
import pl from "./locales/pl";
import LanguageDetector from "i18next-browser-languagedetector";

// Get saved language from localStorage or use browser settings with fallback to 'en'
const getSavedLanguage = () => {
  const savedLanguage = localStorage.getItem("language");
  if (savedLanguage) return savedLanguage;
  
  // Try to detect browser language
  const browserLang = navigator.language;
  if (browserLang && browserLang.startsWith('pl')) return 'pl';
  
  return 'en'; // Default fallback
};

i18n
  .use(initReactI18next)
  .use(LanguageDetector) // Add language detector to better handle browser language
  .init({
    resources: {
      en: { translation: en },
      pl: { translation: pl },
    },
    lng: getSavedLanguage(),
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    keySeparator: false,
    nsSeparator: false,
    // Add debug option to help troubleshoot translation issues in development
    debug: import.meta.env.DEV,
  });

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("language", lng);
  document.documentElement.lang = lng;
  
  // Force refresh key components that depend on translations
  // This helps ensure translations are applied correctly
  document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lng } }));
});

export default i18n;
