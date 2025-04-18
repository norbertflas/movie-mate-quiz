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
    const { tmdbId, country = 'us', title, year } = await req.json()
    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY')
    
    if (!rapidApiKey) {
      console.error('RAPIDAPI_KEY not configured')
      return new Response(
        JSON.stringify({ 
          error: 'RAPIDAPI_KEY not configured',
          result: [] 
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 200 // Return 200 to handle gracefully
        }
      )
    }

    console.log(`Fetching streaming availability for movie: ${tmdbId} in country: ${country}, title: ${title}, year: ${year}`)

    // Using the updated Streaming Availability API v4 endpoint
    const url = `https://streaming-availability.p.rapidapi.com/shows/movie/${String(tmdbId)}`
    
    try {
      // Construct the URL with query parameters
      const queryParams = new URLSearchParams({
        country: country.toLowerCase()
      })
      
      const fullUrl = `${url}?${queryParams.toString()}`
      
      console.log(`Making request to: ${fullUrl}`)

      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
        }
      }
      
      const response = await fetch(fullUrl, options)
      
      if (!response.ok) {
        console.error(`API error: ${response.status} ${response.statusText}`)
        
        // If we get a 404 (Not Found) or any other error, try a title search
        if (title) {
          console.log('Attempting to fetch using title search')
          
          // Try to get English title from TMDB API
          let searchTitle = title;
          let englishTitle = null;
          
          // If we're in a non-English locale, try to get the English title first from TMDB
          if (country.toLowerCase() !== 'us' && country.toLowerCase() !== 'gb') {
            try {
              englishTitle = await fetchMovieTitleFromTMDB(tmdbId)
              if (englishTitle && englishTitle.title) {
                console.log(`Got English title from TMDB: "${englishTitle.title}". Using for search.`)
                searchTitle = englishTitle.title
              }
            } catch (e) {
              console.error('Error fetching English title:', e)
              // Continue with original title
            }
          }
          
          // Use the title (or English title if available) to search
          const titleSearchResponse = await searchByTitle(searchTitle, country, rapidApiKey, year)
          
          if (titleSearchResponse) {
            return new Response(
              JSON.stringify({ 
                result: titleSearchResponse,
                source: 'title-search',
                timestamp: new Date().toISOString()
              }),
              { 
                headers: { 
                  ...corsHeaders,
                  'Content-Type': 'application/json'
                } 
              }
            )
          }
        }
        
        return new Response(
          JSON.stringify({ 
            error: `API error: ${response.status}`,
            result: [] 
          }),
          { 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json'
            },
            status: 200 // Return 200 even on API error to prevent client crashing
          }
        )
      }
      
      const data = await response.json()
      
      console.log('API Response structure:', Object.keys(data))

      // Extract streaming services from the response using the updated API v4 structure
      let streamingServices = []
      
      if (data.streamingInfo && data.streamingInfo[country.toLowerCase()]) {
        const countryStreamingOptions = data.streamingInfo[country.toLowerCase()]
        
        // Extract streaming service information
        streamingServices = Object.entries(countryStreamingOptions).map(([service, options]) => {
          const option = options[0]; // Take the first option for each service
          return {
            service,
            link: option?.link || '',
            available: true,
            type: option?.type || 'subscription'
          };
        }).filter(service => service.service && service.link)
        
        console.log(`Found ${streamingServices.length} streaming services for movie ${tmdbId}`)
      } else {
        console.log('No streaming info found in response')
      }
      
      return new Response(
        JSON.stringify({ 
          result: streamingServices,
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          } 
        }
      )
    } catch (fetchError) {
      console.error('Fetch error:', fetchError)
      return new Response(
        JSON.stringify({ 
          error: fetchError.message || 'API fetch error',
          result: [] 
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 200 // Return 200 to handle gracefully in frontend
        }
      )
    }
  } catch (error) {
    console.error('Error in streaming-availability function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        result: [] // Always include an empty result array even on error
      }),
      { 
        status: 200, // Use 200 even for errors to prevent client crashing
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  }
})

// Helper function to fetch movie details from TMDB API
async function fetchMovieTitleFromTMDB(tmdbId: number) {
  try {
    const tmdbApiKey = Deno.env.get('TMDB_API_KEY')
    if (!tmdbApiKey) {
      console.error('TMDB_API_KEY not configured')
      return { title: null }
    }
    
    // First try to get the English title specifically
    const url = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${tmdbApiKey}&language=en-US`
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      
      if (!response.ok) {
        console.error(`TMDB API error: ${response.status}`)
        return { title: null }
      }
      
      const data = await response.json()
      return { 
        title: data.title || null,
        original_title: data.original_title || null
      }
    } catch (error) {
      clearTimeout(timeout);
      console.error('Fetch error for TMDB:', error);
      return { title: null }
    }
  } catch (error) {
    console.error('Error fetching from TMDB:', error)
    return { title: null }
  }
}

// Helper function to search by title - updated to v4 API format
async function searchByTitle(title: string, country: string, rapidApiKey: string, year?: string) {
  try {
    // Use v4 endpoint for title search
    const url = 'https://streaming-availability.p.rapidapi.com/shows/search/title'
    
    // Set language parameter based on supported languages
    const supportedLanguages = ['en', 'es', 'fr', 'de', 'it'];
    const outputLanguage = supportedLanguages.includes(country.toLowerCase()) ? 
                           country.toLowerCase() : 'en';
    
    const queryParams = new URLSearchParams({
      title,
      country: country.toLowerCase(),
      show_type: 'movie',
      output_language: outputLanguage,
      series_granularity: 'show'
    })
    
    if (year) {
      queryParams.append('year', year)
    }
    
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
      }
    }
    
    const fullUrl = `${url}?${queryParams.toString()}`
    console.log(`Searching by title: "${title}" using URL: ${fullUrl}`)
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    try {
      const response = await fetch(fullUrl, { 
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeout);
      
      if (!response.ok) {
        console.error(`Title search API error: ${response.status}`)
        return null
      }
      
      const data = await response.json()
      console.log(`Title search found ${data.result?.length || 0} results`)
      
      if (!data.result || data.result.length === 0) {
        return null
      }
      
      // Find the best match - if year is provided, try to match by year
      let bestMatch = data.result[0];
      
      if (year && data.result.length > 1) {
        const yearMatch = data.result.find(movie => 
          movie.year === parseInt(year) || 
          (movie.firstAirYear && movie.firstAirYear === parseInt(year))
        );
        
        if (yearMatch) {
          bestMatch = yearMatch;
        }
      }
      
      // Get the streaming info - API v4 format
      if (bestMatch.streamingInfo && bestMatch.streamingInfo[country.toLowerCase()]) {
        const countryInfo = bestMatch.streamingInfo[country.toLowerCase()];
        
        // API v4 returns an object with service names as keys, each containing an array of offerings
        return Object.entries(countryInfo).map(([service, options]) => {
          const option = options[0]; // Take first option for each service
          return {
            service,
            link: option?.link || '',
            available: true,
            type: option?.type || 'subscription'
          };
        }).filter(service => service.service && service.link);
      }
      
      return null
    } catch (error) {
      clearTimeout(timeout);
      console.error('Fetch error in title search:', error);
      return null
    }
  } catch (error) {
    console.error('Error in title search:', error)
    return null
  }
}
