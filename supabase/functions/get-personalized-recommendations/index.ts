import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!TMDB_API_KEY || !OPENAI_API_KEY) {
      throw new Error('Missing required API keys');
    }

    const { prompt, selectedMovies } = await req.json();

    // First, get movie suggestions from OpenAI based on the prompt
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a movie recommendation expert. Based on the user\'s prompt, suggest relevant TMDB movie IDs and explain why they match the criteria.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    const openAIData = await openAIResponse.json();
    const suggestedMovies = openAIData.choices[0].message.content;

    // Get movie details from TMDB
    const moviePromises = suggestedMovies.split(',').map(async (movieId: string) => {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId.trim()}?api_key=${TMDB_API_KEY}`
      );
      return response.json();
    });

    const movies = await Promise.all(moviePromises);

    // Filter and sort movies based on user preferences
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