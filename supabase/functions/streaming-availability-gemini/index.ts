
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
    
    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      console.log('Rate limit hit, waiting 60 seconds...');
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
      if (attempts > 1) {
        return fetchWithRetry(fn, attempts - 1);
      }
    }
    
    if (attempts > 1) {
      console.log(`Attempt failed, retrying... (${attempts - 1} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(fn, attempts - 1);
    }
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json();
    console.log('Request body:', body);
    
    const { tmdbId, title, year, country = 'us' } = body;
    
    // Validate required parameters
    if (!title || !year) {
      console.error('Missing required parameters');
      return new Response(
        JSON.stringify({ 
          result: [],
          error: 'Missing required parameters: title and year are required'
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 400
        }
      );
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    console.log('GEMINI_API_KEY present:', !!geminiApiKey);
    
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          result: [],
          error: 'GEMINI_API_KEY not configured'
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 200
        }
      );
    }

    // Add initial delay to help prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `Find streaming services where the movie "${title}" (${year}) is available for streaming in ${country.toUpperCase()}. Only return a list of streaming service names from these options: Netflix, Amazon Prime Video, Disney+, Hulu, Apple TV+, Max, Paramount+, Peacock. Do not include any explanation or additional text, just the service names separated by commas.`;

      console.log('Making request to Gemini API...');
      console.log('Request details:', { title, year, country });

      const result = await fetchWithRetry(async () => {
        const response = await model.generateContent(prompt);
        const text = response.response.text();
        console.log('Raw API response:', text);
        
        if (!text) {
          console.error('Empty response from Gemini API');
          throw new Error('Empty response from Gemini API');
        }

        return text;
      });

      const services = result
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);
      
      console.log('Gemini found streaming services:', services);

      return new Response(
        JSON.stringify({ 
          result: services.map((service: string) => ({
            service,
            link: `https://${service.toLowerCase().replace(/\+/g, 'plus').replace(/\s/g, '')}.com/watch/${tmdbId}`
          }))
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          } 
        }
      );
    } catch (apiError) {
      console.error('Gemini API error:', apiError);
      
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

      throw apiError; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    console.error('Error in streaming-availability-gemini function:', error);
    
    return new Response(
      JSON.stringify({ 
        result: [],
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200 // We return 200 even for errors to handle them gracefully in the frontend
      }
    );
  }
});
