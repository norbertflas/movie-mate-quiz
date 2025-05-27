
// =============================================================================
// SUPABASE EDGE FUNCTION: get-enhanced-recommendations
// =============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// API Configuration
const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY')
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

// TMDB Genre Mapping
const GENRE_MAP: Record<string, number[]> = {
  'Action': [28],
  'Adventure': [12],
  'Animation': [16],
  'Comedy': [35],
  'Crime': [80],
  'Documentary': [99],
  'Drama': [18],
  'Family': [10751],
  'Fantasy': [14],
  'History': [36],
  'Horror': [27],
  'Music': [10402],
  'Mystery': [9648],
  'Romance': [10749],
  'Science Fiction': [878],
  'TV Movie': [10770],
  'Thriller': [53],
  'War': [10752],
  'Western': [37]
}

// Mood to Genre Mapping
const MOOD_TO_GENRES: Record<string, string[]> = {
  'laugh': ['Comedy', 'Family', 'Animation'],
  'touching': ['Drama', 'Romance', 'Family'],
  'adrenaline': ['Action', 'Thriller', 'Adventure'],
  'relax': ['Documentary', 'Animation', 'Family'],
  'think': ['Drama', 'Documentary', 'Mystery'],
  'escape': ['Fantasy', 'Science Fiction', 'Adventure']
}

// Parse quiz answers
function parseQuizAnswers(answers: any[]): any {
  const answerMap = answers.reduce((acc, answer) => {
    acc[answer.questionId] = answer.answer;
    return acc;
  }, {} as Record<string, string>);

  const filters = {
    platforms: answerMap.platforms?.split(',') || [],
    contentType: answerMap.contentType || 'notSure',
    mood: answerMap.mood || 'notSure',
    genres: answerMap.preferredGenres?.split(',') || [],
    region: answerMap.region || 'us',
    languages: ['en'],
    minRating: 0,
    maxResults: 20,
    releaseYear: {} as any,
    runtime: {} as any
  };

  // Map region to languages
  if (answerMap.region?.includes('Poland') || answerMap.region?.includes('polska')) {
    filters.region = 'pl';
    filters.languages = ['pl', 'en'];
  }

  // Add genres based on mood
  if (answerMap.mood && MOOD_TO_GENRES[answerMap.mood]) {
    filters.genres = [...filters.genres, ...MOOD_TO_GENRES[answerMap.mood]];
  }

  // Map release year
  const currentYear = new Date().getFullYear();
  switch (answerMap.releaseYear) {
    case 'Latest releases (2024-2025)':
    case 'Najnowsze premiery (2024-2025)':
      filters.releaseYear = { min: currentYear - 1 };
      break;
    case 'Recent hits (2020-2024)':
    case 'Ostatnie hity (2020-2024)':
      filters.releaseYear = { min: currentYear - 5 };
      break;
    case 'Modern classics (2000-2020)':
    case 'Nowoczesne klasyki (2000-2020)':
      filters.releaseYear = { min: 2000, max: 2020 };
      break;
    case 'Vintage (before 1980)':
    case 'Vintage (przed 1980)':
      filters.releaseYear = { max: 1979 };
      break;
  }

  // Map movie length
  switch (answerMap.movieLength) {
    case 'Short (under 90 min)':
    case 'Krótki (poniżej 90 min)':
      filters.runtime = { max: 90 };
      break;
    case 'Standard (90-150 min)':
    case 'Standardowy (90-150 min)':
      filters.runtime = { min: 90, max: 150 };
      break;
    case 'Long (over 150 min)':
    case 'Długi (powyżej 150 min)':
      filters.runtime = { min: 150 };
      break;
  }

  // Map quality preference
  switch (answerMap.qualityPreference) {
    case 'Only highly rated (7.5+ stars)':
    case 'Tylko wysoko oceniane (7.5+ gwiazdek)':
      filters.minRating = 7.5;
      break;
    case 'Mix of popular and quality':
    case 'Mix popularnych i jakościowych':
      filters.minRating = 6.0;
      break;
    case 'Hidden gems and underrated':
    case 'Ukryte perły i niedoceniane':
      filters.minRating = 6.5;
      filters.maxResults = 30; // More results for hidden gems
      break;
  }

  return filters;
}

