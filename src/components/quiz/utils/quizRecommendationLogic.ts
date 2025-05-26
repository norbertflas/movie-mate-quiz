
import { supabase } from "@/integrations/supabase/client";
import type { QuizAnswer, MovieRecommendation } from "../QuizTypes";

export interface QuizFilters {
  platforms: string[];
  contentType: string;
  genres: string[];
  mood: string;
  movieLength?: string;
  seasonCount?: string;
  episodeLength?: string;
}

export function parseQuizAnswers(answers: QuizAnswer[]): QuizFilters {
  const answerMap = answers.reduce((map, answer) => {
    map[answer.questionId] = answer.answer;
    return map;
  }, {} as Record<string, string>);

  // Parse platforms - handle both single selections and JSON arrays
  let platforms: string[] = [];
  if (answerMap.platforms) {
    try {
      // Try to parse as JSON array first
      const parsed = JSON.parse(answerMap.platforms);
      platforms = Array.isArray(parsed) ? parsed : [answerMap.platforms];
    } catch {
      // If not JSON, treat as single platform
      platforms = [answerMap.platforms];
    }
  }

  // Filter out "I don't have any subscriptions" as it's not a real platform
  platforms = platforms.filter(p => p !== "I don't have any subscriptions");

  // Map mood to genres
  const mood = answerMap.mood || "";
  const genres = mapMoodToGenres(mood);

  return {
    platforms,
    contentType: answerMap.contentType || "",
    genres,
    mood,
    movieLength: answerMap.movieLength,
    seasonCount: answerMap.seasonCount,
    episodeLength: answerMap.episodeLength
  };
}

function mapMoodToGenres(mood: string): string[] {
  const moodGenreMap: Record<string, string[]> = {
    "I want to laugh": ["Comedy", "Family", "Animation"],
    "Something touching": ["Drama", "Romance", "Family"],
    "Something exciting": ["Action", "Adventure", "Thriller"],
    "Something relaxing": ["Documentary", "Comedy", "Romance"],
    "I'm not sure": ["Action", "Comedy", "Drama"] // Default mix
  };

  return moodGenreMap[mood] || ["Action", "Comedy", "Drama"];
}

export async function getPersonalizedRecommendations(filters: QuizFilters): Promise<MovieRecommendation[]> {
  try {
    console.log('Getting recommendations with filters:', filters);

    // Build request body based on filters
    const requestBody = {
      platforms: filters.platforms,
      contentType: filters.contentType,
      genres: filters.genres,
      mood: filters.mood,
      preferences: {
        movieLength: filters.movieLength,
        seasonCount: filters.seasonCount,
        episodeLength: filters.episodeLength
      },
      includeExplanations: true
    };

    const { data, error } = await supabase.functions.invoke('get-personalized-recommendations', {
      body: requestBody
    });

    if (error) {
      console.error('Error from edge function:', error);
      throw error;
    }

    if (!data || !Array.isArray(data)) {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response format from recommendations service');
    }

    console.log('Received personalized recommendations:', data);
    return data as MovieRecommendation[];
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    throw error;
  }
}

export function generateFallbackRecommendations(filters: QuizFilters): MovieRecommendation[] {
  console.log('Generating fallback recommendations for filters:', filters);

  // Base recommendations that vary by content type and mood
  const movieRecommendations: MovieRecommendation[] = [
    {
      id: 550,
      title: "Fight Club",
      overview: "An insomniac office worker and a devil-may-care soap maker form an underground fight club.",
      poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      release_date: "1999-10-15",
      vote_average: 8.4,
      genre: "Drama",
      platform: "Netflix",
      explanations: ["Intense drama perfect for serious viewing"]
    },
    {
      id: 13,
      title: "Forrest Gump",
      overview: "The presidencies of Kennedy and Johnson through the eyes of an Alabama man with an IQ of 75.",
      poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
      release_date: "1994-06-23",
      vote_average: 8.5,
      genre: "Drama",
      platform: "Amazon Prime",
      explanations: ["Heartwarming story that touches the soul"]
    },
    {
      id: 19995,
      title: "Avatar",
      overview: "In the 22nd century, a paraplegic Marine dispatched to the moon Pandora joins a unique program.",
      poster_path: "/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg",
      release_date: "2009-12-18",
      vote_average: 7.6,
      genre: "Action",
      platform: "Disney+",
      explanations: ["Epic adventure with stunning visuals"]
    },
    {
      id: 120,
      title: "The Lord of the Rings: The Fellowship of the Ring",
      overview: "A young hobbit and his companions set out on a journey to destroy an ancient ring.",
      poster_path: "/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg",
      release_date: "2001-12-19",
      vote_average: 8.8,
      genre: "Fantasy",
      platform: "HBO Max",
      explanations: ["Epic fantasy adventure"]
    }
  ];

  const seriesRecommendations: MovieRecommendation[] = [
    {
      id: 1399,
      title: "Game of Thrones",
      overview: "Nine noble families fight for control over the mythical lands of Westeros.",
      poster_path: "/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
      release_date: "2011-04-17",
      vote_average: 9.3,
      genre: "Drama",
      platform: "HBO Max",
      type: "series",
      explanations: ["Epic fantasy series with complex characters"]
    },
    {
      id: 1396,
      title: "Breaking Bad",
      overview: "A high school chemistry teacher turned methamphetamine producer.",
      poster_path: "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
      release_date: "2008-01-20",
      vote_average: 9.5,
      genre: "Crime",
      platform: "Netflix",
      type: "series",
      explanations: ["Intense crime drama with masterful storytelling"]
    },
    {
      id: 60735,
      title: "The Flash",
      overview: "After a particle accelerator accident, Barry Allen gains super-speed powers.",
      poster_path: "/lJA2RCMfsWoskqlQhXPSLFQGXEJ.jpg",
      release_date: "2014-10-07",
      vote_average: 7.7,
      genre: "Action",
      platform: "Netflix",
      type: "series",
      explanations: ["Exciting superhero action series"]
    }
  ];

  // Filter based on content type
  let baseRecommendations = movieRecommendations;
  if (filters.contentType === "TV Series" || filters.contentType === "series") {
    baseRecommendations = seriesRecommendations;
  }

  // Filter by mood/genre preferences
  const filtered = baseRecommendations.filter(rec => {
    if (filters.genres.length === 0) return true;
    return filters.genres.some(genre => 
      rec.genre.toLowerCase().includes(genre.toLowerCase()) ||
      rec.explanations?.some(exp => exp.toLowerCase().includes(genre.toLowerCase()))
    );
  });

  // Filter by platform if specified
  const platformFiltered = filters.platforms.length > 0 
    ? filtered.filter(rec => filters.platforms.includes(rec.platform || ""))
    : filtered;

  // Return at least 3 recommendations, fallback to all if needed
  return platformFiltered.length >= 3 ? platformFiltered.slice(0, 5) : filtered.slice(0, 5);
}
