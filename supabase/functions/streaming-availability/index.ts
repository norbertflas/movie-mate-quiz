
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
      throw new Error('RAPIDAPI_KEY not configured')
    }

    console.log(`Fetching streaming availability for movie: ${tmdbId} in country: ${country}, title: ${title}, year: ${year}`)

    // Using the updated Streaming Availability API v2 endpoint
    const url = `https://streaming-availability.p.rapidapi.com/v2/get/title`
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
      }
    }

    // Construct the URL with query parameters
    const queryParams = new URLSearchParams({
      tmdb_id: `movie/${String(tmdbId)}`,
      country: country.toLowerCase()
    })
    
    const fullUrl = `${url}?${queryParams.toString()}`
    
    console.log(`Making request to: ${fullUrl}`)
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

    // Extract streaming services from the response using the updated API structure
    let streamingServices = []
    
    if (data?.result?.streamingInfo && data.result.streamingInfo[country.toLowerCase()]) {
      const countryStreamingOptions = data.result.streamingInfo[country.toLowerCase()]
      
      // Extract streaming service information
      streamingServices = countryStreamingOptions.map(option => ({
        service: option.service || '',
        link: option.link || '',
        available: true,
        type: option.type || 'subscription'
      })).filter(service => service.service && service.link)
      
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
  } catch (error) {
    console.error('Error in streaming-availability function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
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
    const response = await fetch(url)
    
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
    console.error('Error fetching from TMDB:', error)
    return { title: null }
  }
}

// Helper function to search by title
async function searchByTitle(title: string, country: string, rapidApiKey: string, year?: string) {
  try {
    // Determine which API endpoint to use - v2/search/title is more modern
    const url = 'https://streaming-availability.p.rapidapi.com/v2/search/title'
    
    // Set language parameter based on supported languages
    const supportedLanguages = ['en', 'es', 'fr', 'de', 'it'];
    const outputLanguage = supportedLanguages.includes(country.toLowerCase()) ? 
                           country.toLowerCase() : 'en';
    
    const queryParams = new URLSearchParams({
      title,
      country: country.toLowerCase(),
      show_type: 'movie',
      output_language: outputLanguage
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
    
    const response = await fetch(fullUrl, options)
    
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
    
    // Get the streaming info
    if (bestMatch.streamingInfo && bestMatch.streamingInfo[country.toLowerCase()]) {
      const streamingOptions = bestMatch.streamingInfo[country.toLowerCase()]
      
      return streamingOptions.map(option => ({
        service: option.service || '',
        link: option.link || '',
        available: true,
        type: option.type || 'subscription'
      })).filter(service => service.service && service.link)
    }
    
    return null
  } catch (error) {
    console.error('Error in title search:', error)
    return null
  }
}
