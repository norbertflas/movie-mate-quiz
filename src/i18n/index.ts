
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import pl from './locales/pl';
import de from './locales/de';
import es from './locales/es';
import fr from './locales/fr';
import it from './locales/it';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en,
      pl,
      de,
      es,
      fr,
      it,
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
