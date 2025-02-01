// Import from CDN URL instead of npm package
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.1.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RETRY_AFTER = 60; // seconds to wait before retrying

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { tmdbId, title, year, country = 'us' } = await req.json();
    console.log(`Checking streaming availability for: ${title} (${year}) in ${country}`);

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Tell me on which major streaming platforms the movie "${title}" (${year}) is currently available to watch in ${country}. Only include major streaming platforms like Netflix, Amazon Prime Video, Disney+, Hulu, HBO Max, Apple TV+. Format the response as a JSON array with objects containing 'service' and 'link' properties. If you're not completely sure about availability, don't include that service. Only include factual information.`;

    console.log('Sending prompt to Gemini:', prompt);

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('Received response from Gemini:', text);
      
      let streamingServices = [];
      try {
        // Extract JSON array from response
        const match = text.match(/\[.*\]/s);
        if (match) {
          streamingServices = JSON.parse(match[0]);
          console.log('Parsed streaming services:', streamingServices);
        }
      } catch (error) {
        console.error('Error parsing Gemini response:', error);
        return new Response(
          JSON.stringify({ 
            result: [], 
            error: 'Invalid response format from Gemini API',
            fallback: true,
            retryAfter: RETRY_AFTER
          }),
          {
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Retry-After': RETRY_AFTER.toString()
            },
            status: 422
          },
        );
      }

      // Validate and format the response
      const validServices = streamingServices.filter(service => 
        service && 
        typeof service.service === 'string' && 
        typeof service.link === 'string'
      );

      console.log('Returning valid services:', validServices);

      return new Response(
        JSON.stringify({ result: validServices }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    } catch (error) {
      console.error('Gemini API Error:', error);
      
      // Check if it's a rate limit error
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        return new Response(
          JSON.stringify({ 
            result: [], 
            error: 'Rate limit exceeded. Please try again later.',
            fallback: true,
            retryAfter: RETRY_AFTER
          }),
          {
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Retry-After': RETRY_AFTER.toString()
            },
            status: 429
          },
        );
      }

      // Handle safety errors
      if (error.message?.includes('SAFETY')) {
        return new Response(
          JSON.stringify({ 
            result: [], 
            error: 'Content safety check failed. Using alternative data source.',
            fallback: true 
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 422
          },
        );
      }

      // For any other error, return a generic error response
      return new Response(
        JSON.stringify({ 
          result: [], 
          error: 'Unable to process request. Using alternative data source.',
          fallback: true 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 422
        },
      );
    }
  } catch (error) {
    console.error('Error in streaming-availability-gemini function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        result: [],
        fallback: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.status || 500,
      },
    );
  }
});