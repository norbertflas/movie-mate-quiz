import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.1.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RETRY_AFTER = 60; // seconds to wait before retrying
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds between retries

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function tryGenerateContent(model: any, prompt: string, attempt = 1): Promise<any> {
  try {
    console.log(`Attempt ${attempt} to generate content`);
    const result = await model.generateContent(prompt);
    return result;
  } catch (error) {
    console.error(`Error on attempt ${attempt}:`, error);
    
    if (attempt >= MAX_RETRIES) {
      throw error;
    }

    if (error.message?.includes('429') || error.message?.includes('quota')) {
      console.log(`Rate limit hit, waiting ${RETRY_DELAY}ms before retry`);
      await sleep(RETRY_DELAY * attempt); // Exponential backoff
      return tryGenerateContent(model, prompt, attempt + 1);
    }

    throw error;
  }
}

function extractJsonFromText(text: string): any[] {
  try {
    // Try to find a JSON array in the text using a more robust regex
    const jsonRegex = /\[[\s\S]*?\]/g;
    const matches = text.match(jsonRegex);
    
    if (!matches) {
      console.log('No JSON array found in text');
      return [];
    }

    // Try each match until we find valid JSON
    for (const match of matches) {
      try {
        const parsed = JSON.parse(match);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.log('Failed to parse match:', match);
        continue;
      }
    }

    return [];
  } catch (error) {
    console.error('Error extracting JSON from text:', error);
    return [];
  }
}

function validateStreamingService(service: any): boolean {
  return (
    service &&
    typeof service === 'object' &&
    typeof service.service === 'string' &&
    typeof service.link === 'string' &&
    service.service.length > 0 &&
    service.link.length > 0
  );
}

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

    const prompt = `Tell me on which major streaming platforms the movie "${title}" (${year}) is currently available to watch in ${country}. Only include major streaming platforms like Netflix, Amazon Prime Video, Disney+, Hulu, HBO Max, Apple TV+. Format the response as a JSON array with objects containing 'service' and 'link' properties. If you're not completely sure about availability, don't include that service. Only include factual information. Example format: [{"service": "Netflix", "link": "https://netflix.com"}]`;

    console.log('Sending prompt to Gemini:', prompt);

    try {
      const result = await tryGenerateContent(model, prompt);
      const response = await result.response;
      const text = response.text();
      console.log('Received response from Gemini:', text);
      
      // Extract and validate streaming services
      const streamingServices = extractJsonFromText(text);
      console.log('Extracted streaming services:', streamingServices);

      if (!Array.isArray(streamingServices)) {
        console.error('Invalid response format: not an array');
        throw new Error('Invalid response format: not an array');
      }

      // Validate and format the response
      const validServices = streamingServices.filter(validateStreamingService);
      console.log('Valid services after filtering:', validServices);

      if (validServices.length === 0) {
        console.log('No valid streaming services found');
        return new Response(
          JSON.stringify({ 
            result: [], 
            message: 'No streaming services found',
            fallback: true
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          },
        );
      }

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