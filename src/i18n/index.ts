
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en";
import pl from "./locales/pl";

const savedLanguage = localStorage.getItem("language") || "en";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en.translation },
      pl: { translation: pl.translation },
    },
    lng: savedLanguage,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    // Fix for nested keys with dots by disabling key separators
    keySeparator: false,
    nsSeparator: false,
  });

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("language", lng);
  document.documentElement.lang = lng;
});

export default i18n;
