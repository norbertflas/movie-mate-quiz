
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RETRY_ATTEMPTS = 2;
const RETRY_DELAY = 1000; // 1 second

async function fetchWithRetry(url: string, options: RequestInit, attempts: number = RETRY_ATTEMPTS): Promise<Response> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    const fetchOptions = {
      ...options,
      signal: controller.signal
    };
    
    try {
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeout);
      
      if (!response.ok && attempts > 1) {
        console.log(`Attempt failed, retrying... (${attempts - 1} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchWithRetry(url, options, attempts - 1);
      }
      return response;
    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
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
    return new Response(null, { headers: corsHeaders })
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
    await new Promise(resolve => setTimeout(resolve, 500));

    // Construct a prompt that requests streaming services specific to the country
    const countryName = country.toLowerCase() === 'pl' ? 'Poland' : 'United States';
    const prompt = `Find streaming services where the movie "${title}" (${year}) is available for streaming in ${countryName}. 
    If searching for Poland, include services like: Netflix, Amazon Prime Video, Disney+, Apple TV+, Max, Canal+, Player, HBO Max.
    If searching for the US, include services like: Netflix, Amazon Prime Video, Disney+, Hulu, Apple TV+, Max, Paramount+, Peacock.
    Do not include any explanation or additional text, just the service names separated by commas.`;

    console.log('Making request to DeepSeek API...');
    console.log('Request details:', { title, year, country, countryName });
    
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
        })
      });

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

      const data = await response.json();
      console.log('DeepSeek API response:', data);

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
      
      // Generate appropriate streaming links based on country
      const getStreamingLink = (service: string) => {
        const serviceLower = service.toLowerCase().replace(/\+/g, 'plus').replace(/\s/g, '');
        
        if (country.toLowerCase() === 'pl') {
          if (serviceLower.includes('canal')) return `https://www.canalplus.com/`;
          if (serviceLower.includes('player')) return `https://player.pl/`;
          if (serviceLower === 'hbomax' || serviceLower === 'hbo') return `https://www.max.com/`;
        }
        
        return `https://${serviceLower}.com`;
      };

      return new Response(
        JSON.stringify({ 
          result: services.map((service: string) => ({
            service,
            link: getStreamingLink(service),
            available: true,
            source: 'deepseek-ai',
            type: 'subscription'
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
