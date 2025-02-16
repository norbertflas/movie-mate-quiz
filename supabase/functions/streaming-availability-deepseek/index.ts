
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 seconds

async function fetchWithRetry(url: string, options: RequestInit, attempts: number = RETRY_ATTEMPTS): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok && attempts > 1) {
      console.log(`Attempt failed, retrying... (${attempts - 1} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, attempts - 1);
    }
    return response;
  } catch (error) {
    if (attempts > 1) {
      console.log(`Fetch failed, retrying... (${attempts - 1} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, attempts - 1);
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
    const { tmdbId, title, year, country = 'us' } = await req.json()
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY')
    
    if (!deepseekApiKey) {
      console.error('DEEPSEEK_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          result: [],
          error: 'DEEPSEEK_API_KEY not configured'
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 200 // Return 200 to handle gracefully in frontend
        }
      );
    }

    // Add delay to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    const prompt = `Find streaming services where the movie "${title}" (${year}) is available for streaming in ${country.toUpperCase()}. Only return a list of streaming service names from these options: Netflix, Amazon Prime Video, Disney+, Hulu, Apple TV+, Max, Paramount+, Peacock. Do not include any explanation or additional text, just the service names separated by commas.`

    console.log('Making request to DeepSeek API...');
    console.log('Request details:', { title, year, country });
    
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      console.log('Request timed out');
    }, 15000); // 15 second timeout

    try {
      const response = await fetchWithRetry('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepseekApiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: 100
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        console.error(`DeepSeek API error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        // Return empty result instead of throwing
        return new Response(
          JSON.stringify({ 
            result: [],
            error: `DeepSeek API error: ${response.status} ${response.statusText}`
          }),
          { 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json'
            },
            status: 200 // Return 200 even on API error
          }
        );
      }

      const responseText = await response.text();
      console.log('Raw API response:', responseText);

      if (!responseText) {
        console.error('Empty response from DeepSeek API');
        // Return empty result instead of throwing
        return new Response(
          JSON.stringify({ 
            result: [],
            error: 'Empty response from DeepSeek API'
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

      const data = JSON.parse(responseText);

      if (!data?.choices?.[0]?.message?.content) {
        console.error('Unexpected API response structure:', data);
        // Return empty result instead of throwing
        return new Response(
          JSON.stringify({ 
            result: [],
            error: 'Invalid response structure from DeepSeek API'
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

      const services = data.choices[0].message.content
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);
      
      console.log('DeepSeek found streaming services:', services);

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
    } catch (fetchError) {
      clearTimeout(timeout);
      console.error('Fetch error:', fetchError);
      // Return empty result instead of throwing
      return new Response(
        JSON.stringify({ 
          result: [],
          error: `Failed to fetch from DeepSeek API: ${fetchError.message}`
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 200 // Return 200 even on error
        }
      );
    }
  } catch (error) {
    console.error('Error in streaming-availability-deepseek function:', error);
    
    // Return empty result instead of throwing
    return new Response(
      JSON.stringify({ 
        result: [],
        error: error.message || 'Internal server error'
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200 // Return 200 even on error
      }
    );
  }
})
