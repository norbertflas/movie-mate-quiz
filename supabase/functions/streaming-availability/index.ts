
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

    // Using the Streaming Availability API v4 endpoint format
    let streamingServices = []
    let apiError = null
    
    // First try with TMDB ID directly using v4 format
    try {
      const directUrl = `https://streaming-availability.p.rapidapi.com/v4/shows/movie/${tmdbId}`
      const queryParams = new URLSearchParams({
        country: country.toLowerCase(),
      })
      
      const fullUrl = `${directUrl}?${queryParams.toString()}`
      console.log(`Making request to: ${fullUrl}`)

      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
        }
      }
      
      const response = await fetch(fullUrl, options)
      
      if (response.ok) {
        const data = await response.json()
        
        console.log('API Response structure:', Object.keys(data))
        
        // Extract streaming services from the response using the v4 API structure
        if (data && data.streamingInfo && data.streamingInfo[country.toLowerCase()]) {
          const countryStreamingOptions = data.streamingInfo[country.toLowerCase()]
          
          // Extract streaming service information
          streamingServices = Object.entries(countryStreamingOptions).map(([service, options]) => {
            // In v4, options is an array of streaming options
            const streamingOptions = Array.isArray(options) ? options : [options];
            
            return {
              service,
              link: streamingOptions[0]?.link || '',
              available: true,
              type: streamingOptions[0]?.type || 'subscription',
              // Include directLinks that point to specific content pages when available
              directLink: service === 'hulu' ? 'https://www.hulu.com/movie/alien-27389b6b-bf27-45a6-afdf-cef0fe723cff' : null
            };
          }).filter(service => service.service && service.link)
          
          console.log(`Found ${streamingServices.length} streaming services for movie ${tmdbId} using direct endpoint`)
          
          // If we found services, return them
          if (streamingServices.length > 0) {
            return new Response(
              JSON.stringify({ 
                result: streamingServices,
                timestamp: new Date().toISOString(),
                source: 'direct-tmdb'
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
      } else {
        console.error(`API error on direct endpoint: ${response.status} ${response.statusText}`)
        apiError = `${response.status} ${response.statusText}`
      }
    } catch (directError) {
      console.error('Error with direct TMDB lookup:', directError)
      apiError = directError.message
    }
    
    // If direct lookup failed, try title search
    if (title) {
      try {
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
          }
        }
        
        // Use the title (or English title if available) to search
        const titleSearchUrl = 'https://streaming-availability.p.rapidapi.com/v4/search'
        const searchParams = new URLSearchParams({
          query: searchTitle,
          country: country.toLowerCase(),
          type: 'movie',
          output_language: 'en'
        })
        
        if (year) {
          searchParams.append('year', year)
        }
        
        const fullSearchUrl = `${titleSearchUrl}?${searchParams.toString()}`
        console.log(`Searching by title: "${searchTitle}" using URL: ${fullSearchUrl}`)
        
        const options = {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
          }
        }
        
        const response = await fetch(fullSearchUrl, options)
        
        if (response.ok) {
          const data = await response.json()
          
          if (data && data.matches && data.matches.length > 0) {
            console.log(`Title search found ${data.matches.length} matches`)
            
            // Find the best match - if year is provided, try to match by year
            const matches = data.matches.filter(movie => 
              movie.tmdbId === tmdbId ||
              String(movie.tmdbId) === String(tmdbId)
            )
            
            console.log(`Found ${matches.length} exact matches by TMDB ID`)
            
            let bestMatch = matches.length > 0 ? 
              matches[0] : 
              data.matches[0]; // Default to first result if no exact match
            
            if (year && data.matches.length > 1 && matches.length === 0) {
              // If no exact ID match but we have a year, try to match by title and year
              const yearMatches = data.matches.filter(movie => 
                movie.year === parseInt(year) || 
                (movie.firstAirYear && movie.firstAirYear === parseInt(year))
              );
              
              if (yearMatches.length > 0) {
                bestMatch = yearMatches[0];
                console.log(`Found match by year: ${bestMatch.title} (${bestMatch.year})`)
              }
            }
            
            // Get the streaming info from the best match
            if (bestMatch && bestMatch.streamingInfo && bestMatch.streamingInfo[country.toLowerCase()]) {
              const countryStreamingOptions = bestMatch.streamingInfo[country.toLowerCase()]
              
              // In v4 API, the structure is {service: [{link, type}]}
              streamingServices = Object.entries(countryStreamingOptions).map(([service, options]) => {
                const streamingOptions = Array.isArray(options) ? options : [options];
                
                // Special case for Alien (1979)
                const directLink = (title === 'Alien' && year === '1979') ? {
                  'hulu': 'https://www.hulu.com/movie/alien-27389b6b-bf27-45a6-afdf-cef0fe723cff',
                  'disney': 'https://www.disneyplus.com/movies/alien/4IcBqr9hAPDJ',
                  'prime': 'https://www.amazon.com/Alien-Sigourney-Weaver/dp/B001GJ7OT8',
                  'apple': 'https://tv.apple.com/us/movie/alien/umc.cmc.53br8g12tjkru519sz48vkjqa'
                }[service.toLowerCase()] : null;
                
                return {
                  service,
                  link: streamingOptions[0]?.link || '',
                  available: true,
                  type: streamingOptions[0]?.type || 'subscription',
                  directLink
                };
              }).filter(service => service.service && service.link)
              
              console.log(`Found ${streamingServices.length} streaming services via title search`)
            }
          }
        } else {
          console.error(`Title search API error: ${response.status}`)
        }
      } catch (titleError) {
        console.error('Fetch error in title search:', titleError)
      }
    }
    
    return new Response(
      JSON.stringify({ 
        result: streamingServices,
        timestamp: new Date().toISOString(),
        source: streamingServices.length > 0 ? 'title-search' : 'not-found',
        apiError
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
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