// Build TMDB URL
function buildTMDBUrl(filters: any, mediaType: 'movie' | 'tv', page = 1): string {
  const baseUrl = `${TMDB_BASE_URL}/discover/${mediaType}`;
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY!,
    page: page.toString(),
    language: filters.languages[0] || 'en-US',
    sort_by: 'popularity.desc',
    'vote_count.gte': '50'
  });

  // Add genre filters
  if (filters.genres.length > 0) {
    const genreIds = filters.genres
      .flatMap(genre => GENRE_MAP[genre] || [])
      .filter(Boolean);
    
    if (genreIds.length > 0) {
      params.set('with_genres', genreIds.join(','));
    }
  }

  // Add year filters
  if (filters.releaseYear.min) {
    const dateField = mediaType === 'movie' ? 'primary_release_date' : 'first_air_date';
    params.set(`${dateField}.gte`, `${filters.releaseYear.min}-01-01`);
  }
  if (filters.releaseYear.max) {
    const dateField = mediaType === 'movie' ? 'primary_release_date' : 'first_air_date';
    params.set(`${dateField}.lte`, `${filters.releaseYear.max}-12-31`);
  }

  // Add runtime filters (movies only)
  if (mediaType === 'movie') {
    if (filters.runtime.min) {
      params.set('with_runtime.gte', filters.runtime.min.toString());
    }
    if (filters.runtime.max) {
      params.set('with_runtime.lte', filters.runtime.max.toString());
    }
  }

  // Add rating filters
  if (filters.minRating > 0) {
    params.set('vote_average.gte', filters.minRating.toString());
  }

  return `${baseUrl}?${params.toString()}`;
}

// Fetch TMDB recommendations
async function fetchTMDBRecommendations(filters: any): Promise<any[]> {
  const recommendations: any[] = [];
  const mediaTypes = filters.contentType === 'series' ? ['tv'] : 
                    filters.contentType === 'movie' ? ['movie'] : 
                    ['movie', 'tv'];

  for (const mediaType of mediaTypes) {
    try {
      // Fetch first page
      const url = buildTMDBUrl(filters, mediaType as 'movie' | 'tv');
      console.log(`Fetching ${mediaType} from: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`TMDB API error for ${mediaType}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const processedResults = data.results.map((item: any) => ({
          id: item.id,
          tmdbId: item.id,
          title: item.title || item.name,
          overview: item.overview,
          poster_path: item.poster_path,
          backdrop_path: item.backdrop_path,
          release_date: item.release_date || item.first_air_date,
          vote_average: item.vote_average,
          vote_count: item.vote_count,
          genre: item.genre_ids?.map(id => 
            Object.keys(GENRE_MAP).find(genre => GENRE_MAP[genre].includes(id))
          ).filter(Boolean).join(', ') || 'Unknown',
          genres: item.genre_ids?.map(id => 
            Object.keys(GENRE_MAP).find(genre => GENRE_MAP[genre].includes(id))
          ).filter(Boolean) || [],
          trailer_url: null, // Can add separate video query
          type: mediaType,
          runtime: item.runtime,
          seasons: item.number_of_seasons,
          originalLanguage: item.original_language,
          popularity: item.popularity
        }));

        recommendations.push(...processedResults);
      }

      // If we need more results, fetch second page
      if (recommendations.length < filters.maxResults && data.total_pages > 1) {
        const url2 = buildTMDBUrl(filters, mediaType as 'movie' | 'tv', 2);
        const response2 = await fetch(url2);
        
        if (response2.ok) {
          const data2 = await response2.json();
          if (data2.results) {
            const processedResults2 = data2.results.map((item: any) => ({
              id: item.id,
              tmdbId: item.id,
              title: item.title || item.name,
              overview: item.overview,
              poster_path: item.poster_path,
              backdrop_path: item.backdrop_path,
              release_date: item.release_date || item.first_air_date,
              vote_average: item.vote_average,
              vote_count: item.vote_count,
              genre: item.genre_ids?.map(id => 
                Object.keys(GENRE_MAP).find(genre => GENRE_MAP[genre].includes(id))
              ).filter(Boolean).join(', ') || 'Unknown',
              genres: item.genre_ids?.map(id => 
                Object.keys(GENRE_MAP).find(genre => GENRE_MAP[genre].includes(id))
              ).filter(Boolean) || [],
              trailer_url: null,
              type: mediaType,
              runtime: item.runtime,
              seasons: item.number_of_seasons,
              originalLanguage: item.original_language,
              popularity: item.popularity
            }));

            recommendations.push(...processedResults2);
          }
        }
      }

    } catch (error) {
      console.error(`Error fetching ${mediaType} recommendations:`, error);
    }
  }

  return recommendations;
}

