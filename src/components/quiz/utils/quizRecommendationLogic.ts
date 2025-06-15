
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
  const baseRecommendations: MovieRecommendation[] = [
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
      explanations: ["Wysoko oceniany dramat", "Kultowy film"]
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
    }
  ];

  // Filter recommendations based on user preferences
  return baseRecommendations.filter(movie => {
    // Filter by era preference
    if (filters.eraPreference && filters.eraPreference !== 'no_preference') {
      const year = new Date(movie.release_date).getFullYear();
      const eraRanges: Record<string, [number, number]> = {
        latest: [2020, 2025],
        recent: [2010, 2020],
        modern: [2000, 2010],
        retro: [1990, 2000],
        classic: [1900, 1990]
      };
      
      const [minYear, maxYear] = eraRanges[filters.eraPreference] || [1900, 2025];
      if (year < minYear || year > maxYear) return false;
    }

    // Filter by minimum rating
    if (filters.minRating && movie.vote_average < filters.minRating) {
      return false;
    }

    return true;
  }).slice(0, filters.maxResults || 10);
};
