import { TMDBMovie, discoverMovies, getMovieKeywords } from "@/services/tmdb";
import { getWatchHistoryScore } from "./watchHistory";
import { getPlatformScore } from "./platformMatching";
import { getCollaborativeScore } from "./collaborativeFiltering";
import { getGenreCompatibilityScore } from "./genreMatching";
import { WEIGHT_FACTORS } from "./weightFactors";

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
    const currentMonth = new Date().getMonth();
    
    // Advanced TMDB API parameters
    const baseMovies = await discoverMovies({
      genres: params.genres,
      minVoteCount: params.minVoteCount || 100,
      minVoteAverage: params.minVoteAverage || 6,
      releaseDateGte: params.releaseYear ? `${params.releaseYear}-01-01` : '1900-01-01',
      releaseDateLte: `${currentYear}-12-31`,
      sortBy: 'popularity.desc',
      includeAdult: params.includeAdult
    });

    // Enhanced scoring with multiple factors
    const scoredMoviesPromises = baseMovies.map(async (movie) => {
      let totalScore = 0;
      const explanations: string[] = [];

      // Genre compatibility
      const { score: genreScore, explanation: genreExplanation } = 
        await getGenreCompatibilityScore(movie.genre_ids.join(','), params.genres?.join(',') || '');
      if (genreScore > 0) {
        totalScore += WEIGHT_FACTORS.genre * genreScore;
        explanations.push(genreExplanation);
      }

      // Watch history integration
      const { score: historyScore, explanation: historyExplanation } = 
        await getWatchHistoryScore(movie.id);
      if (historyScore !== 0) {
        totalScore += WEIGHT_FACTORS.watchHistory * historyScore;
        if (historyExplanation) explanations.push(historyExplanation);
      }

      // Platform availability
      if (params.platform) {
        const { score: platformScore, explanation: platformExplanation } = 
          await getPlatformScore(params.platform);
        if (platformScore > 0) {
          totalScore += WEIGHT_FACTORS.platform * platformScore;
          if (platformExplanation) explanations.push(platformExplanation);
        }
      }

      // Collaborative filtering
      const { score: collaborativeScore, explanation: collaborativeExplanation } = 
        await getCollaborativeScore(movie.id);
      if (collaborativeScore > 0) {
        totalScore += WEIGHT_FACTORS.collaborative * collaborativeScore;
        if (collaborativeExplanation) explanations.push(collaborativeExplanation);
      }

      // Seasonal relevance
      const isWinter = currentMonth >= 11 || currentMonth <= 1;
      const isSummer = currentMonth >= 5 && currentMonth <= 7;
      
      const keywords = await getMovieKeywords(movie.id);
      const hasSeasonalKeywords = isWinter ? 
        keywords.some(k => ['christmas', 'winter', 'snow', 'holiday'].includes(k.toLowerCase())) :
        isSummer ? 
        keywords.some(k => ['summer', 'beach', 'vacation'].includes(k.toLowerCase())) :
        false;

      if (hasSeasonalKeywords) {
        totalScore += WEIGHT_FACTORS.seasonal;
        explanations.push(`Matches current season: ${isWinter ? 'Winter' : 'Summer'}`);
      }

      // Time-based relevance
      const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
      if (releaseYear) {
        if (releaseYear === currentYear) {
          totalScore += WEIGHT_FACTORS.newRelease;
          explanations.push('New release');
        } else if (releaseYear <= currentYear - 25) {
          totalScore += WEIGHT_FACTORS.classic;
          explanations.push('Classic movie');
        }
      }

      // Popularity and vote count bonus
      if (movie.vote_count > 1000 && movie.vote_average >= 7.5) {
        totalScore += WEIGHT_FACTORS.rating;
        explanations.push('Highly rated by many users');
      }

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