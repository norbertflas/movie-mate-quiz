
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY')
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

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

const MOOD_TO_GENRES: Record<string, string[]> = {
  'laugh': ['Comedy', 'Family', 'Animation'],
  'touching': ['Drama', 'Romance', 'Family'],
  'adrenaline': ['Action', 'Thriller', 'Adventure'],
  'relax': ['Documentary', 'Animation', 'Family'],
  'think': ['Drama', 'Documentary', 'Mystery'],
  'escape': ['Fantasy', 'Science Fiction', 'Adventure']
}

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

  if (answerMap.region?.includes('Poland') || answerMap.region?.includes('polska')) {
    filters.region = 'pl';
    filters.languages = ['pl', 'en'];
  }

  if (answerMap.mood && MOOD_TO_GENRES[answerMap.mood]) {
    filters.genres = [...filters.genres, ...MOOD_TO_GENRES[answerMap.mood]];
  }

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
      filters.maxResults = 30;
      break;
  }

  return filters;
}

function buildTMDBUrl(filters: any, mediaType: 'movie' | 'tv', page = 1): string {
  const baseUrl = `${TMDB_BASE_URL}/discover/${mediaType}`;
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY!,
    page: page.toString(),
    language: filters.languages[0] || 'en-US',
    sort_by: 'popularity.desc',
    'vote_count.gte': '50'
  });

  if (filters.genres.length > 0) {
    const genreIds = filters.genres
      .flatMap(genre => GENRE_MAP[genre] || [])
      .filter(Boolean);
    
    if (genreIds.length > 0) {
      params.set('with_genres', genreIds.join(','));
    }
  }

  if (filters.releaseYear.min) {
    const dateField = mediaType === 'movie' ? 'primary_release_date' : 'first_air_date';
    params.set(`${dateField}.gte`, `${filters.releaseYear.min}-01-01`);
  }
  if (filters.releaseYear.max) {
    const dateField = mediaType === 'movie' ? 'primary_release_date' : 'first_air_date';
    params.set(`${dateField}.lte`, `${filters.releaseYear.max}-12-31`);
  }

  if (mediaType === 'movie') {
    if (filters.runtime.min) {
      params.set('with_runtime.gte', filters.runtime.min.toString());
    }
    if (filters.runtime.max) {
      params.set('with_runtime.lte', filters.runtime.max.toString());
    }
  }

  if (filters.minRating > 0) {
    params.set('vote_average.gte', filters.minRating.toString());
  }

  return `${baseUrl}?${params.toString()}`;
}

async function fetchTMDBRecommendations(filters: any): Promise<any[]> {
  const recommendations: any[] = [];
  const mediaTypes = filters.contentType === 'series' ? ['tv'] : 
                    filters.contentType === 'movie' ? ['movie'] : 
                    ['movie', 'tv'];

  for (const mediaType of mediaTypes) {
    try {
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
          trailer_url: null,
          type: mediaType,
          runtime: item.runtime,
          seasons: item.number_of_seasons,
          originalLanguage: item.original_language,
          popularity: item.popularity
        }));

        recommendations.push(...processedResults);
      }

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

function generateFallbackRecommendations(filters: any): any[] {
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
    },
    {
      id: 238,
      tmdbId: 238,
      title: "The Shawshank Redemption",
      overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
      poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
      release_date: "1994-09-23",
      vote_average: 9.3,
      genre: "Drama",
      genres: ["Drama"],
      trailer_url: null,
      type: "movie"
    },
    {
      id: 680,
      tmdbId: 680,
      title: "Pulp Fiction",
      overview: "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper.",
      poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
      release_date: "1994-09-10",
      vote_average: 8.9,
      genre: "Crime",
      genres: ["Crime", "Drama"],
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

    const filters = parseQuizAnswers(answers);
    filters.maxResults = maxResults;
    
    console.log(`[Enhanced Recommendations] Parsed filters:`, filters);

    let recommendations = [];

    try {
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
    
    const fallbackRecommendations = generateFallbackRecommendations({});
    
    return new Response(
      JSON.stringify(fallbackRecommendations),
      { 
        status: 200,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  }
})
