import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { tmdbId, title, year, country = 'us' } = await req.json();

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Tell me on which streaming platforms the movie "${title}" (${year}) is currently available to watch in ${country}. Only include major streaming platforms like Netflix, Amazon Prime Video, Disney+, Hulu, HBO Max, Apple TV+. Format the response as a JSON array with objects containing 'service' and 'link' properties. If you're not completely sure about availability, don't include that service.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    let streamingServices = [];
    try {
      // Extract JSON from the response
      const match = text.match(/\[.*\]/s);
      if (match) {
        streamingServices = JSON.parse(match[0]);
      }
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
    }

    // Validate and format the response
    const validServices = streamingServices.filter(service => 
      service && 
      typeof service.service === 'string' && 
      typeof service.link === 'string'
    );

    return new Response(
      JSON.stringify({ result: validServices }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});