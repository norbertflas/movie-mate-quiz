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
      throw new Error('Missing required API keys');
    }

    const requestData = await req.json();
    console.log('Raw request data:', requestData);

    if (!requestData?.answers || !Array.isArray(requestData.answers)) {
      throw new Error('Invalid request format: answers array must be provided');
    }

    const cleanAnswers = requestData.answers.map(answer => {
      try {
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

    const formattedAnswers = cleanAnswers.map(answer => 
      `Question ${answer.questionId}: ${
        Array.isArray(answer.answer) 
          ? answer.answer.join(', ') 
          : answer.answer
      }`
    ).join('\n');

    console.log('Formatted answers for Gemini:', formattedAnswers);

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const aiPrompt = `You are a movie recommendation expert. Based on these quiz answers:
    ${formattedAnswers}
    
    Please suggest 6 highly relevant movies. Focus on popular, well-rated movies that match the genre and mood preferences.
    Format your response as a JSON array of TMDB movie IDs only, like this: [123, 456, 789]
    Only include the JSON array in your response, no other text.`;

    console.log('Sending prompt to Gemini:', aiPrompt);

    let retries = 3;
    let result;
    let error;

    while (retries > 0) {
      try {
        result = await model.generateContent(aiPrompt);
        const response = await result.response;
        const text = response.text();
        
        if (!text.trim().startsWith('[') || !text.trim().endsWith(']')) {
          throw new Error('Invalid response format from Gemini');
        }
        
        const movieIds = JSON.parse(text);
        if (!Array.isArray(movieIds) || movieIds.length === 0) {
          throw new Error('Invalid movie IDs array from Gemini');
        }

        console.log('Successfully received movie IDs:', movieIds);
        
        const movieDetailsPromises = movieIds.map(async (id) => {
          const tmdbResponse = await fetch(
            `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos`
          );
          
          if (!tmdbResponse.ok) {
            console.error(`Error fetching TMDB data for movie ${id}:`, tmdbResponse.status);
            return null;
          }
          
          const movieData = await tmdbResponse.json();
          return {
            id: movieData.id,
            title: movieData.title,
            overview: movieData.overview,
            poster_path: movieData.poster_path,
            release_date: movieData.release_date,
            vote_average: movieData.vote_average * 10,
            genre: movieData.genres?.[0]?.name || 'Unknown',
            trailer_url: movieData.videos?.results?.[0]?.key 
              ? `https://www.youtube.com/watch?v=${movieData.videos.results[0].key}`
              : null
          };
        });

        const movies = (await Promise.all(movieDetailsPromises))
          .filter(movie => movie !== null)
          .slice(0, 6);

        if (!movies || movies.length === 0) {
          throw new Error('No valid movies found');
        }

        console.log('Successfully processed movies:', movies.length);
        
        return new Response(JSON.stringify(movies), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
        
      } catch (e) {
        error = e;
        console.error(`Attempt failed, ${retries - 1} retries left:`, e);
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    throw error || new Error('Failed to process request after all retries');
    
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