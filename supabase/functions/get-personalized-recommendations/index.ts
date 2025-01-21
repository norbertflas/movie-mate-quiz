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

    if (!TMDB_API_KEY || !GEMINI_API_KEY) {
      console.error('Missing required API keys');
      throw new Error('Missing required API keys');
    }

    const { prompt, answers } = await req.json();
    console.log('Processing quiz answers:', answers);

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Create a prompt for Gemini based on quiz answers
    const aiPrompt = `As a movie recommendation expert, suggest 6 movies based on these quiz answers:
    ${JSON.stringify(answers, null, 2)}
    
    Format your response as a JSON array of TMDB movie IDs only, like this: [123, 456, 789]
    Only include the JSON array in your response, no other text.`;

    console.log('Sending prompt to Gemini:', aiPrompt);

    // Get movie suggestions from Gemini
    const result = await model.generateContent(aiPrompt);
    const response = await result.response;
    const movieIds = JSON.parse(response.text());

    console.log('Received movie IDs from Gemini:', movieIds);

    // Get movie details from TMDB
    const moviePromises = movieIds.map(async (id: number) => {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}`
      );
      if (!response.ok) {
        console.error(`Error fetching movie ${id}:`, response.status);
        throw new Error(`TMDB API error: ${response.status}`);
      }
      return response.json();
    });

    const movies = await Promise.all(moviePromises);
    console.log('Successfully fetched movie details');

    // Filter out any invalid movies and sort by vote average
    const recommendations = movies
      .filter(movie => movie.success !== false)
      .sort((a, b) => b.vote_average - a.vote_average)
      .slice(0, 6);

    return new Response(JSON.stringify(recommendations), {
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