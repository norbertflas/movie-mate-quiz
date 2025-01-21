import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');

    if (!TMDB_API_KEY || !GEMINI_API_KEY || !RAPIDAPI_KEY) {
      console.error('Missing required API keys');
      throw new Error('Missing required API keys');
    }

    const { answers } = await req.json();
    console.log('Raw answers received:', answers);

    // Validate answers format
    if (!answers || typeof answers !== 'object') {
      console.error('Invalid answers format - not an object:', answers);
      throw new Error('Invalid quiz answers format');
    }

    // Convert answers object to array format
    const answersArray = Object.entries(answers).map(([index, answer]) => ({
      questionId: index,
      answer: answer
    }));

    console.log('Formatted answers array:', answersArray);

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Create a formatted string of answers for the prompt
    const formattedAnswers = answersArray.map(answer => 
      `Question ${answer.questionId}: ${answer.answer}`
    ).join('\n');

    console.log('Formatted answers for Gemini:', formattedAnswers);

    // Create a prompt for Gemini
    const aiPrompt = `As a movie recommendation expert, suggest 6 movies based on these quiz answers:
    ${formattedAnswers}
    
    Format your response as a JSON array of TMDB movie IDs only, like this: [123, 456, 789]
    Only include the JSON array in your response, no other text.`;

    console.log('Sending prompt to Gemini:', aiPrompt);

    // Get movie suggestions from Gemini
    const result = await model.generateContent(aiPrompt);
    const response = await result.response;
    const movieIds = JSON.parse(response.text());

    console.log('Received movie IDs from Gemini:', movieIds);

    // Get movie details from TMDB and streaming availability in parallel
    const movieDetailsPromises = movieIds.map(async (id: number) => {
      try {
        // Get TMDB details
        const tmdbResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos`
        );
        
        if (!tmdbResponse.ok) {
          console.error(`Error fetching TMDB data for movie ${id}:`, tmdbResponse.status);
          return null;
        }
        
        const movieData = await tmdbResponse.json();

        // Get streaming availability
        const streamingResponse = await fetch(
          `https://streaming-availability.p.rapidapi.com/v2/get/basic/tmdb/movie/${id}`,
          {
            headers: {
              'X-RapidAPI-Key': RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
            }
          }
        );

        let streamingData = null;
        if (streamingResponse.ok) {
          streamingData = await streamingResponse.json();
          console.log('Streaming data for movie:', id, streamingData);
        } else {
          console.warn(`No streaming data available for movie ${id}`);
        }

        // Combine TMDB and streaming data
        return {
          id: movieData.id,
          title: movieData.title,
          overview: movieData.overview,
          poster_path: movieData.poster_path,
          release_date: movieData.release_date,
          vote_average: movieData.vote_average * 10, // Convert to percentage
          genre: movieData.genres?.[0]?.name || 'Unknown',
          streaming_info: streamingData?.result?.streamingInfo || {},
          trailer_url: movieData.videos?.results?.[0]?.key 
            ? `https://www.youtube.com/watch?v=${movieData.videos.results[0].key}`
            : null
        };
      } catch (error) {
        console.error(`Error processing movie ${id}:`, error);
        return null;
      }
    });

    const movies = (await Promise.all(movieDetailsPromises))
      .filter(movie => movie !== null)
      .sort((a, b) => b.vote_average - a.vote_average)
      .slice(0, 6);

    console.log('Successfully processed movies:', movies.length);

    return new Response(JSON.stringify(movies), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in get-personalized-recommendations:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});