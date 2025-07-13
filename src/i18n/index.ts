
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import { en } from "./locales/en";

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

// Enhanced English translations with all needed keys
const enhancedEn = {
  ...en,
  // Site navigation and main content
  'site.findYourMovie': 'Find Your Perfect Movie',
  'site.exploreCollections': 'Explore Collections',
  'search.movies': 'Search Movies',
  'search.placeholder': 'Search for a movie...',
  'search.creatorPlaceholder': 'Search for directors, actors...',
  'search.button': 'Search',
  'search.creators': 'Creators',
  'search.trySearching': 'Try searching for',
  'search.moviesFound': 'Movies Found',
  'creator.searchByCreator': 'Find movies by directors and actors',
  'creator.creatorDescription': 'Discover films from your favorite creators',
  'creator.filmographyTitle': 'Filmography of {{name}}',
  'creator.bestMovies': 'Best movies and shows',
  'creator.allMovies': 'Complete filmography',
  'creator.moviesAndShows': 'titles',
  'creator.asRole': 'as',
  'creator.job': 'Job',
  
  // Quiz translations
  'quiz.start': 'Start Quiz',
  'quiz.questions.platforms': 'Streaming Platforms',
  'quiz.questions.platformsSubtitle': 'Select your streaming services',
  
  // Streaming availability
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
  'streaming.types.subscription': 'Subscription',
  'streaming.types.free': 'Free',
  'streaming.types.ads': 'Free with ads',
  'streaming.types.rent': 'Rent',
  'streaming.types.buy': 'Buy',
  'streaming.types.tvod': 'Rent/Buy',
  'streaming.types.addon': 'Add-on package',

  // Movie details
  'movie.details': 'Details',
  'movie.releaseDate': 'Release Date',
  'movie.rating': 'Rating',
  'movie.votes': 'Votes',
  'movie.popularity': 'Popularity',
  'movie.genre': 'Genre',
  'movie.action': 'Action',
  'movie.comedy': 'Comedy',
  'movie.drama': 'Drama',
  'movie.horror': 'Horror',
  'movie.romance': 'Romance',
  'movie.sciFi': 'Sci-Fi',
  'movie.thriller': 'Thriller',
  'movie.documentary': 'Documentary',
  'movie.animation': 'Animation',
  'movie.family': 'Family',
  'movie.crime': 'Crime',
  'movie.adventure': 'Adventure',
  'movie.fantasy': 'Fantasy',
  'movie.mystery': 'Mystery',
  'movie.music': 'Music',
  'movie.history': 'History',
  'movie.war': 'War',
  'movie.western': 'Western',
  'movie.tvMovie': 'TV Movie',
  'movie.trending': 'Trending',
  'movie.popular': 'Popular',

  // Common UI elements
  'common.refresh': 'Refresh',
  'common.tryAgain': 'Try Again',
  'common.viewDetails': 'View Details',
  'common.availableOn': 'Available on',
  'common.languageChanged': 'Language changed',
  'common.languageChangedTo': 'Language changed to {{language}}',
  'common.selectLanguage': 'Select language',
  'common.loading': 'Loading...',
  'common.selected': 'Selected',
  'common.back': 'Back',

  // Error handling
  'errors.generalError': 'Error',
  'errors.trailerError': 'Error loading trailer',
  'errors.trailerNotFound': 'Trailer not found',
  'errors.tryAgain': 'Please try again later',
  'errors.loadingServices': 'Error loading services',
  'errors.quizError': 'Quiz Error',
  'hideTrailer': 'Hide Trailer',
  'watchTrailer': 'Watch Trailer',
  'ratings.saved': 'Rating saved',
  'ratings.savedDescription': 'Your rating for {{title}} has been saved',

  // Random movie section
  'randomMovie.title': 'Random Movie for Today',
  'randomMovie.subtitle': 'Don\'t know what to watch? Let us pick something for you!',
  'randomMovie.generate': 'Generate Random Movie',
  'randomMovie.generating': 'Generating...',
  'randomMovie.regenerate': 'Generate Again',
  'randomMovie.success': 'Random movie generated!',
  'randomMovie.successDescription': 'We found for you: {{title}}',

  // Find perfect movie section
  'findPerfect.title': 'Find Your Perfect Movie',
  'findPerfect.subtitle': 'Search for movies and creators or answer a few questions in our movie quiz',
  'findPerfect.searchMovies': 'Movies',
  'findPerfect.searchCreators': 'Creators',
  'findPerfect.searchPlaceholder': 'Enter movie title...',
  'findPerfect.creatorsPlaceholder': 'Enter actor, director name...',
  'findPerfect.searchButton': 'Search',
  'findPerfect.searching': 'Searching...',
  'findPerfect.popularSearches': 'Popular searches:',
  'findPerfect.quizAlternative': 'Or let us find ideal movies tailored to your preferences',
  'findPerfect.startQuiz': 'Start Movie Quiz',
  'findPerfect.features.personalized': 'Personalized recommendations',
  'findPerfect.features.availability': 'Service availability',
  'findPerfect.features.matching': 'Smart matching',

  // Discover section
  'discover.trending': 'Trending This Week',
  'discover.popular': 'Popular Movies',
  'discover.noMoviesFound': 'No movies found',

  // Footer translations
  'footer.companyInfo': 'Company',
  'footer.support': 'Support',
  'footer.legal': 'Legal',
  'footer.about': 'About Us',
  'footer.contact': 'Contact',
  'footer.careers': 'Careers',
  'footer.press': 'Press',
  'footer.help': 'Help Center',
  'footer.faq': 'FAQ',
  'footer.refunds': 'Refunds',
  'footer.terms': 'Terms of Service',
  'footer.privacy': 'Privacy Policy',
  'footer.copyright': 'Copyright',
  'footer.cookies': 'Cookie Policy',
  'footer.language': 'Language',
  'footer.allRightsReserved': 'All Rights Reserved',
  'footer.madeWith': 'Made with',
  'footer.by': 'by',
  'footer.description': 'MovieFinder helps you discover your next favorite movie across all streaming platforms. Find what to watch next with personalized recommendations.'
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: enhancedEn
    },
    fallbackLng: "en",
    lng: "en", // Force English
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
