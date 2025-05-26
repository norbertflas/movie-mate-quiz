import "https://deno.land/x/xhr@0.1.0/mod.ts";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export interface QuizAnswer {
  questionId: string;
  answer: string | string[];
}

export interface RequestData {
  answers?: QuizAnswer[];
  prompt?: string;
  selectedMovies?: Array<{ id: number; title: string; genres?: number[] }>;
}

export interface MovieRecommendation {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genre: string;
  trailer_url: string | null;
  explanations: string[];
}

export function cleanAnswers(answers: QuizAnswer[]): QuizAnswer[] {
  return answers.map(answer => {
    let cleanedAnswer = answer.answer;
    
    // Parse JSON strings if they exist
    if (typeof cleanedAnswer === 'string') {
      try {
        const parsed = JSON.parse(cleanedAnswer);
        if (Array.isArray(parsed)) {
          cleanedAnswer = parsed;
        }
      } catch {
        // Keep as string if not valid JSON
      }
    }
    
    return {
      questionId: answer.questionId,
      answer: cleanedAnswer
    };
  });
}

export function formatAnswersForPrompt(answers: QuizAnswer[]): string {
  const answerMap = answers.reduce((acc, answer) => {
    acc[answer.questionId] = answer.answer;
    return acc;
  }, {} as Record<string, any>);

  const parts = [];
  
  if (answerMap.platforms) {
    const platforms = Array.isArray(answerMap.platforms) ? answerMap.platforms.join(', ') : answerMap.platforms;
    parts.push(`Available on: ${platforms}`);
  }
  
  if (answerMap.contentType) {
    parts.push(`Content type: ${answerMap.contentType}`);
  }
  
  if (answerMap.mood) {
    parts.push(`Mood: ${answerMap.mood}`);
  }
  
  if (answerMap.genres) {
    const genres = Array.isArray(answerMap.genres) ? answerMap.genres.join(', ') : answerMap.genres;
    parts.push(`Preferred genres: ${genres}`);
  }

  return parts.join('. ');
}

export function getGenreId(genreInput: string): number {
  // Handle both single genres and arrays
  let genreName = genreInput;
  
  if (typeof genreInput === 'string' && genreInput.startsWith('[')) {
    try {
      const parsed = JSON.parse(genreInput);
      if (Array.isArray(parsed) && parsed.length > 0) {
        genreName = parsed[0];
      }
    } catch {
      // Keep original if parsing fails
    }
  }
  
  // Clean translation keys
  if (genreName.includes('quiz.options.genres.')) {
    genreName = genreName.replace('quiz.options.genres.', '');
  }
  
  // Map genre names to TMDB genre IDs
  const genreMap: Record<string, number> = {
    'action': 28,
    'adventure': 12,
    'animation': 16,
    'comedy': 35,
    'crime': 80,
    'documentary': 99,
    'drama': 18,
    'family': 10751,
    'fantasy': 14,
    'history': 36,
    'horror': 27,
    'music': 10402,
    'mystery': 9648,
    'romance': 10749,
    'science_fiction': 878,
    'thriller': 53,
    'war': 10752,
    'western': 37,
    // Polish translations
    'akcja': 28,
    'komedia': 35,
    'dramat': 18,
    'horror': 27,
    'romans': 10749,
    'thriller': 53,
    'sci-fi': 878,
    'fantasy': 14,
    'animacja': 16
  };

  const normalizedGenre = genreName.toLowerCase().replace(/[^a-z]/g, '');
  return genreMap[normalizedGenre] || 35; // Default to comedy if not found
}
