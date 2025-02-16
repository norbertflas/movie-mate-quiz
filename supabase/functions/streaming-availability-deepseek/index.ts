
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
      console.error('DEEPSEEK_API_KEY not configured')
      throw new Error('DEEPSEEK_API_KEY not configured')
    }

    // Add delay to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    const prompt = `Find streaming services where the movie "${title}" (${year}) is available for streaming in ${country.toUpperCase()}. Only return a list of streaming service names from these options: Netflix, Amazon Prime Video, Disney+, Hulu, Apple TV+, Max, Paramount+, Peacock. Do not include any explanation or additional text, just the service names separated by commas.`

    console.log('Making request to DeepSeek API...');
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
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
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }

      const responseText = await response.text();
      console.log('Raw API response:', responseText);

      if (!responseText) {
        throw new Error('Empty response from DeepSeek API');
      }

      const data = JSON.parse(responseText);

      if (!data?.choices?.[0]?.message?.content) {
        console.error('Unexpected API response structure:', data);
        throw new Error('Invalid response structure from DeepSeek API');
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
      )
    } catch (fetchError) {
      clearTimeout(timeout);
      console.error('Fetch error:', fetchError);
      throw new Error(`Failed to fetch from DeepSeek API: ${fetchError.message}`);
    }
  } catch (error) {
    console.error('Error in streaming-availability-deepseek function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        result: []
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: error.status || 500
      }
    )
  }
})
