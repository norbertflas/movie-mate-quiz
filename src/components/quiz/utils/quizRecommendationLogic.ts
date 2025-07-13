
import type { QuizAnswer, MovieRecommendation } from "../QuizTypes";
import { supabase } from "@/integrations/supabase/client";

export interface QuizFilters {
  platforms: string[];
  contentType: string;
  genres: string[];
  mood: string;
  movieLength?: string;
  currentMood?: string;
  viewingContext?: string;
  ratingPreference?: string;
  eraPreference?: string;
  intensityLevel?: string;
  languagePreference?: string;
  minRating?: number;
  maxResults?: number;
}

export const parseQuizAnswers = (answers: QuizAnswer[]): QuizFilters => {
  const answerMap = answers.reduce((map, answer) => {
    map[answer.questionId] = answer.answer;
    return map;
  }, {} as Record<string, string>);

  console.log('📝 Parsing quiz answers:', answerMap);

  // Parse platforms
  let platforms: string[] = [];
  if (answerMap.platforms) {
    try {
      platforms = JSON.parse(answerMap.platforms);
    } catch {
      platforms = answerMap.platforms.split(',').filter(p => p.trim());
    }
  }

  // Parse genres
  let genres: string[] = [];
  if (answerMap.genres) {
    try {
      genres = JSON.parse(answerMap.genres);
    } catch {
      genres = answerMap.genres.split(',').filter(g => g.trim());
    }
  }

  // Map mood to genres for better recommendations
  const moodToGenres: Record<string, string[]> = {
    happy: ['comedy', 'animation', 'family'],
    sad: ['drama', 'romance'],
    excited: ['action', 'thriller', 'adventure'],
    relaxed: ['documentary', 'animation', 'family'],
    thoughtful: ['drama', 'documentary', 'mystery'],
    nostalgic: ['classic', 'retro']
  };

  // Add mood-based genres
  const currentMood = answerMap.current_mood;
  if (currentMood && moodToGenres[currentMood]) {
    genres = [...genres, ...moodToGenres[currentMood]];
  }

  // Map viewing context to content preferences
  const contextToContentType: Record<string, string> = {
    family: 'family-friendly',
    friends: 'popular',
    partner: 'romantic',
    alone: 'personal',
    background: 'light'
  };

  const filters: QuizFilters = {
    platforms: platforms.filter(p => p !== 'any'),
    contentType: answerMap.content_type || 'not_sure',
    genres: [...new Set(genres)], // Remove duplicates
    mood: answerMap.mood || 'not_sure',
    movieLength: answerMap.movie_length,
    currentMood: answerMap.current_mood,
    viewingContext: answerMap.viewing_context,
    ratingPreference: answerMap.rating_preference,
    eraPreference: answerMap.era_preference,
    intensityLevel: answerMap.intensity_level,
    languagePreference: answerMap.language_preference,
    minRating: getMinRatingFromPreferences(answerMap),
    maxResults: 20
  };

  console.log('🎯 Generated filters:', filters);
  return filters;
};

const getMinRatingFromPreferences = (answers: Record<string, string>): number => {
  // Base rating on intensity and viewing context
  const intensity = answers.intensity_level;
  const context = answers.viewing_context;
  
  if (context === 'family') return 6.5; // Family-friendly, higher quality
  if (intensity === 'very_intense') return 7.0; // High quality for intense content
  if (answers.era_preference === 'classic') return 7.5; // Classics should be well-rated
  
  return 6.0; // Default minimum rating
};

export const getPersonalizedRecommendations = async (filters: QuizFilters): Promise<MovieRecommendation[]> => {
  try {
    console.log('🚀 Getting personalized recommendations with filters:', filters);
    
    const { data, error } = await supabase.functions.invoke('get-personalized-recommendations', {
      body: {
        filters,
        maxResults: filters.maxResults || 20
      }
    });

    if (error) {
      console.error('❌ Error from edge function:', error);
      throw error;
    }

    if (!data || !data.recommendations) {
      console.warn('⚠️ No recommendations from edge function');
      return [];
    }

    console.log('✅ Got recommendations:', data.recommendations.length);
    return data.recommendations;
  } catch (error) {
    console.error('💥 Error getting personalized recommendations:', error);
    throw error;
  }
};

