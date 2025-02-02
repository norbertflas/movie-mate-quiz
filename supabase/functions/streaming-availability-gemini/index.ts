import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.1.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RETRY_AFTER = 60;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

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
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
      console.log(`Rate limit hit, waiting ${delay}ms before retry ${attempt + 1}`);
      await sleep(delay);
      return tryGenerateContent(model, prompt, attempt + 1);
    }

    throw error;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { tmdbId, title, year, country = 'us' } = await req.json();
    console.log(`Checking streaming availability for: ${title} (${year}) in ${country}`);

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Tell me on which major streaming platforms the movie "${title}" (${year}) is currently available to watch in ${country}. Only include major streaming platforms like Netflix, Amazon Prime Video, Disney+, Hulu, HBO Max, Apple TV+. Format the response as a JSON array with objects containing 'service' and 'link' properties. If you're not completely sure about availability, don't include that service. Only include factual information. Example format: [{"service": "Netflix", "link": "https://netflix.com"}]`;

    console.log('Sending prompt to Gemini:', prompt);

    try {
      const result = await tryGenerateContent(model, prompt);
      const response = await result.response;
      const text = response.text();
      console.log('Received response from Gemini:', text);
      
      const streamingServices = text.match(/\[[\s\S]*?\]/)?.[0];
      console.log('Extracted streaming services:', streamingServices);

      if (!streamingServices) {
        console.log('No streaming services found in response');
        return new Response(
          JSON.stringify({ result: [] }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          },
        );
      }

      try {
        const parsedServices = JSON.parse(streamingServices);
        if (!Array.isArray(parsedServices)) {
          throw new Error('Invalid response format: not an array');
        }

        const validServices = parsedServices.filter(service => 
          service && 
          typeof service === 'object' && 
          typeof service.service === 'string' && 
          typeof service.link === 'string' &&
          service.service.length > 0 &&
          service.link.length > 0
        );

        console.log('Valid services after filtering:', validServices);

        return new Response(
          JSON.stringify({ result: validServices }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      } catch (error) {
        console.error('Error parsing streaming services:', error);
        throw error;
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded',
            message: `Please try again in ${RETRY_AFTER} seconds`,
            retryAfter: RETRY_AFTER,
            result: []
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

      throw error;
    }
  } catch (error) {
    console.error('Error in streaming-availability-gemini function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        message: 'An unexpected error occurred',
        result: []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.status || 500,
      },
    );
  }
});