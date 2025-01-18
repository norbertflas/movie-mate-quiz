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
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('Missing Gemini API key');
    }

    const { title, description, genre } = await req.json();

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Analyze this movie and provide insights:
    Title: ${title}
    Description: ${description}
    Genre: ${genre}
    
    Provide a JSON response with:
    1. A list of 3 key themes
    2. Content warnings if any
    3. Similar movie recommendations (3 titles)
    4. Target audience
    5. Critical analysis (2-3 sentences)
    
    Format the response as a JSON object with these exact keys:
    {
      "themes": string[],
      "contentWarnings": string[],
      "similarMovies": string[],
      "targetAudience": string,
      "analysis": string
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const insights = JSON.parse(response.text());

    return new Response(JSON.stringify(insights), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in movie-insights function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});