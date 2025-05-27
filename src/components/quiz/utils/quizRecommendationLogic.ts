
import { supabase } from "@/integrations/supabase/client";
import type { QuizAnswer, MovieRecommendation, EnhancedQuizFilters } from "../QuizTypes";
import { useTranslation } from "react-i18next";

// Mapowanie języków na regiony
const getRegionFromLanguage = (language: string): string => {
  const languageToRegion: Record<string, string> = {
    'pl': 'pl',
    'en': 'us', 
    'de': 'de',
    'fr': 'fr',
    'es': 'es',
    'it': 'it'
  };
  
  return languageToRegion[language] || 'us';
};

export const parseQuizAnswers = (answers: QuizAnswer[]): EnhancedQuizFilters => {
  console.log('Parsing quiz answers:', answers);
  
  const answerMap = answers.reduce((acc, answer) => {
    acc[answer.questionId] = answer.answer;
    return acc;
  }, {} as Record<string, string>);

  console.log('Answer map:', answerMap);

  // Pobierz aktualny język z localStorage lub domyślnie 'en'
  const currentLanguage = localStorage.getItem('language') || 'en';
  const region = getRegionFromLanguage(currentLanguage);

  // Parse platforms - handle both string and array formats
  let platforms: string[] = [];
  if (answerMap.platforms) {
    try {
      // Try to parse as JSON array first
      platforms = JSON.parse(answerMap.platforms);
    } catch {
      // If parsing fails, treat as comma-separated string
      platforms = answerMap.platforms.split(',').map(p => p.trim());
    }
  }

  // Parse genres - POPRAWKA: prawidłowe parsowanie gatunków
  let genres: string[] = [];
  if (answerMap.genres || answerMap.preferredGenres) {
    const genreAnswer = answerMap.genres || answerMap.preferredGenres;
    try {
      const parsed = JSON.parse(genreAnswer);
      if (Array.isArray(parsed)) {
        genres = parsed;
      }
    } catch {
      // Jeśli nie można sparsować, sprawdź czy to pojedynczy gatunek
      if (genreAnswer && genreAnswer !== '[]' && genreAnswer !== '') {
        genres = [genreAnswer];
      }
    }
  }

  // Mapowanie nastroju na gatunki jeśli brak bezpośredniego wyboru
  if (genres.length === 0 && answerMap.mood) {
    const moodToGenres: Record<string, string[]> = {
      'Coś śmiesznego': ['Comedy', 'Family'],
      'Coś wzruszającego': ['Drama', 'Romance'],
      'Coś z adreną': ['Action', 'Thriller', 'Adventure'],
      'Coś do relaksu': ['Animation', 'Documentary', 'Family'],
      'Coś relaksującego': ['Animation', 'Documentary', 'Family'],
      'Something funny': ['Comedy', 'Family'],
      'Something touching': ['Drama', 'Romance'],
      'Something with adrenaline': ['Action', 'Thriller', 'Adventure'],
      'Something to relax': ['Animation', 'Documentary', 'Family']
    };
    
    const moodGenres = moodToGenres[answerMap.mood];
    if (moodGenres) {
      genres = moodGenres;
    }
  }

  // Mapowanie długości filmu
  let runtime: { min?: number; max?: number } | undefined;
  if (answerMap.movieLength) {
    switch (answerMap.movieLength) {
      case 'Krótki (do 90 minut)':
      case 'Short (up to 90 minutes)':
        runtime = { max: 90 };
        break;
      case 'Standardowy (90-120 minut)':
      case 'Standard (90-120 minutes)':
        runtime = { min: 90, max: 120 };
        break;
      case 'Długi (powyżej 120 minut)':
      case 'Long (over 120 minutes)':
        runtime = { min: 120 };
        break;
    }
  }

  const filters: EnhancedQuizFilters = {
    platforms,
    contentType: (answerMap.contentType as any) || 'movies',
    mood: answerMap.mood || 'notSure',
    genres,
    runtime,
    region, // Używaj regionu na podstawie języka
    languages: [currentLanguage], // Używaj aktualnego języka
    includeStreamingInfo: true,
    maxResults: 20,
    minRating: platforms.some(p => ['Netflix', 'Disney+', 'HBO Max'].includes(p)) ? 6.5 : 6.0
  };

  console.log('Parsed enhanced filters:', filters);
  return filters;
};