export const generateFallbackRecommendations = (filters: QuizFilters): MovieRecommendation[] => {
  console.log('🎲 Generating fallback recommendations for filters:', filters);
  
  // Enhanced fallback recommendations based on user preferences
  const allRecommendations: MovieRecommendation[] = [
    // Action Movies
    {
      id: 155,
      title: "The Dark Knight",
      overview: "Batman musi stawić czoła Jokerowi, który sieje chaos w Gotham City.",
      poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      release_date: "2008-07-18",
      vote_average: 9.0,
      genre: "Akcja",
      trailer_url: null,
      tmdbId: 155,
      explanations: ["Najlepszy film o Batmanie", "Doskonała akcja"]
    },
    {
      id: 245891,
      title: "John Wick",
      overview: "Emerytowany zabójca wraca do akcji, aby pomścić śmierć swojego psa.",
      poster_path: "/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg",
      release_date: "2014-10-24",
      vote_average: 7.4,
      genre: "Akcja",
      trailer_url: null,
      tmdbId: 245891,
      explanations: ["Świetna akcja", "Nowoczesny thriller"]
    },
    // Comedy Movies
    {
      id: 12,
      title: "Gdzie jest Nemo",
      overview: "Młoda rybka Nemo zostaje złapana przez nurków, a jej ojciec rusza na poszukiwania.",
      poster_path: "/eHuGQ10FUzK1mdOY69wF5pGgEf5.jpg",
      release_date: "2003-05-30",
      vote_average: 8.2,
      genre: "Animacja",
      trailer_url: null,
      tmdbId: 12,
      explanations: ["Idealna komedia familijną", "Doskonała animacja"]
    },
    {
      id: 680,
      title: "Pulp Fiction",
      overview: "Splecione historie gangsterów, bokserów i par złodziei w Los Angeles.",
      poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
      release_date: "1994-10-14",
      vote_average: 8.9,
      genre: "Kryminalny",
      trailer_url: null,
      tmdbId: 680,
      explanations: ["Kultowy film Tarantino", "Niezapomniane dialogi"]
    },
    // Drama Movies
    {
      id: 550,
      title: "Fight Club",
      overview: "Opowieść o mężczyźnie cierpiącym na bezsenność, który wraz z charyzmatycznym sprzedawcą mydła tworzy podziemny klub walki.",
      poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      release_date: "1999-10-15",
      vote_average: 8.4,
      genre: "Dramat",
      trailer_url: null,
      tmdbId: 550,
      explanations: ["Głęboki dramat psychologiczny", "Kultowy film"]
    },
    {
      id: 238,
      title: "Ojciec chrzestny",
      overview: "Saga rodziny Corleone - jedna z najlepszych filmowych opowieści o mafii.",
      poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
      release_date: "1972-03-24",
      vote_average: 9.2,
      genre: "Dramat",
      trailer_url: null,
      tmdbId: 238,
      explanations: ["Klasyk kina", "Najwyżej oceniony film"]
    },
    {
      id: 13,
      title: "Forrest Gump",
      overview: "Historia mężczyzny o niskim IQ, który stał się świadkiem najważniejszych wydarzeń w historii USA.",
      poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
      release_date: "1994-07-06",
      vote_average: 8.8,
      genre: "Dramat",
      trailer_url: null,
      tmdbId: 13,
      explanations: ["Wzruszająca historia", "Doskonała gra aktorska"]
    },
    // Sci-Fi Movies
    {
      id: 603,
      title: "Matrix",
      overview: "Haker Neo odkrywa, że rzeczywistość to tylko symulacja komputerowa.",
      poster_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
      release_date: "1999-03-31",
      vote_average: 8.7,
      genre: "Science Fiction",
      trailer_url: null,
      tmdbId: 603,
      explanations: ["Rewolucyjny film sci-fi", "Innowacyjne efekty specjalne"]
    },
    {
      id: 19995,
      title: "Avatar",
      overview: "W 22. wieku sparaliżowany marine zostaje wysłany na księżyc Pandora w ramach unikalnej misji.",
      poster_path: "/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg",
      release_date: "2009-12-18",
      vote_average: 7.6,
      genre: "Science Fiction",
      trailer_url: null,
      tmdbId: 19995,
      explanations: ["Spektakularne efekty wizualne", "Epicka przygoda"]
    },
    // Horror Movies
    {
      id: 694,
      title: "Lśnienie",
      overview: "Pisarz z rodziną spędza zimę w odizolowanym hotelu, gdzie powoli wariuje.",
      poster_path: "/b6ko0IKC8MdYBBPkkA1aBPLe2yz.jpg",
      release_date: "1980-05-23",
      vote_average: 8.2,
      genre: "Horror",
      trailer_url: null,
      tmdbId: 694,
      explanations: ["Klasyk horroru", "Mistrzostwo Kubricka"]
    },
    // Romance Movies
    {
      id: 597,
      title: "Titanic",
      overview: "Historia miłości między Jackiem a Rose na pokładzie słynnego statku.",
      poster_path: "/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
      release_date: "1997-11-18",
      vote_average: 7.9,
      genre: "Romans",
      trailer_url: null,
      tmdbId: 597,
      explanations: ["Klasyczna historia miłosna", "Spektakularne efekty"]
    }
  ];

  // Smart filtering based on user preferences
  let filteredRecommendations = [...allRecommendations];

  // Filter by mood and genres
  if (filters.mood && filters.mood !== 'not_sure') {
    const moodToGenreMap: Record<string, string[]> = {
      'happy': ['Animacja', 'Komedia'],
      'excited': ['Akcja', 'Science Fiction'],
      'sad': ['Dramat', 'Romans'],
      'thoughtful': ['Dramat', 'Science Fiction'],
      'relaxed': ['Animacja', 'Komedia']
    };
    
    const preferredGenres = moodToGenreMap[filters.mood];
    if (preferredGenres) {
      filteredRecommendations = filteredRecommendations.filter(movie => 
        preferredGenres.some(genre => movie.genre.includes(genre))
      );
    }
  }

  // Filter by genres if specified
  if (filters.genres && filters.genres.length > 0) {
    const genreMapping: Record<string, string[]> = {
      'action': ['Akcja'],
      'comedy': ['Komedia', 'Animacja'],
      'drama': ['Dramat'],
      'horror': ['Horror'],
      'romance': ['Romans'],
      'sci-fi': ['Science Fiction'],
      'thriller': ['Kryminalny']
    };
    
    const matchingGenres = filters.genres.flatMap(g => genreMapping[g] || []);
    if (matchingGenres.length > 0) {
      filteredRecommendations = filteredRecommendations.filter(movie =>
        matchingGenres.some(genre => movie.genre.includes(genre))
      );
    }
  }

  // Filter by era preference
  if (filters.eraPreference && filters.eraPreference !== 'no_preference') {
    const year = new Date().getFullYear();
    filteredRecommendations = filteredRecommendations.filter(movie => {
      const movieYear = new Date(movie.release_date).getFullYear();
      const eraRanges: Record<string, [number, number]> = {
        latest: [2020, year],
        recent: [2010, 2020],
        modern: [2000, 2010],
        retro: [1990, 2000],
        classic: [1900, 1990]
      };
      
      const [minYear, maxYear] = eraRanges[filters.eraPreference] || [1900, year];
      return movieYear >= minYear && movieYear <= maxYear;
    });
  }

  // Filter by minimum rating
  if (filters.minRating) {
    filteredRecommendations = filteredRecommendations.filter(movie => 
      movie.vote_average >= filters.minRating!
    );
  }

  // If no movies match, return some popular ones
  if (filteredRecommendations.length === 0) {
    filteredRecommendations = allRecommendations.slice(0, 5);
  }

  // Shuffle and limit results
  const shuffled = filteredRecommendations.sort(() => Math.random() - 0.5);
  const results = shuffled.slice(0, filters.maxResults || 8);
  
  // Add personalized explanations
  return results.map(movie => ({
    ...movie,
    explanations: [
      ...movie.explanations,
      filters.mood ? `Dopasowane do nastroju: ${filters.mood}` : '',
      filters.eraPreference ? `Era: ${filters.eraPreference}` : ''
    ].filter(Boolean)
  }));
};
