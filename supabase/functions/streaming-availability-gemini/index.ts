
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.1.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 seconds
const RATE_LIMIT_DELAY = 60000; // 60 seconds

async function fetchWithRetry(fn: () => Promise<any>, attempts: number = RETRY_ATTEMPTS): Promise<any> {
  try {
    return await fn();
  } catch (error) {
    console.error('Error in fetchWithRetry:', error);
    
    if (attempts > 1) {
      if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
        console.log('Rate limit hit, waiting 60 seconds...');
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
        return fetchWithRetry(fn, attempts - 1);
      }
      
      console.log(`Attempt failed, retrying... (${attempts - 1} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(fn, attempts - 1);
    }
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    let body;
    try {
      body = await req.json();
      console.log('Request body:', body);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          result: []
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    const { tmdbId, title, year, country = 'us' } = body;

    if (!title || !year) {
      console.error('Missing required parameters:', { title, year });
      return new Response(
        JSON.stringify({
          error: 'Missing required parameters: title and year are required',
          result: []
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not configured');
      return new Response(
        JSON.stringify({
          error: 'GEMINI_API_KEY not configured',
          result: []
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    console.log('Initializing Gemini API...');
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Find streaming services where the movie "${title}" (${year}) is available for streaming in ${country.toUpperCase()}. Only return a list of streaming service names from these options: Netflix, Amazon Prime Video, Disney+, Hulu, Apple TV+, Max, Paramount+, Peacock. Do not include any explanation or additional text, just the service names separated by commas.`;

    console.log('Making request to Gemini API with prompt:', prompt);

    let result;
    try {
      result = await fetchWithRetry(async () => {
        const response = await model.generateContent(prompt);
        const text = response.response.text();
        console.log('Raw Gemini API response:', text);
        return text;
      });
    } catch (apiError) {
      console.error('Error calling Gemini API:', apiError);
      
      if (apiError.message?.includes('quota') || apiError.message?.includes('rate limit')) {
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            message: 'Please try again in 60 seconds',
            retryAfter: 60,
            result: []
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Retry-After': '60'
            },
            status: 429
          }
        );
      }
      
      return new Response(
        JSON.stringify({
          error: 'Gemini API error',
          message: apiError.message,
          result: []
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    if (!result) {
      return new Response(
        JSON.stringify({
          error: 'Empty response from Gemini API',
          result: []
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    const services = result
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log('Processed streaming services:', services);

    return new Response(
      JSON.stringify({
        result: services.map(service => ({
          service,
          link: `https://${service.toLowerCase().replace(/\+/g, 'plus').replace(/\s/g, '')}.com/watch/${tmdbId}`
        }))
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unhandled error in edge function:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        result: []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