// Add streaming info
async function enrichWithStreamingInfo(recommendations: any[], region: string): Promise<any[]> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const enrichedRecommendations = [];

  for (const rec of recommendations) {
    try {
      // Call streaming-availability function
      const { data: streamingData, error } = await supabase.functions.invoke('streaming-availability', {
        body: {
          tmdbId: rec.tmdbId,
          country: region.toLowerCase(),
          title: rec.title,
          year: rec.release_date?.split('-')[0]
        }
      });

      let streamingAvailability = [];
      let availableOn = [];
      
      if (!error && streamingData?.result) {
        streamingAvailability = streamingData.result;
        availableOn = streamingAvailability.map(s => s.service);
      }

      enrichedRecommendations.push({
        ...rec,
        streamingAvailability,
        availableOn,
        recommendationScore: rec.vote_average * 10 + (availableOn.length * 5)
      });

    } catch (error) {
      console.error(`Error enriching ${rec.title} with streaming info:`, error);
      // Add without streaming info
      enrichedRecommendations.push({
        ...rec,
        streamingAvailability: [],
        availableOn: [],
        recommendationScore: rec.vote_average * 10
      });
    }
  }

  return enrichedRecommendations;
}

// Fallback recommendations
function generateFallbackRecommendations(filters: any): any[] {
  // Popular movies/series as fallback
  const fallbackMovies = [
    {
      id: 550,
      tmdbId: 550,
      title: "Fight Club",
      overview: "An insomniac office worker and a devil-may-care soapmaker form an underground fight club.",
      poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      release_date: "1999-10-15",
      vote_average: 8.4,
      genre: "Drama",
      genres: ["Drama", "Thriller"],
      trailer_url: null,
      type: "movie"
    },
    {
      id: 13,
      tmdbId: 13,
      title: "Forrest Gump", 
      overview: "A man with a low IQ has accomplished great things in his life and been present during significant historic events.",
      poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
      release_date: "1994-06-23",
      vote_average: 8.5,
      genre: "Drama",
      genres: ["Drama", "Romance"],
      trailer_url: null,
      type: "movie"
    }
  ];

  return fallbackMovies.map(movie => ({
    ...movie,
    streamingAvailability: [],
    availableOn: [],
    recommendationScore: movie.vote_average * 10,
    matchReasons: ['Popular choice', 'Highly rated']
  }));
}

// Main edge function
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { answers, region = 'us', sessionId, includeStreaming = true, maxResults = 20 } = await req.json()
    
    console.log(`[Enhanced Recommendations] Processing for region: ${region}, session: ${sessionId}`);
    console.log(`[Enhanced Recommendations] Answers:`, answers);

    if (!TMDB_API_KEY) {
      throw new Error('TMDB_API_KEY not configured');
    }

    // Parse answers
    const filters = parseQuizAnswers(answers);
    filters.maxResults = maxResults;
    
    console.log(`[Enhanced Recommendations] Parsed filters:`, filters);

    let recommendations = [];

    try {
      // Try to fetch from TMDB
      recommendations = await fetchTMDBRecommendations(filters);
      console.log(`[Enhanced Recommendations] TMDB returned ${recommendations.length} recommendations`);
      
      if (recommendations.length === 0) {
        console.log('[Enhanced Recommendations] No TMDB results, using fallback');
        recommendations = generateFallbackRecommendations(filters);
      }

    } catch (tmdbError) {
      console.error('[Enhanced Recommendations] TMDB error:', tmdbError);
      recommendations = generateFallbackRecommendations(filters);
    }

    // Enrich with streaming info if requested
    if (includeStreaming && recommendations.length > 0) {
      try {
        console.log(`[Enhanced Recommendations] Enriching with streaming info for region: ${region}`);
        recommendations = await enrichWithStreamingInfo(recommendations, region);
      } catch (streamingError) {
        console.error('[Enhanced Recommendations] Streaming enrichment error:', streamingError);
        // Continue without streaming info
      }
    }

    // Sort and limit results
    const finalRecommendations = recommendations
      .sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0))
      .slice(0, maxResults);

    console.log(`[Enhanced Recommendations] Returning ${finalRecommendations.length} final recommendations`);

    return new Response(
      JSON.stringify(finalRecommendations),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('[Enhanced Recommendations] Error:', error);
    
    // Return fallback in case of error
    const fallbackRecommendations = generateFallbackRecommendations({});
    
    return new Response(
      JSON.stringify(fallbackRecommendations),
      { 
        status: 200, // Return 200 with fallback instead of error
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  }
})
