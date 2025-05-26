
import { supabase } from "@/integrations/supabase/client";
import type { QuizAnswer, MovieRecommendation, EnhancedQuizFilters } from "../QuizTypes";

export const parseQuizAnswers = (answers: QuizAnswer[]): EnhancedQuizFilters => {
  const answerMap = answers.reduce((acc, answer) => {
    acc[answer.questionId] = answer.answer;
    return acc;
  }, {} as Record<string, string>);

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

  // Parse genres
  let genres: string[] = [];
  if (answerMap.preferredGenres) {
    try {
      genres = JSON.parse(answerMap.preferredGenres);
    } catch {
      genres = answerMap.preferredGenres.split(',').map(g => g.trim());
    }
  }

  return {
    platforms,
    contentType: (answerMap.contentType as any) || 'notSure',
    mood: answerMap.mood || 'notSure',
    genres,
    region: 'us',
    languages: ['en'],
    includeStreamingInfo: true,
    maxResults: 15
  };
};

export const getPersonalizedRecommendations = async (filters: EnhancedQuizFilters): Promise<MovieRecommendation[]> => {
  try {
    console.log('Getting personalized recommendations with filters:', filters);
    
    const { data, error } = await supabase.functions.invoke('get-personalized-recommendations', {
      body: { 
        answers: Object.entries(filters).map(([questionId, answer]) => ({
          questionId,
          answer: typeof answer === 'object' ? JSON.stringify(answer) : String(answer)
        }))
      }
    });

    if (error) {
      console.error('Error from Edge Function:', error);
      throw error;
    }

    console.log('Received recommendations:', data);
    
    if (!data || !Array.isArray(data)) {
      throw new Error('Invalid response format from recommendations service');
    }

    return data as MovieRecommendation[];
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    throw error;
  }
};

export const generateFallbackRecommendations = (filters: EnhancedQuizFilters): MovieRecommendation[] => {
  // Basic fallback recommendations
  const fallbackMovies = [
    {
      id: 550,
      title: "Fight Club",
      overview: "An insomniac office worker and a devil-may-care soap maker form an underground fight club.",
      poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      release_date: "1999-10-15",
      vote_average: 8.4,
      genre: "Drama",
      trailer_url: null,
      explanations: ["Classic highly-rated film", "Popular choice"]
    },
    {
      id: 13,
      title: "Forrest Gump", 
      overview: "The presidencies of Kennedy and Johnson, through the eyes of an Alabama man with an IQ of 75.",
      poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
      release_date: "1994-07-06",
      vote_average: 8.5,
      genre: "Drama",
      trailer_url: null,
      explanations: ["Heartwarming story", "Award-winning film"]
    },
    {
      id: 157336,
      title: "Interstellar",
      overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
      poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      release_date: "2014-11-07", 
      vote_average: 8.4,
      genre: "Science Fiction",
      trailer_url: null,
      explanations: ["Mind-bending sci-fi", "Visually stunning"]
    }
  ];

  console.log('Using fallback recommendations');
  return fallbackMovies;
};