export const getPersonalizedRecommendations = async (filters: EnhancedQuizFilters): Promise<MovieRecommendation[]> => {
  try {
    console.log('Getting personalized recommendations with enhanced filters:', filters);
    
    // Pobierz aktualny język dla lokalizacji
    const currentLanguage = localStorage.getItem('language') || 'en';
    
    // Przygotuj prompt uwzględniający wszystkie preferencje użytkownika z regionem
    const userPreferences = {
      platforms: filters.platforms?.join(', ') || 'Any platform',
      genres: filters.genres?.join(', ') || 'Mixed genres',
      mood: filters.mood || 'Any mood',
      contentType: filters.contentType || 'Movies',
      runtime: filters.runtime ? 
        `${filters.runtime.min || 0}-${filters.runtime.max || 999} minutes` : 'Any length',
      region: filters.region || 'us',
      language: currentLanguage
    };

    const enhancedPrompt = `Find movies that match these specific user preferences for region ${userPreferences.region.toUpperCase()}:
- Available on at least ONE of these platforms: ${userPreferences.platforms}
- Genres: ${userPreferences.genres}
- Mood/Style: ${userPreferences.mood}
- Content Type: ${userPreferences.contentType}
- Runtime: ${userPreferences.runtime}
- Region: ${userPreferences.region}
- Language preference: ${userPreferences.language}

Focus on highly-rated movies that are available in the ${userPreferences.region.toUpperCase()} region. The movie should be available on AT LEAST ONE of the specified platforms, not necessarily all of them. Prioritize recent releases and popular titles that match the mood and genre preferences exactly.`;

    const { data, error } = await supabase.functions.invoke('get-personalized-recommendations', {
      body: { 
        prompt: enhancedPrompt,
        filters: filters,
        answers: Object.entries(filters).map(([questionId, answer]) => ({
          questionId,
          answer: typeof answer === 'object' ? JSON.stringify(answer) : String(answer)
        }))
      }
    });

    if (error) {
      console.error('Error from Enhanced Edge Function:', error);
      throw error;
    }

    console.log('Received enhanced recommendations:', data);
    
    if (!data || !Array.isArray(data)) {
      throw new Error('Invalid response format from enhanced recommendations service');
    }

    // Wzbogać rekomendacje o informacje streamingowe dla odpowiedniego regionu
    const enrichedRecommendations = await Promise.all(
      data.map(async (movie: any) => {
        try {
          // Pobierz dostępność streamingową dla odpowiedniego regionu
          const { data: streamingData, error: streamingError } = await supabase.functions.invoke('streaming-availability', {
            body: {
              tmdbId: movie.id,
              country: filters.region || 'us',
              title: movie.title,
              year: movie.release_date?.split('-')[0]
            }
          });

          let availableOn: string[] = [];
          let streamingLinks: Record<string, string> = {};

          if (!streamingError && streamingData?.result) {
            availableOn = streamingData.result.map((service: any) => service.service);
            streamingLinks = streamingData.result.reduce((acc: any, service: any) => {
              acc[service.service] = service.link;
              return acc;
            }, {});
          }

          // Dodaj wyjaśnienie dlaczego film został polecony z uwzględnieniem regionu
          const explanations: string[] = [];
          
          if (filters.genres?.some(genre => movie.genre_ids?.includes(getGenreId(genre)))) {
            explanations.push(`Matches your preferred genre: ${filters.genres.join(', ')}`);
          }
          
          // POPRAWKA: sprawdź dostępność na PRZYNAJMNIEJ JEDNEJ platformie
          if (availableOn.some(platform => filters.platforms?.includes(platform))) {
            const matchingPlatforms = availableOn.filter(platform => filters.platforms?.includes(platform));
            explanations.push(`Available on: ${matchingPlatforms.join(', ')}`);
          }
          
          if (movie.vote_average >= 7.5) {
            explanations.push('Highly rated by viewers');
          }

          // Dodaj informację o regionie
          if (filters.region && filters.region !== 'us') {
            explanations.push(`Available in ${filters.region.toUpperCase()} region`);
          }

          return {
            ...movie,
            availableOn,
            streamingLinks,
            explanations: explanations.length > 0 ? explanations : ['Popular choice matching your preferences']
          };
        } catch (enrichError) {
          console.error(`Error enriching movie ${movie.id}:`, enrichError);
          return {
            ...movie,
            availableOn: [],
            streamingLinks: {},
            explanations: ['Recommended based on your preferences']
          };
        }
      })
    );

    return enrichedRecommendations;
  } catch (error) {
    console.error('Error getting enhanced personalized recommendations:', error);
    throw error;
  }
};

