
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en";
import pl from "./locales/pl";
import LanguageDetector from "i18next-browser-languagedetector";

// Get saved language from localStorage or use browser settings with fallback to 'en'
const getSavedLanguage = () => {
  try {
    // Check if localStorage is available 
    const testKey = '__test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    
    // If we get here, localStorage is available
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) return savedLanguage;
    
    // Try to detect browser language
    const browserLang = navigator.language;
    if (browserLang && browserLang.startsWith('pl')) return 'pl';
    
    return 'en'; // Default fallback
  } catch (error) {
    console.warn('Error accessing localStorage:', error);
    return 'en'; // Fallback if localStorage is not available
  }
};

// Initialize i18next
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
    // Fix issues with keySeparator and nsSeparator
    keySeparator: '.',
    nsSeparator: ':',
    debug: import.meta.env.DEV,
  });

// Set up language change handling
i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem("language", lng);
  } catch (error) {
    console.warn('Error writing to localStorage:', error);
  }
  
  document.documentElement.lang = lng;
  document.documentElement.dir = i18n.dir(lng);
  
  // Dispatch a custom event for components that need to react to language changes
  document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lng } }));
  
  console.log(`Language changed to: ${lng}`);
});

export default i18n;
