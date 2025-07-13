import { TMDBMovie, discoverMovies } from "@/services/tmdb";
import { calculateGenreScore } from "./scoring/genreScoring";
import { calculateWatchHistoryScore } from "./scoring/watchHistoryScoring";
import { calculatePlatformScore } from "./scoring/platformScoring";
import { calculateSeasonalScore } from "./scoring/seasonalScoring";
import { calculateTimeBasedScore } from "./scoring/timeBasedScoring";

interface RecommendationParams {
  genres?: string[];
  mood?: string;
  platform?: string;
  releaseYear?: string;
  watchTime?: string;
  minVoteCount?: number;
  minVoteAverage?: number;
  includeAdult?: boolean;
}

export async function getEnhancedRecommendations(params: RecommendationParams) {
  try {
    const currentYear = new Date().getFullYear();
    
    // Get base movies from TMDB
    const baseMovies = await discoverMovies({
      genres: params.genres,
      minVoteCount: params.minVoteCount || 100,
      minVoteAverage: params.minVoteAverage || 6,
      releaseDateGte: params.releaseYear ? `${params.releaseYear}-01-01` : '1900-01-01',
      releaseDateLte: `${currentYear}-12-31`,
      sortBy: 'popularity.desc',
      includeAdult: params.includeAdult || false,
      withKeywords: getMoodKeywords(params.mood)
    });

    // Calculate scores for each movie
    const scoredMoviesPromises = baseMovies.map(async (movie) => {
      const scores = await Promise.all([
        calculateGenreScore(movie.genre_ids.join(','), params.genres?.join(',') || ''),
        calculateWatchHistoryScore(movie.id),
        params.platform ? calculatePlatformScore(params.platform) : Promise.resolve({ score: 0, explanation: '', weight: 0 }),
        calculateSeasonalScore(movie.id),
        Promise.resolve(calculateTimeBasedScore(movie.release_date ? new Date(movie.release_date).getFullYear() : null))
      ]);

      const explanations = scores
        .map(s => s.explanation)
        .filter(Boolean);

      const totalScore = scores.reduce((acc, { score, weight }) => 
        acc + (score * weight), 0);

      return {
        ...movie,
        score: totalScore,
        explanations
      };
    });

    const scoredMovies = await Promise.all(scoredMoviesPromises);
    return scoredMovies
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 10);
  } catch (error) {
    console.error('Error getting enhanced recommendations:', error);
    throw error;
  }
}

function getMoodKeywords(mood?: string): string {
  switch (mood?.toLowerCase()) {
    case 'light/funny':
      return 'comedy,family,animation';
    case 'serious/dramatic':
      return 'drama,biography,war,history';
    case 'suspenseful':
      return 'thriller,horror,crime,mystery,action';
    case 'inspiring':
      return 'biography,documentary,sport,music,adventure';
    default:
      return '';
  }
}