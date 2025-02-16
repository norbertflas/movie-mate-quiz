
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.1.3'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 seconds
const RATE_LIMIT_DELAY = 60000; // 60 seconds

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

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

async function getStreamingServices(country: string): Promise<{ id: string; name: string }[]> {
  try {
    const { data: services, error } = await supabase
      .from('streaming_services')
      .select('id, name')
      .contains('regions', [country.toLowerCase()]);

    if (error) {
      console.error('Error fetching streaming services:', error);
      return [];
    }

    return services || [];
  } catch (error) {
    console.error('Error in getStreamingServices:', error);
    return [];
  }
}

async function saveStreamingAvailability(
  tmdbId: number,
  services: string[],
  country: string
): Promise<void> {
  try {
    // Get service IDs for the available streaming services
    const { data: serviceIds } = await supabase
      .from('streaming_services')
      .select('id, name')
      .in('name', services);

    if (!serviceIds?.length) {
      console.log('No matching service IDs found');
      return;
    }

    // Prepare the records for insertion
    const records = serviceIds.map(service => ({
      tmdb_id: tmdbId,
      service_id: service.id,
      region: country.toLowerCase(),
    }));

    // Insert the availability records
    const { error } = await supabase
      .from('movie_streaming_availability')
      .upsert(
        records,
        { onConflict: 'tmdb_id,service_id,region' }
      );

    if (error) {
      console.error('Error saving streaming availability:', error);
    }
  } catch (error) {
    console.error('Error in saveStreamingAvailability:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
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
          result: [],
          error: 'Invalid JSON in request body'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    const { tmdbId, title, year, country = 'us' } = body;

    if (!title || !year) {
      console.error('Missing required parameters:', { title, year });
      return new Response(
        JSON.stringify({
          result: [],
          error: 'Missing required parameters: title and year are required'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // Get available streaming services for the country
    const availableServices = await getStreamingServices(country);
    const serviceNames = availableServices.map(s => s.name);

    console.log('Available streaming services for country:', serviceNames);

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not configured');
      return new Response(
        JSON.stringify({
          result: [],
          error: 'GEMINI_API_KEY not configured'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // Add initial delay to help prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Initializing Gemini API...');
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Find streaming services where the movie "${title}" (${year}) is available for streaming in ${country.toUpperCase()}. Only return a list of streaming service names from these options: ${serviceNames.join(', ')}. Do not include any explanation or additional text, just the service names separated by commas.`;

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
            result: [],
            error: 'Rate limit exceeded',
            message: 'Please try again in 60 seconds',
            retryAfter: 60
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Retry-After': '60'
            },
            status: 200
          }
        );
      }
      
      return new Response(
        JSON.stringify({
          result: [],
          error: 'Gemini API error',
          message: apiError.message
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    if (!result) {
      return new Response(
        JSON.stringify({
          result: [],
          error: 'Empty response from Gemini API'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    const services = result
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0 && serviceNames.includes(s));

    console.log('Processed streaming services:', services);

    // Save the streaming availability data
    if (services.length > 0) {
      await saveStreamingAvailability(tmdbId, services, country);
    }

    // Map services to their logos
    const servicesWithLogos = services.map(service => {
      const serviceInfo = availableServices.find(s => s.name === service);
      return {
        service,
        link: `https://${service.toLowerCase().replace(/\+/g, 'plus').replace(/\s/g, '')}.com/watch/${tmdbId}`
      };
    });

    return new Response(
      JSON.stringify({
        result: servicesWithLogos
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unhandled error in edge function:', error);
    return new Response(
      JSON.stringify({
        result: [],
        error: 'Internal server error',
        message: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
});