// Helper function to map genre names to IDs
const getGenreId = (genreName: string): number => {
  const genreMap: Record<string, number> = {
    'Action': 28,
    'Adventure': 12,
    'Animation': 16,
    'Comedy': 35,
    'Crime': 80,
    'Documentary': 99,
    'Drama': 18,
    'Family': 10751,
    'Fantasy': 14,
    'History': 36,
    'Horror': 27,
    'Music': 10402,
    'Mystery': 9648,
    'Romance': 10749,
    'Science Fiction': 878,
    'Sci-Fi': 878,
    'TV Movie': 10770,
    'Thriller': 53,
    'War': 10752,
    'Western': 37
  };
  
  return genreMap[genreName] || 28; // Default to Action
};

export const generateFallbackRecommendations = (filters: EnhancedQuizFilters): MovieRecommendation[] => {
  console.log('Generating enhanced fallback recommendations for:', filters);
  
  // Lepsze rekomendacje fallback dopasowane do preferencji użytkownika z regionem
  const genreBasedMovies: Record<string, any[]> = {
    'Comedy': [
      {
        id: 13,
        title: "Forrest Gump",
        overview: "The presidencies of Kennedy and Johnson through the eyes of an Alabama man with an IQ of 75.",
        poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
        release_date: "1994-07-06",
        vote_average: 8.5,
        genre: "Comedy/Drama",
        availableOn: ['Netflix', 'Amazon Prime Video'],
        explanations: ["Heartwarming comedy-drama", `Available in ${filters.region?.toUpperCase() || 'US'} region`]
      }
    ],
    'Drama': [
      {
        id: 278,
        title: "The Shawshank Redemption",
        overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption.",
        poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
        release_date: "1994-09-23",
        vote_average: 9.3,
        genre: "Drama",
        availableOn: ['HBO Max', 'Amazon Prime Video'],
        explanations: ["Highly acclaimed drama", "Perfect for touching moments"]
      }
    ],
    'Action': [
      {
        id: 155,
        title: "The Dark Knight",
        overview: "Batman faces the Joker, a criminal mastermind who wants to plunge Gotham City into anarchy.",
        poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        release_date: "2008-07-18",
        vote_average: 9.0,
        genre: "Action",
        availableOn: ['HBO Max', 'Netflix'],
        explanations: ["Action-packed superhero film", "High adrenaline content"]
      }
    ]
  };

  // Wybierz filmy na podstawie gatunków użytkownika
  let selectedMovies: any[] = [];
  
  if (filters.genres && filters.genres.length > 0) {
    filters.genres.forEach(genre => {
      const moviesForGenre = genreBasedMovies[genre];
      if (moviesForGenre) {
        selectedMovies.push(...moviesForGenre);
      }
    });
  }

  // Jeśli brak filmów dla gatunków, użyj domyślnych
  if (selectedMovies.length === 0) {
    selectedMovies = [
      ...genreBasedMovies.Comedy,
      ...genreBasedMovies.Drama,
      ...genreBasedMovies.Action
    ];
  }

  return selectedMovies.slice(0, 8);
};
