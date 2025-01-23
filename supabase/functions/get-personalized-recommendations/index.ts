import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
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

    const requestData = await req.json();
    console.log('Raw request data:', requestData);

    // Validate answers array
    if (!requestData?.answers || !Array.isArray(requestData.answers)) {
      console.error('Invalid request format - answers array missing or invalid:', requestData);
      throw new Error('Invalid request format: answers array must be provided');
    }

    // Parse and clean up answers
    const cleanAnswers = requestData.answers.map(answer => {
      try {
        // Handle nested JSON strings
        let cleanAnswer = answer.answer;
        while (typeof cleanAnswer === 'string' && (cleanAnswer.startsWith('[') || cleanAnswer.startsWith('{'))) {
          try {
            cleanAnswer = JSON.parse(cleanAnswer);
          } catch {
            break;
          }
        }
        
        return {
          questionId: answer.questionId,
          answer: Array.isArray(cleanAnswer) ? cleanAnswer : cleanAnswer
        };
      } catch (error) {
        console.error('Error parsing answer:', error, answer);
        return answer;
      }
    });

    console.log('Cleaned answers:', cleanAnswers);

    // Format answers for Gemini
    const formattedAnswers = cleanAnswers.map(answer => 
      `Question ${answer.questionId}: ${
        Array.isArray(answer.answer) 
          ? answer.answer.join(', ') 
          : answer.answer
      }`
    ).join('\n');

    console.log('Formatted answers for Gemini:', formattedAnswers);

    // Initialize Gemini with retry logic
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Create prompt for Gemini with more specific instructions
    const aiPrompt = `You are a movie recommendation expert. Based on these quiz answers:
    ${formattedAnswers}
    
    Please suggest 6 highly relevant movies. Focus on popular, well-rated movies that match the genre and mood preferences.
    Format your response as a JSON array of TMDB movie IDs only, like this: [123, 456, 789]
    Only include the JSON array in your response, no other text.`;

    console.log('Sending prompt to Gemini:', aiPrompt);

    // Implement retry logic for Gemini API
    let retries = 3;
    let result;
    let error;

    while (retries > 0) {
      try {
        result = await model.generateContent(aiPrompt);
        const response = await result.response;
        const text = response.text();
        
        // Validate the response is a valid JSON array
        if (!text.trim().startsWith('[') || !text.trim().endsWith(']')) {
          throw new Error('Invalid response format from Gemini');
        }
        
        break;
      } catch (e) {
        error = e;
        console.error(`Gemini API attempt failed, ${retries - 1} retries left:`, e);
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    if (!result) {
      throw error || new Error('Failed to get response from Gemini API after all retries');
    }

    const response = await result.response;
    const movieIds = JSON.parse(response.text());

    if (!Array.isArray(movieIds) || movieIds.length === 0) {
      console.error('Invalid response from Gemini:', response.text());
      throw new Error('Invalid response from Gemini: expected array of movie IDs');
    }

    console.log('Received movie IDs from Gemini:', movieIds);

    // Validate movie IDs with TMDB and get details
    const movieDetailsPromises = movieIds.map(async (id: number) => {
      try {
        console.log(`Fetching TMDB data for movie ${id}`);
        const tmdbResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos`
        );
        
        if (!tmdbResponse.ok) {
          console.error(`Error fetching TMDB data for movie ${id}:`, tmdbResponse.status);
          return null;
        }
        
        const movieData = await tmdbResponse.json();
        console.log(`Successfully fetched TMDB data for movie ${id}:`, movieData.title);

        // Try to get streaming availability
        let streamingData = null;
        try {
          const streamingResponse = await fetch(
            `https://streaming-availability.p.rapidapi.com/v2/get/basic/tmdb/movie/${id}`,
            {
              headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
              }
            }
          );

          if (streamingResponse.ok) {
            streamingData = await streamingResponse.json();
            console.log('Streaming data for movie:', id, streamingData);
          }
        } catch (error) {
          console.warn(`Error fetching streaming data for movie ${id}:`, error);
        }

        return {
          id: movieData.id,
          title: movieData.title,
          overview: movieData.overview,
          poster_path: movieData.poster_path,
          release_date: movieData.release_date,
          vote_average: movieData.vote_average * 10,
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
      .sort((a, b) => (b?.vote_average || 0) - (a?.vote_average || 0))
      .slice(0, 6);

    if (!movies || movies.length === 0) {
      throw new Error('No valid movies found');
    }

    console.log('Successfully processed movies:', movies.length);

    return new Response(JSON.stringify(movies), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in get-personalized-recommendations:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});